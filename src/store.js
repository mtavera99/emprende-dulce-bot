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
let settings = loadJSON(SETTINGS_FILE, {
  precioOferta: 10000,
  nequiNumero: process.env.NEQUI_NUMERO || '3058742138',
  nequiTitular: process.env.NEQUI_TITULAR || 'Santiago Tavera',
  daviplataNumero: process.env.DAVIPLATA_NUMERO || '3058742138',
  llaveNumero: process.env.LLAVE_NUMERO || '3058742138',
  driveLink: process.env.GOOGLE_DRIVE_LINK || 'https://drive.google.com/drive/folders/emprende-dulce-pack-completo',
  botWhatsApp: process.env.BOT_WHATSAPP || '+573105652478'
});

const store = {
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
    settings = { ...settings, ...newSettings };
    saveJSON(SETTINGS_FILE, settings);
    return settings;
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

  crearPedido(phone, orderData = {}) {
    const id = `DULCE-${Date.now().toString().slice(-6)}`;
    const order = {
      id,
      phone,
      product: 'Colección Completa Emprende Dulce 2026 (3 Libros + 3 Bonos)',
      amount: settings.precioOferta || 10000,
      status: 'PENDIENTE', // PENDIENTE, VERIFICADO, RECHAZADO, ENTREGADO
      createdAt: Date.now(),
      paymentMethod: 'NEQUI',
      reference: null,
      comprobanteUrl: null,
      ocrData: null,
      aprobadoPor: null,
      driveLink: settings.driveLink,
      ...orderData
    };
    orders[id] = order;
    saveJSON(ORDERS_FILE, orders);
    store.saveLead(phone, { status: 'CON_CUENTA', activeOrderId: id });
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
      store.saveLead(ord.phone, { status: 'PAGADO', paidAt: Date.now() });
      const conv = store.obtenerConversacion(ord.phone);
      conv.esperaComprobante = false;
      saveJSON(CONVS_FILE, conversations);
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

  pedidosPendientes() {
    return Object.values(orders)
      .filter(o => o.status === 'PENDIENTE')
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  },

  pedidosVerificados() {
    return Object.values(orders)
      .filter(o => o.status === 'VERIFICADO' || o.status === 'ENTREGADO')
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  },

  // --------------------------------------------------------------------------
  // Seguimientos / Remarketing
  // --------------------------------------------------------------------------
  obtenerCandidatosSeguimiento() {
    const ahora = Date.now();
    const candidatos = [];

    for (const [phone, lead] of Object.entries(leads)) {
      if (lead.status === 'PAGADO') continue; // Ya pagó
      if (lead.paused) continue; // Operador humano activo
      const conv = conversations[phone];
      if (!conv || !conv.ultimoDelCliente) continue;

      const tiempoDesdeCliente = ahora - conv.ultimoDelCliente;
      const numEnviados = lead.seguimientosEnviados || 0;

      // Toque 1: entre 2h y 20h
      if (numEnviados === 0 && tiempoDesdeCliente >= 2 * 60 * 60 * 1000 && tiempoDesdeCliente < 20 * 60 * 60 * 1000) {
        candidatos.push({ phone, paso: 1, lead, conv });
      }
      // Toque 2: entre 24h y 48h
      else if (numEnviados === 1 && tiempoDesdeCliente >= 24 * 60 * 60 * 1000 && tiempoDesdeCliente < 48 * 60 * 60 * 1000) {
        candidatos.push({ phone, paso: 2, lead, conv });
      }
    }
    return candidatos;
  },

  registrarSeguimientoEnviado(phone, paso) {
    const lead = store.getLead(phone);
    if (!lead) return;
    lead.seguimientosEnviados = paso;
    lead.ultimoSeguimiento = Date.now();
    saveJSON(LEADS_FILE, leads);
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
