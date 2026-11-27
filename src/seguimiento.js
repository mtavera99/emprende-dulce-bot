const store = require('./store');
const waService = require('./whatsappService');
const ventas = require('./ventas');
const accesos = require('./accesos');

const ACTIVO = process.env.SEGUIMIENTO_ACTIVO !== '0'; // Activo por defecto

async function enviarImagen(phone, url) {
  try {
    await waService.sendImage(phone, url);
    store.agregarMensaje(phone, { from: 'bot', text: `🖼️ [Imagen] ${url.split('/').pop()}`, type: 'image', mediaUrl: url });
  } catch (e) {
    console.error(`[SEGUIMIENTO] No se pudo enviar la imagen a +${phone}:`, e.message);
  }
}

async function ejecutarSeguimientos() {
  if (!ACTIVO) return;
  if (ventas.enHorarioSilencio()) return; // de 9 p. m. a 7 a. m. no se escribe

  const candidatos = store.obtenerCandidatosSeguimiento();
  if (candidatos.length === 0) return;

  console.log(`[SEGUIMIENTO] Evaluando ${candidatos.length} prospectos para seguimiento...`);

  for (const { phone, paso, lead } of candidatos) {
    try {
      // Doble verificación justo antes de enviar
      const actual = store.getLead(phone) || {};
      if (actual.status === 'PAGADO' || actual.paused || actual.optOut || store.compradorDe(phone, actual.producto) || accesos.completoDe(phone, actual.producto) || store.isPaused(phone)) continue;
      const producto = actual.producto || lead.producto || 'helados';

      // El descuento se ofrece desde el paso 1; quien ya tenía un precio menor (p. ej. $7.000) lo conserva
      if (paso === 1 || paso === 3) {
        // Moldes con planes y sin plan elegido: el descuento se muestra en los 3 planes; se acepta desde el del Básico
        if (producto === 'moldes' && require('./planes').hayPlanes() && !actual.plan) store.saveLead(phone, { descuentoPlanes: true });
        if (!actual.precioOfrecido || ventas.precioDe(actual) >= ventas.precioNormal(producto, actual.plan)) store.setLeadPrecio(phone, ventas.precioDescuento(producto, actual.plan));
      }
      const precio = ventas.precioDe(store.getLead(phone));

      if (paso === 4 && process.env.META_TEMPLATE_REMARKETING) {
        const templateName = process.env.META_TEMPLATE_REMARKETING;
        await waService.sendTemplate(phone, templateName);
        store.agregarMensaje(phone, { from: 'bot', text: `[PLANTILLA HSM REMARKETING: ${templateName}]`, type: 'text' });
        store.registrarSeguimientoEnviado(phone, paso);
        continue;
      }

      if (paso === 2) {
        const img = ventas.imagenes(producto);
        if (producto === 'moldes') {
          await enviarImagen(phone, img.portada);
          await enviarImagen(phone, img.mapa);
        } else if (producto === 'muebles') {
          await enviarImagen(phone, img.plano);
          await enviarImagen(phone, img.cortes);
        } else {
          await enviarImagen(phone, img.catalogo);
        }
        if (!actual.muestraEnviada) store.saveLead(phone, { step: 'MUESTRA_OFRECIDA' });
      } else {
        // Un "sí" a este mensaje significa "pásame los datos" (ver conversationFlow, punto J)
        store.saveLead(phone, { step: `SEGUIMIENTO_${paso}` });
      }

      let texto = ventas.textoSeguimiento(paso, producto, precio, store.getLead(phone) || {});
      if (paso === 2 && actual.muestraEnviada) {
        texto = texto.split('\n\n')[0] + `\n\nLa muestra gratis te la envié arriba. ¿Te paso los datos para el pack completo por *${ventas.cop(precio)}*?`;
      }
      await waService.sendTextMessage(phone, texto);
      store.agregarMensaje(phone, { from: 'bot', text: `[SEGUIMIENTO ${paso}/4] ${texto}`, type: 'text' });
      store.registrarSeguimientoEnviado(phone, paso);
      console.log(`[SEGUIMIENTO] Paso ${paso} enviado a +${phone}`);
    } catch (err) {
      console.error(`[SEGUIMIENTO ERROR] Falló envío a +${phone}:`, err.message);
    }
  }
}

