// Pruebas del pack de muebles: motor de despiece, optimizador de cortes, archivos generados y portal.
//   node scripts/test_muebles.js
const fs = require('fs');
const os = require('os');
const path = require('path');
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'muebles-'));
// Sin contenido premium: se prueba el embudo base (los planes se prueban en test_planes.js)
process.env.MOLDES_PREMIUM = path.join(process.env.DATA_DIR, 'sin_premium.json');
const M = require('../src/muebles/motor');
const D = require('../src/muebles/dibujo');
const PUB = path.join(__dirname, '../public/descargas');

let fallos = 0;
function check(cond, msg) { console.log((cond ? '  ✔ ' : '  ✘ ') + msg); if (!cond) fallos++; }
const fams = M.catalogo();
const items = fams.flatMap((f) => f.items.map((it) => ({ it, f })));

console.log('Catálogo');
check(fams.length === 5, '5 categorías');
check(items.length === M.contar() && items.length >= 2500 && items.length <= 3000, `${items.length} planos (entre 2.500 y 3.000)`);
check(new Set(items.map((x) => x.it.cod)).size === items.length, 'códigos únicos');
check(M.disenos().length === 40 && new Set(items.map((x) => x.it.diseno)).size === 40, `${M.disenos().length} diseños base`);
check(fams.every((f) => f.disenos.reduce((n, d) => n + d.items.length, 0) === f.items.length), 'cada plano pertenece a un diseño');
check(new Set(items.map((x) => JSON.stringify([x.it.diseno, x.it.spec]))).size === items.length, 'no hay dos planos con el mismo diseño y las mismas medidas');

console.log('Cada plano');
const t0 = Date.now();
const malos = { construye: [], medidas: [], caben: [], cortes: [], pasos: [], svg: [], limites: [] };
for (const { it } of items) {
  let r;
  try { r = M.construir(it); } catch (e) { malos.construye.push(`${it.cod}: ${e.message}`); continue; }
  if (!r.piezas.length || r.piezas.some((p) => !(p.largo > 0 && p.ancho > 0 && p.cant > 0 && Number.isFinite(p.largo + p.ancho)))) malos.medidas.push(it.cod);
  if (r.optimizacion.noCaben.length || r.tableros < 1) malos.caben.push(it.cod);
  // El optimizador: piezas dentro del tablero, sin superponerse, y todas las piezas de melamina ubicadas
  const o = r.optimizacion;
  const total = r.piezas.filter((p) => p.material === 'melamina').reduce((n, p) => n + p.cant, 0);
  const ubicadas = o.tableros.reduce((n, t) => n + t.piezas.length, 0);
  let ok = ubicadas === total;
  for (const t of o.tableros) {
    for (const p of t.piezas) if (p.x < 0 || p.y < 0 || p.x + p.w > o.W + 0.01 || p.y + p.h > o.H + 0.01) ok = false;
    for (let i = 0; i < t.piezas.length; i++) for (let j = i + 1; j < t.piezas.length; j++) {
      const a = t.piezas[i], b = t.piezas[j];
      if (a.x < b.x + b.w - 0.01 && b.x < a.x + a.w - 0.01 && a.y < b.y + b.h - 0.01 && b.y < a.y + a.h - 0.01) ok = false;
    }
  }
  if (!ok) malos.cortes.push(it.cod);
  if (M.pasos(it, r).length < 3) malos.pasos.push(it.cod);
  // Límites prácticos: puertas de máximo 620 mm, entrepaños sueltos de 15 mm de máximo 900 mm, cajones de máximo 1 m
  for (const p of r.piezas) {
    if (/^Puerta( superior| inferior)?$|· Puerta$/.test(p.nombre) && p.ancho > 620) malos.limites.push(`${it.cod} puerta ${p.ancho}`);
    if (/^Entrepaño$|Entrepaño maletero|· Entrepaño$/.test(p.nombre) && r.e === 15 && p.largo > 900) malos.limites.push(`${it.cod} entrepaño ${p.largo}`);
    if (/Frente visible de cajón/.test(p.nombre) && p.largo > 1000) malos.limites.push(`${it.cod} cajón ${p.largo}`);
  }
  const svg = D.frente(r, it.spec);
  if (!/^<svg/.test(svg) || /NaN|undefined/.test(svg)) malos.svg.push(it.cod);
}
check(Date.now() - t0 < 60000, `los ${items.length} planos se calculan en ${((Date.now() - t0) / 1000).toFixed(1)} s`);
check(!malos.construye.length, `todos se construyen ${malos.construye.join(', ')}`);
check(!malos.medidas.length, `todas las piezas con medidas válidas ${malos.medidas.join(', ')}`);
check(!malos.caben.length, `todas las piezas caben en un tablero de 2,15 × 2,44 m ${malos.caben.join(', ')}`);
check(!malos.cortes.length, `plano de cortes sin piezas superpuestas ni fuera del tablero ${malos.cortes.join(', ')}`);
check(!malos.pasos.length, `todos traen paso a paso de armado ${malos.pasos.join(', ')}`);
check(!malos.svg.length, `todos tienen dibujo ${malos.svg.join(', ')}`);
check(!malos.limites.length, `respetan los límites prácticos de puertas, entrepaños y cajones ${malos.limites.slice(0, 5).join(', ')}`);

