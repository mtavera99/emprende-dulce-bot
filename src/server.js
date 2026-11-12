require('dotenv').config();
const express = require('express');
const conversationFlow = require('./conversationFlow');
const waService = require('./whatsappService');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || "lowticket_verify_token_2026";

// 1. Health check para Render
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    app: 'LowTicket WhatsApp Bot',
    product: 'Emprende Dulce ($10.000 COP)',
    timestamp: new Date().toISOString()
  });
});

// 2. Verificación del Webhook de Meta (Handshake inicial)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('[WEBHOOK] Verificación exitosa de Meta.');
      return res.status(200).send(challenge);
    } else {
      console.warn('[WEBHOOK] Token de verificación incorrecto.');
      return res.sendStatus(403);
    }
  }
  res.sendStatus(400);
});

// 3. Recepción de mensajes de WhatsApp
app.post('/webhook', async (req, res) => {
  // Responder inmediatamente 200 OK a Meta para evitar reintentos duplicados
  res.status(200).send('EVENT_RECEIVED');

  try {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0]?.value;

      // Verificar si hay mensajes entrantes (ignorar estados de lectura/entrega)
      const messages = change?.messages;
      if (!messages || messages.length === 0) return;

      const message = messages[0];
      const from = message.from; // Número del cliente (ej: 573001234567)

      // Marcar mensaje como leído
      if (message.id) {
        waService.markAsRead(message.id).catch(() => {});
      }

      // Procesar el mensaje en el flujo conversacional
      await conversationFlow.handleIncomingMessage(from, message);
    }
  } catch (error) {
    console.error('[SERVER ERROR] Error procesando webhook:', error);
  }
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 LowTicket WhatsApp Bot iniciado en puerto ${PORT}`);
  console.log(`🔗 Webhook URL: http://localhost:${PORT}/webhook`);
  console.log(`=========================================`);
});
