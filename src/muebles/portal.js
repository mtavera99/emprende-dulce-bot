// Portal del comprador del pack de muebles: catálogo con buscador y filtros, y página de cada plano
// (vista acotada, despiece, herrajes, láminas, plano de cortes y armado). Se calcula en el servidor
// con el mismo motor de los PDF, así que el comprador puede ajustar las medidas a su espacio.
// Con acceso de prueba (HONESTIDAD) solo se abre el plano de muestra.
const fs = require('fs');
const path = require('path');
const M = require('./motor');
const D = require('./dibujo');

const MANIFEST = path.join(__dirname, '../../public/descargas/muebles/manifest.json');
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const mm = (v) => String(Math.round(v * 10) / 10).replace('.', ',');
const ICONO = { '01': '🍳', '02': '👗', '03': '💻', '04': '🛏', '05': '🧸' };
// Tipos de plano a los que se les puede cambiar ancho, alto y fondo
const AJUSTABLES = new Set([undefined, 'escritorio', 'bibliotecaPuertas', 'corredizo', 'gamer', 'tocador', 'baul']);

// El manifest (~0,5 MB) se lee una vez y se vuelve a leer solo si cambia el archivo
let cache = { mtime: 0, man: null };
function manifest() {
  try {
    const mt = fs.statSync(MANIFEST).mtimeMs;
    if (!cache.man || cache.mtime !== mt) cache = { mtime: mt, man: JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) };
    return cache.man;
  } catch (_) { return { categorias: [], totales: {}, muestra: {} }; }
}
function codMuestra() { return (manifest().muestra || {}).cod || 'DOR-MN2C-450x500x400'; }

