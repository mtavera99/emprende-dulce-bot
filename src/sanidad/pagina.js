// ============================================================================
// Páginas de sanidad
//  - paginaCompleta(a): /acceso/:token del comprador. Formulario de datos del negocio, documentos
//    generados (PDF y Word), "descargar todo" en ZIP y botón para pasar al Llave en Mano.
//  - paginaVistaPrevia(): /prueba-sanidad, pública. Lista todo el paquete con candado y deja una
//    planilla real desbloqueada: el dueño escribe nombre y NIT y la ve al instante.
// ============================================================================
const { TIPOS, AREAS, MAX_EDICIONES } = require('./datos');
const D = require('./documentos');
const S = require('./planes');

const pa = () => require('../paginaAcceso');
const cop = (v) => '$' + Math.round(Number(v) || 0).toLocaleString('es-CO');

const CSS = `<style>
.form label{display:block;font-size:.82rem;font-weight:700;color:#e2e8f0;margin:12px 0 4px}
.form .ayuda{font-weight:400;color:#94a3b8;font-size:.76rem}
.form input,.form select,.form textarea{width:100%;background:#0b1220;border:1px solid #334155;border-radius:8px;color:#fff;padding:10px 11px;font-size:.92rem}
.form textarea{min-height:68px;resize:vertical}.form .fila{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.form .err{color:#fca5a5;font-size:.78rem;margin-top:3px}.form .chk{display:flex;gap:8px;align-items:flex-start;font-weight:400;color:#cbd5e1}
.form .chk input{width:auto;margin-top:3px}.form button{width:100%;background:#10b981;color:#fff;border:0;border-radius:10px;padding:14px;font-weight:800;font-size:1rem;margin-top:16px;cursor:pointer}
.form fieldset{border:1px solid #222f44;border-radius:12px;padding:6px 14px 14px;margin-bottom:14px}.form legend{color:#5eead4;font-weight:800;font-size:.86rem;padding:0 6px}
.areas{display:grid;grid-template-columns:1fr 1fr;gap:4px 10px}.areas label{font-weight:400;color:#cbd5e1;margin:2px 0;display:flex;gap:6px;align-items:flex-start}.areas input{width:auto;margin-top:3px}
.fmt{display:flex;gap:6px}.fmt a{background:#0f766e;color:#fff;text-decoration:none;font-weight:700;font-size:.78rem;padding:7px 10px;border-radius:7px}
.ok{background:rgba(16,185,129,.12);border:1px solid rgba(16,185,129,.35);color:#a7f3d0}
.aviso{background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.35);color:#fde68a}
.prev{background:#fff;border-radius:10px;padding:6px;margin:12px 0;overflow:auto}.prev img{width:100%;display:block}
@media(max-width:520px){.form .fila,.areas{grid-template-columns:1fr}}
</style>`;

const ACLARACION = 'Incluye toda la documentación, los manuales, los procedimientos y las planillas que revisa la Secretaría de Salud, más la guía de qué certificados externos debes anexar. ' +
  'Los certificados no se pueden generar aquí: el de fumigación lo da una empresa de control de plagas con concepto sanitario, el de lavado de tanque una empresa registrada, ' +
  'y el certificado médico y el curso de manipulación de alimentos los da un médico o una entidad capacitadora.';

function campo(nombre, etiqueta, valor, err, o = {}) {
  const e = pa().esc;
  const input = o.textarea
    ? `<textarea name="${nombre}" placeholder="${e(o.placeholder || '')}">${e(valor)}</textarea>`
    : `<input name="${nombre}" value="${e(valor)}" ${o.type ? `type="${o.type}"` : ''} placeholder="${e(o.placeholder || '')}" ${o.req ? 'required' : ''} ${o.max ? `maxlength="${o.max}"` : ''}>`;
  return `<label>${etiqueta}${o.ayuda ? ` <span class="ayuda">${e(o.ayuda)}</span>` : ''}</label>${input}${err ? `<div class="err">${e(err)}</div>` : ''}`;
}

