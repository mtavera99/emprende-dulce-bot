const fs = require('fs');
const path = require('path');

// ============================================================================
// 💾 PERSISTENCIA EN DISCO - ESTÁNDAR BIKERPRO / RENDER
//
// 1. Detecta /var/data (Render Persistent Disk) o DATA_DIR configurado.
//    Si no existe o estamos en desarrollo local, cae a ./data
// 2. Escritura atómica (guarda en .tmp y renombra) para evitar corrupción de
//    archivos si el proceso se reinicia o se despliega en medio de una escritura.
// ============================================================================

const DISCO_RENDER = '/var/data';
const DIR =
  process.env.DATA_DIR ||
  (fs.existsSync(DISCO_RENDER) ? DISCO_RENDER : path.join(__dirname, '..', 'data'));

if (!fs.existsSync(DIR)) {
  fs.mkdirSync(DIR, { recursive: true });
}

const LEADS_FILE = path.join(DIR, 'leads.json');
const ORDERS_FILE = path.join(DIR, 'pedidos.json');
const CONVS_FILE = path.join(DIR, 'conversations.json');
const SETTINGS_FILE = path.join(DIR, 'settings.json');
const DELIVERY_FILE = path.join(DIR, 'delivery-statuses.json');
const MEDIA_DIR = path.join(DIR, 'media');
if (!fs.existsSync(MEDIA_DIR)) fs.mkdirSync(MEDIA_DIR, { recursive: true });
const EXT_MIME = { 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };

// Origen de una venta, a partir de la atribución guardada en el lead
function origenDeLead(lead) {
  if (!lead) return { canal: 'Directo / sin dato', detalle: '' };
  const ref = lead.referral || {};
  const metodo = lead.metodoDeteccion || '';
  if (ref.source_id || ref.source_url || ref.headline || metodo.startsWith('META')) {
    return {
      canal: 'Anuncio de Meta',
      detalle: [ref.headline, ref.source_id ? `ID ${ref.source_id}` : (lead.adId ? `ID ${lead.adId}` : '')].filter(Boolean).join(' · '),
      adId: ref.source_id || lead.adId || null,
      ctwaClid: ref.ctwa_clid || lead.ctwaClid || null,
      metodo
    };
  }
  if (metodo.startsWith('TEXT_KEYWORD')) return { canal: 'Mensaje con palabra clave', detalle: metodo.replace('TEXT_KEYWORD_', '').toLowerCase(), metodo };
  if (metodo) return { canal: 'Directo / sin dato', detalle: metodo, metodo };
  return { canal: 'Directo / sin dato', detalle: '' };
}

function loadJSON(filePath, defaultVal = {}) {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error(`[STORE] Error leyendo ${filePath}:`, err.message);
  }
  return defaultVal;
}

function saveJSON(filePath, data) {
  const tmpPath = `${filePath}.tmp`;
  try {
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmpPath, filePath);
  } catch (err) {
    console.error(`[STORE] Error guardando ${filePath}:`, err.message);
    try {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    } catch {}
  }
}

// Estados en memoria
let leads = loadJSON(LEADS_FILE, {});
let orders = loadJSON(ORDERS_FILE, {});
let conversations = loadJSON(CONVS_FILE, {});
let deliveryStatuses = loadJSON(DELIVERY_FILE, []);
let settings = loadJSON(SETTINGS_FILE, {
  precioOferta: 10000,
  nequiNumero: process.env.NEQUI_NUMERO || '3058742138',
  nequiTitular: process.env.NEQUI_TITULAR || 'Manuel Tavera',
  daviplataNumero: process.env.DAVIPLATA_NUMERO || '3058742138',
  llaveNumero: process.env.LLAVE_NUMERO || '3058742138',
  driveLink: process.env.GOOGLE_DRIVE_LINK || 'https://drive.google.com/drive/folders/1k5L4D-td0Qsyurc8bWxBkKLTBGIrv3fX?usp=sharing',
  driveLinkMoldes: process.env.GOOGLE_DRIVE_LINK_MOLDES || 'https://drive.google.com/drive/folders/15Mnij3UurwpXKG4Da_sdt77mfUGQPGx5?usp=sharing',
  driveLinkMuebles: process.env.GOOGLE_DRIVE_LINK_MUEBLES || '',
  botWhatsApp: process.env.BOT_WHATSAPP || '+573105652478',
  modoAutoEntregaLeona: true
});

