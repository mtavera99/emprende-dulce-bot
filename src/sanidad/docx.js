// Word (.docx) sin dependencias: convierte los mismos bloques del documento en WordprocessingML.
// Así el cliente puede abrir el Plan de Saneamiento en Word o Google Docs y ajustarlo a su negocio.
const { crearZip } = require('./zip');

const x = (s) => String(s == null ? '' : s).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
  .replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function run(texto, o = {}) {
  const props = `${o.bold ? '<w:b/>' : ''}${o.size ? `<w:sz w:val="${Math.round(o.size * 2)}"/>` : ''}${o.color ? `<w:color w:val="${o.color.replace('#', '')}"/>` : ''}`;
  return String(texto).split('\n').map((t, i) => `${i ? '<w:r><w:br/></w:r>' : ''}<w:r>${props ? `<w:rPr>${props}</w:rPr>` : ''}<w:t xml:space="preserve">${x(t)}</w:t></w:r>`).join('');
}
function parrafo(texto, o = {}) {
  const pPr = `${o.estilo ? `<w:pStyle w:val="${o.estilo}"/>` : ''}${o.sangria ? `<w:ind w:left="${o.sangria}" w:hanging="240"/>` : ''}${o.align ? `<w:jc w:val="${o.align}"/>` : ''}${o.salto ? '<w:pageBreakBefore/>' : ''}${o.despues != null ? `<w:spacing w:after="${o.despues}"/>` : ''}`;
  return `<w:p>${pPr ? `<w:pPr>${pPr}</w:pPr>` : ''}${run(texto, o)}</w:p>`;
}

function tabla(cols, filas, o = {}) {
  const total = 9600; // ancho útil en veintavos de punto (carta con márgenes de 2 cm aprox.)
  const suma = cols.reduce((n, c) => n + (c.ancho || 1), 0);
  const ws = cols.map((c) => Math.round(((c.ancho || 1) / suma) * total));
  const borde = (l) => `<w:${l} w:val="single" w:sz="4" w:space="0" w:color="64748B"/>`;
  const celda = (c, i, cab) => {
    const cc = c && typeof c === 'object' ? c : { texto: c == null ? '' : String(c) };
    const relleno = cab ? 'DBE4EE' : cc.relleno ? cc.relleno.replace('#', '') : null;
    return `<w:tc><w:tcPr><w:tcW w:w="${ws[i]}" w:type="dxa"/>${relleno ? `<w:shd w:val="clear" w:color="auto" w:fill="${relleno}"/>` : ''}</w:tcPr>` +
      `<w:p><w:pPr><w:spacing w:after="0"/></w:pPr>${run(cc.texto, { bold: cab || cc.bold, size: o.size || 9 })}</w:p></w:tc>`;
  };
  const cab = cols.some((c) => c.titulo) ? `<w:tr><w:trPr><w:tblHeader/></w:trPr>${cols.map((c, i) => celda(c.titulo || '', i, true)).join('')}</w:tr>` : '';
  return `<w:tbl><w:tblPr><w:tblW w:w="${total}" w:type="dxa"/><w:tblBorders>${['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map(borde).join('')}</w:tblBorders>` +
    `<w:tblCellMar><w:left w:w="70" w:type="dxa"/><w:right w:w="70" w:type="dxa"/></w:tblCellMar></w:tblPr>` +
    `<w:tblGrid>${ws.map((w) => `<w:gridCol w:w="${w}"/>`).join('')}</w:tblGrid>${cab}${filas.map((f) => `<w:tr>${f.map((c, i) => celda(c, i, false)).join('')}</w:tr>`).join('')}</w:tbl>` +
    parrafo('', { despues: 120 });
}

