require('dotenv').config();
const express = require('express');
const path = require('path');
const store = require('./store');
const conversationFlow = require('./conversationFlow');
const waService = require('./whatsappService');
const panel = require('./panel');
const panelChat = require('./panel-chat');
const seguimiento = require('./seguimiento');
const paymentVerifier = require('./paymentVerifier');
const fs = require('fs');
const accesos = require('./accesos');
const paginaAcceso = require('./paginaAcceso');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'lowticket_verify_token_2026';
const PANEL_TOKEN = panel.panelToken();

// Middleware de autenticación para rutas del panel y APIs
function authPanel(req, res, next) {
  const token = req.query.token || req.headers['x-panel-token'] || req.body?.token;
  if (!token || token !== PANEL_TOKEN) {
    return res.status(403).send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="utf-8">
        <title>Acceso Denegado · Emprende Dulce</title>
        <style>
          body { background: #0b0f17; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .box { background: #151c28; border: 1px solid #222f44; padding: 30px; border-radius: 12px; text-align: center; max-width: 400px; }
          h2 { color: #ef4444; margin-bottom: 10px; }
          p { color: #94a3b8; font-size: 0.9rem; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="box">
          <h2>🔒 Acceso No Autorizado</h2>
          <p>Para entrar al panel debes incluir tu token de seguridad en la URL:<br><code>/panel?token=TU_TOKEN</code></p>
        </div>
      </body>
      </html>
    `);
  }
  next();
}

// ----------------------------------------------------------------------------
// 1. Health check para Render
// ----------------------------------------------------------------------------
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    app: 'Emprende Dulce Bot',
    product: 'Colección Repostería y Helados Artesanales ($10.000 COP)',
    discoPersistente: store.esDiscoPersistente(),
    rutaDatos: store.getDir(),
    timestamp: new Date().toISOString()
  });
});

app.get('/privacidad', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Política de Privacidad · Emprende Dulce</title>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;background:#0b0f19;color:#e8edf7;line-height:1.6;margin:0;padding:0}
  .wrap{max-width:760px;margin:0 auto;padding:40px 22px}
  h1{color:#eab308;font-size:26px}
  h2{color:#4f9dff;font-size:18px;margin-top:28px}
  a{color:#4f9dff}
  .muted{color:#9aa7c2;font-size:14px}
</style>
</head>
<body>
<div class="wrap">
  <h1>Política de Privacidad — Emprende Dulce 🍰</h1>
  <p class="muted">Última actualización: 17 de noviembre de 2026</p>
  <p>En <strong>Emprende Dulce</strong> respetamos tu privacidad. Esta política explica cómo recopilamos, usamos y protegemos la información suministrada al comunicarte con nuestra línea oficial de atención en WhatsApp.</p>
  <h2>1. Información recopilada</h2>
  <p>Recopilamos tu número de teléfono, nombre de contacto y comprobantes de pago enviados voluntariamente para la entrega digital de los recetarios.</p>
  <h2>2. Uso de la información</h2>
  <p>Tus datos son utilizados exclusivamente para la entrega del material educativo digital adquirido y el soporte postventa.</p>
  <h2>3. Contacto</h2>
  <p>Para cualquier duda o solicitud de eliminación de datos, contáctanos en soporte@emprendedulce.com o directamente en nuestra línea oficial de WhatsApp (+57 310 5652478).</p>
</div>
</body>
</html>`);
});

// Servir archivos descargables y portal
// En /descargas solo quedan públicas las imágenes; los PDF, ZIP y planillas requieren enlace personal
app.use('/descargas', (req, res, next) => {
  if (/\.(jpe?g|png|webp|gif|svg)$/i.test(req.path)) return next();
  res.status(403).send(paginaAcceso.paginaNoValida('bloqueado'));
}, express.static(path.join(__dirname, '../public/descargas')));
app.use('/portal', express.static(path.join(__dirname, '../public/portal')));

// Portal Multi-Nicho de Superpacks Digitales (Estilo Creativos A-Z)
app.get(['/portal', '/catalogo', '/tienda'], (req, res) => {
  res.sendFile(path.join(__dirname, '../public/portal/index.html'));
});

// Páginas del comprador. Los archivos del pack ya no son públicos: se descargan con un
// enlace personal (/acceso/<token>) o de prueba (HONESTIDAD), que se revisa en cada descarga.
app.get(['/descargar', '/acceso'], (req, res) => {
  const prod = (req.query.p === 'moldes' || req.query.producto === 'moldes') ? 'moldes' : 'helados';
  res.send(paginaAcceso.paginaPublica(prod));
});
app.get(['/descargar-moldes', '/acceso-moldes'], (req, res) => res.send(paginaAcceso.paginaPublica('moldes')));

app.get(['/acceso/:token', '/prueba/:token'], (req, res) => {
  const st = accesos.estado(req.params.token);
  res.set('Cache-Control', 'no-store');
  if (!st.ok) return res.status(st.motivo === 'no_existe' ? 404 : 410).send(paginaAcceso.paginaNoValida(st.motivo, st.acceso));
  accesos.registrarUso(st.acceso.token, 'vistas');
  res.send(st.acceso.tipo === 'prueba' ? paginaAcceso.paginaPrueba(st.acceso) : paginaAcceso.paginaCompleta(st.acceso));
});

app.get('/d/:token/:id', (req, res) => {
  const st = accesos.estado(req.params.token);
  if (!st.ok) return res.status(410).send(paginaAcceso.paginaNoValida(st.motivo, st.acceso));
  const it = accesos.archivoPermitido(st.acceso, req.params.id);
  if (!it) return res.status(403).send(paginaAcceso.paginaNoValida('bloqueado', st.acceso));
  const f = path.join(accesos.PUBLIC, it.archivo);
  if (!f.startsWith(accesos.PUBLIC) || !fs.existsSync(f)) return res.status(404).send('Archivo no encontrado');
  accesos.registrarUso(st.acceso.token, 'descargas');
  res.set('Cache-Control', 'private, no-store');
  if (it.abrir) return res.sendFile(f);
  res.download(f, path.basename(f));
});

// ----------------------------------------------------------------------------
// 2. Webhook de Meta: Handshake inicial (GET)
// ----------------------------------------------------------------------------
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('[WEBHOOK] Handshake de Meta verificado con éxito.');
      return res.status(200).send(challenge);
    } else {
      console.warn('[WEBHOOK] Token de verificación de Meta inválido.');
      return res.sendStatus(403);
    }
  }
  res.sendStatus(400);
});

