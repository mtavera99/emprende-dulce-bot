// Libro 02 · Postres en Vaso para Emprender
const V7 = ['vaso7', 'cuchara', 'sticker'];
const CH = (f, ml) => ({ sub: 'chantilly', fraccion: f, n: 'Chantilly mixta (receta 02)', cant: ml, u: 'ml', medida: `${Math.round(f * 100)}% de una tanda` });
const BZ = (f, n) => ({ sub: 'bizcocho', fraccion: f, n: n || 'Bizcocho base en cubos (receta 01)', cant: null, medida: f === 1 ? '1 tanda' : `${Math.round(f * 100)}% de una tanda` });

module.exports = {
  id: 'postres',
  vol: '02',
  tema: { c1: '#5a1230', c2: '#22060f', c3: '#8a2a4a', oro: '#dcb36b', cinta: '#dcb36b', cintaTxt: '#2a1a08' },
  portada: { lineas: ['Postres en Vaso', 'para Emprender'], acento: 1, sub: 'Doce postres de alta rotación en vaso de 7 oz, con capas que no se mezclan y costeo completo en pesos colombianos.' },
  archivo: '02_Postres_en_Vaso_Para_Emprender',
  tituloCorto: 'Postres en vaso para emprender',
  fichaProduccion: true,
  color: '#6b2147',
  kicker: 'Recetario comercial',
  titulo: 'Postres en Vaso para Emprender',
  subtitulo: 'Doce postres de alta rotación en vaso de 7 oz, con capas que no se mezclan, vida útil probada en nevera y costeo completo en pesos colombianos.',
  datosPortada: [['12', 'Postres'], ['7 oz', 'Formato'], ['100%', 'Costeado en COP'], ['11', 'Sin horno']],

  secciones: [
    {
      tipo: 'texto',
      nuevaPagina: true,
      titulo: 'Antes de empezar',
      html: `
<p class="lead">El postre en vaso es el formato más fácil para empezar a vender: no hay que cortar porciones, se transporta bien, se ve en la foto y el cliente lo puede comer en cualquier parte. Este recetario está pensado para que cada vaso salga igual al anterior, porque esa constancia es lo que hace que te vuelvan a comprar.</p>
<div class="grid3">
  <div class="tarjeta"><div class="cifra">1</div><h4>Domina las dos bases</h4><p>El bizcocho y la chantilly mixta (capítulo 3) aparecen en la mitad de las recetas. Hazlas una vez a modo de práctica.</p></div>
  <div class="tarjeta"><div class="cifra">2</div><h4>Aprende a hacer capas</h4><p>El capítulo 2 explica cómo lograr capas limpias que se ven en la foto. Es lo que diferencia un postre casero de uno profesional.</p></div>
  <div class="tarjeta"><div class="cifra">3</div><h4>Vende por caja</h4><p>El capítulo 6 muestra por qué una caja de 4 vasos deja más ganancia y menos trabajo que 4 domicilios sueltos.</p></div>
</div>
<h3>Lo que vas a encontrar</h3>
<ul class="check">
  <li>Proporciones exactas por capa para un vaso de 7 oz y la técnica de armado limpio.</li>
  <li>Dos bases (bizcocho en horno o en sartén, y chantilly mixta estable) y diez postres comerciales.</li>
  <li>Nueve postres que no necesitan horno, y el bizcocho del tres leches también se puede hacer en sartén.</li>
  <li>Costeo de cada receta, resumen de márgenes, caja mixta costeada, vida útil y transporte.</li>
</ul>
<div class="nota"><p><b>Sobre los precios.</b> Los costos usan precios de referencia de supermercado y distribuidor de repostería en ciudad principal, noviembre de 2026. El margen que aparece es <b>margen bruto</b>: descuenta ingredientes, empaque y 10% de costos indirectos, pero no tu tiempo ni los domicilios.</p></div>
<div class="alerta"><p><b>Alérgenos.</b> Estas recetas contienen leche y la mayoría contiene gluten (galletas, bizcocho) y huevo. Cada ficha lo indica. Informa siempre en tu etiqueta.</p></div>`,
    },
    { tipo: 'indice' },

    // ------------------------------------------------------------------ CAP 1
    { tipo: 'capitulo', num: '01', titulo: 'Por qué el vaso', bajada: 'Las razones comerciales detrás del formato que más se vende por WhatsApp.' },
    {
      tipo: 'texto',
      html: `
<div class="grid2">
<div class="tarjeta"><h4>Cero mermas por corte</h4><p>Una torta entera se vende o se pierde. Una porción mal cortada no se puede vender. El vaso se produce en la cantidad exacta del pedido y cada unidad sale igual.</p></div>
<div class="tarjeta"><h4>Se vende por la foto</h4><p>El vaso transparente muestra las capas. En un estado de WhatsApp, un vaso con capas definidas comunica sabor y calidad antes de que el cliente lea el precio.</p></div>
<div class="tarjeta"><h4>Fácil de transportar</h4><p>Con tapa domo, el postre viaja en caja sin que se dañe la decoración. Un domiciliario puede llevar 12 vasos en una caja de cartón.</p></div>
<div class="tarjeta"><h4>Precio cerrado y claro</h4><p>El cliente sabe cuánto paga por unidad. Eso facilita los combos, las cajas mixtas y los pedidos de oficina.</p></div>
</div>
<h2>El vaso de 7 oz</h2>
<p>Un vaso PET de 7 onzas tiene unos 207 ml de capacidad. Lleno hasta 1 cm del borde y con la decoración dentro de la tapa domo, cabe una porción de 160 a 190 g según la densidad del postre. Es una porción generosa para una persona que no se siente costosa a $9.000 o $11.000.</p>
<table class="t"><thead><tr><th>Formato</th><th>Capacidad</th><th>Uso recomendado</th></tr></thead><tbody>
<tr><td>Vaso 5 oz</td><td>148 ml</td><td>Degustaciones, mesas de postres, combos para niños.</td></tr>
<tr><td><b>Vaso 7 oz</b></td><td><b>207 ml</b></td><td><b>Formato principal de este libro. Porción individual.</b></td></tr>
<tr><td>Vaso 9 oz</td><td>266 ml</td><td>Postres para compartir o versión "grande" con precio superior.</td></tr>
</tbody></table>
<div class="caja"><h3>Compra empaques por caja</h3><p>En supermercado un vaso con tapa domo cuesta cerca del doble que comprando la caja de 500 o 1.000 unidades en un distribuidor mayorista. Los costeos de este libro usan precio mayorista: revisa el Bono 02 para saber dónde comprar.</p></div>`,
    },

    // ------------------------------------------------------------------ CAP 2
    { tipo: 'capitulo', num: '02', titulo: 'Anatomía del vaso perfecto', bajada: 'Proporciones por capa y la técnica de armado que hace que las capas se vean limpias en la foto.' },
    {
      tipo: 'texto',
      html: `
<p class="lead">Un buen postre en vaso tiene contraste: algo húmedo, algo cremoso, algo crocante y algo fresco. Cuando falta uno, el postre se vuelve monótono a la tercera cucharada.</p>
<table class="t"><thead><tr><th>Capa</th><th>Función</th><th>Cantidad por vaso de 7 oz</th><th>Ejemplos</th></tr></thead><tbody>
<tr><td><b>Base</b></td><td>Estructura y textura</td><td>25 a 35 g</td><td>Bizcocho, galleta molida con mantequilla, soletas</td></tr>
<tr><td><b>Humedad</b></td><td>Jugosidad</td><td>40 a 80 ml</td><td>Mezcla tres leches, café, almíbar</td></tr>
<tr><td><b>Crema</b></td><td>El cuerpo del postre</td><td>60 a 90 g</td><td>Chantilly, mousse, crema de queso</td></tr>
<tr><td><b>Fruta o salsa</b></td><td>Frescura y color</td><td>20 a 40 g</td><td>Fresas, salsa de frutos rojos, reducción de maracuyá</td></tr>
<tr><td><b>Topping</b></td><td>La foto y el crocante</td><td>5 a 15 g</td><td>Copo de chantilly, cacao, galleta, barquillo</td></tr>
</tbody></table>
<h2>Las siete reglas de las capas limpias</h2>
<ol>
<li><b>Todo con manga pastelera.</b> Las cremas aplicadas con cuchara manchan las paredes del vaso. Con manga, la crema cae en el centro y se expande sola hasta el borde.</li>
<li><b>De lo más denso a lo más liviano.</b> Las capas pesadas (bizcocho mojado, cheesecake) van abajo; las livianas (chantilly, mousse) arriba. Al revés, se hunden.</li>
<li><b>Enfría entre capas.</b> Si una crema es suave, déjala 10 a 15 minutos en la nevera antes de poner la siguiente capa. Así no se mezclan.</li>
<li><b>Limpia las paredes.</b> Después de cada capa, pasa una toalla de papel enrollada por el borde interno del vaso. Es lo que ve el cliente.</li>
<li><b>Mira el vaso de lado.</b> Arma pensando en la cara que se va a ver en la foto: la capa de fruta pegada a la pared se ve más que la que queda al centro.</li>
<li><b>Deja 1 cm libre.</b> La decoración va dentro de la tapa domo, que no debe aplastarla.</li>
<li><b>Arma en línea.</b> Pon todos los vasos en fila y haz la misma capa en todos antes de pasar a la siguiente. Es más rápido y todos quedan iguales.</li>
</ol>
<h3>Equipo básico</h3>
<p>Mangas pasteleras desechables, duyas 1M (estrella abierta, para el copo clásico) y 2D (flor), balanza digital, espátula de silicona, batidora de mano y una bandeja que quepa en tu nevera con capacidad para 12 vasos.</p>`,
    },

    // ------------------------------------------------------------------ CAP 3
    { tipo: 'capitulo', num: '03', titulo: 'Las dos bases', bajada: 'Bizcocho y chantilly mixta: domínalas y tienes resuelta la mitad del recetario.' },
    {
      tipo: 'receta', id: 'bizcocho', kicker: 'Receta base', titulo: 'Bizcocho Base (Horno o Sartén)',
      subtitulo: 'Esponjoso, liviano y absorbente. La base del tres leches y de cualquier postre con bizcocho.',
      rinde: { porciones: 12, formato: 'vasos (30 g por vaso)', unidadCosto: 'vaso (30 g)' },
      tiempos: { activo: '20 min', espera: '18 min de horno' }, dificultad: 'Media',
      conservacion: 'Envuelto en film, 2 días a temperatura ambiente o 1 mes congelado. Contiene huevo y gluten.',
      ingredientes: [
        { n: 'Huevos a temperatura ambiente', cant: 4, u: 'un', ref: 'huevos' },
        { n: 'Azúcar', cant: 120, u: 'g', ref: 'azucar' },
        { n: 'Harina de trigo', cant: 120, u: 'g', ref: 'harina' },
        { n: 'Esencia de vainilla', cant: 5, u: 'ml', ref: 'vainilla' },
        { n: 'Sal fina', cant: 1, u: 'g', ref: 'sal' },
      ],
      pasos: [
        'Precalienta el horno a 180 °C. Forra una bandeja de 30 × 40 cm con papel de horno.',
        'Bate los huevos con el azúcar, la vainilla y la sal a velocidad alta durante 8 a 10 minutos.',
        '<b>Punto de letra:</b> la mezcla debe triplicar su volumen, verse blanca y, al levantar el batidor, el hilo que cae debe quedarse dibujado encima unos segundos.',
        'Cierne la harina sobre la mezcla en tres partes e incorpora con espátula, con movimientos envolventes, sin batir. Para cuando no veas harina seca.',
        'Extiende en la bandeja y hornea 15 a 18 minutos, hasta que esté dorado y al tocarlo vuelva a su forma.',
        '<b>Sin horno:</b> divide la mezcla en dos y cocina cada mitad en una sartén gruesa de 24 cm engrasada, tapada, a fuego mínimo, 20 a 25 minutos, hasta que la superficie no esté húmeda. No la voltees.',
        'Deja enfriar por completo antes de cortar en cubos de 2 cm o en discos del diámetro del vaso.',
      ],
      secreto: '<p><b>Los huevos a temperatura ambiente atrapan casi el doble de aire que los huevos de nevera.</b> Si se te olvidó sacarlos, ponlos 5 minutos en agua tibia. Y nunca abras el horno antes de 12 minutos: el bizcocho se baja y no se recupera.</p>',
    },
    {
      tipo: 'receta', id: 'chantilly', kicker: 'Receta base', titulo: 'Chantilly Mixta Estable',
      subtitulo: 'Sabor de crema de leche con la estabilidad y el rendimiento de la crema vegetal. Aguanta 3 días en nevera sin aguarse.',
      rinde: { porciones: 15, formato: 'porciones de 80 ml', unidadCosto: 'porción (80 ml)' },
      tiempos: { activo: '10 min', espera: '—' }, dificultad: 'Fácil',
      conservacion: 'Nevera, 3 días en manga cerrada. Contiene leche.',
      ingredientes: [
        { n: 'Crema vegetal para batir, muy fría', cant: 300, u: 'ml', ref: 'crema_vegetal' },
        { n: 'Crema de leche para batir 35%, muy fría', cant: 200, u: 'ml', ref: 'crema_batir' },
        { n: 'Azúcar glass', cant: 40, u: 'g', ref: 'azucar_glass', medida: 'ajusta según la crema vegetal' },
        { n: 'Esencia de vainilla', cant: 5, u: 'ml', ref: 'vainilla' },
      ],
      pasos: [
        'Enfría el bowl y las aspas 15 minutos en el congelador. Las dos cremas deben estar a 4 °C.',
        'Bate primero la crema vegetal a velocidad media durante 2 minutos, hasta que espese.',
        'Agrega la crema de leche, el azúcar glass y la vainilla y sigue batiendo a velocidad media-alta.',
        '<b>Punto de control:</b> picos firmes que no se doblan. Para manga y decoración necesitas este punto; para mezclar con mousses, detente un poco antes (picos suaves).',
        'Pasa a una manga con duya 1M, ciérrala con un gancho o liga y refrigera hasta usar.',
      ],
      secreto: '<p><b>Por qué mezclar las dos cremas.</b> La crema vegetal triplica su volumen y no se derrite con facilidad, pero sabe menos a leche. La crema de leche sabe mejor pero se baja en un día. Juntas, tienes buen sabor, buen rendimiento y un copo que se mantiene firme en la nevera de tu cliente. Revisa si tu crema vegetal ya viene endulzada: muchas sí, y en ese caso reduce el azúcar glass a la mitad.</p>',
      errores: [['La chantilly se cortó (granulosa)', 'Se sobrebatió o las cremas estaban tibias. Agrega 50 ml de crema líquida fría y mezcla a mano.'], ['No sube', 'Cremas tibias o crema de leche con poca grasa. Todo a 4 °C y crema de 35%.']],
    },

    // ------------------------------------------------------------------ CAP 4
    { tipo: 'capitulo', num: '04', titulo: 'Diez postres para vender', bajada: 'Cada receta rinde una bandeja completa, indica la vida útil real y trae su costeo.' },
    {
      tipo: 'receta', id: 'tres-leches', kicker: 'Clásico', titulo: 'Tres Leches en Vaso',
      subtitulo: 'Bizcocho empapado de verdad, chantilly firme y canela. El postre que más se vende en Colombia.',
      rinde: { porciones: 12, formato: 'vasos de 7 oz', formatoCorto: 'Vaso 7 oz' },
      tiempos: { activo: '30 min', espera: '4 h de nevera' }, dificultad: 'Media',
      conservacion: 'Nevera, 3 días. Contiene leche, huevo y gluten.',
      ingredientes: [
        BZ(1),
        { grupo: 'Mezcla tres leches' },
        { n: 'Leche condensada', cant: 420, u: 'g', ref: 'condensada' },
        { n: 'Leche evaporada', cant: 400, u: 'g', ref: 'evaporada' },
        { n: 'Crema de leche', cant: 250, u: 'ml', ref: 'crema_batir' },
        { n: 'Esencia de vainilla', cant: 5, u: 'ml', ref: 'vainilla' },
        { grupo: 'Para terminar' },
        CH(0.6, 700),
        { n: 'Canela molida', cant: 2, u: 'g', ref: 'canela' },
      ],
      pasos: [
        'Licúa las tres leches con la vainilla 30 segundos y refrigera. La mezcla debe estar fría al usarla.',
        'Pon 15 g de cubos de bizcocho en el fondo de cada vaso y presiona apenas con los dedos.',
        'Baña cada vaso con 40 ml de mezcla, en dos tandas, esperando 1 minuto entre una y otra para que el bizcocho absorba.',
        'Haz una capa de chantilly con la manga (unos 30 g), limpia el borde y pon otra capa de 15 g de bizcocho.',
        'Baña con otros 35 ml de mezcla. Refrigera 30 minutos para que se asiente.',
        'Termina con un copo de chantilly con duya 1M y espolvorea canela con un colador fino. Refrigera mínimo 4 horas antes de vender.',
      ],
      secreto: '<p><b>Bañar en dos tandas es lo que hace que el bizcocho quede empapado hasta el centro sin que la leche quede suelta en el fondo.</b> Un tres leches se juzga por la última cucharada: si queda seca, el cliente no repite. Si te sobra mezcla, guárdala y ofrece "extra leche" como adicional.</p>',
      variaciones: '<ul><li><b>Tres leches de arequipe:</b> licúa 120 g de arequipe con la mezcla.</li><li><b>Cuatro leches:</b> agrega una capa de arequipe sobre el primer bizcocho.</li><li><b>Tres leches de café:</b> 5 g de café instantáneo en la mezcla.</li></ul>',
      empaque: V7, precioVenta: 10000,
    },
    {
      tipo: 'receta', id: 'pie-limon', kicker: 'Sin horno', titulo: 'Pie de Limón',
      subtitulo: 'Crema de limón que espesa sola en minutos, base de galleta con mantequilla y chantilly con ralladura.',
      rinde: { porciones: 12, formato: 'vasos de 7 oz', formatoCorto: 'Vaso 7 oz' },
      tiempos: { activo: '25 min', espera: '3 h de nevera' }, dificultad: 'Fácil',
      conservacion: 'Nevera, 4 días. Contiene leche y gluten.',
      ingredientes: [
        { grupo: 'Base' },
        { n: 'Galletas tipo Ducales', cant: 180, u: 'g', ref: 'galleta_ducales' },
        { n: 'Mantequilla derretida', cant: 70, u: 'g', ref: 'mantequilla' },
        { grupo: 'Crema de limón' },
        { n: 'Leche condensada', cant: 840, u: 'g', ref: 'condensada', medida: '2 doypacks' },
        { n: 'Crema de leche', cant: 300, u: 'ml', ref: 'crema_batir' },
        { n: 'Limones (para 200 ml de jugo + ralladura)', cant: 550, u: 'g', ref: 'limones' },
        { grupo: 'Para terminar' },
        CH(0.3, 350),
      ],
      pasos: [
        'Lava los limones y ralla la cáscara de 2 antes de exprimirlos (solo la parte verde: lo blanco amarga). Exprime y cuela hasta tener 200 ml de jugo.',
        'Tritura las galletas, mezcla con la mantequilla y reparte 20 g en cada vaso. Presiona con el fondo de un vaso pequeño.',
        'Licúa la condensada con la crema 20 segundos. Con la licuadora a velocidad baja, agrega el jugo de limón en hilo. Verás cómo la mezcla espesa en segundos.',
        'Pasa la crema a una manga y reparte unos 95 g por vaso sobre la base. Golpea el vaso contra la mesa para nivelar.',
        'Refrigera 1 hora, decora con un copo de chantilly y ralladura de limón. Refrigera 2 horas más antes de vender.',
      ],
      secreto: '<p><b>La crema espesa sin gelatina ni calor porque el ácido del limón hace que la proteína de la leche condensada se espese.</b> Por eso el jugo debe ser recién exprimido y el limón, ácido: el jugo de botella tiene menos acidez y la crema queda líquida. Si la crema no espesa, agrega jugo de a 10 ml.</p>',
      variaciones: '<ul><li><b>Pie de maracuyá:</b> reemplaza el jugo de limón por 200 ml de pulpa de maracuyá colada.</li><li><b>Con merengue:</b> si tienes soplete, cambia la chantilly por merengue suizo flameado.</li></ul>',
      empaque: V7, precioVenta: 10000,
    },
    {
      tipo: 'receta', id: 'mousse-maracuya', kicker: 'Sin horno', titulo: 'Mousse de Maracuyá',
      subtitulo: 'Aireado, ácido y estable para viajar en domicilio, con espejo de maracuyá y semillas.',
      rinde: { porciones: 10, formato: 'vasos de 7 oz', formatoCorto: 'Vaso 7 oz' },
      tiempos: { activo: '30 min', espera: '4 h de nevera' }, dificultad: 'Media',
      conservacion: 'Nevera, 4 días. Contiene leche y gluten.',
      ingredientes: [
        { grupo: 'Base' },
        { n: 'Galletas tipo María', cant: 120, u: 'g', ref: 'galleta_maria' },
        { n: 'Mantequilla derretida', cant: 40, u: 'g', ref: 'mantequilla' },
        { grupo: 'Mousse' },
        { n: 'Gelatina sin sabor', cant: 7, u: 'g', ref: 'gelatina', medida: '1 sobre' },
        { n: 'Leche condensada', cant: 420, u: 'g', ref: 'condensada' },
        { n: 'Pulpa de maracuyá sin azúcar', cant: 250, u: 'g', ref: 'pulpa_maracuya' },
        { n: 'Crema de leche para batir', cant: 300, u: 'ml', ref: 'crema_batir' },
        { grupo: 'Espejo' },
        { n: 'Pulpa de maracuyá con semillas', cant: 100, u: 'g', ref: 'pulpa_maracuya' },
        { n: 'Azúcar', cant: 40, u: 'g', ref: 'azucar' },
      ],
      pasos: [
        'Base: tritura las galletas con la mantequilla y reparte 15 g por vaso, presionando.',
        'Hidrata la gelatina en 35 ml de agua fría 5 minutos y derrítela 10 segundos en microondas sin que hierva.',
        'Licúa la condensada con la pulpa y, con la licuadora andando, agrega la gelatina derretida.',
        'Bate la crema a picos suaves e incorpórala a la mezcla de maracuyá con espátula, en dos partes, con movimientos envolventes.',
        'Reparte con manga unos 100 g por vaso y refrigera 2 horas.',
        'Espejo: cocina la pulpa con semillas y el azúcar 3 minutos, enfría y vierte una capa fina sobre cada mousse. Refrigera 2 horas más.',
      ],
      secreto: '<p><b>La gelatina es tu seguro para domicilios en clima caliente.</b> Sin ella el mousse se sostiene en nevera, pero a 28 °C en la moto empieza a bajar en 20 minutos. Con un sobre para 10 vasos no se siente gelatinoso y llega firme.</p>',
      empaque: V7, precioVenta: 10000,
    },
    {
      tipo: 'receta', id: 'tiramisu', kicker: 'Sin horno', titulo: 'Tiramisú Exprés',
      subtitulo: 'Soletas con café, crema de queso suave y cacao amargo. Sin huevo crudo y sin licor.',
      rinde: { porciones: 10, formato: 'vasos de 7 oz', formatoCorto: 'Vaso 7 oz' },
      tiempos: { activo: '25 min', espera: '4 h de nevera' }, dificultad: 'Fácil',
      conservacion: 'Nevera, 3 días. Contiene leche, huevo, gluten y cafeína.',
      ingredientes: [
        { n: 'Café instantáneo', cant: 10, u: 'g', ref: 'cafe' },
        { n: 'Agua caliente', cant: 250, u: 'ml' },
        { n: 'Galletas soletas', cant: 200, u: 'g', ref: 'soletas' },
        { n: 'Queso crema a temperatura ambiente', cant: 400, u: 'g', ref: 'queso_crema' },
        { n: 'Azúcar glass', cant: 100, u: 'g', ref: 'azucar_glass' },
        { n: 'Crema de leche para batir', cant: 300, u: 'ml', ref: 'crema_batir' },
        { n: 'Esencia de vainilla', cant: 5, u: 'ml', ref: 'vainilla' },
        { n: 'Cacao en polvo 100%', cant: 15, u: 'g', ref: 'cacao' },
      ],
      pasos: [
        'Disuelve el café en el agua caliente y deja enfriar. Debe estar fuerte: es el sabor principal.',
        'Bate el queso crema con el azúcar glass y la vainilla hasta que esté liso y sin grumos.',
        'Bate la crema a picos suaves e incorpórala a la crema de queso con espátula, en dos partes.',
        'Parte las soletas a la medida del vaso, pásalas <b>un segundo</b> por el café de cada lado y pon una capa en el fondo.',
        'Cubre con crema de queso usando la manga, repite soletas y termina con crema. Alisa con una cuchara.',
        'Refrigera 4 horas. Justo antes de entregar, espolvorea cacao con un colador fino.',
      ],
      secreto: '<p><b>Un segundo en el café, no más.</b> La soleta sigue absorbiendo humedad de la crema durante horas. Si la empapas, a las 24 horas el fondo del vaso es una sopa. Y el cacao, siempre al final: en la nevera absorbe humedad, se oscurece y pierde el aspecto aterciopelado.</p>',
      empaque: V7, precioVenta: 11000,
    },
    {
      tipo: 'receta', id: 'fresas-crema', kicker: 'Sin horno', titulo: 'Fresas con Crema Gourmet',
      subtitulo: 'La crema espesa de los puestos callejeros más famosos, con fresas frescas y crocante de barquillo.',
      rinde: { porciones: 10, formato: 'vasos de 7 oz', formatoCorto: 'Vaso 7 oz' },
      tiempos: { activo: '25 min', espera: '1 h de nevera' }, dificultad: 'Fácil',
      conservacion: 'Nevera, 2 días máximo. Contiene leche y gluten.',
      ingredientes: [
        { n: 'Fresas', cant: 1000, u: 'g', ref: 'fresas' },
        { n: 'Crema de leche para batir', cant: 400, u: 'ml', ref: 'crema_batir' },
        { n: 'Leche condensada', cant: 210, u: 'g', ref: 'condensada', medida: '½ doypack' },
        { n: 'Leche en polvo entera', cant: 30, u: 'g', ref: 'leche_polvo', medida: '3 cdas' },
        { n: 'Barquillos', cant: 50, u: 'g', ref: 'barquillos' },
        { n: 'Leche condensada para decorar', cant: 60, u: 'g', ref: 'condensada' },
      ],
      pasos: [
        'Lava y desinfecta las fresas, sécalas muy bien con toalla de papel y córtalas en cuartos. Separa 10 fresas bonitas enteras para decorar.',
        'Bate la crema con la condensada y la leche en polvo hasta picos suaves. Debe quedar espesa pero fluida, tipo yogur griego.',
        'Arma: una capa de fresas pegadas a la pared del vaso (para la foto), crema, otra capa de fresas, crema.',
        'Termina con una fresa entera, un hilo de condensada y barquillo partido. Refrigera 1 hora.',
      ],
      secreto: '<p><b>La leche en polvo es el secreto del espesor</b> y además absorbe el jugo que sueltan las fresas. Seca muy bien las fresas después de lavarlas: el agua que queda es lo que hace que el postre se agüe. Este es el postre de vida más corta del libro; prodúcelo solo bajo pedido.</p>',
      variaciones: '<ul><li><b>Fresas con arequipe:</b> agrega una capa de arequipe en el fondo.</li><li><b>Duraznos con crema:</b> durazno en almíbar bien escurrido en lugar de fresa.</li></ul>',
      empaque: V7, precioVenta: 10000,
    },
    {
      tipo: 'receta', id: 'cheesecake-vaso', kicker: 'Sin horno', titulo: 'Cheesecake de Frutos Rojos',
      subtitulo: 'Cheesecake firme y cremoso sin hornear, sobre galleta con mantequilla y cubierto de salsa casera.',
      rinde: { porciones: 12, formato: 'vasos de 7 oz', formatoCorto: 'Vaso 7 oz' },
      tiempos: { activo: '35 min', espera: '5 h de nevera' }, dificultad: 'Media',
      conservacion: 'Nevera, 4 días. Contiene leche y gluten.',
      ingredientes: [
        { n: 'Galletas tipo María', cant: 150, u: 'g', ref: 'galleta_maria' },
        { n: 'Mantequilla derretida', cant: 60, u: 'g', ref: 'mantequilla' },
        { n: 'Queso crema a temperatura ambiente', cant: 400, u: 'g', ref: 'queso_crema' },
        { n: 'Leche condensada', cant: 210, u: 'g', ref: 'condensada' },
        { n: 'Limón (el jugo)', cant: 40, u: 'g', ref: 'limones' },
        { n: 'Gelatina sin sabor', cant: 7, u: 'g', ref: 'gelatina' },
        { n: 'Crema de leche para batir', cant: 250, u: 'ml', ref: 'crema_batir' },
        { n: 'Moras y fresas', cant: 300, u: 'g', ref: 'fresas' },
        { n: 'Azúcar (salsa)', cant: 80, u: 'g', ref: 'azucar' },
      ],
      pasos: [
        '<b>Salsa:</b> cocina las frutas picadas con el azúcar 12 minutos, aplastando, hasta que nape la cuchara. Enfría.',
        'Tritura las galletas con la mantequilla y reparte 18 g por vaso, presionando.',
        'Hidrata la gelatina en 35 ml de agua fría 5 minutos y derrítela 10 segundos en microondas.',
        'Bate el queso crema con la condensada y el jugo de limón hasta que esté liso. Agrega la gelatina derretida batiendo.',
        'Bate la crema a picos suaves e incorpórala con espátula. Reparte con manga 75 g por vaso y refrigera 3 horas.',
        'Cubre con 25 g de salsa fría por vaso y refrigera 2 horas más.',
      ],
      secreto: '<p><b>Mezcla la gelatina caliente con la crema de queso a temperatura ambiente, nunca fría.</b> Si el queso está frío, la gelatina se solidifica al tocarlo y forma hilos gomosos. Por eso el queso crema se saca de la nevera 1 hora antes.</p>',
      empaque: V7, precioVenta: 11000,
    },
    {
      tipo: 'receta', id: 'galletas-vaso', kicker: 'Sin horno', titulo: 'Galletas y Crema',
      subtitulo: 'Base crocante de galleta de chocolate, crema de queso y chantilly con trozos de galleta.',
      rinde: { porciones: 10, formato: 'vasos de 7 oz', formatoCorto: 'Vaso 7 oz' },
      tiempos: { activo: '20 min', espera: '2 h de nevera' }, dificultad: 'Fácil',
      conservacion: 'Nevera, 3 días. Contiene leche y gluten.',
      ingredientes: [
        { n: 'Galletas de chocolate rellenas', cant: 300, u: 'g', ref: 'galleta_choco', medida: 'unas 28 galletas' },
        { n: 'Mantequilla derretida', cant: 40, u: 'g', ref: 'mantequilla' },
        { n: 'Queso crema a temperatura ambiente', cant: 200, u: 'g', ref: 'queso_crema' },
        { n: 'Azúcar glass', cant: 40, u: 'g', ref: 'azucar_glass' },
        CH(0.8, 950),
      ],
      pasos: [
        'Separa 10 galletas enteras para decorar. Tritura 100 g de galletas finas, mézclalas con la mantequilla y reparte 12 g por vaso presionando.',
        'Parte el resto de las galletas en trozos medianos.',
        'Bate el queso crema con el azúcar glass hasta que esté liso. Incorpora la mitad de la chantilly con espátula y luego los trozos de galleta.',
        'Reparte con manga (de boca ancha, sin duya, para que pasen los trozos) unos 80 g por vaso.',
        'Termina con un copo de la chantilly restante, media galleta clavada y migas. Refrigera 2 horas.',
      ],
      secreto: '<p><b>La galleta entera clavada en el copo es la foto.</b> El cliente reconoce el sabor de un vistazo, sin leer. Este postre es el favorito de niños y adolescentes; ofrécelo en vaso de 5 oz para cumpleaños.</p>',
      empaque: V7, precioVenta: 10000,
    },
    {
      tipo: 'receta', id: 'mousse-chocolate', kicker: 'Sin horno', titulo: 'Mousse de Chocolate',
      subtitulo: 'Mousse intenso sin huevo, sobre galleta, con chispas y cacao. Para los fanáticos del chocolate.',
      rinde: { porciones: 10, formato: 'vasos de 7 oz', formatoCorto: 'Vaso 7 oz' },
      tiempos: { activo: '25 min', espera: '4 h de nevera' }, dificultad: 'Media',
      conservacion: 'Nevera, 4 días. Contiene leche y gluten.',
      ingredientes: [
        { n: 'Galletas tipo María', cant: 100, u: 'g', ref: 'galleta_maria' },
        { n: 'Mantequilla derretida', cant: 30, u: 'g', ref: 'mantequilla' },
        { n: 'Chocolate de cobertura semiamargo', cant: 200, u: 'g', ref: 'chocolate' },
        { n: 'Crema de leche caliente (ganache)', cant: 120, u: 'ml', ref: 'crema_batir' },
        { n: 'Crema de leche fría para batir', cant: 350, u: 'ml', ref: 'crema_batir' },
        { n: 'Azúcar glass', cant: 30, u: 'g', ref: 'azucar_glass' },
        { n: 'Chispas de chocolate', cant: 40, u: 'g', ref: 'chispas' },
        { n: 'Cacao en polvo para decorar', cant: 10, u: 'g', ref: 'cacao' },
      ],
      pasos: [
        'Tritura las galletas con la mantequilla y reparte 13 g por vaso, presionando.',
        '<b>Ganache:</b> calienta 120 ml de crema hasta que humee y viértela sobre el chocolate picado. Espera 2 minutos y mezcla desde el centro hasta tener una crema brillante.',
        'Deja que la ganache baje a unos 30 a 35 °C: tibia al tacto. Este punto es crítico.',
        'Bate la crema fría con el azúcar glass a picos suaves. Incorpora un tercio a la ganache con batidor de mano, y luego el resto con espátula.',
        'Reparte con manga 85 g por vaso, refrigera 4 horas y decora con chispas y cacao.',
      ],
      secreto: '<p><b>La temperatura de la ganache lo es todo.</b> Si está caliente, derrite la crema batida y el mousse queda líquido. Si está fría, el chocolate se solidifica en pequeños grumos al tocar la crema. Tibia al tacto, entre 30 y 35 °C, se unen perfectas.</p>',
      empaque: V7, precioVenta: 10000,
    },
    {
      tipo: 'receta', id: 'arroz-leche', kicker: 'Tradicional', titulo: 'Arroz con Leche Cremoso',
      subtitulo: 'El de la abuela, pero cremoso como se vende en las mejores postrerías. El margen más alto del libro.',
      rinde: { porciones: 12, formato: 'vasos de 7 oz', formatoCorto: 'Vaso 7 oz' },
      tiempos: { activo: '15 min', espera: '50 min de cocción' }, dificultad: 'Fácil',
      conservacion: 'Nevera, 4 días. Contiene leche.',
      ingredientes: [
        { n: 'Arroz blanco', cant: 250, u: 'g', ref: 'arroz' },
        { n: 'Agua', cant: 600, u: 'ml' },
        { n: 'Canela en astilla', cant: 6, u: 'g', ref: 'canela', medida: '2 astillas' },
        { n: 'Clavos de olor', cant: 1, u: 'g', ref: 'clavos', medida: '4 clavos' },
        { n: 'Leche entera', cant: 1500, u: 'ml', ref: 'leche_entera' },
        { n: 'Azúcar', cant: 120, u: 'g', ref: 'azucar' },
        { n: 'Leche condensada', cant: 210, u: 'g', ref: 'condensada' },
        { n: 'Uvas pasas (opcional)', cant: 50, u: 'g', ref: 'pasas' },
        { n: 'Canela molida para decorar', cant: 2, u: 'g', ref: 'canela' },
      ],
      pasos: [
        'Lava el arroz hasta que el agua salga casi clara. Cocínalo en el agua con la canela y los clavos a fuego medio hasta que se seque, unos 15 minutos.',
        'Agrega la leche y cocina a fuego bajo, revolviendo cada 3 o 4 minutos desde el fondo, durante 30 a 35 minutos.',
        'Cuando el arroz esté blando y la leche haya espesado, agrega el azúcar y las pasas y cocina 5 minutos más.',
        'Retira la canela y los clavos. Apaga y agrega la leche condensada.',
        '<b>Punto de control:</b> apaga cuando todavía se vea más líquido de lo que quieres. Al enfriar espesa mucho.',
        'Reparte en vasos, cubre con film a piel, enfría y espolvorea canela antes de entregar.',
      ],
      secreto: '<p><b>El azúcar se agrega al final, nunca al principio.</b> Si cocinas el arroz con azúcar desde el comienzo, el grano no se ablanda bien y queda duro por dentro. La leche condensada fuera del fuego le da la cremosidad que distingue el arroz con leche de venta del casero.</p>',
      empaque: V7, precioVenta: 8000,
    },
    {
      tipo: 'receta', id: 'banoffee', kicker: 'Sin horno', titulo: 'Banano, Arequipe y Galleta',
      subtitulo: 'La versión colombiana del banoffee: galleta, arequipe, banano y chantilly con cacao.',
      rinde: { porciones: 10, formato: 'vasos de 7 oz', formatoCorto: 'Vaso 7 oz' },
      tiempos: { activo: '20 min', espera: '1 h de nevera' }, dificultad: 'Fácil',
      conservacion: 'Nevera, 2 días (el banano se oscurece). Contiene leche y gluten.',
      ingredientes: [
        { n: 'Galletas tipo María', cant: 150, u: 'g', ref: 'galleta_maria' },
        { n: 'Mantequilla derretida', cant: 50, u: 'g', ref: 'mantequilla' },
        { n: 'Arequipe', cant: 400, u: 'g', ref: 'arequipe' },
        { n: 'Banano maduro firme', cant: 600, u: 'g', ref: 'banano', medida: '5 bananos' },
        { n: 'Limón (el jugo)', cant: 30, u: 'g', ref: 'limones' },
        CH(0.6, 700),
        { n: 'Cacao en polvo para decorar', cant: 8, u: 'g', ref: 'cacao' },
      ],
      pasos: [
        'Tritura las galletas con la mantequilla y reparte 18 g por vaso, presionando.',
        'Pon 40 g de arequipe por vaso con manga sobre la galleta.',
        'Corta los bananos en rodajas de 1 cm y mézclalas suavemente con el jugo de limón.',
        'Pon una capa de rodajas pegadas a la pared del vaso, cubre con chantilly y repite banano y chantilly.',
        'Decora con una rodaja, un hilo de arequipe y cacao tamizado. Refrigera 1 hora.',
      ],
      secreto: '<p><b>El limón evita que el banano se ponga negro</b> durante unas 24 a 48 horas en nevera. Usa bananos maduros pero firmes, con la cáscara amarilla sin manchas: los muy maduros sueltan líquido y se deshacen.</p>',
      empaque: V7, precioVenta: 9000,
    },
    {
      tipo: 'receta', id: 'marquesa-chocolate', kicker: 'Favorito del público', titulo: 'Marquesa de Chocolate Cremosa',
      subtitulo: 'Capas suaves de galleta mojada en leche y pudín sedoso de chocolate amargo con ganache.',
      rinde: { porciones: 10, formato: 'vasos de 7 oz', formatoCorto: 'Vaso 7 oz' },
      tiempos: { activo: '25 min', espera: '3 h de nevera' }, dificultad: 'Fácil',
      conservacion: 'Nevera, 5 días. Contiene leche y gluten.',
      ingredientes: [
        { n: 'Leche entera', cant: 600, u: 'ml', ref: 'leche_entera' },
        { n: 'Leche condensada', cant: 300, u: 'g', ref: 'condensada' },
        { n: 'Chocolate semiamargo', cant: 150, u: 'g', ref: 'chocolate' },
        { n: 'Cacao en polvo', cant: 30, u: 'g', ref: 'cacao' },
        { n: 'Fécula de maíz', cant: 40, u: 'g', ref: 'fecula_maiz' },
        { n: 'Mantequilla sin sal', cant: 30, u: 'g', ref: 'mantequilla' },
        { n: 'Galletas tipo María', cant: 160, u: 'g', ref: 'galleta_maria' },
        { n: 'Chispas de chocolate', cant: 50, u: 'g', ref: 'chispas' },
      ],
      pasos: [
        'Disuelve la fécula y el cacao en 150 ml de leche fría. Calienta el resto de la leche con la leche condensada.',
        'Vierte la mezcla de fécula a la leche caliente y cocina a fuego medio-bajo revolviendo hasta espesar.',
        'Retira del fuego, agrega el chocolate picado y la mantequilla. Revuelve hasta fundir por completo.',
        'Arma los vasos: vierte una capa de pudín tibio, una capa de galletas María mojadas en leche, y repite hasta el borde.',
        'Corona con una capa lisa de crema de chocolate y decora con chispas de chocolate. Refrigera 3 horas.',
      ],
      secreto: '<p><b>El pudín debe estar tibio al montar las capas</b> para que la galleta absorba la humedad suavemente sin necesidad de empaparla de más. Al enfriarse, la textura se compacta como una torta suave tipo marquesa.</p>',
      empaque: V7, precioVenta: 9500,
    },
    {
      tipo: 'receta', id: 'chocoflan-vaso', kicker: 'Dúo irresistible', titulo: 'Chocoflan Diplomático en Vaso',
      subtitulo: 'Bizcocho húmedo de chocolate, flan cremoso de vainilla, arequipe artesanal y chantilly.',
      rinde: { porciones: 10, formato: 'vasos de 7 oz', formatoCorto: 'Vaso 7 oz' },
      tiempos: { activo: '30 min', espera: '4 h de nevera' }, dificultad: 'Media',
      conservacion: 'Nevera, 4 días. Contiene leche, huevo y gluten.',
      ingredientes: [
        BZ(0.5, 'Bizcocho de chocolate en cubos'),
        { n: 'Leche entera', cant: 500, u: 'ml', ref: 'leche_entera' },
        { n: 'Leche condensada', cant: 250, u: 'g', ref: 'condensada' },
        { n: 'Queso crema', cant: 120, u: 'g', ref: 'queso_crema' },
        { n: 'Huevos', cant: 3, u: 'un', ref: 'huevos' },
        { n: 'Esencia de vainilla', cant: 10, u: 'ml', ref: 'vainilla' },
        { n: 'Arequipe artesanal', cant: 200, u: 'g', ref: 'arequipe' },
        CH(0.4, 450),
      ],
      pasos: [
        'Licúa la leche entera, la leche condensada, el queso crema, los huevos y la vainilla durante 1 minuto.',
        'Cocina la mezcla a fuego medio-bajo en olla a baño maría suave revolviendo hasta obtener una textura de flan cremoso espeso.',
        'Coloca en el fondo de cada vaso 20 g de arequipe artesanal como base caramelo.',
        'Añade una capa de bizcochuelo en cubos húmedos, cubre con el flan tibio y deja enfriar 15 minutos en nevera.',
        'Termina con un copo de chantilly mixta y un hilo fino de arequipe. Refrigera 4 horas.',
      ],
      secreto: '<p><b>El queso crema en la mezcla del flan</b> aporta consistencia sedosa y estabilidad para vaso sin necesidad de hornear al baño maría por horas, garantizando capas impecables y sabor a postre fino.</p>',
      empaque: V7, precioVenta: 10000,
    },

    // ------------------------------------------------------------------ CAP 5
    { tipo: 'capitulo', num: '05', titulo: 'Problemas y soluciones', bajada: 'Los errores que más se repiten y cómo corregirlos antes de la siguiente tanda.' },
    {
      tipo: 'texto',
      html: `
<table class="t"><thead><tr><th>Síntoma</th><th>Causa más probable</th><th>Solución</th></tr></thead><tbody>
<tr><td><b>Las capas se mezclaron</b></td><td>Crema muy suave o capa anterior sin enfriar.</td><td>Enfría 10 a 15 minutos entre capas y bate la crema a picos firmes.</td></tr>
<tr><td><b>Paredes del vaso manchadas</b></td><td>Crema aplicada con cuchara.</td><td>Manga pastelera siempre y toalla de papel en el borde después de cada capa.</td></tr>
<tr><td><b>La chantilly se bajó al día siguiente</b></td><td>Solo crema de leche, sin estabilizar.</td><td>Usa la chantilly mixta (receta 02).</td></tr>
<tr><td><b>Líquido en el fondo del tres leches</b></td><td>Bañado en una sola tanda o bizcocho muy denso.</td><td>Baña en dos tandas y revisa el punto de letra del bizcocho.</td></tr>
<tr><td><b>Bizcocho seco o duro</b></td><td>Exceso de horno o mezcla sobremezclada al agregar la harina.</td><td>Hornea solo hasta que vuelva a su forma al tocarlo. Harina con movimientos envolventes.</td></tr>
<tr><td><b>Pie de limón líquido</b></td><td>Jugo de limón poco ácido o de botella.</td><td>Limón recién exprimido. Agrega jugo de a 10 ml hasta que espese.</td></tr>
<tr><td><b>Mousse que se baja en el domicilio</b></td><td>Sin gelatina en clima caliente.</td><td>Un sobre de gelatina por cada 10 vasos.</td></tr>
<tr><td><b>Grumos o hilos en el cheesecake</b></td><td>Queso crema frío al agregar la gelatina.</td><td>Queso a temperatura ambiente, 1 hora fuera de la nevera.</td></tr>
<tr><td><b>Fresas con crema aguadas</b></td><td>Fresas mal secadas o postre armado con mucha anticipación.</td><td>Seca las fresas y arma el día de la entrega.</td></tr>
<tr><td><b>Cacao oscuro y húmedo</b></td><td>Se espolvoreó con mucha anticipación.</td><td>Cacao siempre justo antes de entregar.</td></tr>
</tbody></table>`,
    },

    // ------------------------------------------------------------------ CAP 6
    { tipo: 'capitulo', num: '06', titulo: 'Tu negocio de postres', bajada: 'Costos, cajas mixtas, vida útil, transporte, fotos y normas.' },
    {
      tipo: 'resumen',
      titulo: 'Resumen de costos y márgenes',
      intro: '<p>Costeo de todos los postres de venta del libro, con ingredientes, 10% de indirectos y empaque (vaso, tapa, cuchara y sticker). El margen es bruto: falta descontar tu tiempo, los domicilios y la publicidad.</p>',
    },
    {
      tipo: 'texto',
      html: `
<h2>Lo que dicen los números</h2>
<div class="grid2">
<div class="tarjeta"><h4>El arroz con leche es tu mejor margen</h4><p>Ingredientes baratos y alta aceptación. Inclúyelo siempre en tus cajas mixtas y en los pedidos de oficina.</p></div>
<div class="tarjeta"><h4>Los postres de queso crema son los más costosos</h4><p>Tiramisú y cheesecake usan queso crema, uno de los ingredientes más caros. Por eso tienen precio superior; preséntalos como tu línea "premium".</p></div>
</div>
<h3>Vida útil de referencia en nevera (4 °C)</h3>
<table class="t"><thead><tr><th>Postre</th><th>Vida útil</th><th>Postre</th><th>Vida útil</th></tr></thead><tbody>
<tr><td>Tres leches</td><td>3 días</td><td>Galletas y crema</td><td>3 días</td></tr>
<tr><td>Pie de limón</td><td>4 días</td><td>Mousse de chocolate</td><td>4 días</td></tr>
<tr><td>Mousse de maracuyá</td><td>4 días</td><td>Arroz con leche</td><td>4 días</td></tr>
<tr><td>Tiramisú</td><td>3 días</td><td>Banano, arequipe y galleta</td><td>2 días</td></tr>
<tr><td>Fresas con crema</td><td>2 días</td><td>Cheesecake</td><td>4 días</td></tr>
</tbody></table>
<p><em>Tiempos de referencia para producción casera con buenas prácticas y cadena de frío. Ante la duda, usa el tiempo más corto.</em></p>
<h3>Transporte</h3>
<ul>
<li>Nada de postres más de 2 horas fuera de la nevera, contando el trayecto.</li>
<li>Caja de cartón con divisiones o caja kraft de 4 con visor. Los vasos sueltos se voltean.</li>
<li>Para trayectos de más de 30 minutos o días de calor, bolsa térmica con una pila de gel.</li>
<li>Entrega con la instrucción: "Guárdalo en la nevera y consúmelo antes de" y la fecha.</li>
</ul>`,
    },
    {
      tipo: 'caja', id: 'caja-mixta', titulo: 'Caja Mixta de 4', subtitulo: 'El formato que más vende: cuatro sabores distintos, un solo domicilio, un precio cerrado.',
      items: [
        { receta: 'tres-leches', cantidad: 1, empaque: ['vaso7', 'cuchara'] },
        { receta: 'pie-limon', cantidad: 1, empaque: ['vaso7', 'cuchara'] },
        { receta: 'mousse-chocolate', cantidad: 1, empaque: ['vaso7', 'cuchara'] },
        { receta: 'arroz-leche', cantidad: 1, empaque: ['vaso7', 'cuchara'] },
      ],
      empaque: ['caja4', 'sticker', 'tarjeta'],
      precioVenta: 34000,
      html: `
<p>Vender vasos sueltos te obliga a hacer un domicilio por cada $10.000. La caja de 4 convierte cada entrega en un pedido de $34.000 y le da al cliente una razón para compartir o regalar.</p>
<h3>Cómo armarla</h3>
<ul class="check">
<li>Combina un clásico (tres leches), un ácido (pie de limón), un chocolate y tu producto de mejor margen (arroz con leche).</li>
<li>Un solo sticker de marca en la tapa de la caja, en lugar de uno por vaso.</li>
<li>Una tarjeta con tu nombre, tus redes y la frase "Guárdalo en la nevera y disfrútalo antes de...".</li>
</ul>
<h3>El precio</h3>
<p>Los cuatro vasos sueltos suman $38.000. La caja a $34.000 se siente como un ahorro claro para el cliente y te sigue dejando un buen margen porque ahorras tres stickers, tres domicilios y tiempo de atención.</p>
<div class="nota"><p><b>Caja de 6:</b> mismo principio, con dos sabores repetidos y precio de $49.000. Es ideal para oficinas y reuniones familiares.</p></div>`,
    },
    {
      tipo: 'texto',
      titulo: 'Fotos que venden por WhatsApp',
      html: `
<div class="grid2">
<div>
<h3>La luz</h3>
<p>Luz natural de ventana, de lado, entre las 9 de la mañana y las 3 de la tarde. Nunca flash ni la luz amarilla de la cocina. Si el sol entra directo, pon una cortina blanca o una hoja de papel para suavizarlo.</p>
<h3>El fondo</h3>
<p>Mesa de madera, mantel de lino o una cartulina blanca. Un solo elemento de apoyo: una fresa, una rama de canela, una cuchara. Nada de fondos con objetos de la casa.</p>
</div>
<div>
<h3>Las cuatro tomas que necesitas</h3>
<ol>
<li><b>De frente, a la altura del vaso:</b> muestra las capas. Es la foto principal.</li>
<li><b>Desde arriba a 45°:</b> muestra la decoración.</li>
<li><b>La cucharada:</b> una cuchara sacando postre, en video corto de 3 segundos.</li>
<li><b>La caja abierta:</b> los 4 vasos con la tarjeta. Es la foto que vende cajas.</li>
</ol>
</div>
</div>
<div class="caja"><p><b>Limpia el vaso antes de cada foto.</b> Una huella o una mancha de crema en la pared se ve enorme en la pantalla de un celular. Ten a mano una toalla de papel y alcohol antiséptico para el exterior del vaso.</p></div>`,
    },
    {
      tipo: 'texto',
      titulo: 'Etiqueta y normas',
      html: `
<div class="grid2">
<div>
<p>Cada vaso o caja debe informar:</p>
<ul class="check"><li>Nombre del producto y de tu marca.</li><li>Ingredientes de mayor a menor cantidad.</li><li>Alérgenos destacados: leche, huevo, gluten, cafeína.</li><li>Fecha de elaboración y "consumir antes de".</li><li>"Mantener refrigerado entre 0 °C y 4 °C".</li><li>Tu contacto.</li></ul>
</div>
<div class="etiqueta-modelo">
<strong style="font-size:11pt">TRES LECHES · Emprende Dulce</strong><br>
<b>Ingredientes:</b> leche condensada, leche evaporada, crema de leche, crema vegetal, huevo, harina de trigo, azúcar, vainilla, canela.<br>
<b>Contiene: LECHE, HUEVO, GLUTEN.</b><br>
Elaborado: 12/12/2026 · Consumir antes de: 15/12/2026<br>
Mantener refrigerado entre 0 °C y 4 °C.<br>
Pedidos: 300 000 0000 · @tumarca
</div>
</div>
<p>En Colombia, la Resolución 2674 de 2013 fija los requisitos sanitarios para fabricar y vender alimentos, incluida la capacitación en manipulación de alimentos de quien los prepara. Haz el curso de manipulación de alimentos antes de empezar a vender. La Resolución 5109 de 2005 regula el rotulado de alimentos envasados. Si vas a vender en tiendas o cafeterías te pueden pedir registro sanitario del INVIMA.</p>
<div class="nota"><p><b>Consulta en tu municipio.</b> Los requisitos para venta directa a pequeña escala dependen de la Secretaría de Salud de tu ciudad. Pregunta antes de crecer: es gratis y te evita problemas.</p></div>
<h3>Tu semana de producción</h3>
<table class="t"><thead><tr><th>Día</th><th>Tarea</th></tr></thead><tbody>
<tr><td><b>Lunes a miércoles</b></td><td>Publica en estados, toma pedidos y preventa de cajas para el fin de semana (ver Bono 03).</td></tr>
<tr><td><b>Miércoles</b></td><td>Cierra pedidos a las 6 p. m. y haz la lista de compras exacta.</td></tr>
<tr><td><b>Jueves</b></td><td>Compras en la mañana. En la tarde: bizcochos, salsas y arroz con leche.</td></tr>
<tr><td><b>Viernes</b></td><td>Armado de vasos en la mañana, refrigeración, empacado y primeras entregas en la tarde.</td></tr>
<tr><td><b>Sábado</b></td><td>Entregas, fotos de clientes, reseñas y registro de qué se vendió más.</td></tr>
</tbody></table>
<p class="firma">Gracias por confiar en Emprende Dulce. Que cada vaso salga igual de bonito que el primero.</p>`,
    },
  ],
};