console.log('Geometría');
const pz = (cod, nombre) => { const r = M.construir(M.buscar(cod).item); return { r, p: r.piezas.filter((x) => x.nombre === nombre) }; };
let x = pz('COC-B2P-800x720x560', 'Costado');
check(x.p[0].cant === 2 && x.p[0].largo === 720 && x.p[0].ancho === 560, 'módulo bajo 800: costados 720 × 560');
x = pz('COC-B2P-800x720x560', 'Base (piso)');
check(x.p[0].largo === 770, 'módulo bajo 800: base = 800 − 2 × 15');
x = pz('COC-B2P-800x720x560', 'Puerta');
check(x.p[0].cant === 2 && x.p[0].ancho === 397 && x.p[0].largo === 717, 'módulo bajo 800: 2 puertas superpuestas de 717 × 397 (luces de 3 mm)');
x = pz('CLO-COR-2400x2200x600-CC', 'Puerta corrediza');
check(x.p[0].cant === 3 && Math.abs(x.p[0].ancho * 3 - 2 * 30 - (2400 - 30)) < 0.2, 'clóset corredizo 2400: 3 puertas que cubren el vano con 30 mm de traslape');
x = pz('CAM-140x190-B300-C1000', 'Lateral (larguero)');
check(x.r.e === 18 && x.p[0].largo === 1920, 'cama doble en 18 mm: larguero = colchón de 1.900 + 20');
const base = x.r.piezas.find((p) => /^Base \(tendido\)/.test(p.nombre));
check(base.largo === 1420 && Math.abs(base.ancho * base.cant + 20 * (base.cant - 1) - 1920) < 0.5, 'cama doble: la base cubre 1.420 × 1.920 con 20 mm de ventilación');
x = pz('ORG-CUB-3x3-330-P350', 'Costado');
check(x.p[0].largo === 3 * 330 + 4 * 15, 'organizador 3 × 3: alto = 3 cubos de 330 + 4 espesores');
const rCaj = M.construir(M.buscar('DOR-MN2C-450x500x400').item);
const lat = rCaj.piezas.find((p) => p.nombre === 'Lateral de cajón'), ft = rCaj.piezas.find((p) => p.nombre === 'Frente y trasera interior de cajón');
check(lat.largo === 350 && ft.largo === 450 - 30 - 26 - 30, 'cajón: corredera de 350 mm y caja = hueco − 26 mm');
const rA = M.construir({ ...M.buscar('COC-B2P-800x720x560').item, spec: { ...M.buscar('COC-B2P-800x720x560').item.spec, A: 1000 } });
check(rA.piezas.find((p) => p.nombre === 'Base (piso)').largo === 970, 'cambiar el ancho recalcula las piezas');
const r18 = M.construir(M.buscar('COC-B2P-800x720x560').item, { e: 18, forzarE: true });
check(r18.piezas.find((p) => p.nombre === 'Base (piso)').largo === 764 && r18.e === 18, 'cambiar a 18 mm recalcula las piezas');

console.log('Archivos generados');
const zipLector = require('../src/zipLector');
const man = JSON.parse(fs.readFileSync(path.join(PUB, 'muebles/manifest.json'), 'utf8'));
check(man.totales.planos === items.length && man.totales.disenos === M.disenos().length, `el manifest coincide con el motor (${man.totales.planos} planos, ${man.totales.disenos} diseños)`);
check(man.categorias.length === 5 && man.categorias.every((c, i) => c.planos === fams[i].items.length && c.disenos.reduce((n, d) => n + d.medidas.length, 0) === c.planos), 'el manifest trae cada diseño con todas sus medidas');
const archivos = [...man.guias.map((g) => `muebles/${g.archivo}`), ...man.bonos.map((b) => `muebles/${b.archivo}`), man.muestra.archivo,
  `muebles/${man.zip}`, 'muestras/img/muebles_1_catalogo.jpg', 'muestras/img/muebles_2_plano.jpg', 'muestras/img/muebles_3_cortes.jpg'];
