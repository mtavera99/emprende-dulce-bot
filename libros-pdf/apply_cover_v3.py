import os
import re

base_dir = "/Users/santiagotavera/Desktop/Trabajos/lowticket-bot/libros-pdf"

# 1. Update plantilla.js
plantilla_path = os.path.join(base_dir, "src/plantilla.js")
with open(plantilla_path, "r", encoding="utf-8") as f:
    plantilla = f.read()

# Add rutaFoto helper if not present
if "function rutaFoto" not in plantilla:
    plantilla = plantilla.replace(
        "function foto(id) {",
        """function rutaFoto(id) {
  for (const ext of ['jpg', 'jpeg', 'png', 'webp']) {
    const f = path.join(RAIZ, 'fotos', `${id}.${ext}`);
    if (fs.existsSync(f)) return f;
  }
  return null;
}

function foto(id) {"""
    )

# Replace old portada function with new premium portada
old_portada_pattern = r"function portada\(l\) \{[\s\S]*?\n\}"
new_portada_code = """const SELLOS_DEFAULT = {
  cinta: 'Edición Emprendedores 2026',
  sticker: ['Incluye plantilla', 'Costeo', 'Colombia'],
  badges: ['Técnicas sin máquina industrial', 'Costeo en pesos colombianos (COP)', 'Fórmulas de alta rotación']
};

function selloColeccion(vol) {
  return `<svg class="pc-sello" viewBox="0 0 120 120" aria-hidden="true">
    <circle cx="60" cy="60" r="54" fill="none" stroke="var(--oro)" stroke-width="2.5" stroke-dasharray="4 3"/>
    <circle cx="60" cy="60" r="48" fill="color-mix(in srgb, var(--c2) 92%, #000)" stroke="var(--oro)" stroke-width="1.2"/>
    <path id="txt-arc-${vol}" d="M 22 60 A 38 38 0 1 1 98 60" fill="none"/>
    <text font-family="var(--sans)" font-size="7.4" font-weight="700" letter-spacing="2.2" fill="var(--oro)"><textPath href="#txt-arc-${vol}" startOffset="50%" text-anchor="middle">COLECCIÓN EMPRENDE DULCE</textPath></text>
    <text x="60" y="75" text-anchor="middle" font-family="var(--serif)" font-weight="800" font-size="22" fill="#fff">${vol}</text></svg>`;
}

const ICO_CHECK = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7.2" fill="var(--oro)"/><path d="M4.6 8.3l2.2 2.2 4.6-4.8" stroke="var(--c2)" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function portada(l) {
  const pc = { ...SELLOS_DEFAULT, ...(l.portada || {}) };
  const t = l.tema || {};
  const lineas = pc.lineas || [l.titulo];
  const h1 = lineas.map((x, i) => `<span class="${i === pc.acento ? 'acento' : ''}">${x}</span>`).join('');
  const foto = rutaFoto(`portada-${l.id}`) || (l.portadaVisual || []).map(rutaFoto).find(Boolean);
  const hero = foto
    ? `<div class="pc-arco foto"><img src="file://${foto}" alt=""></div>`
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
    <div class="pc-sticker"><small>${pc.sticker[0]}</small><b>${pc.sticker[1]}</b><small>${pc.sticker[2]}</small></div>
  </div>
  <ul class="pc-badges">${pc.badges.map((b) => `<li>${ICO_CHECK}${b}</li>`).join('')}</ul>
  <ul class="pc-datos">${l.datosPortada.map((d) => `<li><strong>${d[0]}</strong><span>${d[1]}</span></li>`).join('')}</ul>
  <footer class="pc-pie">Manual práctico para producir y vender desde casa · Colombia</footer>
</section>`;
}"""

plantilla = re.sub(old_portada_pattern, new_portada_code, plantilla)
with open(plantilla_path, "w", encoding="utf-8") as f:
    f.write(plantilla)
print("Updated plantilla.js successfully")

# 2. Update estilos.css
estilos_path = os.path.join(base_dir, "src/estilos.css")
with open(estilos_path, "r", encoding="utf-8") as f:
    estilos = f.read()

