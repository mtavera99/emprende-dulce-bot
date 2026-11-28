// ============================================================================
// PDF sin dependencias para los documentos de sanidad
// ----------------------------------------------------------------------------
// Usa las fuentes estándar Helvetica y Helvetica-Bold (todo lector de PDF las trae, no
// se incrustan) con codificación WinAnsi, que cubre el español (tildes, ñ, ¿, ¡, °).
// Las medidas de cada letra son las de la tabla AFM de Helvetica, para cortar las líneas
// sin que el texto se salga de su celda. El contenido de cada página va comprimido.
// Coordenadas de la API: en puntos (1/72 de pulgada), con el origen ARRIBA a la izquierda.
// ============================================================================
const zlib = require('zlib');

const TAM = { carta: [612, 792], a4: [595.28, 841.89] };

// Ancho de los caracteres 32 a 126 (milésimas del tamaño de letra)
const W_REG = [278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556,
  278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944,
  667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556,
  500, 722, 500, 500, 500, 334, 260, 334, 584];
const W_BOLD = [278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556,
  333, 333, 584, 584, 584, 611, 975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944,
  667, 667, 611, 333, 278, 333, 584, 556, 333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611, 611, 611, 389, 556, 333, 611,
  556, 778, 556, 556, 500, 389, 280, 389, 584];
// Signos fuera de ASCII: [ancho normal, ancho negrita, byte WinAnsi]
const EXTRA = {
  '¡': [333, 333, 0xa1], '¿': [611, 611, 0xbf], '°': [400, 400, 0xb0], '·': [278, 278, 0xb7], '«': [556, 556, 0xab], '»': [556, 556, 0xbb],
  '•': [350, 350, 0x95], '–': [556, 556, 0x96], '—': [1000, 1000, 0x97], '‘': [222, 278, 0x91], '’': [222, 278, 0x92], '“': [333, 500, 0x93],
  '”': [333, 500, 0x94], '…': [1000, 1000, 0x85], '€': [556, 556, 0x80], '×': [584, 584, 0xd7], '±': [584, 584, 0xb1], 'º': [365, 365, 0xba],
  'ª': [370, 370, 0xaa], '÷': [584, 584, 0xf7], '²': [333, 333, 0xb2], '³': [333, 333, 0xb3], '½': [834, 834, 0xbd], '§': [556, 556, 0xa7], '\u00a0': [278, 278, 0xa0],
};
// Letras con tilde: mismo ancho que la letra base; su byte WinAnsi es su código Latin-1
const LATIN1 = 'ÁÉÍÓÚáéíóúÑñÜüÀÈÌÒÙàèìòùÂÊÎÔÛâêîôûÄËÏÖäëïöÇçÃÕãõ';

// Texto que se puede escribir con Helvetica: las tildes y signos del español se conservan,
// los emojis y símbolos raros se quitan
function limpiar(s) {
  let out = '';
  for (const ch of String(s == null ? '' : s).replace(/[\r\t]/g, ' ')) {
    const c = ch.codePointAt(0);
    if (c === 10) { out += '\n'; continue; }
    if ((c >= 32 && c <= 126) || EXTRA[ch] || LATIN1.includes(ch)) { out += ch; continue; }
    if (ch === '✓' || ch === '✔') { out += 'X'; continue; }
    if (ch === '≤') { out += '<='; continue; }
    if (ch === '≥') { out += '>='; continue; }
    const base = ch.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (base && base !== ch && [...base].every((b) => b.codePointAt(0) >= 32 && b.codePointAt(0) <= 126)) out += base;
  }
  return out.replace(/ {2,}/g, ' ');
}

function anchoChar(ch, bold) {
  const c = ch.codePointAt(0);
  if (c >= 32 && c <= 126) return (bold ? W_BOLD : W_REG)[c - 32];
  if (EXTRA[ch]) return EXTRA[ch][bold ? 1 : 0];
  const base = ch.normalize('NFD')[0];
  const b = base.codePointAt(0);
  return b >= 32 && b <= 126 ? (bold ? W_BOLD : W_REG)[b - 32] : 556;
}

function ancho(texto, size, bold = false) {
  let w = 0;
  for (const ch of String(texto)) w += anchoChar(ch, bold);
  return (w * size) / 1000;
}

function byteDe(ch) {
  const c = ch.codePointAt(0);
  if (c >= 32 && c <= 126) return c;
  if (EXTRA[ch]) return EXTRA[ch][2];
  if (c >= 0xa0 && c <= 0xff) return c;
  return 0x3f;
}
function hex(texto) {
  let h = '';
  for (const ch of String(texto)) h += byteDe(ch).toString(16).padStart(2, '0');
  return `<${h}>`;
}