// ----------------------------------------------------------------------------
// Seguimiento del acceso de prueba (estrategia HONESTIDAD)
// 1) a los 10 minutos: ¿qué te pareció? + cuentas
// 2) 10 minutos antes de vencer: aviso de cierre
// 3) al vencer: se cerró la prueba, la oferta sigue hasta mañana
// Se detiene solo cuando el cliente paga (lead PAGADO) o el chat está pausado.
// ----------------------------------------------------------------------------
function textoPrueba(paso, lead, settings) {
  const precio = Number(ventas.precioDe(lead)).toLocaleString('es-CO');
  const moldes = lead.producto === 'moldes';
  const muebles = lead.producto === 'muebles';
  const num = settings.nequiNumero || '3058742138';
  const cuentas = ventas.cuentas(settings);
  if (paso === 1) {
    return `¿Qué tal te pareció? 😊 Ya pudiste ver por dentro la calidad ${moldes ? 'de los moldes' : muebles ? 'de los planos' : 'de las recetas'}.\n\n` +
      `Si es lo que buscabas, te dejo las cuentas para tus *$${precio} COP*:\n\n${cuentas}\n\n` +
      `Apenas me envíes la foto del comprobante te desbloqueo ${moldes ? 'las 10 colecciones completas' : muebles ? `los ${ventas.infoPack('muebles').totales.planos.toLocaleString('es-CO')} planos, las guías y los bonos` : 'los 3 libros y todos los bonos'} al instante ${moldes ? '🧵' : muebles ? '🪚' : '🍰'}`;
  }
  if (paso === 2) {
    return `Tu acceso de prueba se cierra en 10 minutos ⏳\n\n` +
      `Si ya te convenció, envíame el comprobante de *$${precio}* y te dejo todo el pack desbloqueado de por vida 🙌`;
  }
  return `Se cerró tu acceso de prueba. Confié en tu palabra 🤝\n\n` +
    `Si todavía lo quieres, la oferta de *$${precio} COP* sigue en pie hasta mañana; solo envíame la foto del comprobante por aquí y te llega tu enlace personal con todo.`;
}

async function ejecutarSeguimientoPruebas() {
  if (!ACTIVO) return;
  const settings = store.getSettings();
  const ahora = Date.now();
  for (const { phone, lead } of store.leadsConPrueba()) {
    try {
      const pr = lead.prueba;
      if (lead.status === 'PAGADO' || lead.paused || lead.optOut || store.isPaused(phone) || store.compradorDe(phone, lead.producto)) continue;
      if (ventas.enHorarioSilencio()) continue;
      const pasos = pr.pasos || 0;
      let paso = 0;
      if (pasos === 0 && ahora >= pr.inicio + 10 * 60 * 1000 && ahora < pr.vence - 5 * 60 * 1000) paso = 1;
      else if (pasos <= 1 && ahora >= pr.vence - 10 * 60 * 1000 && ahora < pr.vence) paso = 2;
      else if (pasos <= 2 && ahora >= pr.vence && ahora < pr.vence + 6 * 60 * 60 * 1000) paso = 3;
      if (!paso) continue;
      const texto = textoPrueba(paso, lead, settings);
      await waService.sendTextMessage(phone, texto);
      store.agregarMensaje(phone, { from: 'bot', text: `[PRUEBA HONESTIDAD ${paso}/3] ${texto}`, type: 'text' });
      store.saveLead(phone, { prueba: { ...pr, pasos: paso } });
      console.log(`[SEGUIMIENTO PRUEBA] Paso ${paso} enviado a +${phone}`);
    } catch (err) {
      console.error(`[SEGUIMIENTO PRUEBA ERROR] +${phone}:`, err.message);
    }
  }
}