function base(titulo, cuerpo) {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow"><title>${esc(titulo)}</title><style>
:root{--c1:#2b1d12;--oro:#e0a84b;--crema:#fbf6ee;--linea:#e6dccb;--gris:#6b6257;--ok:#15803d}
*{box-sizing:border-box}body{margin:0;background:var(--crema);color:#231a12;font:15px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
header{background:var(--c1);color:#fff;padding:18px 16px;border-bottom:4px solid var(--oro)}header h1{margin:0;font:800 21px Georgia,serif}header p{margin:4px 0 0;color:#efe3d2;font-size:13px}
header a{color:#f6d69b}.wrap{max-width:980px;margin:0 auto;padding:14px}
.buscar{width:100%;padding:12px 14px;border:1px solid #d6cbb9;border-radius:10px;font:inherit;margin:4px 0 10px}
.pills{display:flex;gap:8px;overflow-x:auto;padding-bottom:6px;margin-bottom:12px}.pill{border:1px solid #d6cbb9;background:#fff;border-radius:999px;padding:7px 12px;font-size:13px;white-space:nowrap;cursor:pointer}
.pill.on{background:var(--c1);color:#fff;border-color:var(--c1)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px}
.card{background:#fff;border:1px solid var(--linea);border-radius:12px;padding:12px;text-decoration:none;color:inherit;display:flex;flex-direction:column;gap:4px}
.card:hover{border-color:var(--oro)}.card small{color:#a26a10;font-weight:700;font-size:11px;letter-spacing:.06em}.card b{font-size:14.5px}.card span{font-size:12.5px;color:var(--gris)}
.card.lock{opacity:.55}.cnt{font-size:13px;color:var(--gris);margin:0 0 8px}
.box{background:#fff;border:1px solid var(--linea);border-radius:12px;padding:14px;margin-bottom:12px}
.dib{background:#fffdf9;border:1px solid var(--linea);border-radius:12px;padding:8px;display:flex;justify-content:center}.dib svg{width:100%;max-height:420px}
.kpi{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0}.kpi div{background:#f3ebdf;border-radius:10px;padding:8px;text-align:center}.kpi b{display:block;font:800 17px Georgia,serif;color:var(--c1)}.kpi span{font-size:11.5px;color:var(--gris)}
table{width:100%;border-collapse:collapse;font-size:13.5px}th{background:var(--c1);color:#fff;font-size:11.5px;text-align:left;padding:7px 6px}td{padding:6px;border-bottom:1px solid var(--linea);vertical-align:top}
td.r,th.r{text-align:right}td.n{color:#a26a10;font-weight:800}.nota{font-size:12px;color:var(--gris)}.tabla{overflow-x:auto}
h2{font:700 17px Georgia,serif;color:var(--c1);margin:4px 0 10px}ol{padding-left:20px;margin:0}li{margin-bottom:6px}
.btn{display:inline-block;background:var(--c1);color:#fff;text-decoration:none;font-weight:700;border-radius:9px;padding:11px 14px;margin:4px 6px 4px 0;font-size:14px;border:0;cursor:pointer}
.btn.sec{background:#efe6d8;color:var(--c1)}.btn.ok{background:var(--ok)}
.cortes{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px}.cortes div{border:1px solid var(--linea);border-radius:10px;padding:6px;background:#fff}.cortes svg{width:100%}
form.aj{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;align-items:end}form.aj label{font-size:12px;color:var(--gris)}form.aj input,form.aj select{width:100%;padding:8px;border:1px solid #d6cbb9;border-radius:8px;font:inherit}
@media(max-width:560px){form.aj{grid-template-columns:1fr 1fr}.kpi{grid-template-columns:1fr 1fr}table{font-size:12.5px}.desp td:nth-child(6),.desp th:nth-child(6){display:none}.wrap{padding:10px}}
@media print{header a,.btn,form.aj,.aviso a{display:none!important}body{background:#fff}.box,.dib{break-inside:avoid;border-color:#ccc}.cortes div{break-inside:avoid}}
.alerta{background:#fef2f2;border:1px solid #fca5a5;color:#991b1b;border-radius:10px;padding:10px 12px;margin-bottom:12px;font-size:13.5px}
.aviso{background:#fff7e6;border:1px solid #f1d39b;border-radius:10px;padding:10px 12px;margin-bottom:12px;font-size:13.5px}
</style></head><body>${cuerpo}</body></html>`;
}

const rango = (xs) => { const a = Math.min(...xs), b = Math.max(...xs); return a === b ? mm(a) : `${mm(a)} a ${mm(b)}`; };

// Catálogo: los diseños de cada categoría, con cuántas medidas tiene cada uno
function catalogo(acceso, waLink) {
  const man = manifest();
  const prueba = acceso.tipo === 'prueba';
  const muestra = codMuestra();
  const T = man.totales || {};
  const t = encodeURIComponent(acceso.token);
  const cards = man.categorias.flatMap((c) => c.disenos.map((d) => {
    const txt = `${d.pref} ${d.nombre} ${c.nombre} ${[...new Set(d.medidas.map((m) => m.A))].join(' ')}`.toLowerCase();
    const tieneMuestra = d.medidas.some((m) => m.cod === muestra);
    return `<a class="card" data-cat="${esc(c.id)}" data-t="${esc(txt)}" href="/planos/${t}/d/${encodeURIComponent(d.slug)}">
      <small>${esc(c.id)} · ${esc(d.pref)}</small><b>${esc(d.nombre)}</b>
      <span>${d.medidas.length} planos · anchos de ${rango(d.medidas.map((m) => m.A))} mm${prueba ? (tieneMuestra ? ' · 🎁 incluye la muestra' : ' · 🔒') : ''}</span></a>`;
  })).join('');
  return base('📐 Catálogo de planos · Muebles en Melamina', `
  <header><h1>📐 Catálogo de planos</h1><p>${(T.planos || 0).toLocaleString('es-CO')} planos de ${T.disenos || 0} diseños en sus medidas estándar · medidas en mm · <a href="/${prueba ? 'prueba' : 'acceso'}/${t}">← Volver a mis descargas</a></p></header>
  <div class="wrap">
    ${prueba ? `<div class="aviso">🤝 <b>Acceso de prueba:</b> puedes ver todos los diseños y sus medidas, y abrir el plano de muestra (<a href="/planos/${t}/${encodeURIComponent(muestra)}">${esc(muestra)}</a>). Los demás se desbloquean al pagar. <a href="${esc(waLink('Ya revisé la prueba y quiero el pack completo de muebles'))}">Quiero el pack completo</a></div>` : ''}
    <form class="aj" method="get" action="/planos/${t}/buscar" style="margin-bottom:10px"><div><label>Ancho (mm)</label><input name="A" type="number" placeholder="1200"></div><div><label>Alto (mm)</label><input name="H" type="number" placeholder="opcional"></div><div><label>Fondo (mm)</label><input name="P" type="number" placeholder="opcional"></div><button class="btn" type="submit">Buscar medida</button></form>
    <input class="buscar" id="q" placeholder="Buscar diseño: clóset, cocina, cama, escritorio, zapatero…" oninput="filtrar()">
    <div class="pills"><span class="pill on" data-c="" onclick="cat(this)">Todos</span>${man.categorias.map((c) => `<span class="pill" data-c="${esc(c.id)}" onclick="cat(this)">${ICONO[c.id] || '📁'} ${esc(c.corto)} (${c.planos.toLocaleString('es-CO')})</span>`).join('')}</div>
    <p class="cnt" id="cnt"></p>
    <div class="grid" id="g">${cards}</div>
  </div>
  <script>let C='';function cat(el){document.querySelectorAll('.pill').forEach(p=>p.classList.remove('on'));el.classList.add('on');C=el.dataset.c;filtrar()}
  function filtrar(){const q=document.getElementById('q').value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').split(/\s+/).filter(Boolean);let n=0;
  document.querySelectorAll('#g .card').forEach(c=>{const t=c.dataset.t.normalize('NFD').replace(/[\u0300-\u036f]/g,'');const ok=(!C||c.dataset.cat===C)&&q.every(w=>t.includes(w));c.style.display=ok?'':'none';if(ok)n++});
  document.getElementById('cnt').textContent=n+' diseño'+(n===1?'':'s')}filtrar()</script>`);
}

// Fila de una medida en las tablas del portal
function filaMedida(m, t, libre) {
  const celdas = `<td><b>${esc(m.cod)}</b>${m.cfg ? `<div class="nota">${esc(m.cfg)}</div>` : ''}</td><td class="r">${mm(m.A)} × ${mm(m.H)} × ${mm(m.P)}</td><td class="r">${m.tableros}</td><td class="r">${m.piezas}</td>`;
  return libre ? `<tr data-a="${m.A}" data-h="${m.H}" data-p="${m.P}" onclick="location.href='/planos/${t}/${encodeURIComponent(m.cod)}'" style="cursor:pointer">${celdas}<td><a href="/planos/${t}/${encodeURIComponent(m.cod)}">Abrir</a></td></tr>`
    : `<tr data-a="${m.A}" data-h="${m.H}" data-p="${m.P}" style="opacity:.55">${celdas}<td>🔒</td></tr>`;
}

// Página de un diseño: todas sus medidas, con filtro por ancho, alto y fondo
function diseno(acceso, slug, waLink) {
  const man = manifest();
  let c = null, d = null;
  for (const cc of man.categorias) { const dd = cc.disenos.find((x) => x.slug === slug); if (dd) { c = cc; d = dd; break; } }
  if (!d) return null;
  const prueba = acceso.tipo === 'prueba';
  const t = encodeURIComponent(acceso.token);
  const opciones = (k) => [...new Set(d.medidas.map((m) => m[k]))].sort((a, b) => a - b).map((v) => `<option value="${v}">${mm(v)}</option>`).join('');
  return base(`${d.nombre} · ${d.medidas.length} planos`, `
  <header><h1>${esc(d.nombre)}</h1><p>${esc(c.id)} · ${esc(c.corto)} · ${d.medidas.length} planos · <a href="/planos/${t}">← Catálogo</a></p></header>
  <div class="wrap">
    ${prueba ? `<div class="aviso">🤝 Acceso de prueba: las medidas se desbloquean con el pack completo. <a href="${esc(waLink('Ya revisé la prueba y quiero el pack completo de muebles'))}">Quiero el pack completo</a></div>` : ''}
    <div class="box"><form class="aj" onsubmit="return false"><div><label>Ancho (mm)</label><select id="fa" onchange="f()"><option value="">Todos</option>${opciones('A')}</select></div>
      <div><label>Alto (mm)</label><select id="fh" onchange="f()"><option value="">Todos</option>${opciones('H')}</select></div>
      <div><label>Fondo (mm)</label><select id="fp" onchange="f()"><option value="">Todos</option>${opciones('P')}</select></div><div class="nota" id="cnt"></div></form></div>
    <div class="box tabla"><table><thead><tr><th>Código</th><th class="r">Ancho × alto × fondo</th><th class="r">Tableros</th><th class="r">Piezas</th><th></th></tr></thead><tbody id="tb">
    ${d.medidas.map((m) => filaMedida(m, t, !prueba || m.cod === codMuestra())).join('')}</tbody></table></div>
  </div>
  <script>function f(){const a=fa.value,h=fh.value,p=fp.value;let n=0;document.querySelectorAll('#tb tr').forEach(r=>{const ok=(!a||r.dataset.a===a)&&(!h||r.dataset.h===h)&&(!p||r.dataset.p===p);r.style.display=ok?'':'none';if(ok)n++});cnt.textContent=n+' plano'+(n===1?'':'s')}f()</script>`);
}

// Buscar por medida: los planos más cercanos al ancho (y alto/fondo) pedidos
function buscarMedida(acceso, q) {
  const man = manifest();
  const t = encodeURIComponent(acceso.token);
  const prueba = acceso.tipo === 'prueba';
  const n = (v) => { const x = Math.round(Number(String(v || '').replace(',', '.'))); return Number.isFinite(x) && x > 0 ? x : null; };
  const A = n(q.A), H = n(q.H), P = n(q.P);
  const todos = man.categorias.flatMap((c) => c.disenos.flatMap((d) => d.medidas.map((m) => ({ ...m, d, c }))));
  const dist = (m) => (A ? Math.abs(m.A - A) : 0) + (H ? Math.abs(m.H - H) : 0) + (P ? Math.abs(m.P - P) : 0);
  const porDiseno = {};
  for (const m of todos) { const k = m.d.slug; if (!porDiseno[k] || dist(m) < dist(porDiseno[k])) porDiseno[k] = m; }
  const mejores = Object.values(porDiseno).filter((m) => !A || Math.abs(m.A - A) <= 300).sort((x, y) => dist(x) - dist(y));
  return base('Buscar por medida', `
  <header><h1>📏 Planos para ${A ? `${mm(A)} mm de ancho` : 'tu medida'}${H ? ` · ${mm(H)} de alto` : ''}${P ? ` · ${mm(P)} de fondo` : ''}</h1><p><a href="/planos/${t}">← Catálogo</a></p></header>
  <div class="wrap">
    <p class="cnt">La medida más cercana de cada diseño. Si no está exacta, abre el plano y usa «Ajustar medidas a tu espacio».</p>
    <div class="box tabla"><table><thead><tr><th>Código</th><th class="r">Ancho × alto × fondo</th><th class="r">Tableros</th><th class="r">Piezas</th><th></th></tr></thead><tbody>
    ${mejores.map((m) => `<tr><td colspan="5" style="background:#f3ebdf;font-weight:700">${esc(m.d.nombre)}</td></tr>${filaMedida(m, t, !prueba || m.cod === codMuestra())}`).join('') || '<tr><td colspan="5">No hay planos cerca de esa medida.</td></tr>'}
    </tbody></table></div>
  </div>`);
}

// Medidas pedidas por el comprador (con límites razonables)
function ajustes(item, q) {
  if (!AJUSTABLES.has(item.tipo) || !q) return { spec: item.spec, cambiado: false };
  const lim = (v, min, max, def) => { const n = Math.round(Number(String(v || '').replace(',', '.'))); return Number.isFinite(n) && n >= min && n <= max ? n : def; };
  const spec = { ...item.spec, A: lim(q.A, 200, 3000, item.spec.A), H: lim(q.H, 100, 2600, item.spec.H), P: lim(q.P, 120, 800, item.spec.P) };
  return { spec, cambiado: spec.A !== item.spec.A || spec.H !== item.spec.H || spec.P !== item.spec.P };
}

function plano(acceso, cod, q, waLink) {
  const enc = M.buscar(cod);
  if (!enc) return null;
  const prueba = acceso.tipo === 'prueba';
  const t = encodeURIComponent(acceso.token);
  if (prueba && enc.item.cod !== codMuestra()) {
    return base('🔒 Plano bloqueado', `<header><h1>🔒 ${esc(enc.item.nombre)}</h1><p><a href="/planos/${t}">← Volver al catálogo</a></p></header>
      <div class="wrap"><div class="box">Este plano se desbloquea con el pack completo. En tu prueba puedes abrir el plano de muestra <a href="/planos/${t}/${encodeURIComponent(codMuestra())}">${esc(codMuestra())}</a>.</div>
      <a class="btn ok" href="${esc(waLink('Ya revisé la prueba y quiero el pack completo de muebles'))}">✅ Quiero el pack completo</a></div>`);
  }
  const { item, fam } = enc;
  const aj = ajustes(item, q);
  const e = [15, 18].includes(Number(q && q.e)) ? Number(q.e) : null;
  const it = { ...item, spec: aj.spec };
  const r = M.construir(it, e ? { e, forzarE: true } : {});
  const md = r.medidas;
  const mel = r.piezas.filter((p) => p.material === 'melamina');
  const filaDe = (k) => r.piezas.indexOf(mel[k]) + 1;
  const herr = M.herrajesLista(r.herr);
  const man = manifest();
  const cat = man.categorias.find((c) => c.id === fam.id);
  const dMan = cat && cat.disenos.find((x) => x.slug === item.slug);
  const pdfId = `p${fam.id}`;
  const cambiado = aj.cambiado || (e && e !== (item.e || 15));
  const extras = (r.herr.extra || []).map(([n]) => n);
  const nCorr = Object.values(r.herr.correderas).reduce((a, b) => a + b, 0);
  const calc = `/regalo/calculadora?p=muebles&n=${encodeURIComponent(`${item.nombre} ${mm(md.A)} × ${mm(md.H)} × ${mm(md.P)} mm`)}&t=${r.tableros}&f=${r.fondos}&cf=${r.cantoFino}&cg=${r.cantoGrueso}&bis=${r.herr.bisagras}&cor=${nCorr}&man=${r.herr.manijas + (extras.some((x) => /Manija embutida/.test(x)) ? (item.spec.puertas || 2) : 0)}&m2=${r.m2mel}&otros=0`;
  const noCaben = r.optimizacion.noCaben || [];
  return base(`${item.cod} · ${item.nombre}`, `
  <header><h1>${esc(item.nombre)}</h1><p>${esc(fam.id)} · ${esc(fam.corto)} · Código <b>${esc(item.cod)}</b> · <a href="/planos/${t}/d/${encodeURIComponent(item.slug)}">← Otras medidas${dMan ? ` (${dMan.medidas.length})` : ''}</a> · <a href="/planos/${t}">Catálogo</a></p></header>
  <div class="wrap">
    ${cambiado ? `<div class="aviso">📏 Medidas ajustadas: <b>${mm(md.A)} × ${mm(md.H)} × ${mm(md.P)} mm</b>${e ? `, melamina de ${e} mm` : ''}. El despiece, los herrajes y los cortes se recalcularon. <a href="/planos/${t}/${encodeURIComponent(item.cod)}">Volver a las medidas del plano</a></div>` : ''}
    ${noCaben.length ? `<div class="alerta">⚠ ${noCaben.length} pieza(s) no caben en un tablero de 2,15 × 2,44 m con estas medidas. Reduce la medida o divide la pieza.</div>` : ''}
    <div class="dib">${D.frente(r, it.spec)}</div>
    <div class="kpi">
      <div><b>${mm(md.A)} × ${mm(md.H)} × ${mm(md.P)}</b><span>mm · ancho × alto × ${esc(md.etiquetaP || 'fondo')}</span></div>
      <div><b>${r.tableros}</b><span>tablero${r.tableros > 1 ? 's' : ''} de melamina ${r.e} mm</span></div>
      <div><b>${r.fondos}</b><span>lámina${r.fondos === 1 ? '' : 's'} HDF 3 mm</span></div>
      <div><b>${mm(r.cantoFino)} m</b><span>tapacanto 0,45 mm</span></div>
      <div><b>${mm(r.cantoGrueso)} m</b><span>tapacanto 2 mm</span></div>
      <div><b>${r.cortes}</b><span>piezas · ${String(r.aprovechamiento).replace('.', ',')} % aprovechado</span></div>
    </div>
    <div class="box"><h2>Despiece (medidas en mm)</h2><div class="tabla"><table class="desp"><thead><tr><th>#</th><th>Pieza</th><th class="r">Cant.</th><th class="r">Largo (veta)</th><th class="r">Ancho</th><th>Material</th><th>Canto</th></tr></thead><tbody>
      ${r.piezas.map((p, i) => `<tr><td class="n">${i + 1}</td><td>${esc(p.nombre)}${p.nota ? `<div class="nota">${esc(p.nota)}</div>` : ''}</td><td class="r">${p.cant}</td><td class="r"><b>${mm(p.largo)}</b></td><td class="r"><b>${mm(p.ancho)}</b></td><td>${p.material === 'melamina' ? `Melamina ${r.e}` : 'HDF 3'}</td><td>${M.notacion(p)}</td></tr>`).join('')}
      </tbody></table></div><p class="nota">Canto: 1L/2L = uno o los dos lados largos; 1A/2A = uno o los dos lados cortos; (2 mm) = canto grueso. El largo va en el sentido de la veta.</p></div>
    ${item.nota ? `<div class="aviso"><b>Importante:</b> ${esc(item.nota)}</div>` : ''}
    <div class="box"><h2>Herrajes y tornillería</h2><table><tbody>${herr.map(([n, c]) => `<tr><td>${esc(n)}</td><td class="r"><b>${c}</b></td></tr>`).join('')}</tbody></table></div>
    <div class="box"><h2>Paso a paso de armado</h2><ol>${M.pasos(it, r).map((x) => `<li>${esc(x)}</li>`).join('')}</ol></div>
    <div class="box"><h2>Plano de cortes</h2><p class="nota">El número es la fila del despiece. Corte de sierra de 4 mm y refile de 10 mm por borde. Tablero de 2,15 × 2,44 m.</p>
      <div class="cortes">${r.optimizacion.tableros.map((_, i) => `<div><b style="font-size:12px">Tablero ${i + 1} de ${r.tableros}</b>${D.tablero(r.optimizacion, i, filaDe)}</div>`).join('')}</div></div>
    ${AJUSTABLES.has(item.tipo) ? `<div class="box"><h2>📏 Ajustar medidas a tu espacio</h2>
      <form class="aj" method="get"><div><label>Ancho (mm)</label><input name="A" type="number" value="${md.A}" min="200" max="3000"></div><div><label>Alto (mm)</label><input name="H" type="number" value="${md.H}" min="100" max="2600"></div>
      <div><label>Fondo (mm)</label><input name="P" type="number" value="${md.P}" min="120" max="800"></div><div><label>Espesor</label><select name="e"><option value="15" ${r.e === 15 ? 'selected' : ''}>15 mm</option><option value="18" ${r.e === 18 ? 'selected' : ''}>18 mm</option></select></div>
      <button class="btn" type="submit">Recalcular</button></form><p class="nota">Se recalculan todas las piezas, los herrajes y el plano de cortes. Revisa siempre las medidas antes de pedir el corte.</p></div>` : ''}
    <div class="box"><h2>Cotizar y descargar</h2>
      <a class="btn ok" href="${esc(calc)}" target="_blank">🧮 Cotizar este mueble en pesos</a>
      <button class="btn sec" onclick="window.print()">🖨 Imprimir o guardar este plano en PDF</button>
      <a class="btn sec" href="/planos/${t}/${encodeURIComponent(item.cod)}/despiece.csv${cambiado ? `?A=${md.A}&H=${md.H}&P=${md.P}${e ? `&e=${e}` : ''}` : ''}">⬇ Lista de corte para el depósito (CSV)</a>
      ${prueba ? '' : `<a class="btn sec" href="/d/${t}/${pdfId}">📄 PDF de la categoría (${esc(cat ? cat.planos.toLocaleString('es-CO') : '')} planos)</a>`}
      ${extras.length ? `<p class="nota">En la calculadora, suma en «Otros herrajes» el valor de: ${esc(extras.join(' · '))}.</p>` : ''}</div>
  </div>`);
}

// Lista de corte en CSV (la piden muchos depósitos para cotizar el corte y el enchape)
function despieceCSV(acceso, cod, q) {
  const enc = M.buscar(cod);
  if (!enc || (acceso.tipo === 'prueba' && enc.item.cod !== codMuestra())) return null;
  const aj = ajustes(enc.item, q);
  const e = [15, 18].includes(Number(q && q.e)) ? Number(q.e) : null;
  const r = M.construir({ ...enc.item, spec: aj.spec }, e ? { e, forzarE: true } : {});
  const c = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const filas = [['#', 'Pieza', 'Cantidad', 'Largo veta (mm)', 'Ancho (mm)', 'Material', 'Tapacanto', 'Nota']]
    .concat(r.piezas.map((p, i) => [i + 1, p.nombre, p.cant, mm(p.largo), mm(p.ancho), p.material === 'melamina' ? `Melamina ${r.e} mm` : 'HDF 3 mm', M.notacion(p), p.nota || '']));
  return '\ufeff' + [`${c(enc.item.cod)};${c(enc.item.nombre)};${c(`${mm(r.medidas.A)} × ${mm(r.medidas.H)} × ${mm(r.medidas.P)} mm`)}`, ...filas.map((f) => f.map(c).join(';'))].join('\r\n');
}

module.exports = { catalogo, diseno, buscarMedida, plano, despieceCSV, manifest, codMuestra };
