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

  // Enviar mensaje de confirmación y entrega por WhatsApp
  const mensajeEntrega =
    `¡Tu pago ha sido confirmado exitosamente por nuestro equipo! 🎉🍰\n\n` +
    `Aquí tienes el acceso oficial a tu colección *Emprende Dulce 2026*:\n\n` +
    `🔗 *Enlace de Descarga Permanente (Google Drive):*\n` +
    `${settings.driveLink}\n\n` +
    `📁 *Incluye tus 3 Libros y 3 Bonos:* Helados Artesanales (47 pág), Postres en Vaso (41 pág), Recetario Navideño (35 pág), Plantilla Excel, Guía de Empaques y Diseños en Canva.\n\n` +
    `¡Muchos éxitos en tu emprendimiento dulce! 🚀`;

  try {
    await waService.sendTextMessage(pedido.phone, mensajeEntrega);
    store.agregarMensaje(pedido.phone, { from: 'bot', text: mensajeEntrega, type: 'text' });
  } catch (err) {
    console.error('[APROBAR ERROR] Error enviando mensaje de entrega a WhatsApp:', err.message);
  }

  res.redirect(`/panel?token=${PANEL_TOKEN}&aviso=¡Pedido+${id}+aprobado+y+entregado+con+éxito!#pendientes`);
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
  const { nequiNumero, nequiTitular, daviplataNumero, llaveNumero, precioOferta, driveLink, botWhatsApp, modoAutoEntregaLeona } = req.body;
  store.updateSettings({
    nequiNumero: nequiNumero || undefined,
    nequiTitular: nequiTitular || undefined,
    daviplataNumero: daviplataNumero || undefined,
    llaveNumero: llaveNumero || undefined,
    precioOferta: precioOferta ? Number(precioOferta) : undefined,
    driveLink: driveLink || undefined,
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
  let csv = 'ID,Fecha,Telefono,Producto,Monto,Referencia,AprobadoPor\n';
  for (const p of confirmados) {
    const f = new Date(p.verifiedAt || p.createdAt).toISOString();
    csv += `"${p.id}","${f}","+${p.phone}","${p.product}","${p.amount}","${p.reference || ''}","${p.aprobadoPor || ''}"\n`;
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
});

module.exports = app;