new_cover_css = """/* ---------- Portada Premium v3 ---------- */
.portada.pc { width: 215.9mm; height: 279mm; overflow: hidden; break-after: page; page-break-after: always; position: relative; padding: 11mm 15mm 9mm; display: flex; flex-direction: column; color: #fff; text-align: center;
  background:
    radial-gradient(70% 45% at 50% 62%, color-mix(in srgb, var(--c3) 75%, #fff 10%) 0%, transparent 70%),
    linear-gradient(165deg, var(--c1) 0%, var(--c2) 58%, color-mix(in srgb, var(--c2) 70%, #000) 100%); }
.pc-luz { position: absolute; inset: 0; pointer-events: none;
  background: conic-gradient(from 200deg at 50% -10%, transparent 0deg, rgba(255,255,255,.07) 12deg, transparent 24deg, transparent 40deg, rgba(255,255,255,.05) 50deg, transparent 62deg); }
.pc-trama { position: absolute; inset: 0; pointer-events: none; opacity: .55;
  background-image: radial-gradient(rgba(255,255,255,.07) .7px, transparent 1px); background-size: 4.2mm 4.2mm; }
.portada.pc::after { content: ""; position: absolute; inset: 6mm; border: .35mm solid color-mix(in srgb, var(--oro) 55%, transparent); pointer-events: none; }
.portada.pc > * { position: relative; z-index: 1; }

/* Cinta diagonal */
.pc-cinta { position: absolute; top: 0; right: 0; width: 62mm; height: 62mm; overflow: hidden; z-index: 3; }
.pc-cinta span { position: absolute; top: 15mm; right: -19mm; width: 86mm; transform: rotate(45deg); text-align: center;
  background: linear-gradient(90deg, color-mix(in srgb, var(--cinta) 75%, #000), var(--cinta) 30%, color-mix(in srgb, var(--cinta) 70%, #fff) 50%, var(--cinta) 70%, color-mix(in srgb, var(--cinta) 75%, #000));
  color: var(--cinta-txt); font: 800 6.6pt var(--sans); letter-spacing: .14em; text-transform: uppercase; padding: 2.2mm 0; box-shadow: 0 1.5mm 3mm rgba(0,0,0,.35); }

/* Encabezado */
.pc-top { display: flex; justify-content: space-between; align-items: center; text-align: left; padding: 1mm 2mm 0; margin-right: 22mm; }
.pc-marca b { display: block; font: 800 11pt var(--serif); letter-spacing: .22em; text-transform: uppercase; }
.pc-marca b i { font-style: normal; color: var(--oro); }
.pc-marca small { font: 500 6.5pt var(--sans); letter-spacing: .18em; text-transform: uppercase; color: rgba(255,255,255,.65); }
.pc-vol { font: 600 7pt var(--sans); letter-spacing: .2em; text-transform: uppercase; color: var(--oro); border: .3mm solid var(--oro); border-radius: 1mm; padding: 1mm 2.4mm; }
.pc-vol b { font-size: 9pt; margin-left: 1mm; color: #fff; }

/* Título */
.pc-titulo { margin-top: 8mm; }
.pc-kicker { display: flex; align-items: center; justify-content: center; gap: 3mm; font: 700 8pt var(--sans); letter-spacing: .34em; text-transform: uppercase; color: var(--oro); }
.pc-kicker span { width: 14mm; height: .3mm; background: var(--oro); }
.portada.pc h1 { margin: 4mm 0 0; color: #fff; font-family: var(--serif); font-weight: 900; letter-spacing: -.02em; line-height: .98; text-shadow: 0 1.2mm 3mm rgba(0,0,0,.35); }
.portada.pc h1 span { display: block; }
.portada.pc h1.l1, .portada.pc h1.l2 { font-size: 46pt; }
.portada.pc h1.l3 { font-size: 38pt; }
.portada.pc h1 .acento { color: var(--oro); font-style: italic; font-weight: 800; }
.pc-sub { max-width: 150mm; margin: 4.5mm auto 0; font-size: 10.5pt; line-height: 1.45; color: rgba(255,255,255,.82); }

/* Escena: arco con foto o ilustraciones */
.pc-escena { flex: 1; min-height: 0; position: relative; display: flex; justify-content: center; align-items: stretch; margin: 6mm 0 4mm; }
.pc-arco { position: relative; width: 138mm; height: 100%; border-radius: 69mm 69mm 5mm 5mm; overflow: hidden;
  border: .9mm solid var(--oro); box-shadow: 0 0 0 1.6mm color-mix(in srgb, var(--c2) 70%, #000), 0 0 0 2mm color-mix(in srgb, var(--oro) 45%, transparent), 0 6mm 14mm rgba(0,0,0,.5); }
.pc-arco.foto img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
.pc-arco.foto::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 60%, rgba(0,0,0,.35)); }

/* Sello y etiqueta redonda */
.pc-sello-wrap { position: absolute; left: 12mm; bottom: -3mm; width: 34mm; height: 34mm; transform: rotate(-12deg); filter: drop-shadow(0 2mm 3mm rgba(0,0,0,.45)); }
.pc-sello { width: 100%; height: 100%; }
.pc-sticker { position: absolute; right: 12mm; top: 10mm; width: 31mm; height: 31mm; border-radius: 50%; transform: rotate(10deg);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .4mm;
  background: radial-gradient(circle at 35% 30%, #fff 0%, #f6efe4 70%); color: var(--c2); box-shadow: 0 2mm 4mm rgba(0,0,0,.4);
  border: 1mm solid var(--oro); outline: .4mm dashed color-mix(in srgb, var(--oro) 80%, #000); outline-offset: -2.6mm; }
.pc-sticker small { font: 700 6pt var(--sans); letter-spacing: .16em; text-transform: uppercase; color: color-mix(in srgb, var(--c3) 85%, #000); }
.pc-sticker b { font: 800 9pt/1.05 var(--serif); max-width: 22mm; }

/* Distintivos, cifras y pie */
.pc-badges { list-style: none; margin: 0 auto; padding: 0; display: flex; justify-content: center; gap: 2.5mm; flex-wrap: wrap; }
.pc-badges li { display: flex; align-items: center; gap: 1.6mm; font: 650 7.4pt var(--sans); padding: 1.6mm 3mm 1.6mm 1.8mm; border-radius: 10mm;
  background: rgba(255,255,255,.08); border: .3mm solid color-mix(in srgb, var(--oro) 55%, transparent); }
.pc-badges svg { width: 3.8mm; height: 3.8mm; flex: none; }
.portada.pc .pc-datos { list-style: none; margin: 4mm 0 3.5mm; padding: 0; display: grid; grid-template-columns: repeat(4, 1fr); gap: 2.5mm; border: 0; }
.portada.pc .pc-datos li { padding: 2.6mm 1mm 2.2mm; border-radius: 2mm; background: linear-gradient(180deg, rgba(255,255,255,.1), rgba(255,255,255,.03)); border: .3mm solid rgba(255,255,255,.14); }
.portada.pc .pc-datos strong { display: block; font: 800 16pt var(--serif); color: var(--oro); line-height: 1.05; }
.portada.pc .pc-datos span { font: 600 6.3pt var(--sans); letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,.8); }
.pc-pie { font: 500 6.8pt var(--sans); letter-spacing: .24em; text-transform: uppercase; color: rgba(255,255,255,.6); }
"""

