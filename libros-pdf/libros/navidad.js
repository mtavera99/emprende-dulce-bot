// Libro 03 · Recetario Navideño de Postres y Cajas Regalo para Vender
const NAT = (f, n) => ({ sub: 'natilla', fraccion: f, n: n || 'Natilla (receta 01)', cant: null });
const BUN = (f, n) => ({ sub: 'bunuelos', fraccion: f, n: n || 'Buñuelos (receta 02)', cant: null });

module.exports = {
  id: 'navidad',
  vol: '03',
  tema: { c1: '#124030', c2: '#06180f', c3: '#2d6b4c', oro: '#e2bd6e', cinta: '#b3192c', cintaTxt: '#fff' },
  portada: { lineas: ['Recetario Navideño', 'Postres y Cajas Regalo', 'para Vender'], acento: 2, sub: 'Natilla, buñuelos, brevas, trufas y torta negra, con tres cajas regalo costeadas y el calendario para vender en diciembre.' },
  archivo: '03_Recetario_Navideno_Postres_y_Cajas_Regalo',
  tituloCorto: 'Recetario navideño para vender',
  fichaProduccion: true,
  color: '#1f5135',
  kicker: 'Edición de temporada',
  titulo: 'Recetario Navideño de Postres y Cajas Regalo para Vender',
  subtitulo: 'Natilla, buñuelos, brevas, trufas, galletas y torta negra, con tres cajas regalo costeadas y el calendario para vender en novenas, prima y aguinaldos de fin de año.',
  datosPortada: [['9', 'Recetas'], ['3', 'Cajas regalo'], ['5', 'Semanas de plan'], ['100%', 'Costeado en COP']],

  secciones: [
    {
      tipo: 'texto',
      nuevaPagina: true,
      titulo: 'Antes de empezar',
      html: `
<p class="lead">Diciembre es la temporada en que más se compran dulces en Colombia. Las familias compran para las novenas, las empresas entregan aguinaldos y detalles navideños a sus equipos y clientes, y en las casas se celebran reuniones festivas. Este recetario está organizado para que llegues a esas fechas con producto listo, precios claros y pedidos cerrados.</p>
<div class="grid3">
  <div class="tarjeta"><div class="cifra">1</div><h4>Mira el calendario</h4><p>El capítulo 1 tiene el plan semana por semana desde mediados de noviembre hasta el 24 de diciembre.</p></div>
  <div class="tarjeta"><div class="cifra">2</div><h4>Produce lo que dura</h4><p>Trufas, galletas, torta negra y chocolate en frasco se producen con anticipación. Natilla y buñuelos, bajo pedido.</p></div>
  <div class="tarjeta"><div class="cifra">3</div><h4>Vende en caja</h4><p>Tres cajas costeadas (capítulo 4) para regalo personal, novena familiar y empresas.</p></div>
</div>
<h3>Lo que vas a encontrar</h3>
<ul class="check">
  <li>Los clásicos de novena: natilla, buñuelos que no se revientan, dulce de brevas con arequipe y el Vaso Novena.</li>
  <li>Cinco dulces de larga vida pensados para cajas regalo.</li>
  <li>Una ficha de producción por receta con cantidades para producir el doble y el triple.</li>
  <li>Tres cajas regalo con costo, precio y margen, más el guion para vender a empresas.</li>
</ul>
<div class="nota"><p><b>Sobre los precios.</b> Todos los costos usan precios de referencia de supermercado y distribuidor de repostería en ciudad principal, noviembre de 2026. El margen que aparece es <b>margen bruto</b>: descuenta ingredientes, empaque y 10% de costos indirectos, pero no tu tiempo ni los domicilios.</p></div>
<div class="alerta"><p><b>Alérgenos.</b> Casi todas las recetas contienen leche; varias contienen gluten, huevo y coco. La torta negra contiene vino. Cada ficha lo indica y debes declararlo en tu etiqueta.</p></div>`,
    },
    { tipo: 'indice' },

    // ------------------------------------------------------------------ CAP 1
    { tipo: 'capitulo', num: '01', titulo: 'La temporada', bajada: 'Quién compra, cuándo compra y qué tienes que tener listo en cada semana.' },
    {
      tipo: 'texto',
      html: `
<h2>Las fechas que mueven la venta</h2>
<table class="t"><thead><tr><th>Fecha</th><th>Qué pasa</th><th>Qué vender</th></tr></thead><tbody>
<tr><td><b>Finales de noviembre a mediados de diciembre</b></td><td>Las empresas cotizan aguinaldos para empleados y las familias buscan detalles navideños.</td><td>Caja Mini Detalle, Caja Ejecutiva, pedidos por volumen.</td></tr>
<tr><td><b>7 de diciembre</b> (lunes)</td><td>Noche de velitas. Reuniones familiares y de vecinos.</td><td>Natilla, buñuelos, Vaso Novena.</td></tr>
<tr><td><b>Primera quincena de diciembre</b></td><td>Se paga la prima de servicios; la ley fija como plazo el 20 de diciembre. Hay más dinero disponible para regalos.</td><td>Todas las cajas. Es el mejor momento para la preventa.</td></tr>
<tr><td><b>16 al 24 de diciembre</b></td><td>Novena de aguinaldos: nueve noches de reunión con algo dulce para compartir.</td><td>Caja Novena, natilla, buñuelos y brevas bajo pedido diario.</td></tr>
<tr><td><b>24 y 31 de diciembre</b></td><td>Cenas familiares de Nochebuena y Año Nuevo.</td><td>Mini tortas negras, brevas, cajas para llevar de visita.</td></tr>
</tbody></table>
<h2>Plan de cinco semanas</h2>
<table class="t"><thead><tr><th>Semana</th><th>Objetivo</th><th>Tareas</th></tr></thead><tbody>
<tr><td><b>16 al 22 de noviembre</b></td><td>Probar y fotografiar</td><td>Haz una tanda de prueba de cada receta. Toma fotos de producto y de cada caja armada. Arma tu catálogo con precios.</td></tr>
<tr><td><b>23 al 29 de noviembre</b></td><td>Abrir ventas corporativas</td><td>Envía el catálogo a empresas y oficinas conocidas (guion en el capítulo 5). Publica la Caja Mini Detalle para aguinaldos y obsequios personales.</td></tr>
<tr><td><b>30 de nov. al 6 de dic.</b></td><td>Preventa y cierre</td><td>Cierra pedidos corporativos con anticipo del 50%. Abre preventa de Caja Novena para el 16 de diciembre. Compra empaques al por mayor.</td></tr>
<tr><td><b>7 al 13 de diciembre</b></td><td>Producción de larga vida</td><td>Tortas negras, galletas, chocolate en frasco y trufas. Armado de cajas corporativas. Primeras entregas.</td></tr>
<tr><td><b>14 al 24 de diciembre</b></td><td>Entregas y novenas</td><td>Últimas entregas corporativas antes del 18. Natilla, buñuelos y brevas bajo pedido diario. Corte de pedidos cada día a las 12 m.</td></tr>
</tbody></table>
<div class="caja"><h3>Regla de oro de la temporada</h3><p>No produzcas sin pedido pagado. En diciembre todo el mundo pregunta y muchos no compran. La preventa con anticipo te dice exactamente cuánto producir, te da el dinero para comprar ingredientes y te protege de quedarte con cajas sin vender el 24.</p></div>`,
    },

    // ------------------------------------------------------------------ CAP 2
    { tipo: 'capitulo', num: '02', titulo: 'Los clásicos de novena', bajada: 'Las recetas que la gente busca en diciembre. Hechas bien, son la razón por la que te vuelven a pedir el año siguiente.' },
    {
      tipo: 'receta', id: 'natilla', kicker: 'Clásico', titulo: 'Natilla Tradicional con Panela',
      subtitulo: 'Firme para cortar, cremosa al morder, con canela, clavo y coco. La natilla de la casa, en tanda comercial.',
      rinde: { porciones: 20, formato: 'porciones de 120 g', formatoCorto: 'Porción 120 g (vaso)' },
      tiempos: { activo: '40 min', espera: '4 h de nevera' }, dificultad: 'Media',
      conservacion: 'Nevera, 4 días. Contiene leche y coco.',
      ingredientes: [
        { n: 'Leche entera', cant: 2000, u: 'ml', ref: 'leche_entera' },
        { n: 'Panela', cant: 500, u: 'g', ref: 'panela', medida: '1 bloque' },
        { n: 'Agua para el melado', cant: 250, u: 'ml' },
        { n: 'Fécula de maíz', cant: 250, u: 'g', ref: 'fecula_maiz' },
        { n: 'Canela en astillas', cant: 6, u: 'g', ref: 'canela', medida: '2 astillas' },
        { n: 'Clavos de olor', cant: 1, u: 'g', ref: 'clavos', medida: '5 clavos' },
        { n: 'Mantequilla', cant: 50, u: 'g', ref: 'mantequilla' },
        { n: 'Coco rallado (opcional)', cant: 80, u: 'g', ref: 'coco_rallado' },
      ],
      pasos: [
        'Pica la panela y derrítela en el agua a fuego medio hasta tener un melado sin trozos. Cuélalo.',
        'Disuelve la fécula en 500 ml de leche fría, revolviendo hasta que no queden grumos.',
        'Calienta los otros 1.500 ml de leche con la canela y los clavos hasta que humee. Retira las especias.',
        'Agrega el melado tibio a la leche caliente y luego la mezcla de fécula, revolviendo sin parar.',
        'Cocina a fuego medio-bajo revolviendo constantemente con cuchara de palo, raspando el fondo, durante 20 a 25 minutos.',
        '<b>Punto de control:</b> la natilla está lista cuando al pasar la cuchara se ve el fondo de la olla por un segundo y la mezcla se despega de las paredes. Agrega la mantequilla y el coco.',
        'Vierte en moldes humedecidos con agua o directamente en vasos. Deja enfriar, cubre con film y refrigera 4 horas.',
      ],
      secreto: '<p><b>Derretir la panela aparte en agua evita que la leche se corte.</b> Algunas panelas son ligeramente ácidas y, si las echas en bloque a la leche hirviendo, la cortan. Con el melado tibio agregado a la leche caliente, la mezcla queda lisa. Y no dejes de revolver: la natilla se pega en segundos y el sabor a quemado no tiene arreglo.</p>',
      errores: [['La natilla quedó blanda', 'Faltó cocción. Debe hervir suave al menos 10 minutos después de espesar para que la fécula termine de cuajar.'], ['Grumos', 'La fécula se agregó en polvo o la leche estaba muy caliente. Disuélvela siempre en leche fría.'], ['Sabor a quemado', 'Fuego alto o se dejó de revolver. Pasa la natilla a otra olla sin raspar el fondo.']],
      empaque: ['vaso7', 'cuchara', 'sticker'], precioVenta: 5000,
    },
    {
      tipo: 'receta', id: 'bunuelos', kicker: 'Clásico', titulo: 'Buñuelos que no se Revientan',
      subtitulo: 'Redondos, dorados parejos y huecos por dentro. Con la explicación de por qué se revientan y cómo evitarlo.',
      rinde: { porciones: 24, formato: 'buñuelos de 35 g', formatoCorto: 'Unidad' },
      tiempos: { activo: '50 min', espera: '—' }, dificultad: 'Media-alta',
      conservacion: 'Mejores el mismo día. Contienen leche y huevo. Sin harina de trigo.',
      ingredientes: [
        { n: 'Queso costeño rallado fino', cant: 500, u: 'g', ref: 'queso_costeno' },
        { n: 'Almidón de yuca', cant: 125, u: 'g', ref: 'almidon_yuca' },
        { n: 'Fécula de maíz', cant: 60, u: 'g', ref: 'fecula_maiz' },
        { n: 'Azúcar', cant: 30, u: 'g', ref: 'azucar', medida: '2 cdas' },
        { n: 'Polvo de hornear', cant: 4, u: 'g', ref: 'polvo_hornear', medida: '1 cdta rasa' },
        { n: 'Huevo', cant: 1, u: 'un', ref: 'huevos' },
        { n: 'Leche (la necesaria)', cant: 60, u: 'ml', ref: 'leche_entera' },
        { n: 'Aceite consumido en la fritura', cant: 300, u: 'ml', ref: 'aceite', medida: 'en olla con 1,5 L' },
      ],
      pasos: [
        'Prueba el queso: si es muy salado, reemplaza 150 g por queso campesino o cuajada. Rállalo lo más fino posible.',
        'Mezcla el queso con el almidón, la fécula, el azúcar y el polvo de hornear. Agrega el huevo y amasa con las manos.',
        'Agrega la leche de a cucharada. <b>Punto de la masa:</b> suave, que no se pegue a las manos y que al formar una bola no se agriete.',
        'Forma bolas de 35 g rodándolas entre las palmas hasta que estén completamente lisas, sin grietas ni pliegues.',
        'Calienta el aceite en una olla honda a 150 °C. Sin termómetro: una bolita de masa debe irse al fondo y subir lentamente en unos 10 segundos.',
        'Fríe 6 a 8 buñuelos a la vez. Se hunden, suben y empiezan a girar solos. Déjalos 10 a 12 minutos hasta que estén dorados parejos.',
        'Sácalos a papel absorbente. Véndelos tibios o el mismo día.',
      ],
      secreto: '<p><b>El buñuelo se revienta por una de tres razones:</b> aceite demasiado caliente (la costra se forma antes de que el interior se expanda), grietas en la bola (el vapor escapa por ahí) o masa seca. Con aceite a 150 °C y bolas lisas, el buñuelo crece despacio, se voltea solo y queda hueco por dentro. Usa una tapa de malla antisalpicaduras: un buñuelo que revienta lanza aceite caliente.</p>',
      errores: [['Crudos por dentro', 'Aceite muy caliente: se doran por fuera en 3 minutos. Baja el fuego y espera.'], ['Absorben mucho aceite', 'Aceite frío o masa muy húmeda. Vuelve a medir la temperatura.'], ['No se voltean solos', 'La olla está muy llena. Fríe menos unidades a la vez.']],
      empaque: ['bolsa_buñuelo'], precioVenta: 2500,
    },
    {
      tipo: 'receta', id: 'vaso-novena', kicker: 'Producto estrella', titulo: 'Vaso Novena',
      subtitulo: 'Natilla, crema de arequipe y buñuelo en un mismo vaso. La novena completa en una porción individual.',
      rinde: { porciones: 12, formato: 'vasos de 7 oz', formatoCorto: 'Vaso 7 oz' },
      tiempos: { activo: '25 min', espera: '1 h de nevera' }, dificultad: 'Fácil',
      conservacion: 'Nevera, 2 días (el buñuelo se pone y se vende el mismo día). Contiene leche, huevo y coco.',
      ingredientes: [
        NAT(0.5, 'Natilla recién hecha, aún tibia (receta 01)'),
        { n: 'Arequipe', cant: 250, u: 'g', ref: 'arequipe' },
        { n: 'Crema de leche para batir', cant: 250, u: 'ml', ref: 'crema_batir' },
        BUN(0.5, 'Buñuelos pequeños o mitades (receta 02)'),
        { n: 'Canela molida', cant: 2, u: 'g', ref: 'canela' },
      ],
      pasos: [
        'Prepara la natilla y, mientras está tibia y fluida, repártela en los vasos: unos 100 g por vaso. Golpea el vaso para nivelar y refrigera 1 hora.',
        'Bate la crema a picos suaves y agrega el arequipe en dos partes con espátula. Es una crema de arequipe liviana.',
        'Pon la crema de arequipe con manga y duya 1M sobre la natilla fría.',
        'Al momento de entregar, corona con un buñuelo pequeño (o medio buñuelo) y espolvorea canela.',
      ],
      secreto: '<p><b>La natilla se sirve en el vaso cuando todavía está tibia.</b> Si esperas a que cuaje en un molde, tendrás que cortarla y meterla a la fuerza, y el vaso se ve desordenado. Tibia, se nivela sola y forma una capa limpia. Si haces buñuelos pequeños de 20 g para este vaso, la presentación mejora mucho.</p>',
      variaciones: '<ul><li><b>Vaso Novena de brevas:</b> cambia el buñuelo por una breva con arequipe.</li><li><b>Versión para oficina:</b> en vaso de 5 oz, sin buñuelo, a menor precio.</li></ul>',
      empaque: ['vaso7', 'cuchara', 'sticker'], precioVenta: 10000,
    },
    {
      tipo: 'receta', id: 'brevas', kicker: 'Clásico', titulo: 'Dulce de Brevas con Arequipe',
      subtitulo: 'Brevas oscuras y brillantes en almíbar de panela, rellenas de arequipe. El postre de la abuela.',
      rinde: { porciones: 24, formato: 'brevas rellenas', formatoCorto: 'Unidad' },
      tiempos: { activo: '40 min', espera: '3 h de cocción + 1 noche' }, dificultad: 'Fácil',
      conservacion: 'Sin rellenar, en su almíbar en frasco y en nevera: 2 semanas. Rellenas: 4 días. Contiene leche.',
      ingredientes: [
        { n: 'Brevas frescas', cant: 1000, u: 'g', ref: 'brevas', medida: 'unas 24 brevas' },
        { n: 'Panela', cant: 500, u: 'g', ref: 'panela' },
        { n: 'Agua para el almíbar', cant: 1000, u: 'ml' },
        { n: 'Canela en astillas', cant: 6, u: 'g', ref: 'canela' },
        { n: 'Clavos de olor', cant: 1, u: 'g', ref: 'clavos' },
        { n: 'Arequipe para rellenar', cant: 300, u: 'g', ref: 'arequipe' },
      ],
      pasos: [
        'Lava las brevas, retira el tallo y hazles un corte en cruz en la punta, de 1 cm de profundidad.',
        'Cocínalas en agua hirviendo 15 minutos, bota el agua y repite una vez más con agua nueva. Esto retira el látex amargo de la cáscara.',
        'En otra olla prepara el almíbar: panela, agua, canela y clavos, hasta que la panela se disuelva.',
        'Pasa las brevas escurridas al almíbar y cocina a fuego bajo, sin tapar, de 2 a 3 horas, hasta que estén oscuras y el almíbar espese.',
        'Deja reposar las brevas en su almíbar toda la noche. Así terminan de absorber y se ponen brillantes.',
        'Escúrrelas, ábrelas un poco por la cruz y rellena con arequipe usando una manga.',
      ],
      secreto: '<p><b>El reposo de una noche en el almíbar es lo que las hace brillantes y jugosas.</b> Las brevas recién cocinadas se ven opacas. Además, como sin rellenar duran dos semanas en su almíbar, puedes cocinarlas una vez y rellenar solo lo que vendas cada día.</p>',
      empaque: ['capacillo'], precioVenta: 2500,
    },

    // ------------------------------------------------------------------ CAP 3
    { tipo: 'capitulo', num: '03', titulo: 'Dulces de larga vida para regalar', bajada: 'Se producen con anticipación, viajan bien y son la base de las cajas regalo.' },
    {
      tipo: 'receta', id: 'trufas', kicker: 'Para cajas', titulo: 'Trufas de Chocolate en Tres Coberturas',
      subtitulo: 'Ganache de chocolate semiamargo boleada a mano, en cacao, coco y grajeas navideñas.',
      rinde: { porciones: 40, formato: 'trufas de 15 g', formatoCorto: 'Unidad' },
      tiempos: { activo: '45 min', espera: '3 h de nevera' }, dificultad: 'Media',
      conservacion: 'Nevera en recipiente hermético, 10 días. Contiene leche y coco.',
      ingredientes: [
        { n: 'Chocolate de cobertura semiamargo', cant: 400, u: 'g', ref: 'chocolate' },
        { n: 'Crema de leche', cant: 200, u: 'ml', ref: 'crema_batir' },
        { n: 'Mantequilla a temperatura ambiente', cant: 30, u: 'g', ref: 'mantequilla' },
        { grupo: 'Coberturas' },
        { n: 'Cacao en polvo 100%', cant: 30, u: 'g', ref: 'cacao' },
        { n: 'Coco rallado', cant: 40, u: 'g', ref: 'coco_rallado' },
        { n: 'Grajeas navideñas', cant: 40, u: 'g', ref: 'grajeas' },
      ],
      pasos: [
        'Pica el chocolate fino. Calienta la crema hasta que humee y viértela encima. Espera 2 minutos.',
        'Mezcla desde el centro con espátula hasta tener una crema brillante. Agrega la mantequilla.',
        'Cubre con film a piel y refrigera 3 horas, hasta que esté firme como plastilina.',
        'Porciona con una cuchara medidora o con balanza: 15 g por trufa.',
        'Bolea rápido entre las palmas (con guantes de nitrilo, para no derretirla ni dejar huellas) y pasa de inmediato por la cobertura.',
        'Pon cada trufa en un capacillo y refrigera en recipiente hermético.',
      ],
      secreto: '<p><b>La proporción 2 a 1 (dos partes de chocolate por una de crema) da una trufa que se bolea fácil y no se derrite en la mano del cliente.</b> Si tu cocina está caliente, pon las porciones en la nevera 10 minutos antes de bolear. Si se pone muy dura, deja la ganache 15 minutos a temperatura ambiente.</p>',
      variaciones: '<ul><li><b>Trufa de café:</b> 5 g de café instantáneo disuelto en la crema caliente.</li><li><b>Trufa de ron (adultos):</b> 20 ml de ron en la ganache, declarado en la etiqueta.</li></ul>',
      empaque: ['capacillo'], precioVenta: 2000,
    },
    {
      tipo: 'receta', id: 'galletas', kicker: 'Para cajas', titulo: 'Galletas de Mantequilla Navideñas',
      subtitulo: 'Masa que no se deforma en el horno, glaseado sin huevo crudo que seca firme, y formas de temporada.',
      rinde: { porciones: 30, formato: 'galletas de 6 cm', formatoCorto: 'Unidad' },
      tiempos: { activo: '1 h', espera: '1 h de nevera + 8 h de secado' }, dificultad: 'Media',
      conservacion: 'Recipiente hermético a temperatura ambiente, 3 semanas. Contiene leche, huevo y gluten.',
      ingredientes: [
        { n: 'Mantequilla sin sal, blanda', cant: 250, u: 'g', ref: 'mantequilla' },
        { n: 'Azúcar glass', cant: 100, u: 'g', ref: 'azucar_glass' },
        { n: 'Huevo', cant: 1, u: 'un', ref: 'huevos' },
        { n: 'Esencia de vainilla', cant: 5, u: 'ml', ref: 'vainilla' },
        { n: 'Harina de trigo', cant: 380, u: 'g', ref: 'harina' },
        { n: 'Sal fina', cant: 1, u: 'g', ref: 'sal' },
        { grupo: 'Glaseado' },
        { n: 'Azúcar glass', cant: 250, u: 'g', ref: 'azucar_glass' },
        { n: 'Limón (el jugo)', cant: 30, u: 'g', ref: 'limones', medida: 'aprox. 2 cdas de jugo + agua' },
        { n: 'Grajeas navideñas', cant: 30, u: 'g', ref: 'grajeas' },
      ],
      pasos: [
        'Bate la mantequilla con el azúcar glass solo hasta integrar, sin airear de más. Agrega el huevo y la vainilla.',
        'Agrega la harina y la sal y mezcla con espátula hasta formar una masa. No amases.',
        'Estírala entre dos papeles de horno a 5 mm de grosor y refrigera la lámina 1 hora.',
        'Corta las figuras, pásalas a la bandeja y llévalas 10 minutos al congelador antes de hornear.',
        'Hornea a 170 °C de 10 a 12 minutos, hasta que los bordes estén apenas dorados. Enfría sobre rejilla.',
        'Glaseado: mezcla el azúcar glass con el jugo de limón y agua de a cucharadita hasta que, al dejar caer un hilo, desaparezca en 10 segundos. Decora y deja secar 8 horas.',
      ],
      secreto: '<p><b>La masa fría entra al horno fría.</b> Los 10 minutos de congelador antes de hornear hacen que la mantequilla no se derrita antes de que la harina se fije, y por eso la estrella sale con puntas definidas en lugar de una mancha redonda. Batir poco la mantequilla tiene el mismo objetivo: menos aire, menos deformación.</p>',
      empaque: ['bolsa_celofan'], precioVenta: 2500,
    },
    {
      tipo: 'receta', id: 'cocadas', kicker: 'Para cajas', titulo: 'Cocadas de Arequipe',
      subtitulo: 'Doradas por fuera, húmedas por dentro, sin horno. Un dulce costeño que encanta en las cajas.',
      rinde: { porciones: 25, formato: 'cocadas de 25 g', formatoCorto: 'Unidad' },
      tiempos: { activo: '30 min', espera: '1 h de enfriado' }, dificultad: 'Fácil',
      conservacion: 'Recipiente hermético a temperatura ambiente, 1 semana; en nevera, 2 semanas. Contiene leche y coco.',
      ingredientes: [
        { n: 'Coco rallado deshidratado', cant: 250, u: 'g', ref: 'coco_rallado' },
        { n: 'Arequipe', cant: 300, u: 'g', ref: 'arequipe' },
        { n: 'Leche condensada', cant: 100, u: 'g', ref: 'condensada' },
        { n: 'Mantequilla', cant: 20, u: 'g', ref: 'mantequilla' },
        { n: 'Sal fina', cant: 1, u: 'g', ref: 'sal' },
      ],
      pasos: [
        'Pon todos los ingredientes en una olla de fondo grueso a fuego medio-bajo.',
        'Cocina revolviendo constantemente de 10 a 12 minutos.',
        '<b>Punto de control:</b> la mezcla se despega de las paredes y del fondo y forma una sola masa que se mueve con la cuchara.',
        'Pasa a un plato engrasado y deja que se tibie hasta que la puedas manipular.',
        'Con las manos engrasadas forma bolas de 25 g, aplánalas un poco y ponlas en capacillos.',
        'Para un acabado dorado, gratínalas 2 minutos en airfryer a 180 °C. Deja enfriar por completo antes de guardar.',
      ],
      secreto: '<p><b>El coco deshidratado se hidrata con la humedad del arequipe durante la cocción.</b> Si las cocadas te quedan secas y se desmoronan, te pasaste de cocción; si se aplanan y no mantienen forma, les faltó. Retira en el punto exacto en que la masa se despega de la olla.</p>',
      empaque: ['capacillo'], precioVenta: 2500,
    },
    {
      tipo: 'receta', id: 'torta-negra', kicker: 'Para cajas', titulo: 'Mini Torta Negra Navideña',
      subtitulo: 'Frutas maceradas en vino, dulce quemado y especias. Mejora con los días y es el regalo más elegante de la caja.',
      rinde: { porciones: 12, formato: 'mini tortas de 120 g', formatoCorto: 'Mini torta' },
      tiempos: { activo: '1 h', espera: '3 días de maceración + 40 min de horno' }, dificultad: 'Media',
      conservacion: 'Envuelta en film, en lugar fresco, 4 semanas. Contiene leche, huevo, gluten y VINO.',
      ingredientes: [
        { grupo: 'Frutas maceradas' },
        { n: 'Frutas confitadas picadas', cant: 250, u: 'g', ref: 'frutas_confitadas' },
        { n: 'Uvas pasas', cant: 250, u: 'g', ref: 'pasas' },
        { n: 'Vino tinto', cant: 300, u: 'ml', ref: 'vino' },
        { grupo: 'Torta' },
        { n: 'Azúcar (80 g para el dulce quemado)', cant: 200, u: 'g', ref: 'azucar' },
        { n: 'Mantequilla', cant: 250, u: 'g', ref: 'mantequilla' },
        { n: 'Huevos', cant: 5, u: 'un', ref: 'huevos' },
        { n: 'Harina de trigo', cant: 250, u: 'g', ref: 'harina' },
        { n: 'Polvo de hornear', cant: 8, u: 'g', ref: 'polvo_hornear' },
        { n: 'Cacao, canela y clavo molidos', cant: 15, u: 'g', ref: 'cacao', medida: '1 cda de cacao + ½ cdta de cada especia' },
      ],
      pasos: [
        'Mínimo 3 días antes, pon las frutas y las pasas en un frasco con el vino. Tapa y revuelve una vez al día.',
        '<b>Dulce quemado:</b> derrite 80 g de azúcar en una sartén sin revolver hasta que esté color café oscuro. Retira y agrega con cuidado 80 ml de agua caliente (salpica). Revuelve hasta tener un caramelo líquido y deja enfriar.',
        'Bate la mantequilla con el resto del azúcar hasta que esté cremosa. Agrega los huevos uno a uno.',
        'Agrega el dulce quemado y luego la harina tamizada con el polvo de hornear, el cacao y las especias.',
        'Incorpora las frutas escurridas, junto con 3 cucharadas del vino de la maceración.',
        'Reparte en moldes individuales de aluminio engrasados, hasta tres cuartos. Hornea a 160 °C de 35 a 40 minutos, hasta que un palillo salga limpio.',
        'Al salir, pincela con el vino restante. Deja enfriar, tapa y espera 2 días antes de vender: el sabor mejora.',
      ],
      secreto: '<p><b>El dulce quemado da el color negro y el sabor amargo característico.</b> Tiene que estar oscuro de verdad, no dorado, pero sin humo negro: si huele a quemado, empieza de nuevo. Y pincelar con vino al salir del horno es lo que mantiene húmeda la torta durante semanas.</p>',
      empaque: ['molde_torta', 'sticker'], precioVenta: 12000,
    },
    {
      tipo: 'receta', id: 'chocolate-frasco', kicker: 'Para cajas', titulo: 'Chocolate Caliente en Frasco',
      subtitulo: 'Mezcla seca de cacao, leche en polvo y canela en frasco de vidrio. Se prepara en casa con agua o leche caliente.',
      rinde: { porciones: 10, formato: 'frascos de 250 ml', formatoCorto: 'Frasco 250 ml' },
      tiempos: { activo: '30 min', espera: '—' }, dificultad: 'Fácil',
      conservacion: 'Lugar fresco y seco, frasco cerrado, 3 meses. Contiene leche.',
      ingredientes: [
        { n: 'Cacao en polvo 100%', cant: 300, u: 'g', ref: 'cacao' },
        { n: 'Leche en polvo entera', cant: 500, u: 'g', ref: 'leche_polvo' },
        { n: 'Azúcar', cant: 400, u: 'g', ref: 'azucar' },
        { n: 'Canela molida', cant: 10, u: 'g', ref: 'canela' },
        { n: 'Chispas de chocolate', cant: 150, u: 'g', ref: 'chispas' },
        { n: 'Sal fina', cant: 2, u: 'g', ref: 'sal' },
      ],
      pasos: [
        'Lava los frascos y las tapas con agua caliente y jabón y sécalos por completo. Cualquier humedad endurece la mezcla.',
        'Tamiza juntos el cacao, la leche en polvo, el azúcar, la canela y la sal.',
        'Llena cada frasco por capas para que se vea bonito: leche en polvo con azúcar, cacao, y termina con las chispas.',
        'Cierra, pon una cinta y una tarjeta con la instrucción de preparación.',
        '<b>Instrucción para el cliente:</b> "Mezcla el contenido del frasco. Disuelve 4 cucharadas en una taza de leche o agua caliente. Rinde 4 tazas."',
      ],
      secreto: '<p><b>Este es el producto con más vida útil del recetario</b> y el más fácil de enviar por transportadora a otras ciudades. Para empresas que quieren detalles para empleados en varias sedes, es tu mejor propuesta.</p>',
      empaque: ['frasco', 'cinta', 'tarjeta'], precioVenta: 18000,
    },

    // ------------------------------------------------------------------ CAP 4
    { tipo: 'capitulo', num: '04', titulo: 'Cajas regalo', bajada: 'Tres cajas para tres clientes distintos, con contenido, costo, precio y margen.' },
    {
      tipo: 'texto',
      html: `
<p class="lead">La caja regalo es lo que convierte un dulce de $2.500 en un pedido de $15.000 a $55.000. El cliente no compra dulces sueltos: compra un regalo listo, bonito y sin esfuerzo.</p>
<div class="grid3">
<div class="tarjeta"><h4>Caja Mini Detalle</h4><p>Para aguinaldos, compañeros de trabajo, profesores y vecinos. Precio accesible y alta compra por impulso.</p></div>
<div class="tarjeta"><h4>Caja Novena</h4><p>Para la familia que recibe la novena en casa. Productos frescos para compartir esa misma noche.</p></div>
<div class="tarjeta"><h4>Caja Ejecutiva</h4><p>Para empresas que regalan a empleados y clientes. Productos de larga vida y presentación elegante.</p></div>
</div>
<h2>La presentación vende</h2>
<ul class="check">
<li><b>Relleno de papel seda o viruta</b> en el fondo: los dulces no se mueven y la caja se ve llena.</li>
<li><b>Cada dulce en su capacillo o bolsita:</b> se ve ordenado y protege del contacto entre sabores.</li>
<li><b>Cinta o rafia</b> en color de temporada: rojo, verde o dorado. Escoge uno y úsalo en todas tus cajas.</li>
<li><b>Tarjeta impresa</b> con tu marca, el contenido, la fecha de vencimiento y un espacio para escribir "Para / De".</li>
<li><b>Sticker de cierre</b> que asegure la tapa: da confianza de que nadie abrió la caja.</li>
</ul>
<div class="nota"><p><b>Compra empaques al por mayor desde noviembre.</b> En diciembre las cajas, cintas y capacillos suben de precio y se agotan. Calcula las cajas de tu preventa más un 20%.</p></div>`,
    },
    {
      tipo: 'caja', id: 'caja-mini', titulo: 'Caja Mini Detalle', subtitulo: 'Aguinaldos, compañeros de trabajo, profesores y detalles familiares.',
      items: [
        { receta: 'trufas', cantidad: 2, empaque: ['capacillo'] },
        { receta: 'galletas', cantidad: 2 },
        { receta: 'cocadas', cantidad: 1, empaque: ['capacillo'] },
      ],
      empaque: ['caja_mini', 'relleno', 'cinta', 'tarjeta', 'sticker'],
      precioVenta: 15000,
      html: `
<h3>Contenido</h3>
<ul><li>2 trufas de chocolate de coberturas distintas.</li><li>2 galletas de mantequilla decoradas.</li><li>1 cocada de arequipe.</li></ul>
<h3>Cómo venderla</h3>
<p>Los detalles y aguinaldos en oficinas suelen tener un presupuesto definido y accesible. Esta caja está pensada para ajustarse a ese rango. Ofrécela por paquetes: "10 cajas para tu equipo" con un pequeño descuento por volumen.</p>
<p>Todos sus productos son de larga vida: la puedes armar con una semana de anticipación si las trufas se mantienen en nevera hasta el día de la entrega.</p>
<div class="nota"><p><b>Precio por volumen sugerido:</b> desde 10 cajas, $14.000 cada una. Desde 30 cajas, $13.000 y sticker con el logo de la empresa.</p></div>`,
    },
    {
      tipo: 'caja', id: 'caja-novena', titulo: 'Caja Novena para 6', subtitulo: 'La novena resuelta para una familia: natilla, buñuelos y brevas con arequipe.',
      items: [
        { receta: 'bunuelos', cantidad: 6 },
        { receta: 'natilla', cantidad: 6 },
        { receta: 'brevas', cantidad: 4, empaque: ['capacillo'] },
      ],
      empaque: ['caja_mediana', 'molde_torta', 'bolsa_buñuelo', 'relleno', 'cinta', 'tarjeta', 'sticker'],
      precioVenta: 45000,
      html: `
<h3>Contenido</h3>
<ul><li>Natilla para 6 personas en molde de aluminio con tapa (720 g).</li><li>6 buñuelos del día.</li><li>4 brevas con arequipe.</li></ul>
<h3>Logística</h3>
<p>Es una caja de productos frescos: se produce y se entrega el mismo día. Abre pedidos con un día de anticipación y fija una hora de corte (por ejemplo, 12 m. del día anterior).</p>
<p>Entrega los buñuelos en bolsa de papel antigrasa dentro de la caja para que no manchen la natilla. Incluye en la tarjeta: "Natilla: mantener en nevera, consumir en 3 días. Buñuelos: mejores el mismo día; para recalentar, 3 minutos en airfryer a 160 °C".</p>
<div class="nota"><p><b>Aumenta el ticket:</b> ofrece al confirmar el pedido "Agrega 6 buñuelos más por $12.000". En novena siempre llega más gente de la que se esperaba.</p></div>`,
    },
    {
      tipo: 'caja', id: 'caja-ejecutiva', titulo: 'Caja Ejecutiva', subtitulo: 'Para empresas: elegante, de larga vida y personalizable con el logo.',
      items: [
        { receta: 'torta-negra', cantidad: 1, empaque: ['molde_torta'] },
        { receta: 'chocolate-frasco', cantidad: 1, empaque: ['frasco'] },
        { receta: 'trufas', cantidad: 4, empaque: ['capacillo'] },
        { receta: 'galletas', cantidad: 4 },
      ],
      empaque: ['caja_grande', 'relleno', 'cinta', 'tarjeta', 'sticker'],
      precioVenta: 55000,
      html: `
<h3>Contenido</h3>
<ul><li>1 mini torta negra navideña.</li><li>1 frasco de chocolate caliente.</li><li>4 trufas de chocolate.</li><li>4 galletas de mantequilla decoradas.</li></ul>
<h3>Por qué funciona para empresas</h3>
<p>Todo dura mínimo 10 días (las trufas en nevera) y la mayoría varias semanas. La empresa puede recibir las cajas una semana antes de su evento sin riesgo. El chocolate en frasco y la torta negra son productos que el empleado lleva a su casa y comparte con su familia: el regalo se recuerda.</p>
<div class="nota"><p><b>Personalización:</b> sticker de cierre y tarjeta con el logo de la empresa desde 20 cajas. Cobra el diseño una sola vez o inclúyelo en el precio por volumen.</p></div>`,
    },

    // ------------------------------------------------------------------ CAP 5
    { tipo: 'capitulo', num: '05', titulo: 'Vender a empresas y oficinas', bajada: 'Un solo pedido corporativo puede valer más que un mes de ventas sueltas.' },
    {
      tipo: 'texto',
      html: `
<h2>A quién escribirle</h2>
<p>Empieza por las personas que ya conoces: familiares, amigos y exclientes que trabajan en empresas, bancos, colegios, call centers, consultorios o almacenes. No le escribas a "la empresa": escríbele a la persona que organiza la integración o los regalos de fin de año, que suele estar en recursos humanos, en la asistencia de gerencia o es el líder del equipo.</p>
<h2>Mensaje modelo</h2>
<div class="caja"><p>"Hola, [nombre]. ¿Cómo estás? Te escribo porque este año estoy haciendo cajas regalo navideñas artesanales y pensé que te podían servir para los aguinaldos y detalles de fin de año de tu equipo.</p><p>Tengo tres opciones desde $15.000, todas con productos hechos por mí y con presentación lista para regalar. Si son más de 10 cajas tengo precio especial, y desde 20 cajas les pongo el logo de la empresa en el sticker y la tarjeta.</p><p>Te comparto el catálogo con fotos. Para entregar antes del 18 de diciembre estoy cerrando pedidos el 6. ¿Te lo envío?"</p></div>
<h2>Condiciones claras desde el primer mensaje</h2>
<table class="t"><thead><tr><th>Condición</th><th>Recomendación</th></tr></thead><tbody>
<tr><td>Pedido mínimo con precio por volumen</td><td>10 cajas</td></tr>
<tr><td>Personalización con logo</td><td>Desde 20 cajas. La empresa envía el logo en buena resolución.</td></tr>
<tr><td>Anticipo</td><td>50% para confirmar el pedido y comprar ingredientes. El saldo, contra entrega.</td></tr>
<tr><td>Fecha límite de pedido</td><td>Una semana antes de la fecha de entrega como mínimo.</td></tr>
<tr><td>Entrega</td><td>En una sola dirección. Si son varias sedes, cotiza el domicilio aparte.</td></tr>
<tr><td>Facturación</td><td>Pregunta si la empresa necesita factura electrónica antes de cotizar. Si la necesitan y no puedes emitirla, dilo desde el principio.</td></tr>
</tbody></table>
<h2>Cotización en un mensaje</h2>
<div class="caja"><p><b>Cotización Emprende Dulce · Navidad 2026</b><br>Cliente: [empresa] · Contacto: [nombre]<br>Producto: Caja Ejecutiva × 25 unidades, con logo en sticker y tarjeta<br>Valor unitario: $50.000 · Total: $1.250.000<br>Anticipo (50%): $625.000 · Saldo contra entrega: $625.000<br>Entrega: 15 de diciembre, [dirección]<br>Vigencia de la cotización: 5 días</p></div>`,
    },

    // ------------------------------------------------------------------ CAP 6
    { tipo: 'capitulo', num: '06', titulo: 'Producción, costos y normas', bajada: 'Qué producir primero, cuánto dura cada cosa y lo que dicen los números.' },
    {
      tipo: 'resumen',
      titulo: 'Resumen de costos y márgenes',
      intro: '<p>Costeo de todos los productos y cajas del recetario. Incluye ingredientes, 10% de costos indirectos y empaque. El margen es bruto: falta descontar tu tiempo, los domicilios y la publicidad.</p>',
    },
    {
      tipo: 'texto',
      html: `
<h2>Orden de producción y vida útil</h2>
<table class="t"><thead><tr><th>Producto</th><th>Producir con</th><th>Conservación</th><th>Vida útil de referencia</th></tr></thead><tbody>
<tr><td>Chocolate en frasco</td><td>Hasta 1 mes antes</td><td>Lugar fresco y seco</td><td>3 meses</td></tr>
<tr><td>Mini torta negra</td><td>Hasta 3 semanas antes</td><td>Envuelta, lugar fresco</td><td>4 semanas</td></tr>
<tr><td>Galletas de mantequilla</td><td>Hasta 2 semanas antes</td><td>Recipiente hermético</td><td>3 semanas</td></tr>
<tr><td>Brevas sin rellenar</td><td>Hasta 10 días antes</td><td>En su almíbar, nevera</td><td>2 semanas</td></tr>
<tr><td>Cocadas</td><td>Hasta 1 semana antes</td><td>Hermético; nevera si hace calor</td><td>1 a 2 semanas</td></tr>
<tr><td>Trufas</td><td>Hasta 1 semana antes</td><td>Nevera, hermético</td><td>10 días</td></tr>
<tr><td>Natilla</td><td>1 día antes como máximo</td><td>Nevera</td><td>4 días</td></tr>
<tr><td>Buñuelos</td><td>El mismo día</td><td>Temperatura ambiente</td><td>Mismo día</td></tr>
</tbody></table>
<p><em>Tiempos de referencia para producción casera con buenas prácticas. Ante la duda, usa el tiempo más corto, y escribe siempre la fecha de vencimiento en la tarjeta de cada caja.</em></p>
<h2>Etiqueta y normas</h2>
<p>Cada caja debe llevar en la tarjeta o en una etiqueta: nombre de los productos, ingredientes, alérgenos destacados (leche, huevo, gluten, coco, vino), fecha de elaboración, fecha de vencimiento del producto que menos dura y forma de conservación.</p>
<p>En Colombia, la Resolución 2674 de 2013 fija los requisitos sanitarios para fabricar y vender alimentos, incluida la capacitación en manipulación de alimentos, y la Resolución 5109 de 2005 regula el rotulado. Ten tu curso de manipulación de alimentos vigente. Para vender en tiendas o para empresas grandes, te pueden pedir registro sanitario del INVIMA o documentos de tu negocio: pregunta en la Secretaría de Salud de tu municipio qué aplica a tu caso.</p>
<div class="alerta"><p><b>Productos con licor.</b> La torta negra y las trufas de ron contienen alcohol. Decláralo en la etiqueta y no las incluyas en cajas para niños.</p></div>
<div class="caja"><h3>Después del 24</h3><p>Guarda la lista de clientes que te compraron y qué compraron. En enero escríbeles para agradecer, y en noviembre del próximo año serán tus primeros pedidos. Las empresas que quedaron contentas suelen repetir.</p></div>
<p class="firma">Feliz Navidad y feliz temporada de ventas. Emprende Dulce.</p>`,
    },
  ],
};
