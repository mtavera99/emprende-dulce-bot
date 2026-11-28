// Pruebas de los planes de moldes (Básico $10.000 · Emprendedor $15.000 · Taller Master $20.000).
//   node scripts/test_planes.js
// Como el contenido premium todavía no existe, la prueba crea colecciones premium de mentira
// (archivos _test_* que se borran al final) y apunta MOLDES_PREMIUM a un premium.json temporal.
const fs = require('fs');
const os = require('os');
const path = require('path');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'planes-'));
process.env.DATA_DIR = TMP;
process.env.MOLDES_PREMIUM = path.join(TMP, 'sin_premium.json');   // primero, el bot sin contenido premium
delete process.env.GEMINI_API_KEY; delete process.env.OPENAI_API_KEY; delete process.env.META_ACCESS_TOKEN;
process.env.UPSELL_MINUTOS = '600';
process.env.SILENCIO_DESDE = '23'; process.env.SILENCIO_HASTA = '23';
const R = path.join(__dirname, '../src/');
const DIR_PREMIUM = path.join(__dirname, '../public/descargas/moldes/premium');
const ARCHIVOS = ['_test_P01_Tallas_Grandes.zip', '_test_P02_Deportiva_Pro.zip', '_test_P03_Taller_Master.zip', '_test_Bono_Pack_Emprendedor.pdf'];

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
const planes = require(R + 'planes');
const accesos = require(R + 'accesos');
const pagina = require(R + 'paginaAcceso');