function formulario(a, entrada, errores = {}) {
  const e = pa().esc;
  const v = (k) => (Array.isArray(entrada[k]) ? entrada[k].join('\n') : entrada[k] == null ? '' : entrada[k]);
  const tipo = entrada.tipo || '';
  const areas = entrada.areas && entrada.areas.length ? entrada.areas : (TIPOS[tipo] || TIPOS.restaurante).areas;
  const quedan = MAX_EDICIONES - (a.ediciones || 0);
  return `<form class="form" method="POST" action="/acceso/${encodeURIComponent(a.token)}/datos">
  <fieldset><legend>Datos del establecimiento</legend>
    ${campo('nombre', 'Nombre del negocio *', v('nombre'), errores.nombre, { req: true, max: 80, placeholder: 'Restaurante El Buen Sabor' })}
    ${campo('razonSocial', 'Razón social', v('razonSocial'), errores.razonSocial, { max: 100, ayuda: '(si es diferente al nombre)' })}
    <div class="fila"><div>${campo('nit', 'NIT o cédula *', v('nit'), errores.nit, { req: true, max: 20, placeholder: '900123456-7' })}</div>
      <div>${campo('telefono', 'Teléfono *', v('telefono'), errores.telefono, { req: true, max: 20 })}</div></div>
    ${campo('direccion', 'Dirección del local *', v('direccion'), errores.direccion, { req: true, max: 120 })}
    <div class="fila"><div>${campo('ciudad', 'Ciudad o municipio *', v('ciudad'), errores.ciudad, { req: true, max: 60 })}</div>
      <div>${campo('departamento', 'Departamento', v('departamento'), errores.departamento, { max: 40 })}</div></div>
    ${campo('correo', 'Correo', v('correo'), errores.correo, { type: 'email', max: 80 })}
    <label>Tipo de negocio *</label><select name="tipo" required><option value="">Elige…</option>${Object.entries(TIPOS).map(([k, t]) => `<option value="${k}" ${k === tipo ? 'selected' : ''}>${e(t.nombre)}</option>`).join('')}</select>
    ${errores.tipo ? `<div class="err">${e(errores.tipo)}</div>` : ''}
    ${campo('horario', 'Horario de atención', v('horario'), null, { max: 60, placeholder: 'Lunes a sábado, 7 a. m. a 8 p. m.' })}
  </fieldset>
  <fieldset><legend>Personas</legend>
    ${campo('propietario', 'Propietario o representante', v('propietario'), null, { max: 80, ayuda: '(si lo dejas vacío, se usa el responsable)' })}
    ${campo('encargado', 'Responsable del plan de saneamiento *', v('encargado'), errores.encargado, { req: true, max: 80 })}
    ${campo('manipuladores', 'Manipuladores de alimentos *', v('manipuladores'), errores.manipuladores, { textarea: true, ayuda: '(un nombre por línea)' })}
  </fieldset>
  <fieldset><legend>Equipos, áreas y servicios</legend>
    ${campo('refrigeracion', 'Neveras y equipos de refrigeración', v('refrigeracion'), errores.refrigeracion, { textarea: true, ayuda: '(uno por línea: Nevera cocina, Vitrina de bebidas…)' })}
    ${campo('congelacion', 'Congeladores', v('congelacion'), null, { textarea: true, ayuda: '(uno por línea)' })}
    <label>Áreas del local</label><div class="areas">${Object.entries(AREAS).map(([k, n]) => `<label><input type="checkbox" name="areas" value="${k}" ${areas.includes(k) ? 'checked' : ''}> ${e(n)}</label>`).join('')}</div>
    <label>Agua</label><select name="agua"><option value="acueducto" ${entrada.agua !== 'tanque' ? 'selected' : ''}>Acueducto directo</option><option value="tanque" ${entrada.agua === 'tanque' ? 'selected' : ''}>Acueducto con tanque de almacenamiento</option></select>
    <div class="fila"><div>${campo('tanqueLitros', 'Litros del tanque', v('tanqueLitros') || '', null, { max: 6, ayuda: '(si tiene)' })}</div>
      <div>${campo('hipoclorito', 'Concentración del hipoclorito (%)', v('hipoclorito') || '5', null, { max: 4, ayuda: '(dice en la etiqueta)' })}</div></div>
    ${campo('proveedores', 'Proveedores habituales', v('proveedores'), null, { textarea: true, ayuda: '(uno por línea)' })}
    <div class="fila"><div>${campo('empresaPlagas', 'Empresa de control de plagas', v('empresaPlagas'), null, { max: 80 })}</div>
      <div><label>Servicio de fumigación cada</label><select name="frecuenciaPlagas"><option value="6" ${String(entrada.frecuenciaPlagas) !== '3' ? 'selected' : ''}>6 meses</option><option value="3" ${String(entrada.frecuenciaPlagas) === '3' ? 'selected' : ''}>3 meses</option></select></div></div>
    ${campo('inicio', 'Fecha de inicio de los registros *', v('inicio'), errores.inicio, { type: 'date', req: true })}
  </fieldset>
  <label class="chk"><input type="checkbox" name="autoriza" value="1" ${entrada.autoriza || a.negocio ? 'checked' : ''}> Autorizo usar estos datos solo para generar los documentos de mi negocio (Ley 1581 de 2012).</label>
  ${errores.autoriza ? `<div class="err">${e(errores.autoriza)}</div>` : ''}
  <button>${a.negocio ? 'Guardar cambios y volver a generar' : 'Generar mis documentos'}</button>
  ${a.negocio ? `<p class="foot">Puedes corregir los datos ${quedan} ${quedan === 1 ? 'vez' : 'veces'} más.</p>` : ''}
</form>`;
}