// Valores nuevos para instalaciones que ya tenían settings.json guardado
if (!settings.precioDescuento) settings.precioDescuento = Number(process.env.PRECIO_DESCUENTO) || 8000;
if (!settings.productoPorDefecto) settings.productoPorDefecto = process.env.PRODUCTO_POR_DEFECTO || 'moldes';

if (settings.driveLinkMuebles === undefined) settings.driveLinkMuebles = process.env.GOOGLE_DRIVE_LINK_MUEBLES || '';

if (!settings.driveLinkMoldes) {
  settings.driveLinkMoldes = process.env.GOOGLE_DRIVE_LINK_MOLDES || 'https://drive.google.com/drive/folders/15Mnij3UurwpXKG4Da_sdt77mfUGQPGx5?usp=sharing';
}

const store = {
  // Carpeta de Google Drive de respaldo de cada producto ('' si no hay)
  driveDe(producto) {
    const s = settings;
    const link = producto === 'moldes' ? s.driveLinkMoldes : producto === 'muebles' ? s.driveLinkMuebles : s.driveLink;
    return String(link || '').trim();
  },

  getDir() {
    return DIR;
  },

  esDiscoPersistente() {
    return DIR.startsWith(DISCO_RENDER) || !!process.env.DATA_DIR;
  },

  // --------------------------------------------------------------------------
  // Configuración
  // --------------------------------------------------------------------------
  getSettings() {
    return settings;
  },

  updateSettings(newSettings) {
    // Los campos vacíos no borran el valor guardado
    const limpios = Object.fromEntries(Object.entries(newSettings || {}).filter(([, v]) => v !== undefined));
    settings = { ...settings, ...limpios };
    saveJSON(SETTINGS_FILE, settings);
    return settings;
  },

  registrarEstadoEntrega(status = {}) {
    const event = {
      id: status.id || null,
      recipientId: status.recipient_id || null,
      status: status.status || 'unknown',
      timestamp: status.timestamp ? Number(status.timestamp) * 1000 : Date.now(),
      conversation: status.conversation || null,
      pricing: status.pricing || null,
      errors: status.errors || []
    };
    deliveryStatuses.unshift(event);
    deliveryStatuses = deliveryStatuses.slice(0, 200);
    saveJSON(DELIVERY_FILE, deliveryStatuses);
    return event;
  },

  estadosEntrega() {
    return deliveryStatuses.slice();
  },

  // --------------------------------------------------------------------------
  // Leads & Prospectos
  // --------------------------------------------------------------------------
  getLead(phone) {
    return leads[phone] || null;
  },

  saveLead(phone, data) {
    const existing = leads[phone] || {
      phone,
      createdAt: Date.now(),
      status: 'NUEVO', // NUEVO, INTERESADO, ESPERA_PAGO, PAGADO, PAUSADO
      paused: false,
      step: 'INICIO',
      seguimientosEnviados: 0,
      ultimoSeguimiento: 0,
      lastInteraction: Date.now()
    };
    leads[phone] = {
      ...existing,
      ...data,
      phone,
      lastInteraction: Date.now()
    };
    saveJSON(LEADS_FILE, leads);
    return leads[phone];
  },

  getAllLeads() {
    return Object.values(leads).sort((a, b) => (b.lastInteraction || 0) - (a.lastInteraction || 0));
  },

  // --------------------------------------------------------------------------
  // Conversaciones e Historial de Mensajes
  // --------------------------------------------------------------------------
  todasLasConversaciones() {
    return conversations;
  },

  obtenerConversacion(phone) {
    if (!conversations[phone]) {
      conversations[phone] = {
        phone,
        messages: [],
        perfil: {},
        ultimoDelCliente: 0,
        ultimoDelBot: 0,
        pausado: false,
        atendido: false,
        esperaComprobante: false
      };
    }
    return conversations[phone];
  },

  agregarMensaje(phone, { from, text, type = 'text', mediaUrl = null, wamid = null, timestamp = Date.now() }) {
    const conv = store.obtenerConversacion(phone);
    if (!conv.messages) conv.messages = [];

    const esCliente = from !== 'bot';
    if (esCliente) {
      conv.ultimoDelCliente = timestamp;
      conv.atendido = false; // Nuevo mensaje reactiva la necesidad de atención si el bot no está pausado
    } else {
      conv.ultimoDelBot = timestamp;
    }

    const msgObj = {
      from,
      text,
      type,
      mediaUrl,
      wamid,
      timestamp
    };

    conv.messages.push(msgObj);

    // Bounded memory: últimos 60 mensajes para mantener el panel rápido y ligero
    if (conv.messages.length > 60) {
      conv.messages = conv.messages.slice(-60);
    }

    saveJSON(CONVS_FILE, conversations);
    store.saveLead(phone, { lastMessage: text, lastInteraction: timestamp });
    return msgObj;
  },

  actualizarPerfil(phone, perfil) {
    const conv = store.obtenerConversacion(phone);
    conv.perfil = { ...conv.perfil, ...perfil };
    saveJSON(CONVS_FILE, conversations);
  },

  marcarAtendido(phone, atendido = true) {
    const conv = store.obtenerConversacion(phone);
    conv.atendido = !!atendido;
    saveJSON(CONVS_FILE, conversations);
  },

  // Pausa / Human takeover (silencia el bot para que hable el operador)
  setPaused(phone, isPaused) {
    const conv = store.obtenerConversacion(phone);
    conv.pausado = !!isPaused;
    saveJSON(CONVS_FILE, conversations);
    store.saveLead(phone, { paused: !!isPaused });
    return conv.pausado;
  },

  isPaused(phone) {
    const conv = conversations[phone];
    return !!(conv && conv.pausado);
  },

  // --------------------------------------------------------------------------
  // Pedidos y Ventas
  // --------------------------------------------------------------------------
  todosLosPedidos() {
    return Object.values(orders).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  },

  obtenerPedido(id) {
    return orders[id] || null;
  },

  obtenerPedidoPorTelefono(phone) {
    return Object.values(orders).reverse().find(o => o.phone === phone);
  },

  pedidosDeTelefono(phone) {
    return Object.values(orders).filter(o => o.phone === phone).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  },

  crearPedido(phone, orderData = {}) {
    const lead = store.getLead(phone);
    // Comprador que está pagando el upsell: el pedido es del pack Emprende Dulce aunque quede en revisión manual
    const prodId = orderData.producto || (lead && lead.esperaUpsell ? 'upsell_helados' : null) || (lead && lead.producto) || 'helados';

    // 1. Si ya existe un pedido PENDIENTE para este mismo teléfono, NO crear un duplicado;
    // actualizar el existente con los nuevos datos recibidos.
    const pedidoExistente = Object.values(orders).find(
      o => o.phone === phone && o.status === 'PENDIENTE'
    );
    if (pedidoExistente) {
      const actualizacion = {
        ...orderData,
        producto: prodId,
        updatedAt: Date.now()
      };
      delete actualizacion.id;
      delete actualizacion.createdAt;
      return store.actualizarPedido(pedidoExistente.id, actualizacion);
    }

    const id = `DULCE-${Date.now().toString().slice(-6)}`;
    const nombreProd = { moldes: 'Mega Pack +2.000 Moldes y Patrones de Costura en PDF', muebles: 'Mega Pack de Carpintería y Muebles en Melamina 2026', upsell_helados: 'Pack Emprende Dulce 2026 (upsell)' }[prodId]
      || 'Colección Completa Emprende Dulce 2026 (3 Libros + 3 Bonos)';
    const driveLink = store.driveDe(prodId);

    const order = {
      id,
      phone,
      origen: origenDeLead(lead),
      producto: prodId,
      product: nombreProd,
      amount: require('./ventas').precioDe({ ...(lead || {}), producto: prodId }),
      status: 'PENDIENTE', // PENDIENTE, VERIFICADO, RECHAZADO, ENTREGADO
      createdAt: Date.now(),
      paymentMethod: 'NEQUI',
      reference: null,
      comprobanteUrl: null,
      ocrData: null,
      aprobadoPor: null,
      driveLink,
      ...orderData
    };
    orders[id] = order;
    saveJSON(ORDERS_FILE, orders);
    store.saveLead(phone, { status: 'CON_CUENTA', activeOrderId: id, producto: prodId });
    return order;
  },

  actualizarPedido(id, data) {
    if (!orders[id]) return null;
    orders[id] = { ...orders[id], ...data, updatedAt: Date.now() };
    saveJSON(ORDERS_FILE, orders);
    return orders[id];
  },

  aprobarPedido(id, { reference = null, aprobadoPor = 'operador' } = {}) {
    const ord = store.actualizarPedido(id, {
      status: 'VERIFICADO',
      reference: reference || orders[id]?.reference || 'MANUAL-OK',
      aprobadoPor,
      verifiedAt: Date.now()
    });
    if (ord) {
      // Auto-descartar cualquier otro pedido PENDIENTE duplicado de este mismo teléfono
      Object.values(orders).forEach(o => {
        if (o.phone === ord.phone && o.id !== ord.id && o.status === 'PENDIENTE') {
          o.status = 'DESCARTADO';
          o.motivoDescarte = `Auto-resuelto tras aprobar pedido principal ${ord.id}`;
          o.discardedAt = Date.now();
        }
      });
      saveJSON(ORDERS_FILE, orders);

      store.saveLead(ord.phone, { status: 'PAGADO', paidAt: Date.now(), producto: ord.producto || 'helados', productoFijado: true });
      const conv = store.obtenerConversacion(ord.phone);
      if (conv) {
        conv.esperaComprobante = false;
        saveJSON(CONVS_FILE, conversations);
      }
    }
    return ord;
  },

  rechazarPedido(id, motivo = 'Comprobante no válido o ilegible') {
    const ord = store.actualizarPedido(id, {
      status: 'RECHAZADO',
      motivoRechazo: motivo,
      rejectedAt: Date.now()
    });
    return ord;
  },

  descartarPedido(id, motivo = 'Descartado manualmente por operador (sin notificar)') {
    const ord = store.actualizarPedido(id, {
      status: 'DESCARTADO',
      motivoDescarte: motivo,
      discardedAt: Date.now()
    });
    if (ord) {
      // Liberar al lead de pedido pendiente activo si corresponde
      const lead = store.getLead(ord.phone);
      if (lead && lead.activeOrderId === id) {
        store.saveLead(ord.phone, { activeOrderId: null });
      }
    }
    return ord;
  },

  pedidosPendientes() {
    // Deduplica por teléfono para que nunca se muestren múltiples tarjetas del mismo cliente
    const seenPhones = new Set();
    return Object.values(orders)
      .filter(o => o.status === 'PENDIENTE')
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .filter(o => {
        if (seenPhones.has(o.phone)) return false;
        seenPhones.add(o.phone);
        return true;
      });
  },

  pedidosVerificados() {
    return Object.values(orders)
      .filter(o => o.status === 'VERIFICADO' || o.status === 'ENTREGADO')
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  },

  // --------------------------------------------------------------------------
  // Seguimientos / Remarketing
  // --------------------------------------------------------------------------
  // Seguimientos pendientes. Reglas:
  // - nunca a quien ya compró, tiene un comprobante en revisión, pidió no recibir mensajes o está en manos del operador
  // - solo dentro de las 24 h desde el último mensaje del cliente (ventana de WhatsApp)
  // - el paso siguiente sale cuando pasó su tiempo mínimo y al menos 90 min desde el anterior;
  //   si ya pasaron 18 h se salta directo al último paso. El horario de silencio lo controla seguimiento.js
  obtenerCandidatosSeguimiento() {
    const ahora = Date.now();
    const H = 60 * 60 * 1000;
    const ESPERA = { 1: 2 * H, 2: 4 * H, 3: 6 * H, 4: 18 * H };
    const candidatos = [];

    for (const [phone, lead] of Object.entries(leads)) {
      if (lead.status === 'PAGADO' || store.compradorDe(phone, lead.producto)) continue;
      if (lead.paused || lead.optOut) continue;
      if (store.comprobantePendiente(phone)) continue;
      const conv = conversations[phone];
      if (!conv || !conv.ultimoDelCliente || conv.pausado) continue;
      // Prometió pagar después y no ha vuelto a escribir: solo recibe el recordatorio acordado (seguimiento.js)
      if (lead.pagoPospuesto && conv.ultimoDelCliente <= lead.pagoPospuesto.at) continue;

      const tiempoDesdeCliente = ahora - conv.ultimoDelCliente;
      if (tiempoDesdeCliente >= 23.5 * H) continue;
      const enviados = lead.seguimientosEnviados || 0;
      if (enviados >= 4) continue;
      // Separación mínima entre seguimientos seguidos (si el cliente no ha respondido entre ellos)
      const ultimo = lead.ultimoSeguimiento || 0;
      if (ultimo > conv.ultimoDelCliente && ahora - ultimo < 1.5 * H) continue;

      let paso = enviados + 1;
      if (tiempoDesdeCliente >= ESPERA[4]) paso = 4;
      if (tiempoDesdeCliente < ESPERA[paso]) continue;
      candidatos.push({ phone, paso, lead, conv });
    }
    return candidatos;
  },

  // Tiene una venta aprobada (de cualquier producto, o del indicado)
  yaCompro(phone, producto = null) {
    return Object.values(orders).some(o => o.phone === phone && (o.status === 'VERIFICADO' || o.status === 'ENTREGADO') && (!producto || (o.producto || 'helados') === producto));
  },

  // Compró este producto (el upsell de Emprende Dulce cuenta como el pack de postres). Sin producto: cualquier compra.
  compradorDe(phone, producto = null) {
    if (!producto) return store.yaCompro(phone);
    if (producto === 'helados' || producto === 'upsell_helados') return store.yaCompro(phone, 'helados') || store.yaCompro(phone, 'upsell_helados');
    return store.yaCompro(phone, producto);
  },

  // Mandó un comprobante que sigue en revisión del operador
  comprobantePendiente(phone) {
    return Object.values(orders).some(o => o.phone === phone && o.status === 'PENDIENTE');
  },

  leadsConPrueba() {
    return Object.entries(leads).filter(([, l]) => l.prueba && l.prueba.token).map(([phone, lead]) => ({ phone, lead }));
  },

  setLeadPrecio(phone, precio) {
    const lead = store.getLead(phone);
    if (!lead) return;
    lead.precioOfrecido = Number(precio) || 10000;
    lead.precioProducto = lead.producto || null;
    saveJSON(LEADS_FILE, leads);
  },

  registrarSeguimientoEnviado(phone, paso) {
    const lead = store.getLead(phone);
    if (!lead) return;
    lead.seguimientosEnviados = paso;
    lead.ultimoSeguimiento = Date.now();
    saveJSON(LEADS_FILE, leads);
  },

  // --------------------------------------------------------------------------
  // Comprobantes (imágenes recibidas por WhatsApp)
  // --------------------------------------------------------------------------
  dataDir() { return DIR; },

  guardarMedia(phone, buffer, mimeType = 'image/jpeg') {
    if (!buffer || !buffer.length) return null;
    const ext = EXT_MIME[String(mimeType).toLowerCase()] || 'jpg';
    const nombre = `${String(phone).replace(/\D/g, '')}_${Date.now()}.${ext}`;
    fs.writeFileSync(path.join(MEDIA_DIR, nombre), buffer);
    return `/panel/media/${nombre}`;
  },

  rutaMedia(nombre) {
    const limpio = path.basename(String(nombre || ''));
    if (!/^[0-9]+_[0-9]+\.(jpg|png|webp|gif)$/.test(limpio)) return null;
    const f = path.join(MEDIA_DIR, limpio);
    return fs.existsSync(f) ? f : null;
  },

  origenDeLead,

  // Ventas confirmadas agrupadas por producto y por origen
  resumenVentas() {
    const ventas = Object.values(orders).filter(o => o.status === 'VERIFICADO' || o.status === 'ENTREGADO');
    const porProducto = {};
    const porOrigen = {};
    for (const o of ventas) {
      const prod = o.producto || 'helados';
      const origen = (o.origen && o.origen.canal) || origenDeLead(leads[o.phone]).canal;
      porProducto[prod] = porProducto[prod] || { ventas: 0, recaudo: 0, manuales: 0 };
      porProducto[prod].ventas += 1;
      porProducto[prod].recaudo += Number(o.amount) || 0;
      if (!o.aprobadoPor || o.aprobadoPor === 'operador' || o.aprobadoPor === 'panel') porProducto[prod].manuales += 1;
      const k = `${prod}|${origen}`;
      porOrigen[k] = porOrigen[k] || { producto: prod, origen, ventas: 0, recaudo: 0 };
      porOrigen[k].ventas += 1;
      porOrigen[k].recaudo += Number(o.amount) || 0;
    }
    const leadsPorProducto = {};
    Object.values(leads).forEach(l => { const p = l.producto || 'helados'; leadsPorProducto[p] = (leadsPorProducto[p] || 0) + 1; });
    return { porProducto, porOrigen: Object.values(porOrigen).sort((a, b) => b.ventas - a.ventas), leadsPorProducto, total: ventas.length };
  },

  // --------------------------------------------------------------------------
  // Métricas y KPIs
  // --------------------------------------------------------------------------
  metricas() {
    const allOrders = Object.values(orders);
    const verified = allOrders.filter(o => o.status === 'VERIFICADO' || o.status === 'ENTREGADO');
    const pending = allOrders.filter(o => o.status === 'PENDIENTE');
    const totalRecaudo = verified.reduce((sum, o) => sum + (Number(o.amount) || 10000), 0);

    const hoyBogota = new Date().toLocaleDateString('es-CO', { timeZone: 'America/Bogota' });
    const pedidosHoy = verified.filter(o => {
      const fecha = new Date(o.verifiedAt || o.createdAt).toLocaleDateString('es-CO', { timeZone: 'America/Bogota' });
      return fecha === hoyBogota;
    });
    const recaudoHoy = pedidosHoy.reduce((sum, o) => sum + (Number(o.amount) || 10000), 0);

    const allLeads = Object.values(leads);
    const leadsHoy = allLeads.filter(l => {
      const fecha = new Date(l.createdAt).toLocaleDateString('es-CO', { timeZone: 'America/Bogota' });
      return fecha === hoyBogota;
    });

    const tasaCierre = allLeads.length > 0 ? ((verified.length / allLeads.length) * 100).toFixed(1) : 0;
    const esperandoHumano = Object.values(conversations).filter(c => c.pausado || (!c.atendido && c.ultimoDelCliente > c.ultimoDelBot)).length;

    return {
      pedidosHoy: pedidosHoy.length,
      recaudoHoy,
      totalVentas: verified.length,
      totalRecaudo,
      pedidosPendientes: pending.length,
      conComprobante: pending.filter(p => !!p.comprobanteUrl || !!p.ocrData).length,
      leadsTotales: allLeads.length,
      leadsHoy: leadsHoy.length,
      tasaCierre,
      esperandoHumano,
      discoPersistente: store.esDiscoPersistente(),
      rutaDisco: DIR
    };
  }
};

module.exports = store;
