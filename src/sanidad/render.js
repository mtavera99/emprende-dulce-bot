// Escribe los documentos de sanidad en PDF: documentos de texto (bloques), planillas (hojas) y carteles.
const { PDF, Lienzo, lineas, ancho } = require('./pdf');
const F = require('./fechas');

const AZUL = '#0b3b5b', VERDE = '#0f766e', GRIS = '#475569';

// Números de página y pie en todas las páginas (cuando ya se sabe el total)
function piePaginas(pdf, izquierda) {
  const n = pdf.paginas.length;
  pdf.paginas.forEach((p, i) => {
    p.linea(36, p.h - 30, p.w - 36, p.h - 30, { color: '#cbd5e1', grosor: 0.4 });
    p.texto(36, p.h - 25, izquierda, { size: 6.8, color: GRIS });
    p.texto(p.w - 36, p.h - 25, `Página ${i + 1} de ${n}`, { size: 6.8, color: GRIS, align: 'right' });
  });
}

// ---------------------------------------------------------------------------- documentos de texto
function documentoPDF(doc) {
  const pdf = new PDF({ titulo: doc.titulo, autor: doc.negocio });
  const lz = new Lienzo(pdf, { margen: { t: 62, b: 50, l: 54, r: 54 } });
  let enPortada = false;
  lz.encabezado = (l) => {
    if (enPortada) return;
    l.pag.texto(l.m.l, 30, doc.encabezadoIzq, { size: 7.2, bold: true, color: AZUL });
    l.pag.texto(l.pag.w - l.m.r, 30, doc.encabezadoDer, { size: 7.2, color: GRIS, align: 'right' });
    l.pag.linea(l.m.l, 42, l.pag.w - l.m.r, 42, { color: VERDE, grosor: 0.8 });
  };
  for (const b of doc.bloques) {
    switch (b.t) {
      case 'portada': {
        enPortada = true;
        lz.nueva();
        enPortada = false;
        const p = lz.pag;
        p.rect(0, 0, p.w, 190, { relleno: AZUL });
        p.rect(0, 190, p.w, 5, { relleno: '#14b8a6' });
        p.texto(p.w / 2, 58, b.kicker, { size: 9, bold: true, color: '#99f6e4', align: 'center' });
        let y = 82;
        for (const l of lineas(b.titulo, 24, true, p.w - 120)) { p.texto(p.w / 2, y, l, { size: 24, bold: true, color: '#ffffff', align: 'center' }); y += 29; }
        lz.y = 215;
        if (b.subtitulo) lz.parrafo(b.subtitulo, { size: 10.5, align: 'center', color: GRIS, despues: 14 });
        if (b.campos) lz.tabla([{ ancho: 0.38 }, { ancho: 0.62 }], b.campos.map(([k, v]) => [{ texto: k, bold: true, relleno: '#f1f5f9' }, v]), { size: 8.8, pad: 4, despues: 14 });
        if (b.pie) lz.nota(b.pie, { size: 8.2, relleno: '#f0fdfa', borde: '#14b8a6' });
        break;
      }
      case 'h1':
        if (b.salto) lz.nueva(); else lz.asegurar(60);
        lz.y += 2;
        lz.parrafo(b.texto, { size: 14, bold: true, color: AZUL, despues: 2 });
        lz.pag.linea(lz.m.l, lz.y + 1, lz.m.l + 60, lz.y + 1, { color: '#14b8a6', grosor: 1.6 });
        lz.y += 10;
        break;
      case 'h2': lz.asegurar(46); lz.y += 4; lz.parrafo(b.texto, { size: 10.8, bold: true, color: VERDE, despues: 3 }); break;
      case 'h3': lz.asegurar(36); lz.parrafo(b.texto, { size: 9.8, bold: true, despues: 2 }); break;
      case 'p': lz.parrafo(b.texto, { size: 9.4, bold: b.bold }); break;
      case 'ul':
        for (const it of b.items) {
          const numerado = /^\d+\.\s/.test(it);
          lz.asegurar(13);
          if (!numerado) lz.pag.texto(lz.m.l + 4, lz.y, '•', { size: 9.4, color: VERDE, bold: true });
          lz.parrafo(it, { size: 9.4, sangria: numerado ? 4 : 14, despues: 2.5 });
        }
        lz.y += 4;
        break;
      case 'tabla': lz.tabla(b.cols, b.filas, { size: b.size || 8.2, cebra: true }); break;
      case 'nota': lz.nota(b.texto, { size: 8.6 }); break;
      case 'salto': lz.nueva(); break;
      case 'firmas': {
        lz.asegurar(80);
        lz.y += 36;
        const w = (lz.ancho - 30 * (b.items.length - 1)) / b.items.length;
        b.items.forEach((t, i) => {
          const x = lz.m.l + i * (w + 30);
          lz.pag.linea(x, lz.y, x + w, lz.y, { grosor: 0.7 });
          t.split('\n').forEach((l, k) => lz.pag.texto(x + w / 2, lz.y + 5 + k * 11, l, { size: 8.4, bold: k === 0, align: 'center', color: k ? GRIS : '#000000' }));
        });
        lz.y += 34;
        break;
      }
      default: break;
    }
  }
  piePaginas(pdf, doc.pie);
  return pdf.buffer();
}

