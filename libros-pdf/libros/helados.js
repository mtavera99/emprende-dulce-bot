// Libro 01 · Helados Artesanales Sin Máquina
const E5 = ['vaso5', 'cuchara', 'sticker'];
const PALETA = ['palito', 'bolsa_paleta', 'sticker'];
const T500 = { nombre: 'tarrina 500 ml', equivalePorciones: 4.2, empaque: ['tarrina500', 'sticker'], precio: 24000 };

const BASE = { sub: 'base', fraccion: 1, n: 'Base Universal (1 tanda completa)', medida: 'receta 01', cant: null };

module.exports = {
  id: 'helados',
  vol: '01',
  tema: { c1: '#16264a', c2: '#0b1226', c3: '#5a3a26', oro: '#e0b874', cinta: '#e0b874', cintaTxt: '#2a1a08' },
  portada: { lineas: ['Helados', 'Artesanales', 'sin Máquina'], acento: 2, sub: 'La técnica para lograr helado cremoso en el congelador de tu casa, 12 sabores y 5 paletas costeadas en pesos colombianos.' },
  archivo: '01_Helados_Artesanales_Guia_Maestra',
  tituloCorto: 'Helados artesanales sin máquina',
  color: '#7a1631',
  kicker: 'Guía maestra',
  titulo: 'Helados Artesanales Sin Máquina',
  subtitulo: 'La técnica para lograr helado cremoso en el congelador de tu casa, 12 sabores y 4 paletas con costeo en pesos colombianos, y todo lo que necesitas para venderlos.',
  datosPortada: [['12', 'Sabores'], ['5', 'Paletas'], ['100%', 'Costeado en COP'], ['0', 'Máquinas']],

  secciones: [
    // ------------------------------------------------------------------ PRELIMINARES
    {
      tipo: 'texto',
      nuevaPagina: true,
      titulo: 'Antes de empezar',
      html: `
<p class="lead">Este manual está escrito para una cocina normal: nevera, congelador, una batidora de mano y unos cuantos recipientes. No necesitas máquina heladera. Lo que sí necesitas es entender por qué un helado casero se vuelve un bloque de hielo, porque una vez lo entiendes, deja de pasarte.</p>
<div class="grid3">
  <div class="tarjeta"><div class="cifra">1</div><h4>Lee el capítulo 1</h4><p>Son dos páginas. Ahí está la diferencia entre un helado que se raspa con cuchara y uno que se sirve en bola.</p></div>
  <div class="tarjeta"><div class="cifra">2</div><h4>Haz una tanda de prueba</h4><p>Prepara la Base Universal (receta 01) y pruébala a las 6, 24 y 72 horas. Así conoces tu congelador antes de vender.</p></div>
  <div class="tarjeta"><div class="cifra">3</div><h4>Ajusta los costos</h4><p>Cada receta trae su costeo. Cambia los precios por los de tu ciudad en la Calculadora de Costos (Bono 01).</p></div>
</div>
<h3>Lo que vas a encontrar</h3>
<ul class="check">
  <li>La ciencia de la cremosidad explicada sin tecnicismos, con los cuatro pilares que evitan la cristalización.</li>
  <li>Una Base Universal con cada punto de control explicado y 11 sabores que parten de ella.</li>
  <li>Una base cocida para paletas cremosas y 4 paletas comerciales, incluidas paletas rellenas.</li>
  <li>Tabla de problemas y soluciones, vida útil, cadena de frío para domicilios y modelo de etiqueta.</li>
  <li>Costeo completo por receta: materia prima, costos indirectos, empaque, precio sugerido y margen.</li>
</ul>
<div class="nota"><p><b>Sobre los precios.</b> Todos los costos usan precios de referencia de supermercado y distribuidor de repostería en ciudad principal, noviembre de 2026. Varían según ciudad y temporada. El margen que aparece es <b>margen bruto</b>: descuenta ingredientes, empaque y un 10% de costos indirectos (gas, energía, agua, mermas), pero no tu tiempo ni los domicilios.</p></div>
<div class="alerta"><p><b>Alérgenos.</b> Casi todas estas recetas contienen leche. Algunas contienen gluten (galletas), maní o licor. Cada receta lo indica en su ficha de conservación y debes informarlo en tu etiqueta.</p></div>`,
    },
    { tipo: 'indice' },

    // ------------------------------------------------------------------ CAP 1
    { tipo: 'capitulo', num: '01', titulo: 'La ciencia de la cremosidad', bajada: 'Por qué el helado casero se cristaliza y cómo evitarlo con ingredientes que consigues en cualquier supermercado.' },
    {
      tipo: 'texto',
      html: `
<p class="lead">Un helado es agua congelada rodeada de grasa, azúcar, proteína y aire. La textura depende de un solo detalle: el tamaño de los cristales de hielo. Si son microscópicos, la lengua siente crema. Si crecen, la lengua siente arena o hielo raspado.</p>
<p>Las heladerías usan una máquina que bate mientras congela: el movimiento rompe los cristales mientras se forman y mete aire. En casa no tenemos ese movimiento, así que lo reemplazamos con formulación. El aire lo aportamos batiendo la crema antes de congelar, y el control de los cristales lo hacemos con cuatro pilares.</p>
<h2>Los cuatro pilares</h2>
<table class="t">
<thead><tr><th>Pilar</th><th>Qué hace</th><th>Si falta</th><th>Si sobra</th></tr></thead>
<tbody>
<tr><td><b>1. Grasa</b><br><em>crema de leche 35%</em></td><td>Recubre los cristales e impide que se unan. Atrapa el aire del batido y da la sensación de cremosidad.</td><td>Helado duro, cristalino y sin cuerpo. La crema no forma picos.</td><td>Sensación grasosa en el paladar. Si se sobrebate, se corta y forma mantequilla.</td></tr>
<tr><td><b>2. Azúcares</b><br><em>leche condensada, glucosa</em></td><td>Bajan el punto de congelación: a -18 °C una parte del agua sigue sin congelar, y eso hace que el helado se pueda servir.</td><td>Bloque de hielo que hay que dejar 20 minutos afuera.</td><td>Helado empalagoso que se derrite muy rápido y no mantiene la forma.</td></tr>
<tr><td><b>3. Sólidos lácteos</b><br><em>leche en polvo</em></td><td>Las proteínas y la lactosa absorben agua libre, la que de otra forma se convertiría en cristales.</td><td>Más cristales con el paso de los días.</td><td>Textura arenosa (la lactosa cristaliza). No pases de 40 g por tanda.</td></tr>
<tr><td><b>4. Aire</b><br><em>batido a picos suaves</em></td><td>Hace el helado ligero y fácil de servir. La crema bien batida casi duplica su volumen.</td><td>Helado compacto y pesado, tipo mantequilla congelada.</td><td>Si se bate de más, la crema se corta y el helado queda granuloso.</td></tr>
</tbody></table>
<div class="caja"><h3>Dato que te ahorra una tanda perdida</h3><p>En el supermercado hay varias "cremas de leche". Las cremas de mesa o semienteras, las más comunes en bolsa, tienen mucha menos grasa y <b>no forman picos</b>, por más que las batas. Busca en la etiqueta "para batir" o un contenido de grasa de 35% o más. Si dice "para cocinar" o no indica el porcentaje, no sirve para esta técnica.</p></div>`,
    },
    {
      tipo: 'texto',
      titulo: 'Los enemigos del helado cremoso',
      html: `
<div class="grid2">
  <div class="tarjeta"><h4>El agua libre</h4><p>Cada ingrediente con agua (fruta licuada, café, jugo) aporta cristales. Por eso en este manual las frutas siempre se cocinan para evaporar agua, y el café se disuelve en la mínima cantidad posible.</p></div>
  <div class="tarjeta"><h4>La congelación lenta</h4><p>Cuanto más se demora el helado en congelar, más tiempo tienen los cristales para crecer. Usa recipientes llanos, ponlos al fondo del congelador y no los tapes con otros alimentos.</p></div>
  <div class="tarjeta"><h4>El choque térmico</h4><p>Es el enemigo número uno en un negocio. Cada vez que abres el congelador o sacas el helado y lo vuelves a guardar, la superficie se derrite un poco y se recongela en cristales más grandes. Un helado perfecto el día 1 puede estar cristalizado el día 5 por esto.</p></div>
  <div class="tarjeta"><h4>El contacto con el aire</h4><p>El aire del congelador seca la superficie y forma una capa de escarcha. Siempre cubre el helado con papel film pegado directamente a la superficie, sin burbujas, antes de tapar.</p></div>
</div>
<h2>Las cinco armas anticristales</h2>
<ol>
<li><b>Glucosa líquida (o miel):</b> 30 g por tanda. Es un azúcar que baja el punto de congelación y no cristaliza. La consigues en tiendas de repostería. Con miel funciona igual, pero se nota su sabor.</li>
<li><b>Leche en polvo:</b> 30 g por tanda. Absorbe agua libre. Es el secreto de las fresas con crema espesas de los puestos callejeros, y funciona igual en helado.</li>
<li><b>Frutas reducidas:</b> cocina la fruta con su azúcar hasta que pierda cerca de la mitad de su peso. Concentras sabor y eliminas el agua que se volvería hielo.</li>
<li><b>Congelación rápida:</b> si tu congelador tiene función de congelación rápida o "turbo", actívala 2 horas antes. Un recipiente metálico preenfriado acelera la primera hora, que es la más importante.</li>
<li><b>Temperatura estable:</b> -18 °C o menos, sin abrir y cerrar. Un termómetro de congelador cuesta menos que una tanda perdida.</li>
</ol>
<div class="nota"><p><b>¿Y la sal?</b> Una pizca de sal no cambia la textura del helado. Se usa porque realza los sabores dulces y hace que el arequipe, el chocolate o el caramelo sepan más intensos. Úsala por sabor, no como estabilizante.</p></div>
<div class="alerta"><p><b>Sobre el licor.</b> El alcohol baja mucho el punto de congelación y suaviza el helado, pero solo lo uses en sabores para adultos (receta 12) y siempre declarado en la etiqueta. Nunca en productos para niños.</p></div>`,
    },

    // ------------------------------------------------------------------ CAP 2
    { tipo: 'capitulo', num: '02', titulo: 'Equipo, higiene y organización', bajada: 'Lo mínimo para producir con calidad constante y lo que sí vale la pena comprar.' },
    {
      tipo: 'texto',
      html: `
<table class="t">
<thead><tr><th>Equipo</th><th>Para qué</th><th>¿Indispensable?</th></tr></thead>
<tbody>
<tr><td>Batidora de mano eléctrica</td><td>Batir la crema a picos suaves en 3 a 4 minutos. A mano se puede, pero tarda 10 minutos y el resultado varía.</td><td>Sí</td></tr>
<tr><td>Balanza digital de cocina (precisión 1 g)</td><td>Pesar todo. Las tazas y cucharas varían hasta 30% y eso cambia la textura y el costo.</td><td>Sí</td></tr>
<tr><td>Bowl metálico o de vidrio grueso</td><td>Se enfría en el congelador y mantiene fría la crema mientras bates.</td><td>Sí</td></tr>
<tr><td>Espátula de silicona</td><td>Mezclar con movimientos envolventes sin sacar el aire.</td><td>Sí</td></tr>
<tr><td>Termómetro de congelador</td><td>Confirmar que tu congelador llega a -18 °C. Muchos congeladores de nevera doméstica no llegan.</td><td>Muy recomendado</td></tr>
<tr><td>Termómetro de cocina (de punzón)</td><td>Controlar la base cocida de las paletas (85 °C) y la temperatura de los rellenos.</td><td>Recomendado</td></tr>
<tr><td>Moldes de paleta y palitos</td><td>Paletas. Los moldes de silicona desmoldan más fácil; los rígidos dan formas más definidas.</td><td>Para paletas</td></tr>
<tr><td>Recipientes llanos metálicos o de vidrio</td><td>La primera congelación rápida de la base.</td><td>Recomendado</td></tr>
<tr><td>Nevera de icopor y pilas de gel</td><td>Domicilios. Sin esto, no vendas helado a domicilio.</td><td>Para vender</td></tr>
</tbody></table>
<h2>Higiene: reglas que no se negocian</h2>
<div class="dos-col">
<p><b>Lavado de manos</b> con jabón durante 20 segundos antes de empezar y cada vez que toques algo distinto (celular, dinero, basura).</p>
<p><b>Cabello recogido</b> y cubierto, uñas cortas sin esmalte, sin anillos ni pulseras mientras produces.</p>
<p><b>Superficies y utensilios</b> lavados y desinfectados. Una solución de hipoclorito según la indicación del fabricante funciona bien para superficies; enjuaga los utensilios que tocan el alimento.</p>
<p><b>Frutas desinfectadas</b> antes de pelarlas o picarlas, aunque luego las cocines.</p>
<p><b>Cadena de frío</b>: la crema y la leche condensada abierta van a la nevera. Nada lácteo se deja más de 30 minutos a temperatura ambiente.</p>
<p><b>Nunca recongeles</b> un helado que se derritió. Además de cristalizarse, es un riesgo sanitario.</p>
</div>
<div class="caja"><h3>Organiza tu jornada de producción</h3><p>La forma más eficiente de producir es por estaciones: primero todas las reducciones de fruta y salsas (se enfrían mientras haces lo demás), luego las bases, luego el armado y por último el empacado y etiquetado. Una persona sola puede producir 4 a 6 tandas (40 a 60 vasos) en una mañana con este orden.</p></div>`,
    },

    // ------------------------------------------------------------------ CAP 3
    { tipo: 'capitulo', num: '03', titulo: 'La Base Universal', bajada: 'Una sola base bien hecha te da todos los sabores del capítulo 4. Domínala primero.' },
    {
      tipo: 'receta',
      id: 'base',
      kicker: 'Receta base',
      titulo: 'Base Universal · Vainilla de la Casa',
      subtitulo: 'Cremosa directo del congelador, sin máquina. Se vende sola como vainilla y es el punto de partida de todos los sabores.',
      rinde: { porciones: 10, formato: 'vasos de 5 oz (120 ml)', formatoCorto: 'Vaso 5 oz' },
      tiempos: { activo: '15 min', espera: '6 h mínimo' },
      dificultad: 'Fácil',
      conservacion: 'Congelado a -18 °C, 3 semanas. Contiene leche.',
      ingredientes: [
        { n: 'Crema de leche para batir 35%', cant: 500, u: 'ml', ref: 'crema_batir', medida: 'muy fría, 8 h en nevera' },
        { n: 'Leche condensada', cant: 420, u: 'g', ref: 'condensada', medida: '1 doypack' },
        { n: 'Leche en polvo entera', cant: 30, u: 'g', ref: 'leche_polvo', medida: '3 cdas colmadas' },
        { n: 'Glucosa líquida o miel', cant: 30, u: 'g', ref: 'glucosa', medida: '2 cdas' },
        { n: 'Esencia de vainilla', cant: 5, u: 'ml', ref: 'vainilla', medida: '1 cdta' },
        { n: 'Sal fina', cant: 1, u: 'g', ref: 'sal', medida: '1 pizca' },
      ],
      pasos: [
        '<b>La noche anterior:</b> deja la crema en la parte más fría de la nevera (no en la puerta) mínimo 8 horas. La crema a 4 °C atrapa aire; la crema tibia no.',
        '<b>15 minutos antes:</b> mete el bowl y las aspas de la batidora al congelador. Activa la congelación rápida si tu congelador la tiene.',
        'En otro recipiente mezcla la leche condensada, la leche en polvo, la glucosa, la vainilla y la sal con un batidor de mano hasta que no queden grumos de leche en polvo. Reserva en la nevera.',
        'Vierte la crema fría en el bowl helado y bate a velocidad media. A los 2 minutos se ve espumosa; a los 3 a 4 minutos se marcan las líneas de las aspas.',
        '<b>Punto de control, picos suaves:</b> levanta las aspas. Se debe formar un pico que se dobla en la punta, como una ola. Detente ahí. Si el pico queda recto y firme, ya te pasaste un poco; si la crema se ve granulosa, se cortó.',
        'Agrega un tercio de la mezcla de condensada y une con espátula, con movimientos envolventes de abajo hacia arriba, girando el bowl. Repite con los otros dos tercios. Son unos 20 movimientos en total; para cuando no veas vetas.',
        'Vierte en recipientes llanos o directamente en los vasos. Golpea suavemente el recipiente contra el mesón para eliminar burbujas grandes.',
        'Cubre con papel film pegado a la superficie del helado, sin dejar aire, y luego tapa. Congela al fondo del congelador mínimo 6 horas. El punto óptimo de textura se logra a las 12 horas.',
      ],
      secreto: `<p><b>Agrega la condensada en tres partes, nunca toda de una vez.</b> La leche condensada es pesada: si la echas completa, hunde la crema y pierdes la mitad del aire que tanto trabajo te costó. En tres adiciones la mezcla conserva volumen y el helado queda más liviano y fácil de servir.</p><p>Un detalle más: si tu cocina está muy caliente (más de 26 °C), pon el bowl sobre otro bowl con hielo mientras bates. La crema arriba de 10 °C pierde la capacidad de formar picos.</p>`,
      errores: [
        ['La crema no forma picos', 'Crema con menos de 35% de grasa o tibia. Revisa la etiqueta y enfríala 8 horas. No tiene arreglo una vez batida tibia: úsala para cocinar.'],
        ['La crema se volvió granulosa o amarillenta', 'Se sobrebatió y empezó a formar mantequilla. Agrega 50 ml de crema líquida fría y bate a mano unos segundos; a veces se recupera. Para la próxima, detente en picos suaves.'],
        ['El helado quedó muy duro', 'Congelador por debajo de -22 °C, falta de glucosa o crema poco batida. Sácalo 5 minutos antes de servir y la próxima vez revisa los cuatro pilares.'],
        ['Se formaron cristales a los pocos días', 'Choque térmico o recipiente sin film a piel. Ver capítulo 1.'],
      ],
      variaciones: `<ul><li><b>Vainilla con galleta:</b> agrega 80 g de galleta María troceada al envasar.</li><li><b>Vainilla con chispas:</b> 80 g de chispas de chocolate en la última incorporación.</li><li><b>Base económica:</b> reemplaza la mitad de la crema por crema vegetal para batir. Bajas el costo y ganas volumen, pero el sabor es menos lácteo. Prueba ambas con tus clientes antes de cambiar.</li></ul>`,
      empaque: E5,
      precioVenta: 7000,
      formatoAlt: T500,
    },

    // ------------------------------------------------------------------ CAP 4
    { tipo: 'capitulo', num: '04', titulo: 'Sabores que se venden', bajada: 'Once sabores que parten de la Base Universal. Cada uno indica en qué momento de la receta base se agregan los ingredientes.' },
    {
      tipo: 'texto',
      html: `
<p>Todos los sabores de este capítulo siguen la misma lógica: preparas la Base Universal (receta 01) y en uno de tres momentos agregas el sabor. Si aprendes los tres momentos, puedes inventar sabores propios sin dañar la textura.</p>
<div class="grid3">
<div class="tarjeta"><h4>Momento A · En la condensada</h4><p>Ingredientes que deben quedar repartidos en todo el helado: cacao, café, arequipe disuelto, queso crema, mantequilla de maní. Se mezclan con la condensada en el paso 3, antes de unirla a la crema.</p></div>
<div class="tarjeta"><h4>Momento B · Al envasar</h4><p>Vetas y salsas: arequipe espeso, reducciones de fruta, chocolate. Se intercalan en capas en el recipiente y se dibujan con un cuchillo. Máximo tres pasadas para que la veta no desaparezca.</p></div>
<div class="tarjeta"><h4>Momento C · A la hora de congelado</h4><p>Trozos crocantes o pesados: galletas, chispas, bocadillo, pasas. Si los agregas al principio se hunden al fondo; a la hora de congelación la base ya tiene cuerpo para sostenerlos.</p></div>
</div>
<div class="caja"><h3>La regla del 20%</h3><p>Lo que agregues a una tanda de base (unos 1.300 ml) no debe pasar de 250 a 300 g en total. Si agregas más, diluyes la grasa y el azúcar y el helado empieza a cristalizarse. Si quieres más sabor, concentra el ingrediente (reduce la fruta, usa cacao en vez de chocolate de taza) en lugar de agregar más cantidad.</p></div>`,
    },
    {
      tipo: 'receta', id: 'arequipe', kicker: 'Sabor', titulo: 'Arequipe con Veteado Doble',
      subtitulo: 'El sabor más pedido en Colombia: base de arequipe y vetas doradas visibles en cada porción.',
      rinde: { porciones: 11, formato: 'vasos de 5 oz', formatoCorto: 'Vaso 5 oz' },
      tiempos: { activo: '20 min', espera: '6 h' }, dificultad: 'Fácil',
      conservacion: 'Congelado, 3 semanas. Contiene leche.',
      ingredientes: [
        BASE,
        { grupo: 'Sabor' },
        { n: 'Arequipe para la base (momento A)', cant: 100, u: 'g', ref: 'arequipe' },
        { n: 'Arequipe espeso para vetas (momento B)', cant: 150, u: 'g', ref: 'arequipe' },
        { n: 'Sal fina extra', cant: 1, u: 'g', ref: 'sal', medida: '1 pizca' },
      ],
      pasos: [
        'Prepara la Base Universal hasta el paso 3. Agrega a la mezcla de condensada los 100 g de arequipe y la pizca de sal extra; bate hasta que quede homogénea.',
        'Bate la crema a picos suaves e incorpora la mezcla de condensada con arequipe en tres partes (pasos 4 a 6 de la base).',
        'El arequipe de las vetas debe estar espeso y a temperatura ambiente. Si está frío y duro, dale 10 segundos de microondas y deja que se temple.',
        'Arma por capas: un tercio de la base, cucharaditas de arequipe repartidas, otro tercio, más arequipe, y termina con base.',
        'Introduce un cuchillo hasta el fondo y dibuja tres eses. No más: con cinco pasadas las vetas desaparecen.',
        'Cubre con film a piel y congela 6 horas. Para vasos individuales, arma las capas directamente en cada vaso con una cuchara pequeña.',
      ],
      secreto: '<p><b>La pizca de sal extra es lo que hace que este helado sepa a arequipe y no solo a dulce.</b> El arequipe tiene notas de caramelo que la sal resalta. Con arequipe en balde (Bono 02) el costo baja.</p>',
      empaque: E5, precioVenta: 7500, formatoAlt: { ...T500, equivalePorciones: 4.2, precio: 25000 },
    },
    {
      tipo: 'receta', id: 'chocolate', kicker: 'Sabor', titulo: 'Chocolate Intenso',
      subtitulo: 'Doble chocolate: cacao puro en la base y chocolate de cobertura en vetas crocantes.',
      rinde: { porciones: 11, formato: 'vasos de 5 oz', formatoCorto: 'Vaso 5 oz' },
      tiempos: { activo: '25 min', espera: '6 h' }, dificultad: 'Media',
      conservacion: 'Congelado, 3 semanas. Contiene leche.',
      ingredientes: [
        BASE,
        { grupo: 'Sabor' },
        { n: 'Cacao en polvo 100% sin azúcar', cant: 40, u: 'g', ref: 'cacao', medida: '4 cdas' },
        { n: 'Leche entera caliente', cant: 50, u: 'ml', ref: 'leche_entera' },
        { n: 'Chocolate de cobertura semiamargo', cant: 100, u: 'g', ref: 'chocolate' },
      ],
      pasos: [
        'Calienta la leche hasta que humee (sin hervir). Tamiza el cacao sobre ella y bate hasta tener una pasta lisa y brillante. Deja enfriar a temperatura ambiente.',
        'Prepara la mezcla de condensada de la Base Universal (paso 3) e intégrale la pasta de cacao.',
        'Bate la crema a picos suaves e incorpora la mezcla de chocolate en tres partes. Esta mezcla es más pesada que la de vainilla: hazlo con paciencia.',
        'Derrite el chocolate a baño maría o en microondas en tandas de 20 segundos. Déjalo bajar a unos 32 °C: tibio al tacto y todavía fluido.',
        'Envasa la base por capas y, entre capa y capa, deja caer hilos finos de chocolate con una cuchara. Al tocar el helado frío, el chocolate se solidifica en láminas crocantes.',
        'Cubre con film a piel y congela 6 horas.',
      ],
      secreto: '<p><b>Hidratar el cacao en leche caliente cambia el sabor por completo.</b> El cacao en polvo echado directo forma grumos y sabe a tierra. Al hidratarlo con un líquido caliente se liberan sus aromas y el color se vuelve más oscuro y profundo. Es la misma técnica que usan las chocolaterías para sus salsas.</p>',
      empaque: E5, precioVenta: 7500, formatoAlt: { ...T500, precio: 25000 },
    },
    {
      tipo: 'receta', id: 'galletas-crema', kicker: 'Sabor', titulo: 'Galletas y Crema',
      subtitulo: 'Base de vainilla con trozos de galleta de chocolate rellena. Favorito de niños y jóvenes.',
      rinde: { porciones: 11, formato: 'vasos de 5 oz', formatoCorto: 'Vaso 5 oz' },
      tiempos: { activo: '15 min', espera: '6 h' }, dificultad: 'Fácil',
      conservacion: 'Congelado, 2 semanas (la galleta se ablanda con el tiempo). Contiene leche y gluten.',
      ingredientes: [
        BASE,
        { grupo: 'Sabor' },
        { n: 'Galletas de chocolate rellenas, en trozos', cant: 150, u: 'g', ref: 'galleta_choco', medida: 'unas 14 galletas' },
        { n: 'Galletas molidas finas, para decorar', cant: 30, u: 'g', ref: 'galleta_choco', medida: '3 galletas' },
      ],
      pasos: [
        'Prepara la Base Universal completa y envásala en un recipiente llano grande (no en los vasos todavía).',
        'Parte las galletas en cuartos con la mano. No las licúes: el trozo es lo que el cliente busca al morder.',
        'Lleva la base al congelador 1 hora. Debe estar firme en los bordes y cremosa en el centro.',
        'Incorpora los trozos de galleta con la espátula en tres movimientos envolventes.',
        'Pasa a los vasos o tarrinas, espolvorea galleta molida encima, cubre con film a piel y termina de congelar 5 horas.',
      ],
      secreto: '<p><b>Agregar la galleta a la hora es lo que la mantiene entera y crocante.</b> En la base líquida la galleta se hunde, absorbe humedad y a las 24 horas es una pasta gris. Con la base semicongelada los trozos quedan suspendidos y conservan el contraste de textura por más días.</p>',
      empaque: E5, precioVenta: 7500, formatoAlt: { ...T500, precio: 25000 },
    },
    {
      tipo: 'receta', id: 'cheesecake', kicker: 'Sabor', titulo: 'Cheesecake de Frutos Rojos',
      subtitulo: 'Queso crema, salsa casera de mora y fresa, y migas de galleta.',
      rinde: { porciones: 12, formato: 'vasos de 5 oz', formatoCorto: 'Vaso 5 oz' },
      tiempos: { activo: '35 min', espera: '6 h' }, dificultad: 'Media',
      conservacion: 'Congelado, 3 semanas. Contiene leche y gluten.',
      ingredientes: [
        BASE,
        { n: 'Queso crema a temperatura ambiente', cant: 150, u: 'g', ref: 'queso_crema' },
        { n: 'Moras y fresas, mitad y mitad', cant: 300, u: 'g', ref: 'fresas' },
        { n: 'Azúcar', cant: 60, u: 'g', ref: 'azucar' },
        { n: 'Limón (el jugo)', cant: 30, u: 'g', ref: 'limones', medida: '½ limón' },
        { n: 'Galletas tipo María', cant: 60, u: 'g', ref: 'galleta_maria' },
        { n: 'Mantequilla derretida', cant: 20, u: 'g', ref: 'mantequilla' },
      ],
      pasos: [
        '<b>Salsa:</b> cocina las frutas picadas con el azúcar y el limón a fuego medio 12 a 15 minutos, hasta que pese unos 180 g. Nunca uses la fruta cruda: es casi 90% agua y en dos días se vuelve cristales. Cuela y enfría.',
        '<b>Migas:</b> tritura las galletas, mezcla con la mantequilla y tuesta en sartén 3 minutos a fuego bajo.',
        'Bate el queso crema (a temperatura ambiente, o quedarán grumos blancos) y agrégale poco a poco la mezcla de condensada de la Base Universal.',
        'Bate la crema a picos suaves e incorpora la mezcla de queso en tres partes.',
        'Arma por capas (base, salsa, migas) dos veces, vetea con dos pasadas, cubre con film a piel y congela 6 horas.',
      ],
      empaque: E5, precioVenta: 8000, formatoAlt: { ...T500, precio: 26000 },
    },
    {
      tipo: 'receta', id: 'cafe', kicker: 'Sabor', titulo: 'Café Moca',
      subtitulo: 'Café colombiano con un toque de cacao y chispas de chocolate. Pensado para adultos.',
      rinde: { porciones: 11, formato: 'vasos de 5 oz', formatoCorto: 'Vaso 5 oz' },
      tiempos: { activo: '15 min', espera: '6 h' }, dificultad: 'Fácil',
      conservacion: 'Congelado, 3 semanas. Contiene leche y cafeína.',
      ingredientes: [
        BASE,
        { grupo: 'Sabor' },
        { n: 'Café instantáneo', cant: 10, u: 'g', ref: 'cafe', medida: '3 cdas rasas' },
        { n: 'Agua hirviendo', cant: 15, u: 'ml', medida: '1 cda' },
        { n: 'Cacao en polvo 100%', cant: 10, u: 'g', ref: 'cacao', medida: '1 cda' },
        { n: 'Chispas de chocolate', cant: 70, u: 'g', ref: 'chispas' },
      ],
      pasos: [
        'Disuelve el café y el cacao en el agua hirviendo hasta formar una pasta espesa sin grumos. Deja enfriar.',
        'Mezcla la pasta con la mezcla de condensada de la Base Universal (paso 3).',
        'Bate la crema a picos suaves e incorpora en tres partes.',
        'Congela 1 hora, agrega las chispas con dos movimientos envolventes y envasa.',
        'Cubre con film a piel y termina de congelar 5 horas.',
      ],
      secreto: '<p><b>Una cucharada de agua, ni una más.</b> El instinto es preparar un tinto y echarlo al helado, pero 100 ml de café líquido son 100 ml de hielo futuro. Disolver el café instantáneo en la mínima cantidad de agua da sabor intenso sin cristales.</p>',
      variaciones: '<ul><li><b>Café con arequipe:</b> vetea con 120 g de arequipe espeso (momento B).</li></ul>',
      empaque: E5, precioVenta: 7500, formatoAlt: { ...T500, precio: 25000 },
    },
    {
      tipo: 'receta', id: 'queso-bocadillo', kicker: 'Sabor colombiano', titulo: 'Queso con Bocadillo',
      subtitulo: 'El sabor de la merienda de toda la vida: helado de queso crema con cubos y salsa de bocadillo veleño.',
      rinde: { porciones: 12, formato: 'vasos de 5 oz', formatoCorto: 'Vaso 5 oz' },
      tiempos: { activo: '25 min', espera: '6 h' }, dificultad: 'Fácil',
      conservacion: 'Congelado, 3 semanas. Contiene leche.',
      ingredientes: [
        BASE,
        { grupo: 'Sabor' },
        { n: 'Queso crema a temperatura ambiente', cant: 150, u: 'g', ref: 'queso_crema' },
        { n: 'Bocadillo para salsa', cant: 100, u: 'g', ref: 'bocadillo' },
        { n: 'Agua para la salsa', cant: 40, u: 'ml' },
        { n: 'Bocadillo en cubos de 1 cm', cant: 100, u: 'g', ref: 'bocadillo' },
      ],
      pasos: [
        '<b>Salsa:</b> derrite 100 g de bocadillo picado con el agua a fuego bajo, aplastando con un tenedor, hasta tener una salsa espesa y brillante (4 a 5 minutos). Enfría.',
        'Corta el resto del bocadillo en cubos de 1 cm y llévalos al congelador 30 minutos sueltos en un plato, para que no se peguen entre sí.',
        'Bate el queso crema hasta que esté liso y agrega la mezcla de condensada de la Base Universal poco a poco.',
        'Bate la crema a picos suaves e incorpora la mezcla de queso en tres partes. Congela 1 hora.',
        'Agrega los cubos fríos de bocadillo, arma por capas con la salsa y vetea con dos pasadas de cuchillo.',
        'Cubre con film a piel y termina de congelar 5 horas.',
      ],
      secreto: '<p><b>Este es tu sabor diferenciador.</b> Casi nadie lo vende y la gente lo pide por curiosidad y lo repite por nostalgia. En las fotos, deja un cubo de bocadillo y un hilo de salsa encima del vaso para que se entienda el sabor sin leer.</p>',
      empaque: E5, precioVenta: 8000, formatoAlt: { ...T500, precio: 26000 },
    },
    {
      tipo: 'receta', id: 'maracuya', kicker: 'Sabor frutal', titulo: 'Maracuyá Cremoso',
      subtitulo: 'Ácido y cremoso a la vez, con una veta de maracuyá reducido con semillas.',
      rinde: { porciones: 11, formato: 'vasos de 5 oz', formatoCorto: 'Vaso 5 oz' },
      tiempos: { activo: '25 min', espera: '6 h' }, dificultad: 'Media',
      conservacion: 'Congelado, 3 semanas. Contiene leche.',
      ingredientes: [
        BASE,
        { grupo: 'Reducción de maracuyá' },
        { n: 'Pulpa de maracuyá sin azúcar', cant: 250, u: 'g', ref: 'pulpa_maracuya' },
        { n: 'Azúcar', cant: 70, u: 'g', ref: 'azucar' },
        { n: 'Semillas de maracuyá (opcional, para decorar)', cant: null, medida: '1 cda' },
      ],
      pasos: [
        'Cocina la pulpa con el azúcar a fuego medio 10 a 12 minutos, revolviendo, hasta que pese unos 170 g y tenga textura de almíbar espeso. Enfría por completo.',
        'Separa un tercio de la reducción para las vetas. El resto mézclalo con la condensada de la Base Universal: verás que espesa al instante. Es normal, el ácido del maracuyá reacciona con la proteína de la leche.',
        'Bate la crema a picos suaves e incorpora la mezcla rápido, en tres partes, antes de que espese de más.',
        'Envasa por capas con la reducción reservada y vetea con dos pasadas.',
        'Decora con unas semillas, cubre con film a piel y congela 6 horas.',
      ],
      secreto: '<p><b>Que la reducción esté completamente fría antes de tocar la condensada.</b> Si está tibia, la leche se corta y verás pequeños grumos. Fría, el ácido solo espesa la mezcla y le da cuerpo extra al helado.</p>',
      variaciones: '<ul><li><b>Lulo cremoso:</b> la misma técnica con pulpa de lulo.</li><li><b>Maracuyá y chocolate blanco:</b> vetas de 80 g de chocolate blanco derretido a 30 °C.</li></ul>',
      empaque: E5, precioVenta: 7500, formatoAlt: { ...T500, precio: 25000 },
    },
    {
      tipo: 'receta', id: 'fresa', kicker: 'Sabor frutal', titulo: 'Fresa Natural',
      subtitulo: 'Fresa de verdad, rosada sin colorante, con trozos de mermelada casera.',
      rinde: { porciones: 11, formato: 'vasos de 5 oz', formatoCorto: 'Vaso 5 oz' },
      tiempos: { activo: '30 min', espera: '6 h' }, dificultad: 'Fácil',
      conservacion: 'Congelado, 3 semanas. Contiene leche.',
      ingredientes: [
        BASE,
        { grupo: 'Mermelada rápida' },
        { n: 'Fresas lavadas y desinfectadas', cant: 400, u: 'g', ref: 'fresas' },
        { n: 'Azúcar', cant: 80, u: 'g', ref: 'azucar' },
        { n: 'Limón (el jugo)', cant: 30, u: 'g', ref: 'limones', medida: '½ limón' },
      ],
      pasos: [
        'Pica las fresas en cuartos y cocínalas con el azúcar y el limón a fuego medio 15 minutos, hasta que la mezcla pese unos 250 g. Debe quedar como mermelada suelta.',
        'Enfría por completo. Licúa la mitad hasta tener un puré liso; deja la otra mitad con trozos.',
        'Mezcla el puré con la condensada de la Base Universal. El helado tomará un color rosado natural.',
        'Bate la crema a picos suaves e incorpora en tres partes.',
        'Envasa por capas con la mermelada con trozos, vetea con dos pasadas, cubre con film a piel y congela 6 horas.',
      ],
      secreto: '<p><b>El jugo de limón no es para que sepa a limón.</b> El ácido aviva el color rojo de la fresa al cocinarse y evita que se ponga café. Además resalta el sabor de la fruta. Si el cliente quiere el rosado más intenso, una gota de colorante es aceptable, pero entonces decláralo en la etiqueta.</p>',
      variaciones: '<ul><li><b>Mora:</b> la misma cantidad de mora, colada para quitar semillas.</li></ul>',
      empaque: E5, precioVenta: 7500, formatoAlt: { ...T500, precio: 25000 },
    },
    {
      tipo: 'receta', id: 'coco', kicker: 'Sabor', titulo: 'Coco Tostado',
      subtitulo: 'Coco del Caribe: leche de coco en la base y coco rallado tostado que cruje.',
      rinde: { porciones: 11, formato: 'vasos de 5 oz', formatoCorto: 'Vaso 5 oz' },
      tiempos: { activo: '20 min', espera: '6 h' }, dificultad: 'Fácil',
      conservacion: 'Congelado, 3 semanas. Contiene leche y coco.',
      ingredientes: [
        BASE,
        { grupo: 'Sabor' },
        { n: 'Leche de coco', cant: 120, u: 'ml', ref: 'leche_coco' },
        { n: 'Coco rallado deshidratado', cant: 80, u: 'g', ref: 'coco_rallado' },
      ],
      pasos: [
        'Tuesta el coco rallado en una sartén seca a fuego medio-bajo, revolviendo sin parar, 4 a 6 minutos, hasta que esté dorado claro y huela a galleta. Pásalo de inmediato a un plato para que no se queme con el calor residual.',
        'Reduce la leche de coco a fuego bajo hasta que queden unos 80 ml. Enfría.',
        'Mezcla la leche de coco reducida y la mitad del coco tostado con la condensada de la Base Universal.',
        'Bate la crema a picos suaves e incorpora en tres partes.',
        'Envasa, espolvorea el resto del coco tostado encima, cubre con film a piel y congela 6 horas.',
      ],
      secreto: '<p><b>Tostar el coco es lo que hace la diferencia.</b> El coco crudo aporta textura pero poco sabor; tostado libera aceites aromáticos que perfuman todo el helado. Guarda coco tostado en un frasco hermético y te dura un mes listo para decorar.</p>',
      empaque: E5, precioVenta: 7500, formatoAlt: { ...T500, precio: 25000 },
    },
    {
      tipo: 'receta', id: 'mani', kicker: 'Sabor', titulo: 'Maní con Chocolate',
      subtitulo: 'Mantequilla de maní en la base y vetas de chocolate. Un sabor que piden mucho los deportistas y los adolescentes.',
      rinde: { porciones: 11, formato: 'vasos de 5 oz', formatoCorto: 'Vaso 5 oz' },
      tiempos: { activo: '20 min', espera: '6 h' }, dificultad: 'Fácil',
      conservacion: 'Congelado, 3 semanas. Contiene leche y MANÍ.',
      ingredientes: [
        BASE,
        { grupo: 'Sabor' },
        { n: 'Mantequilla de maní cremosa', cant: 120, u: 'g', ref: 'mani_mantequilla' },
        { n: 'Chocolate de cobertura semiamargo', cant: 80, u: 'g', ref: 'chocolate' },
      ],
      pasos: [
        'Mezcla la mantequilla de maní con la condensada de la Base Universal hasta que no queden vetas. Si está muy dura, calienta la mantequilla de maní 10 segundos.',
        'Bate la crema a picos suaves e incorpora en tres partes.',
        'Derrite el chocolate y déjalo bajar a 32 °C.',
        'Envasa por capas con hilos finos de chocolate entre capa y capa.',
        'Cubre con film a piel y congela 6 horas.',
      ],
      secreto: '<p><b>El maní es uno de los alérgenos más peligrosos.</b> Produce este sabor al final de la jornada, lava todo muy bien después, y escribe "CONTIENE MANÍ" en la etiqueta con letra visible. Pregunta siempre por alergias al tomar pedidos para niños.</p>',
      empaque: E5, precioVenta: 8000, formatoAlt: { ...T500, precio: 26000 },
    },
    {
      tipo: 'receta', id: 'ron-pasas', kicker: 'Solo adultos', titulo: 'Ron con Pasas',
      subtitulo: 'El clásico de las heladerías de antes. El ron hace que sea el helado más suave del libro.',
      rinde: { porciones: 11, formato: 'vasos de 5 oz', formatoCorto: 'Vaso 5 oz' },
      tiempos: { activo: '15 min', espera: '12 h maceración + 6 h' }, dificultad: 'Fácil',
      conservacion: 'Congelado, 4 semanas. Contiene leche y LICOR.',
      ingredientes: [
        BASE,
        { grupo: 'Sabor' },
        { n: 'Uvas pasas', cant: 100, u: 'g', ref: 'pasas' },
        { n: 'Ron', cant: 60, u: 'ml', ref: 'ron' },
      ],
      pasos: [
        'La noche anterior pon las pasas en un frasco con el ron, tapa y deja macerar mínimo 12 horas a temperatura ambiente. Las pasas absorberán casi todo el líquido.',
        'Escurre las pasas y agrega el ron que sobre a la mezcla de condensada de la Base Universal.',
        'Bate la crema a picos suaves e incorpora en tres partes.',
        'Congela 1 hora, agrega las pasas con dos movimientos envolventes, envasa, cubre con film a piel y congela 6 horas más.',
      ],
      secreto: '<p><b>El alcohol no se congela a -18 °C.</b> Por eso este helado se sirve directo del congelador incluso semanas después. Esa misma propiedad hace que no debas pasar de 60 ml por tanda: con más ron el helado no endurece. Véndelo solo a adultos y etiquétalo "Contiene licor".</p>',
      empaque: E5, precioVenta: 8000, formatoAlt: { ...T500, precio: 26000 },
    },
    // ------------------------------------------------------------------ CAP 5
    { tipo: 'capitulo', num: '05', titulo: 'Paletas artesanales', bajada: 'El producto de mayor margen del libro: ingredientes baratos, venta por unidad y fácil de transportar.' },
    {
      tipo: 'texto',
      html: `
<p class="lead">Una paleta de agua bien hecha cuesta alrededor de mil pesos y se vende entre $3.500 y $4.500. Es el producto que más margen te deja, y además funciona para colegios, tiendas de barrio, eventos y cajas mixtas.</p>
<h2>Paletas de agua y paletas de crema</h2>
<div class="grid2">
<div class="tarjeta"><h4>Paletas de agua</h4><p>Fruta, agua y azúcar. La clave es el azúcar: entre 18% y 22% del peso total de la mezcla. Con menos, la paleta queda como un bloque de hielo que no se puede morder. Con más, no congela del todo y se derrite en la mano.</p><p><b>Prueba rápida:</b> la mezcla debe saberte un poco más dulce de lo que te gustaría. El frío adormece la lengua y en la paleta congelada se sentirá en su punto.</p></div>
<div class="tarjeta"><h4>Paletas de crema</h4><p>No se pueden hacer con la Base Universal batida: el aire hace que se rompan al morder y se suelten del palito. Usan una base cocida con leche, azúcar y fécula de maíz (receta 13), que es densa, cremosa y no forma cristales.</p><p><b>Ventaja:</b> la base cocida cuesta menos que la batida porque usa leche en lugar de casi toda la crema.</p></div>
</div>
<h3>Técnica para desmoldar sin romper</h3>
<ol>
<li>Sumerge el molde en agua tibia (no caliente) durante 10 a 15 segundos, sin que el agua llegue a los palitos.</li>
<li>Jala el palito con firmeza y de forma recta, sin girarlo.</li>
<li>Mete cada paleta de inmediato en su bolsa y devuélvela al congelador 30 minutos antes de guardarlas juntas, para que la superficie se vuelva a endurecer y no se peguen.</li>
</ol>
<div class="nota"><p><b>Moldes:</b> un molde de 10 cavidades de 80 ml te permite producir 40 paletas por día con cuatro tandas. Si vas a vender en volumen, compra 3 moldes: mientras uno congela, llenas el otro.</p></div>`,
    },
    {
      tipo: 'receta', id: 'base-cocida', kicker: 'Receta base', titulo: 'Base Cocida para Paletas de Crema',
      subtitulo: 'Densa, cremosa y resistente: se muerde sin romperse y no se cristaliza.',
      rinde: { porciones: 15, formato: 'paletas de 80 ml', unidadCosto: 'paleta (80 ml)' },
      tiempos: { activo: '25 min', espera: '4 h de nevera' }, dificultad: 'Media',
      conservacion: 'Nevera, 3 días antes de congelar. Contiene leche.',
      ingredientes: [
        { n: 'Leche entera fría', cant: 1000, u: 'ml', ref: 'leche_entera' },
        { n: 'Azúcar', cant: 180, u: 'g', ref: 'azucar' },
        { n: 'Fécula de maíz', cant: 30, u: 'g', ref: 'fecula_maiz', medida: '3 cdas' },
        { n: 'Leche en polvo entera', cant: 40, u: 'g', ref: 'leche_polvo', medida: '4 cdas' },
        { n: 'Crema de leche para batir', cant: 150, u: 'ml', ref: 'crema_batir' },
        { n: 'Esencia de vainilla', cant: 5, u: 'ml', ref: 'vainilla' },
        { n: 'Sal fina', cant: 1, u: 'g', ref: 'sal' },
      ],
      pasos: [
        'En una olla, mezcla en seco el azúcar, la fécula, la leche en polvo y la sal. Mezclar en seco evita los grumos de fécula.',
        'Agrega la leche fría poco a poco, batiendo con un batidor de mano, hasta disolver todo.',
        'Lleva a fuego medio revolviendo constantemente con espátula, raspando el fondo. A los 8 a 10 minutos la mezcla espesa ligeramente.',
        '<b>Punto de control:</b> 85 °C, o cuando cubra el dorso de una cuchara y el dedo deje una línea limpia. Sin hervir fuerte.',
        'Retira del fuego, agrega la crema y la vainilla y cuela para retirar cualquier grumo.',
        'Enfría rápido: pon la olla dentro de un recipiente con agua y hielo y revuelve 10 minutos. Luego cubre con film a piel y refrigera mínimo 4 horas antes de usar.',
      ],
      secreto: '<p><b>El reposo de 4 horas en nevera no es opcional.</b> En ese tiempo la proteína de la leche y la fécula terminan de absorber agua, y las paletas quedan más cremosas.</p>',
    },
    {
      tipo: 'receta', id: 'paleta-maracuya', kicker: 'Paleta', titulo: 'Maracuyá Rellena de Leche Condensada',
      subtitulo: 'Por fuera, paleta de agua ácida y refrescante. Por dentro, un corazón cremoso que no se congela del todo.',
      rinde: { porciones: 10, formato: 'paletas de 80 ml', formatoCorto: 'Paleta' },
      tiempos: { activo: '20 min', espera: '6 h' }, dificultad: 'Media',
      conservacion: 'Congelada, 4 semanas. Contiene leche.',
      ingredientes: [
        { n: 'Pulpa de maracuyá sin azúcar', cant: 350, u: 'g', ref: 'pulpa_maracuya' },
        { n: 'Agua', cant: 300, u: 'ml' },
        { n: 'Azúcar', cant: 120, u: 'g', ref: 'azucar' },
        { n: 'Leche condensada fría para el relleno', cant: 120, u: 'g', ref: 'condensada' },
      ],
      pasos: [
        'Disuelve el azúcar en el agua y mezcla con la pulpa. Prueba: debe estar un poco más dulce de lo que te gustaría.',
        'Llena las cavidades hasta tres cuartos y congela 60 a 90 minutos, hasta que se forme una pared congelada de 1 cm completo (si es más delgada, el relleno se sale) y el centro siga líquido.',
        'Voltea el molde sobre un recipiente para vaciar el centro líquido (guárdalo, lo vas a usar). Quedan paletas huecas.',
        'Rellena el hueco con leche condensada fría usando una manga o una bolsa con la punta cortada, hasta la mitad de la altura.',
        'Inserta los palitos y completa el llenado con el líquido de maracuyá que reservaste, para sellar el relleno.',
        'Congela 4 horas más, desmolda y empaca.',
      ],
      secreto: '<p><b>La leche condensada no se congela dura a -18 °C</b> por su alta concentración de azúcar. Por eso queda como un centro cremoso al morder. Esa sorpresa es la que hace que el cliente la recomiende: en tus videos, muestra la paleta mordida por la mitad.</p>',
      empaque: PALETA, precioVenta: 4000,
    },
    {
      tipo: 'receta', id: 'paleta-coco', kicker: 'Paleta', titulo: 'Paleta Cremosa de Coco',
      subtitulo: 'Base cocida con leche de coco y coco tostado. Sabe a cocada fría.',
      rinde: { porciones: 12, formato: 'paletas de 80 ml', formatoCorto: 'Paleta' },
      tiempos: { activo: '15 min', espera: '6 h' }, dificultad: 'Fácil',
      conservacion: 'Congelada, 4 semanas. Contiene leche y coco.',
      ingredientes: [
        { sub: 'base-cocida', fraccion: 0.6, n: 'Base cocida (receta 13)', cant: 750, u: 'ml', medida: '60% de una tanda' },
        { n: 'Leche de coco', cant: 200, u: 'ml', ref: 'leche_coco' },
        { n: 'Coco rallado tostado', cant: 50, u: 'g', ref: 'coco_rallado' },
      ],
      pasos: [
        'Tuesta el coco en sartén seca hasta que esté dorado claro. Enfría.',
        'Mezcla la base cocida fría con la leche de coco y dos tercios del coco tostado.',
        'Pon una cucharadita del coco restante en el fondo de cada cavidad del molde: quedará en la punta de la paleta.',
        'Llena el molde, inserta los palitos y congela 6 horas.',
        'Desmolda con agua tibia y empaca.',
      ],
      empaque: PALETA, precioVenta: 4500,
    },
    {
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
    },
    {
      tipo: 'receta', id: 'paleta-mango', kicker: 'Paleta', titulo: 'Mango Biche con Limón y Sal',
      subtitulo: 'El antojo de la calle convertido en paleta: ácida, salada y dulce a la vez.',
      rinde: { porciones: 12, formato: 'paletas de 80 ml', formatoCorto: 'Paleta' },
      tiempos: { activo: '20 min', espera: '6 h' }, dificultad: 'Fácil',
      conservacion: 'Congelada, 4 semanas. Sin lácteos.',
      ingredientes: [
        { n: 'Mango biche pelado', cant: 400, u: 'g', ref: 'mango_biche' },
        { n: 'Agua', cant: 450, u: 'ml' },
        { n: 'Azúcar', cant: 180, u: 'g', ref: 'azucar' },
        { n: 'Limones', cant: 150, u: 'g', ref: 'limones', medida: 'aprox. 60 ml de jugo' },
        { n: 'Sal fina', cant: 3, u: 'g', ref: 'sal', medida: '½ cdta' },
      ],
      pasos: [
        'Corta 100 g del mango en tiras delgadas o cubos pequeños y resérvalos.',
        'Licúa el resto del mango con el agua, el azúcar, el jugo de limón y la sal. Cuela si quedan fibras.',
        'Prueba: debe estar dulce, ácida y con un punto de sal apenas perceptible.',
        'Reparte los trozos de mango en las cavidades, llena con la mezcla, inserta los palitos y congela 6 horas.',
        'Desmolda con agua tibia y empaca.',
      ],
      secreto: '<p><b>Es la paleta sin lácteos del menú.</b> Ofrécela a quienes no consumen leche y destácalo en la etiqueta. Para una versión picante para adultos, agrega una pizca de ají en polvo a la mezcla.</p>',
      empaque: PALETA, precioVenta: 3500,
    },

    // ------------------------------------------------------------------ CAP 6
    { tipo: 'capitulo', num: '06', titulo: 'Problemas y soluciones', bajada: 'Diagnóstico rápido de los errores más comunes. Busca el síntoma y aplica la solución.' },
    {
      tipo: 'texto',
      html: `
<table class="t">
<thead><tr><th>Síntoma</th><th>Causa más probable</th><th>Solución</th></tr></thead>
<tbody>
<tr><td><b>Helado duro como piedra</b></td><td>Poco azúcar, sin glucosa, crema poco batida o congelador demasiado frío.</td><td>Agrega la glucosa, bate a picos suaves y sácalo 5 minutos antes de servir.</td></tr>
<tr><td><b>Cristales de hielo</b></td><td>Agua libre (fruta cruda, café líquido) o choque térmico.</td><td>Reduce la fruta, disuelve el café en mínima agua, no abras el congelador y usa film a piel.</td></tr>
<tr><td><b>Textura arenosa</b></td><td>Exceso de leche en polvo: la lactosa cristaliza.</td><td>No pases de 40 g de leche en polvo por tanda.</td></tr>
<tr><td><b>Helado grasoso o con grumos amarillos</b></td><td>Crema sobrebatida.</td><td>Detente en picos suaves. Bate a velocidad media, no máxima.</td></tr>
<tr><td><b>Se derrite muy rápido</b></td><td>Demasiado azúcar o licor, o crema con poca grasa.</td><td>Respeta las cantidades. Revisa que la crema sea de 35%.</td></tr>
<tr><td><b>Capa de escarcha encima</b></td><td>Contacto con el aire del congelador.</td><td>Film pegado a la superficie siempre. Recipientes llenos, sin espacio vacío.</td></tr>
<tr><td><b>Los trozos se fueron al fondo</b></td><td>Se agregaron con la base líquida.</td><td>Agrega los trozos a la hora de congelación (momento C).</td></tr>
<tr><td><b>Sabor a nevera</b></td><td>El helado absorbió olores de otros alimentos.</td><td>Recipientes herméticos y un congelador solo para tu producción si vas a vender.</td></tr>
<tr><td><b>La leche se cortó al agregar fruta</b></td><td>Fruta ácida tibia.</td><td>La reducción debe estar completamente fría antes de tocar la condensada.</td></tr>
<tr><td><b>Paleta que no se puede morder</b></td><td>Menos de 18% de azúcar.</td><td>Aumenta el azúcar. La mezcla debe saber un poco más dulce de lo normal.</td></tr>
<tr><td><b>Paleta que se suelta del palito</b></td><td>Palito puesto muy tarde o paleta con aire (base batida).</td><td>Pon el palito con la mezcla líquida y usa base cocida para paletas de crema.</td></tr>
</tbody></table>`,
    },

    // ------------------------------------------------------------------ CAP 7
    { tipo: 'capitulo', num: '07', titulo: 'Tu negocio de helados', bajada: 'Costos reales, precios, formatos, domicilios, etiqueta y normas para vender con tranquilidad.' },
    {
      tipo: 'resumen',
      titulo: 'Resumen de costos y márgenes',
      intro: '<p>Esta tabla reúne el costeo de todas las recetas de venta. Los costos incluyen ingredientes, 10% de indirectos y empaque. El margen es bruto: falta descontar tu tiempo, los domicilios y la publicidad.</p>',
    },
    {
      tipo: 'texto',
      html: `
<h2>Lo que dicen los números</h2>
<div class="grid2">
<div class="tarjeta"><h4>Las paletas son tu motor de margen</h4><p>Con márgenes de 70% o más, las paletas pagan los costos fijos del negocio. Véndelas por docena a tiendas, colegios y eventos, y como complemento en cada pedido.</p></div>
<div class="tarjeta"><h4>El helado cremoso sube el ticket</h4><p>La crema de leche de 35% es cara y eso pone el margen del helado batido cerca del 50%. No es malo: un pedido de 4 vasos deja más plata que 4 paletas. Úsalo para aumentar el valor de cada pedido.</p></div>
</div>
<h3>Cinco formas reales de mejorar el margen del helado</h3>
<ol>
<li><b>Compra al por mayor.</b> Crema, leche condensada y arequipe en presentaciones institucionales cuestan bastante menos por gramo. Revisa el Bono 02 (Directorio de Proveedores).</li>
<li><b>Base mixta.</b> La mitad de crema de leche y la mitad de crema vegetal para batir baja el costo de la base y aumenta el volumen. Haz una prueba ciega con 5 clientes antes de cambiar.</li>
<li><b>Precio por formato.</b> Ofrece vaso de 5 oz y tarrina de 500 ml. El cliente que compra tarrina paga más por pedido y te ahorra empaques.</li>
<li><b>Combos.</b> "4 vasos + 2 paletas" a precio cerrado sube el ticket y mueve tu producto de mayor margen.</li>
<li><b>Cero mermas.</b> Produce bajo pedido o por preventa. Un helado que se queda tres semanas en el congelador pierde calidad y es plata perdida.</li>
</ol>
<div class="alerta"><p><b>No compitas por precio.</b> Si en tu zona venden helado a $4.000, no bajes al mismo precio: tu producto es artesanal, con ingredientes reales. Compite por sabor, presentación y servicio, y muestra en tus fotos la diferencia.</p></div>`,
    },
    {
      tipo: 'texto',
      titulo: 'Cadena de frío y domicilios',
      html: `
<p>El helado es el producto más delicado para domicilio. Un helado que llega derretido y se vuelve a congelar en casa del cliente queda lleno de cristales, y el cliente culpa a tu receta.</p>
<div class="grid2">
<div><h3>Lo que necesitas</h3><ul class="check"><li>Nevera portátil de icopor o térmica con tapa ajustada.</li><li>Pilas de gel congeladas (mínimo 2 por nevera).</li><li>Termómetro para revisar que tu producto sale a -18 °C.</li><li>Bolsas térmicas para entregar al cliente.</li></ul></div>
<div><h3>Reglas de entrega</h3><ul><li>Máximo 40 minutos desde que sale de tu congelador.</li><li>Empaca de último, justo antes de salir.</li><li>Llena bien la nevera: el espacio vacío se calienta más rápido.</li><li>Pide al cliente que lo guarde en el congelador de inmediato y que lo saque 5 minutos antes de comer.</li></ul></div>
</div>
<h2>Vida útil de referencia</h2>
<table class="t"><thead><tr><th>Producto</th><th>Condición</th><th>Mejor calidad</th></tr></thead><tbody>
<tr><td>Helado batido (Base Universal y sabores)</td><td>-18 °C, film a piel, sin abrir</td><td>3 semanas</td></tr>
<tr><td>Helado con galletas o crocantes</td><td>-18 °C</td><td>2 semanas</td></tr>
<tr><td>Ron con pasas</td><td>-18 °C</td><td>4 semanas</td></tr>
<tr><td>Paletas de agua y de crema</td><td>-18 °C, en bolsa cerrada</td><td>4 semanas</td></tr>
<tr><td>Base cocida sin congelar</td><td>Nevera, 4 °C</td><td>3 días</td></tr>
<tr><td>Reducciones de fruta</td><td>Nevera, frasco cerrado</td><td>5 días</td></tr>
</tbody></table>
<p><em>Estos tiempos son de referencia para producción casera con buenas prácticas. Haz tus propias pruebas y, si tienes dudas, usa siempre el tiempo más corto.</em></p>`,
    },
    {
      tipo: 'texto',
      titulo: 'Etiqueta y normas para vender con tranquilidad',
      html: `
<div class="grid2">
<div>
<p>Una etiqueta clara protege a tu cliente y te protege a ti. Además hace que tu producto se vea profesional en la foto. Esta es la información mínima que debe llevar:</p>
<ul class="check"><li>Nombre del producto y de tu marca.</li><li>Ingredientes, de mayor a menor cantidad.</li><li>Alérgenos destacados: leche, gluten, maní, licor.</li><li>Fecha de elaboración y "consumir antes de".</li><li>"Mantener congelado a -18 °C. No volver a congelar una vez descongelado."</li><li>Tu número de contacto o tu cuenta de Instagram.</li></ul>
</div>
<div class="etiqueta-modelo">
<strong style="font-size:11pt">HELADO DE AREQUIPE · Emprende Dulce</strong><br>
<b>Ingredientes:</b> crema de leche, leche condensada, arequipe, leche en polvo, jarabe de glucosa, esencia de vainilla, sal.<br>
<b>Contiene: LECHE.</b><br>
Elaborado: 12/12/2026 · Consumir antes de: 02/01/2027<br>
Mantener congelado a -18 °C. No recongelar.<br>
Pedidos: 300 000 0000 · @tumarca
</div>
</div>
<h3>Lo que dice la norma en Colombia</h3>
<p>La Resolución 2674 de 2013 del Ministerio de Salud establece los requisitos sanitarios para quienes fabrican y venden alimentos. Entre ellos está que toda persona que manipula alimentos debe estar capacitada en manipulación higiénica. El curso de manipulación de alimentos es corto, económico y lo ofrecen entidades autorizadas en todas las ciudades; tenlo desde el primer día.</p>
<p>La Resolución 5109 de 2005 regula el rotulado o etiquetado de los alimentos envasados. Los helados son alimentos de mayor riesgo en salud pública. Si quieres vender en tiendas, cafeterías o supermercados, te pedirán registro sanitario del INVIMA.</p>
<div class="nota"><p><b>Antes de crecer, consulta.</b> Los requisitos para venta directa a pequeña escala dependen de tu municipio. Llama o visita la Secretaría de Salud de tu ciudad, explica tu proyecto y pregunta qué te exigen. Es gratis y te evita problemas.</p></div>`,
    },
    {
      tipo: 'texto',
      titulo: 'Plan de lanzamiento en 7 días',
      html: `
<table class="t"><thead><tr><th>Día</th><th>Qué hacer</th><th>Resultado</th></tr></thead><tbody>
<tr><td><b>1</b></td><td>Compra ingredientes para 3 tandas y verifica con termómetro que tu congelador llega a -18 °C.</td><td>Producción lista</td></tr>
<tr><td><b>2</b></td><td>Prepara Base Universal, Arequipe y una paleta. Anota tiempos y rendimiento real.</td><td>Primera producción</td></tr>
<tr><td><b>3</b></td><td>Prueba la textura a las 24 horas. Toma fotos con luz de ventana: un vaso servido, uno con cuchara, una paleta mordida.</td><td>Fotos para vender</td></tr>
<tr><td><b>4</b></td><td>Regala degustaciones a 10 personas (familia, vecinos, compañeros) y pídeles opinión y una foto o un mensaje.</td><td>Primeros testimonios</td></tr>
<tr><td><b>5</b></td><td>Ajusta precios con la Calculadora (Bono 01), diseña tu etiqueta y arma tu menú de 4 sabores y 2 paletas.</td><td>Menú y precios</td></tr>
<tr><td><b>6</b></td><td>Publica en tus estados de WhatsApp siguiendo el Bono 03 y abre preventa para el fin de semana.</td><td>Primeros pedidos</td></tr>
<tr><td><b>7</b></td><td>Produce solo lo vendido más un 10%. Entrega, pide reseña y anota qué sabor pidieron más.</td><td>Primeras ventas</td></tr>
</tbody></table>
<div class="caja"><h3>Empieza con un menú corto</h3><p>Cuatro sabores y dos paletas son suficientes para arrancar. Un menú corto reduce mermas, simplifica la compra de ingredientes y hace que el cliente decida más rápido. Rota un "sabor de la semana" para generar novedad sin complicar tu producción.</p></div>
<p class="firma">Gracias por confiar en Emprende Dulce. Ahora, a la cocina.</p>`,
    },
  ],
};