// Corta un texto en líneas que caben en "max" puntos (respeta los saltos de línea)
function lineas(texto, size, bold, max) {
  const out = [];
  for (const parrafo of limpiar(texto).split('\n')) {
    const palabras = parrafo.split(' ');
    let linea = '';
    for (let p of palabras) {
      const prueba = linea ? `${linea} ${p}` : p;
      if (ancho(prueba, size, bold) <= max) { linea = prueba; continue; }
      if (linea) out.push(linea);
      // Palabra más larga que la línea (un correo, un NIT largo): se parte
      while (ancho(p, size, bold) > max && p.length > 1) {
        let i = p.length - 1;
        while (i > 1 && ancho(p.slice(0, i), size, bold) > max) i--;
        out.push(p.slice(0, i));
        p = p.slice(i);
      }
      linea = p;
    }
    out.push(linea);
  }
  return out;
}

const num = (n) => (Math.round(n * 100) / 100).toString();
function color(c) {
  const h = String(c || '#000000').replace('#', '');
  const v = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  return v.map(num).join(' ');
}

// Cada página guarda sus trazos como objetos: se escriben en PDF y, para revisar el diseño, también en SVG
class Pagina {
  constructor(w, h) { this.w = w; this.h = h; this.ops = []; }

  texto(x, y, t, o = {}) {
    const size = o.size || 10, bold = !!o.bold;
    const s = limpiar(t).replace(/\n/g, ' ');
    if (!s) return;
    let xx = x;
    if (o.align === 'center') xx = x - ancho(s, size, bold) / 2;
    if (o.align === 'right') xx = x - ancho(s, size, bold);
    this.ops.push({ k: 't', x: xx, y, s, size, bold, color: o.color || '#000000' });
  }

  linea(x1, y1, x2, y2, o = {}) {
    this.ops.push({ k: 'l', x1, y1, x2, y2, grosor: o.grosor || 0.6, color: o.color || '#000000', punteada: !!o.punteada });
  }

  rect(x, y, w, h, o = {}) {
    this.ops.push({ k: 'r', x, y, w, h, relleno: o.relleno || null, borde: o.borde || (o.relleno ? null : '#000000'), grosor: o.grosor || 0.6 });
  }

  // Operadores PDF (origen abajo a la izquierda); y del texto = parte de arriba, línea base 0,78 del tamaño más abajo
  pdfOps() {
    const H = this.h;
    return this.ops.map((o) => {
      if (o.k === 't') return `BT /${o.bold ? 'F2' : 'F1'} ${num(o.size)} Tf ${color(o.color)} rg 1 0 0 1 ${num(o.x)} ${num(H - o.y - o.size * 0.78)} Tm ${hex(o.s)} Tj ET`;
      if (o.k === 'l') return `${num(o.grosor)} w ${color(o.color)} RG ${o.punteada ? '[2 2] 0 d ' : ''}${num(o.x1)} ${num(H - o.y1)} m ${num(o.x2)} ${num(H - o.y2)} l S${o.punteada ? ' [] 0 d' : ''}`;
      const op = o.relleno && o.borde ? 'B' : o.relleno ? 'f' : 'S';
      return `${o.relleno ? color(o.relleno) + ' rg ' : ''}${o.borde ? `${num(o.grosor)} w ${color(o.borde)} RG ` : ''}${num(o.x)} ${num(H - o.y - o.h)} ${num(o.w)} ${num(o.h)} re ${op}`;
    }).join('\n');
  }

  svg() {
    const e = (t) => String(t).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    const cuerpo = this.ops.map((o) => {
      if (o.k === 't') return `<text x="${num(o.x)}" y="${num(o.y + o.size * 0.78)}" font-size="${o.size}" font-weight="${o.bold ? 700 : 400}" fill="${o.color}">${e(o.s)}</text>`;
      if (o.k === 'l') return `<line x1="${num(o.x1)}" y1="${num(o.y1)}" x2="${num(o.x2)}" y2="${num(o.y2)}" stroke="${o.color}" stroke-width="${o.grosor}"${o.punteada ? ' stroke-dasharray="2 2"' : ''}/>`;
      return `<rect x="${num(o.x)}" y="${num(o.y)}" width="${num(o.w)}" height="${num(o.h)}" fill="${o.relleno || 'none'}" stroke="${o.borde || 'none'}" stroke-width="${o.grosor}"/>`;
    }).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${num(this.w)}" height="${num(this.h)}" viewBox="0 0 ${num(this.w)} ${num(this.h)}" font-family="Helvetica, Arial, sans-serif" style="background:#fff">${cuerpo}</svg>`;
  }
}

