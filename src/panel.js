const store = require('./store');
const paymentVerifier = require('./paymentVerifier');

function panelToken() {
  return process.env.PANEL_TOKEN || process.env.WHATSAPP_VERIFY_TOKEN || 'lowticket_panel_token_2026';
}

function numeroDelBot() {
  const n = String(process.env.BOT_WHATSAPP || '').replace(/\D/g, '');
  if (!n) return null;
  const sinPais = n.startsWith('57') && n.length > 10 ? n.slice(2) : n;
  return sinPais.length === 10
    ? `+57 ${sinPais.slice(0, 3)} ${sinPais.slice(3)}`
    : `+${n}`;
}

const esc = (s) =>
  String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const fmtCOP = (n) =>
  '$' + Number(n || 0).toLocaleString('es-CO').replace(/,/g, '.');

function hace(ms) {
  if (!ms) return 'hace un momento';
  const min = Math.floor((Date.now() - ms) / 60000);
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} d`;
}

function fechaHora(ms) {
  if (!ms) return '—';
  return new Date(ms).toLocaleString('es-CO', {
    timeZone: 'America/Bogota',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function horaCorta(ms) {
  if (!ms) return '';
  return new Date(ms).toLocaleTimeString('es-CO', {
    timeZone: 'America/Bogota',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

function render(aviso = '') {
  const tk = panelToken();
  const numBot = numeroDelBot() || 'Línea de WhatsApp no configurada (poné BOT_WHATSAPP en Render)';
  const metricas = store.metricas();
  const pedidos = store.todosLosPedidos();
  const pendientes = store.pedidosPendientes();
  const confirmados = store.pedidosVerificados();
  const convs = store.todasLasConversaciones();
  const settings = store.getSettings();
  const bankTxs = paymentVerifier.getAllTransactions();
  const unclaimedTxs = bankTxs.filter(t => t.status === 'UNCLAIMED');

  // Lista de chats ordenada por último mensaje
  const chatsLista = Object.entries(convs)
    .filter(([tel]) => tel && tel !== 'undefined' && tel !== 'null' && !tel.startsWith('prueba-'))
    .map(([tel, c]) => {
      const msgs = c.messages || [];
      const ultimo = msgs.length ? msgs[msgs.length - 1] : null;
      return {
        tel,
        c,
        msgs,
        cuando: c.ultimoDelCliente || (ultimo && ultimo.timestamp) || 0
      };
    })
    .sort((a, b) => b.cuando - a.cuando);

  const hoyBogota = new Date().toLocaleDateString('es-CO', { timeZone: 'America/Bogota' });
  const chatsHoy = chatsLista.filter(x => {
    return new Date(x.cuando).toLocaleDateString('es-CO', { timeZone: 'America/Bogota' }) === hoyBogota;
  });
  const chatsMasViejos = chatsLista.filter(x => {
    return new Date(x.cuando).toLocaleDateString('es-CO', { timeZone: 'America/Bogota' }) !== hoyBogota;
  });

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>🍰 Emprende Dulce · Panel del Bot</title>
  <style>
    :root {
      --bg: #0b0f17;
      --card: #151c28;
      --card-hover: #1c2637;
      --border: #222f44;
      --text: #f1f5f9;
      --muted: #94a3b8;
      --green: #10b981;
      --green-bg: rgba(16, 185, 129, 0.12);
      --amber: #f59e0b;
      --amber-bg: rgba(245, 158, 11, 0.12);
      --red: #ef4444;
      --red-bg: rgba(239, 68, 68, 0.15);
      --blue: #38bdf8;
      --blue-bg: rgba(56, 189, 248, 0.12);
      --purple: #a855f7;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    html, body { overflow-x: hidden; max-width: 100vw; width: 100%; }
    body { background: var(--bg); color: var(--text); padding-bottom: 80px; }
    header { background: #0f1622; border-bottom: 1px solid var(--border); padding: 14px 20px; position: sticky; top: 0; z-index: 50; }
    .header-top { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
    .brand { display: flex; align-items: center; gap: 10px; font-size: 1.25rem; font-weight: 700; color: #fff; }
    .brand span { font-size: 0.85rem; font-weight: 400; color: var(--muted); }
    .sub-bar { font-size: 0.78rem; color: var(--muted); margin-top: 6px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .disk-badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 999px; background: rgba(16, 185, 129, 0.15); color: #34d399; font-size: 0.72rem; }
    .disk-badge.warn { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }

    /* Nav Pills (Desktop) */
    nav.tabs { display: flex; gap: 8px; padding: 12px 20px; background: #0d131d; border-bottom: 1px solid var(--border); overflow-x: auto; -webkit-overflow-scrolling: touch; }
    nav.tabs a { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; text-decoration: none; color: var(--muted); background: var(--card); border: 1px solid var(--border); white-space: nowrap; transition: 0.15s ease; }
    nav.tabs a:hover { color: #fff; background: var(--card-hover); }
    nav.tabs a.active { background: var(--green); color: #000; border-color: var(--green); }
    nav.tabs a .pill { background: rgba(0,0,0,0.25); padding: 2px 6px; border-radius: 999px; font-size: 0.75rem; }

    /* Barra Inferior Fija para Móviles */
    .mobile-bottom-nav { display: none; }
    .mobile-quick-stats { display: none; }

    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }

    /* Aviso flotante */
    .aviso { background: var(--green-bg); border: 1px solid var(--green); color: #6ee7b7; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 0.9rem; }

    /* KPIs */
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 24px; }
    .kpi { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; }
    .kpi-num { font-size: 1.8rem; font-weight: 800; color: #fff; line-height: 1.1; margin-top: 4px; }
    .kpi-lbl { font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.5px; color: var(--muted); font-weight: 600; }
    .kpi-sub { font-size: 0.8rem; margin-top: 6px; color: var(--muted); }
    .kpi-sub.green { color: var(--green); font-weight: 600; }
    .kpi-sub.amber { color: var(--amber); font-weight: 600; }
    .kpi-sub.red { color: var(--red); font-weight: 700; }

    /* Actions bar */
    .actions-bar { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
    .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; text-decoration: none; cursor: pointer; border: none; transition: 0.15s ease; }
    .btn-green { background: var(--green); color: #000; }
    .btn-green:hover { filter: brightness(1.1); }
    .btn-red { background: var(--red); color: #fff; }
    .btn-red:hover { filter: brightness(1.1); }
    .btn-ghost { background: var(--card); color: var(--text); border: 1px solid var(--border); }
    .btn-ghost:hover { background: var(--card-hover); }

    /* Sections */
    .section-title { font-size: 1.15rem; font-weight: 700; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
    .card-list { display: flex; flex-direction: column; gap: 12px; }

    /* Pending Verification Cards */
    .card-pago { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 18px; display: grid; grid-template-columns: 120px 1fr auto; gap: 16px; align-items: center; }
    .thumb-wrap { width: 120px; height: 120px; border-radius: 8px; overflow: hidden; background: #000; border: 1px solid var(--border); cursor: pointer; display: flex; align-items: center; justify-content: center; position: relative; }
    .thumb-wrap img { width: 100%; height: 100%; object-fit: cover; }
    .thumb-wrap .no-img { font-size: 0.75rem; color: var(--muted); text-align: center; padding: 8px; }
    .thumb-badge { position: absolute; bottom: 4px; right: 4px; background: rgba(0,0,0,0.75); color: #fff; font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; font-weight: 600; }
    .pago-info h3 { font-size: 1.05rem; font-weight: 700; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
    .ocr-box { margin-top: 8px; background: rgba(0,0,0,0.3); border-left: 3px solid var(--blue); padding: 8px 12px; border-radius: 4px; font-size: 0.82rem; }
    .ocr-box b { color: var(--blue); }
    .pago-actions { display: flex; flex-direction: column; gap: 8px; min-width: 160px; }

    /* Orders Table */
    .table-wrap { overflow-x: auto; background: var(--card); border: 1px solid var(--border); border-radius: 12px; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem; }
    th { background: #0f1622; padding: 12px 14px; color: var(--muted); font-size: 0.75rem; text-transform: uppercase; font-weight: 600; border-bottom: 1px solid var(--border); }
    td { padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.05); }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: var(--card-hover); }

    /* Chat Rows - Mobile First Ergonomic (Zero scroll horizontal) */
    .chat-row {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      text-decoration: none;
      color: inherit;
      transition: 0.15s ease;
      width: 100%;
      box-sizing: border-box;
      overflow: hidden;
    }
    .chat-row:hover { background: var(--card-hover); border-color: #334155; }
    .chat-row-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      width: 100%;
      min-width: 0;
    }
    .chat-user-wrap {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
      flex: 1;
      overflow: hidden;
    }
    .chat-user-name {
      font-weight: 700;
      font-size: 0.95rem;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
    }
    .chat-time-tag {
      font-size: 0.78rem;
      color: var(--muted);
      white-space: nowrap;
      flex-shrink: 0;
      text-align: right;
      font-weight: 600;
      margin-left: auto;
    }
    .chat-row-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      width: 100%;
      min-width: 0;
    }
    .chat-preview {
      font-size: 0.82rem;
      color: var(--muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
      flex: 1;
    }
    .chat-msg-badge {
      font-size: 0.72rem;
      color: var(--muted);
      background: rgba(255,255,255,0.06);
      padding: 2px 7px;
      border-radius: 999px;
      white-space: nowrap;
      flex-shrink: 0;
      margin-left: auto;
    }

    /* Badges */
    .badge { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 999px; font-size: 0.72rem; font-weight: 600; }
    .badge-green { background: var(--green-bg); color: var(--green); border: 1px solid rgba(16,185,129,0.3); }
    .badge-amber { background: var(--amber-bg); color: var(--amber); border: 1px solid rgba(245,158,11,0.3); }
    .badge-red { background: var(--red-bg); color: var(--red); border: 1px solid rgba(239,68,68,0.3); }
    .badge-blue { background: var(--blue-bg); color: var(--blue); border: 1px solid rgba(56,189,248,0.3); }

    /* Modal Zoom */
    .modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 100; align-items: center; justify-content: center; padding: 20px; }
    .modal.active { display: flex; }
    .modal img { max-width: 90vw; max-height: 90vh; border-radius: 8px; border: 2px solid var(--border); box-shadow: 0 20px 40px rgba(0,0,0,0.8); }
    .modal-close { position: absolute; top: 20px; right: 20px; font-size: 2rem; color: #fff; cursor: pointer; }

    /* ==========================================================================
       OPTIMIZACIÓN MÓVIL PROFESIONAL (Evita scroll innecesario y adapta todo)
       ========================================================================== */
    @media (max-width: 768px) {
      body {
        padding-bottom: calc(75px + env(safe-area-inset-bottom, 0px)) !important;
      }
      header {
        padding: 10px 14px;
      }
      .brand {
        font-size: 1.05rem;
      }
      .brand span {
        display: none;
      }
      .sub-bar {
        display: none;
      }
      .container {
        padding: 12px 12px;
      }

      /* Ocultar barra de pestañas superior en móvil (reemplazada por barra inferior ergonómica) */
      nav.tabs {
        display: none !important;
      }

      /* Barra de Navegación Móvil Fija en la Parte Inferior */
      .mobile-bottom-nav {
        display: flex;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: calc(58px + env(safe-area-inset-bottom, 0px));
        padding-bottom: env(safe-area-inset-bottom, 0px);
        background: rgba(13, 19, 29, 0.98);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border-top: 1px solid var(--border);
        z-index: 99;
        justify-content: space-around;
        align-items: center;
      }
      .mbn-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        color: var(--muted);
        font-size: 0.68rem;
        font-weight: 600;
        padding: 4px 6px;
        position: relative;
        transition: 0.15s ease;
        flex: 1;
        max-width: 75px;
      }
      .mbn-item.active {
        color: var(--green);
      }
      .mbn-icon-wrap {
        position: relative;
        display: inline-block;
        font-size: 1.25rem;
        line-height: 1;
        margin-bottom: 2px;
      }
      .mbn-badge {
        position: absolute;
        top: -4px;
        right: -10px;
        background: var(--red);
        color: #fff;
        font-size: 0.62rem;
        font-weight: 800;
        min-width: 16px;
        height: 16px;
        border-radius: 999px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
        border: 2px solid #0d131d;
      }

      /* Reemplazo de la torre de 6 KPIs por Ticker Horizontal Compacto de 1 línea */
      .kpi-grid-top {
        display: none !important;
      }
      .mobile-quick-stats {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        padding-bottom: 10px;
        margin-bottom: 12px;
      }
      .quick-stat-chip {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 999px;
        padding: 6px 12px;
        white-space: nowrap;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.78rem;
        color: var(--muted);
        text-decoration: none;
        flex-shrink: 0;
      }
      .quick-stat-chip b {
        color: #fff;
      }

      /* Tarjeta de Comprobante / Pago en Móvil */
      .card-pago {
        grid-template-columns: 1fr;
        padding: 14px;
        gap: 12px;
      }
      .thumb-wrap {
        width: 100%;
        height: 180px;
        border-radius: 10px;
      }
      .pago-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        width: 100%;
      }
      .pago-actions form:first-child {
        grid-column: 1 / -1;
      }
      .pago-actions .btn {
        padding: 12px 14px;
        font-size: 0.9rem;
        justify-content: center;
        width: 100%;
      }

      /* Inputs no hacen auto-zoom en iPhone Safari */
      input, select, textarea {
        font-size: 16px !important;
      }
    }

    /* Tablas responsivas en móvil: se convierten en tarjetas verticales (CERO scroll horizontal) */
    @media (max-width: 680px) {
      .table-wrap {
        background: transparent !important;
        border: none !important;
        overflow: visible;
      }
      .table-wrap table {
        display: block;
        width: 100%;
      }
      .table-wrap thead {
        display: none;
      }
      .table-wrap tbody {
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;
      }
      .table-wrap tr {
        display: block;
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 12px 14px;
        width: 100%;
      }
      .table-wrap td {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 0;
        border-bottom: 1px solid rgba(255,255,255,0.04);
        font-size: 0.84rem;
        text-align: right;
      }
      .table-wrap td:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }
      .table-wrap td::before {
        content: attr(data-label);
        font-size: 0.72rem;
        font-weight: 700;
        color: var(--muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        text-align: left;
        margin-right: 10px;
        flex-shrink: 0;
      }
    }
  </style>
</head>
<body>

  <header>
    <div class="header-top">
      <div class="brand">
        🍰 Emprende Dulce · Panel de Control
        <span>Pack Digital $10.000 COP</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
        <form method="POST" action="/api/settings/toggle-leona?token=${esc(tk)}" style="margin: 0;">
          <button type="submit" class="btn ${settings.modoAutoEntregaLeona !== false ? 'btn-green' : 'btn-ghost'}" style="padding: 6px 12px; font-size: 0.8rem; font-weight: 700;" title="Haz clic para alternar entre auto-entrega automática por IA y verificación manual/bancaria">
            🦁 Auto-Entrega Leona: ${settings.modoAutoEntregaLeona !== false ? 'ACTIVADA 🟢' : 'DESACTIVADA 🔴'}
          </button>
        </form>
        <a href="/panel?token=${esc(tk)}" class="btn btn-ghost" style="padding: 6px 12px; font-size: 0.8rem;">🔄 Actualizar Ahora</a>
      </div>
    </div>
    <div class="sub-bar">
      <span>📱 ${esc(numBot)}</span>
      <span>·</span>
      <span>Se refresca cada 45 s (nunca mientras escribís)</span>
      <span>·</span>
      <span class="disk-badge ${metricas.discoPersistente ? '' : 'warn'}">
        💾 ${metricas.discoPersistente ? 'Disco Persistente Activo (' + esc(metricas.rutaDisco) + ')' : 'Disco Local Efímero (configurá DATA_DIR o /var/data)'}
      </span>
    </div>
  </header>

  <nav class="tabs" id="tabNav">
    <a href="#pendientes" class="tab-link active">
      💸 Pagos por Verificar
      <span class="pill" style="background: ${pendientes.length > 0 ? 'var(--red)' : 'rgba(255,255,255,0.1)'}; color: #fff;">${pendientes.length}</span>
    </a>
    <a href="#ledger" class="tab-link">
      💰 Banco Real Nequi/Daviplata
      <span class="pill" style="background: ${unclaimedTxs.length > 0 ? 'var(--green)' : 'rgba(255,255,255,0.1)'}; color: ${unclaimedTxs.length > 0 ? '#000' : '#fff'};">${bankTxs.length}</span>
    </a>
    <a href="#pedidos" class="tab-link">
      📋 Ventas Confirmadas
      <span class="pill">${confirmados.length}</span>
    </a>
    <a href="#chats" class="tab-link">
      💬 Visor de Chats
      <span class="pill">${chatsLista.length}</span>
    </a>
    <a href="#metricas" class="tab-link">
      📊 Métricas y Embudo
    </a>
    <a href="#config" class="tab-link">
      ⚙️ Cuentas y Enlaces
    </a>
  </nav>

  <div class="container">
    ${aviso ? `<div class="aviso">${esc(aviso)}</div>` : ''}

    <!-- KPI GRID TOP (Desktop) -->
    <div class="kpi-grid kpi-grid-top">
      <div class="kpi">
        <div class="kpi-lbl">Ventas Hoy</div>
        <div class="kpi-num">${metricas.pedidosHoy}</div>
        <div class="kpi-sub green">${fmtCOP(metricas.recaudoHoy)} recaudados</div>
      </div>
      <div class="kpi">
        <div class="kpi-lbl">Recaudo Total</div>
        <div class="kpi-num">${fmtCOP(metricas.totalRecaudo)}</div>
        <div class="kpi-sub">${metricas.totalVentas} clientes compradores</div>
      </div>
      <div class="kpi">
        <div class="kpi-lbl">Pagos por Verificar</div>
        <div class="kpi-num" style="color: ${pendientes.length > 0 ? 'var(--amber)' : 'inherit'};">${pendientes.length}</div>
        <div class="kpi-sub ${pendientes.length > 0 ? 'red' : ''}">
          ${metricas.conComprobante} con captura enviada
        </div>
      </div>
      <div class="kpi">
        <div class="kpi-lbl">Leads / Prospectos</div>
        <div class="kpi-num">${metricas.leadsTotales}</div>
        <div class="kpi-sub green">${metricas.leadsHoy} llegaron hoy</div>
      </div>
      <div class="kpi">
        <div class="kpi-lbl">Tasa de Cierre</div>
        <div class="kpi-num" style="color: var(--green);">${metricas.tasaCierre}%</div>
        <div class="kpi-sub">Conversión anuncio → pago</div>
      </div>
      <div class="kpi">
        <div class="kpi-lbl">Atención Humana</div>
        <div class="kpi-num" style="color: ${metricas.esperandoHumano > 0 ? 'var(--blue)' : 'inherit'};">${metricas.esperandoHumano}</div>
        <div class="kpi-sub">Chats esperando operador</div>
      </div>
    </div>

    <!-- QUICK STATS TICKER (Móvil: reemplaza la torre de 600px de KPIs) -->
    <div class="mobile-quick-stats">
      <a href="#pedidos" class="quick-stat-chip">
        <span>💰 Ventas Hoy:</span>
        <b>${metricas.pedidosHoy} (${fmtCOP(metricas.recaudoHoy)})</b>
      </a>
      <a href="#pendientes" class="quick-stat-chip" style="${pendientes.length > 0 ? 'border-color: var(--amber); background: rgba(245,158,11,0.12);' : ''}">
        <span>💸 Por Validar:</span>
        <b style="color: ${pendientes.length > 0 ? 'var(--amber)' : 'var(--green)'};">${pendientes.length}</b>
      </a>
      <a href="#chats" class="quick-stat-chip">
        <span>💬 Leads Hoy:</span>
        <b>${metricas.leadsHoy}</b>
      </a>
      <a href="#metricas" class="quick-stat-chip">
        <span>📈 Cierre:</span>
        <b style="color: var(--green);">${metricas.tasaCierre}%</b>
        <span style="color: var(--blue); font-size: 0.72rem; margin-left: 2px;">Métricas →</span>
      </a>
    </div>

    <!-- SECCIÓN: PENDIENTES DE VERIFICACIÓN -->
    <div id="sec-pendientes" class="tab-sec">
      <div class="section-title">
        <span>💸 Comprobantes y Pagos por Validar (${pendientes.length})</span>
      </div>

      ${pendientes.length === 0 ? `
        <div style="background: var(--card); border: 1px dashed var(--border); border-radius: 12px; padding: 40px; text-align: center; color: var(--muted);">
          <div style="font-size: 2.5rem; margin-bottom: 10px;">🎉</div>
          <b>¡No hay pagos pendientes por revisar!</b>
          <p style="font-size: 0.85rem; margin-top: 6px;">Todos los clientes que enviaron comprobante ya fueron atendidos y tienen sus libros entregados.</p>
        </div>
      ` : `
        <div class="card-list">
          ${pendientes.map(p => `
            <div class="card-pago">
              <div class="thumb-wrap" onclick="abrirZoom('${esc(p.comprobanteUrl || '')}')">
                ${p.comprobanteUrl ? `
                  <img src="${esc(p.comprobanteUrl)}" alt="Comprobante" loading="lazy">
                  <span class="thumb-badge">🔍 Toca para ampliar</span>
                ` : `
                  <div class="no-img">📷 Sin imagen adjunta</div>
                `}
              </div>

              <div class="pago-info">
                <h3>
                  <a href="/panel/chat?id=${esc(p.phone)}&token=${esc(tk)}" style="color: #fff; text-decoration: none;">
                    +${esc(p.phone)}
                  </a>
                  <span class="badge badge-amber">Revisar</span>
                </h3>
                <div style="font-size: 0.85rem; color: var(--muted);">
                  Pedido: <b>${esc(p.id)}</b> · Monto: <b style="color: var(--green); font-size: 0.95rem;">${fmtCOP(p.amount)}</b> · Registrado ${hace(p.createdAt)}
                </div>

                <div class="ocr-box">
                  <b>Lectura Automática (OCR):</b><br>
                  ${p.ocrData ? `
                    Banco: <b>${esc(p.ocrData.bank || 'Nequi / Bancolombia')}</b> ·
                    Monto Leído: <b>${fmtCOP(p.ocrData.amount || 10000)}</b> ·
                    Ref: <b>${esc(p.ocrData.reference || 'Detectada')}</b><br>
                    <span style="font-size: 0.75rem; color: var(--muted);">${esc(p.ocrData.reason || '')}</span>
                  ` : `
                    <i>El cliente anunció pago o mandó foto. Mirá la cuenta o la captura para confirmar los $10.000 COP.</i>
                  `}
                </div>
              </div>

              <div class="pago-actions">
                <form method="POST" action="/api/pedidos/${esc(p.id)}/aprobar?token=${esc(tk)}">
                  <button type="submit" class="btn btn-green" style="width: 100%;">
                    ✅ Aprobar y Entregar
                  </button>
                </form>
                <form method="POST" action="/api/pedidos/${esc(p.id)}/rechazar?token=${esc(tk)}" onsubmit="return confirm('¿Rechazar este pago? Se avisará al cliente.');">
                  <button type="submit" class="btn btn-ghost" style="width: 100%; color: var(--red); border-color: rgba(239,68,68,0.3);">
                    ❌ Rechazar
                  </button>
                </form>
                <a href="/panel/chat?id=${esc(p.phone)}&token=${esc(tk)}" class="btn btn-ghost" style="width: 100%; text-align: center; justify-content: center; font-size: 0.78rem;">
                  💬 Ver Chat
                </a>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>

    <!-- SECCIÓN: PEDIDOS CONFIRMADOS / VENTAS -->
    <div id="sec-pedidos" class="tab-sec" style="display: none;">
      <div class="section-title">
        <span>📋 Ventas Confirmadas y Entregas Realizadas (${confirmados.length})</span>
        <a href="/api/pedidos/csv?token=${esc(tk)}" class="btn btn-ghost" style="font-size: 0.78rem;">⬇️ Exportar CSV</a>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Producto</th>
              <th>Monto</th>
              <th>Referencia</th>
              <th>Aprobado Por</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            ${confirmados.length === 0 ? `
              <tr><td colspan="7" style="text-align: center; padding: 30px; color: var(--muted);">No hay ventas confirmadas registradas aún.</td></tr>
            ` : confirmados.map(p => `
              <tr>
                <td data-label="Fecha">${fechaHora(p.verifiedAt || p.createdAt)}</td>
                <td data-label="Cliente">
                  <a href="/panel/chat?id=${esc(p.phone)}&token=${esc(tk)}" style="color: #fff; font-weight: 600; text-decoration: none;">
                    +${esc(p.phone)}
                  </a>
                </td>
                <td data-label="Producto">${esc(p.product)}</td>
                <td data-label="Monto" style="font-weight: 700; color: var(--green);">${fmtCOP(p.amount)}</td>
                <td data-label="Referencia"><code>${esc(p.reference || 'MANUAL-OK')}</code></td>
                <td data-label="Aprobado Por">
                  <span class="badge ${p.aprobadoPor === 'ia_leona_auto' ? 'badge-green' : (p.aprobadoPor && p.aprobadoPor.startsWith('banco_')) ? 'badge-blue' : 'badge-amber'}">
                    ${p.aprobadoPor === 'ia_leona_auto' ? '🦁 IA Leona (Auto)' : (p.aprobadoPor && p.aprobadoPor.startsWith('banco_')) ? '💰 ' + esc(p.aprobadoPor.replace('banco_', '').toUpperCase()) : esc(p.aprobadoPor || 'Operador')}
                  </span>
                </td>
                <td data-label="Acción">
                  <a href="/panel/chat?id=${esc(p.phone)}&token=${esc(tk)}" class="btn btn-ghost" style="padding: 6px 12px; font-size: 0.8rem;">
                    💬 Chat
                  </a>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- SECCIÓN: LIBRO MAYOR DE PAGOS BANCARIOS REALES -->
    <div id="sec-ledger" class="tab-sec" style="display: none;">
      <div class="section-title">
        <span>💰 Libro Mayor Bancario · Nequi / Daviplata / Bre-B (${bankTxs.length})</span>
        <form method="POST" action="/api/payment-ledger/simulate?token=${esc(tk)}" style="display: inline;">
          <button type="submit" class="btn btn-ghost" style="font-size: 0.78rem; border-color: var(--amber); color: var(--amber);">⚡ Simular Pago Nequi ($10.000)</button>
        </form>
      </div>

      <!-- Métricas del Ledger -->
      <div class="kpi-grid" style="margin-bottom: 20px;">
        <div class="kpi">
          <div class="kpi-lbl">Recibido en Banco</div>
          <div class="kpi-num">${fmtCOP(bankTxs.reduce((sum, t) => sum + (t.amount || 0), 0))}</div>
          <div class="kpi-sub green">${bankTxs.length} transacciones registradas</div>
        </div>
        <div class="kpi">
          <div class="kpi-lbl">Disponibles p/ Auto-Aprobación</div>
          <div class="kpi-num" style="color: var(--green);">${unclaimedTxs.length}</div>
          <div class="kpi-sub">Esperando comprobante de cliente</div>
        </div>
        <div class="kpi">
          <div class="kpi-lbl">Pagos Reclamados</div>
          <div class="kpi-num" style="color: var(--blue);">${bankTxs.filter(t => t.status === 'CLAIMED').length}</div>
          <div class="kpi-sub">Entregados con éxito</div>
        </div>
      </div>

      <!-- Registro Manual Rápido -->
      <div style="background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 18px; margin-bottom: 20px;">
        <div style="font-size: 0.9rem; font-weight: 700; color: #fff; margin-bottom: 12px;">➕ Registrar Pago Acreditado Manualmente</div>
        <form method="POST" action="/api/payment-ledger/manual-add?token=${esc(tk)}" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)) 120px; gap: 10px; align-items: end;">
          <div>
            <label style="font-size: 0.75rem; color: var(--muted); display: block; margin-bottom: 4px;">BANCO</label>
            <select name="bank" style="width: 100%; background: #0b0f17; border: 1px solid var(--border); color: #fff; padding: 8px 10px; border-radius: 6px;">
              <option value="NEQUI">Nequi</option>
              <option value="DAVIPLATA">Daviplata</option>
              <option value="LLAVE_BRE_B">Llave / Bre-B</option>
              <option value="BANCOLOMBIA">Bancolombia</option>
            </select>
          </div>
          <div>
            <label style="font-size: 0.75rem; color: var(--muted); display: block; margin-bottom: 4px;">MONTO (COP)</label>
            <input type="number" name="amount" value="10000" style="width: 100%; background: #0b0f17; border: 1px solid var(--border); color: #fff; padding: 8px 10px; border-radius: 6px;">
          </div>
          <div>
            <label style="font-size: 0.75rem; color: var(--muted); display: block; margin-bottom: 4px;">REFERENCIA</label>
            <input type="text" name="reference" placeholder="Ej: M1234567" required style="width: 100%; background: #0b0f17; border: 1px solid var(--border); color: #fff; padding: 8px 10px; border-radius: 6px;">
          </div>
          <div>
            <label style="font-size: 0.75rem; color: var(--muted); display: block; margin-bottom: 4px;">REMITENTE</label>
            <input type="text" name="sender" placeholder="Nombre cliente" style="width: 100%; background: #0b0f17; border: 1px solid var(--border); color: #fff; padding: 8px 10px; border-radius: 6px;">
          </div>
          <button type="submit" class="btn btn-green" style="height: 38px;">Acreditar</button>
        </form>
      </div>

      <!-- Tabla de Transacciones -->
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Banco</th>
              <th>Referencia</th>
              <th>Monto</th>
              <th>Remitente</th>
              <th>Estado</th>
              <th>Reclamado Por</th>
            </tr>
          </thead>
          <tbody>
            ${bankTxs.length === 0 ? `
              <tr><td colspan="7" style="text-align: center; padding: 30px; color: var(--muted);">No hay transacciones bancarias registradas aún en el libro mayor. Puedes simular una o conectar el webhook de MacroDroid/Gmail.</td></tr>
            ` : bankTxs.map(t => `
              <tr>
                <td data-label="Fecha">${fechaHora(t.timestamp)}</td>
                <td data-label="Banco"><span class="badge ${t.bank === 'NEQUI' ? 'badge-green' : t.bank === 'DAVIPLATA' ? 'badge-amber' : 'badge-blue'}">${esc(t.bank)}</span></td>
                <td data-label="Referencia"><code>${esc(t.reference)}</code></td>
                <td data-label="Monto" style="font-weight: 700; color: var(--green);">${fmtCOP(t.amount)}</td>
                <td data-label="Remitente">${esc(t.sender || 'Cliente')}</td>
                <td data-label="Estado">
                  <span class="badge ${t.status === 'UNCLAIMED' ? 'badge-green' : 'badge-blue'}">
                    ${t.status === 'UNCLAIMED' ? '🟢 Disponible' : '🔵 Reclamado'}
                  </span>
                </td>
                <td data-label="Reclamado Por">
                  ${t.claimedByPhone ? `<a href="/panel/chat?id=${esc(t.claimedByPhone)}&token=${esc(tk)}" style="color: #fff; text-decoration: none;">+${esc(t.claimedByPhone)}</a>` : '<span style="color: var(--muted);">—</span>'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Tarjeta Guía de Conexión Automática -->
      <div style="background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; margin-top: 24px;">
        <div style="font-size: 1rem; font-weight: 700; color: #fff; margin-bottom: 8px;">🔗 Cómo Conectar la Verificación Automática (Nequi / Daviplata / Llave)</div>
        <p style="font-size: 0.85rem; color: var(--muted); margin-bottom: 14px;">Para que los pagos se acrediten solos sin intervención manual, cualquier notificación entrante puede enviarse a este webhook protegido:</p>
        
        <div style="background: #0b0f17; border: 1px solid var(--border); border-radius: 8px; padding: 12px; margin-bottom: 12px; font-family: monospace; font-size: 0.82rem; color: var(--green); word-break: break-all;">
          POST https://emprende-dulce-bot.onrender.com/api/payment-notification<br>
          Header: x-api-key: dulce_pay_secret_2026<br>
          Body JSON: { "text": "{notificación_del_celular}" }
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; font-size: 0.82rem; color: var(--muted);">
          <div style="background: rgba(255,255,255,0.02); padding: 12px; border-radius: 8px; border: 1px solid var(--border);">
            <b style="color: #fff;">Opción 1: App Gratuita MacroDroid (Android) · MÉTODO PRINCIPAL</b><br>
            Nequi y Daviplata <b>no envían correos</b> por transferencias comunes; únicamente envían <b>notificación Push a la pantalla del celular</b>.<br><br>
            1. Instala MacroDroid en el celular que tiene la cuenta Nequi/Daviplata.<br>
            2. Disparador: Notificación recibida de la app Nequi o Daviplata.<br>
            3. Acción: Solicitud HTTP (POST) a la URL de arriba con el texto de la notificación.<br>
            4. ¡Listo! Cada vez que alguien te transfiere, el bot recibe la alerta en 1 segundo y auto-entrega.
          </div>
          <div style="background: rgba(255,255,255,0.02); padding: 12px; border-radius: 8px; border: 1px solid var(--border);">
            <b style="color: #fff;">Opción 2: Bancolombia / Pasarelas (Si recibes alertas al correo)</b><br>
            Si recibes transferencias vía Bancolombia / PSE / QR de Negocio donde sí llega comprobante a tu Gmail:<br><br>
            1. Puedes usar Google Apps Script para escuchar correos con asunto de transferencia.<br>
            2. Hace un POST a la URL de arriba con el cuerpo del correo.<br>
            3. O simplemente valida en 1 clic desde la pestaña <b>💸 Pagos por Verificar</b>.
          </div>
        </div>
      </div>
    </div>

    <!-- SECCIÓN: CHATS -->
    <div id="sec-chats" class="tab-sec" style="display: none;">
      <div class="section-title" style="flex-wrap: wrap; gap: 10px;">
        <span>💬 Conversaciones de Clientes (${chatsLista.length})</span>
        <div style="width: 100%; max-width: 360px;">
          <input type="text" id="chatSearch" placeholder="🔍 Buscar por teléfono o nombre..." oninput="filtrarChats()" style="width: 100%; background: var(--card); border: 1px solid var(--border); color: #fff; padding: 8px 12px; border-radius: 8px; font-size: 16px; box-sizing: border-box;">
        </div>
      </div>

      <div style="font-size: 0.8rem; font-weight: 700; color: var(--muted); text-transform: uppercase; margin: 16px 0 8px;">
        Hoy (${chatsHoy.length})
      </div>
      <div class="card-list" id="chatsListHoy">
        ${chatsHoy.map(item => renderFilaChat(item, tk)).join('')}
      </div>

      ${chatsMasViejos.length > 0 ? `
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--muted); text-transform: uppercase; margin: 24px 0 8px;">
          Anteriores (${chatsMasViejos.length})
        </div>
        <div class="card-list" id="chatsListOld">
          ${chatsMasViejos.map(item => renderFilaChat(item, tk)).join('')}
        </div>
      ` : ''}
    </div>

    <!-- SECCIÓN: MÉTRICAS Y EMBUDO -->
    <div id="sec-metricas" class="tab-sec" style="display: none;">
      <div class="section-title">
        <span>📊 Métricas Comerciales y Embudo de Conversión</span>
      </div>

      <!-- Tarjetas de Métricas -->
      <div class="kpi-grid" style="margin-bottom: 20px;">
        <div class="kpi">
          <div class="kpi-lbl">Ventas Hoy</div>
          <div class="kpi-num">${metricas.pedidosHoy}</div>
          <div class="kpi-sub green">${fmtCOP(metricas.recaudoHoy)} recaudados</div>
        </div>
        <div class="kpi">
          <div class="kpi-lbl">Recaudo Total</div>
          <div class="kpi-num">${fmtCOP(metricas.totalRecaudo)}</div>
          <div class="kpi-sub">${metricas.totalVentas} clientes compradores</div>
        </div>
        <div class="kpi">
          <div class="kpi-lbl">Pagos por Verificar</div>
          <div class="kpi-num" style="color: ${pendientes.length > 0 ? 'var(--amber)' : 'inherit'};">${pendientes.length}</div>
          <div class="kpi-sub ${pendientes.length > 0 ? 'red' : ''}">
            ${metricas.conComprobante} con captura enviada
          </div>
        </div>
        <div class="kpi">
          <div class="kpi-lbl">Leads / Prospectos</div>
          <div class="kpi-num">${metricas.leadsTotales}</div>
          <div class="kpi-sub green">${metricas.leadsHoy} llegaron hoy</div>
        </div>
        <div class="kpi">
          <div class="kpi-lbl">Tasa de Cierre</div>
          <div class="kpi-num" style="color: var(--green);">${metricas.tasaCierre}%</div>
          <div class="kpi-sub">Conversión anuncio → pago</div>
        </div>
        <div class="kpi">
          <div class="kpi-lbl">Atención Humana</div>
          <div class="kpi-num" style="color: ${metricas.esperandoHumano > 0 ? 'var(--blue)' : 'inherit'};">${metricas.esperandoHumano}</div>
          <div class="kpi-sub">Chats esperando operador</div>
        </div>
      </div>

      <div style="background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 24px;">
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 6px;">
              <span>1. Contactos entrantes (Click-to-WhatsApp)</span>
              <b>${metricas.leadsTotales} (100%)</b>
            </div>
            <div style="height: 10px; background: rgba(255,255,255,0.06); border-radius: 999px; overflow: hidden;">
              <div style="width: 100%; height: 100%; background: var(--blue);"></div>
            </div>
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 6px;">
              <span>2. Pidieron datos de pago (Nequi / Daviplata)</span>
              <b>${pedidos.length} (${metricas.leadsTotales > 0 ? ((pedidos.length / metricas.leadsTotales) * 100).toFixed(1) : 0}%)</b>
            </div>
            <div style="height: 10px; background: rgba(255,255,255,0.06); border-radius: 999px; overflow: hidden;">
              <div style="width: ${metricas.leadsTotales > 0 ? (pedidos.length / metricas.leadsTotales) * 100 : 0}%; height: 100%; background: var(--amber);"></div>
            </div>
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 6px;">
              <span>3. Enviaron Comprobante de Pago</span>
              <b>${confirmados.length + pendientes.length} (${metricas.leadsTotales > 0 ? (((confirmados.length + pendientes.length) / metricas.leadsTotales) * 100).toFixed(1) : 0}%)</b>
            </div>
            <div style="height: 10px; background: rgba(255,255,255,0.06); border-radius: 999px; overflow: hidden;">
              <div style="width: ${metricas.leadsTotales > 0 ? ((confirmados.length + pendientes.length) / metricas.leadsTotales) * 100 : 0}%; height: 100%; background: var(--purple);"></div>
            </div>
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 6px;">
              <span>4. Ventas Confirmadas y Entregadas ($10.000 COP)</span>
              <b style="color: var(--green);">${metricas.totalVentas} (${metricas.tasaCierre}%)</b>
            </div>
            <div style="height: 10px; background: rgba(255,255,255,0.06); border-radius: 999px; overflow: hidden;">
              <div style="width: ${metricas.tasaCierre}%; height: 100%; background: var(--green);"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SECCIÓN: CONFIGURACIÓN -->
    <div id="sec-config" class="tab-sec" style="display: none;">
      <div class="section-title">
        <span>⚙️ Configuración del Bot y Parámetros de Venta</span>
      </div>

      <div style="background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 24px;">
        <form method="POST" action="/api/settings?token=${esc(tk)}">

          <!-- Card Modo Leona (Modelo A) -->
          <div style="background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.3); border-radius: 10px; padding: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
            <div style="max-width: 650px;">
              <div style="font-weight: 700; color: #fff; font-size: 0.95rem; display: flex; align-items: center; gap: 8px;">
                🦁 Modo Auto-Entrega Inmediata por IA (Modelo A estilo Leona)
                <span class="badge ${settings.modoAutoEntregaLeona !== false ? 'badge-green' : 'badge-red'}">
                  ${settings.modoAutoEntregaLeona !== false ? 'ACTIVADA 🟢' : 'DESACTIVADA 🔴'}
                </span>
              </div>
              <div style="font-size: 0.82rem; color: var(--muted); margin-top: 6px; line-height: 1.4;">
                Cuando un cliente envía una captura de Nequi/Daviplata por $10.000 COP, la IA analiza la imagen con visión artificial, verifica que no sea una referencia ya utilizada (antifraude) y entrega el enlace de Google Drive en 5 segundos sin depender de un celular Android ni de MacroDroid.
              </div>
            </div>
            <div>
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; background: var(--card); border: 1px solid var(--border); padding: 8px 14px; border-radius: 8px;">
                <input type="checkbox" name="modoAutoEntregaLeona" value="1" ${settings.modoAutoEntregaLeona !== false ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--green);">
                <span style="font-size: 0.85rem; font-weight: 600; color: #fff;">Auto-entregar con IA</span>
              </label>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: var(--muted); margin-bottom: 6px;">NÚMERO NEQUI</label>
              <input type="text" name="nequiNumero" value="${esc(settings.nequiNumero)}" style="width: 100%; background: #0b0f17; border: 1px solid var(--border); color: #fff; padding: 10px 12px; border-radius: 8px;">
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: var(--muted); margin-bottom: 6px;">TITULAR DE LA CUENTA</label>
              <input type="text" name="nequiTitular" value="${esc(settings.nequiTitular)}" style="width: 100%; background: #0b0f17; border: 1px solid var(--border); color: #fff; padding: 10px 12px; border-radius: 8px;">
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: var(--muted); margin-bottom: 6px;">NÚMERO DAVIPLATA</label>
              <input type="text" name="daviplataNumero" value="${esc(settings.daviplataNumero)}" style="width: 100%; background: #0b0f17; border: 1px solid var(--border); color: #fff; padding: 10px 12px; border-radius: 8px;">
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: var(--muted); margin-bottom: 6px;">LLAVE / BRE-B / TRANSFIYA</label>
              <input type="text" name="llaveNumero" value="${esc(settings.llaveNumero || settings.nequiNumero)}" style="width: 100%; background: #0b0f17; border: 1px solid var(--border); color: #fff; padding: 10px 12px; border-radius: 8px;">
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: var(--muted); margin-bottom: 6px;">LÍNEA WHATSAPP (BOT)</label>
              <input type="text" name="botWhatsApp" value="${esc(settings.botWhatsApp)}" style="width: 100%; background: #0b0f17; border: 1px solid var(--border); color: #fff; padding: 10px 12px; border-radius: 8px;">
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: var(--muted); margin-bottom: 6px;">PRECIO OFERTA (COP)</label>
              <input type="number" name="precioOferta" value="${esc(settings.precioOferta)}" style="width: 100%; background: #0b0f17; border: 1px solid var(--border); color: #fff; padding: 10px 12px; border-radius: 8px;">
            </div>
          </div>

          <div style="margin-top: 16px;">
            <label style="display: block; font-size: 0.8rem; font-weight: 600; color: var(--muted); margin-bottom: 6px;">ENLACE DE DESCARGA GOOGLE DRIVE</label>
            <input type="text" name="driveLink" value="${esc(settings.driveLink)}" style="width: 100%; background: #0b0f17; border: 1px solid var(--border); color: #fff; padding: 10px 12px; border-radius: 8px;">
          </div>

          <div style="margin-top: 20px;">
            <button type="submit" class="btn btn-green">💾 Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>

  </div>

  <!-- BARRA DE NAVEGACIÓN MÓVIL INFERIOR FIJA (Acceso inmediato con 1 pulgar) -->
  <nav class="mobile-bottom-nav" id="mobileBottomNav">
    <a href="#pendientes" class="mbn-item active" data-tab="pendientes">
      <div class="mbn-icon-wrap">
        <span>💸</span>
        ${pendientes.length > 0 ? `<span class="mbn-badge">${pendientes.length}</span>` : ''}
      </div>
      <span>Pendientes</span>
    </a>
    <a href="#chats" class="mbn-item" data-tab="chats">
      <div class="mbn-icon-wrap">
        <span>💬</span>
        <span class="mbn-badge" style="background:#2563eb;">${chatsLista.length}</span>
      </div>
      <span>Chats</span>
    </a>
    <a href="#ledger" class="mbn-item" data-tab="ledger">
      <div class="mbn-icon-wrap">
        <span>💰</span>
        ${unclaimedTxs.length > 0 ? `<span class="mbn-badge" style="background:var(--green); color:#000;">${unclaimedTxs.length}</span>` : ''}
      </div>
      <span>Banco</span>
    </a>
    <a href="#pedidos" class="mbn-item" data-tab="pedidos">
      <div class="mbn-icon-wrap">
        <span>📋</span>
      </div>
      <span>Ventas (${confirmados.length})</span>
    </a>
    <a href="#config" class="mbn-item" data-tab="config">
      <div class="mbn-icon-wrap">
        <span>⚙️</span>
      </div>
      <span>Ajustes</span>
    </a>
  </nav>

  <!-- MODAL ZOOM COMPROBANTE -->
  <div class="modal" id="modalZoom" onclick="cerrarZoom()">
    <span class="modal-close">&times;</span>
    <img id="modalImg" src="" alt="Comprobante">
  </div>

  <script>
    // Tab switching (Soporta pestañas desktop, barra móvil inferior y quick chips)
    function initTabs() {
      const allLinks = document.querySelectorAll('nav.tabs a, nav.mobile-bottom-nav a, .mobile-quick-stats a');
      const hash = window.location.hash || '#pendientes';

      function activate(h, shouldScroll = false) {
        const cleanHash = (h && h.startsWith('#')) ? h : ('#' + (h || 'pendientes'));
        document.querySelectorAll('.tab-sec').forEach(s => s.style.display = 'none');
        document.querySelectorAll('nav.tabs a, nav.mobile-bottom-nav a').forEach(a => a.classList.remove('active'));

        const target = document.getElementById('sec-' + cleanHash.replace('#', ''));
        const matched = document.querySelectorAll('nav.tabs a[href="' + cleanHash + '"], nav.mobile-bottom-nav a[href="' + cleanHash + '"]');
        
        if (target) {
          target.style.display = 'block';
        }
        matched.forEach(l => l.classList.add('active'));

        if (shouldScroll) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }

      allLinks.forEach(a => {
        a.addEventListener('click', (e) => {
          const href = a.getAttribute('href');
          if (href && href.startsWith('#')) {
            e.preventDefault();
            history.replaceState(null, null, href);
            activate(href, true);
          }
        });
      });

      activate(hash, false);
    }
    initTabs();

    // Zoom modal
    function abrirZoom(url) {
      if (!url) return;
      document.getElementById('modalImg').src = url;
      document.getElementById('modalZoom').classList.add('active');
    }
    function cerrarZoom() {
      document.getElementById('modalZoom').classList.remove('active');
    }

    // Filtro de chats
    function filtrarChats() {
      const q = (document.getElementById('chatSearch').value || '').toLowerCase();
      document.querySelectorAll('.chat-row').forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(q) ? 'flex' : 'none';
      });
    }

    // Auto-refresh cada 45 segundos (nunca mientras el operador escribe)
    let typing = false;
    document.addEventListener('focusin', e => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) typing = true;
    });
    document.addEventListener('focusout', () => { typing = false; });

    setInterval(() => {
      if (!typing && !document.getElementById('modalZoom').classList.contains('active')) {
        window.location.reload();
      }
    }, 45000);
  </script>
</body>
</html>`;
}