// ----------------------------------------------------------------------------
// 3. Webhook de Meta: Recepción de eventos y mensajes (POST)
// ----------------------------------------------------------------------------
app.post('/webhook', async (req, res) => {
  // Respuesta inmediata 200 OK a Meta para evitar reintentos duplicados
  res.status(200).send('EVENT_RECEIVED');

  try {
    const body = req.body;
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0]?.value;

      // Guardar los recibos de Meta (sent, delivered, read o failed). Esto
      // permite diagnosticar mensajes aceptados por la API que no llegan.
      const statuses = change?.statuses || [];
      for (const status of statuses) {
        const saved = store.registrarEstadoEntrega(status);
        console.log('[WA DELIVERY]', JSON.stringify(saved));
      }

      // Actualizar perfil del cliente si viene en contacts
      const contact = change?.contacts?.[0];
      if (contact && contact.wa_id) {
        store.actualizarPerfil(contact.wa_id, {
          nombre: contact.profile?.name || null
        });
      }

      // Procesar mensajes entrantes
      const messages = change?.messages;
      if (!messages || messages.length === 0) return;

      const message = messages[0];
      const from = message.from;
      if (!from || from === 'undefined') return;

      if (message.id) {
        waService.markAsRead(message.id).catch(() => {});
      }

      await conversationFlow.handleIncomingMessage(from, message);
    }
  } catch (error) {
    console.error('[SERVER ERROR] Error procesando evento de webhook:', error);
  }
});

// ----------------------------------------------------------------------------
// 4. Panel Web Administrativo
// ----------------------------------------------------------------------------
app.get('/panel', authPanel, (req, res) => {
  const aviso = req.query.aviso || '';
  res.send(panel.render(aviso));
});

