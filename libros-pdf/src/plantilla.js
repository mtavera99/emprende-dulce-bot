// Convierte la definición de un libro (libros/*.js) en un HTML listo para imprimir.
const fs = require('fs');
const path = require('path');
const { costear, costearCaja, cop, pct, P } = require('./costeo');

const RAIZ = path.join(__dirname, '..');
const CSS = fs.readFileSync(path.join(__dirname, 'estilos.css'), 'utf8');

const fmtCant = (i) => {
  if (i.cant == null) return i.medida || '';
  const n = Number.isInteger(i.cant) ? i.cant.toLocaleString('es-CO') : String(i.cant).replace('.', ',');
  return `${n} ${i.u || ''}`.trim();
};

function rutaFotoBase64(id) {
  for (const ext of ['jpg', 'jpeg', 'png', 'webp']) {
    const f = path.join(RAIZ, 'fotos', `${id}.${ext}`);
    if (fs.existsSync(f)) {
      const mime = ext === 'png' ? 'image/png' : (ext === 'webp' ? 'image/webp' : 'image/jpeg');
      const b64 = fs.readFileSync(f).toString('base64');
      return `data:${mime};base64,${b64}`;
    }
  }
  return null;
}

function foto(id) {
  const dataUrl = rutaFotoBase64(id);
  if (dataUrl) {
    return `<figure class="foto"><img src="${dataUrl}" alt=""></figure>`;
  }
  return '';
}


