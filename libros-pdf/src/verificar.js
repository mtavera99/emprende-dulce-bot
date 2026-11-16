// Verifica que cada receta quepa en las páginas previstas:
//   1 página en libros normales, 2 en libros con fichaProduccion (receta + ficha).
// Las cajas regalo deben ocupar 1 página. Uso: node src/verificar.js (después de build)
const path = require('path');
const fs = require('fs');

const RAIZ = path.join(__dirname, '..');
const LIBROS = ['helados', 'postres', 'navidad'];
// Recetas que ocupan una página más a propósito.
const EXCEPCIONES = { base: 2 };

const { chromium } = (() => { try { return require('playwright-core'); } catch (_) { return require('playwright'); } })();
const contar = (buf) => (buf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;

(async () => {
  const context = await chromium.launchPersistentContext('/tmp/pw_pdf_profile', {
    channel: process.env.CHROME_PATH ? undefined : 'chrome',
    executablePath: process.env.CHROME_PATH || undefined,
    args: ['--disable-gpu', '--no-sandbox']
  });
  const page = await context.newPage();
  let fallas = 0;
  for (const id of LIBROS) {
    const libro = require(`../libros/${id}`);
    const fHtml = path.join(RAIZ, 'dist', 'html', `${libro.archivo}.html`);
    if (!fs.existsSync(fHtml)) { console.log(`… ${id}: falta compilar`); continue; }
    await page.goto('file://' + fHtml);
    const html = await page.content();
    const ids = await page.$$eval('body > .receta, body > .caja-regalo', (els) => els.map((e) => [e.id, e.className]));
    for (const [sid, clase] of ids) {
      await page.setContent(html);
      await page.evaluate((sid) => { for (const e of [...document.body.children]) if (e.id !== sid && !e.classList.contains('portada')) e.remove(); }, sid);
      const n = contar(await page.pdf({ preferCSSPageSize: true, printBackground: true })) - 1;
      const esperado = clase.includes('caja') ? 1 : (libro.fichaProduccion ? 2 : 1) + ((EXCEPCIONES[sid] || 1) - 1);
      if (n !== esperado) { fallas++; console.log(`⚠ ${id}/${sid}: ocupa ${n} páginas (esperado ${esperado})`); }
    }
    console.log(`✔ ${id}: ${ids.length} recetas y cajas revisadas`);
  }
  await context.close();
  process.exit(fallas ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
