// ============================================================================
// Accesos personales a los productos digitales
// ----------------------------------------------------------------------------
// - "completo": enlace propio de cada comprador (/acceso/<token>), sin vencimiento.
//   El panel puede desactivarlo si se comparte.
// - "prueba": enlace de la estrategia HONESTIDAD. Vence a los N minutos y solo
//   deja descargar las muestras; el resto se ve con candado.
// Los archivos se descargan por /d/<token>/<id>, que revisa el token en cada descarga.
// ============================================================================
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const store = require('./store');
const zipLector = require('./zipLector');

const FILE = path.join(store.dataDir(), 'accesos.json');
const PUBLIC = path.join(__dirname, '../public/descargas');
const MINUTOS_PRUEBA = Number(process.env.PRUEBA_MINUTOS || 60);

let accesos = {};
try { if (fs.existsSync(FILE)) accesos = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch (e) { console.error('[ACCESOS] No se pudo leer accesos.json:', e.message); }
function guardar() {
  const tmp = FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(accesos, null, 1));
  fs.renameSync(tmp, FILE);
}

function nuevoToken() {
  return crypto.randomBytes(9).toString('base64url');
}

// ---------------------------------------------------------------------------- contenido por producto
function mb(rel) {
  try { return Math.round(fs.statSync(path.join(PUBLIC, rel)).size / 1e5) / 10; } catch (_) { return null; }
}

// Tamaño de un archivo guardado dentro de un ZIP (o null si no está)
function entradaZip(it) {
  try { return zipLector.leerDirectorio(path.join(PUBLIC, it.archivo)).find((e) => e.nombre === it.entradaZip) || null; } catch (_) { return null; }
}
function mbEntrada(it) { const e = entradaZip(it); return e ? Math.round(e.tamano / 1e5) / 10 : null; }

function contenidoMoldes() {
  let man = { colecciones: [], bonos: [], totales: {} };
  try { man = JSON.parse(fs.readFileSync(path.join(PUBLIC, 'moldes/manifest.json'), 'utf8')); } catch (_) {}
  const NB = {
    'Bono_01_Manual_Tecnico_de_Costura.pdf': ['📘 Manual Técnico de Costura', 'Del patrón impreso a la prenda terminada'],
    'Bono_02_Guia_Telas_Agujas_Prensatelas.pdf': ['🧵 Guía de Telas, Agujas y Prensatelas', 'Qué tela, aguja y prensatelas usar'],
    'Bono_03_Tabla_Antropometrica_y_Medicion.pdf': ['📏 Tabla de Medidas y Cómo Medir', 'Mujer, hombre, niños, bebé y perro'],
    'Bono_04_Calculadora_Costos_Precios_Confeccion.html': ['🧮 Calculadora de Costos y Precios', 'Se abre en el navegador'],
  };
  const items = [{
    id: 'muestra', grupo: 'Muestra gratis', titulo: '🎁 Patrón completo: Falda Media Campana con Vuelo',
    sub: 'Ficha técnica de 6 páginas + las 6 tallas en Carta y A4', archivo: 'muestras/Muestra_Falda_Media_Campana.zip', gratis: true, soloPrueba: true,
  }];
  for (const c of man.colecciones) {
    items.push({
      id: `c${c.id}`, grupo: 'Colecciones de moldes (ZIP)', titulo: `${c.id} · ${c.titulo}`,
      sub: `${c.prendas.map((p) => p.nombre).join(' · ')} — ${c.prendas.length} patrones · ${(c.moldes || 0).toLocaleString('es-CO')} moldes por talla`,
      archivo: `moldes/${c.zip}`,
      prendas: c.prendas.map((p) => ({ carpeta: p.carpeta, nombre: p.nombre })),
    });
  }
  man.bonos.forEach((b, i) => {
    const base = b.archivo.split('/').pop();
    const [t, s] = NB[base] || [base, ''];
    items.push({ id: `b${i + 1}`, grupo: 'Bonos técnicos', titulo: t, sub: s, archivo: `moldes/${b.archivo}`, gratis: i >= 2, abrir: base.endsWith('.html') });
  });
  // Planes Emprendedor y Taller Master: colecciones y bonos premium (solo los que existen en el disco)
  const planes = require('./planes');
  for (const c of planes.premium()) {
    const pl = planes.PLANES[c.plan];
    items.push({
      id: `${c.id}`, grupo: `Colecciones premium · ${pl.nombre}`, titulo: `${pl.emoji} ${c.titulo}`, plan: c.plan,
      sub: `${(c.prendas || []).map((p) => p.nombre).join(' · ')}${c.moldes_imprimibles ? ` — ${c.moldes_imprimibles.toLocaleString('es-CO')} moldes` : ''}`,
      archivo: `moldes/${c.zip}`, prendas: (c.prendas || []).map((p) => ({ carpeta: p.carpeta, nombre: p.nombre })),
    });
  }
  planes.bonosPremium().forEach((b, i) => items.push({ id: `bp${i + 1}`, grupo: `Bonos premium · ${planes.PLANES[b.plan].nombre}`, titulo: b.titulo || b.archivo.split('/').pop(), sub: b.sub || '', archivo: `moldes/${b.archivo}`, plan: b.plan, abrir: /\.html$/i.test(b.archivo) }));
  const T = man.totales || {};
  return {
    titulo: 'Mega Pack +2.000 Moldes de Costura', emoji: '🧵',
    intro: `${(T.moldes_imprimibles || 0).toLocaleString('es-CO')} moldes listos para imprimir a escala real (${T.patrones || 34} patrones en todas sus tallas, ${(T.moldes || 0).toLocaleString('es-CO')} moldes de pieza, en hoja Carta y A4), más 4 bonos técnicos.`,
    nota: 'Imprime al 100 % (tamaño real) y mide el cuadro de 5 × 5 cm de la hoja de inicio antes de unir las hojas.',
    items,
  };
}