# Replace old portada CSS
old_css_pattern = r"/\* ---------- Portada ---------- \*/[\s\S]*?/\* ---------- Índice ---------- \*/"
estilos = re.sub(old_css_pattern, new_cover_css + "\n\n/* ---------- Índice ---------- */", estilos)
with open(estilos_path, "w", encoding="utf-8") as f:
    f.write(estilos)
print("Updated estilos.css successfully")

# 3. Update libros/helados.js
helados_path = os.path.join(base_dir, "libros/helados.js")
with open(helados_path, "r", encoding="utf-8") as f:
    helados = f.read()

# Add vol, tema, portada metadata
if "vol: '01'" not in helados:
    helados = helados.replace(
        "id: 'helados',",
        """id: 'helados',
  vol: '01',
  tema: { c1: '#16264a', c2: '#0b1226', c3: '#5a3a26', oro: '#e0b874', cinta: '#e0b874', cintaTxt: '#2a1a08' },
  portada: { lineas: ['Helados', 'Artesanales', 'sin Máquina'], acento: 2, sub: 'La técnica para lograr helado cremoso en el congelador de tu casa, 12 sabores y 5 paletas costeadas en pesos colombianos.' },"""
    )
    helados = helados.replace("['4', 'Paletas']", "['5', 'Paletas']")

