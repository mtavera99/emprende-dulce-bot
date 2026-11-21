// Exporta las conversaciones de WhatsApp agrupadas por el anuncio de Meta que las trajo,
// en un archivo de texto para analizar el embudo de venta.
//
// Privacidad: los teléfonos quedan con los últimos 4 dígitos, se ocultan los correos,
// los números largos dentro de los mensajes y los tokens de los enlaces de acceso
// (cualquiera con ese enlace podría descargar el producto).
const store = require('./store');

// Nombres de los anuncios conocidos (el ID es el source_id que Meta envía en el referral)
const NOMBRES_ANUNCIO = {
  '120250542591850743': 'C1 Confección, Singer y Patronaje · A1 Video Master Moldes 2000',
  '120250544614590743': 'C2 Diseño de Modas y Ropa · A2 Banner Azul Moldes 10.000',
  '120250544654690743': 'C3 Todo Colombia · A3 Póster Taller Modistería 10.000'
};
const SIN_ANUNCIO = 'sin_anuncio';
const TZ = 'America/Bogota';

function fecha(ms) {
  if (!ms) return '—';
  return new Date(ms).toLocaleString('es-CO', { timeZone: TZ, day: '2-digit', month: '2-digit', hour: 'numeric', minute: '2-digit', hour12: true });
}

function cop(v) {
  return '$' + Math.round(Number(v) || 0).toLocaleString('es-CO');
}

function telOculto(phone) {
  const d = String(phone || '').replace(/\D/g, '');
  return d ? `···${d.slice(-4)}` : '···';
}

function limpiarTexto(t) {
  return String(t == null ? '' : t)
    .replace(/\/(acceso|prueba|d)\/[A-Za-z0-9_-]{6,}/g, '/$1/[enlace oculto]')
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[correo oculto]')
    .replace(/\+?\d(?:[\s-]?\d){6,}/g, (m) => {
      const d = m.replace(/\D/g, '');
      return `[número ···${d.slice(-4)}]`;
    });
}

function ventasDe(phone) {
  return store.pedidosDeTelefono(phone).filter(o => o.status === 'VERIFICADO' || o.status === 'ENTREGADO');
}

// ID del anuncio de un cliente: el del pedido aprobado (queda fijo al comprar) o el del lead
function anuncioDe(phone, lead) {
  const venta = ventasDe(phone).slice(-1)[0];
  const id = (venta && venta.origen && venta.origen.adId) || (lead && ((lead.referral && lead.referral.source_id) || lead.adId));
  return id ? String(id) : SIN_ANUNCIO;
}

function nombreAnuncio(id, lead) {
  if (id === SIN_ANUNCIO) return 'Sin anuncio (escribieron directo o sin dato de Meta)';
  const titular = lead && lead.referral && lead.referral.headline;
  return NOMBRES_ANUNCIO[id] || titular || `Anuncio ${id}`;
}

// Hitos del embudo detectados en los mensajes guardados
function embudo(conv, lead, ventas) {
  const msgs = (conv && conv.messages) || [];
  const delBot = msgs.filter(m => m.from !== 'cliente');
  const delCliente = msgs.filter(m => m.from === 'cliente');
  const pedidos = store.pedidosDeTelefono(lead ? lead.phone : (conv && conv.phone));
  return {
    respondio: delCliente.length > 1,
    precio: delBot.some(m => /\$\s?\d{1,2}[.,]000|\d{1,2}[.,]000\s*(cop|pesos)/i.test(m.text || '')),
    datosPago: delBot.some(m => /nequi|daviplata|llave|bre-?b/i.test(m.text || '') && /\d{3}\s?\d{3}\s?\d{4}|@/.test(m.text || '')),
    prueba: !!(lead && lead.prueba && lead.prueba.token),
    comprobante: delCliente.some(m => m.type === 'image') || pedidos.some(o => o.comprobanteUrl || o.ocrData),
    compro: ventas.length > 0,
    descuento: ventas.some(v => Number(v.amount) > 0 && Number(v.amount) < 10000) || delBot.some(m => /7\.000/.test(m.text || '')),
    audios: delCliente.filter(m => m.type === 'audio').length
  };
}

function clientes() {
  const convs = store.todasLasConversaciones();
  const phones = new Set([...Object.keys(convs), ...store.getAllLeads().map(l => l.phone)]);
  const lista = [];
  for (const phone of phones) {
    const lead = store.getLead(phone);
    const conv = convs[phone] || { messages: [] };
    const msgs = conv.messages || [];
    if (!msgs.length) continue;
    const ventas = ventasDe(phone);
    const adId = anuncioDe(phone, lead);
    lista.push({
      phone, lead, conv, msgs, ventas, adId,
      anuncio: nombreAnuncio(adId, lead),
      primer: msgs[0].timestamp,
      ultimo: msgs[msgs.length - 1].timestamp,
      recaudo: ventas.reduce((s, v) => s + (Number(v.amount) || 0), 0),
      hitos: embudo(conv, lead, ventas)
    });
  }
  return lista;
}

// Resumen para el panel: un renglón por anuncio con conversaciones y compradores
function resumenPorAnuncio() {
  const grupos = {};
  for (const c of clientes()) {
    const g = grupos[c.adId] || (grupos[c.adId] = { adId: c.adId, anuncio: c.anuncio, conversaciones: 0, compradores: 0, recaudo: 0 });
    g.conversaciones += 1;
    if (c.ventas.length) g.compradores += 1;
    g.recaudo += c.recaudo;
  }
  return Object.values(grupos).sort((a, b) => (a.adId === SIN_ANUNCIO) - (b.adId === SIN_ANUNCIO) || b.conversaciones - a.conversaciones);
}