function contenidoHelados() {
  return {
    titulo: 'Colección Emprende Dulce 2026', emoji: '🍨',
    intro: '3 libros de recetas con costeo, fotos y paso a paso, más la calculadora de costos y 2 bonos para vender por WhatsApp.',
    nota: 'Los PDF se abren en el celular o el computador. La calculadora se abre en el navegador o en Excel.',
    items: [
      { id: 'muestra', grupo: 'Muestra gratis', titulo: '🎁 Muestra: 5 recetas de Postres en Vaso', sub: 'Bizcocho base, chantilly, tres leches, pie de limón y mousse de maracuyá, con costeo', archivo: 'muestras/Muestra_Postres_en_Vaso_5_Recetas.pdf', gratis: true, soloPrueba: true },
      { id: 'zip', grupo: 'Todo en un archivo', titulo: '📦 Pack completo en ZIP', sub: 'Los 3 libros y los bonos', archivo: 'Pack_Completo_Emprende_Dulce_2026.zip' },
      { id: 'l1', grupo: 'Libros', titulo: '🍦 Helados Artesanales · Guía Maestra', sub: 'PDF', archivo: '01_Helados_Artesanales_Guia_Maestra.pdf' },
      { id: 'l2', grupo: 'Libros', titulo: '🍮 Postres en Vaso para Emprender', sub: 'PDF', archivo: '02_Postres_en_Vaso_Para_Emprender.pdf' },
      { id: 'l3', grupo: 'Libros', titulo: '🎄 Recetario Navideño y Cajas Regalo', sub: 'PDF', archivo: '03_Recetario_Navideno_Postres_y_Cajas_Regalo.pdf' },
      { id: 'b1', grupo: 'Bonos', titulo: '🧮 Calculadora de Costos y Precios (Excel)', sub: 'XLSX', archivo: 'Bono_01_Calculadora_Costos_y_Precios.xlsx', gratis: true },
      { id: 'b1w', grupo: 'Bonos', titulo: '🧮 Calculadora de Costos y Precios (web)', sub: 'Se abre en el navegador', archivo: 'Bono_01_Calculadora_Costos_y_Precios.html', gratis: true, abrir: true },
      { id: 'b2', grupo: 'Bonos', titulo: '📇 Directorio de Proveedores en Colombia', sub: 'PDF', archivo: 'Bono_02_Directorio_Proveedores_Colombia.pdf' },
      { id: 'b3', grupo: 'Bonos', titulo: '💬 Guía de Ventas por WhatsApp', sub: 'PDF', archivo: 'Bono_03_Guia_Ventas_WhatsApp_Postres.pdf' },
    ],
  };
}