function renderFilaChat({ tel, c, msgs, cuando }, tk) {
  const ultimo = msgs.length ? msgs[msgs.length - 1] : null;
  const texto = ultimo ? ultimo.text || (ultimo.type === 'image' ? '📷 [Comprobante/Imagen]' : 'Archivo') : 'Sin mensajes';
  const nombre = c.perfil?.nombre || c.perfil?.username || `+${tel}`;
  const esPausado = c.pausado;

  return `
    <a href="/panel/chat?id=${esc(tel)}&token=${esc(tk)}" class="chat-row">
      <div class="chat-row-top">
        <div class="chat-user-wrap">
          <span class="chat-user-name">${esc(nombre)}</span>
          ${esPausado ? '<span class="badge badge-amber" style="font-size: 0.68rem; padding: 1px 6px;">⏸️ Silenciado</span>' : '<span class="badge badge-green" style="font-size: 0.68rem; padding: 1px 6px;">🟢 Activo</span>'}
        </div>
        <div class="chat-time-tag">
          <span style="color: #cbd5e1;">${horaCorta(cuando)}</span>
          <span style="font-size: 0.72rem; opacity: 0.75;"> · ${hace(cuando)}</span>
        </div>
      </div>
      <div class="chat-row-bottom">
        <div class="chat-preview">${esc(texto)}</div>
        <span class="chat-msg-badge">${msgs.length} msgs</span>
      </div>
    </a>
  `;
}

module.exports = {
  render,
  panelToken
};
