// Pruebas del Plan de Saneamiento (producto "sanidad"): flujo de Sofía, pagos por plan, captura de datos,
// documentos generados, página del comprador, vista previa gratis y paso al Llave en Mano.
//   node scripts/test_sanidad.js
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const zlib = require('zlib');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'sanidad-'));
process.env.DATA_DIR = TMP;
process.env.MOLDES_PREMIUM = path.join(TMP, 'sin_premium.json');
delete process.env.GEMINI_API_KEY; delete process.env.OPENAI_API_KEY; delete process.env.META_ACCESS_TOKEN;
process.env.UPSELL_MINUTOS = '600';
process.env.SILENCIO_DESDE = '23'; process.env.SILENCIO_HASTA = '23';
const R = path.join(__dirname, '../src/');

const wa = require(R + 'whatsappService');
const enviados = [];
wa.sendTextMessage = async (to, t) => { enviados.push({ to, tipo: 'texto', t }); return {}; };
wa.sendButtons = async (to, t, botones) => { enviados.push({ to, tipo: 'botones', t, botones }); return {}; };
wa.sendImage = async (to, u) => { enviados.push({ to, tipo: 'imagen', t: u }); return {}; };
wa.sendDocument = async (to, u, n) => { enviados.push({ to, tipo: 'doc', t: n }); return {}; };
wa.downloadMedia = async () => ({ buffer: Buffer.from('x'), mimeType: 'image/jpeg' });
wa.markAsRead = async () => {};
const ocr = require(R + 'ocrValidator');
let ocrRespuesta = null, ocrMinimo = null;
ocr.validateReceipt = async (_b, esperado) => { ocrMinimo = esperado && esperado.minAmount; return ocrRespuesta; };
const store = require(R + 'store');
const flow = require(R + 'conversationFlow');
const seg = require(R + 'seguimiento');
const ventas = require(R + 'ventas');
const accesos = require(R + 'accesos');
const catalogo = require(R + 'productCatalog');
const S = require(R + 'sanidad/planes');
const D = require(R + 'sanidad/documentos');
const datos = require(R + 'sanidad/datos');
const captura = require(R + 'sanidad/captura');
const F = require(R + 'sanidad/fechas');
const pagina = require(R + 'sanidad/pagina');
const { PDF } = require(R + 'sanidad/pdf');

let fallos = 0;
const check = (c, m) => { console.log((c ? '  ✔ ' : '  ✘ ') + m); if (!c) fallos++; };
const REF = { source_id: '120999999999999999', headline: 'Plan de Saneamiento y planillas para tu restaurante' };
const SALUDO = 'Hola, quiero información del plan de saneamiento';
async function txt(phone, body, referral) {
  const n = enviados.length;
  await flow.handleIncomingMessage(phone, { type: 'text', text: { body }, ...(referral ? { referral } : {}) });
  return enviados.slice(n);
}
async function boton(phone, id, title = id) {
  const n = enviados.length;
  await flow.handleIncomingMessage(phone, { type: 'interactive', interactive: { button_reply: { id, title } } });
  return enviados.slice(n);
}
async function pagar(phone, monto, ref) {
  ocrRespuesta = { isValid: true, esComprobante: true, amount: monto, reference: ref, bank: 'nequi', titularValido: true };
  const n = enviados.length;
  await flow.handleIncomingMessage(phone, { type: 'image', image: { id: 'i' } });
  return enviados.slice(n);
}
const cuentas = (o) => o.find((e) => /Nequi/.test(e.t) && /3058742138/.test(e.t));
const ultimo = (o) => (o[o.length - 1] || {}).t || '';

// Texto de un PDF (los contenidos van comprimidos y el texto en hexadecimal WinAnsi)
function textoPDF(buf) {
  const s = buf.toString('latin1');
  let out = '';
  const re = /stream\n([\s\S]*?)\nendstream/g;
  let m;
  while ((m = re.exec(s))) {
    try {
      const plano = zlib.inflateSync(Buffer.from(m[1], 'latin1')).toString('latin1');
      const W = { 0x80: '€', 0x85: '…', 0x91: '‘', 0x92: '’', 0x93: '“', 0x94: '”', 0x95: '•', 0x96: '–', 0x97: '—' };
      out += plano.replace(/<([0-9a-f]+)> Tj/g, (_, h) => [...Buffer.from(h, 'hex')].map((b) => W[b] || String.fromCharCode(b)).join('') + '\n');
    } catch (_) { /* no es un contenido de página */ }
  }
  return out;
}
function pdfValido(buf) {
  const s = buf.toString('latin1');
  if (!s.startsWith('%PDF-1.4') || !s.trimEnd().endsWith('%%EOF')) return false;
  const inicio = Number((s.match(/startxref\n(\d+)/) || [])[1]);
  const filas = s.slice(inicio).split('\n').filter((x) => /^\d{10} 00000 n /.test(x));
  return filas.length > 3 && filas.every((x, i) => s.slice(Number(x.slice(0, 10))).startsWith(`${i + 1} 0 obj`));
}
const paginasPDF = (buf) => (buf.toString('latin1').match(/\/Type \/Page /g) || []).length;

