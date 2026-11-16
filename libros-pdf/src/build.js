// Compila los libros a HTML y PDF.
//   node src/build.js            -> todos los libros
//   node src/build.js helados    -> solo uno (por id)
// Variables opcionales:
//   CHROME_PATH=/ruta/a/chrome   usar un Chrome/Chromium específico
//   CHROME_SINGLE_PROCESS=1      necesario en algunos contenedores Linux
const fs = require('fs');
const path = require('path');
const { renderLibro } = require('./plantilla');

const RAIZ = path.join(__dirname, '..');
const LIBROS = ['helados', 'postres', 'navidad'];

function cargarPlaywright() {
  try { return require('playwright-core'); } catch (_) {}
  try { return require('playwright'); } catch (_) {}
  throw new Error('Instala playwright-core: npm install');
}

const contarPaginas = (buf) => (buf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;

(async () => {
  const pedidos = process.argv.slice(2);
  const ids = pedidos.length ? pedidos : LIBROS;
  const outHtml = path.join(RAIZ, 'dist', 'html');
  const outPdf = path.join(RAIZ, 'dist', 'pdf');
  fs.mkdirSync(outHtml, { recursive: true });
  fs.mkdirSync(outPdf, { recursive: true });

  const { chromium } = cargarPlaywright();
  const browser = await chromium.launch({
    channel: process.env.CHROME_PATH ? undefined : 'chrome',
    executablePath: process.env.CHROME_PATH || undefined,
    headless: true,
    args: ['--disable-gpu', '--no-sandbox', '--allow-file-access-from-files', '--disable-web-security']
  });
  const context = await browser.newContext();

  for (const id of ids) {
    delete require.cache[require.resolve(`../libros/${id}`)];
    const libro = require(`../libros/${id}`);
    const html = renderLibro(libro);
    const fHtml = path.join(outHtml, `${libro.archivo}.html`);
    fs.writeFileSync(fHtml, html);

    const page = await context.newPage();
    await page.goto('file://' + fHtml, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    const fPdf = path.join(outPdf, `${libro.archivo}.pdf`);
    await page.pdf({ path: fPdf, preferCSSPageSize: true, printBackground: true, tagged: true, outline: true });
    console.log(`✔ ${libro.archivo}.pdf  ·  ${contarPaginas(fs.readFileSync(fPdf))} páginas`);
    await page.close();
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