function listaDocs(a) {
  const e = pa().esc;
  const plan = a.plan || 'personalizado';
  const tk = encodeURIComponent(a.token);
  const dif = S.PLANES.llave.precio - S.PLANES.personalizado.precio;
  const mejora = pa().waLink('Hola, quiero pasar al Plan Llave en Mano de sanidad');
  return Object.entries(D.GRUPOS).map(([g, titulo]) => {
    const docs = D.CATALOGO.filter((x) => x.grupo === g);
    return `<div class="section-title">${e(titulo)}</div><div class="list">${docs.map((dc) => {
      if (!D.permitido(dc, plan)) {
        return `<a class="item lock" href="${mejora}"><div class="meta"><div class="t">🔒 ${e(dc.titulo)}</div><div class="s">${e(dc.sub)}</div></div><span class="btn">Mejorar por ${cop(dif)}</span></a>`;
      }
      return `<div class="item"><div class="meta"><div class="t">${e(dc.titulo)}</div><div class="s">${e(dc.sub)}</div></div><div class="fmt">${dc.formatos.map((f) =>
        `<a href="/s/${tk}/${encodeURIComponent(dc.id)}.${f}" ${f === 'pdf' ? 'target="_blank"' : 'download'}>${f === 'pdf' ? 'PDF' : 'Word'}</a>`).join('')}</div></div>`;
    }).join('')}</div>`;
  }).join('');
}