// 5. Visor de Chat Individual
// Comprobantes e imágenes recibidas por WhatsApp (solo con el token del panel)
app.get('/panel/media/:file', authPanel, (req, res) => {
  const f = store.rutaMedia(req.params.file);
  if (!f) return res.status(404).send('Imagen no encontrada');
  res.set('Cache-Control', 'private, max-age=86400');
  res.sendFile(f);
});

app.get('/panel/chat', authPanel, (req, res) => {
  const phone = req.query.id;
  if (!phone) return res.redirect(`/panel?token=${PANEL_TOKEN}#chats`);
  const aviso = req.query.aviso || '';
  res.send(panelChat.renderChat(phone, aviso));
});

// ----------------------------------------------------------------------------
// 6. APIs Administrativas
// ----------------------------------------------------------------------------

// Aprobación manual de un pedido
app.post('/api/pedidos/:id/aprobar', authPanel, async (req, res) => {
  const id = req.params.id;
  const pedido = store.obtenerPedido(id);

  if (!pedido) {
    return res.redirect(`/panel?token=${PANEL_TOKEN}&aviso=Error:+Pedido+no+encontrado#pendientes`);
  }

  const settings = store.getSettings();
  store.aprobarPedido(id, { aprobadoPor: 'operador' });

  // Enviar mensaje de confirmación y entrega por WhatsApp usando la lógica centralizada
  try {
    await conversationFlow.enviarEntregaProducto(pedido.phone, settings);
  } catch (err) {
    console.error('[APROBAR ERROR] Error enviando mensaje de entrega a WhatsApp:', err.message);
  }

  res.redirect(`/panel?token=${PANEL_TOKEN}&aviso=¡Pedido+${id}+aprobado+y+entregado+con+éxito!#pendientes`);
});

// Enlaces personales: reenviar por WhatsApp o desactivar
app.post('/api/accesos/reenviar', authPanel, async (req, res) => {
  const phone = String(req.body?.phone || '').replace(/\D/g, '');
  const producto = req.body?.producto || (store.getLead(phone) || {}).producto || 'helados';
  try {
    const a = accesos.crear(phone, producto, 'completo');
    const host = process.env.RENDER_EXTERNAL_URL || 'https://emprende-dulce-bot.onrender.com';
    const txt = `Aquí tienes de nuevo tu enlace personal de descarga 🙌\n\n${host}/acceso/${a.token}\n\nGuárdalo: es solo tuyo y no vence.`;
    await waService.sendTextMessage(phone, txt);
    store.agregarMensaje(phone, { from: 'operador', text: txt, type: 'text' });
    res.redirect(`/panel?token=${PANEL_TOKEN}&aviso=Enlace+reenviado+a+%2B${phone}#pedidos`);
  } catch (e) {
    res.redirect(`/panel?token=${PANEL_TOKEN}&aviso=Error+al+reenviar:+${encodeURIComponent(e.message)}#pedidos`);
  }
});

app.post('/api/accesos/:tok/desactivar', authPanel, (req, res) => {
  const a = accesos.desactivar(req.params.tok);
  res.redirect(`/panel?token=${PANEL_TOKEN}&aviso=${a ? 'Enlace+desactivado.+Puedes+reenviar+uno+nuevo.' : 'Enlace+no+encontrado'}#pedidos`);
});

// Rechazo de un pedido
app.post('/api/pedidos/:id/rechazar', authPanel, async (req, res) => {
  const id = req.params.id;
  const motivo = req.body?.motivo || 'Comprobante no válido o valor incompleto';
  const pedido = store.obtenerPedido(id);

  if (pedido) {
    store.rechazarPedido(id, motivo);
    const mensajeRechazo =
      `Hola 🙌 Revisamos tu comprobante pero no pudimos validar la transferencia de los $10.000 COP en la cuenta bancaria (${motivo}).\n\n` +
      `Si ya realizaste el pago, por favor envíanos de nuevo una captura donde se vea clara la fecha, hora y número de referencia para verificarlo de inmediato.`;
    try {
      await waService.sendTextMessage(pedido.phone, mensajeRechazo);
      store.agregarMensaje(pedido.phone, { from: 'bot', text: mensajeRechazo, type: 'text' });
    } catch {}
  }

  res.redirect(`/panel?token=${PANEL_TOKEN}&aviso=Pedido+${id}+marcado+como+rechazado#pendientes`);
});