// ---------------------------------------------------------------------------- planillas
// d: datos del negocio · hojas: ver planillas.js · o.marca: texto extra en el pie (muestra gratis)
function planillasPDF(d, hojas, o = {}) {
  const pdf = new PDF({ titulo: o.titulo || 'Planillas', autor: d.nombre });
  for (const h of hojas) {
    const lz = new Lienzo(pdf, { horizontal: true, margen: { t: 24, b: 31, l: 28, r: 28 } });
    lz.encabezado = (l) => cabeceraPlanilla(l, d, h);
    lz.nueva();
    lz.tabla(h.cols, h.filas.length ? h.filas : [Array(h.cols.length).fill('')], { size: h.size || 7.4, sizeCab: 6.6, pad: 2.4, altoMin: h.altoFila || (h.filas.length > 24 ? 12 : 14), despues: 4 });
    for (const n of h.notas || []) lz.parrafo(n, { size: 6.9, color: GRIS, despues: 1.5 });
    lz.asegurar(12);
    lz.y += 3;
    const p = lz.pag;
    p.texto(lz.m.l, lz.y, `Revisó (responsable del plan): ${d.encargado}`, { size: 7.4, bold: true });
    p.texto(lz.m.l + 300, lz.y, 'Firma: _____________________________', { size: 7.4 });
    p.texto(lz.m.l + 500, lz.y, 'Fecha de revisión: _______________', { size: 7.4 });
  }
  piePaginas(pdf, o.marca || `${d.nombre} · NIT/C.C. ${d.nit} · Plan de Saneamiento Básico · Resolución 2674 de 2013`);
  return o.objeto ? pdf : pdf.buffer();
}

function cabeceraPlanilla(l, d, h) {
  const p = l.pag, x = l.m.l, w = l.ancho;
  const alto = 46;
  const w1 = w * 0.34, w3 = w * 0.2, w2 = w - w1 - w3;
  p.rect(x, l.y, w1, alto, { borde: '#334155', grosor: 0.7 });
  p.rect(x + w1, l.y, w2, alto, { relleno: AZUL, borde: '#334155', grosor: 0.7 });
  p.rect(x + w1 + w2, l.y, w3, alto, { borde: '#334155', grosor: 0.7 });
  const nom = lineas(d.nombre, 10, true, w1 - 10);
  p.texto(x + 5, l.y + 4, nom[0], { size: 10, bold: true, color: AZUL });
  p.texto(x + 5, l.y + 17, `NIT / C.C.: ${d.nit}`, { size: 7.2 });
  const dir = lineas(`${d.direccion} · ${d.ciudad}`, 7.2, false, w1 - 10)[0];
  p.texto(x + 5, l.y + 27, dir, { size: 7.2, color: GRIS });
  p.texto(x + 5, l.y + 36, `Tel.: ${d.telefono}`, { size: 7.2, color: GRIS });
  const tit = lineas(h.titulo.toUpperCase(), 10.5, true, w2 - 12);
  tit.slice(0, 2).forEach((t, i) => p.texto(x + w1 + w2 / 2, l.y + (tit.length > 1 ? 6 : 10) + i * 12, t, { size: 10.5, bold: true, color: '#ffffff', align: 'center' }));
  p.texto(x + w1 + w2 / 2, l.y + 32, lineas(h.periodo || '', 8, false, w2 - 12)[0] || '', { size: 8, color: '#99f6e4', align: 'center' });
  p.texto(x + w1 + w2 + 5, l.y + 5, `Código: ${h.codigo}`, { size: 7.4, bold: true });
  p.texto(x + w1 + w2 + 5, l.y + 16, 'Versión: 01', { size: 7.2 });
  p.texto(x + w1 + w2 + 5, l.y + 26, 'Plan de Saneamiento Básico', { size: 6.8, color: GRIS });
  p.texto(x + w1 + w2 + 5, l.y + 35, 'Res. 2674 de 2013', { size: 6.8, color: GRIS });
  l.y += alto + 4;
  if (h.campos && h.campos.length) {
    let cx = x;
    const sep = 14;
    for (const [k, v] of h.campos) {
      const t = `${k}: `;
      const wk = ancho(t, 7.4, true);
      const resto = x + w - cx - wk;
      const val = lineas(v, 7.4, false, Math.max(60, resto))[0] || '';
      if (cx > x && wk + ancho(val, 7.4) > x + w - cx) { cx = x; l.y += 11; }
      p.texto(cx, l.y, t, { size: 7.4, bold: true });
      p.texto(cx + wk, l.y, val, { size: 7.4 });
      cx += wk + ancho(val, 7.4) + sep;
    }
    l.y += 13;
  }
}