function paginaCompleta(a, o = {}) {
  const { base, esc, waLink } = pa();
  const pl = S.info(a.plan || 'personalizado');
  const d = a.negocio;
  const entrada = o.entrada || d || {};
  const dif = S.PLANES.llave.precio - S.PLANES.personalizado.precio;
  const sinEdiciones = d && (a.ediciones || 0) >= MAX_EDICIONES;
  const planBox = `<div class="box"><b>${pl.emoji} Tu plan: ${esc(pl.nombre)}</b> · ${pl.id === 'llave'
    ? 'incluye las planillas de 4 meses ya armadas con tus fechas, equipos y personal.'
    : 'tus planillas vienen con los datos de tu negocio para fotocopiar cada mes.'}` +
    (pl.id === 'personalizado' ? `<a class="cta" style="margin:12px 0 0" href="${waLink('Hola, quiero pasar al Plan Llave en Mano de sanidad')}">⬆ ¿Tienes poco tiempo? Servicio Plus: ¡llenamos las planillas por ti! (+${cop(dif)})</a>` : '') + '</div>';
  const docs = d
    ? `<div class="section-title" id="documentos">Tus documentos · ${esc(d.nombre)}</div>
       <a class="cta" href="/s/${encodeURIComponent(a.token)}/todo.zip">📦 Descargar todo en un ZIP</a>
       ${listaDocs(a)}
       ${pl.id === 'llave' ? '<div class="box aviso"><b>Planillas de 4 meses:</b> ya traen las fechas, los equipos, las áreas, el personal, los rangos y las tareas programadas. Las lecturas, las marcas y las firmas se escriben a mano el día en que se hace cada actividad: así lo revisa la Secretaría de Salud.</div>' : ''}`
    : '<div class="box aviso"><b>Paso 1:</b> llena los datos de tu negocio y toca «Generar mis documentos». También puedes responderlos por WhatsApp: escribe <b>DATOS</b> en el chat.</div>';
  const editar = d
    ? (sinEdiciones
      ? `<div class="box">Ya usaste los ${MAX_EDICIONES} cambios de datos de tu compra. Si necesitas corregir algo, <a style="color:#c4b5fd" href="${waLink('Hola, necesito corregir los datos de mi plan de saneamiento')}">escríbenos</a>.</div>`
      : `<details class="sueltos" ${o.errores ? 'open' : ''}><summary>✏️ Corregir los datos del negocio</summary>${formulario(a, entrada, o.errores || {})}</details>`)
    : formulario(a, entrada, o.errores || {});
  return base(`📋 Plan de Saneamiento · Tu acceso`, `${CSS}
    <div class="header"><span class="badge b-ok">✅ PAGO CONFIRMADO · ACCESO PERSONAL</span><h1>Plan de Saneamiento Básico 2026-2027 📋</h1>
      <p class="sub">Resolución 2674 de 2013 · 4 programas, POES, cronogramas, carteles y las 10 planillas de vigilancia con los datos de tu negocio.</p></div>
    ${o.guardado ? `<div class="box ok"><b>¡Listo!</b> Tus documentos ya tienen los datos de ${esc(d.nombre)}. Descárgalos abajo.</div>` : ''}
    ${o.errores ? '<div class="box aviso"><b>Revisa los campos marcados en rojo.</b></div>' : ''}
    <div class="box"><b>Este enlace es solo tuyo.</b> Guárdalo: los documentos se generan cada vez que los abres, con los datos que guardaste.</div>
    ${planBox}
    ${docs}
    ${editar}
    <div class="box"><b>Qué incluye y qué no:</b> ${esc(ACLARACION)}</div>
    <div class="foot">¿Dudas con tus documentos? <a style="color:#c4b5fd" href="${waLink('Hola, necesito ayuda con mi plan de saneamiento')}">Escríbenos por WhatsApp</a></div>`);
}

