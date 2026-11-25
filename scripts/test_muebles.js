// Pruebas del pack de muebles: motor de despiece, optimizador de cortes, archivos generados y portal.
//   node scripts/test_muebles.js
const fs = require('fs');
const os = require('os');
const path = require('path');
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'muebles-'));
const M = require('../src/muebles/motor');
const D = require('../src/muebles/dibujo');
const PUB = path.join(__dirname, '../public/descargas');

let fallos = 0;
function check(cond, msg) { console.log((cond ? '  ✔ ' : '  ✘ ') + msg); if (!cond) fallos++; }
const fams = M.catalogo();
const items = fams.flatMap((f) => f.items.map((it) => ({ it, f })));

console.log('Catálogo');
check(fams.length === 5, '5 categorías');
check(items.length === M.contar() && items.length >= 130, `${items.length} planos`);
check(new Set(items.map((x) => x.it.cod)).size === items.length, 'códigos únicos');
check(M.disenos().length >= 40, `${M.disenos().length} diseños base`);

console.log('Cada plano');
const malos = { construye: [], medidas: [], caben: [], cortes: [], pasos: [], svg: [] };
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
  const svg = D.frente(r, it.spec);
  if (!/^<svg/.test(svg) || /NaN|undefined/.test(svg)) malos.svg.push(it.cod);
}
check(!malos.construye.length, `todos se construyen ${malos.construye.join(', ')}`);
check(!malos.medidas.length, `todas las piezas con medidas válidas ${malos.medidas.join(', ')}`);
check(!malos.caben.length, `todas las piezas caben en un tablero de 2,15 × 2,44 m ${malos.caben.join(', ')}`);
check(!malos.cortes.length, `plano de cortes sin piezas superpuestas ni fuera del tablero ${malos.cortes.join(', ')}`);
check(!malos.pasos.length, `todos traen paso a paso de armado ${malos.pasos.join(', ')}`);
check(!malos.svg.length, `todos tienen dibujo ${malos.svg.join(', ')}`);

console.log('Geometría');
const pz = (cod, nombre) => { const r = M.construir(M.buscar(cod).item); return { r, p: r.piezas.filter((x) => x.nombre === nombre) }; };
let x = pz('COC-B2P-800', 'Costado');
check(x.p[0].cant === 2 && x.p[0].largo === 720 && x.p[0].ancho === 560, 'módulo bajo 800: costados 720 × 560');
x = pz('COC-B2P-800', 'Base (piso)');
check(x.p[0].largo === 770, 'módulo bajo 800: base = 800 − 2 × 15');
x = pz('COC-B2P-800', 'Puerta');
check(x.p[0].cant === 2 && x.p[0].ancho === 397 && x.p[0].largo === 717, 'módulo bajo 800: 2 puertas superpuestas de 717 × 397 (luces de 3 mm)');
x = pz('CLO-COR-2400', 'Puerta corrediza');
check(x.p[0].cant === 3 && Math.abs(x.p[0].ancho * 3 - 2 * 30 - (2400 - 30)) < 0.2, 'clóset corredizo 2400: 3 puertas que cubren el vano con 30 mm de traslape');
x = pz('CAM-DOBLE', 'Lateral (larguero)');
check(x.r.e === 18 && x.p[0].largo === 1920, 'cama doble en 18 mm: larguero = colchón de 1.900 + 20');
const base = x.r.piezas.find((p) => /^Base \(tendido\)/.test(p.nombre));
check(base.largo === 1420 && Math.abs(base.ancho * base.cant + 20 * (base.cant - 1) - 1920) < 0.5, 'cama doble: la base cubre 1.420 × 1.920 con 20 mm de ventilación');
x = pz('ORG-CUB-3X3', 'Costado');
check(x.p[0].largo === 3 * 330 + 4 * 15, 'organizador 3 × 3: alto = 3 cubos de 330 + 4 espesores');
const rCaj = M.construir(M.buscar('DOR-MN1-450').item);
const lat = rCaj.piezas.find((p) => p.nombre === 'Lateral de cajón'), ft = rCaj.piezas.find((p) => p.nombre === 'Frente y trasera interior de cajón');
check(lat.largo === 350 && ft.largo === 450 - 30 - 26 - 30, 'cajón: corredera de 350 mm y caja = hueco − 26 mm');
const rA = M.construir({ ...M.buscar('COC-B2P-800').item, spec: { ...M.buscar('COC-B2P-800').item.spec, A: 1000 } });
check(rA.piezas.find((p) => p.nombre === 'Base (piso)').largo === 970, 'cambiar el ancho recalcula las piezas');
const r18 = M.construir(M.buscar('COC-B2P-800').item, { e: 18, forzarE: true });
check(r18.piezas.find((p) => p.nombre === 'Base (piso)').largo === 764 && r18.e === 18, 'cambiar a 18 mm recalcula las piezas');