const faltan = archivos.filter((a) => !fs.existsSync(path.join(PUB, a)) || fs.statSync(path.join(PUB, a)).size < 1000);
check(!faltan.length, `existen los ${archivos.length} archivos del pack ${faltan.join(', ')}`);
check(man.guias.length === 4 && man.bonos.length === 2, '4 guías y 2 bonos');
const zipRuta = path.join(PUB, 'muebles', man.zip);
const entradas = zipLector.leerDirectorio(zipRuta);
check(man.categorias.every((c) => entradas.some((e) => e.nombre === man.zipRaiz + c.archivo && e.metodo === 0)), 'los 5 PDF de planos están dentro del ZIP sin recomprimir (se sirven desde ahí)');
check(!fs.existsSync(path.join(PUB, 'muebles/Planos')), 'los PDF de planos no se duplican fuera del ZIP');
const mbTotal = (fs.statSync(zipRuta).size + fs.readdirSync(path.join(PUB, 'muebles/Guias')).reduce((n, f) => n + fs.statSync(path.join(PUB, 'muebles/Guias', f)).size, 0)) / 1e6;
check(mbTotal < 40, `peso del pack en el repositorio: ${mbTotal.toFixed(1)} MB (menos de 40 MB)`);
const leerPdf = (c) => new Promise((ok, mal) => { const en = entradas.find((e) => e.nombre === man.zipRaiz + c.archivo); const b = []; zipLector.abrirEntrada(zipRuta, en).on('data', (d) => b.push(d)).on('end', () => ok(Buffer.concat(b))).on('error', mal); });
const pags = (buf) => (buf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
check(man.guias.every((g) => pags(fs.readFileSync(path.join(PUB, 'muebles', g.archivo))) >= 6), 'cada guía tiene al menos 6 páginas');
check(fs.existsSync(path.join(__dirname, '../public/portal/images/cover_muebles.jpg')), 'portada del portal');
const portalHtml = fs.readFileSync(path.join(__dirname, '../public/portal/index.html'), 'utf8');
const fmt = (n) => n.toLocaleString('es-CO');
check(portalHtml.includes(`+${fmt(man.totales.planos)} planos reales`) && portalHtml.includes(`${man.totales.disenos} diseños base`) && /Melamina%20por%20\$15\.000/.test(portalHtml) && !/139 planos/.test(portalHtml), `tarjeta del portal con la cifra real (+${fmt(man.totales.planos)} planos, ${man.totales.disenos} diseños) y $15.000`);

console.log('Portal del comprador');
const portal = require('../src/muebles/portal');
const wa = (t) => `https://wa.me/1?text=${encodeURIComponent(t)}`;
const completo = { token: 'TOK', tipo: 'completo', producto: 'muebles' }, prueba = { token: 'PRU', tipo: 'prueba', producto: 'muebles' };
const cat = portal.catalogo(completo, wa);
check((cat.match(/class="card"/g) || []).length === 40 && /id="q"/.test(cat) && /\/buscar/.test(cat) && cat.length < 80000, `catálogo liviano: los 40 diseños con buscador (${Math.round(cat.length / 1024)} KB)`);
const dis = portal.diseno(completo, 'clo-aba', wa);
check(dis && (dis.match(/<tr data-a=/g) || []).length === M.buscarDiseno('clo-aba').diseno.items.length && /id="fa"/.test(dis), 'página del diseño: todas sus medidas con filtro de ancho, alto y fondo');
const disP = portal.diseno(prueba, M.buscar(portal.codMuestra()).item.slug, wa);
check((disP.match(/>Abrir</g) || []).length === 1, 'prueba: en el diseño de la muestra solo se abre la muestra');
const bus = portal.buscarMedida(completo, { A: '1200' });
check(/COC-B2P-1200x/.test(bus) && /CLO-ABA-1200x/.test(bus) && /ESC-BAS-1200x/.test(bus), 'buscar por medida: 1.200 mm encuentra cocina, clóset y escritorio de 1.200');
const pl = portal.plano(completo, 'CLO-COR-1800x2200x600-CC', {}, wa);
check(/Despiece/.test(pl) && /Puerta corrediza/.test(pl) && /Plano de cortes/.test(pl) && /Paso a paso/.test(pl) && /regalo\/calculadora\?p=muebles/.test(pl) && /despiece\.csv/.test(pl) && /window\.print/.test(pl), 'página del plano: despiece, cortes, armado, cotizar, imprimir y lista de corte');
check(portal.plano(completo, 'clo-cor-1800x2200x600-cc', {}, wa) !== null, 'el código se encuentra sin importar mayúsculas');
const plA = portal.plano(completo, 'COC-B2P-800x720x560', { A: '1000', H: '720', P: '560' }, wa);
check(/Medidas ajustadas/.test(plA) && />970</.test(plA), 'ajustar medidas recalcula en la página');
check(/bloquea/.test(portal.plano(prueba, 'CLO-COR-1800x2200x600-CC', {}, wa)) && /Despiece/.test(portal.plano(prueba, portal.codMuestra(), {}, wa)), 'prueba: plano bloqueado, muestra abierta');
check(portal.plano(completo, 'NO-EXISTE', {}, wa) === null, 'código inexistente: no encontrado');
const csv = portal.despieceCSV(completo, 'COC-B2P-800x720x560', {});
check(/"Costado";"2";"720";"560";"Melamina 15 mm";"1L"/.test(csv) && portal.despieceCSV(prueba, 'COC-B2P-800x720x560', {}) === null, 'lista de corte en CSV (bloqueada en la prueba)');

console.log('Página del comprador y prueba');
const accesos = require('../src/accesos');
const store = require('../src/store');
const pagina = require('../src/paginaAcceso');
const aC = accesos.crear('573000000901', 'muebles', 'completo');
const pc = pagina.paginaCompleta(aC);
check(/PAGO CONFIRMADO/.test(pc) && pc.includes(`/planos/${aC.token}"`) && /Abrir el catálogo interactivo/.test(pc), 'compra: página personal con el catálogo interactivo');
check(man.categorias.every((c) => pc.includes(`/d/${aC.token}/p${c.id}"`)) && man.guias.every((g, i) => pc.includes(`/d/${aC.token}/g${i + 1}"`)) && pc.includes(`/d/${aC.token}/zip"`), 'compra: los 5 PDF de planos, las 4 guías y el ZIP');
check(pc.includes(`/d/${aC.token}/b1"`) && pc.includes(`/d/${aC.token}/b2"`) && /Calculadora de Costos/.test(pc) && /Cómo Cobrar/.test(pc), 'compra: los 2 bonos');
check((pc.match(/<summary>📱 Ver los planos en el celular sin descargar/g) || []).length === 5 && (pc.match(new RegExp(`/planos/${aC.token}/d/`, 'g')) || []).length === 40, 'compra: cada categoría abre sus diseños en el celular sin descomprimir (40 diseños)');
check(!/drive\.google/.test(pc), 'compra: sin carpeta de Drive configurada no muestra el botón');
store.updateSettings({ driveLinkMuebles: 'https://drive.google.com/drive/folders/PRUEBA_MUEBLES' });
const pcD = pagina.paginaCompleta(aC);
check(/drive\.google\.com\/drive\/folders\/PRUEBA_MUEBLES/.test(pcD) && /Abrir también en Google Drive/.test(pcD), 'compra: con la carpeta de Drive configurada en el panel, muestra el botón de Drive');
store.updateSettings({ driveLinkMuebles: '' });
const aP = accesos.crear('573000000902', 'muebles', 'prueba');
const pp = pagina.paginaPrueba(aP);
check(/ACCESO DE PRUEBA/.test(pp) && /vence en/.test(pp) && /por \$15\.000/.test(pp) && !/\$10\.000/.test(pp), 'prueba: temporizador y precio de $15.000');
check(pp.includes(`/d/${aP.token}/muestra"`) && pp.includes(`/d/${aP.token}/b1"`) && !pp.includes(`/d/${aP.token}/p01"`) && !pp.includes(`/d/${aP.token}/zip"`), 'prueba: abre la muestra y la calculadora; los planos y el ZIP quedan con candado');
check(accesos.archivoPermitido(aP, 'muestra') && accesos.archivoPermitido(aP, 'b1') && !accesos.archivoPermitido(aP, 'p01') && !accesos.archivoPermitido(aP, 'g1') && !accesos.archivoPermitido(aP, 'zip'), 'prueba: el servidor solo deja descargar la muestra y la calculadora');
check(!accesos.contenido('muebles').items.find((i) => i.id === 'muestra') || !/muestra"/.test(pc.split('Planos por categoría')[0].replace(/Muestra gratis[\s\S]*/, '')), 'compra: la muestra no aparece en la página del comprador');

(async () => {
  for (const c of man.categorias) {
    const n = pags(await leerPdf(c));
    check(n >= c.planos + c.disenos.length, `PDF ${c.id}: ${n} páginas para ${c.planos} planos (una por plano + armado de cada diseño)`);
  }
console.log(`\n${fallos ? '✘ ' + fallos + ' fallos' : '✔ todo correcto'}`);
process.exit(fallos ? 1 : 0);
})();
