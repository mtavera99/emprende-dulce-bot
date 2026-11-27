// Prueba local del embudo de venta (sin Meta ni Gemini): cada envío se captura en memoria.
//   node scripts/test_embudo.js
// Usa una carpeta de datos temporal; no toca data/ ni el disco de Render.
const fs = require('fs');
const os = require('os');
const path = require('path');
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'embudo-'));
// Sin contenido premium: se prueba el embudo base (los planes se prueban en test_planes.js)
process.env.MOLDES_PREMIUM = path.join(process.env.DATA_DIR, 'sin_premium.json');
delete process.env.GEMINI_API_KEY; delete process.env.OPENAI_API_KEY; delete process.env.META_ACCESS_TOKEN;
process.env.PRUEBA_MINUTOS = process.env.PRUEBA_MINUTOS || '1440';
process.env.UPSELL_MINUTOS = '600'; // la oferta post-compra se prueba aparte (sección 11)
// Sin horario de silencio para que se prueben rescate, upsell y recordatorios a cualquier hora
if (!process.env.SILENCIO_REAL) { process.env.SILENCIO_DESDE = '23'; process.env.SILENCIO_HASTA = '23'; }
const R = path.join(__dirname, '../src/');
const wa = require(R + 'whatsappService');
const enviados = [];
wa.sendTextMessage = async (to, t) => { enviados.push({ to, tipo: 'texto', t }); return {}; };
wa.sendImage = async (to, u, c) => { enviados.push({ to, tipo: 'imagen', t: u.split('/').pop() + (c ? ' | ' + c : '') }); return {}; };
wa.sendButtons = async (to, body, botones) => { enviados.push({ to, tipo: 'botones', t: body + ' [' + botones.map((b) => b.id + ':' + b.title).join(' | ') + ']', botones }); return {}; };
wa.sendDocument = async (to, u, n) => { enviados.push({ to, tipo: 'doc', t: n + ' <- ' + u }); return {}; };
wa.downloadMedia = async () => ({ buffer: Buffer.from('x'), mimeType: 'image/jpeg' });
wa.markAsRead = async () => {};
const ocr = require(R + 'ocrValidator');
let ocrRespuesta = null;
let ocrMinimo = null; // monto mínimo que el bot le pide al validador de comprobantes
ocr.validateReceipt = async (_buf, esperado) => { ocrMinimo = esperado && esperado.minAmount; return ocrRespuesta; };
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
async function boton(phone, id, title) {
  const n = enviados.length;
  await flow.handleIncomingMessage(phone, { type: 'interactive', interactive: { type: 'button_reply', button_reply: { id, title } } });
  const out = desde(n);
  console.log(`\n[${phone.slice(-4)}] CLIENTE: 🔘 ${title}`);
  out.forEach((e) => console.log(`   → ${e.tipo}: ${e.t.replace(/\n+/g, ' ⏎ ').slice(0, 170)}`));
  return out;
}
const SALUDO = 'Hola, quiero los +2.000 Moldes de Costura en PDF por $10.000 🧵';
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
  check(/2\.420 moldes/.test(o[1].t) && /34 prendas/.test(o[1].t) && !/postre|helado/i.test(o[1].t), 'pitch real de moldes, sin postres');
  check(o[1].t.indexOf('2.420 moldes') < o[1].t.indexOf('34 prendas'), 'el primer mensaje empieza por los moldes (lo que promete el anuncio)');
  check(o[1].tipo === 'botones' && o[1].botones.length === 2 && o[1].botones.every((b) => b.title.length <= 20), 'pitch con 2 botones de máximo 20 caracteres');
  check(o[1].botones[0].id === 'comprar' && /\$10\.000/.test(o[1].botones[0].title) && o[1].botones[1].id === 'muestra', 'botones: Comprar $10.000 y Muestra gratis');
  o = await boton(A, 'muestra', '🎁 Muestra gratis');
  check(o.filter((e) => e.tipo === 'doc').length === 2, 'botón Muestra gratis: envía 2 PDF');
  check(!/Nequi/.test(o.map((e) => e.t).join(' ')), 'la muestra no manda datos de pago');
  o = await txt(A, 'si por favor');
  check(/Nequi/.test(o[0].t) && /\$10\.000/.test(o[0].t) && /colecciones/.test(o[0].t) && !/libros/.test(o[0].t), 'datos de pago de moldes por $10.000');
  check(!/Escribe \*MUESTRA\*/.test(o[0].t), 'quien ya vio la muestra no recibe otra vez la oferta de muestra');
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
  store.obtenerConversacion(C).ultimoDelCliente = Date.now() - 1.5 * 3600e3;
  check(!store.obtenerCandidatosSeguimiento().some((c) => c.phone === C), 'a la 1,5 h todavía no hay seguimiento');
  store.obtenerConversacion(C).ultimoDelCliente = Date.now() - 2.1 * 3600e3;
  let cand = store.obtenerCandidatosSeguimiento().find((c) => c.phone === C);
  check(cand && cand.paso === 1, 'a las 2 h sin respuesta: seguimiento 1');
  if (!ventas.enHorarioSilencio()) {
    let n = enviados.length; await seg.ejecutarSeguimientos();
    const s1 = desde(n).filter((e) => e.to === C);
    console.log('   seguimiento 1 →', s1.map((e) => e.t.replace(/\n+/g, ' ⏎ ')).join(' | '));
    check(s1.length === 1 && /\$8\.000/.test(s1[0].t) && !/postre|helado|Guías/i.test(s1[0].t), 'seguimiento 1: $8.000 y sin postres');
    check(/\/regalo\/calculadora\?p=moldes/.test(s1[0].t), 'seguimiento 1: regala la calculadora de costos');
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

  // 9. Botones: "sí", "1", "2" y el botón Comprar
  const I = '573000000009';
  await txt(I, SALUDO, REF);
  o = await txt(I, 'Si');
  check(/Nequi/.test(o[0].t) && /\$10\.000/.test(o[0].t) && /Escribe \*MUESTRA\*/.test(o[0].t), '"sí" al primer mensaje: datos de pago + opción de muestra');
  const J = '573000000010';
  await txt(J, SALUDO, REF);
  o = await txt(J, '1');
  check(o.length === 1 && /Nequi/.test(o[0].t), '"1": datos de pago');
  const K = '573000000011';
  await txt(K, SALUDO, REF);
  o = await txt(K, '2');
  check(o.filter((e) => e.tipo === 'doc').length === 2 && !o.some((e) => /Nequi/.test(e.t)), '"2": muestra gratis sin datos de pago');
  const L = '573000000012';
  await txt(L, SALUDO, REF);
  o = await boton(L, 'comprar', '💳 Comprar $10.000');
  check(o.length === 1 && /Nequi/.test(o[0].t) && /\$10\.000/.test(o[0].t), 'botón Comprar: datos de pago por $10.000');
  o = await boton(A, 'comprar', '💳 Comprar $10.000');
  check(!o.some((e) => /Nequi/.test(e.t)) && o.some((e) => /acceso\//.test(e.t)), 'comprador que toca Comprar: recibe su enlace, no el Nequi');

  // 10. Rescate a los 15 minutos
  if (!ventas.enHorarioSilencio()) {
    const atras = (ph, min) => {
      const l = store.getLead(ph);
      store.saveLead(ph, { rescate: { ...l.rescate, at: Date.now() - min * 60e3 } });
      store.obtenerConversacion(ph).ultimoDelCliente = Date.now() - (min + 1) * 60e3;
    };
    atras(J, 10); atras(L, 16); atras(K, 16);
    let n = enviados.length; await seg.ejecutarRescate15();
    let r = desde(n);
    check(!r.some((e) => e.to === J), 'a los 10 min no hay rescate');
    const rL = r.filter((e) => e.to === L);
    check(rL.length === 1 && /problema con Nequi o con abrir el archivo/.test(rL[0].t) && /comprobante/.test(rL[0].t), 'a los 16 min tras los datos: rescate (Nequi / comprobante)');
    const rK = r.filter((e) => e.to === K);
    check(rK.length === 1 && /problema con Nequi o con abrir el archivo/.test(rK[0].t) && /sí/.test(rK[0].t), 'a los 16 min tras la muestra: rescate');
    n = enviados.length; await seg.ejecutarRescate15();
    check(!desde(n).some((e) => e.to === L || e.to === K), 'el rescate no se repite');
    check(store.getLead(L).seguimientosEnviados === 0, 'el rescate no cuenta como seguimiento numerado');
    // si el cliente escribió después de los datos, no hay rescate
    await txt(I, 'ok');
    store.saveLead(I, { rescate: { ...store.getLead(I).rescate, at: Date.now() - 16 * 60e3 } });
    n = enviados.length; await seg.ejecutarRescate15();
    check(!desde(n).some((e) => e.to === I), 'si el cliente respondió después, no hay rescate');
    // comprador: nunca
    store.saveLead(A, { rescate: { tipo: 'datos', at: Date.now() - 16 * 60e3, enviado: false } });
    store.obtenerConversacion(A).ultimoDelCliente = Date.now() - 17 * 60e3;
    n = enviados.length; await seg.ejecutarRescate15();
    check(!desde(n).some((e) => e.to === A), 'comprador nunca recibe rescate');
    // segundo rescate el mismo día: no
    store.saveLead(L, { rescate: { tipo: 'datos', at: Date.now() - 16 * 60e3, enviado: false } });
    n = enviados.length; await seg.ejecutarRescate15();
    check(!desde(n).some((e) => e.to === L), 'máximo un rescate cada 24 h');
  } else {
    console.log('  (horario de silencio: se omiten las pruebas de rescate)');
  }

  // 11. Upsell post-compra: pack Emprende Dulce por $5.000
  if (!ventas.enHorarioSilencio()) {
    const espera = (ms) => new Promise((r) => setTimeout(r, ms));
    const M = '573000000013';
    await txt(M, SALUDO, REF);
    await boton(M, 'comprar', '💳 Comprar $10.000');
    process.env.UPSELL_MINUTOS = '0.002'; // ~120 ms
    ocrRespuesta = { isValid: true, esComprobante: true, amount: 10000, reference: 'U1', bank: 'nequi', titularValido: true };
    o = await img(M);
    check(o.some((e) => /acceso\//.test(e.t)) && !o.some((e) => /5\.000/.test(e.t)), 'entrega de moldes: la oferta no sale junto con el enlace');
    let n = enviados.length; await espera(400);
    let of = desde(n).filter((e) => e.to === M);
    console.log('   oferta →', of.map((e) => e.t.replace(/\n+/g, ' ⏎ ').slice(0, 220)).join(' | '));
    check(of.length === 1 && of[0].tipo === 'botones' && of[0].botones.map((b) => b.id).join() === 'btn_upsell_si,btn_upsell_no', 'tras la espera: oferta con botones Sí / No');
    check(of[0] && of[0].botones.every((b) => b.title.length <= 20), 'botones del upsell de máximo 20 caracteres');
    check(of[0] && !/éxito de ventas|solo por hoy/i.test(of[0].t) && /\$5\.000/.test(of[0].t), 'oferta sin afirmaciones falsas, por $5.000');
    check(await flow.enviarOfertaUpsell(M) === false, 'la oferta no se repite');
    o = await txt(M, 'No me abre el archivo');
    check(/Files de Google/.test(o[0].t) && !/Entendido/.test(o[0].t) && store.getLead(M).esperaRespuestaUpsell, '"No me abre el archivo": soporte, no cuenta como "no" a la oferta');
    o = await txt(M, 'Gracias');
    check(!o.some((e) => /5\.000/.test(e.t)), '"Gracias" no manda los datos del upsell');
    o = await boton(M, 'btn_upsell_si', '🍰 Sí, por $5.000');
    check(/Nequi/.test(o[0].t) && /\$5\.000/.test(o[0].t), 'botón Sí: datos de pago por $5.000');
    o = await img(M); // reenvía el comprobante de la primera compra (ref U1)
    check(/compra del Mega Pack/.test(o[o.length - 1].t) && !store.yaCompro(M, 'upsell_helados'), 'comprobante viejo de la primera compra: no entrega el upsell');
    ocrRespuesta = { isValid: true, esComprobante: true, amount: 5000, reference: 'U2', bank: 'nequi', titularValido: true };
    n = enviados.length;
    o = await img(M);
    await espera(400);
    const vU = store.pedidosDeTelefono(M).filter((p) => p.status === 'VERIFICADO' && p.producto === 'upsell_helados');
    check(vU.length === 1 && vU[0].amount === 5000, 'comprobante de $5.000: venta del upsell registrada');
    check(o.some((e) => /Emprende Dulce/.test(e.t) && /acceso\//.test(e.t)), 'entrega el acceso al pack Emprende Dulce');
    check(!desde(n).some((e) => e.tipo === 'botones'), 'tras pagar el upsell no llega otra oferta');
    o = await txt(M, 'No me abre ningún archivo');
    check(/Files de Google/.test(o[0].t) && (o[0].t.match(/acceso\//g) || []).length === 2, 'comprador de los dos packs: soporte de moldes con los dos enlaces');
    const enlM = (o[0].t.match(/acceso\/([A-Za-z0-9_-]+)/) || [])[1];
    check(enlM && require(R + 'accesos').estado(enlM).acceso.producto === 'moldes', 'el primer enlace sigue siendo el de moldes');

    const N = '573000000014';
    await txt(N, SALUDO, REF); await txt(N, 'como pago');
    ocrRespuesta = { isValid: true, esComprobante: true, amount: 10000, reference: 'N1', bank: 'nequi', titularValido: true };
    await img(N); await espera(400);
    o = await txt(N, 'No gracias');
    check(/Entendido/.test(o[0].t) && !store.getLead(N).esperaRespuestaUpsell, '"No gracias": se cierra la oferta');

    const P = '573000000015';
    await txt(P, SALUDO, REF); await txt(P, 'como pago');
    process.env.UPSELL_MINUTOS = '600';
    ocrRespuesta = { isValid: true, esComprobante: true, amount: 10000, reference: 'P1', bank: 'nequi', titularValido: true };
    await img(P);
    await txt(P, 'No me descarga nada');
    check(await flow.enviarOfertaUpsell(P, { entregadoAt: store.getLead(P).entregadoAt }) === false, 'quien reportó un problema de descarga no recibe la oferta');
  } else {
    console.log('  (horario de silencio: se omiten las pruebas del upsell)');
  }

  // 12. La IA ofrece la muestra o dice que la envió: se envía de verdad
  process.env.GEMINI_API_KEY = 'prueba';
  let iaRespuesta = '';
  const fetchReal = global.fetch;
  global.fetch = async () => ({ ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: iaRespuesta }] }, finishReason: 'STOP' }] }) });
  const Q = '573000000016';
  await txt(Q, SALUDO, REF);
  iaRespuesta = 'Sí, trae la Blusa Básica con Pinzas de Busto en 6 tallas. ¿Te envío gratis un patrón completo para que lo revises?';
  await txt(Q, 'Tienen patrón de blusa');
  check(store.getLead(Q).step === 'MUESTRA_OFRECIDA', 'la IA ofrece la muestra: queda registrada la oferta');
  o = await txt(Q, 'Me parece muy bien');
  check(o.filter((e) => e.tipo === 'doc').length === 2 && !o.some((e) => /Nequi/.test(e.t)), '"Me parece muy bien" a la oferta de la IA: envía los 2 PDF');
  const R2 = '573000000017';
  await txt(R2, SALUDO, REF);
  iaRespuesta = '¡De una! Te acabo de enviar al chat el patrón de la Blusa Básica 🙌';
  o = await txt(R2, 'Me interesa ver uno de blusa');
  check(o.filter((e) => e.tipo === 'doc').length === 2 && !o.some((e) => /acabo de enviar/.test(e.t)), 'la IA dice "te acabo de enviar": se envía la muestra real y no la frase falsa');
  iaRespuesta = 'Ya te lo reenvié 🙌';
  o = await txt(R2, 'Y el de vestido');
  check(o.length === 1 && /más arriba/.test(o[0].t) && !/reenvi[eé] 🙌/.test(o[0].t), 'muestra ya enviada y la IA dice "ya te lo reenvié": se le dice dónde está');
  const S1 = '573000000018';
  await txt(S1, SALUDO, REF);
  iaRespuesta = 'Claro 😊 ¿Quieres que te envíe gratis un patrón completo?';
  await txt(S1, 'Tienen de faldas');
  o = await txt(S1, 'Nada que llega');
  check(o.filter((e) => e.tipo === 'doc').length === 2, '"Nada que llega" después de la oferta: envía la muestra');
  o = await txt(S1, 'Nada que llega');
  check(o.filter((e) => e.tipo === 'doc').length === 2 && !o.some((e) => e.tipo === 'imagen') && /reenv/.test(o[0].t), 'segundo "nada que llega": reenvía los 2 PDF una vez');
  o = await txt(S1, 'todavía nada');
  check(o.length === 1 && o[0].tipo === 'texto' && /asesor/.test(o[0].t) && !store.obtenerConversacion(S1).atendido, 'tercer aviso: pasa a un asesor sin repetir archivos');
  delete process.env.GEMINI_API_KEY;
  global.fetch = fetchReal;

  // 13. "No abre": Google Drive de respaldo para compradores; enlace de prueba para quien tiene HONESTIDAD
  const U = '573000000022';
  await txt(U, SALUDO, REF); await txt(U, 'como pago');
  ocrRespuesta = { isValid: true, esComprobante: true, amount: 10000, reference: 'V1', bank: 'nequi', titularValido: true };
  await img(U);
  o = await txt(U, 'Pero no abre nada');
  check(/acceso\//.test(o[0].t) && /drive\.google\.com/.test(o[0].t), 'comprador "no abre nada": enlace personal + Google Drive de respaldo');
  o = await txt(U, 'Hola no abre');
  check(/^Probemos por Google Drive/.test(o[0].t) && /15Mnij3UurwpXKG4Da_sdt77mfUGQPGx5/.test(o[0].t), 'segundo "no abre": Google Drive primero');
  o = await txt(F, 'Hola no abre');
  check(/prueba\//.test(o[0].t) && !/drive\.google/.test(o[0].t), 'prueba HONESTIDAD que no abre: reenvía su enlace de prueba, nunca el Drive');

  // 14. Pago pospuesto
  const T1 = '573000000019';
  await txt(T1, SALUDO, REF);
  o = await txt(T1, 'Pago mañana al mediodía');
  check(/Te guardo el precio de \*\$10\.000\*/.test(o[0].t) && /Nequi/.test(o[0].t), '"Pago mañana al mediodía": guarda el precio y deja las cuentas');
  store.obtenerConversacion(T1).ultimoDelCliente = Date.now() - 2.1 * 3600e3;
  store.saveLead(T1, { pagoPospuesto: { ...store.getLead(T1).pagoPospuesto, at: Date.now() - 2.1 * 3600e3 + 1000 } });
  check(!store.obtenerCandidatosSeguimiento().some((c) => c.phone === T1), 'pago pospuesto: no recibe el seguimiento de las 2 h');
  store.saveLead(T1, { pagoPospuesto: { ...store.getLead(T1).pagoPospuesto, recordarAt: Date.now() - 60e3 } });
  let nR = enviados.length; await seg.ejecutarRecordatorioPago();
  const rp = desde(nR).filter((e) => e.to === T1);
  if (!ventas.enHorarioSilencio()) {
    check(rp.length === 1 && /Como quedamos/.test(rp[0].t) && /\$10\.000/.test(rp[0].t), 'a la hora acordada: un recordatorio con el mismo precio');
    nR = enviados.length; await seg.ejecutarRecordatorioPago();
    check(!desde(nR).some((e) => e.to === T1), 'el recordatorio no se repite');
  } else check(rp.length === 0, 'en horario de silencio el recordatorio espera');
  const T2 = '573000000020';
  await txt(T2, SALUDO, REF); await txt(T2, 'como pago');
  o = await txt(T2, 'Estoy en zona rural sin señal');
  check(/para cuando puedas/.test(o[0].t) && !/Nequi/.test(o[0].t) && !store.getLead(T2).pagoPospuesto.recordarAt, '"zona rural sin señal" después de los datos: guarda el precio, sin repetir cuentas ni recordatorio');
  store.saveLead(T2, { pagoPospuesto: { ...store.getLead(T2).pagoPospuesto, at: Date.now() - 3 * 3600e3 } });
  await txt(T2, 'Hola ya estoy en el pueblo');
  store.obtenerConversacion(T2).ultimoDelCliente = Date.now() - 2.1 * 3600e3;
  check(store.obtenerCandidatosSeguimiento().some((c) => c.phone === T2), 'si vuelve a escribir, los seguimientos normales siguen');
  const T3 = '573000000021';
  await txt(T3, SALUDO, REF);
  store.saveLead(T3, { precioOfrecido: 8000 });
  o = await txt(T3, 'mañana le consigno');
  check(/\$8\.000/.test(o[0].t), 'pago pospuesto conserva el precio que tenía ($8.000)');

  // 15. Pack de muebles: anuncio nuevo (sin ID registrado), muestra, compra y soporte
  const REFM = { source_id: '120299999999990001', headline: '+139 Planos de Muebles en Melamina', ctwa_clid: 'CLID-MUEBLES-1' };
  const MU = '573000000030';
  o = await txt(MU, 'Hola, quiero más información', REFM);
  check(store.getLead(MU).producto === 'muebles' && store.getLead(MU).ctwaClid === 'CLID-MUEBLES-1' && store.getLead(MU).adId === REFM.source_id, 'anuncio nuevo de muebles: detecta el producto por el titular y guarda ctwa_clid y el ID del anuncio');
  const manM = ventas.infoPack('muebles');
  check(o[0].tipo === 'imagen' && /muebles_1_catalogo/.test(o[0].t), 'muebles: primer mensaje con la imagen del catálogo');
  const nPlanosM = manM.totales.planos.toLocaleString('es-CO');
  check(o[1].tipo === 'botones' && o[1].t.includes(`*${nPlanosM} planos reales*`) && /cocinas, clósets, escritorios, camas/.test(o[1].t) && /medidas en mm y despiece/.test(o[1].t) && !/moldes|postre/i.test(o[1].t), `muebles: pitch con la cifra real (${nPlanosM} planos) y botones`);
  const pitchM = ventas.textoPitch('muebles'), lineasM = pitchM.split('\n');
  check(o[1].t.startsWith(pitchM) && lineasM.length === 3 && pitchM.length <= 320, `muebles: primer mensaje corto de 3 líneas (${pitchM.length} caracteres)`);
  check(/4 guías/.test(lineasM[1]) && /calculadora de láminas y costos/.test(lineasM[1]) && /diseño 3D/.test(lineasM[1]) && /\$15\.000\* pago único/.test(lineasM[2]) && /muestra gratis/.test(lineasM[2]) && /Comprar/.test(lineasM[2]), 'muebles: línea 2 con guías y calculadora, línea 3 con $15.000 y la invitación');
  check(o[1].botones.map((b) => b.title).join('|') === '💳 Comprar $15.000|🎁 Muestra gratis', 'muebles: botones Comprar $15.000 y Muestra gratis');
  check(manM.totales.planos >= 2500 && manM.totales.planos <= 3000 && manM.totales.planos === require(R + 'muebles/motor').contar(), 'muebles: la cifra del pitch es la del motor y está entre 2.500 y 3.000');
  check(/\*\$15\.000\*/.test(o[1].t) && !/10\.000|12\.000/.test(o[1].t) && o[1].botones[0].title.length <= 20, 'muebles: precio de $15.000 en el pitch y en el botón Comprar');
  o = await boton(MU, 'muestra', '🎁 Muestra gratis');
  const docsM = o.filter((e) => e.tipo === 'doc');
  check(docsM.length === 1 && /Muestra_Muebles_Plano/.test(docsM[0].t) && o.some((e) => /muebles_2_plano/.test(e.t)), 'muebles: la muestra es 1 plano completo en PDF + imagen del plano');
  check(/planos\* del pack/.test(o[o.length - 1].t) && /datos de pago/.test(o[o.length - 1].t), 'muebles: después de la muestra pregunta por la compra');
  o = await txt(MU, 'Si');
  check(/Nequi/.test(o[0].t) && /\$15\.000/.test(o[0].t) && !/\$10\.000/.test(o[0].t) && o[0].t.includes(`los ${nPlanosM} planos`), 'muebles: "sí" manda los datos de pago por $15.000');
  ocrRespuesta = { isValid: true, esComprobante: true, amount: 15000, reference: 'MU1', bank: 'nequi', titularValido: true };
  process.env.UPSELL_MINUTOS = '0.002';
  o = await img(MU);
  await new Promise((r) => setTimeout(r, 300));
  check(ocrMinimo === 15000, 'muebles: el validador exige un comprobante de al menos $15.000');
  const entrega = o.find((e) => /acceso\//.test(e.t));
  check(entrega && /Carpintería y Muebles/.test(entrega.t) && /catálogo interactivo/.test(entrega.t), 'muebles: comprobante válido entrega el acceso al pack de muebles');
  const tokM = (entrega.t.match(/acceso\/([A-Za-z0-9_-]+)/) || [])[1];
  check(tokM && require(R + 'accesos').estado(tokM).acceso.producto === 'muebles', 'muebles: el enlace es del producto muebles');
  check(store.pedidosDeTelefono(MU).some((p) => p.status === 'VERIFICADO' && p.producto === 'muebles' && Number(p.amount) === 15000 && p.origen && p.origen.ctwaClid === 'CLID-MUEBLES-1'), 'muebles: la venta queda por $15.000 con producto y ctwa_clid del anuncio');
  check(!desde(0).some((e) => e.to === MU && e.tipo === 'botones' && /upsell/.test(e.t)), 'muebles: no se ofrece el upsell de Emprende Dulce');
  process.env.UPSELL_MINUTOS = '600';
  o = await txt(MU, 'No me abre el archivo');
  check(/catálogo interactivo/.test(o[0].t) && /acceso\//.test(o[0].t) && !/Files de Google|patrón/.test(o[0].t), 'comprador de muebles con problema: guía del pack de muebles');
  const MV = '573000000031';
  o = await txt(MV, 'Quiero los planos de closet en melamina');
  check(store.getLead(MV).producto === 'muebles' && o[1].t.includes(`${nPlanosM} planos reales`), 'muebles: palabras clave en el mensaje');
  if (!ventas.enHorarioSilencio()) {
    store.obtenerConversacion(MV).ultimoDelCliente = Date.now() - 2.1 * 3600e3;
    const nM = enviados.length; await seg.ejecutarSeguimientos();
    const s1M = desde(nM).filter((e) => e.to === MV);
    check(s1M.length === 1 && /regalo\/calculadora\?p=muebles/.test(s1M[0].t) && /\*\$12\.000\* en lugar de \$15\.000/.test(s1M[0].t) && !/prenda|postre|8\.000/.test(s1M[0].t), 'muebles: seguimiento 1 con la calculadora y el descuento de $15.000 a $12.000');
    check(store.getLead(MV).precioOfrecido === 12000, 'muebles: precio ofrecido queda en $12.000');
    o = await txt(MV, 'Si');
    check(/Nequi/.test(o[0].t) && /\$12\.000/.test(o[0].t), 'muebles: "sí" al descuento manda los datos por $12.000');
    ocrRespuesta = { isValid: false, esComprobante: false, amount: 0 };
    await img(MV);
    check(ocrMinimo === 12000, 'muebles: con descuento el validador exige $12.000');
  }
  o = await txt(MV, 'HONESTIDAD');
  check(/prueba\//.test(o[0].t) && /catálogo de los/.test(o[0].t) && /\$12\.000/.test(o[0].t), 'muebles: HONESTIDAD con el detalle del pack y el precio de $12.000');
  // Quien tenía la oferta de $8.000 de moldes y llega por un anuncio de muebles paga el precio de muebles
  const MX = '573000000033';
  await txt(MX, SALUDO, REF);
  store.setLeadPrecio(MX, 8000);
  await txt(MX, 'Hola', REFM);
  o = await txt(MX, 'como pago');
  check(store.getLead(MX).producto === 'muebles' && /\$15\.000/.test(o[0].t) && !/\$8\.000/.test(o[0].t), 'cambio de moldes a muebles: no arrastra el descuento de $8.000');
  check(ventas.precioNormal('moldes') === 10000 && ventas.precioDescuento('moldes') === 8000 && ventas.precioNormal('helados') === 10000, 'moldes y postres siguen en $10.000 / $8.000');
  check(ventas.esPedidoDescuento('12000') && ventas.esPedidoDescuento('8000'), '"12000" y "8000" se entienden como pedir el descuento');
  let crash = null;
  try { await txt('573000000032', 'Hola', { source_id: '1', headline: 'Oferta' }); } catch (e) { crash = e; }
  check(!crash, 'anuncio desconocido sin palabras clave: no rompe la detección');

  // 16. Cambio de producto: quien ya tenía moldes (o lo compró) y ahora pide muebles
  const CA = '573000000040';
  await txt(CA, SALUDO, REF);
  o = await txt(CA, 'Hola, quiero el Mega Pack de Planos de Muebles en Melamina');
  check(store.getLead(CA).producto === 'muebles' && o.some((e) => e.tipo === 'botones' && /planos reales/.test(e.t) && /\$15\.000/.test(e.t)), 'prospecto de moldes que pide muebles: recibe el primer mensaje de muebles por $15.000');
  const CB = '573000000041';
  await txt(CB, SALUDO, REF); await txt(CB, 'como pago');
  ocrRespuesta = { isValid: true, esComprobante: true, amount: 10000, reference: 'CB-MOLDES', bank: 'nequi', titularValido: true };
  await img(CB);
  check(store.compradorDe(CB, 'moldes'), 'CB compró moldes');
  o = await txt(CB, 'Quiero ver los planos de muebles en melamina');
  check(store.getLead(CB).producto === 'muebles' && o.some((e) => e.tipo === 'botones' && /planos reales/.test(e.t)) && !o.some((e) => /Ya tienes tu compra activa/.test(e.t)), 'comprador de moldes que pide muebles: se le vende muebles (no soporte de moldes)');
  o = await txt(CB, 'como pago');
  check(/Nequi/.test(o[0].t) && /\$15\.000/.test(o[0].t), 'comprador de moldes: datos de pago de muebles por $15.000');
  o = await img(CB); // reenvía el comprobante de moldes
  check(/compra que ya tienes/.test(o[o.length - 1].t) && !store.compradorDe(CB, 'muebles'), 'reenviar el comprobante de moldes no entrega muebles');
  ocrRespuesta = { isValid: true, esComprobante: true, amount: 15000, reference: 'CB-MUEBLES', bank: 'nequi', titularValido: true };
  o = await img(CB);
  check(store.compradorDe(CB, 'muebles') && o.some((e) => /Carpintería y Muebles/.test(e.t) && /acceso\//.test(e.t)), 'comprobante de $15.000: entrega muebles');
  o = await txt(CB, 'No me abre el archivo');
  check(/catálogo interactivo/.test(o[0].t) && /Tu Mega Pack de Moldes/.test(o[0].t), 'comprador de los dos: soporte de muebles con el enlace de moldes también');
  o = await txt(CB, 'y los moldes de costura no me abren');
  check(store.getLead(CB).producto === 'moldes' && /15Mnij3UurwpXKG4Da_sdt77mfUGQPGx5/.test(o[0].t) && !/Nequi/.test(o[0].t), 'si pregunta por moldes vuelve al soporte de moldes (Drive de moldes), sin cobrar');
  const CC = '573000000042';
  await txt(CC, SALUDO, REF);
  o = await txt(CC, 'no me interesan los muebles, solo los moldes');
  check(store.getLead(CC).producto === 'moldes', '"no me interesan los muebles": no cambia de producto');
  check(!store.obtenerCandidatosSeguimiento().some((c) => c.phone === CB), 'comprador de los dos packs: sin seguimientos');

  // 18. Intención de pago: nunca quedarse preguntando "¿te paso los datos?" (chat real del 26 nov, muebles)
  {
    const quiere = ['Saque número le envío', 'A ese número', 'a cuál número', 'a qué número le consigno', 'dónde pago', 'cómo transfiero', 'quiero el pack', 'sí pásamelos', 'páseme el número', 'cuál es el número', 'deme la cuenta', 'Los datos para pagar los 15', 'le transfiero ya', 'me lo llevo', 'al nequi'];
    const noQuiere = ['Pero si envían los moldes', 'Quiero este molde', 'cuánto cuesta el envío', 'te envío el comprobante', 'ya le envié el comprobante', 'el número de piezas del closet', 'cuántos planos son', 'Catálogo por favor'];
    const mal1 = quiere.filter((t) => !ventas.esPedidoPago(t)), mal2 = noQuiere.filter((t) => ventas.esPedidoPago(t));
    check(!mal1.length, `frases de pago detectadas (${quiere.length}) ${mal1.join(' | ')}`);
    check(!mal2.length, `preguntas que no son de pago siguen sin mandar cuentas (${noQuiere.length}) ${mal2.join(' | ')}`);
    check(['¿Te los envío de una vez?', '¿Te los envío ya?', '¿Te paso los datos de pago?'].every(ventas.ofreceDatosPago) && !ventas.ofreceDatosPago('¿Te envío gratis un plano completo para que lo revises?') && !ventas.ofreceDatosPago('¿Te envío la muestra?'), 'reconoce cuándo Sofía ofreció los datos (y no confunde la oferta de la muestra)');
    check(['Quiero el diseño', 'O como', 'dale', 'A ese número'].every(ventas.aceptaDatosPago) && !['no gracias', 'y es confiable?', 'después'].some(ventas.aceptaDatosPago), 'reconoce cuándo el cliente acepta los datos');

    process.env.GEMINI_API_KEY = 'prueba';
    let iaR = '';
    const fetchReal2 = global.fetch;
    global.fetch = async () => ({ ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: iaR }] }, finishReason: 'STOP' }] }) });
    const cuentas = (out) => out.some((e) => /Nequi/.test(e.t) && /3058742138/.test(e.t));
    // Chat real: "Quiero el diseño" → Sofía pregunta → "Saque número le envío"
    const RP = '573160579899';
    await txt(RP, 'Hola, quiero el Mega Pack de Planos de Muebles en Melamina');
    iaR = '¡Claro! El pack trae todos los diseños por $15.000. ¿Te los envío de una vez?';
    o = await txt(RP, 'Quiero el diseño');
    check(!cuentas(o) && store.getLead(RP).step === 'DATOS_OFRECIDOS', 'chat real: Sofía ofrece los datos y queda registrado');
    o = await txt(RP, 'Saque número le envío');
    check(cuentas(o) && /\$15\.000/.test(o[0].t) && /Manuel Tavera/.test(o[0].t), 'chat real: "Saque número le envío" → cuentas reales por $15.000');
    // "O como" justo después de "¿te los envío?"
    const RP2 = '573160579800';
    await txt(RP2, 'Hola, quiero el Mega Pack de Planos de Muebles en Melamina');
    iaR = 'Sí, viene el clóset de 2 puertas corredizas en varias medidas. ¿Te los envío ya?';
    await txt(RP2, 'Tiene closet corredizo');
    o = await txt(RP2, 'O como');
    check(cuentas(o), '"O como" después de "¿Te los envío ya?" → cuentas reales');
    // "Quiero el diseño" justo después de "¿te paso los datos?"
    const RP3 = '573160579801';
    await txt(RP3, 'Hola, quiero el Mega Pack de Planos de Muebles en Melamina');
    iaR = 'Trae 2.775 planos. ¿Te paso los datos de pago?';
    await txt(RP3, 'cuántos son');
    o = await txt(RP3, 'Quiero el diseño');
    check(cuentas(o), '"Quiero el diseño" después de "¿Te paso los datos de pago?" → cuentas reales');
    // Sofía nunca pregunta dos veces seguidas: la segunda vez se mandan las cuentas
    const RP4 = '573160579802';
    await txt(RP4, 'Hola, quiero el Mega Pack de Planos de Muebles en Melamina');
    iaR = 'Claro. ¿Te paso los datos de pago?';
    await txt(RP4, 'me interesa el de cocina');
    iaR = 'Perfecto. ¿Te los envío de una vez?';
    o = await txt(RP4, 'y sirve para cocina pequeña de 2 metros con nevera al lado?');
    check(cuentas(o) && !o.some((e) => /Te los envío de una vez/.test(e.t)), 'Sofía no pregunta otra vez "¿te los envío?": manda las cuentas');
    // La IA marca la intención de pago: el sistema manda las cuentas y nunca la marca
    const RP5 = '573160579803';
    await txt(RP5, 'Hola, quiero el Mega Pack de Planos de Muebles en Melamina');
    iaR = '[ENVIAR_DATOS_PAGO]';
    o = await txt(RP5, 'me convenciste vamos con eso');
    check(cuentas(o) && !o.some((e) => /ENVIAR_DATOS_PAGO/.test(e.t)), 'la IA marca [ENVIAR_DATOS_PAGO]: se mandan las cuentas y la marca no llega al cliente');
    // Moldes también (aplica a todos los productos)
    const RP6 = '573160579804';
    await txt(RP6, SALUDO, REF);
    o = await txt(RP6, 'a qué número le consigno');
    check(cuentas(o) && /\$10\.000/.test(o[0].t), 'moldes: "a qué número le consigno" → cuentas por $10.000');
    delete process.env.GEMINI_API_KEY;
    global.fetch = fetchReal2;
  }

  // 19. Notas de voz: el audio va en el formato oficial y nunca se guarda una respuesta del modelo
  {
    const audio = require(R + 'audioService');
    const metas = ['Por favor, proporciona el audio o la nota de voz que deseas que transcriba.', 'No recibí ningún audio. ¿Puedes enviarlo de nuevo?', 'Lo siento, no puedo escuchar archivos de audio.', 'Please provide the audio file.'];
    const reales = ['Saque número le envío', 'No me llegó el archivo de la muestra', 'no puedo abrir el archivo', 'Hola buenas, tiene el plano de la cocina en L?'];
    check(metas.every(audio.esRespuestaSinAudio) && !reales.some(audio.esRespuestaSinAudio), 'distingue las respuestas del modelo sin audio de lo que dice un cliente');
    process.env.GEMINI_API_KEY = 'prueba';
    delete process.env.OPENAI_API_KEY;
    let cuerpo = null, transcripcion = '';
    const fetchReal3 = global.fetch;
    global.fetch = async (_url, op) => { cuerpo = JSON.parse(op.body); return { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: transcripcion }] }, finishReason: 'STOP' }] }) }; };
    wa.downloadMedia = async () => ({ buffer: Buffer.from('OggS-audio'), mimeType: 'audio/ogg; codecs=opus' });
    const AU = '573160579810';
    await txt(AU, 'Hola, quiero el Mega Pack de Planos de Muebles en Melamina');
    transcripcion = 'Por favor, proporciona el audio o la nota de voz que deseas que transcriba.';
    let n = enviados.length;
    await flow.handleIncomingMessage(AU, { type: 'audio', audio: { id: 'a1' } });
    o = desde(n);
    const partes = cuerpo.contents[0].parts;
    check(partes.some((p) => p.inlineData && p.inlineData.mimeType === 'audio/ogg' && p.inlineData.data) && !JSON.stringify(cuerpo).includes('inline_data'), 'el audio se envía como inlineData/mimeType (formato oficial), sin inline_data');
    const hist = store.obtenerConversacion(AU).messages.map((m) => m.text).join(' | ');
    check(!/proporciona el audio/.test(hist) && /Nota de voz sin transcribir/.test(hist), 'la respuesta del modelo no se guarda como si la hubiera dicho el cliente');
    check(o.length === 1 && /escribes por aquí/.test(o[0].t) && !store.obtenerConversacion(AU).atendido, 'el bot pide que lo escriba y el chat queda para el asesor');
    transcripcion = 'Saque número le envío';
    n = enviados.length;
    await flow.handleIncomingMessage(AU, { type: 'audio', audio: { id: 'a2' } });
    o = desde(n);
    check(/Saque número le envío/.test(store.obtenerConversacion(AU).messages.map((m) => m.text).join(' ')) && o.some((e) => /Nequi/.test(e.t) && /\$15\.000/.test(e.t)), 'nota de voz "Saque número le envío" → cuentas reales por $15.000');
    const ocr = require(R + 'ocrValidator');
    const ocrReal = ocr.__proto__._validateWithGemini;
    global.fetch = async (_url, op) => { cuerpo = JSON.parse(op.body); return { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: '{"es_comprobante":false,"monto":0}' }] } }] }) }; };
    await ocrReal.call(ocr, 'aW1hZ2Vu', { minAmount: 15000 }, 'prueba');
    check(cuerpo.contents[0].parts.some((p) => p.inlineData && p.inlineData.mimeType === 'image/jpeg') && !JSON.stringify(cuerpo).includes('inline_data') && cuerpo.generationConfig.responseMimeType === 'application/json', 'los comprobantes también se envían en el formato oficial (inlineData)');
    global.fetch = fetchReal3;
    delete process.env.GEMINI_API_KEY;
    wa.downloadMedia = async () => ({ buffer: Buffer.from('x'), mimeType: 'image/jpeg' });
  }

  // 20. Si Meta no acepta los botones, el texto lleva las opciones para responder 1 o 2
  {
    const waReal = require(R + 'whatsappService');
    const envioBotones = Object.getPrototypeOf(waReal).sendButtons;
    const enviadoTxt = [];
    const falso = { getConfigured: () => true, getApiUrl: () => 'x', getAccessToken: () => 'x', sendTextMessage: async (_to, t) => { enviadoTxt.push(t); return {}; } };
    const fetchReal4 = global.fetch;
    global.fetch = async () => ({ ok: false, status: 400, json: async () => ({}) });
    await envioBotones.call(falso, '1', ventas.textoPitch('muebles'), ventas.botonesPitch('muebles'));
    await envioBotones.call(falso, '1', ventas.textoPitch('moldes'), ventas.botonesPitch('moldes'));
    global.fetch = fetchReal4;
    check(/\*1\* 💳 Comprar \$15\.000/.test(enviadoTxt[0]) && /\*2\* 🎁 Muestra gratis/.test(enviadoTxt[0]), 'sin botones, el primer mensaje de muebles trae las opciones 1 y 2');
    check(!/Responde con el número de la opción/.test(enviadoTxt[1]), 'moldes ya dice "responde 1 o 2": no se repite');
    const B2 = '573160579820';
    await txt(B2, 'Hola, quiero el Mega Pack de Planos de Muebles en Melamina');
    o = await txt(B2, '2');
    check(o.some((e) => e.tipo === 'doc' && /Muestra_Muebles/.test(e.t)), 'muebles: responder "2" manda la muestra gratis');
  }

  console.log(`\n${fallos ? '✘ ' + fallos + ' fallos' : '✔ todo correcto'}`);
  process.exit(fallos ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