// ----------------------------------------------------------------------------
// Rescate a los 15 minutos: a quien recibió los datos de pago o la muestra y no ha
// vuelto a escribir. Una sola vez cada 24 h por cliente; nunca a compradores, a quien
// tiene un comprobante en revisión, pidió no recibir mensajes o está en horario de silencio.
// ----------------------------------------------------------------------------
async function ejecutarRescate15(ahora = Date.now()) {
  if (!ACTIVO || ventas.enHorarioSilencio(ahora)) return;
  const convs = store.todasLasConversaciones();
  for (const lead of store.getAllLeads()) {
    const r = lead.rescate;
    if (!r || r.enviado) continue;
    const phone = lead.phone;
    const espera = ahora - r.at;
    if (espera < 15 * 60 * 1000 || espera > 90 * 60 * 1000) continue;
    const conv = convs[phone];
    if (!conv || conv.pausado || (conv.ultimoDelCliente || 0) > r.at) continue; // ya respondió
    if (lead.paused || lead.optOut || lead.status === 'PAGADO' || store.compradorDe(phone, lead.producto) || accesos.completoDe(phone, lead.producto) || store.comprobantePendiente(phone)) continue;
    if (lead.rescateEnviadoAt && ahora - lead.rescateEnviadoAt < 24 * 60 * 60 * 1000) { store.saveLead(phone, { rescate: { ...r, enviado: true } }); continue; }
    try {
      const texto = ventas.textoRescate(r.tipo);
      await waService.sendTextMessage(phone, texto);
      store.agregarMensaje(phone, { from: 'bot', text: `[RESCATE 15 MIN] ${texto}`, type: 'text' });
      store.saveLead(phone, { rescate: { ...r, enviado: true }, rescateEnviadoAt: ahora });
      console.log(`[RESCATE] Enviado a +${phone} (${r.tipo})`);
    } catch (err) {
      console.error(`[RESCATE ERROR] +${phone}:`, err.message);
    }
  }
}

// ----------------------------------------------------------------------------
// Recordatorio de pago acordado: el cliente dijo "pago mañana al mediodía" y no ha vuelto a escribir.
// Un solo mensaje a la hora acordada, dentro de las 24 h de WhatsApp y fuera del horario de silencio.
// ----------------------------------------------------------------------------
async function ejecutarRecordatorioPago(ahora = Date.now()) {
  if (!ACTIVO || ventas.enHorarioSilencio(ahora)) return;
  const convs = store.todasLasConversaciones();
  for (const lead of store.getAllLeads()) {
    const pp = lead.pagoPospuesto;
    if (!pp || pp.enviado || !pp.recordarAt || ahora < pp.recordarAt) continue;
    const phone = lead.phone;
    const conv = convs[phone];
    if (!conv || conv.pausado || (conv.ultimoDelCliente || 0) > pp.at) continue; // ya volvió a escribir
    if (ahora - (conv.ultimoDelCliente || 0) >= 23.5 * 60 * 60 * 1000) { store.saveLead(phone, { pagoPospuesto: { ...pp, enviado: true, vencido: true } }); continue; }
    if (lead.paused || lead.optOut || store.compradorDe(phone, lead.producto) || accesos.completoDe(phone, lead.producto) || store.comprobantePendiente(phone)) continue;
    try {
      const texto = ventas.textoRecordatorioPago(ventas.precioDe(lead), ventas.cuentas(store.getSettings()));
      await waService.sendTextMessage(phone, texto);
      store.agregarMensaje(phone, { from: 'bot', text: `[RECORDATORIO DE PAGO ACORDADO] ${texto}`, type: 'text' });
      store.saveLead(phone, { pagoPospuesto: { ...pp, enviado: true, enviadoAt: ahora } });
      console.log(`[RECORDATORIO PAGO] Enviado a +${phone}`);
    } catch (err) {
      console.error(`[RECORDATORIO PAGO ERROR] +${phone}:`, err.message);
    }
  }
}

// Iniciar cron / intervalo en segundo plano (cada 5 minutos; la prueba se revisa cada minuto)
function iniciarScheduler(intervaloMs = 5 * 60 * 1000) {
  console.log(`[SEGUIMIENTO] Scheduler iniciado (revisa cada ${intervaloMs / 60000} minutos).`);
  setInterval(() => {
    ejecutarSeguimientos().catch(err => {
      console.error('[SEGUIMIENTO CRON ERROR]:', err);
    });
  }, intervaloMs);
  setInterval(() => {
    ejecutarSeguimientoPruebas().catch(err => console.error('[SEGUIMIENTO PRUEBA CRON ERROR]:', err));
    ejecutarRescate15().catch(err => console.error('[RESCATE CRON ERROR]:', err));
    ejecutarRecordatorioPago().catch(err => console.error('[RECORDATORIO PAGO CRON ERROR]:', err));
  }, 60 * 1000);
}

module.exports = {
  ejecutarSeguimientos,
  ejecutarSeguimientoPruebas,
  ejecutarRescate15,
  ejecutarRecordatorioPago,
  textoPrueba,
  iniciarScheduler
};