// ---------------------------------------------------------------------------- carteles
function cartelesPDF(d, carteles) {
  const pdf = new PDF({ titulo: 'Carteles', autor: d.nombre });
  for (const c of carteles) {
    const p = pdf.pagina('carta');
    p.rect(0, 0, p.w, 150, { relleno: c.color });
    let tam = 36;
    while (tam > 20 && lineas(c.titulo, tam, true, p.w - 80).length > 1) tam -= 2;
    p.texto(p.w / 2, 52, c.titulo, { size: tam, bold: true, color: '#ffffff', align: 'center' });
    let y;
    p.texto(p.w / 2, 124, c.sub, { size: 12, color: '#ffffff', align: 'center' });
    y = 190;
    if (c.lineas) {
      for (const t of c.lineas) {
        const ls = lineas(t, 19, true, p.w - 130);
        p.rect(50, y - 6, 12, 12 + (ls.length - 1) * 24, { relleno: c.color });
        ls.forEach((l, i) => p.texto(78, y - 4 + i * 24, l, { size: 19, bold: true, color: '#111827' }));
        y += ls.length * 24 + 22;
      }
    }
    if (c.residuos) {
      const filas = [['VERDE', '#16a34a', '#ffffff', 'ORGÁNICOS APROVECHABLES', 'Restos de comida, cáscaras, frutas y verduras, cunchos de café'],
        ['BLANCA', '#ffffff', '#111827', 'APROVECHABLES', 'Plástico, vidrio, latas, papel y cartón limpios y secos, cajas de leche'],
        ['NEGRA', '#111827', '#ffffff', 'NO APROVECHABLES', 'Servilletas y papel sucios, papel higiénico, empaques con grasa o comida']];
      for (const [col, fondo, tinta, tit, ej] of filas) {
        p.rect(50, y, p.w - 100, 132, { relleno: fondo, borde: '#111827', grosor: 1.5 });
        p.texto(p.w / 2, y + 16, `BOLSA ${col}`, { size: 26, bold: true, color: tinta, align: 'center' });
        p.texto(p.w / 2, y + 52, tit, { size: 15, bold: true, color: tinta, align: 'center' });
        lineas(ej, 13, false, p.w - 140).forEach((l, i) => p.texto(p.w / 2, y + 78 + i * 17, l, { size: 13, color: tinta, align: 'center' }));
        y += 150;
      }
      p.texto(p.w / 2, y + 4, 'ACEITE DE COCINA USADO: en recipiente cerrado, para el gestor autorizado. Nunca al desagüe.', { size: 11, bold: true, color: '#92400e', align: 'center' });
    }
    if (c.tabla) {
      for (const [uso, ppm, ml1, ml10] of c.tabla) {
        p.rect(50, y, p.w - 100, 96, { relleno: '#fff7ed', borde: c.color, grosor: 1.2 });
        lineas(uso, 14, true, p.w - 130).slice(0, 2).forEach((l, i) => p.texto(64, y + 10 + i * 17, l, { size: 14, bold: true, color: '#111827' }));
        p.texto(64, y + 52, ppm, { size: 22, bold: true, color: c.color });
        p.texto(p.w - 64, y + 48, ml1, { size: 18, bold: true, color: '#111827', align: 'right' });
        p.texto(p.w - 64, y + 72, ml10, { size: 12, color: GRIS, align: 'right' });
        y += 110;
      }
    }
    if (c.pie) lineas(c.pie, 12, false, p.w - 100).forEach((l, i) => p.texto(p.w / 2, p.h - 92 + i * 16, l, { size: 12, color: GRIS, align: 'center' }));
    p.texto(p.w / 2, p.h - 40, `${d.nombre} · Plan de Saneamiento Básico`, { size: 9, color: GRIS, align: 'center' });
  }
  return pdf.buffer();
}

module.exports = { documentoPDF, planillasPDF, cartelesPDF, piePaginas, F };