# Update paleta-fresa recipe
old_paleta_pattern = r"\{\s*tipo:\s*'receta',\s*id:\s*'paleta-fresa'[\s\S]*?empaque:\s*PALETA,\s*precioVenta:\s*4500,\s*\}"
new_paleta_recipe = """{
      tipo: 'receta', id: 'paleta-fresa', kicker: 'Paleta', titulo: 'Paleta de Fresa Rellena de Leche Condensada',
      subtitulo: 'Fresa natural por fuera y un corazón cremoso de leche condensada que no se congela del todo. La combinación más pedida.',
      rinde: { porciones: 10, formato: 'paletas de 80 ml', formatoCorto: 'Paleta' },
      tiempos: { activo: '25 min', espera: '6 h' }, dificultad: 'Media',
      conservacion: 'Congelada, 4 semanas. Contiene leche.',
      ingredientes: [
        { n: 'Fresas lavadas y desinfectadas', cant: 400, u: 'g', ref: 'fresas' },
        { n: 'Agua', cant: 250, u: 'ml' },
        { n: 'Azúcar', cant: 130, u: 'g', ref: 'azucar' },
        { n: 'Limón (el jugo)', cant: 20, u: 'g', ref: 'limones' },
        { n: 'Leche condensada fría para el relleno', cant: 120, u: 'g', ref: 'condensada' },
      ],
      pasos: [
        'Licúa las fresas con el agua, el azúcar y el limón. Cuela si no quieres semillas. Prueba: debe estar un poco más dulce de lo que te gustaría.',
        'Llena las cavidades hasta tres cuartos y congela 60 a 90 minutos, hasta que se forme una pared congelada de 1 cm completo (si es más delgada, el relleno se sale) y el centro siga líquido.',
        'Voltea el molde sobre un recipiente para vaciar el centro líquido y guárdalo en la nevera.',
        'Rellena el hueco con leche condensada fría usando una manga o una bolsa con la punta cortada, hasta la mitad de la altura.',
        'Inserta los palitos y completa con la mezcla de fresa reservada para sellar el relleno.',
        'Congela 4 horas más, desmolda con agua tibia y empaca.',
      ],
      secreto: '<p><b>La leche condensada no se congela dura a -18 °C</b> por su alta concentración de azúcar: al morder, el centro sale cremoso. El limón aviva el rojo de la fresa y evita que se ponga opaca. En tus videos, muestra la paleta mordida por la mitad para que se vea el relleno.</p>',
      empaque: PALETA, precioVenta: 4500,
    }"""
helados = re.sub(old_paleta_pattern, new_paleta_recipe, helados)
with open(helados_path, "w", encoding="utf-8") as f:
    f.write(helados)
print("Updated helados.js successfully")

# 4. Update libros/postres.js
postres_path = os.path.join(base_dir, "libros/postres.js")
with open(postres_path, "r", encoding="utf-8") as f:
    postres = f.read()

if "vol: '02'" not in postres:
    postres = postres.replace(
        "id: 'postres',",
        """id: 'postres',
  vol: '02',
  tema: { c1: '#5a1230', c2: '#22060f', c3: '#8a2a4a', oro: '#dcb36b', cinta: '#dcb36b', cintaTxt: '#2a1a08' },
  portada: { lineas: ['Postres en Vaso', 'para Emprender'], acento: 1, sub: 'Diez postres de alta rotación en vaso de 7 oz, con capas que no se mezclan y costeo completo en pesos colombianos.' },"""
    )
with open(postres_path, "w", encoding="utf-8") as f:
    f.write(postres)
print("Updated postres.js successfully")

# 5. Update libros/navidad.js
navidad_path = os.path.join(base_dir, "libros/navidad.js")
with open(navidad_path, "r", encoding="utf-8") as f:
    navidad = f.read()

if "vol: '03'" not in navidad:
    navidad = navidad.replace(
        "id: 'navidad',",
        """id: 'navidad',
  vol: '03',
  tema: { c1: '#124030', c2: '#06180f', c3: '#2d6b4c', oro: '#e2bd6e', cinta: '#b3192c', cintaTxt: '#fff' },
  portada: { lineas: ['Recetario Navideño', 'Postres y Cajas Regalo', 'para Vender'], acento: 2, sub: 'Natilla, buñuelos, brevas, trufas y torta negra, con tres cajas regalo costeadas y el calendario para vender en diciembre.' },"""
    )
with open(navidad_path, "w", encoding="utf-8") as f:
    f.write(navidad)
print("Updated navidad.js successfully")
