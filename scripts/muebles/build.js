// Genera el Mega Pack de Carpintería y Muebles en Melamina 2026 en public/descargas/muebles/:
//   - 5 PDF de planos por categoría (vista frontal acotada, despiece, herrajes, láminas, cortes y armado)
//   - 4 guías prácticas y la guía para cobrar trabajos (PDF)
//   - calculadora de costos, láminas y cotización (HTML, también se regala en /regalo/calculadora?p=muebles)
//   - manifest.json (lo leen el bot y el portal), muestra gratis, imágenes para WhatsApp y portada del portal
//   - ZIP con todo
// Uso: CHROME_PATH=/ruta/a/chrome node scripts/muebles/build.js
// Los planos se calculan con src/muebles/motor.js: el mismo motor que usa el portal del comprador.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const M = require('../../src/muebles/motor');
const D = require('../../src/muebles/dibujo');

const RAIZ = path.join(__dirname, '../..');
const OUT = path.join(RAIZ, 'public/descargas/muebles');
const MUESTRAS = path.join(RAIZ, 'public/descargas/muestras');
const TMP = path.join(RAIZ, '.build_muebles');
const CHROME = process.env.CHROME_PATH || 'chromium';
for (const d of [OUT, path.join(OUT, 'Planos'), path.join(OUT, 'Guias'), path.join(OUT, 'Bonos'), path.join(MUESTRAS, 'img'), TMP]) fs.mkdirSync(d, { recursive: true });

const CSS = fs.readFileSync(path.join(__dirname, 'estilo.css'), 'utf8');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const mm = (v) => String(Math.round(v * 10) / 10).replace('.', ',');
const FAM = M.catalogo();
const TOTAL = M.contar();
const DISENOS = M.disenos();
const MUESTRA_COD = 'DOR-MN1-450';