function contenidoMuebles() {
  const man = { categorias: [], guias: [], bonos: [], totales: {}, muestra: {}, ...require('./muebles/portal').manifest() };
  const T = man.totales || {};
  const items = [];
  if (man.muestra && man.muestra.archivo) {
    items.push({ id: 'muestra', grupo: 'Muestra gratis', titulo: `🎁 Plano completo: ${man.muestra.nombre} (${man.muestra.cod})`, sub: 'Vista acotada, despiece en mm, herrajes, láminas, cortes y armado', archivo: man.muestra.archivo, gratis: true, soloPrueba: true });
  }
  // Los PDF de planos viven dentro del ZIP del pack (sin duplicarlos en disco); se sirven desde ahí
  for (const c of man.categorias) {
    items.push({ id: `p${c.id}`, grupo: 'Planos por categoría (PDF)', titulo: `${c.id} · ${c.nombre}`, sub: `${c.planos.toLocaleString('es-CO')} planos · ${c.disenos.map((d) => d.nombre).join(' · ')}`,
      archivo: `muebles/${man.zip}`, entradaZip: `${man.zipRaiz}${c.archivo}`,
      disenosCat: c.disenos.map((d) => ({ slug: d.slug, nombre: d.nombre, n: d.medidas.length })) });
  }
  man.guias.forEach((g, i) => items.push({ id: `g${i + 1}`, grupo: 'Guías prácticas (PDF)', titulo: g.titulo, sub: g.sub, archivo: `muebles/${g.archivo}` }));
  man.bonos.forEach((b, i) => items.push({ id: `b${i + 1}`, grupo: 'Bonos de negocio', titulo: b.titulo, sub: b.sub, archivo: `muebles/${b.archivo}`, abrir: !!b.abrir, gratis: !!b.abrir }));
  items.push({ id: 'zip', grupo: 'Todo en un archivo', titulo: '📦 Pack completo en ZIP', sub: 'Los 5 PDF de planos, las guías y los bonos', archivo: `muebles/${man.zip || 'Mega_Pack_Muebles_Melamina_2026.zip'}` });
  return {
    titulo: 'Mega Pack de Carpintería y Muebles en Melamina 2026', emoji: '🪚',
    intro: `${(T.planos || 0).toLocaleString('es-CO')} planos con medidas exactas en mm (${T.disenos || 0} diseños base en sus medidas estándar) en ${T.categorias || 0} categorías, con despiece, herrajes, láminas, plano de cortes y paso a paso; ${T.guias || 0} guías prácticas y ${T.bonos || 0} bonos de negocio.`,
    nota: 'Abre el catálogo interactivo para buscar cada plano, ver su despiece en el celular y ajustar las medidas a tu espacio.',
    catalogo: true,
    items,
  };
}

// Sanidad: sus documentos no son archivos fijos, se generan con los datos del negocio (src/sanidad/pagina.js)
function contenidoSanidad() {
  return {
    titulo: 'Plan de Saneamiento Básico 2026-2027', emoji: '📋',
    intro: 'Plan de Saneamiento (Res. 2674 de 2013) con los 4 programas, POES, cronogramas, carteles y las planillas de vigilancia, con los datos de tu negocio.',
    nota: 'Los documentos se generan con los datos de tu negocio.',
    items: [],
  };
}

