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
    });
  }
  man.bonos.forEach((b, i) => {
    const base = b.archivo.split('/').pop();
    const [t, s] = NB[base] || [base, ''];
    items.push({ id: `b${i + 1}`, grupo: 'Bonos técnicos', titulo: t, sub: s, archivo: `moldes/${b.archivo}`, gratis: i >= 2, abrir: base.endsWith('.html') });
  });
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

const CONTENIDOS = { moldes: contenidoMoldes, helados: contenidoHelados };

function contenido(producto) {
  const fn = CONTENIDOS[producto] || CONTENIDOS.helados;
  const c = fn();
  c.items = c.items.map((it) => ({ ...it, mb: mb(it.archivo) })).filter((it) => it.mb !== null);
  return c;
}

// ---------------------------------------------------------------------------- tokens
function crear(phone, producto, tipo = 'completo', extra = {}) {
  if (tipo === 'completo') {
    const ya = Object.values(accesos).find((a) => a.phone === phone && a.producto === producto && a.tipo === 'completo' && a.activo);
    if (ya) return ya;
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

function completoDe(phone, producto) {
  return Object.values(accesos).find((a) => a.phone === phone && a.tipo === 'completo' && a.activo && (!producto || a.producto === producto)) || null;
}

function deTelefono(phone) {
  return Object.values(accesos).filter((a) => a.phone === phone).sort((a, b) => b.createdAt - a.createdAt);
}

// Puede este acceso descargar este archivo
function archivoPermitido(acceso, itemId) {
  const c = contenido(acceso.producto);
  const it = c.items.find((x) => x.id === itemId);
  if (!it) return null;
  if (acceso.tipo === 'completo') return it;
  return it.gratis ? it : null;
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

module.exports = { crear, estado, registrarUso, desactivar, completoDe, deTelefono, archivoPermitido, contenido, migrarVentas, MINUTOS_PRUEBA, PUBLIC };
