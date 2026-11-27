// ============================================================================
// Planes del pack de moldes: Básico ($10.000), Emprendedor ($15.000) y Taller Master ($20.000)
// ----------------------------------------------------------------------------
// Un plan superior solo se ofrece cuando su contenido EXISTE: colecciones "premium" declaradas en
// public/descargas/moldes/premium.json con su ZIP en el disco (variable MOLDES_PREMIUM para otra ruta).
// Mientras no haya contenido premium, el bot vende solo el Plan Básico exactamente como antes.
//
// Formato de premium.json → "premium":
//   [{ "id": "p01", "plan": "emprendedor" | "master", "titulo": "Tallas grandes 3XL–5XL",
//      "zip": "premium/P01_Tallas_Grandes.zip", "prendas": [{ "carpeta", "nombre" }],
//      "corto": "tallas 3XL–5XL", "moldes": 474, "moldes_imprimibles": 948 }]
//   "bonosPremium": [{ "plan": "master", "archivo": "11_Bonos/Bono_05_Pack_Emprendedor.pdf", "titulo": "…" }]
//
// Los 4 bonos actuales se mantienen en TODOS los planes: ya se prometen en el anuncio y en el pitch,
// y los tienen los compradores anteriores.
//
// ¿2 o 3 planes? Tres funciona si cada escalón agrega contenido real y el del medio queda como "el más
// vendido" (ancla de precio). Con solo 2, el salto de $10.000 a $20.000 se siente grande y no hay ancla.
// El costo de tener 3 es un primer mensaje más largo, por eso el mensaje de planes va en 3 líneas cortas.
// ============================================================================
const fs = require('fs');
const path = require('path');

const PUBLIC = path.join(__dirname, '../public/descargas');
const MANIFEST = path.join(PUBLIC, 'moldes/manifest.json');
const PREMIUM = () => process.env.MOLDES_PREMIUM || path.join(PUBLIC, 'moldes/premium.json');

const PLANES = {
  basico: { id: 'basico', rango: 1, nombre: 'Plan Básico', precio: 10000, descuento: 8000, boton: 'Básico · $10.000', emoji: '🧵' },
  emprendedor: { id: 'emprendedor', rango: 2, nombre: 'Plan Emprendedor', precio: 15000, descuento: 13000, boton: '⭐ Popular · $15.000', emoji: '⭐' },
  master: { id: 'master', rango: 3, nombre: 'Plan Taller Master', precio: 20000, descuento: 17000, boton: '👑 Master · $20.000', emoji: '👑' },
};
const ORDEN = ['basico', 'emprendedor', 'master'];

const caches = {};
function leer(ruta, vacio) {
  try {
    const mt = fs.statSync(ruta).mtimeMs;
    const c = caches[ruta];
    if (!c || c.mtime !== mt) caches[ruta] = { mtime: mt, datos: JSON.parse(fs.readFileSync(ruta, 'utf8')) };
    return caches[ruta].datos;
  } catch (_) { return vacio; }
}
function manifest() { return leer(MANIFEST, { colecciones: [], bonos: [], totales: {} }); }
function extra() { return leer(PREMIUM(), { premium: [], bonosPremium: [] }); }

const existe = (rel) => { try { return fs.statSync(path.join(PUBLIC, rel)).isFile(); } catch (_) { return false; } };
const rango = (plan) => (PLANES[plan] ? PLANES[plan].rango : 1);

// Colecciones premium que existen en el disco
function premium() {
  return (extra().premium || []).filter((c) => PLANES[c.plan] && c.plan !== 'basico' && c.zip && existe(`moldes/${c.zip}`));
}
function bonosPremium() {
  return (extra().bonosPremium || []).filter((b) => PLANES[b.plan] && b.archivo && existe(`moldes/${b.archivo}`));
}

// Planes que se pueden vender hoy: el Básico siempre; los otros, solo si traen contenido propio
function disponibles() {
  const p = premium(), b = bonosPremium();
  return ORDEN.filter((id) => id === 'basico' || p.some((c) => c.plan === id) || b.some((x) => x.plan === id));
}
function hayPlanes() { return disponibles().length > 1; }
function activo(plan) { return disponibles().includes(plan); }

// Moldes imprimibles de un plan (el básico más las colecciones premium de su nivel o menor)
function moldesDe(plan) {
  const base = (manifest().totales || {}).moldes_imprimibles || 2420;
  return base + premium().filter((c) => rango(c.plan) <= rango(plan)).reduce((n, c) => n + (c.moldes_imprimibles || 0), 0);
}
// Nombres cortos de lo que agrega un plan ("tallas 3XL–5XL", "corsetería"…), tomados de premium.json.
// acumulado = true: también lo de los planes premium de menor nivel.
// que = 'todo' | 'colecciones' | 'bonos'
function incluye(plan, acumulado = false, que = 'todo') {
  const ok = (p) => (acumulado ? p !== 'basico' && rango(p) <= rango(plan) : p === plan);
  const xs = [...(que === 'bonos' ? [] : premium().filter((c) => ok(c.plan)).map((c) => c.corto || String(c.titulo || '').replace(/ · Parte .*$/, ''))),
    ...(que === 'colecciones' ? [] : bonosPremium().filter((b) => ok(b.plan)).map((b) => b.corto || b.titulo))].filter(Boolean);
  return [...new Set(xs)];
}
function lista(xs) { return xs.length > 1 ? `${xs.slice(0, -1).join(', ')} y ${xs[xs.length - 1]}` : (xs[0] || ''); }
function extraDe(plan) { return moldesDe(plan) - moldesDe('basico'); }
function info(plan) { const p = PLANES[plan] || PLANES.basico; return { ...p, moldes: moldesDe(p.id), extra: extraDe(p.id) }; }

// Plan que corresponde al valor pagado: $8.000–$12.999 Básico, $13.000–$16.999 Emprendedor, $17.000+ Master
function deMonto(monto) {
  const m = Number(monto) || 0;
  for (const id of [...disponibles()].reverse()) if (m >= PLANES[id].descuento) return id;
  return 'basico';
}

// Plan que nombra el cliente: "el de 15", "quiero el master", "plan emprendedor", "el de $20.000"
function elegido(texto) {
  const n = String(texto || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[.$]/g, '');
  if (/\b(master|taller master|completo|el mas completo|el de 20|de 20 ?mil|20 ?000|veinte)\b/.test(n)) return 'master';
  if (/\b(emprendedor|popular|el mas vendido|el de 15|de 15 ?mil|15 ?000|quince)\b/.test(n)) return 'emprendedor';
  if (/\b(basico|el de 10|de 10 ?mil|10 ?000|diez mil|el sencillo|el mas barato)\b/.test(n)) return 'basico';
  return null;
}

// El anuncio o el mensaje inicial menciona $20.000: se presenta primero el Plan Taller Master
function enfoqueMaster(texto) {
  return /\b20[.,]?000\b|\b20 ?mil\b/.test(String(texto || '').toLowerCase());
}

module.exports = { PLANES, ORDEN, disponibles, hayPlanes, activo, rango, info, moldesDe, extraDe, incluye, lista, deMonto, elegido, enfoqueMaster, premium, bonosPremium };