function doc(titulo, cuerpo) {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>${esc(titulo)}</title><style>${CSS}</style></head><body>${cuerpo}</body></html>`;
}

function portada(titulo, kick, sub, kpis, arte) {
  return `<section class="portada"><div class="p-top"><span>MEGA PACK CARPINTERÍA Y MUEBLES EN MELAMINA 2026</span><span>MEDIDAS EN MM</span></div>
  <div class="p-kick">${esc(kick)}</div><h1>${titulo}</h1><p class="p-sub">${esc(sub)}</p>
  <div class="p-arte">${arte}</div>
  <ul class="kpis">${kpis.map(([a, b]) => `<li><b>${a}</b><span>${esc(b)}</span></li>`).join('')}</ul>
  <div class="p-pie">Despiece pieza por pieza · Listo para llevar al servicio de corte</div></section>`;
}

function materialDe(p, r) { return p.material === 'melamina' ? `Melamina ${r.e} mm` : 'HDF 3 mm'; }

function paginaPlano(item, fam) {
  const r = M.construir(item);
  const md = r.medidas;
  const mel = r.piezas.filter((p) => p.material === 'melamina');
  const filaDe = (k) => r.piezas.indexOf(mel[k]) + 1;
  const filas = r.piezas.map((p, i) => `<tr><td class="n">${i + 1}</td><td>${esc(p.nombre)}${p.nota ? `<div class="nota">${esc(p.nota)}</div>` : ''}</td><td class="r">${p.cant}</td><td class="r"><b>${mm(p.largo)}</b></td><td class="r"><b>${mm(p.ancho)}</b></td><td>${materialDe(p, r)}</td><td>${M.notacion(p)}</td></tr>`).join('');
  const herr = M.herrajesLista(r.herr).map(([n, c]) => `<tr><td>${esc(n)}</td><td class="r"><b>${c}</b></td></tr>`).join('');
  const cortes = r.optimizacion.tableros.map((_, i) => `<div class="tab"><div class="tab-t">Tablero ${i + 1} de ${r.tableros}</div>${D.tablero(r.optimizacion, i, (k) => filaDe(k))}</div>`).join('');
  const pasos = M.pasos(item, r).map((x) => `<li>${esc(x)}</li>`).join('');
  return `<section class="plano">
  <header class="pl-cab"><div><small>${esc(fam.id)} · ${esc(fam.corto)} · Código ${esc(item.cod)}</small><h2>${esc(item.nombre)}</h2></div>
  <div class="pl-med"><b>${mm(md.A)} × ${mm(md.H)} × ${mm(md.P)} mm</b><span>ancho × alto × ${esc(md.etiquetaP || 'fondo')} · melamina ${r.e} mm</span></div></header>
  <div class="pl-g">
    <div class="pl-dib">${D.frente(r, item.spec)}</div>
    <div>
      <div class="mat">
        <div><b>${r.tableros}</b><span>tablero${r.tableros > 1 ? 's' : ''} de 2,15 × 2,44 m</span></div>
        <div><b>${r.fondos}</b><span>lámina${r.fondos === 1 ? '' : 's'} HDF 3 mm (1,22 × 2,44)</span></div>
        <div><b>${mm(r.cantoFino)} m</b><span>tapacanto 0,45 mm</span></div>
        <div><b>${mm(r.cantoGrueso)} m</b><span>tapacanto 2 mm</span></div>
        <div><b>${r.cortes}</b><span>piezas a cortar</span></div>
        <div><b>${String(r.aprovechamiento).replace('.', ',')} %</b><span>aprovechamiento</span></div>
      </div>
      <table class="t herr"><thead><tr><th>Herrajes y tornillería</th><th class="r">Cant.</th></tr></thead><tbody>${herr}</tbody></table>
    </div>
  </div>
  <table class="t desp"><thead><tr><th>#</th><th>Pieza</th><th class="r">Cant.</th><th class="r">Largo (veta)</th><th class="r">Ancho</th><th>Material</th><th>Tapacanto</th></tr></thead><tbody>${filas}</tbody></table>
  ${item.nota ? `<div class="caja"><b>Importante:</b> ${esc(item.nota)}</div>` : ''}
  <div class="arm"><h4>Paso a paso de armado</h4><ol>${pasos}</ol></div>
  <div class="cortes-t">Plano de cortes sugerido (medidas en mm; el número es la fila del despiece). Corte de sierra de 4 mm y refile de 10 mm por borde.</div>
  <div class="cortes">${cortes}</div>
</section>`;
}

const trabajos = [];
const manifest = { producto: 'muebles', generado: new Date().toISOString().slice(0, 10), categorias: [], guias: [], bonos: [], muestra: null, totales: {} };
let piezasTotal = 0;

// ------------------------------------------------------------------ planos por categoría
for (const fam of FAM) {
  const ejemplo = fam.items[Math.min(fam.items.length - 1, Math.floor(fam.items.length / 2))];
  const filas = fam.items.map((it) => {
    const r = M.construir(it);
    piezasTotal += r.cortes;
    return { cod: it.cod, nombre: it.nombre, diseno: M.diseno(it), A: r.medidas.A, H: r.medidas.H, P: r.medidas.P, e: r.e, tableros: r.tableros, fondos: r.fondos, piezas: r.cortes };
  });
  const indice = `<section class="cap"><header class="cap-cab"><span class="n">${fam.id}</span><div><small>Índice de la categoría</small><h2>${esc(fam.nombre)}: ${fam.items.length} planos</h2></div></header>
    <table class="t"><thead><tr><th>Código</th><th>Mueble</th><th class="r">Medidas (mm)</th><th class="r">Tableros</th><th class="r">Piezas</th></tr></thead><tbody>
    ${filas.map((f) => `<tr><td><b>${esc(f.cod)}</b></td><td>${esc(f.nombre)}</td><td class="r">${mm(f.A)} × ${mm(f.H)} × ${mm(f.P)}</td><td class="r">${f.tableros}</td><td class="r">${f.piezas}</td></tr>`).join('')}
    </tbody></table>
    <div class="caja">Antes de cortar, lee la <b>Guía 2 · Cortar, cantear, perforar y unir</b>: explica cómo pedir el corte y el enchape en el depósito y cómo armar cada mueble aunque no tengas taller.</div></section>`;
  const html = doc(fam.nombre, portada(esc(fam.nombre), `Categoría ${fam.id}`, `${fam.items.length} planos con despiece, herrajes, tapacanto, láminas, plano de cortes y paso a paso de armado.`,
    [[fam.items.length, 'planos'], [new Set(fam.items.map(M.diseno)).size, 'diseños'], ['mm', 'medidas exactas'], ['100 %', 'con despiece']], D.frente(M.construir(ejemplo), ejemplo.spec)) + indice + fam.items.map((it) => paginaPlano(it, fam)).join(''));
  const archivo = `Planos/${fam.id}_Planos_${fam.corto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9]+/g, '_')}.pdf`;
  const f = path.join(TMP, `fam_${fam.id}.html`);
  fs.writeFileSync(f, html);
  trabajos.push([f, path.join(OUT, archivo)]);
  manifest.categorias.push({ id: fam.id, nombre: fam.nombre, corto: fam.corto, archivo, planos: filas, disenos: [...new Set(filas.map((x) => x.diseno))] });
}

// ------------------------------------------------------------------ guías y bonos
const G = require('./guias')({ M, D, FAM, TOTAL, DISENOS, portada, esc, mm });
for (const g of G) {
  const f = path.join(TMP, `${g.id}.html`);
  fs.writeFileSync(f, doc(g.titulo, g.html));
  trabajos.push([f, path.join(OUT, g.archivo)]);
  (g.bono ? manifest.bonos : manifest.guias).push({ id: g.id, titulo: g.titulo, sub: g.sub, archivo: g.archivo });
}

// Calculadora: ejemplo con las cantidades reales del clóset corredizo de 1,80 m
const ej = M.construir(M.buscar('CLO-COR-1800').item);
const ejH = Object.fromEntries(M.herrajesLista(ej.herr));
const calc = fs.readFileSync(path.join(__dirname, 'calculadora.html'), 'utf8').replace('/*EJEMPLO*/', JSON.stringify({
  nombre: 'Clóset de 2 puertas corredizas 1.800 × 2.200 mm (ejemplo del pack)', tableros: ej.tableros, fondos: ej.fondos,
  cantoFino: ej.cantoFino, cantoGrueso: ej.cantoGrueso, bisagras: 0, correderas: Object.values(ej.herr.correderas).reduce((a, b) => a + b, 0),
  manijas: ej.herr.manijas + (ejH['Manija embutida para puerta corrediza'] || 0), m2: ej.m2mel,
}));
const calcArchivo = 'Bonos/Calculadora_Costos_Laminas_y_Cotizacion.html';
fs.writeFileSync(path.join(OUT, calcArchivo), calc);
manifest.bonos.unshift({ id: 'calculadora', titulo: 'Calculadora de Costos, Láminas y Cotización (COP)', sub: 'Se abre en el navegador del celular o del computador', archivo: calcArchivo, abrir: true });

// ------------------------------------------------------------------ muestra gratis: un plano completo
const mu = M.buscar(MUESTRA_COD);
const muestraArchivo = 'Muestra_Muebles_Plano_Mesa_de_Noche.pdf';
const htmlMuestra = doc('Muestra gratis', paginaPlano(mu.item, mu.fam).replace('<section class="plano">', '<section class="plano" style="break-before:auto">') +
  `<section class="cap"><header class="cap-cab"><span class="n">🎁</span><div><small>Muestra gratis</small><h2>Así vienen los ${TOTAL} planos del pack</h2></div></header>
  <p>Este es uno de los <b>${TOTAL} planos</b> (${DISENOS.length} diseños en varias medidas) del <b>Mega Pack de Carpintería y Muebles en Melamina 2026</b>. Todos traen lo mismo que viste aquí: vista frontal acotada, despiece pieza por pieza en milímetros con tapacanto, herrajes, cuántas láminas comprar, plano de cortes y paso a paso de armado.</p>
  <table class="t"><thead><tr><th>Categoría</th><th class="r">Planos</th><th>Diseños</th></tr></thead><tbody>
  ${manifest.categorias.map((c) => `<tr><td><b>${c.id} · ${esc(c.nombre)}</b></td><td class="r">${c.planos.length}</td><td>${esc(c.disenos.join(' · '))}</td></tr>`).join('')}</tbody></table>
  <div class="caja"><h4>Sin taller también se puede</h4><p>Lleva este despiece a un depósito de madera o a una tienda como Madecentro u Homecenter: allá cortan y enchapan cada pieza a la medida. En casa solo necesitas taladro, tornillos y la guía de armado.</p></div></section>`);
fs.writeFileSync(path.join(TMP, 'muestra.html'), htmlMuestra);
trabajos.push([path.join(TMP, 'muestra.html'), path.join(MUESTRAS, muestraArchivo)]);
manifest.muestra = { cod: MUESTRA_COD, nombre: mu.item.nombre, archivo: `muestras/${muestraArchivo}` };

// ------------------------------------------------------------------ totales
manifest.totales = { planos: TOTAL, disenos: DISENOS.length, categorias: FAM.length, piezas: piezasTotal, guias: manifest.guias.length, bonos: manifest.bonos.length };
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 1));

// ------------------------------------------------------------------ PDF con Chromium
function chrome(args) {
  execFileSync(CHROME, ['--headless', '--no-sandbox', '--disable-gpu', '--disable-crash-reporter', `--user-data-dir=${path.join(TMP, 'perfil')}`, ...args], { stdio: ['ignore', 'ignore', 'pipe'], timeout: 240000 });
}
console.log(`Planos: ${TOTAL} (${DISENOS.length} diseños) en ${FAM.length} categorías. Imprimiendo ${trabajos.length} PDF…`);
for (const [html, pdf] of trabajos) {
  chrome(['--no-pdf-header-footer', `--print-to-pdf=${pdf}`, 'file://' + html]);
  const n = (fs.readFileSync(pdf).toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  console.log(`  ✔ ${path.relative(RAIZ, pdf)} · ${n} páginas`);
}

// ------------------------------------------------------------------ imágenes (WhatsApp y portal)
function imagen(nombre, ancho, alto, cuerpo, destino) {
  const f = path.join(TMP, `${nombre}.html`);
  fs.writeFileSync(f, `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${CSS}
  html,body{margin:0;width:${ancho}px;height:${alto}px;overflow:hidden;background:#fffaf2}
  .img{width:${ancho}px;height:${alto}px;box-sizing:border-box;padding:34px;font-family:Inter,"Noto Sans",Arial,sans-serif;display:flex;flex-direction:column}
  .img h1{font:900 46px/1.05 Georgia,serif;color:#2b1d12;margin:0}.img .k{font:800 22px Arial;letter-spacing:.18em;color:#a26a10;text-transform:uppercase;margin-bottom:8px}
  .img .g{flex:1;display:grid;gap:14px;margin:18px 0}.img .c{background:#fff;border:2px solid #e8dcc8;border-radius:14px;padding:10px;display:flex;flex-direction:column;align-items:center;justify-content:center}
  .img .c svg{width:100%;height:100%;max-height:100%}.img .c b{font:700 18px Arial;color:#2b1d12;margin-top:6px;text-align:center}
  .img .pie{display:flex;gap:12px}.img .pie div{flex:1;background:#2b1d12;color:#fff;border-radius:12px;padding:12px;text-align:center;font:700 18px Arial}.img .pie b{display:block;font:900 34px Georgia,serif;color:#e0a84b}
  .img .t td,.img .t th{font-size:19px!important;padding:7px 8px!important}.img .t th{font-size:15px!important}</style></head><body>${cuerpo}</body></html>`);
  chrome([`--screenshot=${destino}`, `--window-size=${ancho},${alto}`, '--hide-scrollbars', '--default-background-color=fffaf2ff', 'file://' + f]);
  console.log(`  ✔ ${path.relative(RAIZ, destino)}`);
}
const fig = (cod) => { const { item } = M.buscar(cod); const r = M.construir(item); return `<div class="c">${D.frente(r, item.spec)}<b>${esc(item.nombre.replace(/ \(.*\)$/, ''))}</b></div>`; };
const catalogo = `<div class="img"><div class="k">Mega Pack 2026 · ${TOTAL} planos en mm</div><h1>Carpintería y Muebles en Melamina</h1>
  <div class="g" style="grid-template-columns:repeat(3,1fr)">${['COC-B2P-800', 'CLO-COR-1800', 'ESC-L-1400', 'TV-CEN-2400', 'DOR-CO4-800', 'ORG-CUB-3X3'].map(fig).join('')}</div>
  <div class="pie"><div><b>${TOTAL}</b>planos</div><div><b>${DISENOS.length}</b>diseños</div><div><b>5</b>categorías</div><div><b>4 + 2</b>guías y bonos</div></div></div>`;
imagen('cat', 1080, 1080, catalogo, path.join(MUESTRAS, 'img/muebles_1_catalogo.jpg'));
imagen('portal', 1200, 900, catalogo, path.join(RAIZ, 'public/portal/images/cover_muebles.jpg'));
const rM = M.construir(mu.item);
imagen('plano', 1080, 1350, `<div class="img"><div class="k">Así viene cada plano</div><h1>${esc(mu.item.nombre)} · ${mm(rM.medidas.A)} mm</h1>
  <div class="g" style="grid-template-rows:440px auto"><div class="c">${D.frente(rM, mu.item.spec)}</div>
  <div class="c" style="justify-content:flex-start;align-items:stretch"><table class="t desp"><thead><tr><th>Pieza</th><th>Cant.</th><th>Largo</th><th>Ancho</th><th>Canto</th></tr></thead><tbody>
  ${rM.piezas.map((p) => `<tr><td>${esc(p.nombre)}</td><td class="r">${p.cant}</td><td class="r"><b>${mm(p.largo)}</b></td><td class="r"><b>${mm(p.ancho)}</b></td><td>${M.notacion(p)}</td></tr>`).join('')}</tbody></table></div></div>
  <div class="pie"><div><b>${rM.tableros}</b>tablero</div><div><b>${rM.cortes}</b>piezas</div><div><b>${mm(rM.cantoFino + rM.cantoGrueso)} m</b>tapacanto</div><div><b>mm</b>medidas exactas</div></div></div>`, path.join(MUESTRAS, 'img/muebles_2_plano.jpg'));
const cC = M.buscar('CLO-COR-1800'), rC = M.construir(cC.item), melC = rC.piezas.filter((p) => p.material === 'melamina');
imagen('cortes', 1080, 1080, `<div class="img"><div class="k">Plano de cortes incluido en cada plano</div><h1>Sabes cuántas láminas comprar antes de ir al depósito</h1>
  <div class="g"><div class="c"><div style="width:100%;max-width:720px">${D.tablero(rC.optimizacion, 0, (k) => rC.piezas.indexOf(melC[k]) + 1)}</div><b>${esc(cC.item.nombre)} de 1.800 mm · tablero 1 de ${rC.tableros} (2,15 × 2,44 m)</b></div></div>
  <div class="pie"><div><b>${rC.tableros}</b>tableros</div><div><b>${rC.cortes}</b>piezas</div><div><b>${String(rC.aprovechamiento).replace('.', ',')} %</b>aprovechado</div></div></div>`, path.join(MUESTRAS, 'img/muebles_3_cortes.jpg'));

// ------------------------------------------------------------------ ZIP con todo
const zip = path.join(OUT, 'Mega_Pack_Muebles_Melamina_2026.zip');
fs.rmSync(zip, { force: true });
execFileSync('python3', ['-c', `import zipfile,os,sys
out,base=sys.argv[1],sys.argv[2]
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:
    for d in ['Planos','Guias','Bonos']:
        for f in sorted(os.listdir(os.path.join(base,d))):
            z.write(os.path.join(base,d,f), 'Mega_Pack_Muebles_Melamina_2026/'+d+'/'+f)`, zip, OUT]);
console.log(`  ✔ ${path.relative(RAIZ, zip)} · ${(fs.statSync(zip).size / 1e6).toFixed(1)} MB`);
fs.rmSync(TMP, { recursive: true, force: true });
console.log('Listo.');