// Descarte silencioso de un pedido pendiente (quitar de la lista sin enviar mensaje por WhatsApp)
app.post('/api/pedidos/:id/descartar', authPanel, async (req, res) => {
  const id = req.params.id;
  const pedido = store.obtenerPedido(id);

  if (pedido) {
    store.descartarPedido(id, 'Descartado manualmente desde el panel (sin notificar)');
    console.log(`[PANEL] Pedido ${id} descartado silenciosamente (sin mensaje al cliente).`);
  }

  res.redirect(`/panel?token=${PANEL_TOKEN}&aviso=Pedido+${id}+descartado+de+la+lista+(sin+notificar)#pendientes`);
});

// Responder directamente a un cliente desde el panel
app.post('/api/chats/:id/responder', authPanel, async (req, res) => {
  const phone = req.params.id;
  const mensaje = req.body?.mensaje;

  if (phone && mensaje) {
    try {
      // 1. Enviar mensaje por WhatsApp
      await waService.sendTextMessage(phone, mensaje);

      // 2. Guardar en el historial como 'operador'
      store.agregarMensaje(phone, { from: 'operador', text: mensaje, type: 'text' });

      // 3. Pausar el bot automáticamente para que el humano tenga el control total
      store.setPaused(phone, true);
      store.marcarAtendido(phone, true);
    } catch (err) {
      console.error('[RESPONDER ERROR]:', err.message);
      return res.redirect(`/panel/chat?id=${phone}&token=${PANEL_TOKEN}&aviso=Error+al+enviar+mensaje#chats`);
    }
  }

  res.redirect(`/panel/chat?id=${phone}&token=${PANEL_TOKEN}`);
});

// Pausar o reanudar el bot para un chat
app.post('/api/chats/:id/pausar', authPanel, (req, res) => {
  const phone = req.params.id;
  const pausar = req.body?.pausar === '1';
  store.setPaused(phone, pausar);
  res.redirect(`/panel/chat?id=${phone}&token=${PANEL_TOKEN}`);
});

// Actualizar configuración
app.post('/api/settings', authPanel, (req, res) => {
  const { nequiNumero, nequiTitular, daviplataNumero, llaveNumero, precioOferta, driveLink, driveLinkMoldes, botWhatsApp, modoAutoEntregaLeona } = req.body;
  store.updateSettings({
    nequiNumero: nequiNumero || undefined,
    nequiTitular: nequiTitular || undefined,
    daviplataNumero: daviplataNumero || undefined,
    llaveNumero: llaveNumero || undefined,
    precioOferta: precioOferta ? Number(precioOferta) : undefined,
    driveLink: driveLink || undefined,
    driveLinkMoldes: driveLinkMoldes || undefined,
    botWhatsApp: botWhatsApp || undefined,
    modoAutoEntregaLeona: modoAutoEntregaLeona === '1' || modoAutoEntregaLeona === 'true' || modoAutoEntregaLeona === true || modoAutoEntregaLeona === 'on'
  });
  res.redirect(`/panel?token=${PANEL_TOKEN}&aviso=Configuración+guardada+con+éxito#config`);
});

// Toggle rápido de Auto-Entrega Leona (Modelo A)
app.post('/api/settings/toggle-leona', authPanel, (req, res) => {
  const current = store.getSettings().modoAutoEntregaLeona !== false;
  const nuevo = !current;
  store.updateSettings({ modoAutoEntregaLeona: nuevo });
  const estadoStr = nuevo ? 'ACTIVADA+🟢+(Entrega+inmediata+por+IA)' : 'DESACTIVADA+🔴+(Solo+Banco+o+Aprobación+Manual)';
  res.redirect(`/panel?token=${PANEL_TOKEN}&aviso=Auto-Entrega+Leona+${estadoStr}#config`);
});