const CONTENIDOS = { moldes: contenidoMoldes, helados: contenidoHelados, muebles: contenidoMuebles, sanidad: contenidoSanidad };

// Planes del producto del acceso (moldes o sanidad)
function modPlanes(producto) {
  return producto === 'sanidad' ? require('./sanidad/planes') : require('./planes');
}

function contenido(producto) {
  const fn = CONTENIDOS[producto] || CONTENIDOS.helados;
  const c = fn();
  c.items = c.items.map((it) => ({ ...it, mb: it.entradaZip ? mbEntrada(it) : mb(it.archivo) })).filter((it) => it.mb !== null);
  return c;
}

// ---------------------------------------------------------------------------- tokens
function crear(phone, producto, tipo = 'completo', extra = {}) {
  if (tipo === 'completo') {
    const ya = Object.values(accesos).find((a) => a.phone === phone && a.producto === producto && a.tipo === 'completo' && a.activo);
    if (ya) {
      // Compra o upgrade a un plan mayor: el mismo enlace desbloquea el plan nuevo
      const pl = modPlanes(producto);
      if (extra.plan && pl.rango(extra.plan) > pl.rango(ya.plan || pl.ORDEN[0])) {
        ya.plan = extra.plan; ya.planActualizadoAt = Date.now(); guardar();
      }
      return ya;
    }
  }
  const token = nuevoToken();
  const a = {
    token, phone, producto, tipo, activo: true, createdAt: Date.now(),
    expiresAt: tipo === 'prueba' ? Date.now() + MINUTOS_PRUEBA * 60 * 1000 : null,
    vistas: 0, descargas: 0, ...extra,
  };
  accesos[token] = a;
  guardar();
  return a;
}

// Guarda datos en un acceso (por ejemplo, los datos del negocio de sanidad)
function actualizar(token, data) {
  const a = accesos[String(token || '')];
  if (!a) return null;
  Object.assign(a, data, { actualizadoAt: Date.now() });
  guardar();
  return a;
}

function estado(token) {
  const a = accesos[String(token || '')];
  if (!a) return { ok: false, motivo: 'no_existe' };
  if (!a.activo) return { ok: false, motivo: 'desactivado', acceso: a };
  if (a.expiresAt && Date.now() > a.expiresAt) return { ok: false, motivo: 'vencido', acceso: a };
  return { ok: true, acceso: a };
}

function registrarUso(token, campo) {
  const a = accesos[token];
  if (!a) return;
  a[campo] = (a[campo] || 0) + 1;
  a.ultimoUso = Date.now();
  guardar();
}

function desactivar(token) {
  if (!accesos[token]) return null;
  accesos[token].activo = false;
  accesos[token].desactivadoAt = Date.now();
  guardar();
  return accesos[token];
}

// Reabre (o crea) la prueba de un cliente por N minutos más
function extenderPrueba(phone, producto, minutos = MINUTOS_PRUEBA) {
  let a = Object.values(accesos).filter((x) => x.phone === phone && x.tipo === 'prueba' && (!producto || x.producto === producto))
    .sort((x, y) => y.createdAt - x.createdAt)[0];
  if (!a) return crear(phone, producto, 'prueba');
  a.activo = true;
  a.expiresAt = Date.now() + minutos * 60 * 1000;
  a.extendidaAt = Date.now();
  guardar();
  return a;
}

function completoDe(phone, producto) {
  return Object.values(accesos).find((a) => a.phone === phone && a.tipo === 'completo' && a.activo && (!producto || a.producto === producto)) || null;
}

function deTelefono(phone) {
  return Object.values(accesos).filter((a) => a.phone === phone).sort((a, b) => b.createdAt - a.createdAt);
}