function pct(n, d) {
  return d ? `${Math.round((n / d) * 100)} %` : '—';
}

function bloqueEmbudo(lista) {
  const n = lista.length;
  const c = (k) => lista.filter(x => x.hitos[k]).length;
  return [
    `  Conversaciones ............................ ${n}`,
    `  Respondieron al primer mensaje del bot .... ${c('respondio')} (${pct(c('respondio'), n)})`,
    `  Recibieron el precio ...................... ${c('precio')} (${pct(c('precio'), n)})`,
    `  Recibieron prueba gratis .................. ${c('prueba')} (${pct(c('prueba'), n)})`,
    `  Recibieron datos de pago (Nequi, etc.) .... ${c('datosPago')} (${pct(c('datosPago'), n)})`,
    `  Enviaron comprobante ...................... ${c('comprobante')} (${pct(c('comprobante'), n)})`,
    `  Compraron ................................. ${c('compro')} (${pct(c('compro'), n)})`,
    `  Recaudo ................................... ${cop(lista.reduce((s, x) => s + x.recaudo, 0))}`
  ].join('\n');
}

function quien(m) {
  if (m.from === 'cliente') return 'CLIENTE';
  if (m.from === 'operador') return 'OPERADOR';
  return 'BOT';
}

function bloqueChat(i, c) {
  const L = c.lead || {};
  const h = c.hitos;
  const venta = c.ventas.slice(-1)[0];
  const estado = venta
    ? `COMPRÓ ${cop(c.recaudo)}${c.ventas.length > 1 ? ` en ${c.ventas.length} compras` : ''} · pagó ${fecha(venta.verifiedAt || venta.createdAt)} · ${Math.round(((venta.verifiedAt || venta.createdAt) - c.primer) / 60000)} min después del primer mensaje`
    : 'NO COMPRÓ';
  const marca = (b) => (b ? 'sí' : 'no');
  const cab = [
    '═'.repeat(78),
    `CHAT ${String(i).padStart(2, '0')} · Cliente ${telOculto(c.phone)} · ${estado}`,
    `Anuncio: ${c.anuncio}${c.adId !== SIN_ANUNCIO ? ` · ID ${c.adId}` : ''}`,
    `Producto: ${L.producto || '—'} · Estado del lead: ${L.status || '—'} · Paso: ${L.step || '—'} · Seguimientos enviados: ${L.seguimientosEnviados || 0}`,
    `Embudo: respondió ${marca(h.respondio)} · precio ${marca(h.precio)} · prueba ${marca(h.prueba)} · datos de pago ${marca(h.datosPago)} · comprobante ${marca(h.comprobante)} · descuento $7.000 ${marca(h.descuento)}${h.audios ? ` · notas de voz sin transcribir: ${h.audios}` : ''}`,
    `Primer mensaje: ${fecha(c.primer)} · Último: ${fecha(c.ultimo)} · Mensajes: ${c.msgs.length}${c.msgs.length >= 60 ? ' (el bot guarda solo los últimos 60)' : ''}`,
    '─'.repeat(78)
  ];
  const cuerpo = c.msgs.map(m => `[${fecha(m.timestamp)}] ${quien(m)}: ${limpiarTexto(m.text).replace(/\n+/g, '\n    ')}`);
  return cab.concat(cuerpo).join('\n');
}

/**
 * @param {{ anuncio?: string, soloCompradores?: boolean }} opciones
 *   anuncio: ID del anuncio, 'sin_anuncio' o 'todos'
 */
function exportarTexto({ anuncio = 'todos', soloCompradores = false } = {}) {
  let lista = clientes();
  if (anuncio !== 'todos') lista = lista.filter(c => c.adId === anuncio);
  const todosDelFiltro = lista;
  if (soloCompradores) lista = lista.filter(c => c.ventas.length);
  lista.sort((a, b) => (b.ventas.length > 0) - (a.ventas.length > 0) || a.primer - b.primer);

  const titulo = anuncio === 'todos' ? 'Todos los anuncios' : nombreAnuncio(anuncio, lista[0] && lista[0].lead) + (anuncio !== SIN_ANUNCIO ? ` · ID ${anuncio}` : '');
  const partes = [
    'EXPORTACIÓN DE CHATS · EMPRENDE DULCE BOT',
    `Generado: ${fecha(Date.now())} (hora de Colombia)`,
    `Filtro: ${titulo}${soloCompradores ? ' · solo compradores' : ''}`,
    'Privacidad: teléfonos con los últimos 4 dígitos; correos, números largos y enlaces de acceso ocultos.',
    '',
    'EMBUDO (todas las conversaciones del filtro)',
    bloqueEmbudo(todosDelFiltro)
  ];
  if (anuncio === 'todos') {
    partes.push('', 'POR ANUNCIO');
    for (const g of resumenPorAnuncio()) {
      partes.push(`  ${g.anuncio}${g.adId !== SIN_ANUNCIO ? ` (ID ${g.adId})` : ''}: ${g.conversaciones} conversaciones · ${g.compradores} compradores (${pct(g.compradores, g.conversaciones)}) · ${cop(g.recaudo)}`);
    }
  }
  partes.push('', `Chats en este archivo: ${lista.length} (primero los compradores)`, '');
  lista.forEach((c, i) => partes.push(bloqueChat(i + 1, c), ''));
  if (!lista.length) partes.push('No hay conversaciones para este filtro.');
  return partes.join('\n');
}

function anuncioValido(v) {
  const s = String(v || 'todos');
  return /^(\d{6,25}|todos|sin_anuncio)$/.test(s) ? s : null;
}

module.exports = { exportarTexto, resumenPorAnuncio, anuncioValido, limpiarTexto, telOculto, NOMBRES_ANUNCIO, SIN_ANUNCIO };
