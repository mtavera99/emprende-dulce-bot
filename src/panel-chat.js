const store = require('./store');
const productCatalog = require('./productCatalog');
const accesos = require('./accesos');

function panelToken() {
  return process.env.PANEL_TOKEN || process.env.WHATSAPP_VERIFY_TOKEN || 'lowticket_panel_token_2026';
}

const esc = (s) =>
  String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function horaCorta(ms) {
  if (!ms) return '';
  return new Date(ms).toLocaleTimeString('es-CO', {
    timeZone: 'America/Bogota',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Las imágenes guardadas en el disco del bot se sirven por /panel/media y piden el token
function conToken(url, tk) {
  if (!url || !String(url).startsWith('/panel/media/')) return url;
  return `${url}?token=${encodeURIComponent(tk)}`;
}

function renderChat(phone, aviso = '') {
  const tk = panelToken();
  const conv = store.obtenerConversacion(phone);
  const msgs = conv.messages || [];
  const nombre = conv.perfil?.nombre || conv.perfil?.username || `+${phone}`;
  const esPausado = conv.pausado;
  const pedido = store.obtenerPedidoPorTelefono(phone);
  const settings = store.getSettings();

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>💬 Chat con ${esc(nombre)} · Emprende Dulce</title>
  <style>
    :root {
      --bg: #0b0f17;
      --card: #151c28;
      --border: #222f44;
      --text: #f1f5f9;
      --muted: #94a3b8;
      --green: #10b981;
      --green-bg: rgba(16, 185, 129, 0.12);
      --amber: #f59e0b;
      --amber-bg: rgba(245, 158, 11, 0.12);
      --red: #ef4444;
      --blue: #38bdf8;
      --chat-in: #1c2637;
      --chat-out: #064e3b;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: var(--bg); color: var(--text); display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

    header { background: #0f1622; border-bottom: 1px solid var(--border); padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; z-index: 10; }
    .header-left { display: flex; align-items: center; gap: 12px; }
    .back-btn { background: var(--card); border: 1px solid var(--border); color: #fff; text-decoration: none; padding: 6px 12px; border-radius: 8px; font-size: 0.82rem; font-weight: 600; }
    .user-meta h2 { font-size: 1.05rem; font-weight: 700; display: flex; align-items: center; gap: 8px; }
    .user-meta span { font-size: 0.78rem; color: var(--muted); }

    .header-actions { display: flex; align-items: center; gap: 8px; }
    .btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 600; text-decoration: none; cursor: pointer; border: none; }
    .btn-amber { background: var(--amber); color: #000; }
    .btn-green { background: var(--green); color: #000; }

    /* Order snippet banner */
    .order-banner { background: #0d141f; border-bottom: 1px solid var(--border); padding: 8px 16px; font-size: 0.82rem; display: flex; justify-content: space-between; align-items: center; }

    /* Chat messages scrollable area */
    .chat-body { flex: 1; overflow-y: auto; padding: 20px 16px; display: flex; flex-direction: column; gap: 10px; background: #080c13; }
    .msg { max-width: 80%; padding: 10px 14px; border-radius: 12px; font-size: 0.9rem; line-height: 1.4; position: relative; word-break: break-word; }
    .msg.client { align-self: flex-start; background: var(--chat-in); border-bottom-left-radius: 2px; }
    .msg.bot { align-self: flex-end; background: var(--chat-out); border-bottom-right-radius: 2px; }
    .msg.operator { align-self: flex-end; background: #1e3a8a; border-bottom-right-radius: 2px; }
    .msg-time { font-size: 0.68rem; opacity: 0.6; text-align: right; margin-top: 4px; }
    .msg-badge { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.7; margin-bottom: 4px; font-weight: 700; }
    .msg img { max-width: 100%; max-height: 300px; border-radius: 6px; margin-top: 6px; cursor: pointer; }

    /* Quick snippets */
    .snippets-bar { background: #0f1622; padding: 6px 12px; border-top: 1px solid var(--border); display: flex; gap: 8px; overflow-x: auto; -webkit-overflow-scrolling: touch; }
    .chip { background: var(--card); border: 1px solid var(--border); color: var(--muted); padding: 4px 10px; border-radius: 999px; font-size: 0.75rem; white-space: nowrap; cursor: pointer; transition: 0.15s ease; }
    .chip:hover { color: #fff; background: var(--border); }

    /* Chat input footer */
    footer { background: #0f1622; border-top: 1px solid var(--border); padding: 12px 16px; }
    .chat-form { display: flex; gap: 10px; }
    .chat-input { flex: 1; background: #080c13; border: 1px solid var(--border); color: #fff; padding: 10px 14px; border-radius: 8px; font-size: 0.9rem; outline: none; }
    .chat-input:focus { border-color: var(--blue); }
    .send-btn { background: var(--blue); color: #000; font-weight: 700; padding: 0 18px; border-radius: 8px; border: none; cursor: pointer; }
    .send-btn:hover { filter: brightness(1.1); }

    @media (max-width: 600px) {
      header {
        padding: 8px 12px;
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }
      .header-left {
        justify-content: space-between;
        width: 100%;
      }
      .header-actions {
        width: 100%;
      }
      .header-actions form, .header-actions .btn {
        width: 100%;
        justify-content: center;
        padding: 8px;
      }
      .msg {
        max-width: 90%;
      }
      footer {
        padding: 8px 12px calc(8px + env(safe-area-inset-bottom, 0px));
      }
      .chat-input {
        font-size: 16px !important;
      }
    }
  </style>
</head>
<body>

  ${aviso ? `<div style="background: #064e3b; color: #d1fae5; padding: 10px 16px; font-size: 0.9rem; font-weight: 600;">${esc(aviso)}</div>` : ''}
  <header>
    <div class="header-left">
      <a href="/panel?token=${esc(tk)}#chats" class="back-btn">← Volver al Panel</a>
      <div class="user-meta">
        <h2>
          ${esc(nombre)}
          ${esPausado ? '<span style="font-size: 0.75rem; color: var(--amber); background: var(--amber-bg); padding: 2px 8px; border-radius: 999px;">⏸️ Bot Silenciado</span>' : '<span style="font-size: 0.75rem; color: var(--green); background: var(--green-bg); padding: 2px 8px; border-radius: 999px;">🟢 Bot Activo</span>'}
        </h2>
        <span>Teléfono: +${esc(phone)}</span>
        ${(() => {
          const lead = store.getLead(phone) || {};
          const i = productCatalog.infoProducto(lead.producto);
          const o = store.origenDeLead(lead);
          const a = accesos.deTelefono(phone)[0];
          const host = process.env.RENDER_EXTERNAL_URL || '';
          return `<div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; font-size: 0.75rem;">
            <span style="background:${i.color}22;color:${i.color};border:1px solid ${i.color}66;padding:2px 8px;border-radius:999px;font-weight:700;">${i.emoji} ${esc(i.etiqueta)}</span>
            <span style="background:#1e293b;color:#93c5fd;border:1px solid #334155;padding:2px 8px;border-radius:999px;">${esc(o.canal)}${o.detalle ? ' · ' + esc(o.detalle) : ''}</span>
            ${a ? `<span style="background:#1e293b;color:#cbd5e1;border:1px solid #334155;padding:2px 8px;border-radius:999px;">${a.tipo === 'prueba' ? '🤝 Prueba' : '🔑 Acceso'} ${a.activo ? '' : '(desactivado) '}· ${a.vistas || 0} visitas · ${a.descargas || 0} descargas · <a style="color:#c4b5fd" target="_blank" href="${host}/${a.tipo === 'prueba' ? 'prueba' : 'acceso'}/${esc(a.token)}">abrir</a></span>` : ''}
          </div>`;
        })()}
      </div>
    </div>

    <div class="header-actions" style="flex-wrap: wrap; gap: 8px;">
      ${(() => {
        const lead = store.getLead(phone) || {};
        const opts = Object.keys(productCatalog.PRODUCTOS).map((id) => { const i = productCatalog.infoProducto(id); return `<option value="${esc(id)}" ${id === (lead.producto || 'helados') ? 'selected' : ''}>${i.emoji} ${esc(i.etiqueta)}</option>`; }).join('');
        const pend = store.pedidosDeTelefono(phone).some((p) => p.status === 'PENDIENTE');
        return `
      <form method="POST" action="/api/chats/${esc(phone)}/dar-acceso?token=${esc(tk)}" onsubmit="return confirm('¿Desbloquear el acceso completo y enviarle su enlace personal por WhatsApp?');" style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
        <select name="producto" style="background: #0b0f17; color: #fff; border: 1px solid #334155; border-radius: 8px; padding: 8px;">${opts}</select>
        <label style="font-size: 0.75rem; color: #cbd5e1; display: flex; gap: 4px; align-items: center;"><input type="checkbox" name="venta" value="1" ${pend ? 'checked' : ''}> Registrar como venta${pend ? ' (tiene pedido pendiente)' : ''}</label>
        <button type="submit" class="btn btn-green">🔓 Dar acceso completo</button>
      </form>
      <form method="POST" action="/api/chats/${esc(phone)}/extender-prueba?token=${esc(tk)}" style="display: flex; gap: 6px; align-items: center;">
        <input type="hidden" name="producto" value="${esc(lead.producto || 'helados')}">
        <select name="minutos" style="background: #0b0f17; color: #fff; border: 1px solid #334155; border-radius: 8px; padding: 8px;"><option value="60">1 hora</option><option value="1440">24 horas</option></select>
        <button type="submit" class="btn btn-amber">⏱ Reabrir prueba</button>
      </form>`;
      })()}
      <form method="POST" action="/api/chats/${esc(phone)}/pausar?token=${esc(tk)}">
        <input type="hidden" name="pausar" value="${esPausado ? '0' : '1'}">
        <button type="submit" class="btn ${esPausado ? 'btn-green' : 'btn-amber'}">
          ${esPausado ? '▶️ Reanudar Bot' : '⏸️ Silenciar Bot (Atención Humana)'}
        </button>
      </form>
    </div>
  </header>

  ${pedido ? `
    <div class="order-banner">
      <div>
        Pedido: <b>${esc(pedido.id)}</b> · Monto: <b style="color: var(--green);">${pedido.amount ? '$' + Number(pedido.amount).toLocaleString('es-CO') : '$10.000'}</b> ·
        Estado: <b>${esc(pedido.status)}</b>
      </div>
      <div>
        ${pedido.status === 'PENDIENTE' ? `
          <form method="POST" action="/api/pedidos/${esc(pedido.id)}/aprobar?token=${esc(tk)}" style="display: inline;">
            <button type="submit" class="btn btn-green" style="padding: 3px 8px; font-size: 0.75rem;">✅ Aprobar</button>
          </form>
          <form method="POST" action="/api/pedidos/${esc(pedido.id)}/descartar?token=${esc(tk)}" style="display: inline;" onsubmit="return confirm('¿Quitar este pedido de pendientes? NO se enviará mensaje al cliente.');">
            <button type="submit" class="btn btn-ghost" style="padding: 3px 8px; font-size: 0.75rem; color: var(--muted); border-color: rgba(148,163,184,0.3);">✕ Descartar</button>
          </form>
        ` : (pedido.status === 'VERIFICADO' || pedido.status === 'ENTREGADO' ? `<span style="color: var(--green); font-weight: 600;">✓ Entregado</span>` : `<span style="color: var(--muted); font-weight: 600;">${esc(pedido.status)}</span>`)}
      </div>
    </div>
  ` : ''}

  <div class="chat-body" id="chatContainer">
    ${msgs.length === 0 ? `
      <div style="text-align: center; color: var(--muted); margin: auto;">No hay mensajes registrados con este cliente.</div>
    ` : msgs.map(m => {
      const esBot = m.from === 'bot';
      const esOperador = m.from === 'operador';
      const rol = esBot ? 'bot' : (esOperador ? 'operator' : 'client');
      const label = esBot ? '🤖 Bot Emprende Dulce' : (esOperador ? '👤 Operador Humano' : esc(nombre));

      return `
        <div class="msg ${rol}">
          <div class="msg-badge">${label}</div>
          <div>${esc(m.text || '')}</div>
          ${m.mediaUrl ? `<img src="${esc(conToken(m.mediaUrl, tk))}" alt="Adjunto" loading="lazy" style="max-width: 260px; border-radius: 8px; margin-top: 6px; cursor: zoom-in;" onclick="window.open(this.src)">` : ''}
          <div class="msg-time">${horaCorta(m.timestamp)}</div>
        </div>
      `;
    }).join('')}
  </div>

  <!-- Atajos de respuesta rápida -->
  <div class="snippets-bar">
    <span class="chip" onclick="pegarTexto('📲 Aquí tienes los datos para tu transferencia de $10.000 COP:\\n\\n💚 Nequi: ${esc(settings.nequiNumero)}\\n💛 Daviplata: ${esc(settings.daviplataNumero)}\\n👤 Titular: ${esc(settings.nequiTitular)}')">
      💳 Enviar Cuentas
    </span>
    <span class="chip" onclick="pegarTexto('¡Hola! 📄 Ya recibí tu comprobante, estamos verificando el ingreso en la cuenta. En 1 minuto te entrego tus accesos 🙌')">
      ⏳ Verificando Comprobante
    </span>
    <span class="chip" onclick="pegarTexto('¡Confirmadísimo tu pago! 🎉 Aquí tienes el enlace oficial para descargar tus 3 Libros y los 3 Bonos de Regalo:\\n\\n🔗 ${esc(settings.driveLink)}\\n\\n¡Muchos éxitos en tu emprendimiento dulce! 🍰')">
      🚀 Enviar Link Drive
    </span>
  </div>

  <footer>
    <form class="chat-form" method="POST" action="/api/chats/${esc(phone)}/responder?token=${esc(tk)}">
      <input type="text" name="mensaje" id="inputMensaje" class="chat-input" placeholder="Escribe un mensaje para responder al cliente (silencia el bot automáticamente)..." required autocomplete="off">
      <button type="submit" class="send-btn">Enviar 📤</button>
    </form>
  </footer>

  <script>
    // Scroll al final al abrir
    const container = document.getElementById('chatContainer');
    container.scrollTop = container.scrollHeight;

    function pegarTexto(t) {
      const input = document.getElementById('inputMensaje');
      input.value = t;
      input.focus();
    }
  </script>
</body>
</html>`;
}

module.exports = {
  renderChat
};
