// Prueba local del embudo de venta (sin Meta ni Gemini): cada envío se captura en memoria.
//   node scripts/test_embudo.js
// Usa una carpeta de datos temporal; no toca data/ ni el disco de Render.
const fs = require('fs');
const os = require('os');
const path = require('path');
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'embudo-'));
delete process.env.GEMINI_API_KEY; delete process.env.OPENAI_API_KEY; delete process.env.META_ACCESS_TOKEN;
process.env.PRUEBA_MINUTOS = process.env.PRUEBA_MINUTOS || '1440';
process.env.UPSELL_MINUTOS = '600'; // la oferta post-compra se prueba aparte (sección 11)
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
  check(/34 patrones/.test(o[1].t) && !/postre|helado/i.test(o[1].t), 'pitch real de moldes, sin postres');
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

  console.log(`\n${fallos ? '✘ ' + fallos + ' fallos' : '✔ todo correcto'}`);
  process.exit(fallos ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
