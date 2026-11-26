/**
 * 📦 Catálogo Maestro de Productos y Mapeo de Anuncios Meta Ads
 * =============================================================
 * Permite al bot identificar con 100% de precisión matemática el producto
 * correspondiente para cada conversación entrante:
 * 
 * 1. PRIORIDAD 1: Meta Ad Referral (message.referral.source_id)
 *    Cuando un usuario hace clic en un anuncio de Facebook o Instagram,
 *    Meta envía el ID exacto del anuncio (source_id), titular y cuerpo.
 *    Esto garantiza que si el usuario borra el texto predefinido o escribe
 *    "Hola" o "Precio", el bot SABE con exactitud qué producto vio.
 * 
 * 2. PRIORIDAD 2: Palabras clave en el texto del mensaje entrante.
 * 
 * 3. PRIORIDAD 3: Historial previo del lead (si ya tenía producto asignado).
 * 
 * 4. FALLBACK: el producto por defecto de la configuración del panel.
 */

const PRODUCTOS = {
  // 🧵 MEGA PACK +2.000 MOLDES Y PATRONES DE COSTURA EN PDF ($10.000 COP)
  moldes: {
    id: 'moldes',
    nombre: 'Mega Pack +2.000 Moldes y Patrones de Costura en PDF',
    emoji: '🧵',
    etiqueta: 'Moldes',
    color: '#8b5cf6',   // color del producto en el panel (chats, pagos y ventas)
    precio: 10000,
    // IDs de Meta Ads vinculados a Moldes (Anuncios, Conjuntos y Campañas)
    metaIds: [
      '120250542536910743', // Campaña: [COL] - Venta WA - Mega Pack Moldes Costura 2000 - CBO
      '120250542591840743', // Conjunto 1: [C1-INT] - Confección, Singer y Patronaje
      '120250544614580743', // Conjunto 2: [C2-INT] - Diseño de Modas y Ropa
      '120250544654680743', // Conjunto 3: [C3-BROAD] - Todo Colombia (Segmentación por Creativo)
      '120250607013610743', // Conjunto 4: [C4-INT] - Mujeres 25-55 - Costura y Modistería - Colombia
      '120250607013620743', // Conjunto 5: [C5-INT] - Mujeres 25-55 - Manualidades y DIY - Colombia
      '120250542591850743', // Anuncio 1: [A1-VIDEO] - Master Moldes 2000 Subtitulado 35s
      '120250544614590743', // Anuncio 2: [A2-IMAGEN] - Banner Azul Moldes 10.000
      '120250544654690743'  // Anuncio 3: [A3-IMAGEN] - Poster Taller Modistería 10.000
    ],
    // Detección por palabras clave en titular del anuncio o mensaje del cliente
    keywords: /(molde|patr[oó]n|costur|confecci|ropa|vestid|blusa|pantal|panties|lencer|coser|modist|talla|imprimir.*casa|hoja carta)/i
  },

  // 🪚 MEGA PACK DE CARPINTERÍA Y MUEBLES EN MELAMINA 2026 ($15.000 COP; seguimiento con descuento a $12.000)
  muebles: {
    id: 'muebles',
    nombre: 'Mega Pack de Carpintería y Muebles en Melamina 2026',
    emoji: '🪚',
    etiqueta: 'Muebles',
    color: '#b45309',
    // Precio propio: no usa el precio general del panel (que es el de moldes y postres)
    precioPropio: true,
    precio: Number(process.env.PRECIO_MUEBLES) || 15000,
    precioDescuento: Number(process.env.PRECIO_DESCUENTO_MUEBLES) || 12000,
    // Agregar aquí los IDs de la campaña, los conjuntos y los anuncios de muebles cuando se creen en Meta.
    // Mientras tanto, el producto se detecta por el titular del anuncio o por las palabras clave.
    metaIds: [],
    keywords: /(mueble|melamina|carpinter|ebanist|cl[oó]set|vestier|vestidor|alacena|cocinas? integral|escritorio|despiece|tablero|aglomerado|madecentro|zapater[oa]|tocador|repisa|cajonera|organizador de cubos|planos? (de|para) (mueble|cocina|cl[oó]set|cama|escritorio))/i
  },

  // 🍰 UPSELL POST-COMPRA: EMPRENDE DULCE 2026 ($5.000 COP)
  upsell_helados: {
    id: 'upsell_helados',
    nombre: 'Pack Emprende Dulce 2026 (Helados + Postres + Bonos)',
    emoji: '🍰',
    etiqueta: 'Upsell Dulce',
    color: '#f59e0b',
    precio: 5000,
    metaIds: []
  },

  // 🍨 EMPRENDE DULCE: HELADOS ARTESANALES & POSTRES EN VASO DOMO ($10.000 COP)
  helados: {
    id: 'helados',
    nombre: 'Guía Maestra de Helados Artesanales & Postres en Vaso Domo',
    emoji: '🍨',
    etiqueta: 'Postres',
    color: '#ec4899',
    precio: 10000,
    metaIds: [
      '120257885854810091', // Campaña histórica Emprende Dulce
      '120250521905500743'  // Anuncio "Chatea con nosotros" (postres)
    ],
    keywords: /(helad|postre|reposter|palet|vaso|torta|buñuel|natilla|dulce)/i
  }
};