class PDF {
  constructor(meta = {}) { this.paginas = []; this.meta = meta; }

  pagina(tam = 'carta', horizontal = false) {
    const [w, h] = TAM[tam] || TAM.carta;
    const p = horizontal ? new Pagina(h, w) : new Pagina(w, h);
    this.paginas.push(p);
    return p;
  }

  buffer() {
    const objs = [];                       // contenido de cada objeto (índice = número - 1)
    const add = (s) => { objs.push(s); return objs.length; };
    const catalogo = add(null), paginas = add(null);
    const f1 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    const f2 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
    const texto = (s) => `(${limpiar(s).replace(/[\\()]/g, (c) => '\\' + c)})`;
    const info = add(`<< /Title ${texto(this.meta.titulo || 'Documento')} /Author ${texto(this.meta.autor || '')} /Producer (Emprende Dulce) /CreationDate (D:${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)}) >>`);
    const kids = [];
    for (const p of this.paginas) {
      const datos = zlib.deflateSync(Buffer.from(p.pdfOps(), 'latin1'));
      const cont = add({ stream: datos });
      kids.push(add(`<< /Type /Page /Parent ${paginas} 0 R /MediaBox [0 0 ${num(p.w)} ${num(p.h)}] /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> >> /Contents ${cont} 0 R >>`));
    }
    objs[catalogo - 1] = `<< /Type /Catalog /Pages ${paginas} 0 R >>`;
    objs[paginas - 1] = `<< /Type /Pages /Kids [${kids.map((k) => `${k} 0 R`).join(' ')}] /Count ${kids.length} >>`;

    const partes = [Buffer.from('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n', 'latin1')];
    let largo = partes[0].length;
    const offsets = [];
    objs.forEach((o, i) => {
      offsets.push(largo);
      let b;
      if (o && o.stream) {
        b = Buffer.concat([Buffer.from(`${i + 1} 0 obj\n<< /Length ${o.stream.length} /Filter /FlateDecode >>\nstream\n`, 'latin1'), o.stream, Buffer.from('\nendstream\nendobj\n', 'latin1')]);
      } else {
        b = Buffer.from(`${i + 1} 0 obj\n${o}\nendobj\n`, 'latin1');
      }
      partes.push(b);
      largo += b.length;
    });
    const xref = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}` +
      `trailer\n<< /Size ${objs.length + 1} /Root ${catalogo} 0 R /Info ${info} 0 R >>\nstartxref\n${largo}\n%%EOF\n`;
    partes.push(Buffer.from(xref, 'latin1'));
    return Buffer.concat(partes);
  }
}

// ----------------------------------------------------------------------------
// Lienzo: escribe de arriba hacia abajo y abre páginas nuevas cuando no cabe
// ----------------------------------------------------------------------------
class Lienzo {
  constructor(pdf, o = {}) {
    this.pdf = pdf;
    this.tam = o.tam || 'carta';
    this.horizontal = !!o.horizontal;
    this.m = { t: 54, r: 50, b: 54, l: 50, ...(o.margen || {}) };
    this.encabezado = o.encabezado || null;      // (lienzo) → dibuja y deja this.y debajo
    this.alNuevaPagina = null;                   // por ejemplo, repetir la cabecera de una tabla
    this.pag = null;
    this.y = 0;
  }

  get ancho() { return this.pag.w - this.m.l - this.m.r; }
  get limite() { return this.pag.h - this.m.b; }

  nueva(o = {}) {
    if (o.horizontal !== undefined) this.horizontal = o.horizontal;
    this.pag = this.pdf.pagina(this.tam, this.horizontal);
    this.y = this.m.t;
    if (this.encabezado) this.encabezado(this);
    if (this.alNuevaPagina) this.alNuevaPagina(this);
    return this.pag;
  }

  asegurar(h) {
    if (!this.pag || this.y + h > this.limite) this.nueva();
  }

  // Párrafo con corte de línea; devuelve el alto usado
  parrafo(t, o = {}) {
    const size = o.size || 9.5, bold = !!o.bold, lh = size * (o.interlinea || 1.32);
    const x = this.m.l + (o.sangria || 0);
    const w = (o.ancho || this.ancho) - (o.sangria || 0);
    const ls = lineas(t, size, bold, w);
    for (const l of ls) {
      this.asegurar(lh);
      const ax = o.align === 'center' ? this.m.l + this.ancho / 2 : o.align === 'right' ? this.m.l + this.ancho : x;
      this.pag.texto(ax, this.y, l, { size, bold, color: o.color, align: o.align });
      this.y += lh;
    }
    this.y += o.despues == null ? size * 0.5 : o.despues;
    return ls.length * lh;
  }

  // Tabla con cabecera repetida en cada página. cols: [{titulo, ancho (fracción o puntos), align}]
  // filas: celdas texto o {texto, bold, relleno, align, color}
  tabla(cols, filas, o = {}) {
    const size = o.size || 8, pad = o.pad == null ? 3 : o.pad, lh = size * 1.25;
    const total = o.ancho || this.ancho;
    const sumaFr = cols.reduce((n, c) => n + (c.ancho <= 1 ? c.ancho : 0), 0);
    const fijos = cols.reduce((n, c) => n + (c.ancho > 1 ? c.ancho : 0), 0);
    const ws = cols.map((c) => (c.ancho > 1 ? c.ancho : ((total - fijos) * (c.ancho || 1 / cols.length)) / (sumaFr || 1)));
    const x0 = this.m.l;
    const celda = (c) => (c && typeof c === 'object' ? c : { texto: c == null ? '' : String(c) });

    const alto = (fila, sz, bold) => Math.max(o.altoMin || 0, ...fila.map((c, i) => {
      const cc = celda(c);
      return lineas(cc.texto, sz, bold || cc.bold, ws[i] - pad * 2).length * sz * 1.25 + pad * 2;
    }));
    const dibujar = (fila, sz, opciones = {}) => {
      const h = opciones.h || alto(fila, sz, opciones.bold);
      let x = x0;
      fila.forEach((c, i) => {
        const cc = celda(c);
        const relleno = cc.relleno || opciones.relleno;
        this.pag.rect(x, this.y, ws[i], h, { borde: o.borde || '#475569', grosor: 0.5, ...(relleno ? { relleno } : {}) });
        const ls = lineas(cc.texto, sz, opciones.bold || cc.bold, ws[i] - pad * 2);
        const align = cc.align || (cols[i] && cols[i].align) || 'left';
        const vy = opciones.centrarV ? this.y + (h - ls.length * sz * 1.25) / 2 : this.y + pad;
        ls.forEach((l, k) => {
          const ax = align === 'center' ? x + ws[i] / 2 : align === 'right' ? x + ws[i] - pad : x + pad;
          this.pag.texto(ax, vy + k * sz * 1.25, l, { size: sz, bold: opciones.bold || cc.bold, color: cc.color || opciones.color, align });
        });
        x += ws[i];
      });
      this.y += h;
    };
    const cab = cols.some((c) => c.titulo) && o.cabecera !== false ? cols.map((c) => c.titulo || '') : null;
    const dibujarCab = () => { if (cab) dibujar(cab, o.sizeCab || size, { bold: true, relleno: o.rellenoCab || '#dbe4ee', centrarV: true }); };
    const previo = this.alNuevaPagina;
    this.alNuevaPagina = (lz) => { if (previo) previo(lz); dibujarCab(); };
    this.asegurar((cab ? alto(cab, o.sizeCab || size, true) : 0) + alto(filas[0] || [''], size));
    dibujarCab();
    filas.forEach((f, i) => {
      const h = alto(f, size);
      if (this.y + h > this.limite) this.nueva();
      dibujar(f, size, { h, relleno: o.cebra && i % 2 ? '#f1f5f9' : null });
    });
    this.alNuevaPagina = previo;
    this.y += o.despues == null ? 8 : o.despues;
    return ws;
  }

  // Caja con fondo y texto (avisos)
  nota(t, o = {}) {
    const size = o.size || 9, pad = 8, lh = size * 1.32;
    const ls = lineas(t, size, !!o.bold, this.ancho - pad * 2 - 4);
    const h = ls.length * lh + pad * 2;
    if (h < this.limite - this.m.t) this.asegurar(h);
    this.pag.rect(this.m.l, this.y, this.ancho, h, { relleno: o.relleno || '#fff7e6', borde: o.borde || '#f0b429', grosor: 0.6 });
    this.pag.rect(this.m.l, this.y, 3, h, { relleno: o.borde || '#f0b429' });
    ls.forEach((l, i) => this.pag.texto(this.m.l + pad + 4, this.y + pad + i * lh, l, { size, bold: !!o.bold, color: o.color || '#1f2937' }));
    this.y += h + (o.despues == null ? 10 : o.despues);
  }
}

module.exports = { PDF, Lienzo, ancho, lineas, limpiar, TAM };