// Puede este acceso descargar este archivo
// Un archivo de un plan mayor al del acceso (moldes) queda bloqueado. Accesos sin plan = Plan Básico.
function incluyePlan(acceso, it) {
  if (!it.plan) return true;
  const planes = modPlanes(acceso.producto);
  return planes.rango(it.plan) <= planes.rango(acceso.plan || planes.ORDEN[0]);
}

function archivoPermitido(acceso, itemId) {
  const c = contenido(acceso.producto);
  const it = c.items.find((x) => x.id === itemId);
  if (!it) return null;
  if (acceso.tipo === 'completo') return incluyePlan(acceso, it) ? it : null;
  return it.gratis ? it : null;
}

// PDF sueltos dentro del ZIP de una colección, agrupados por patrón (para abrirlos en el celular)
function pdfsDe(item) {
  if (!item || !/\.zip$/i.test(item.archivo || '') || !item.prendas) return [];
  let entradas = [];
  try { entradas = zipLector.leerDirectorio(path.join(PUBLIC, item.archivo)); } catch (e) { console.error('[ACCESOS] ZIP ilegible', item.archivo, e.message); return []; }
  const nombres = Object.fromEntries(item.prendas.map((p) => [p.carpeta, p.nombre]));
  const grupos = {};
  for (const en of entradas) {
    if (!/\.pdf$/i.test(en.nombre)) continue;
    const [carpeta, archivo] = en.nombre.split('/');
    const g = grupos[carpeta] || (grupos[carpeta] = { carpeta, nombre: nombres[carpeta] || carpeta.replace(/^\d+_/, '').replace(/_/g, ' '), ficha: null, carta: [], a4: [] });
    const m = /^Talla_(.+)_(Carta|A4)\.pdf$/i.exec(archivo || '');
    const ref = { n: en.n, archivo, mb: Math.round(en.tamano / 1e5) / 10 };
    if (/^00_Ficha/i.test(archivo)) g.ficha = ref;
    else if (m) (m[2].toLowerCase() === 'carta' ? g.carta : g.a4).push({ ...ref, talla: m[1].replace(/-/g, '–') });
  }
  // Tallas en orden de menor a mayor (XS, S, M… / 0-3, 3-6… / 2, 4, 6…)
  const ORDEN = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '3XL', '4XL', '5XL', 'MINI', 'MEDIANO', 'MEDIANA', 'GRANDE'];
  const clave = (t) => {
    const u = String(t.talla).toUpperCase();
    const i = ORDEN.indexOf(u);
    if (i >= 0) return i;
    const num = parseFloat(u);
    return Number.isNaN(num) ? 100 : 20 + num;
  };
  for (const g of Object.values(grupos)) { g.carta.sort((a, b) => clave(a) - clave(b)); g.a4.sort((a, b) => clave(a) - clave(b)); }
  return Object.values(grupos);
}

function entradaPdf(item, n) {
  try {
    const en = zipLector.leerDirectorio(path.join(PUBLIC, item.archivo)).find((x) => x.n === Number(n));
    return en && /\.pdf$/i.test(en.nombre) ? en : null;
  } catch (_) { return null; }
}

// Al arrancar: cada venta confirmada sin enlace personal recibe uno (para poder reenviarlo desde el panel)
function migrarVentas() {
  let n = 0;
  for (const p of store.pedidosVerificados()) {
    if (!completoDe(p.phone, p.producto || 'helados')) {
      crear(p.phone, p.producto || 'helados', 'completo', { pedidoId: p.id, migrado: true });
      n++;
    }
  }
  if (n) console.log(`[ACCESOS] Enlaces personales creados para ${n} ventas anteriores.`);
}

module.exports = { actualizar, modPlanes, incluyePlan, entradaZip, pdfsDe, entradaPdf, extenderPrueba, crear, estado, registrarUso, desactivar, completoDe, deTelefono, archivoPermitido, contenido, migrarVentas, MINUTOS_PRUEBA, PUBLIC };