// Palabras que nombran el producto sin ambigüedad. Con ellas el cliente puede pasar de un producto a otro
// aunque ya tuviera uno (por ejemplo, quien preguntó por moldes y ahora pide muebles).
const PIDE = {
  muebles: /\b(muebles?|melamina|carpinter\w*|ebanister\w*)\b/,
  moldes: /\b(moldes?|costura|patron(es)? de costura|modister\w*)\b/,
  helados: /\b(helad\w*|postres?|reposter\w*)\b/,
};
const sinTildes = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
// Producto que el mensaje nombra de forma explícita, o null si no nombra ninguno o nombra varios
function productoPedido(texto) {
  const t = sinTildes(texto);
  const hits = Object.keys(PIDE).filter((k) => PIDE[k].test(t));
  return hits.length === 1 ? hits[0] : null;
}

// Orden para las palabras clave: muebles antes que moldes ("pantalla" contiene "pantal"); los
// productos sin palabras clave (upsell) no se detectan por texto.
const ORDEN_PALABRAS = ['muebles', 'moldes', 'helados'];

/**
 * Identifica el producto de una conversación entrante.
 * @param {string} phone - Teléfono del cliente
 * @param {string} text - Texto del mensaje (si aplica)
 * @param {object|null} message - Objeto completo del mensaje de Meta WhatsApp Cloud API
 * @param {object|null} lead - Registro actual del lead en el store
 * @returns {{ producto: string, metodo: string, adId?: string, referral?: object }}
 */
function identificarProducto(phone, text = '', message = null, lead = null) {
  const t = (text || '').toLowerCase().trim();

  // 1. REGLA SUPREMA: REFERRAL DE META ADS. Primero el ID exacto en todos los productos;
  //    solo si ningún ID coincide (anuncio nuevo aún sin registrar) se usa el titular o el texto del anuncio.
  if (message && message.referral) {
    const ref = message.referral;
    const sourceId = String(ref.source_id || '').trim();
    const headline = (ref.headline || '').toLowerCase();
    const body = (ref.body || '').toLowerCase();
    const sourceUrl = (ref.source_url || '').toLowerCase();
    const todos = Object.values(PRODUCTOS);

    const porId = sourceId && todos.find((prod) => (prod.metaIds || []).includes(sourceId));
    if (porId) {
      console.log(`[CATALOG] ✅ Producto detectado por Meta Ad ID (${sourceId}): ${porId.id.toUpperCase()}`);
      return { producto: porId.id, metodo: 'META_AD_ID', adId: sourceId, referral: ref };
    }
    const porUrl = sourceUrl && todos.find((prod) => (prod.metaIds || []).some((id) => sourceUrl.includes(id)));
    if (porUrl) {
      console.log(`[CATALOG] ✅ Producto detectado por Meta source_url: ${porUrl.id.toUpperCase()}`);
      return { producto: porUrl.id, metodo: 'META_AD_URL', adId: sourceId, referral: ref };
    }
    const porTitular = ORDEN_PALABRAS.map((k) => PRODUCTOS[k]).find((prod) => prod.keywords && (prod.keywords.test(headline) || prod.keywords.test(body)));
    if (porTitular) {
      console.log(`[CATALOG] ✅ Producto detectado por titular del anuncio ("${ref.headline}"): ${porTitular.id.toUpperCase()}`);
      return { producto: porTitular.id, metodo: 'META_AD_HEADLINE', adId: sourceId, referral: ref };
    }
  }

  // 2. Coincidencia por palabras clave en el texto del mensaje
  if (t) {
    for (const k of ORDEN_PALABRAS) {
      if (PRODUCTOS[k].keywords.test(t)) {
        console.log(`[CATALOG] ✅ Producto detectado por palabras clave: ${k.toUpperCase()}`);
        return { producto: k, metodo: `TEXT_KEYWORD_${k.toUpperCase()}` };
      }
    }
  }

  // 3. Memoria del lead previo (si ya tenía producto asignado)
  if (lead && lead.producto) {
    return { producto: lead.producto, metodo: 'LEAD_HISTORY' };
  }

  // 4. Sin dato: el producto por defecto de la configuración (la campaña activa)
  let porDefecto = 'helados';
  try { porDefecto = require('./store').getSettings().productoPorDefecto || 'helados'; } catch (_) {}
  return { producto: PRODUCTOS[porDefecto] ? porDefecto : 'helados', metodo: 'DEFAULT' };
}

// Etiqueta y color de un producto para el panel. Para agregar un producto nuevo basta con
// sumarlo a PRODUCTOS con su emoji, etiqueta y color: el panel lo muestra solo.
const COLORES_EXTRA = ['#0ea5e9', '#f59e0b', '#10b981', '#ef4444', '#14b8a6', '#a855f7'];
function infoProducto(id) {
  if (!id) return { id: null, emoji: '❔', etiqueta: 'Sin identificar', color: '#64748b' };
  const p = PRODUCTOS[id];
  if (p) return { id, emoji: p.emoji || '📦', etiqueta: p.etiqueta || p.nombre, color: p.color || '#64748b', nombre: p.nombre };
  const i = [...String(id)].reduce((n, c) => n + c.charCodeAt(0), 0) % COLORES_EXTRA.length;
  return { id, emoji: '📦', etiqueta: id, color: COLORES_EXTRA[i] };
}

module.exports = {
  PRODUCTOS,
  productoPedido,
  identificarProducto,
  infoProducto
};