console.log('Archivos generados');
const man = JSON.parse(fs.readFileSync(path.join(PUB, 'muebles/manifest.json'), 'utf8'));
check(man.totales.planos === items.length && man.totales.disenos === M.disenos().length, 'el manifest coincide con el motor (planos y diseños)');
check(man.categorias.length === 5 && man.categorias.every((c, i) => c.planos.length === fams[i].items.length), 'el manifest trae los planos de cada categoría');
const archivos = [...man.categorias.map((c) => `muebles/${c.archivo}`), ...man.guias.map((g) => `muebles/${g.archivo}`), ...man.bonos.map((b) => `muebles/${b.archivo}`), man.muestra.archivo,
  'muebles/Mega_Pack_Muebles_Melamina_2026.zip', 'muestras/img/muebles_1_catalogo.jpg', 'muestras/img/muebles_2_plano.jpg', 'muestras/img/muebles_3_cortes.jpg'];
const faltan = archivos.filter((a) => !fs.existsSync(path.join(PUB, a)) || fs.statSync(path.join(PUB, a)).size < 1000);
check(!faltan.length, `existen los ${archivos.length} archivos del pack ${faltan.join(', ')}`);
check(man.guias.length === 4 && man.bonos.length === 2, '4 guías y 2 bonos');
const pags = (f) => (fs.readFileSync(path.join(PUB, f)).toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
check(man.categorias.every((c) => pags(`muebles/${c.archivo}`) >= c.planos.length + 2), 'cada PDF de categoría tiene al menos una página por plano');
check(man.guias.every((g) => pags(`muebles/${g.archivo}`) >= 6), 'cada guía tiene al menos 6 páginas');
check(fs.existsSync(path.join(__dirname, '../public/portal/images/cover_muebles.jpg')), 'portada del portal');

console.log('Portal del comprador');
const portal = require('../src/muebles/portal');
const wa = (t) => `https://wa.me/1?text=${encodeURIComponent(t)}`;
const completo = { token: 'TOK', tipo: 'completo', producto: 'muebles' }, prueba = { token: 'PRU', tipo: 'prueba', producto: 'muebles' };
const cat = portal.catalogo(completo, wa);
check((cat.match(/class="card"/g) || []).length === items.length && /id="q"/.test(cat), 'catálogo con buscador y todos los planos');
const catP = portal.catalogo(prueba, wa);
check((catP.match(/class="card"/g) || []).length === 1 && (catP.match(/card lock/g) || []).length === items.length - 1, 'prueba: solo el plano de muestra se abre');
const pl = portal.plano(completo, 'CLO-COR-1800', {}, wa);
check(/Despiece/.test(pl) && /Puerta corrediza/.test(pl) && /Plano de cortes/.test(pl) && /Paso a paso/.test(pl) && /regalo\/calculadora\?p=muebles/.test(pl), 'página del plano: despiece, cortes, armado y botón de cotizar');
const plA = portal.plano(completo, 'COC-B2P-800', { A: '1000', H: '720', P: '560' }, wa);
check(/Medidas ajustadas/.test(plA) && />970</.test(plA), 'ajustar medidas recalcula en la página');
check(/bloquea/.test(portal.plano(prueba, 'CLO-COR-1800', {}, wa)) && /Despiece/.test(portal.plano(prueba, portal.codMuestra(), {}, wa)), 'prueba: plano bloqueado, muestra abierta');
check(portal.plano(completo, 'NO-EXISTE', {}, wa) === null, 'código inexistente: no encontrado');

console.log(`\n${fallos ? '✘ ' + fallos + ' fallos' : '✔ todo correcto'}`);
process.exit(fallos ? 1 : 0);
