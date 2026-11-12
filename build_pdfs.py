import os
import subprocess

CHROME_BIN = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUTPUT_DIR = "/Users/santiagotavera/Desktop/Trabajos/lowticket-bot/dist_pdfs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

BASE_CSS = """
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;1,400&display=swap');

@page {
  size: letter;
  margin: 18mm 16mm 18mm 16mm;
  @bottom-right {
    content: "Página " counter(page);
    font-size: 8pt;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #94a3b8;
  }
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
  color: #1e293b;
  line-height: 1.6;
  font-size: 10.5pt;
  background: #ffffff;
}

.cover {
  page-break-after: always;
  height: 92vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: center;
  padding: 40px 20px;
  background: radial-gradient(circle at top right, #fff1f2, #ffffff 60%, #ffe4e6);
  border: 2px solid #fecdd3;
  border-radius: 20px;
}

.cover-badge {
  display: inline-block;
  background: #e11d48;
  color: #ffffff;
  font-size: 9pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  padding: 6px 16px;
  border-radius: 999px;
  align-self: center;
}

.cover-title {
  font-family: 'Playfair Display', serif;
  font-size: 32pt;
  font-weight: 700;
  color: #881337;
  line-height: 1.2;
  margin-top: 20px;
  margin-bottom: 12px;
}

.cover-subtitle {
  font-size: 13pt;
  color: #475569;
  max-width: 520px;
  margin: 0 auto;
  font-weight: 500;
}

.cover-footer {
  border-top: 1px solid #fecdd3;
  padding-top: 15px;
  font-size: 9pt;
  color: #94a3b8;
  display: flex;
  justify-content: space-between;
}

h1 {
  font-family: 'Playfair Display', serif;
  font-size: 20pt;
  color: #881337;
  margin-top: 25px;
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 2px solid #fda4af;
  page-break-after: avoid;
}

h2 {
  font-size: 13pt;
  font-weight: 700;
  color: #be123c;
  margin-top: 20px;
  margin-bottom: 8px;
  page-break-after: avoid;
}

h3 {
  font-size: 11pt;
  font-weight: 600;
  color: #0f172a;
  margin-top: 14px;
  margin-bottom: 6px;
  page-break-after: avoid;
}

p {
  margin-bottom: 10px;
  text-align: justify;
}

.card {
  background: #f8fafc;
  border-left: 4px solid #e11d48;
  padding: 14px 18px;
  border-radius: 0 12px 12px 0;
  margin: 14px 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.card-title {
  font-weight: 700;
  color: #9f1239;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

ul, ol {
  margin-left: 20px;
  margin-bottom: 12px;
}

li {
  margin-bottom: 5px;
}

.recipe-meta {
  display: flex;
  gap: 12px;
  margin: 10px 0 14px 0;
  flex-wrap: wrap;
}

.meta-item {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 8.5pt;
  font-weight: 600;
  color: #334155;
}

.step-box {
  display: flex;
  gap: 12px;
  margin-bottom: 10px;
}

.step-number {
  background: #e11d48;
  color: #fff;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 8.5pt;
  flex-shrink: 0;
  margin-top: 2px;
}

.step-content {
  flex: 1;
}

.page-break {
  page-break-after: always;
}
"""

def generate_pdf(html_content, output_pdf_name):
    temp_html = os.path.join(OUTPUT_DIR, f"{output_pdf_name}.html")
    output_pdf = os.path.join(OUTPUT_DIR, f"{output_pdf_name}.pdf")
    
    with open(temp_html, "w", encoding="utf-8") as f:
        f.write(html_content)
        
    cmd = [
        CHROME_BIN,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--user-data-dir=/tmp/headless-chrome-pdf",
        "--no-pdf-header-footer",
        f"--print-to-pdf={output_pdf}",
        temp_html
    ]
    subprocess.run(cmd, check=True)
    print(f"✅ Generado: {output_pdf}")
    if os.path.exists(temp_html):
        os.remove(temp_html)