function pedir(puerto, metodo, ruta, cuerpo) {
  return new Promise((ok, mal) => {
    const datosForm = cuerpo ? new URLSearchParams(cuerpo).toString() : null;
    const req = http.request({ host: '127.0.0.1', port: puerto, method: metodo, path: ruta,
      headers: datosForm ? { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(datosForm) } : {} }, (res) => {
      const partes = [];
      res.on('data', (c) => partes.push(c));
      res.on('end', () => ok({ status: res.statusCode, headers: res.headers, body: Buffer.concat(partes) }));
    });
    req.on('error', mal);
    if (datosForm) req.write(datosForm);
    req.end();
  });
}

const NEGOCIO = {
  nombre: 'Panadería La Espiga Dorada', nit: '900.555.123-4', direccion: 'Carrera 7 # 45-12', ciudad: 'Medellín', departamento: 'Antioquia', telefono: '3209876543',
  tipo: 'panaderia', encargado: 'Rosa Elena Gil', propietario: 'Jorge Gil', manipuladores: 'Rosa Elena Gil\nAndrés Mejía\nSofía Ruiz', refrigeracion: 'Nevera pastelería\nVitrina de tortas',
  congelacion: 'Congelador de masas', agua: 'tanque', tanqueLitros: '500', hipoclorito: '5,25', empresaPlagas: 'Control Total S.A.S.', frecuenciaPlagas: '6', inicio: datos.hoyColombia(), autoriza: '1',
};

