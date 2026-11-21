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
 * 4. FALLBACK: Helados y Postres (Emprende Dulce) como producto base.
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
      '120250542591850743', // Anuncio 1: [A1-VIDEO] - Master Moldes 2000 Subtitulado 35s
      '120250544614590743', // Anuncio 2: [A2-IMAGEN] - Banner Azul Moldes 10.000
      '120250544654690743'  // Anuncio 3: [A3-IMAGEN] - Poster Taller Modistería 10.000
    ],
    // Detección por palabras clave en titular del anuncio o mensaje del cliente
    keywords: /(molde|patr[oó]n|costur|confecci|ropa|vestid|blusa|pantal|panties|lencer|coser|modist|talla|imprimir.*casa|hoja carta)/i
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

  // 1. REGLA SUPREMA: REFERRAL DE META ADS (source_id del anuncio)
  if (message && message.referral) {
    const ref = message.referral;
    const sourceId = String(ref.source_id || '').trim();
    const headline = (ref.headline || '').toLowerCase();
    const body = (ref.body || '').toLowerCase();
    const sourceUrl = (ref.source_url || '').toLowerCase();

    for (const prodKey of Object.keys(PRODUCTOS)) {
      const prod = PRODUCTOS[prodKey];
      
      // Coincidencia exacta por ID de Meta (anuncio, conjunto o campaña)
      if (sourceId && prod.metaIds.includes(sourceId)) {
        console.log(`[CATALOG] ✅ Producto detectado por Meta Ad ID (${sourceId}): ${prod.id.toUpperCase()}`);
        return {
          producto: prod.id,
          metodo: 'META_AD_ID',
          adId: sourceId,
          referral: ref
        };
      }

      // Coincidencia por ID dentro del source_url si vino allí
      if (sourceUrl && prod.metaIds.some(id => sourceUrl.includes(id))) {
        console.log(`[CATALOG] ✅ Producto detectado por Meta source_url: ${prod.id.toUpperCase()}`);
        return {
          producto: prod.id,
          metodo: 'META_AD_URL',
          adId: sourceId,
          referral: ref
        };
      }

      // Coincidencia por titular o cuerpo del anuncio de Meta
      if (prod.keywords.test(headline) || prod.keywords.test(body)) {
        console.log(`[CATALOG] ✅ Producto detectado por titular del anuncio ("${ref.headline}"): ${prod.id.toUpperCase()}`);
        return {
          producto: prod.id,
          metodo: 'META_AD_HEADLINE',
          adId: sourceId,
          referral: ref
        };
      }
    }
  }

  // 2. Coincidencia por palabras clave en el texto del mensaje
  if (t) {
    if (PRODUCTOS.moldes.keywords.test(t)) {
      console.log(`[CATALOG] ✅ Producto detectado por palabras clave de Moldes/Costura`);
      return { producto: 'moldes', metodo: 'TEXT_KEYWORD_MOLDES' };
    }
    if (PRODUCTOS.helados.keywords.test(t)) {
      console.log(`[CATALOG] ✅ Producto detectado por palabras clave de Helados/Postres`);
      return { producto: 'helados', metodo: 'TEXT_KEYWORD_HELADOS' };
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
  identificarProducto,
  infoProducto
};