# ==========================================
# 1. MANUAL DE HELADOS ARTESANALES
# ==========================================
html_helados = f"""
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>{BASE_CSS}</style>
</head>
<body>

<div class="cover">
  <div class="cover-badge">PROGRAMA OFICIAL • EMPRENDE DULCE</div>
  <div>
    <h1 class="cover-title">El Negocio de los<br>Helados Artesanales<br>Sin Máquina</h1>
    <p class="cover-subtitle">La técnica secreta de cremosidad profesional, balance de grasas y fórmulas comerciales para emprender desde casa.</p>
  </div>
  <div class="cover-footer">
    <span>Colección Exclusiva 2026</span>
    <span>Formato Masterclass Digital</span>
    <span>Edición Colombia</span>
  </div>
</div>

<h1>1. El Secreto de la Cremosidad Perfecta</h1>
<p>El mayor obstáculo al preparar helados caseros es la cristalización: el agua se congela en cristales duros que rompen la textura suave y agradable. Las grandes heladerías artesanales italianas no dependen de magia, sino de un balance riguroso entre tres elementos:</p>

<div class="recipe-meta">
  <div class="meta-item">⏱️ Dificultad: Principiante / Intermedio</div>
  <div class="meta-item">🍦 Rendimiento: 1 Litro (10 porciones)</div>
  <div class="meta-item">💰 Margen Comercial: 72%</div>
</div>

<div class="card">
  <div class="card-title">💡 La Regla de los Tres Pilares:</div>
  <p><strong>1. Grasa Láctea (Mínimo 32% - 35%):</strong> Aporta untuosidad y atrapa pequeñas burbujas de aire durante el batido. Usamos crema de leche para batir fría.<br>
  <strong>2. Sólidos Lácteos y Azúcares:</strong> La leche condensada aporta azúcares disueltos que descienden el punto de congelación, manteniendo el helado cremoso incluso a -18°C.<br>
  <strong>3. Estabilizante Natural:</strong> La pizca de sal marina y extracto natural de vainilla impiden la dureza y potencian el sabor en papilas frías.</p>
</div>

<h2>La Fórmula de la Crema Base Universal</h2>
<p>Esta base es neutra. Al dominarla, podrás crear más de 30 sabores distintos simplemente agregando mermeladas, frutos secos, pastas concentradas o licores.</p>

<h3>Ingredientes Comerciales:</h3>
<ul>
  <li><strong>500 ml</strong> de Crema de Leche para batir (mínimo 35% materia grasa, muy fría, mínimo 8 horas en refrigeración).</li>
  <li><strong>390 g</strong> (1 lata estándar) de Leche Condensada entera de alta densidad.</li>
  <li><strong>1 cucharadita (5 ml)</strong> de extracto puro de vainilla oscura.</li>
  <li><strong>1 g (pizca)</strong> de sal marina fina.</li>
</ul>

<h3>Paso a Paso de Elaboración:</h3>
<div class="step-box">
  <div class="step-number">1</div>
  <div class="step-content"><strong>Enfriamiento de utensilios:</strong> Coloca el tazón de acero o vidrio y las aspas de tu batidora eléctrica en el congelador durante 15 minutos antes de iniciar. La temperatura baja es obligatoria para montar la grasa láctea.</div>
</div>
<div class="step-box">
  <div class="step-number">2</div>
  <div class="step-content"><strong>Batido de volumen:</strong> Vierte la crema de leche fría en el bol. Bate a velocidad media durante 3 a 4 minutos hasta alcanzar "picos medios" (textura similar a espuma de afeitar firme). Cuidado: no sobrebatas o se separará en mantequilla y suero.</div>
</div>
<div class="step-box">
  <div class="step-number">3</div>
  <div class="step-content"><strong>Incorporación envolvente:</strong> Vierte la leche condensada en un hilo fino continuo. Con una espátula de silicona flexible (miserable), realiza movimientos circulares envolventes de abajo hacia arriba, rotando el bol. Debes mantener el 95% del aire atrapado.</div>
</div>
<div class="step-box">
  <div class="step-number">4</div>
  <div class="step-content"><strong>Saborizado y envasado:</strong> Añade el saborizante elegido. Vierte en recipientes herméticos de acero o plástico alimentario. Coloca papel film transparente en contacto directo con la superficie del helado (a piel) para evitar cristales de condensación superficial.</div>
</div>
<div class="step-box">
  <div class="step-number">5</div>
  <div class="step-content"><strong>Congelación técnica:</strong> Lleva al congelador a mínimo -16°C durante 6 a 8 horas sin abrir la puerta con frecuencia.</div>
</div>

<div class="page-break"></div>

<h1>2. Catálogo de Sabores Más Rentables</h1>

<h2>1. Helado de Arequipe Gourmet con Veteado Doble</h2>
<div class="recipe-meta">
  <div class="meta-item">⭐ Nivel de Ventas: #1 en Colombia</div>
  <div class="meta-item">🍫 Costo Ingrediente: $1.450 COP / bola</div>
</div>
<p><strong>Ingredientes adicionales:</strong> 220 g de Arequipe repostero tradicional (suave) + 90 g de arequipe de consistencia firme para el veteado.<br>
<strong>Técnica:</strong> Disuelve los 220 g de arequipe suave en la leche condensada antes de unirla a la crema batida. Al momento de verter en el molde final, intercala capas de crema con cucharaditas del arequipe firme. Con la punta de un cuchillo dibuja ochos en la superficie para que al servir cada bola tenga vetas doradas visibles.</p>

<h2>2. Chocolate Suizo Profundo con Ganache</h2>
<p><strong>Ingredientes adicionales:</strong> 60 g de cacao puro amargo en polvo (100% sin azúcar) + 120 g de chocolate semi-amargo derretido y tibio.<br>
<strong>Técnica:</strong> Tamiza el cacao en polvo sobre la leche condensada y mezcla enérgicamente hasta lograr una pasta espesa brillante. Une con la crema montada. Decora con hilos de ganache y chispas de chocolate semi-amargo al 58%.</p>

<h2>3. Cheesecake Silvestre de Frutos Rojos</h2>
<p><strong>Ingredientes adicionales:</strong> 180 g de queso crema firme tipo Philadelphia + 200 g de reducción de moras y fresas campesinas + 10 galletas María trituradas en trozos medianos.<br>
<strong>Técnica:</strong> Suaviza el queso crema con batidor de mano e incorpóralo a la base. Vetea con la mermelada fría de frutos rojos y esparce los trozos crocantes de galleta.</p>

<h2>4. Café Moca Colombiano</h2>
<p><strong>Ingredientes adicionales:</strong> 2 cucharadas soperas de café liofilizado (tipo Colcafé o Buendía) disueltas en 25 ml de agua hirviendo y enfriadas + 50 g de chispas de chocolate amargo.<br>
<strong>Propiedad:</strong> El café soluble contiene antioxidantes naturales que reducen la cristalización y otorgan un aroma tostado irresistible.</p>

<h2>5. Paletas Artesanales de Maracuyá Rellenas de Leche Condensada</h2>
<p><strong>Base cítrica:</strong> 350 ml de pulpa concentrada de maracuyá colada + 300 ml de agua filtrada + 130 g de azúcar.<br>
<strong>Técnica del centro líquido:</strong> Llena los moldes de paleta hasta 3/4. Inserta un vasito cónico en el centro para reservar espacio y congela por 2 horas. Retira el vasito central, rellena la cavidad con leche condensada helada espesa, cubre con un poco más de pulpa y congela 4 horas adicionales.</p>

</body>
</html>
"""

