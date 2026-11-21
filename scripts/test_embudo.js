// Prueba local del embudo de venta (sin Meta ni Gemini): cada envío se captura en memoria.
//   node scripts/test_embudo.js
// Usa una carpeta de datos temporal; no toca data/ ni el disco de Render.
const fs = require('fs');
const os = require('os');
const path = require('path');
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'embudo-'));
delete process.env.GEMINI_API_KEY; delete process.env.OPENAI_API_KEY; delete process.env.META_ACCESS_TOKEN;
process.env.PRUEBA_MINUTOS = process.env.PRUEBA_MINUTOS || '1440';
const R = path.join(__dirname, '../src/');
const wa = require(R + 'whatsappService');
const enviados = [];
wa.sendTextMessage = async (to, t) => { enviados.push({ to, tipo: 'texto', t }); return {}; };
wa.sendImage = async (to, u, c) => { enviados.push({ to, tipo: 'imagen', t: u.split('/').pop() + (c ? ' | ' + c : '') }); return {}; };
wa.sendDocument = async (to, u, n) => { enviados.push({ to, tipo: 'doc', t: n + ' <- ' + u }); return {}; };
wa.downloadMedia = async () => ({ buffer: Buffer.from('x'), mimeType: 'image/jpeg' });
wa.markAsRead = async () => {};
const ocr = require(R + 'ocrValidator');
let ocrRespuesta = null;
ocr.validateReceipt = async () => ocrRespuesta;
const store = require(R + 'store');
const flow = require(R + 'conversationFlow');
const seg = require(R + 'seguimiento');
const ventas = require(R + 'ventas');

const REF = { source_id: '120250542591850743', headline: '+2.000 Moldes' };
let fallos = 0;
function check(cond, msg) { console.log((cond ? '  ✔ ' : '  ✘ ') + msg); if (!cond) fallos++; }
function desde(n) { return enviados.slice(n); }
async function txt(phone, body, referral) {
  const n = enviados.length;
  await flow.handleIncomingMessage(phone, { type: 'text', text: { body }, ...(referral ? { referral } : {}) });
  const out = desde(n);
  console.log(`\n[${phone.slice(-4)}] CLIENTE: ${body}`);
  out.forEach((e) => console.log(`   → ${e.tipo}: ${e.t.replace(/\n+/g, ' ⏎ ').slice(0, 170)}`));
  return out;
}
async function img(phone) {
  const n = enviados.length;
  await flow.handleIncomingMessage(phone, { type: 'image', image: { id: 'm1' } });
  const out = desde(n);
  console.log(`\n[${phone.slice(-4)}] CLIENTE: 📷 imagen`);
  out.forEach((e) => console.log(`   → ${e.tipo}: ${e.t.replace(/\n+/g, ' ⏎ ').slice(0, 170)}`));
  return out;
}