// Exportar CSV de pedidos confirmados
app.get('/api/pedidos/csv', authPanel, (req, res) => {
  const confirmados = store.pedidosVerificados();
  let csv = 'ID,Fecha,Telefono,ProductoId,Producto,Origen,DetalleOrigen,Monto,Referencia,AprobadoPor\n';
  const q = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
  for (const p of confirmados) {
    const f = new Date(p.verifiedAt || p.createdAt).toISOString();
    const o = p.origen || store.origenDeLead(store.getLead(p.phone));
    csv += [p.id, f, `+${p.phone}`, p.producto || 'helados', p.product, o.canal, o.detalle, p.amount, p.reference, p.aprobadoPor].map(q).join(',') + '\n';
  }
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="ventas_emprende_dulce.csv"');
  res.send(csv);
});

// Diagnóstico de entrega de WhatsApp (protegido por el token del panel)
app.get('/api/delivery-status', authPanel, (req, res) => {
  res.json({ statuses: store.estadosEntrega() });
});

// ----------------------------------------------------------------------------
// 8. Ingesta de Notificaciones Bancarias (Nequi, Daviplata, Bre-B, Gmail)
// ----------------------------------------------------------------------------
app.post('/api/payment-notification', (req, res) => {
  const secret = req.headers['x-api-key'] || req.query.token || req.body?.token;
  const expectedKey = paymentVerifier.getWebhookKey();

  if (secret !== expectedKey && secret !== PANEL_TOKEN) {
    return res.status(403).json({ error: 'Token de webhook bancario inválido' });
  }

  try {
    const result = paymentVerifier.ingestNotification(req.body);
    console.log('[API WEBHOOK PAGO]', result);
    return res.status(200).json(result);
  } catch (err) {
    console.error('[API WEBHOOK ERROR]:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Endpoint para simular alerta de Nequi desde el panel o tests
app.post('/api/payment-ledger/simulate', authPanel, (req, res) => {
  const { amount = 10000, reference = `M${Math.floor(1000000 + Math.random() * 9000000)}`, bank = 'NEQUI', sender = 'Cliente Simulado' } = req.body;
  paymentVerifier.ingestNotification({
    bank,
    amount: Number(amount),
    reference,
    sender
  });
  return res.redirect(`/panel?token=${PANEL_TOKEN}&aviso=Pago+simulado+registrado+con+Ref+${reference}#ledger`);
});

// Registrar pago manual en libro mayor
app.post('/api/payment-ledger/manual-add', authPanel, (req, res) => {
  const { amount, reference, bank, sender } = req.body;
  if (!amount || !reference) {
    return res.redirect(`/panel?token=${PANEL_TOKEN}&aviso=Error:+Monto+y+Referencia+son+obligatorios#ledger`);
  }
  paymentVerifier.ingestNotification({
    bank: bank || 'NEQUI',
    amount: Number(amount),
    reference: String(reference).trim(),
    sender: sender || 'Registro Manual'
  });
  return res.redirect(`/panel?token=${PANEL_TOKEN}&aviso=Transacción+registrada+en+Libro+Mayor#ledger`);
});

// Consultar libro mayor en JSON
app.get('/api/payment-ledger', authPanel, (req, res) => {
  res.json(paymentVerifier.getAllTransactions());
});

// ----------------------------------------------------------------------------
// 7. Arranque del Servidor y del Motor de Seguimiento
// ----------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`==================================================================`);
  console.log(`🚀 Emprende Dulce WhatsApp Bot iniciado en puerto ${PORT}`);
  console.log(`🔗 Webhook Meta:    http://localhost:${PORT}/webhook`);
  console.log(`💻 Panel de Control: http://localhost:${PORT}/panel?token=${PANEL_TOKEN}`);
  console.log(`💾 Directorio Datos: ${store.getDir()} (Persistente: ${store.esDiscoPersistente()})`);
  console.log(`==================================================================`);

  // Iniciar motor de remarketing / seguimiento automático cada 5 minutos
  seguimiento.iniciarScheduler();
  try { accesos.migrarVentas(); } catch (e) { console.error('[ACCESOS] Migración:', e.message); }
});

module.exports = app;