# ==========================================
# 2. MANUAL DE POSTRES EN VASO
# ==========================================
html_postres = f"""
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>{BASE_CSS}</style>
</head>
<body>

<div class="cover">
  <div class="cover-badge">GUÍA PRÁCTICA • EMPRENDE DULCE</div>
  <div>
    <h1 class="cover-title">Postres en Vaso<br>Para Emprender</h1>
    <p class="cover-subtitle">Formatos individuales sin horno, técnicas de capas que no se mezclan y recetas de alta rotación para delivery.</p>
  </div>
  <div class="cover-footer">
    <span>Colección Exclusiva 2026</span>
    <span>Formato Individual 7 oz</span>
    <span>Edición Colombia</span>
  </div>
</div>

<h1>1. Anatomía del Postre en Vaso Comercial</h1>
<p>El formato individual en vaso de 5 oz a 7 oz es el producto más rentable del mercado dulce actual. Permite estandarizar porciones, evitar pérdidas por cortes irregulares y lucir los colores de las capas a través del empaque transparente tipo PET.</p>

<div class="card">
  <div class="card-title">📐 La Estructura de las 4 Capas:</div>
  <p><strong>1. Capa Base (20% volumen):</strong> Galleta triturada con mantequilla o bizcocho esponjoso húmedo.<br>
  <strong>2. Capa Principal (50% volumen):</strong> Mousse, crema pastelera ligera, o mezcla láctea cremosa.<br>
  <strong>3. Capa de Contraste (15% volumen):</strong> Fruta fresca ácida, mermelada artesanal o reducción.<br>
  <strong>4. Corona y Topping (15% volumen):</strong> Copo de chantilly con duya rizada 1M, lluvia de galleta o fruta deshidratada.</p>
</div>

<h2>Receta 1: Tres Leches Tradicional en Vaso (12 Unidades)</h2>
<div class="recipe-meta">
  <div class="meta-item">⏱️ Preparación: 30 minutos</div>
  <div class="meta-item">📦 Costo Unitario: $1.850 COP</div>
  <div class="meta-item">💵 Precio Venta: $6.500 COP</div>
</div>

<h3>1. Bizcochuelo Base Rápido (En sartén o molde plano):</h3>
<ul>
  <li>4 huevos frescos medianos (separadas claras y yemas).</li>
  <li>120 g de azúcar común.</li>
  <li>120 g de harina de trigo pastelera cernida.</li>
  <li>1 cucharadita de polvo de hornear y 1 cucharadita de vainilla.</li>
</ul>
<p><strong>Elaboración:</strong> Bate las claras a punto de nieve con la mitad del azúcar. En otro bol, bate yemas con el resto de azúcar hasta blanquear. Une ambas mezclas con movimientos suaves e incorpora la harina cernida con espátula. Hornea 15 min a 180°C o cocina en sartén gruesa tapada a fuego muy bajo. Deja enfriar y trocea en cubos de 1.5 cm.</p>

<h3>2. Jarabe Tres Leches con Cuerpo:</h3>
<ul>
  <li>1 lata (395 g) de Leche Condensada.</li>
  <li>1 lata (380 g) de Leche Evaporada (o leche entera ultrapasteurizada con 2 cucharadas de leche en polvo).</li>
  <li>1 taza (250 ml) de Crema de Leche espesa.</li>
  <li>15 ml de licor dulce (Brandy, Ron añejo o Baileys opcional).</li>
</ul>

<h3>3. Armado Comercial:</h3>
<div class="step-box">
  <div class="step-number">1</div>
  <div class="step-content">Coloca una capa de cubos de bizcocho en el fondo del vaso de 7 oz.</div>
</div>
<div class="step-box">
  <div class="step-number">2</div>
  <div class="step-content">Baña con 3 cucharadas soperas del jarabe 3 leches hasta que el bizcocho quede completamente empapado sin flotar.</div>
</div>
<div class="step-box">
  <div class="step-number">3</div>
  <div class="step-content">Aplica una capa de crema chantilly batida firme.</div>
</div>
<div class="step-box">
  <div class="step-number">4</div>
  <div class="step-content">Repite una segunda capa fina de bizcocho remojado. Corona con manga rizada y canela molida.</div>
</div>

<div class="page-break"></div>

<h1>2. Fórmulas Frías Sin Horno</h1>

<h2>Pay de Limón Cítrico Express (Sin Gelatina)</h2>
<p>Esta crema aprovecha la reacción química natural: el ácido del jugo de limón coagula las proteínas de la leche condensada y la crema, espesando en solo 5 minutos sin necesidad de grenetina ni cocción.</p>

<div class="recipe-meta">
  <div class="meta-item">⏱️ Tiempo: 15 minutos</div>
  <div class="meta-item">🍋 Ingredientes: Solo 4 elementos</div>
</div>

<ul>
  <li><strong>Crema:</strong> 1 lata (395 g) de Leche Condensada + 1 lata (300 g) de Crema de Leche fría + 110 ml de zumo de limón verde recién exprimido y colado.</li>
  <li><strong>Base:</strong> 200 g de galletas Ducales o María molidas + 70 g de mantequilla derretida.</li>
</ul>
<p><strong>Procedimiento:</strong> Licúa la leche condensada con la crema de leche y agrega el zumo de limón en hilo fino. Verás cómo espesa de inmediato. Coloca base de galleta en el fondo, cubre con crema, agrega otra capa fina de galleta y finaliza con crema y ralladura fresca de limón verde.</p>

<h2>Tiramisú Fácil al Café</h2>
<ul>
  <li>250 g de Queso Crema suave batido con 70 g de azúcar pulverizada.</li>
  <li>200 ml de Crema de Leche montada firme e integrada suavemente al queso crema.</li>
  <li>1 taza de café expreso concentrado amargo aromatizado con 1 cucharada de licor de café.</li>
  <li>Galletas de huevo o soletillas pasadas por el café (solo 1 segundo por lado).</li>
  <li>Cacao 100% puro tamizado para la corona.</li>
</ul>

</body>
</html>
"""

# Generar ambos documentos
generate_pdf(html_helados, "01_Helados_Artesanales_Guia_Maestra")
generate_pdf(html_postres, "02_Postres_en_Vaso_Para_Emprender")
