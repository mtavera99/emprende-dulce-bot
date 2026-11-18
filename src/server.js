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

// Servir archivos descargables
app.use('/descargas', express.static(path.join(__dirname, '../public/descargas')));

// Hub de descarga móvil para compradores
app.get(['/descargar', '/acceso'], (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>🍰 Emprende Dulce · Descarga de Tu Pack Completo</title>
  <style>
    :root {
      --bg: #0b0f19;
      --card: #151c28;
      --border: #222f44;
      --text: #f1f5f9;
      --muted: #94a3b8;
      --primary: #f43f5e;
      --green: #10b981;
      --blue: #38bdf8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: var(--bg); color: var(--text); padding: 24px 16px 60px; display: flex; justify-content: center; }
    .wrap { width: 100%; max-width: 640px; }
    .header { text-align: center; margin-bottom: 24px; }
    .badge { display: inline-block; background: rgba(16, 185, 129, 0.15); color: #34d399; font-size: 0.8rem; font-weight: 700; padding: 4px 12px; border-radius: 999px; margin-bottom: 12px; border: 1px solid rgba(16, 185, 129, 0.3); }
    h1 { font-size: 1.6rem; font-weight: 800; color: #fff; margin-bottom: 6px; }
    p.sub { color: var(--muted); font-size: 0.92rem; line-height: 1.5; }
    
    .zip-card { background: linear-gradient(135deg, #1e293b, #0f172a); border: 2px solid var(--primary); border-radius: 14px; padding: 20px; text-align: center; margin-bottom: 24px; box-shadow: 0 10px 25px rgba(244, 63, 94, 0.15); }
    .zip-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 100%; background: var(--primary); color: #fff; font-weight: 700; font-size: 1.05rem; padding: 14px 20px; border-radius: 10px; text-decoration: none; margin-top: 12px; transition: 0.2s ease; }
    .zip-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
    
    .section-title { font-size: 1.05rem; font-weight: 700; color: #fff; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
    .file-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
    .file-item { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; text-decoration: none; color: inherit; transition: 0.15s ease; }
    .file-item:hover { border-color: var(--blue); background: #1c2637; }
    .file-meta { flex: 1; }
    .file-title { font-size: 0.95rem; font-weight: 600; color: #fff; margin-bottom: 2px; }
    .file-sub { font-size: 0.78rem; color: var(--muted); }
    .dl-btn { background: #222f44; color: var(--blue); padding: 8px 14px; border-radius: 8px; font-size: 0.82rem; font-weight: 700; white-space: nowrap; }
    .file-item:hover .dl-btn { background: var(--blue); color: #000; }
    
    .drive-box { background: #0c1829; border: 1px solid #1e3a8a; border-radius: 12px; padding: 16px; text-align: center; }
    .drive-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: #2563eb; color: #fff; text-decoration: none; font-weight: 700; font-size: 0.95rem; padding: 12px 20px; border-radius: 8px; width: 100%; margin-top: 10px; }
    .footer-note { text-align: center; color: var(--muted); font-size: 0.8rem; margin-top: 24px; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <span class="badge">✅ PAGO CONFIRMADO · ACCESO OFICIAL</span>
      <h1>¡Bienvenido(a) a Emprende Dulce! 🍰</h1>
      <p class="sub">Aquí tienes acceso permanente e ilimitado a todo tu material digital en alta definición para ver o descargar en tu celular, tablet o computador.</p>
    </div>

    <!-- Descargar todo en ZIP -->
    <div class="zip-card">
      <div style="font-size: 1.8rem; margin-bottom: 4px;">📦</div>
      <h3 style="color: #fff; font-size: 1.15rem; margin-bottom: 4px;">Descargar Todo el Paquete Completo</h3>
      <p style="color: var(--muted); font-size: 0.85rem;">Los 3 libros PDF + 3 bonos + calculadora de costos en un solo archivo comprimido.</p>
      <a href="/descargas/Pack_Completo_Emprende_Dulce_2026.zip" class="zip-btn" download>
        ⬇️ Descargar Todo en ZIP (30 MB)
      </a>
    </div>

    <!-- Descargas Individuales -->
    <div class="section-title">📚 Descargar Libros en PDF Individuales</div>
    <div class="file-list">
      <a href="/descargas/01_Helados_Artesanales_Guia_Maestra.pdf" class="file-item" download>
        <div class="file-meta">
          <div class="file-title">🍦 1. Guía Maestra de Helados Artesanales</div>
          <div class="file-sub">47 páginas · PDF HD · Fórmulas cremosas y paletas</div>
        </div>
        <span class="dl-btn">Descargar PDF</span>
      </a>

      <a href="/descargas/02_Postres_en_Vaso_Para_Emprender.pdf" class="file-item" download>
        <div class="file-meta">
          <div class="file-title">🧁 2. Postres en Vaso para Emprender</div>
          <div class="file-sub">41 páginas · PDF HD · 12 recetas top en vasito domo</div>
        </div>
        <span class="dl-btn">Descargar PDF</span>
      </a>

      <a href="/descargas/03_Recetario_Navideno_Postres_y_Cajas_Regalo.pdf" class="file-item" download>
        <div class="file-meta">
          <div class="file-title">🎄 3. Recetario Navideño y Cajas de Regalo</div>
          <div class="file-sub">35 páginas · PDF HD · Natillas, buñuelos y anchetas</div>
        </div>
        <span class="dl-btn">Descargar PDF</span>
      </a>
    </div>

    <!-- Bonos y Herramientas -->
    <div class="section-title">🎁 Bonos de Regalo y Herramientas de Costeo</div>
    <div class="file-list">
      <a href="/descargas/Bono_01_Calculadora_Costos_y_Precios.xlsx" class="file-item" download>
        <div class="file-meta">
          <div class="file-title">📊 Plantilla de Costeo en Excel (.xlsx)</div>
          <div class="file-sub">Fórmulas automáticas de costos y precio de venta</div>
        </div>
        <span class="dl-btn">Descargar Excel</span>
      </a>

      <a href="/descargas/Bono_01_Calculadora_Costos_y_Precios.html" class="file-item" download>
        <div class="file-meta">
          <div class="file-title">🌐 Calculadora Interactiva Móvil (.html)</div>
          <div class="file-sub">Funciona sin internet en cualquier celular o computador</div>
        </div>
        <span class="dl-btn">Abrir App</span>
      </a>

      <a href="/descargas/Bono_02_Directorio_Proveedores_Colombia.pdf" class="file-item" download>
        <div class="file-meta">
          <div class="file-title">📦 Directorio de Proveedores Colombia</div>
          <div class="file-sub">Empaques, vasitos domo e insumos al por mayor</div>
        </div>
        <span class="dl-btn">Descargar PDF</span>
      </a>

      <a href="/descargas/Bono_03_Guia_Ventas_WhatsApp_Postres.pdf" class="file-item" download>
        <div class="file-meta">
          <div class="file-title">💬 Guía de Ventas por WhatsApp</div>
          <div class="file-sub">Estrategias y guiones de venta para conseguir clientes</div>
        </div>
        <span class="dl-btn">Descargar PDF</span>
      </a>
    </div>

    <!-- Carpeta en Google Drive -->
    <div class="drive-box">
      <h3 style="color: #fff; font-size: 1rem; margin-bottom: 4px;">📁 También disponible en Google Drive</h3>
      <p style="color: var(--muted); font-size: 0.82rem;">Puedes guardar la carpeta en tu Google Drive para verla siempre online.</p>
      <a href="https://drive.google.com/drive/folders/1k5L4D-td0Qsyurc8bWxBkKLTBGIrv3fX?usp=sharing" target="_blank" class="drive-btn">
        Abrir en Google Drive
      </a>
    </div>

    <div class="footer-note">
      Emprende Dulce 2026 · Soporte oficial en WhatsApp: +57 310 5652478<br>
      Acceso garantizado de por vida para el comprador.
    </div>
  </div>
</body>
</html>`);
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