(async () => {
  console.log('Hora Colombia:', ventas.horaColombia(), 'silencio:', ventas.enHorarioSilencio());
  // 1. Compra completa
  const A = '573000000001';
  let o = await txt(A, 'Hola, quiero los +2.000 Moldes de Costura en PDF por $10.000 🧵', REF);
  check(o[0].tipo === 'imagen' && /catalogo/.test(o[0].t), 'primer mensaje: imagen del catálogo');
  check(/34 patrones/.test(o[1].t) && !/postre|helado/i.test(o[1].t), 'pitch real de moldes, sin postres');
  o = await txt(A, 'Si');
  check(o.filter((e) => e.tipo === 'doc').length === 2, '"sí" a la muestra: envía 2 PDF');
  check(!/Nequi/.test(o.map((e) => e.t).join(' ')), 'la muestra no manda datos de pago');
  o = await txt(A, 'si por favor');
  check(/Nequi/.test(o[0].t) && /\$10\.000/.test(o[0].t) && /colecciones/.test(o[0].t) && !/libros/.test(o[0].t), 'datos de pago de moldes por $10.000');
  o = await txt(A, 'Ok');
  check(o.length === 1 && !/Nequi/.test(o[0].t), '"ok" después de los datos: recordatorio, sin repetir cuentas');
  o = await txt(A, 'listo');
  check(o.length === 0, 'segundo "listo": no repite nada');
  ocrRespuesta = { isValid: true, esComprobante: true, amount: 10000, reference: 'M123', bank: 'nequi', titularValido: true };
  o = await img(A);
  check(o.some((e) => /acceso\//.test(e.t)), 'comprobante válido: entrega el enlace');
  check(store.yaCompro(A), 'queda como comprador');
  o = await txt(A, 'Ok');
  check(!o.some((e) => /Nequi/.test(e.t)), 'comprador que dice "ok": nunca recibe datos de pago');
  o = await txt(A, 'No me abre ningún archivo');
  check(/Files de Google/.test(o[0].t), 'comprador con problema: guía para abrir en el celular');
  o = await img(A);
  check(store.pedidosDeTelefono(A).filter((p) => p.status === 'VERIFICADO').length === 1, 'otra imagen del comprador no crea una segunda venta');
  store.saveLead(A, { status: 'ESPERA_PAGO' }); // el error viejo: el estado se pisaba
  store.obtenerConversacion(A).ultimoDelCliente = Date.now() - 2 * 3600e3;
  check(!store.obtenerCandidatosSeguimiento().some((c) => c.phone === A), 'comprador nunca entra a seguimientos aunque su estado diga ESPERA_PAGO');

  // 2. Preguntas que antes disparaban los datos de pago
  const B = '573000000002';
  await txt(B, 'Hola, quiero los +2.000 Moldes de Costura en PDF por $10.000 🧵', REF);
  for (const q of ['Pero si envían los moldes', 'Catálogo por favor', 'Si viene patron de pijamas.', 'Será que el lunes todavía está la promoción gracias', 'cuánto cuesta el envío', 'Quiero este molde']) {
    o = await txt(B, q);
    check(!o.some((e) => /Nequi/.test(e.t)), `"${q}" no manda datos de pago`);
  }
  check(store.getLead(B).muestraEnviada, 'la desconfianza envió la muestra gratis');
  o = await txt(B, 'Donde consigno');
  check(/Nequi/.test(o[0].t), '"Donde consigno" sí manda datos de pago');

  // 3. Seguimientos
  const C = '573000000003';
  await txt(C, 'Hola, quiero los +2.000 Moldes de Costura en PDF por $10.000 🧵', REF);
  store.obtenerConversacion(C).ultimoDelCliente = Date.now() - 2 * 3600e3;
  let cand = store.obtenerCandidatosSeguimiento().find((c) => c.phone === C);
  check(cand && cand.paso === 1, 'a las 2 h sin respuesta: seguimiento 1');
  if (!ventas.enHorarioSilencio()) {
    let n = enviados.length; await seg.ejecutarSeguimientos();
    const s1 = desde(n).filter((e) => e.to === C);
    console.log('   seguimiento 1 →', s1.map((e) => e.t.replace(/\n+/g, ' ⏎ ')).join(' | '));
    check(s1.length === 1 && /\$8\.000/.test(s1[0].t) && !/postre|helado|Guías/i.test(s1[0].t), 'seguimiento 1: $8.000 y sin postres');
    check(store.getLead(C).precioOfrecido === 8000, 'precio ofrecido queda en $8.000');
    n = enviados.length; await seg.ejecutarSeguimientos();
    check(desde(n).filter((e) => e.to === C).length === 0, 'no repite el seguimiento enseguida');
    o = await txt(C, 'Si');
    check(/\$8\.000/.test(o[0].t) && /Nequi/.test(o[0].t), '"sí" al descuento: datos por $8.000');
    // salto al último paso a las 19 h
    store.obtenerConversacion(C).ultimoDelCliente = Date.now() - 19 * 3600e3;
    store.saveLead(C, { ultimoSeguimiento: Date.now() - 20 * 3600e3 });
    cand = store.obtenerCandidatosSeguimiento().find((c) => c.phone === C);
    check(cand && cand.paso === 4, 'a las 19 h: salta al último seguimiento');
  }
  store.obtenerConversacion(C).ultimoDelCliente = Date.now() - 25 * 3600e3;
  check(!store.obtenerCandidatosSeguimiento().some((c) => c.phone === C), 'pasadas 24 h no se escribe');

  // 4. Rechazo
  const D = '573000000004';
  await txt(D, 'Hola, quiero los +2.000 Moldes de Costura en PDF por $10.000 🧵', REF);
  o = await txt(D, 'No gracias ya no');
  check(store.getLead(D).optOut === true, '"No gracias ya no": se apagan los seguimientos');
  store.obtenerConversacion(D).ultimoDelCliente = Date.now() - 2 * 3600e3;
  check(!store.obtenerCandidatosSeguimiento().some((c) => c.phone === D), 'sin seguimientos tras el rechazo');

  // 5. Imagen que no es comprobante y titular dudoso
  const E = '573000000005';
  await txt(E, 'Hola, quiero los +2.000 Moldes de Costura en PDF por $10.000 🧵', REF);
  ocrRespuesta = { isValid: false, esComprobante: false, amount: 0 };
  o = await img(E);
  check(/modelo que estás buscando/.test(o[o.length - 1].t) && !store.comprobantePendiente(E), 'foto de un molde: pregunta qué prenda busca, sin crear pedido');
  await txt(E, 'como pago');
  ocrRespuesta = { isValid: false, esComprobante: true, amount: 10000, titularValido: false, reference: 'X1' };
  o = await img(E);
  check(/revisa a mano/.test(o[o.length - 1].t) && store.comprobantePendiente(E), 'titular dudoso: queda en revisión con mensaje amable');

  // 6. HONESTIDAD con descuento
  const F = '573000000006';
  await txt(F, 'Hola, quiero los +2.000 Moldes de Costura en PDF por $10.000 🧵', REF);
  o = await txt(F, 'HONESTIDAD');
  check(/prueba\//.test(o[0].t) && /\$8\.000/.test(o[0].t), 'HONESTIDAD: enlace de prueba por $8.000');

  // 7. Quien ya tenía $7.000 lo conserva
  const G = '573000000007';
  await txt(G, 'Hola, quiero los +2.000 Moldes de Costura en PDF por $10.000 🧵', REF);
  store.setLeadPrecio(G, 7000);
  o = await txt(G, 'como pago');
  check(/\$7\.000/.test(o[0].t), 'cliente con oferta vieja de $7.000 la conserva');

  // 8. Acceso desbloqueado a mano (sin registrar venta): se trata como comprador
  const H = '573000000008';
  await txt(H, 'Hola, quiero los +2.000 Moldes de Costura en PDF por $10.000 🧵', REF);
  require(R + 'accesos').crear(H, 'moldes', 'completo', { manual: true });
  o = await txt(H, 'Ok');
  check(!o.some((e) => /Nequi/.test(e.t)), 'acceso manual: un "ok" no recibe datos de pago');
  o = await txt(H, 'como pago');
  check(!o.some((e) => /Nequi/.test(e.t)) && o.some((e) => /acceso\//.test(e.t)), 'acceso manual: "como pago" recibe su enlace, no el Nequi');

  console.log(`\n${fallos ? '✘ ' + fallos + ' fallos' : '✔ todo correcto'}`);
  process.exit(fallos ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
