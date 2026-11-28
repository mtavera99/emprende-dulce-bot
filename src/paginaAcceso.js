// Páginas del comprador: acceso completo, prueba con candados y vista pública (todo con candado).
const accesos = require('./accesos');
const store = require('./store');

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function waLink(texto) {
  const s = store.getSettings();
  const num = String(s.botWhatsApp || process.env.BOT_WHATSAPP || '573105652478').replace(/\D/g, '');
  return `https://wa.me/${num}?text=${encodeURIComponent(texto)}`;
}

function base(titulo, cuerpo) {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow"><title>${esc(titulo)}</title>
<style>
:root{--bg:#0b0f19;--card:#151c28;--border:#222f44;--text:#f1f5f9;--muted:#94a3b8;--primary:#8b5cf6;--green:#10b981;--amber:#f59e0b}
*{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
body{background:var(--bg);color:var(--text);padding:24px 16px 60px;display:flex;justify-content:center}
.wrap{width:100%;max-width:640px}.header{text-align:center;margin-bottom:20px}
.badge{display:inline-block;font-size:.8rem;font-weight:700;padding:4px 12px;border-radius:999px;margin-bottom:12px}
.b-ok{background:rgba(16,185,129,.15);color:#34d399;border:1px solid rgba(16,185,129,.3)}.b-prueba{background:rgba(245,158,11,.15);color:#fbbf24;border:1px solid rgba(245,158,11,.35)}
h1{font-size:1.5rem;font-weight:800;color:#fff;margin-bottom:6px}p.sub{color:var(--muted);font-size:.92rem;line-height:1.5}
.box{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px 16px;margin-bottom:18px;font-size:.86rem;color:var(--muted);line-height:1.55}.box b{color:#fff}
.timer{background:linear-gradient(135deg,#451a03,#1c1917);border:2px solid var(--amber);border-radius:14px;padding:14px;text-align:center;margin-bottom:18px}
.timer b{display:block;font-size:2rem;color:#fbbf24;font-variant-numeric:tabular-nums}
.section-title{font-size:1.02rem;font-weight:700;color:#fff;margin:6px 0 10px}
.list{display:flex;flex-direction:column;gap:10px;margin-bottom:22px}
.item{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;text-decoration:none;color:inherit}
a.item:hover{border-color:var(--primary);background:#1c2637}
.item.lock{opacity:.62}.meta{flex:1;min-width:0}.t{font-size:.95rem;font-weight:700;color:#fff;margin-bottom:3px}.s{font-size:.78rem;color:var(--muted);line-height:1.4}
.btn{background:var(--primary);color:#fff;padding:9px 14px;border-radius:8px;font-size:.82rem;font-weight:700;white-space:nowrap}.lock .btn{background:#334155;color:#cbd5e1}
.cta{display:block;text-align:center;background:var(--green);color:#fff;text-decoration:none;font-weight:800;padding:14px;border-radius:10px;margin:6px 0 18px}
.drive{display:block;text-align:center;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;padding:12px;border-radius:8px;margin-top:10px}
.foot{text-align:center;color:var(--muted);font-size:.8rem;margin-top:16px;line-height:1.5}
details.sueltos{background:#111827;border:1px solid var(--border);border-radius:12px;padding:10px 14px;margin-top:-4px}
details.sueltos summary{cursor:pointer;font-size:.86rem;font-weight:700;color:#c4b5fd}
.pat{padding:10px 0;border-bottom:1px solid var(--border);font-size:.84rem}.pat:last-child{border-bottom:0}.pat b{display:block;color:#fff;margin-bottom:6px}
.pat a{display:inline-block;color:#fff;background:#334155;border-radius:6px;padding:5px 9px;margin:0 6px 6px 0;text-decoration:none;font-weight:600}
.pat .tl{color:var(--muted);margin-top:2px}
</style></head><body><div class="wrap">${cuerpo}</div></body></html>`;
}

// Precio para subir del plan del acceso al plan del archivo (moldes)
function textoMejora(acceso, plan) {
  const planes = require('./planes'), ventas = require('./ventas');
  const dif = ventas.precioNormal('moldes', plan) - ventas.precioNormal('moldes', (acceso && acceso.plan) || 'basico');
  return { dif, nombre: planes.PLANES[plan].nombre, link: waLink(`Hola, quiero mejorar mi plan de moldes al ${planes.PLANES[plan].nombre}`) };
}

function lista(c, token, modo, acceso = null) {
  const grupos = [];
  for (const it of c.items) {
    if (it.soloPrueba && modo === 'completo') continue;
    let g = grupos.find((x) => x.nombre === it.grupo);
    if (!g) grupos.push(g = { nombre: it.grupo, items: [] });
    g.items.push(it);
  }
  return grupos.map((g) => `<div class="section-title">${esc(g.nombre)}</div><div class="list">${g.items.map((it) => {
    const peso = it.mb ? ` · ${String(it.mb).replace('.', ',')} MB` : '';
    // Comprador de un plan menor: el contenido premium se ve con candado y el botón de mejorar
    if (modo === 'completo' && acceso && !accesos.incluyePlan(acceso, it)) {
      const m = textoMejora(acceso, it.plan);
      return `<a class="item lock" href="${m.link}"><div class="meta"><div class="t">🔒 ${esc(it.titulo)}</div><div class="s">${esc(it.sub)}${peso}</div></div><span class="btn">Mejorar por ${esc(require('./ventas').cop(m.dif))}</span></a>`;
    }
    const libre = modo === 'completo' || (modo === 'prueba' && it.gratis);
    if (!libre) {
      return `<div class="item lock"><div class="meta"><div class="t">🔒 ${esc(it.titulo)}</div><div class="s">${esc(it.sub)}${peso}</div></div><span class="btn">Se desbloquea al pagar</span></div>`;
    }
    const enlace = `<a class="item" href="/d/${encodeURIComponent(token)}/${encodeURIComponent(it.id)}" ${it.abrir ? 'target="_blank"' : 'download'}>
      <div class="meta"><div class="t">${esc(it.titulo)}</div><div class="s">${esc(it.sub)}${peso}</div></div><span class="btn">${it.abrir ? 'Abrir' : modo === 'completo' && it.prendas ? 'ZIP' : 'Descargar'}</span></a>`;
    // Muebles: cada categoría lleva a sus diseños en el catálogo web, que se ven en el celular sin descargar nada
    if (modo === 'completo' && it.disenosCat) {
      return `${enlace}<details class="sueltos"><summary>📱 Ver los planos en el celular sin descargar (${it.disenosCat.length} diseños)</summary>${it.disenosCat.map((d) =>
        `<div class="pat"><a href="/planos/${encodeURIComponent(token)}/d/${encodeURIComponent(d.slug)}">${esc(d.nombre)}</a> <span class="tl">${d.n} planos</span></div>`).join('')}</details>`;
    }
    if (modo !== 'completo' || !it.prendas) return enlace;
    // PDF sueltos de cada patrón: abren directo en el celular, sin descomprimir el ZIP
    const base = `/d/${encodeURIComponent(token)}/${encodeURIComponent(it.id)}/`;
    const pdfs = accesos.pdfsDe(it).map((g) => `<div class="pat"><b>${esc(g.nombre)}</b>
      ${g.ficha ? `<a href="${base}${g.ficha.n}" target="_blank">📄 Ficha técnica</a>` : ''}
      ${g.carta.length ? `<div class="tl">Carta: ${g.carta.map((t) => `<a href="${base}${t.n}" target="_blank">${esc(t.talla)}</a>`).join('')}</div>` : ''}
      ${g.a4.length ? `<div class="tl">A4: ${g.a4.map((t) => `<a href="${base}${t.n}" target="_blank">${esc(t.talla)}</a>`).join('')}</div>` : ''}</div>`).join('');
    return pdfs ? `${enlace}<details class="sueltos"><summary>📱 Abrir los PDF sueltos (sin descomprimir)</summary>${pdfs}</details>` : enlace;
  }).join('')}</div>`).join('');
}

// Moldes con planes: qué plan tiene y el botón para subir al siguiente
function bloquePlan(a) {
  const planes = require('./planes');
  if (a.producto !== 'moldes' || !planes.hayPlanes()) return '';
  const actual = planes.info(a.plan || 'basico');
  const siguiente = planes.disponibles().find((id) => planes.rango(id) > actual.rango);
  const m = siguiente ? textoMejora(a, siguiente) : null;
  return `<div class="box"><b>${actual.emoji} Tu plan: ${esc(actual.nombre)}</b> · ${actual.moldes.toLocaleString('es-CO')} moldes.` +
    (m ? `<a class="cta" style="margin:12px 0 0" href="${m.link}">⬆ Pasar al ${esc(m.nombre)} por ${esc(require('./ventas').cop(m.dif))}</a>` : '') + `</div>`;
}

// Botón al catálogo interactivo de planos (pack de muebles)
function botonCatalogo(c, a) {
  return c.catalogo ? `<a class="cta" style="background:#b45309" href="/planos/${encodeURIComponent(a.token)}">📐 Abrir el catálogo interactivo de planos</a>` : '';
}

function headerPlan(a, c) {
  const planes = require('./planes');
  if (a.producto !== 'moldes' || !planes.hayPlanes()) {
    return {
      titleTag: `${c.emoji} ${c.titulo} · Tu acceso`,
      badge: '✅ PAGO CONFIRMADO · ACCESO PERSONAL',
      h1: `${esc(c.titulo)} ${c.emoji}`,
      sub: esc(c.intro)
    };
  }
  const info = planes.info(a.plan || 'basico');
  const total = info.moldes.toLocaleString('es-CO');
  const extras = planes.incluye(info.id, true);
  const sub = info.id === 'basico'
    ? `Tienes acceso a ${total} moldes a escala real en PDF (34 prendas, XS–XXL) y tus 4 bonos de regalo.`
    : `Tienes acceso a ${total} moldes a escala real: las 10 colecciones base + ${extras} y todos los bonos incluidos.`;
  return {
    titleTag: `${info.emoji} ${info.nombre} · ${total} Moldes`,
    badge: `${info.emoji} PAGO CONFIRMADO · ${info.nombre.toUpperCase()}`,
    h1: `Este es tu ${esc(info.nombre)} · ${total} Moldes ${info.emoji}`,
    sub: esc(sub)
  };
}

function paginaCompleta(a) {
  const c = accesos.contenido(a.producto);
  const h = headerPlan(a, c);
  const drive = store.driveDe(a.producto);
  return base(h.titleTag, `
    <div class="header"><span class="badge b-ok">${h.badge}</span><h1>${h.h1}</h1><p class="sub">${h.sub}</p></div>
    <div class="box"><b>Este enlace es solo tuyo.</b> Guárdalo para volver a descargar cuando quieras. ${esc(c.nota)}
      ${a.producto === 'muebles' ? '<br><br><b>📱 En el celular:</b> abre el catálogo interactivo o toca «Ver los planos en el celular sin descargar» en cada categoría: cada plano se ve completo en el navegador, sin descomprimir nada. Los PDF de cada categoría también se descargan sueltos.' : ''}
      ${a.producto === 'moldes' ? '<br><br><b>📱 En el celular:</b> abre los PDF sueltos de cada patrón (botón «Abrir los PDF sueltos»). Los ZIP traen la colección completa: en Android ábrelos con la app <b>Files de Google</b> y en iPhone con <b>Archivos</b>.' : ''}
      ${drive ? `<a class="drive" href="${esc(drive)}" target="_blank" rel="noopener">📁 Abrir también en Google Drive</a>` : ''}</div>
    ${bloquePlan(a)}
    ${botonCatalogo(c, a)}
    ${lista(c, a.token, 'completo', a)}
    <div class="foot">¿Dudas con la impresión o la descarga? <a style="color:#c4b5fd" href="${waLink('Hola, necesito ayuda con mi acceso')}">Escríbenos por WhatsApp</a><br>Acceso de por vida para el comprador.</div>`);
}

function paginaPrueba(a) {
  const c = accesos.contenido(a.producto);
  // Precio del producto de esta prueba (muebles $15.000 o el descuento que se le ofreció)
  const precio = require('./ventas').precioDe({ ...(store.getLead(a.phone) || {}), producto: a.producto });
  return base(`${c.emoji} Prueba gratis · ${c.titulo}`, `
    <div class="header"><span class="badge b-prueba">🤝 ACCESO DE PRUEBA · HONESTIDAD</span><h1>${esc(c.titulo)} ${c.emoji}</h1><p class="sub">${esc(c.intro)}</p></div>
    <div class="timer">Tu acceso de prueba vence en<b id="t">--:--</b><span style="font-size:.8rem;color:#fcd34d">Descarga la muestra gratis y mira por dentro todo lo que trae el pack.</span></div>
    <a class="cta" href="${waLink(`Ya revisé la prueba y quiero el pack completo de ${c.titulo} por $${precio.toLocaleString('es-CO')}`)}">✅ Quiero el pack completo por $${precio.toLocaleString('es-CO')}</a>
    ${botonCatalogo(c, a)}
    ${lista(c, a.token, 'prueba')}
    <div class="box">Para desbloquear todo, transfiere y <b>envía la foto del comprobante por WhatsApp</b>. El sistema te entrega tu enlace personal con todo desbloqueado en segundos.</div>
    <script>const fin=${a.expiresAt};function tick(){const r=Math.max(0,fin-Date.now());const m=Math.floor(r/60000),s=Math.floor(r%60000/1000);document.getElementById('t').textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');if(r<=0)location.reload();}tick();setInterval(tick,1000);</script>`);
}

function paginaPublica(producto) {
  const c = accesos.contenido(producto);
  return base(`${c.emoji} ${c.titulo}`, `
    <div class="header"><span class="badge b-prueba">🔒 CONTENIDO PROTEGIDO</span><h1>${esc(c.titulo)} ${c.emoji}</h1><p class="sub">${esc(c.intro)}</p></div>
    <div class="box"><b>Cada comprador recibe su propio enlace de descarga por WhatsApp.</b> Si ya pagaste y no lo tienes, o el enlace anterior ya no funciona, escríbenos y te lo reenviamos.</div>
    <a class="cta" href="${waLink(`Hola, ya compré ${c.titulo} y necesito mi enlace de descarga`)}">💬 Pedir mi enlace por WhatsApp</a>
    ${lista(c, '', 'publico')}`);
}

function paginaNoValida(motivo, a) {
  const c = a ? accesos.contenido(a.producto) : null;
  const titulo = motivo === 'vencido' ? 'Tu acceso de prueba terminó ⏳' : motivo === 'desactivado' ? 'Este enlace fue desactivado' : 'Enlace no válido';
  const texto = motivo === 'vencido'
    ? 'Confiamos en tu palabra 🤝 Si el material te gustó, envía el comprobante por WhatsApp y te desbloqueamos el pack completo de por vida.'
    : 'Si compraste el pack, escríbenos por WhatsApp y te enviamos tu enlace personal.';
  return base(titulo, `<div class="header"><h1>${titulo}</h1><p class="sub">${esc(texto)}</p></div>
    <a class="cta" href="${waLink(motivo === 'vencido' ? `Quiero el pack completo${c ? ' de ' + c.titulo : ''}` : 'Hola, necesito mi enlace de descarga')}">💬 Escribir por WhatsApp</a>`);
}

module.exports = { paginaCompleta, paginaPrueba, paginaPublica, paginaNoValida, waLink };