function bloques(bs) {
  return bs.map((b) => {
    switch (b.t) {
      case 'portada':
        return parrafo(b.kicker || '', { color: '#0F766E', bold: true, size: 11, align: 'center' }) +
          parrafo(b.titulo, { estilo: 'Title', align: 'center' }) + parrafo(b.subtitulo || '', { align: 'center', size: 12 }) +
          tabla([{ ancho: 1 }, { ancho: 2 }], (b.campos || []).map(([k, v]) => [{ texto: k, bold: true }, v])) +
          (b.pie ? parrafo(b.pie, { size: 9, color: '#475569' }) : '');
      case 'h1': return parrafo(b.texto, { estilo: 'Heading1', salto: !!b.salto });
      case 'h2': return parrafo(b.texto, { estilo: 'Heading2' });
      case 'h3': return parrafo(b.texto, { estilo: 'Heading3' });
      case 'p': return parrafo(b.texto, { bold: b.bold });
      case 'ul': return b.items.map((i) => parrafo(`•  ${i}`, { sangria: 360, despues: 60 })).join('');
      case 'tabla': return tabla(b.cols, b.filas, b);
      case 'nota': return tabla([{ ancho: 1 }], [[{ texto: b.texto, relleno: '#FFF7E6' }]]);
      case 'salto': return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
      case 'firmas': return tabla(b.items.map(() => ({ ancho: 1 })), [b.items.map((i) => `\n\n\n______________________________\n${i}`)]);
      default: return '';
    }
  }).join('');
}

const ESTILOS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/><w:sz w:val="20"/><w:lang w:val="es-CO"/></w:rPr></w:rPrDefault>
<w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="264" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>
<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="600" w:after="200"/></w:pPr><w:rPr><w:b/><w:color w:val="0B3B5B"/><w:sz w:val="48"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="360" w:after="160"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:color w:val="0B3B5B"/><w:sz w:val="30"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="240" w:after="100"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:color w:val="0F766E"/><w:sz w:val="24"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="160" w:after="80"/><w:outlineLvl w:val="2"/></w:pPr><w:rPr><w:b/><w:sz w:val="21"/></w:rPr></w:style>
</w:styles>`;

// doc: { titulo, encabezado, bloques }
function crearDocx(doc) {
  const NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
  const cuerpo = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ${NS}><w:body>${bloques(doc.bloques)}` +
    `<w:sectPr><w:headerReference w:type="default" r:id="rIdH"/><w:footerReference w:type="default" r:id="rIdF"/>` +
    `<w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1300" w:right="1150" w:bottom="1200" w:left="1150" w:header="560" w:footer="560" w:gutter="0"/></w:sectPr></w:body></w:document>`;
  const header = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:hdr ${NS}>${parrafo(doc.encabezado || doc.titulo, { size: 8, color: '#475569' })}</w:hdr>`;
  const footer = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr ${NS}><w:p><w:pPr><w:jc w:val="right"/></w:pPr>${run('Página ', { size: 8 })}` +
    `<w:r><w:rPr><w:sz w:val="16"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:rPr><w:sz w:val="16"/></w:rPr><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r><w:rPr><w:sz w:val="16"/></w:rPr><w:fldChar w:fldCharType="end"/></w:r></w:p></w:ftr>`;
  return crearZip([
    { nombre: '[Content_Types].xml', datos: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
      `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>` +
      `<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>` +
      `<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>` +
      `<Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>` +
      `<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>` +
      `<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>` },
    { nombre: '_rels/.rels', datos: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
      `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>` +
      `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>` },
    { nombre: 'docProps/core.xml', datos: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>${x(doc.titulo)}</dc:title><dc:language>es-CO</dc:language></cp:coreProperties>` },
    { nombre: 'word/_rels/document.xml.rels', datos: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
      `<Relationship Id="rIdS" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
      `<Relationship Id="rIdH" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>` +
      `<Relationship Id="rIdF" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/></Relationships>` },
    { nombre: 'word/document.xml', datos: cuerpo },
    { nombre: 'word/styles.xml', datos: ESTILOS },
    { nombre: 'word/header1.xml', datos: header },
    { nombre: 'word/footer1.xml', datos: footer },
  ]);
}

module.exports = { crearDocx };