let fallos = 0;
const check = (c, m) => { console.log((c ? '  ✔ ' : '  ✘ ') + m); if (!c) fallos++; };
const REF = { source_id: '120250542591850743', headline: '+2.000 Moldes' };
const SALUDO = 'Hola, quiero los +2.000 Moldes de Costura en PDF';
async function txt(phone, body, referral) {
  const n = enviados.length;
  await flow.handleIncomingMessage(phone, { type: 'text', text: { body }, ...(referral ? { referral } : {}) });
  return enviados.slice(n);
}
async function boton(phone, id, title) {
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

(async () => {
  try {
    console.log('Sin contenido premium (hoy)');
    check(!planes.hayPlanes() && planes.disponibles().join() === 'basico', 'solo existe el Plan Básico: el bot vende como siempre');
    let o = await txt('573100000001', SALUDO, REF);
    check(o[1].tipo === 'botones' && /2\.420 moldes/.test(o[1].t) && o[1].botones.map((b) => b.id).join() === 'comprar,muestra', 'pitch de moldes sin cambios (Comprar $10.000 / Muestra gratis)');
    check(planes.deMonto(20000) === 'basico', 'un pago de $20.000 sin planes activos entrega el Básico');

    // ------------------------------------------------------------ contenido premium de prueba
    fs.mkdirSync(DIR_PREMIUM, { recursive: true });
    for (const f of ARCHIVOS) fs.writeFileSync(path.join(DIR_PREMIUM, f), 'PK prueba');
    fs.writeFileSync(path.join(TMP, 'premium.json'), JSON.stringify({
      premium: [
        { id: 'p01', plan: 'emprendedor', titulo: 'Tallas grandes 3XL–5XL', zip: 'premium/_test_P01_Tallas_Grandes.zip', prendas: [{ carpeta: 'x', nombre: 'Vestido 3XL' }], moldes_imprimibles: 1800 },
        { id: 'p02', plan: 'emprendedor', titulo: 'Deportiva Pro', zip: 'premium/_test_P02_Deportiva_Pro.zip', prendas: [{ carpeta: 'y', nombre: 'Enterizo' }], moldes_imprimibles: 1700 },
        { id: 'p03', plan: 'master', titulo: 'Taller Master', zip: 'premium/_test_P03_Taller_Master.zip', prendas: [{ carpeta: 'z', nombre: 'Corsé' }], moldes_imprimibles: 1000 },
        { id: 'p99', plan: 'master', titulo: 'No existe', zip: 'premium/no_existe.zip', moldes_imprimibles: 9999 },
      ],
      bonosPremium: [{ plan: 'master', titulo: 'Pack Emprendedor', archivo: 'premium/_test_Bono_Pack_Emprendedor.pdf' }],
    }));
    process.env.MOLDES_PREMIUM = path.join(TMP, 'premium.json');

    console.log('Planes');
    check(planes.disponibles().join() === 'basico,emprendedor,master', 'con contenido premium: 3 planes');
    check(planes.moldesDe('basico') === 2420 && planes.extraDe('emprendedor') === 3500 && planes.extraDe('master') === 4500, 'cifras desde el contenido real: +3.500 Emprendedor, +4.500 Master (ignora la colección que no existe)');
    const precios = ['basico', 'emprendedor', 'master'].map((p) => [ventas.precioNormal('moldes', p), ventas.precioDescuento('moldes', p)]);
    check(JSON.stringify(precios) === '[[10000,8000],[15000,13000],[20000,17000]]', 'precios $10.000/$8.000 · $15.000/$13.000 · $20.000/$17.000');
    check([[8000, 'basico'], [10000, 'basico'], [12999, 'basico'], [13000, 'emprendedor'], [15000, 'emprendedor'], [17000, 'master'], [20000, 'master'], [25000, 'master']].every(([m, p]) => planes.deMonto(m) === p), 'plan por monto: $8k/$10k Básico · $13k/$15k Emprendedor · $17k/$20k Master');
    check(ventas.precioNormal('muebles') === 15000 && ventas.precioNormal('helados') === 10000 && ventas.precioNormal('muebles', 'master') === 15000, 'muebles y postres no cambian');
    check(ventas.botonesPitch('moldes').every((b) => b.title.length <= 20), 'botones de planes de máximo 20 caracteres');

    console.log('Primer mensaje');
    const A = '573100000010';
    o = await txt(A, SALUDO, REF);
    const p = o.find((e) => e.tipo === 'botones');
    check(p && /Plan Básico\* · \$10\.000/.test(p.t) && /Plan Emprendedor\* · \$15\.000 \(recomendado\)/.test(p.t) && /Plan Taller Master\* · \$20\.000 \(el más completo\)/.test(p.t), 'anuncio general: las 3 opciones, $15.000 recomendado y $20.000 el más completo');
    check(p.botones.map((b) => b.id).join() === 'plan_basico,plan_emprendedor,plan_master' && /MUESTRA/.test(p.t) && store.getLead(A).step === 'PLANES_ENVIADOS', '3 botones de plan y la muestra por texto');
    o = await boton(A, 'plan_emprendedor', '⭐ Popular · $15.000');
    check(cuentas(o) && /\$15\.000\* \(Plan Emprendedor\)/.test(cuentas(o).t) && store.getLead(A).plan === 'emprendedor', 'botón Emprendedor: cuentas por $15.000');
    const B = '573100000011';
    await txt(B, SALUDO, REF);
    o = await txt(B, '3');
    check(cuentas(o) && /\$20\.000/.test(cuentas(o).t) && store.getLead(B).plan === 'master', 'responder "3": Taller Master por $20.000');
    const C = '573100000012';
    await txt(C, SALUDO, REF);
    o = await txt(C, 'quiero el de 15');
    check(cuentas(o) && /\$15\.000/.test(cuentas(o).t), '"quiero el de 15": cuentas por $15.000');
    const D = '573100000013';
    o = await txt(D, 'Hola, quiero el Taller Master de moldes por $20.000', REF);
    const pm = o.find((e) => e.tipo === 'botones');
    check(pm && /Plan Taller Master/.test(pm.t) && /\$20\.000/.test(pm.t) && /desde \$10\.000/.test(pm.t) && pm.botones[0].id === 'plan_master' && pm.botones[2].id === 'ver_planes', 'anuncio de $20.000: primero el Taller Master (y menciona planes desde $10.000)');
    o = await txt(D, '1');
    check(cuentas(o) && /\$20\.000/.test(cuentas(o).t), 'enfoque Master: "1" manda las cuentas por $20.000');
    const D2 = '573100000014';
    await txt(D2, 'Hola, vi el anuncio de moldes por 20 mil', REF);
    o = await boton(D2, 'ver_planes', 'Ver los planes');
    check(o.some((e) => e.tipo === 'botones' && e.botones.length === 3 && /recomendado/.test(e.t)), 'enfoque Master: "Ver los planes" muestra las 3 opciones');
    const E = '573100000015';
    await txt(E, SALUDO, REF);
    o = await txt(E, 'como pago');
    check(cuentas(o) && /Plan Básico: \*\$10\.000\*/.test(cuentas(o).t) && /Plan Emprendedor: \*\$15\.000\*/.test(cuentas(o).t) && /Plan Taller Master: \*\$20\.000\*/.test(cuentas(o).t), 'pide pagar sin elegir: cuentas con los 3 valores');
    o = await txt(E, 'MUESTRA');
    check(o.some((e) => e.tipo === 'doc'), 'la muestra gratis sigue funcionando');

    console.log('Comprobante → plan');
    o = await pagar(E, 15000, 'E15');
    const accE = accesos.completoDe(E, 'moldes');
    check(accE && accE.plan === 'emprendedor' && store.pedidosDeTelefono(E).some((x) => x.plan === 'emprendedor'), 'pagó $15.000 sin elegir: acceso y pedido en Plan Emprendedor');
    check(o.some((e) => /Plan Emprendedor/.test(e.t) && /5\.920 moldes/.test(e.t)), 'mensaje de entrega con el plan y sus moldes');
    check(accesos.archivoPermitido(accE, 'p01') && accesos.archivoPermitido(accE, 'p02') && !accesos.archivoPermitido(accE, 'p03') && !accesos.archivoPermitido(accE, 'bp1') && accesos.archivoPermitido(accE, 'b4'), 'Emprendedor: abre sus colecciones premium y los 4 bonos; Master y su bono quedan bloqueados');
    const pg = pagina.paginaCompleta(accE);
    check(/Tu plan: Plan Emprendedor/.test(pg) && /Pasar al Plan Taller Master por \$5\.000/.test(pg) && /Mejorar por \$5\.000/.test(pg), 'página: muestra el plan y el botón de upgrade por la diferencia');
    o = await pagar(A, 15000, 'A15');
    check(accesos.completoDe(A, 'moldes').plan === 'emprendedor', 'eligió Emprendedor y pagó $15.000: Emprendedor');
    o = await pagar(B, 10000, 'B10');
    check(accesos.completoDe(B, 'moldes').plan === 'basico' && !accesos.archivoPermitido(accesos.completoDe(B, 'moldes'), 'p01'), 'eligió Master pero pagó $10.000: recibe el Básico (premium bloqueado)');
    check(ocrMinimo === 10000, 'el mínimo aceptado sigue siendo el del Básico');
    o = await pagar(D, 20000, 'D20');
    const accD = accesos.completoDe(D, 'moldes');
    check(accD.plan === 'master' && ['p01', 'p02', 'p03', 'bp1', 'b1'].every((id) => accesos.archivoPermitido(accD, id)) && !/Pasar al/.test(pagina.paginaCompleta(accD)), 'pagó $20.000: Master con todo desbloqueado y sin botón de upgrade');
    const viejo = accesos.crear('573100000099', 'moldes', 'completo');
    check(!viejo.plan && accesos.archivoPermitido(viejo, 'b1') && !accesos.archivoPermitido(viejo, 'p01'), 'compradores anteriores (sin plan) = Básico, con sus 4 bonos');

    console.log('Upgrade');
    o = await txt(B, 'quiero mejorar mi plan al master');
    check(cuentas(o) && /\$10\.000/.test(cuentas(o).t) && /Plan Taller Master/.test(cuentas(o).t) && store.getLead(B).esperaUpgrade === 'master', 'Básico → Master: cobra la diferencia ($10.000)');
    o = await pagar(B, 10000, 'B10');
    check(/compra que ya tienes|tu compra/.test(o[o.length - 1].t) && accesos.completoDe(B, 'moldes').plan === 'basico', 'el comprobante viejo no sube el plan');
    o = await pagar(B, 10000, 'B-UP');
    check(ocrMinimo === 10000 && accesos.completoDe(B, 'moldes').plan === 'master' && o.some((e) => /ya está en el \*Plan Taller Master/.test(e.t)), 'pagó la diferencia: el mismo enlace pasa a Master');
    check(accesos.deTelefono(B).filter((x) => x.tipo === 'completo').length === 1, 'sigue siendo un solo enlace');

    console.log('Seguimientos');
    const F = '573100000016';
    await txt(F, SALUDO, REF);
    store.obtenerConversacion(F).ultimoDelCliente = Date.now() - 2.1 * 3600e3;
    let n = enviados.length; await seg.ejecutarSeguimientos();
    const s1 = enviados.slice(n).filter((e) => e.to === F);
    check(s1.length === 1 && /\*\$8\.000\* en lugar de \$10\.000/.test(s1[0].t) && /\*\$13\.000\* en lugar de \$15\.000/.test(s1[0].t) && /\*\$17\.000\* en lugar de \$20\.000/.test(s1[0].t), 'sin plan elegido: seguimiento 1 con el descuento de los 3 planes');
    o = await txt(F, '2');
    check(cuentas(o) && /\$13\.000/.test(cuentas(o).t), '"2" después del descuento: Emprendedor por $13.000');
    o = await pagar(F, 13000, 'F13');
    check(accesos.completoDe(F, 'moldes').plan === 'emprendedor', 'pagó $13.000: Emprendedor');
    const G = '573100000017';
    await txt(G, SALUDO, REF);
    await boton(G, 'plan_master', '👑 Master · $20.000');
    store.obtenerConversacion(G).ultimoDelCliente = Date.now() - 2.1 * 3600e3;
    n = enviados.length; await seg.ejecutarSeguimientos();
    const s1G = enviados.slice(n).filter((e) => e.to === G);
    check(s1G.length === 1 && /\*\$17\.000\* en lugar de \$20\.000/.test(s1G[0].t), 'eligió Master: seguimiento con $17.000 en lugar de $20.000');
    for (const [paso, h] of [[2, 4.1], [3, 6.1], [4, 19]]) { store.obtenerConversacion(G).ultimoDelCliente = Date.now() - h * 3600e3; store.saveLead(G, { ultimoSeguimiento: 0, seguimientosEnviados: paso - 1 }); await seg.ejecutarSeguimientos(); }
    const s4 = enviados.filter((e) => e.to === G && /Último mensaje/.test(e.t)).pop();
    check(s4 && /\$17\.000/.test(s4.t), 'seguimiento 4/4 con el precio del plan ($17.000)');
    o = await txt(G, 'HONESTIDAD');
    check(/prueba\//.test(o[0].t) && /\$17\.000/.test(o[0].t), 'HONESTIDAD con el precio del plan');

    // ------------------------------------------------------------ contenido premium real (public/descargas/moldes/premium.json)
    console.log('Contenido premium real');
    const REAL = path.join(__dirname, '../public/descargas/moldes/premium.json');
    if (!fs.existsSync(REAL)) {
      console.log('  (no hay premium.json en el repositorio: se omite)');
    } else {
      process.env.MOLDES_PREMIUM = REAL;
      const datos = JSON.parse(fs.readFileSync(REAL, 'utf8'));
      const suma = (plan) => datos.premium.filter((c) => planes.rango(c.plan) <= planes.rango(plan)).reduce((n, c) => n + c.moldes_imprimibles, 0);
      check(planes.disponibles().join() === 'basico,emprendedor,master' && planes.premium().length === datos.premium.length && planes.bonosPremium().length === datos.bonosPremium.length,
        'todos los ZIP y bonos de premium.json existen: 3 planes a la venta');
      check(planes.moldesDe('emprendedor') === 2420 + suma('emprendedor') && planes.moldesDe('master') === 2420 + suma('master'),
        `cifras reales: Básico 2.420 · Emprendedor ${planes.moldesDe('emprendedor').toLocaleString('es-CO')} · Taller Master ${planes.moldesDe('master').toLocaleString('es-CO')}`);
      check(datos.premium.every((c) => c.moldes_imprimibles === 2 * c.moldes && c.moldes === c.prendas.reduce((n, p) => n + p.moldes, 0)),
        'premium.json: moldes imprimibles = 2 × (piezas × tallas), sumados prenda por prenda');
      const items = accesos.contenido('moldes').items;
      let okZip = true, okOrden = true, detalle = '';
      for (const c of datos.premium) {
        const mb = fs.statSync(path.join(__dirname, '../public/descargas/moldes', c.zip)).size / 1e6;
        const grupos = accesos.pdfsDe(items.find((it) => it.id === c.id));
        const completo = mb < 95 && grupos.length === c.prendas.length && grupos.every((g) => {
          const p = c.prendas.find((x) => x.carpeta === g.carpeta);
          return p && g.ficha && g.carta.length === p.n_tallas && g.a4.length === p.n_tallas;
        });
        if (!completo) { okZip = false; detalle += ` ${c.id}`; }
        const tallas = grupos[0] ? grupos[0].carta.map((x) => x.talla).join() : '';
        if (!(tallas === '3XL,4XL,5XL' || tallas === 'XS,S,M,L,XL,XXL,3XL,4XL,5XL')) { okOrden = false; detalle += ` ${c.id}:${tallas}`; }
      }
      check(okZip, `cada ZIP (< 95 MB) trae la ficha y el PDF Carta y A4 de cada talla de cada prenda${detalle}`);
      check(okOrden, 'en la página las tallas salen en orden (XS … XXL, 3XL, 4XL, 5XL)');
      const t = ventas.textoPlanes({});
      const fmt = (x) => x.toLocaleString('es-CO');
      check(t.includes(`${fmt(planes.moldesDe('emprendedor'))} moldes`) && t.includes(`${fmt(planes.moldesDe('master'))} moldes`) && /tallas 3XL–5XL/.test(t) && /corsetería/.test(t) && /Pack Emprendedor/.test(t),
        'primer mensaje con las cifras exactas y lo que trae cada plan');
      const accR = accesos.crear('573100000201', 'moldes', 'completo', { plan: 'emprendedor' });
      const emp = datos.premium.filter((c) => c.plan === 'emprendedor').map((c) => c.id);
      const mas = datos.premium.filter((c) => c.plan === 'master').map((c) => c.id);
      check(emp.every((id) => accesos.archivoPermitido(accR, id)) && mas.every((id) => !accesos.archivoPermitido(accR, id)) && !accesos.archivoPermitido(accR, 'bp1'),
        'Emprendedor real: abre tallas grandes, licra y corsetería; la colección Pro y el bono Pack Emprendedor quedan para el Master');
      const accM = accesos.crear('573100000202', 'moldes', 'completo', { plan: 'master' });
      check([...emp, ...mas, 'bp1', 'b1', 'b4'].every((id) => accesos.archivoPermitido(accM, id)), 'Taller Master real: todo desbloqueado');
    }
    check(planes.enfoqueMaster('Hola, quiero los moldes por $10.000', '120250669096430743') === true
      && planes.enfoqueMaster('Hola, quiero los moldes por $10.000', '120250669096410743') === true
      && planes.enfoqueMaster('Hola, quiero los moldes por $10.000', '999999') === false,
      'ad_id de anuncios $20.000 fuerza enfoqueMaster aunque la plantilla diga $10.000');
  } finally {
    for (const f of ARCHIVOS) fs.rmSync(path.join(DIR_PREMIUM, f), { force: true });
    try { fs.rmdirSync(DIR_PREMIUM); } catch (_) {}
  }
  console.log(`\n${fallos ? '✘ ' + fallos + ' fallos' : '✔ todo correcto'}`);
  process.exit(fallos ? 1 : 0);
})().catch((e) => { console.error(e); for (const f of ARCHIVOS) fs.rmSync(path.join(DIR_PREMIUM, f), { force: true }); process.exit(1); });