(async () => {
  let servidor = null;
  try {
    // ------------------------------------------------------------------ catálogo y precios
    console.log('Catálogo y precios');
    check(catalogo.identificarProducto('1', 'necesito las planillas para la secretaría de salud').producto === 'sanidad', 'palabras clave: "planillas" y "secretaría de salud" → sanidad');
    check(catalogo.identificarProducto('1', 'hola', { referral: REF }).producto === 'sanidad', 'anuncio con titular de plan de saneamiento → sanidad');
    check(['hola quiero el plan de saneamiento BPM', 'me van a hacer visita de inspección sanitaria', 'resolución 2674', 'fumigación del restaurante'].every((t) => catalogo.identificarProducto('1', t).producto === 'sanidad'), 'BPM, inspección sanitaria, 2674 y fumigación → sanidad');
    check(catalogo.identificarProducto('1', 'quiero los moldes de costura').producto === 'moldes' && catalogo.identificarProducto('1', 'planos de cocina en melamina').producto === 'muebles' && catalogo.identificarProducto('1', 'recetas de postres').producto === 'helados', 'moldes, muebles y postres se siguen detectando igual');
    check(catalogo.productoPedido('y tienen el plan de saneamiento?') === 'sanidad', 'nombrar el plan de saneamiento cambia de producto');
    const precios = ['personalizado', 'llave'].map((p) => [ventas.precioNormal('sanidad', p), ventas.precioDescuento('sanidad', p)]);
    check(JSON.stringify(precios) === '[[49900,39900],[79900,69900]]' && ventas.precioNormal('sanidad') === 49900, 'precios $49.900/$39.900 y $79.900/$69.900; sin plan, el del Personalizado');
    check(ventas.precioNormal('moldes') === 10000 && ventas.precioNormal('muebles') === 15000 && ventas.precioNormal('helados') === 10000, 'moldes, muebles y postres no cambian de precio');
    check([[39900, 'personalizado'], [49900, 'personalizado'], [69899, 'personalizado'], [69900, 'llave'], [79900, 'llave'], [100000, 'llave']].every(([m, p]) => S.deMonto(m) === p), 'plan por monto: $39.900/$49.900 Personalizado · $69.900/$79.900 Llave en Mano');
    check(S.elegido('quiero el llave en mano') === 'llave' && S.elegido('el de 79 mil') === 'llave' && S.elegido('el diligenciado') === 'llave' && S.elegido('el personalizado') === 'personalizado' && S.elegido('el de $49.900') === 'personalizado' && S.elegido('hola') === null, 'el cliente nombra el plan con palabras o con el precio');
    check(ventas.botonesPitch('sanidad').every((b) => b.title.length <= 20) && ventas.botonesPitch('sanidad').map((b) => b.id).join() === 'plan_personalizado,plan_llave,muestra', 'botones: los 2 planes y la prueba gratis (máximo 20 caracteres)');
    check(fs.existsSync(path.join(__dirname, '../public/descargas/muestras/img/sanidad_1_catalogo.jpg')) && fs.existsSync(path.join(__dirname, '../public/descargas/muestras/img/sanidad_2_planillas.jpg')), 'imágenes del producto en public/descargas/muestras/img');

    // ------------------------------------------------------------------ primer mensaje y muestra
    console.log('Primer mensaje y vista previa');
    const A = '573200000001';
    let o = await txt(A, SALUDO, REF);
    const pitch = o.find((e) => e.tipo === 'botones');
    check(store.getLead(A).producto === 'sanidad' && o[0].tipo === 'imagen' && /sanidad_1_catalogo/.test(o[0].t), 'llega por el anuncio: producto sanidad y primero la imagen del producto');
    check(pitch && /Plan Personalizado\* · \*\$49\.900/.test(pitch.t) && /Plan Llave en Mano\* · \*\$79\.900/.test(pitch.t) && /4 meses/.test(pitch.t) && /gratis/.test(pitch.t) && store.getLead(A).step === 'PLANES_ENVIADOS', 'primer mensaje: los 2 planes, los 4 meses del Llave en Mano y la prueba gratis');
    o = await boton(A, 'muestra', '🎁 Prueba gratis');
    check(o.some((e) => /\/prueba-sanidad/.test(e.t)) && o.some((e) => e.tipo === 'imagen' && /sanidad_2_planillas/.test(e.t)) && !o.some((e) => e.tipo === 'doc') && store.getLead(A).muestraEnviada, 'botón Prueba gratis: enlace a la vista previa interactiva (sin adjuntar PDF)');
    check(/Responde \*1\* o \*2\*/.test(ultimo(o)), 'después de la prueba ofrece responder 1 o 2');
    o = await txt(A, 'PRUEBA');
    check(o.length === 1 && /\/prueba-sanidad/.test(o[0].t), '"PRUEBA" reenvía el enlace');
    const B = '573200000002';
    await txt(B, 'Buenas, necesito las planillas de sanidad para mi cafetería');
    check(store.getLead(B).producto === 'sanidad', 'sin anuncio: detecta sanidad por el texto');
    o = await txt(B, '¿esto es real o es estafa?');
    check(/pruébalo primero/.test(o[0].t) && o.some((e) => /\/prueba-sanidad/.test(e.t)), 'desconfianza: explica y manda la vista previa');
    o = await txt(B, 'HONESTIDAD');
    check(o.length === 1 && /\/prueba-sanidad/.test(o[0].t) && ventas.precioDe(store.getLead(B)) === 39900, 'HONESTIDAD: la vista previa y el precio con descuento guardado');

    // ------------------------------------------------------------------ elegir plan y pagar
    console.log('Elegir plan y pagar');
    o = await boton(A, 'plan_llave', '🔑 Llave $79.900');
    check(cuentas(o) && /\*\$79\.900\* \(Plan Llave en Mano\)/.test(cuentas(o).t) && store.getLead(A).plan === 'llave', 'botón Llave en Mano: cuentas por $79.900');
    o = await pagar(A, 79900, 'A79');
    let accA = accesos.completoDe(A, 'sanidad');
    check(ocrMinimo === 49900, 'mínimo del comprobante: el valor del Personalizado');
    check(accA && accA.plan === 'llave' && store.pedidosDeTelefono(A).some((p) => p.plan === 'llave' && p.producto === 'sanidad'), 'pagó $79.900: acceso y pedido en Llave en Mano');
    check(o.some((e) => /Bienvenido\(a\) al \*Plan Llave en Mano\*/.test(e.t) && new RegExp(`/acceso/${accA.token}`).test(e.t) && /certificados externos/.test(e.t)), 'entrega: enlace personal, plan y la aclaración de los certificados externos');
    check(/1️⃣ ¿Cómo se llama el negocio/.test(ultimo(o)) && store.getLead(A).capturaSanidad, 'después del pago empieza a pedir los datos del negocio');

    const C = '573200000003';
    await txt(C, SALUDO, REF);
    o = await txt(C, '1');
    check(cuentas(o) && /\$49\.900/.test(cuentas(o).t) && store.getLead(C).plan === 'personalizado', '"1": Personalizado por $49.900');
    await pagar(C, 49900, 'C49');
    check(accesos.completoDe(C, 'sanidad').plan === 'personalizado', 'pagó $49.900: Personalizado');
    const E = '573200000004';
    await txt(E, SALUDO, REF);
    o = await txt(E, 'como pago?');
    check(cuentas(o) && /Plan Personalizado: \*\$49\.900\*/.test(cuentas(o).t) && /Plan Llave en Mano: \*\$79\.900\*/.test(cuentas(o).t), 'pide pagar sin elegir: cuentas con los 2 valores');
    await pagar(E, 79900, 'E79');
    check(accesos.completoDe(E, 'sanidad').plan === 'llave', 'pagó $79.900 sin elegir: Llave en Mano');
    const E2 = '573200000005';
    await txt(E2, SALUDO, REF);
    o = await txt(E2, 'quiero el diligenciado por 4 meses');
    check(cuentas(o) && /\$79\.900/.test(cuentas(o).t), '"quiero el diligenciado por 4 meses": cuentas por $79.900');

    const K = '573200000010';
    o = await txt(K, 'Ya probé la planilla gratis y quiero el Plan Llave en Mano de sanidad');
    check(store.getLead(K).producto === 'sanidad' && cuentas(o) && /\$79\.900\* \(Plan Llave en Mano\)/.test(cuentas(o).t), 'botón de la vista previa ("quiero el Plan Llave en Mano"): directo a las cuentas por $79.900');

    // ------------------------------------------------------------------ captura por WhatsApp
    console.log('Datos del negocio por WhatsApp');
    o = await txt(A, 'Restaurante Doña Rosa');
    check(/2️⃣/.test(ultimo(o)), 'responde el nombre → pregunta el NIT');
    o = await txt(A, 'no sé');
    check(/solo con números/.test(ultimo(o)) && store.getLead(A).capturaSanidad.paso === 1, 'NIT no válido: lo vuelve a pedir');
    for (const r of ['900123456-7', 'Calle 50 # 20-10', 'Cali', 'este']) o = await txt(A, r);
    check(/6️⃣/.test(ultimo(o)), 'teléfono "este": usa el número del chat y pregunta el tipo de negocio');
    o = await txt(A, '9');
    check(/Responde con un número del 1 al 6/.test(ultimo(o)), 'tipo de negocio "9": pide un número válido');
    for (const r of ['1', 'Rosa Pérez', 'Rosa Pérez, Juan Gómez, Ana Ruiz', 'Nevera cocina, Vitrina bebidas', 'ninguno', '2', 'hoy']) o = await txt(A, r);
    check(/Revisa los datos/.test(ultimo(o)) && /Restaurante Doña Rosa/.test(ultimo(o)) && /Nevera cocina, Vitrina bebidas/.test(ultimo(o)) && /acueducto con tanque/.test(ultimo(o)), 'resumen con todos los datos');
    o = await txt(A, '3');
    check(/3️⃣/.test(ultimo(o)), 'escribe "3" en el resumen: vuelve a la dirección');
    o = await txt(A, 'Avenida 6N # 25-30');
    check(/Revisa los datos/.test(ultimo(o)) && /Avenida 6N # 25-30/.test(ultimo(o)), 'corrige y vuelve al resumen');
    o = await txt(A, 'sí');
    accA = accesos.completoDe(A, 'sanidad');
    check(accA.negocio && accA.negocio.nombre === 'Restaurante Doña Rosa' && accA.negocio.telefono === '3200000001' && accA.negocio.tipo === 'restaurante' && accA.negocio.manipuladores.length === 3 && accA.negocio.agua === 'tanque' && accA.negocioPor === 'whatsapp', 'SÍ: los datos quedan guardados en el acceso');
    check(/Ya generé tus documentos/.test(ultimo(o)) && new RegExp(`/acceso/${accA.token}`).test(ultimo(o)) && /lectura real/.test(ultimo(o)) && !store.getLead(A).capturaSanidad, 'avisa que los documentos están listos y cómo usarlos');
    o = await txt(A, 'no me abre el link');
    check(/Ya tienes tu compra activa/.test(ultimo(o)) && /Restaurante Doña Rosa/.test(ultimo(o)), 'comprador con datos: soporte con su enlace');

    // ------------------------------------------------------------------ upgrade Personalizado → Llave en Mano
    console.log('Paso al Llave en Mano');
    const accC = accesos.completoDe(C, 'sanidad');
    accesos.actualizar(accC.token, { negocio: datos.validar(NEGOCIO).datos });
    store.saveLead(C, { capturaSanidad: null });
    check(!D.generar('m_temperaturas', 'pdf', accC.negocio, accC.plan) && D.generar('f_temperaturas', 'pdf', accC.negocio, accC.plan), 'Personalizado: planillas en blanco sí; las de 4 meses no');
    const pgC = pagina.paginaCompleta(accesos.completoDe(C, 'sanidad'));
    check(/Pasar al Plan Llave en Mano por \$30\.000/.test(pgC) && /Mejorar por \$30\.000/.test(pgC) && /Tu plan: Plan Personalizado/.test(pgC), 'página: plan, candados y botón de mejora por $30.000');
    o = await txt(C, 'quiero pasar al llave en mano');
    check(cuentas(o) && /\*\$30\.000\*/.test(cuentas(o).t) && store.getLead(C).esperaUpgrade === 'llave', 'pide el Llave en Mano: cobra la diferencia ($30.000)');
    o = await pagar(C, 30000, 'C-UP');
    const accC2 = accesos.completoDe(C, 'sanidad');
    check(ocrMinimo === 30000 && accC2.plan === 'llave' && accC2.token === accC.token && accesos.deTelefono(C).filter((x) => x.tipo === 'completo').length === 1, 'pagó $30.000: el mismo enlace pasa a Llave en Mano');
    check(o.some((e) => /ya está en el \*Plan Llave en Mano/.test(e.t) && /planillas de 4 meses ya están listas/.test(e.t)), 'mensaje: sus planillas de 4 meses ya están listas');
    check(D.generar('m_temperaturas', 'pdf', accC2.negocio, accC2.plan), 'Llave en Mano: las planillas de 4 meses se desbloquean');

    // ------------------------------------------------------------------ seguimientos con descuento
    console.log('Seguimientos');
    const G = '573200000006';
    await txt(G, SALUDO, REF);
    store.obtenerConversacion(G).ultimoDelCliente = Date.now() - 2.1 * 3600e3;
    let n = enviados.length; await seg.ejecutarSeguimientos();
    const s1 = enviados.slice(n).filter((e) => e.to === G);
    check(s1.length === 1 && /\*\$39\.900\* en lugar de \$49\.900/.test(s1[0].t) && /\*\$69\.900\* en lugar de \$79\.900/.test(s1[0].t), 'sin plan: seguimiento 1 con el descuento de los 2 planes');
    o = await txt(G, '2');
    check(cuentas(o) && /\$69\.900/.test(cuentas(o).t), '"2" después del descuento: Llave en Mano por $69.900');
    await pagar(G, 69900, 'G69');
    check(ocrMinimo === 39900 || ocrMinimo === 49900, 'acepta desde el Personalizado');
    check(accesos.completoDe(G, 'sanidad').plan === 'llave', 'pagó $69.900: Llave en Mano');
    const H = '573200000007';
    await txt(H, SALUDO, REF);
    await boton(H, 'plan_personalizado', '📋 Plan $49.900');
    for (const [paso, h] of [[1, 2.1], [2, 4.1], [3, 6.1], [4, 19]]) {
      store.obtenerConversacion(H).ultimoDelCliente = Date.now() - h * 3600e3;
      store.saveLead(H, { ultimoSeguimiento: 0, seguimientosEnviados: paso - 1 });
      await seg.ejecutarSeguimientos();
    }
    const segH = enviados.filter((e) => e.to === H && e.tipo === 'texto').slice(-4).map((e) => e.t);
    check(/\*\$39\.900\* en lugar de \$49\.900/.test(segH[0]) && /\/prueba-sanidad/.test(segH[1]) && /certificados externos/.test(segH[2]) && /Último mensaje/.test(segH[3]) && /\$39\.900/.test(segH[3]), 'eligió Personalizado: seguimientos con $39.900, la vista previa y la aclaración de certificados');
    check(enviados.some((e) => e.to === H && e.tipo === 'imagen' && /sanidad_2_planillas/.test(e.t)), 'seguimiento 2 con la imagen de las planillas');
    await pagar(H, 39900, 'H39');
    check(accesos.completoDe(H, 'sanidad').plan === 'personalizado', 'pagó $39.900: Personalizado');

    // ------------------------------------------------------------------ cambio de producto
    console.log('Cambio de producto');
    const M = '573200000008';
    await txt(M, 'Hola, quiero los +2.000 Moldes de Costura en PDF', { source_id: '120250542591850743', headline: '+2.000 Moldes' });
    store.saveLead(M, { plan: 'master', descuentoPlanes: true });
    o = await txt(M, 'y tienen el plan de saneamiento para restaurantes?');
    const lm = store.getLead(M);
    check(lm.producto === 'sanidad' && !lm.plan && !lm.descuentoPlanes && o.some((e) => e.tipo === 'botones' && /Plan Llave en Mano/.test(e.t)), 'moldes → sanidad: cambia, limpia el plan de moldes y presenta los 2 planes');

    // ------------------------------------------------------------------ documentos
    console.log('Documentos');
    const v = datos.validar(NEGOCIO);
    check(v.ok, 'datos completos: válidos');
    const malos = datos.validar({ nombre: 'X', nit: 'abc', direccion: '', ciudad: '', telefono: '1', tipo: 'otro_x', encargado: '', manipuladores: '', refrigeracion: '' });
    check(!malos.ok && ['nombre', 'nit', 'direccion', 'ciudad', 'telefono', 'tipo', 'encargado', 'manipuladores', 'refrigeracion', 'autoriza'].every((k) => malos.errores[k]), 'datos incompletos: un mensaje por campo y pide la autorización');
    const d = v.datos;
    check(d.manipuladores.join('|') === 'Rosa Elena Gil|Andrés Mejía|Sofía Ruiz' && d.hipoclorito === 5.25 && d.areas.includes('panaderia'), 'listas por línea, hipoclorito con coma y áreas según el tipo de negocio');
    let todosOk = true, conNombre = true;
    const tam = {};
    for (const dc of D.CATALOGO) {
      for (const f of dc.formatos) {
        const g = D.generar(dc.id, f, d, 'llave');
        if (!g) { todosOk = false; continue; }
        tam[dc.id + '.' + f] = g.datos.length;
        if (f === 'pdf') {
          if (!pdfValido(g.datos)) todosOk = false;
          const t = textoPDF(g.datos);
          if (!t.includes('Panadería La Espiga Dorada') || (dc.id !== 'carteles' && !t.includes('900.555.123-4'))) conNombre = false;
        } else if (!(g.datos[0] === 0x50 && g.datos[1] === 0x4b)) todosOk = false;
      }
    }
    check(todosOk, `los ${D.CATALOGO.reduce((k, x) => k + x.formatos.length, 0)} documentos se generan y cada PDF es válido (tabla xref correcta)`);
    check(conNombre, 'todos los PDF llevan el nombre del negocio, y todos menos los carteles, el NIT');
    const plan = D.generar('plan', 'pdf', d, 'personalizado');
    const tp = textoPDF(plan.datos);
    check(['Programa de Limpieza y Desinfección', 'Programa de Manejo de Residuos Sólidos', 'Programa de Control Integral de Plagas', 'Programa de Abastecimiento de Agua Potable', 'POES por superficie y equipo', 'Resolución 2674 de 2013', 'Resolución 2184 de 2019', '0,3 a 2,0 mg/L', 'Rosa Elena Gil', 'Control Total S.A.S.', 'Nevera pastelería'].every((x) => tp.includes(Buffer.from(x, 'latin1').toString('latin1'))),
      'plan: los 4 programas, POES, normas, valores del agua, responsables, empresa de plagas y equipos del negocio');
    check(tp.includes('3,8 mL') && tp.includes('Mesa de amasado'), 'soluciones calculadas con el hipoclorito del negocio (200 ppm al 5,25 % = 3,8 mL/L) y POES de panadería');
    const ci = F.ciclo(d.inicio, 4);
    const temp = D.generar('m_temperaturas', 'pdf', d, 'llave');
    const tt = textoPDF(temp.datos);
    check(paginasPDF(temp.datos) >= 3 * ci.porMes.length && tt.includes(F.dia(ci.ini)) && tt.includes(F.dia(ci.fin)) && tt.includes('Vitrina de tortas') && tt.includes('Congelador de masas'), `temperaturas de 4 meses: una hoja por equipo y mes, del ${F.corta(ci.ini)} al ${F.corta(ci.fin)}`);
    check(ci.dias.length >= 119 && ci.dias.length <= 123 && F.iso(F.masDias(F.masMeses(ci.ini, 4), -1)) === F.iso(ci.fin), 'el ciclo cubre 4 meses exactos');
    const filas = (() => { let k = 0; for (const h of require(R + 'sanidad/planillas').hojas('temperaturas', d, 'meses')) k += h.filas.length; return k; })();
    check(filas === 3 * ci.dias.length, 'temperaturas: una fila por día y por equipo, sin lecturas escritas');
    const lecturasVacias = require(R + 'sanidad/planillas').hojas('temperaturas', d, 'meses').every((h) => h.filas.every((f) => f[2] === '' && f[4] === '' && f[8] === ''));
    check(lecturasVacias, 'las lecturas y las firmas quedan para escribirlas el día real');
    const blanco = D.generar('f_temperaturas', 'pdf', d, 'personalizado');
    check(paginasPDF(blanco.datos) === 3 && textoPDF(blanco.datos).includes('Mes: ___'), 'planilla en blanco: una hoja por equipo, con mes y año por llenar');
    const docx = D.generar('plan', 'docx', d, 'personalizado');
    const zipStr = docx.datos.toString('latin1');
    check(/word\/document\.xml/.test(zipStr) && /application\/vnd\.openxmlformats-officedocument\.wordprocessingml/.test(docx.tipo), 'plan en Word (.docx)');
    const todo = D.zipTodo(d, 'llave');
    const nombres = (todo.datos.toString('latin1').match(/[1-4]_[A-Za-z_0-9]+\/[\w.-]+\.(pdf|docx)/g) || []);
    const unicos = [...new Set(nombres)];
    check(unicos.length === 25 && unicos.some((x) => x.startsWith('4_Planillas_4_meses/')), 'ZIP del Llave en Mano: 25 archivos en 4 carpetas');
    check([...new Set((D.zipTodo(d, 'personalizado').datos.toString('latin1').match(/[1-4]_[A-Za-z_0-9]+\/[\w.-]+\.(pdf|docx)/g) || []))].length === 15, 'ZIP del Personalizado: 15 archivos, sin las planillas de 4 meses');
    const muestra = D.muestra({ nombre: 'Comidas Rápidas El Paisa', nit: '1020304050' });
    check(pdfValido(muestra) && paginasPDF(muestra) === 1 && textoPDF(muestra).includes('Comidas Rápidas El Paisa') && textoPDF(muestra).includes('Muestra gratis') && textoPDF(muestra).includes('RECEPCIÓN DE MATERIAS PRIMAS'), 'muestra gratis: 1 hoja de recepción con el nombre y NIT');
    check(/<svg/.test(D.muestra({ nombre: 'A<b>c', nit: '123456' }, 'svg')) && !/<b>/.test(D.muestra({ nombre: 'A<b>c', nit: '123456' }, 'svg')), 'vista previa en SVG con el texto escapado');

    // ------------------------------------------------------------------ rutas web
    console.log('Rutas web');
    const express = require('express');
    const app = express();
    app.use(express.urlencoded({ extended: true }));
    const avisos = [];
    require(R + 'sanidad/rutas').montar(app, { alGuardar: (a, primera) => { avisos.push([a.token, primera]); return flow.avisarDocumentosSanidad(accesos.completoDe(a.phone, 'sanidad'), primera); } });
    servidor = app.listen(0);
    const puerto = servidor.address().port;
    let r = await pedir(puerto, 'GET', '/prueba-sanidad');
    const html = r.body.toString();
    check(r.status === 200 && /Prueba tu planilla antes de pagar/.test(html) && (html.match(/🔒/g) || []).length === D.CATALOGO.length - 1 && /GRATIS/.test(html) && /fumigación/.test(html), 'vista previa: todo el paquete con candado, una planilla gratis y la aclaración de certificados');
    r = await pedir(puerto, 'GET', `/prueba-sanidad/planilla.svg?${new URLSearchParams({ nombre: 'Cafetería Central', nit: '800111222-3' })}`);
    check(r.status === 200 && /image\/svg/.test(r.headers['content-type']) && /Cafetería Central/.test(r.body.toString()), 'vista previa al instante (SVG) con el nombre del negocio');
    r = await pedir(puerto, 'POST', '/prueba-sanidad/planilla.pdf', { nombre: 'Cafetería Central', nit: '800111222-3', ciudad: 'Pasto' });
    check(r.status === 200 && r.headers['content-type'] === 'application/pdf' && pdfValido(r.body) && textoPDF(r.body).includes('Pasto'), 'descarga gratis del PDF con los datos escritos');
    r = await pedir(puerto, 'POST', '/prueba-sanidad/planilla.pdf', { nombre: '', nit: 'xx' });
    check(r.status === 400, 'sin nombre o con NIT no válido: no genera');

    const J = '573200000009';
    await txt(J, SALUDO, REF); await txt(J, '1'); await pagar(J, 49900, 'J49');
    const accJ = accesos.completoDe(J, 'sanidad');
    r = await pedir(puerto, 'GET', `/s/${accJ.token}/plan.pdf`);
    check(r.status === 302 && /\/acceso\//.test(r.headers.location), 'sin datos guardados: los documentos llevan al formulario');
    check(/Generar mis documentos/.test(pagina.paginaCompleta(accJ)) && /escribe <b>DATOS<\/b>/.test(pagina.paginaCompleta(accJ)), 'página sin datos: formulario y opción de hacerlo por WhatsApp');
    r = await pedir(puerto, 'POST', `/acceso/${accJ.token}/datos`, { ...NEGOCIO, nit: 'abc', autoriza: '' });
    check(r.status === 400 && /solo con números/.test(r.body.toString()) && /Panadería La Espiga Dorada/.test(r.body.toString()) && /Para generar los documentos necesitamos tu autorización/.test(r.body.toString()), 'formulario con errores: los muestra y conserva lo escrito');
    r = await pedir(puerto, 'POST', `/acceso/${accJ.token}/datos`, NEGOCIO);
    const accJ2 = accesos.completoDe(J, 'sanidad');
    check(r.status === 303 && /\?ok=1/.test(r.headers.location) && accJ2.negocio && accJ2.negocio.nombre === 'Panadería La Espiga Dorada' && accJ2.negocioPor === 'web' && !store.getLead(J).capturaSanidad, 'formulario válido: guarda los datos y cierra las preguntas de WhatsApp');
    await new Promise((ok) => setTimeout(ok, 30));
    check(avisos.length === 1 && enviados.some((e) => e.to === J && /Ya generé tus documentos con los datos de \*Panadería La Espiga Dorada\*/.test(e.t)), 'al guardar en la web le llega el aviso por WhatsApp');
    const pgJ = pagina.paginaCompleta(accJ2, { guardado: true });
    check(/¡Listo!/.test(pgJ) && /Descargar todo en un ZIP/.test(pgJ) && /\/s\/[^"]+\/plan\.docx/.test(pgJ) && /Corregir los datos del negocio/.test(pgJ), 'página con datos: documentos PDF y Word, ZIP y corregir datos');
    r = await pedir(puerto, 'GET', `/s/${accJ.token}/plan.pdf`);
    check(r.status === 200 && pdfValido(r.body) && /inline/.test(r.headers['content-disposition']), 'descarga el plan en PDF');
    r = await pedir(puerto, 'GET', `/s/${accJ.token}/plan.docx`);
    check(r.status === 200 && /attachment/.test(r.headers['content-disposition']) && /\.docx"/.test(r.headers['content-disposition']), 'descarga el plan en Word');
    r = await pedir(puerto, 'GET', `/s/${accJ.token}/m_temperaturas.pdf`);
    check(r.status === 403, 'Personalizado: las planillas de 4 meses responden 403');
    r = await pedir(puerto, 'GET', `/s/${accJ.token}/todo.zip`);
    check(r.status === 200 && r.headers['content-type'] === 'application/zip' && r.body.readUInt32LE(0) === 0x04034b50, 'descarga todo en ZIP');
    r = await pedir(puerto, 'GET', `/s/${accJ.token}/..%2F..%2Fpackage.json`);
    check(r.status === 404, 'nombres de archivo raros: 404');
    r = await pedir(puerto, 'GET', '/s/tokenquenoexiste/plan.pdf');
    check(r.status === 404, 'token que no existe: 404');
    const moldes = accesos.crear('573200000099', 'moldes', 'completo');
    r = await pedir(puerto, 'GET', `/s/${moldes.token}/plan.pdf`);
    check(r.status === 302, 'un acceso de moldes no abre documentos de sanidad');
    for (let k = 0; k < datos.MAX_EDICIONES; k++) await pedir(puerto, 'POST', `/acceso/${accJ.token}/datos`, { ...NEGOCIO, nombre: `Negocio ${k}` });
    r = await pedir(puerto, 'POST', `/acceso/${accJ.token}/datos`, { ...NEGOCIO, nombre: 'Otro negocio más' });
    check(r.status === 403 && accesos.completoDe(J, 'sanidad').negocio.nombre === `Negocio ${datos.MAX_EDICIONES - 1}` && /Ya usaste los/.test(r.body.toString()), `máximo ${datos.MAX_EDICIONES} cambios de datos por compra (para que no se use en otros negocios)`);
    let limitado = false;
    for (let k = 0; k < 45 && !limitado; k++) limitado = (await pedir(puerto, 'GET', `/prueba-sanidad/planilla.svg?nombre=Test&nit=123456`)).status === 429;
    check(limitado, 'la vista previa pública tiene límite por IP');

    // ------------------------------------------------------------------ PDF: caracteres del español
    const p = new PDF(); p.pagina().texto(10, 10, '¿Año? ñandú °C ≤ 4 – «sí» 🚀');
    const t = textoPDF(p.buffer());
    check(t.includes('¿Año? ñandú °C <= 4 – «sí»') && !t.includes('🚀'), 'PDF: tildes, ñ, ¿, °, « » y – se conservan; los emojis se quitan');
  } finally {
    if (servidor) servidor.close();
  }
  console.log(`\n${fallos ? '✘ ' + fallos + ' fallos' : '✔ todo correcto'}`);
  process.exit(fallos ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