function ficha(r) {
  const items = [
    ['Rinde', r.rinde ? `${r.rinde.porciones} ${r.rinde.formato}` : null],
    ['Tiempo activo', r.tiempos?.activo],
    ['Reposo / frío', r.tiempos?.espera],
    ['Dificultad', r.dificultad],
    ['Conservación', r.conservacion],
  ].filter(([, v]) => v);
  return `<dl class="ficha">${items.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
}

function listaIngredientes(r) {
  const out = [];
  let abierta = false;
  for (const i of r.ingredientes) {
    if (i.grupo) {
      if (abierta) out.push('</ul>');
      out.push(`<h4>${i.grupo}</h4><ul>`);
      abierta = true;
      continue;
    }
    if (!abierta) { out.push('<ul>'); abierta = true; }
    out.push(`<li><span class="cant">${fmtCant(i)}</span><span class="nom">${i.n}${i.medida && i.cant != null ? ` <em>(${i.medida})</em>` : ''}</span></li>`);
  }
  if (abierta) out.push('</ul>');
  return out.join('');
}

function tablaCosteo(r, c) {
  const filas = c.lineas
    .filter((l) => l.costo > 0)
    .map((l) => `<tr><td>${l.ing.n}</td><td class="num">${fmtCant(l.ing)}</td><td class="num">${cop(l.costo)}</td></tr>`)
    .join('');
  const venta = r.precioVenta != null;
  const emp = (r.empaque || []).map((id) => P.empaques[id].nombre.toLowerCase()).join(', ');
  let html = `<section class="costeo"><h3>Costeo comercial <small>precios de referencia ${P.fechaPrecios}</small></h3>
  <div class="${venta ? 'costeo-grid' : ''}"><table class="t t-costeo"><thead><tr><th>Ingrediente</th><th class="num">Cantidad</th><th class="num">Costo</th></tr></thead><tbody>${filas}
  <tr class="sub"><td colspan="2">Materia prima de la tanda</td><td class="num">${cop(c.materia)}</td></tr>
  <tr><td colspan="2">Costos indirectos (${pct(P.factorIndirectos)}: gas, energía, agua, mermas)</td><td class="num">${cop(c.indirectos)}</td></tr>`;
  if (venta) {
    html += `<tr><td colspan="2">Producto por unidad (÷ ${c.porciones})</td><td class="num">${cop(c.ingPorcion)}</td></tr>
    <tr><td colspan="2">Empaque por unidad <em>(${emp})</em></td><td class="num">${cop(c.empaque)}</td></tr>
    <tr class="total"><td colspan="2">Costo total por unidad</td><td class="num">${cop(c.unitario)}</td></tr>
    </tbody></table>
    <div class="kpis kpis-v">
      <div><span>Precio de venta sugerido</span><strong>${cop(c.precio)}</strong></div>
      <div><span>Ganancia bruta por unidad</span><strong>${cop(c.ganancia)}</strong></div>
      <div><span>Margen bruto</span><strong>${pct(c.margen)}</strong></div>
    </div></div>`;
    if (c.alt) {
      html += `<p class="alt"><b>Formato ${c.alt.nombre}:</b> costo ${cop(c.alt.unitario)} · precio sugerido ${cop(c.alt.precio)} · ganancia ${cop(c.alt.ganancia)} (${pct(c.alt.margen)})</p>`;
    }
    if (r.mostrarMinimo && c.margen < 0.6) {
      html += `<p class="nota-min">Para llegar a 60% de margen necesitarías vender a ${cop(c.precioMin60)}. Mira las estrategias para bajar costos en el capítulo de negocio.</p>`;
    }
  } else {
    html += `<tr class="total"><td colspan="2">Costo de la tanda completa</td><td class="num">${cop(c.materia + c.indirectos)}</td></tr>
    <tr><td colspan="2">Costo por ${r.rinde?.unidadCosto || 'porción'} (÷ ${c.porciones})</td><td class="num">${cop(c.ingPorcion)}</td></tr></tbody></table></div>`;
  }
  return html + '</section>';
}

function escalado(r) {
  const mult = [1, 2, 3];
  const fmt = (i, m) => {
    if (i.cant == null) {
      if (!i.sub) return i.medida || '';
      const t = (i.fraccion ?? 1) * m;
      return `${String(+t.toFixed(2)).replace('.', ',')} ${t === 1 ? 'tanda' : 'tandas'}`;
    }
    const v = i.cant * m;
    const t = Number.isInteger(v) ? v.toLocaleString('es-CO') : v.toFixed(1).replace('.', ',');
    return `${t} ${i.u || ''}`.trim();
  };
  const filas = r.ingredientes.filter((i) => !i.grupo)
    .map((i) => `<tr><td>${i.n}</td>${mult.map((m) => `<td class="num">${fmt(i, m)}</td>`).join('')}</tr>`).join('');
  const p = r.rinde?.porciones || 1;
  return `<section class="escalado"><h3>Producción por volumen</h3><table class="t"><thead><tr><th>Ingrediente</th>${mult
    .map((m) => `<th class="num">${p * m} ${m === 1 ? 'unid.' : 'unid.'}</th>`).join('')}</tr></thead><tbody>${filas}</tbody></table></section>`;
}

function receta(r, n, porId, libro = {}) {
  const c = costear(r, porId);
  const errores = r.errores?.length
    ? `<section class="errores"><h3>Si algo sale mal</h3><table class="t"><thead><tr><th>Problema</th><th>Causa y solución</th></tr></thead><tbody>${r.errores
        .map(([a, b]) => `<tr><td>${a}</td><td>${b}</td></tr>`)
        .join('')}</tbody></table></section>`
    : '';
  return `<article class="receta" id="${r.id}">
  <header class="r-head"><div class="kicker">${r.kicker || 'Receta'} · ${String(n).padStart(2, '0')}</div><h2>${r.titulo}</h2>${r.subtitulo ? `<p class="bajada">${r.subtitulo}</p>` : ''}</header>
  ${foto(r.id)}
  ${ficha(r)}
  <div class="r-cuerpo">
    <aside class="ingredientes"><h3>Ingredientes</h3>${listaIngredientes(r)}</aside>
    <section class="metodo"><h3>Paso a paso</h3><ol>${r.pasos.map((p) => `<li>${p}</li>`).join('')}</ol></section>
  </div>
  ${r.secreto ? `<div class="secreto"><div class="sello">Secreto de repostero</div>${r.secreto}</div>` : ''}
  ${libro.fichaProduccion ? '' : errores}
  ${r.variaciones ? `<section class="variaciones"><h3>Variaciones para tu menú</h3>${r.variaciones}</section>` : ''}
  ${libro.fichaProduccion
    ? `<div class="ficha-prod"><div class="kicker">Ficha de producción · ${String(n).padStart(2, '0')}</div><h2 class="fp-titulo">${r.titulo}</h2>${escalado(r)}${errores}${tablaCosteo(r, c)}</div>`
    : tablaCosteo(r, c)}
</article>`;
}

function caja(cj, porId) {
  const c = costearCaja(cj, porId);
  const filas = c.lineas
    .map((l) => `<tr><td>${l.it.cantidad} × ${l.rec.titulo}</td><td class="num">${cop(l.costo)}</td></tr>`)
    .join('');
  const emp = cj.empaque.map((id) => P.empaques[id].nombre).join(', ');
  return `<article class="caja-regalo" id="${cj.id}">
  <header class="r-head"><div class="kicker">Caja regalo</div><h2>${cj.titulo}</h2><p class="bajada">${cj.subtitulo}</p></header>
  ${foto(cj.id)}
  <div class="caja-grid"><div>${cj.html}</div>
  <div><table class="t t-costeo"><thead><tr><th>Contenido</th><th class="num">Costo</th></tr></thead><tbody>${filas}
  <tr><td>Empaque <em>(${emp})</em></td><td class="num">${cop(c.empaque)}</td></tr>
  <tr class="total"><td>Costo total de la caja</td><td class="num">${cop(c.unitario)}</td></tr></tbody></table>
  <div class="kpis kpis-v"><div><span>Precio sugerido</span><strong>${cop(c.precio)}</strong></div><div><span>Ganancia bruta</span><strong>${cop(c.ganancia)}</strong></div><div><span>Margen bruto</span><strong>${pct(c.margen)}</strong></div></div></div></div>
</article>`;
}

function resumen(libro, porId) {
  const filas = [];
  for (const s of libro.secciones) {
    if (s.tipo === 'receta' && s.precioVenta) {
      const c = costear(s, porId);
      filas.push([s.titulo, s.rinde.formatoCorto || s.rinde.formato, c.unitario, c.precio, c.ganancia, c.margen]);
    }
    if (s.tipo === 'caja') {
      const c = costearCaja(s, porId);
      filas.push([s.titulo, 'Caja', c.unitario, c.precio, c.ganancia, c.margen]);
    }
  }
  return `<table class="t t-resumen"><thead><tr><th>Producto</th><th>Formato</th><th class="num">Costo</th><th class="num">Precio</th><th class="num">Ganancia</th><th class="num">Margen</th></tr></thead><tbody>${filas
    .map(([a, b, c, d, e, f]) => `<tr><td>${a}</td><td>${b}</td><td class="num">${cop(c)}</td><td class="num">${cop(d)}</td><td class="num">${cop(e)}</td><td class="num">${pct(f)}</td></tr>`)
    .join('')}</tbody></table>`;
}

function indice(libro) {
  const items = [];
  let cap = null;
  let n = 0;
  for (const s of libro.secciones) {
    if (s.tipo === 'capitulo') {
      cap = { s, hijos: [] };
      items.push(cap);
    } else if ((s.tipo === 'receta' || s.tipo === 'caja') && cap) {
      if (s.tipo === 'receta') n++;
      const numStr = s.tipo === 'receta' ? String(n).padStart(2, '0') : '★';
      cap.hijos.push(`<li><a href="#${s.id}"><span class="idx-sub-num">${numStr}</span><span class="idx-title">${s.titulo}</span><span class="idx-dots"></span></a></li>`);
    }
  }
  return `<section class="indice">
    <div class="idx-header">
      <div class="kicker">Guía Práctica · Colección Emprende Dulce 2026</div>
      <h2>Índice General de Contenido</h2>
      <p class="bajada">Estructura paso a paso para formular, costear y vender con alta rentabilidad.</p>
    </div>
    <ol class="caps">${items
      .map((c) => `<li>
        <a href="#cap-${c.s.num}" class="idx-cap-link">
          <span class="n">CAP ${c.s.num}</span>
          <span class="idx-cap-title">${c.s.titulo}</span>
        </a>
        ${c.s.bajada ? `<p class="idx-cap-bajada">${c.s.bajada}</p>` : ''}
        ${c.hijos.length ? `<ul class="idx-lista">${c.hijos.join('')}</ul>` : ''}
      </li>`)
      .join('')}
    </ol>
  </section>`;
}

const SELLOS_DEFAULT = {
  cinta: 'Edición Emprendedores 2026',
  sticker: ['Incluye plantilla', 'Costeo', 'Colombia'],
  badges: ['Técnicas sin máquina industrial', 'Costeo en pesos colombianos (COP)', 'Fórmulas de alta rotación']
};

function selloColeccion(vol) {
  return `<svg class="pc-sello" viewBox="0 0 120 120" aria-hidden="true">
    <defs>
      <path id="txt-arc-${vol}" d="M 16 64 A 44 44 0 0 1 104 64" fill="none"/>
    </defs>
    <circle cx="60" cy="60" r="56" fill="none" stroke="var(--oro)" stroke-width="1.8" stroke-dasharray="3.5 2"/>
    <circle cx="60" cy="60" r="50" fill="color-mix(in srgb, var(--c2) 94%, #000)" stroke="var(--oro)" stroke-width="1"/>
    <text font-family="var(--sans)" font-size="5" font-weight="700" letter-spacing="1.1" fill="var(--oro)">
      <textPath href="#txt-arc-${vol}" startOffset="50%" text-anchor="middle">COLECCIÓN EMPRENDE DULCE</textPath>
    </text>
    <text x="60" y="51" text-anchor="middle" font-family="var(--sans)" font-size="6" font-weight="700" letter-spacing="1.6" fill="var(--oro)">VOLUMEN</text>
    <text x="60" y="76" text-anchor="middle" font-family="var(--serif)" font-weight="900" font-size="24" fill="#fff">${vol}</text>
    <text x="60" y="91" text-anchor="middle" font-size="7.5" fill="var(--oro)" letter-spacing="2">★★★</text>
    <text x="60" y="101" text-anchor="middle" font-family="var(--sans)" font-size="4.8" font-weight="700" letter-spacing="1.4" fill="rgba(255,255,255,0.7)">OFICIAL</text>
  </svg>`;
}

const ICO_CHECK = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7.2" fill="var(--oro)"/><path d="M4.6 8.3l2.2 2.2 4.6-4.8" stroke="var(--c2)" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function portada(l) {
  const pc = { ...SELLOS_DEFAULT, ...(l.portada || {}) };
  const t = l.tema || {};
  const lineas = pc.lineas || [l.titulo];
  const h1 = lineas.map((x, i) => `<span class="${i === pc.acento ? 'acento' : ''}">${x}</span>`).join('');
  const fotoSrc = rutaFotoBase64(`portada-${l.id}`) || (l.portadaVisual || []).map(rutaFotoBase64).find(Boolean);
  const hero = fotoSrc
    ? `<div class="pc-arco pc-foto"><img src="${fotoSrc}" alt=""></div>`
    : `<div class="pc-arco ilus"><div class="p-i p-i1"></div></div>`;
  const estilo = `--c1:${t.c1 || '#4a0f24'};--c2:${t.c2 || '#1f0610'};--c3:${t.c3 || '#7a1631'};--oro:${t.oro || '#d9b36a'};--cinta:${t.cinta || t.oro || '#d9b36a'};--cinta-txt:${t.cintaTxt || '#2a1a08'}`;
  return `<section class="portada pc" style="${estilo}">
  <div class="pc-luz"></div><div class="pc-trama"></div>
  <div class="pc-cinta"><span>${pc.cinta}</span></div>
  <header class="pc-top"><div class="pc-marca"><b>Emprende <i>Dulce</i></b><small>Colección de recetarios para emprender</small></div><div class="pc-vol">Vol.<b>${l.vol || '01'}</b></div></header>
  <div class="pc-titulo">
    <div class="pc-kicker"><span></span>${l.kicker}<span></span></div>
    <h1 class="l${lineas.length}">${h1}</h1>
    <p class="pc-sub">${pc.sub || l.subtitulo}</p>
  </div>
  <div class="pc-escena">
    ${hero}
    <div class="pc-sello-wrap">${selloColeccion(l.vol || '01')}</div>
    <div class="pc-sticker"><small>${pc.sticker[0]}</small><b>${pc.sticker[1]}</b><span>${pc.sticker[2]}</span></div>
  </div>
  <ul class="pc-badges">${pc.badges.map((b) => `<li>${ICO_CHECK}${b}</li>`).join('')}</ul>
  <ul class="pc-datos">${l.datosPortada.map((d) => `<li><strong>${d[0]}</strong><span>${d[1]}</span></li>`).join('')}</ul>
  <footer class="pc-pie">Manual práctico para producir y vender desde casa · Colombia</footer>
</section>`;
}

function renderLibro(libro) {
  const recetas = libro.secciones.filter((s) => s.tipo === 'receta');
  const porId = Object.fromEntries(recetas.map((r) => [r.id, r]));
  let n = 0;
  const cuerpo = libro.secciones
    .map((s) => {
      switch (s.tipo) {
        case 'capitulo':
          return `<header class="capitulo" id="cap-${s.num}"><div class="cap-num">${s.num}</div><div><div class="kicker">Capítulo ${s.num}</div><h1>${s.titulo}</h1>${s.bajada ? `<p class="bajada">${s.bajada}</p>` : ''}</div></header>`;
        case 'texto':
          return `<section class="texto${s.nuevaPagina ? ' np' : ''}">${s.titulo ? `<h2>${s.titulo}</h2>` : ''}${s.html}</section>`;
        case 'receta':
          n++;
          return receta(s, n, porId, libro);
        case 'caja':
          return caja(s, porId);
        case 'resumen':
          return `<section class="texto">${s.titulo ? `<h2>${s.titulo}</h2>` : ''}${s.intro || ''}${resumen(libro, porId)}</section>`;
        case 'indice':
          return indice(libro);
        default:
          throw new Error('Tipo de sección desconocido: ' + s.tipo);
      }
    })
    .join('\n');

  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>${libro.titulo} · Emprende Dulce</title>
<style>${CSS}
@page { @bottom-left { content: "Emprende Dulce · ${libro.tituloCorto}"; } }
:root { --acento: ${libro.color || '#7a1631'}; --rosa: color-mix(in srgb, ${libro.color || '#7a1631'} 9%, #fff); }
</style></head><body class="${libro.id}">${portada(libro)}${cuerpo}</body></html>`;
}

module.exports = { renderLibro, costear, costearCaja };