function paginaVistaPrevia() {
  const { base, esc, waLink } = pa();
  const P = S.PLANES;
  const grupos = Object.entries(D.GRUPOS).map(([g, titulo]) => `<div class="section-title">${esc(titulo)}</div><div class="list">${D.CATALOGO.filter((x) => x.grupo === g).map((dc) => {
    if (dc.id === 'f_recepcion') {
      return `<div class="item" style="border-color:#10b981"><div class="meta"><div class="t">🔓 ${esc(dc.titulo)} · GRATIS</div><div class="s">Desbloqueada: genérala arriba con el nombre de tu negocio</div></div><span class="btn" style="background:#10b981">Gratis</span></div>`;
    }
    return `<div class="item lock"><div class="meta"><div class="t">🔒 ${esc(dc.titulo)}</div><div class="s">${esc(dc.sub)}</div></div><span class="btn">${dc.plan === 'llave' ? 'Llave en Mano' : 'Con el pago'}</span></div>`;
  }).join('')}</div>`).join('');
  return base('📋 Vista previa gratis · Plan de Saneamiento Básico', `${CSS}
    <div class="header"><span class="badge b-prueba">🎁 VISTA PREVIA GRATIS</span><h1>Prueba tu planilla antes de pagar 📋</h1>
      <p class="sub">Escribe el nombre de tu negocio y tu NIT: se genera al instante tu <b>Planilla de Recepción de Materias Primas</b>, lista para imprimir. Así ves cómo quedan todos los documentos del paquete.</p></div>
    <form class="form box" id="f" method="POST" action="/prueba-sanidad/planilla.pdf" target="_blank">
      ${campo('nombre', 'Nombre del negocio', '', null, { req: true, max: 80, placeholder: 'Restaurante El Buen Sabor' })}
      ${campo('nit', 'NIT o cédula', '', null, { req: true, max: 20, placeholder: '900123456-7' })}
      <div class="fila"><div>${campo('ciudad', 'Ciudad', '', null, { max: 60 })}</div><div>${campo('direccion', 'Dirección', '', null, { max: 120 })}</div></div>
      <div class="err" id="err"></div>
      <div class="prev" id="prev" style="display:none"><img id="img" alt="Vista previa de tu planilla"></div>
      <button type="button" id="ver">👀 Ver mi planilla</button>
      <button id="pdf" style="background:#0f766e">⬇️ Descargar mi planilla en PDF</button>
    </form>
    <div class="box"><b>Cuando compras, todo el paquete sale con tus datos:</b><br>
      ${P.personalizado.emoji} <b>${esc(P.personalizado.nombre)} · ${cop(P.personalizado.precio)}</b>: Plan de Saneamiento, 4 programas, POES, cronogramas, carteles y las 10 planillas con tus datos.<br>
      ${P.llave.emoji} <b>${esc(P.llave.nombre)} · ${cop(P.llave.precio)}</b>: <b>¿Tienes poco tiempo? Adquiere nuestro Servicio Plus:</b> ¡llenamos las planillas de 4 meses por ti con tus fechas, neveras y personal, listas solo para imprimir!</div>
    <a class="cta" href="${waLink(`Ya probé la planilla gratis y quiero el ${P.personalizado.nombre} de sanidad`)}">${P.personalizado.emoji} Quiero el ${esc(P.personalizado.nombre)} · ${cop(P.personalizado.precio)}</a>
    <a class="cta" style="background:#0f766e" href="${waLink(`Ya probé la planilla gratis y quiero el ${P.llave.nombre} de sanidad`)}">${P.llave.emoji} Servicio Plus: ¡llenamos tus planillas! · ${cop(P.llave.precio)}</a>
    ${grupos}
    <div class="box"><b>Qué incluye y qué no:</b> ${esc(ACLARACION)}</div>
    <script>
    const f=document.getElementById('f'),err=document.getElementById('err');
    function datos(){const n=f.nombre.value.trim(),t=f.nit.value.trim();if(n.length<2){err.textContent='Escribe el nombre del negocio.';return null}
      if(!/^[0-9][0-9.\\- ]{4,18}[0-9]$/.test(t)){err.textContent='Escribe el NIT o la cédula solo con números.';return null}err.textContent='';
      return new URLSearchParams({nombre:n,nit:t,ciudad:f.ciudad.value.trim(),direccion:f.direccion.value.trim()})}
    document.getElementById('ver').onclick=function(){const q=datos();if(!q)return;const i=document.getElementById('img');i.src='/prueba-sanidad/planilla.svg?'+q;document.getElementById('prev').style.display='block';i.scrollIntoView({behavior:'smooth'})};
    f.onsubmit=function(ev){if(!datos())ev.preventDefault()};
    </script>`);
}

module.exports = { paginaCompleta, paginaVistaPrevia, ACLARACION };
