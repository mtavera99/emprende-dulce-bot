// Contenido de las 4 guías prácticas y del bono "Cómo cobrar un trabajo de carpintería en Colombia".
// Los ejemplos numéricos salen del motor (planos reales del pack), no se escriben a mano.
module.exports = function ({ M, D, FAM, TOTAL, DISENOS, portada, esc, mm }) {
  const cap = (n, kicker, titulo, cuerpo) => `<section class="cap"><header class="cap-cab"><span class="n">${String(n).padStart(2, '0')}</span><div><small>${esc(kicker)}</small><h2>${esc(titulo)}</h2></div></header>${cuerpo}</section>`;
  const caja = (t, h, cls = 'caja') => `<div class="${cls}"><h4>${esc(t)}</h4>${h}</div>`;
  const ul = (a) => '<ul>' + a.map((x) => `<li>${x}</li>`).join('') + '</ul>';
  const ol = (a) => '<ol>' + a.map((x) => `<li>${x}</li>`).join('') + '</ol>';
  const tabla = (cab, filas) => `<table class="t"><thead><tr>${cab.map((c) => `<th${/^(Cant|Valor|Tableros|Planos|m²|Láminas|%)/.test(c) ? ' class="r"' : ''}>${esc(c)}</th>`).join('')}</tr></thead><tbody>${filas.map((f) => `<tr>${f.map((c, i) => `<td${typeof c === 'number' || /^\$|^\d/.test(String(c)) && i ? ' class="r"' : ''}>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  const plano = (cod) => { const x = M.buscar(cod); return { ...x, r: M.construir(x.item) }; };
  const cop = (v) => '$' + Math.round(v).toLocaleString('es-CO');
  const arte = (cod) => { const p = plano(cod); return D.frente(p.r, p.item.spec); };
  const kp = [[TOTAL, 'planos'], [DISENOS.length, 'diseños'], ['mm', 'medidas'], ['COP', 'Colombia']];
  const guias = [];

  // ====================================================================== GUÍA 1
  const b800 = plano('COC-B2P-800');
  guias.push({ id: 'g1', archivo: 'Guias/01_Guia_Materiales_Tableros_y_Herrajes.pdf', titulo: 'Guía 1 · Materiales, Tableros y Herrajes', sub: 'Tableros de 15 y 18 mm, tapacanto PVC, tornillos, bisagras, correderas y minifix', html: [
    portada('Materiales, Tableros y Herrajes', 'Guía 1', 'Qué comprar, en qué espesor y con qué herrajes, para que el mueble dure y no te equivoques en el depósito.', kp, arte('CLO-2000-2200')),
    cap(1, 'Tableros', 'La melamina y sus parientes', `
      <p>Lo que en Colombia llamamos <b>melamina</b> es un tablero de partículas de madera (aglomerado o MDP) recubierto por las dos caras con una lámina decorativa de papel impregnado en resina. Es económica, viene en colores lisos y maderados, y no necesita pintura ni laca.</p>
      ${tabla(['Tablero', 'Para qué sirve', 'Cuidado'], [
        ['<b>Melamina estándar</b>', 'Clósets, escritorios, muebles de TV, dormitorio, organizadores', 'No resiste humedad directa: el canto sin sellar se hincha'],
        ['<b>Melamina RH</b> (resistente a la humedad)', 'Cocina (sobre todo el lavaplatos), baño y lavandería', 'Resiste humedad del ambiente, no agua estancada. Igual se sellan los cantos cercanos al agua'],
        ['<b>MDF</b> crudo o melamínico', 'Frentes que se van a pintar o enrutar, molduras', 'Más pesado y más caro; el crudo hay que sellarlo y pintarlo'],
        ['<b>HDF de 3 mm</b>', 'Fondos de muebles y de cajones', 'Se clava o se grapa por detrás; lo que mantiene el mueble en escuadra'],
        ['<b>Triplex o contrachapado</b>', 'Piezas que reciben golpes o peso en voladizo', 'No es parte de estos planos; se menciona como alternativa'],
      ])}
      ${caja('Formato del tablero', `<p>Todos los planos del pack calculan los cortes sobre el formato <b>2,15 × 2,44 m</b> (el de la marca Pelíkano en Madecentro, por ejemplo). Hay marcas y depósitos con otros formatos. <b>Confirma el formato antes de comprar</b>: si es distinto, pídele al depósito que optimice el corte con su propio programa, o usa el estimador de láminas de la calculadora del pack.</p>`)}
      ${caja('Colores lisos y maderados: la veta', '<p>En el despiece, el <b>largo</b> de cada pieza es la medida en el sentido de la veta. En un color liso da igual, pero en un maderado las vetas de todas las puertas y costados deben ir en la misma dirección. Por eso las piezas del plano de cortes no se giran si llevan veta.</p>')}`),
    cap(2, 'Espesor', '¿15 o 18 mm?', `
      <p>Los planos del pack usan <b>15 mm</b> para cuerpos, puertas y frentes (es el espesor más usado en clósets y cocinas de melamina) y <b>18 mm</b> para las camas, que cargan peso concentrado.</p>
      ${tabla(['Uso', 'Espesor recomendado', 'Por qué'], [
        ['Costados, techos, bases, divisiones', '15 mm', 'Suficiente rigidez con el fondo de HDF bien clavado'],
        ['Puertas y frentes de cajón', '15 mm', 'Menos peso sobre las bisagras y las correderas'],
        ['Entrepaños de más de 80 cm con libros o peso', '18 mm o un refuerzo bajo el borde', 'Un entrepaño de 15 mm largo y cargado se pandea con el tiempo'],
        ['Camas (laterales, viga, base, cabecero)', '18 mm', 'Peso de personas y movimiento'],
        ['Tapas de escritorio y mesas de trabajo', '15 mm (18 mm si apoyas peso fuerte)', 'Los faldones le dan rigidez a la tapa'],
      ])}
      ${caja('Si cambias de 15 a 18 mm', '<p>Las piezas que van <b>entre</b> los costados (techo, base, divisiones, entrepaños) cambian de medida: miden el ancho total menos dos espesores. No sirve cambiar solo el espesor en el pedido: hay que recalcular. El portal del pack lo hace por ti en el botón «Ajustar medidas».</p>', 'alerta')}`),
    cap(3, 'Tapacanto', 'Cantos de PVC', `
      ${tabla(['Canto', 'Dónde va', 'Ancho'], [
        ['<b>0,45 mm</b> (delgado)', 'Cantos del cuerpo que se ven: frente de costados, entrepaños, divisiones', '19 mm para tablero de 15; 22 mm para 18'],
        ['<b>2 mm</b> (grueso)', 'Puertas, frentes de cajón, tapas de escritorio: todo lo que se toca y se golpea', '19 o 22 mm'],
        ['<b>1 mm</b>', 'Alternativa intermedia si tu depósito no tiene 2 mm', '19 o 22 mm'],
      ])}
      <p>La notación del despiece es: <b>1L</b> = un lado largo, <b>2L</b> = los dos lados largos, <b>1A / 2A</b> = uno o los dos lados cortos, y «(2 mm)» cuando va canto grueso. Cada plano trae los metros de cada canto con un 10 % de sobra.</p>
      ${caja('Del mismo color', '<p>Compra el canto del mismo color y la misma marca del tablero. Un canto «parecido» se nota mucho en los maderados.</p>')}`),
    cap(4, 'Uniones', 'Tornillos, minifix y tarugos', `
      ${tabla(['Herraje', 'Uso', 'Cómo se instala'], [
        ['<b>Tornillo para aglomerado 4 × 40 mm</b>', 'La unión principal de todos los planos', 'Broca de 4 mm en la pieza que se atraviesa y avellanado; guía de 3 mm en el canto que recibe. A 50 mm de cada borde y cada 25 cm'],
        ['<b>Tornillo 4 × 30 mm</b>', 'Tapas de escritorio y frentes de cajón (desde adentro)', 'Que no atraviese la cara vista'],
        ['<b>Tornillo 3,5 × 16 mm</b>', 'Bisagras, correderas y manijas', 'Sin guía o con guía de 2 mm'],
        ['<b>Confirmat 7 × 50 mm</b>', 'Uniones más firmes en cuerpos grandes', 'Broca escalonada especial; muy usado en talleres'],
        ['<b>Minifix (excéntrica + perno)</b>', 'Muebles que se arman y desarman (trasteos)', 'Perforación de 15 mm en la cara y de 8 mm en el canto; exige precisión o plantilla'],
        ['<b>Tarugo de madera 8 × 30 mm + pegante</b>', 'Refuerzo de uniones fijas', 'Perforación de 8 mm en ambas piezas; el pegante blanco de carpintería (PVA) se deja secar'],
      ])}
      ${caja('La regla de oro del aglomerado', '<p>El aglomerado no aguanta que se le atornille dos veces en el mismo hueco. Si un tornillo «se pasa», pon un tarugo con pegante en ese hueco, deja secar y vuelve a atornillar.</p>', 'alerta')}`),
    cap(5, 'Bisagras', 'Bisagras de cazoleta de 35 mm', `
      <p>Las puertas de los planos son <b>superpuestas</b>: cubren el cuerpo con 1,5 mm de luz en cada borde. Usan bisagra de cazoleta de 35 mm, la que se ve en cualquier cocina moderna.</p>
      ${tabla(['Tipo de bisagra', 'Cuándo se usa'], [
        ['<b>Recta</b> (superpuesta total)', 'La puerta cubre todo el costado: muebles de un solo cuerpo y puertas de los extremos'],
        ['<b>Curva</b> (semisuperpuesta)', 'Dos puertas comparten un mismo costado o división (cada una cubre la mitad)'],
        ['<b>Supercurva</b> (interior)', 'La puerta va metida dentro del cuerpo'],
        ['<b>Con cierre suave</b>', 'Cualquiera de las anteriores con amortiguador; cuesta más y se nota en la calidad'],
      ])}
      ${tabla(['Alto de la puerta', 'Bisagras por puerta'], [['Hasta 900 mm', 2], ['901 a 1.600 mm', 3], ['1.601 a 2.000 mm', 4], ['Más de 2.000 mm', 5]])}
      ${ul(['La cazoleta se perfora con broca Forstner de 35 mm, de 12 a 13 mm de profundidad, con su centro a unos 22 mm del borde de la puerta (revisa la ficha de tu bisagra).', 'Las de los extremos van a 100 mm de arriba y de abajo; las demás, repartidas.', 'Muchos depósitos perforan las cazoletas si se lo pides con el corte.'])}`),
    cap(6, 'Correderas', 'Correderas telescópicas y otros herrajes', `
      ${ul([
        '<b>Correderas telescópicas</b> (de bolas): las que usan todos los cajones del pack. Vienen en largos de 250 a 550 mm, de 50 en 50. El plano elige el largo según el fondo del mueble (fondo interior menos 40 mm, redondeado hacia abajo).',
        'La caja del cajón mide el <b>hueco menos 26 mm</b> (13 mm por lado para la corredera). Si tu corredera pide otra holgura, ajusta la caja, nunca el hueco.',
        '<b>Correderas de rodillo</b>: más económicas, de extensión parcial. Sirven, pero el cajón no sale completo.',
        '<b>Pines para entrepaño</b> de 5 mm, 4 por entrepaño.',
        '<b>Tubo colgador ovalado</b> con 2 soportes, 60 mm bajo el maletero.',
        '<b>Patas niveladoras de 10 cm</b> para los módulos bajos de cocina (se tapan con un zócalo).',
        '<b>Colgadores de alacena o riel francés</b> para los muebles aéreos.',
        '<b>Riel corredizo de doble vía</b> para los clósets de puertas corredizas: riel superior, inferior, ruedas y guías. Cada kit pide un descuento de alto distinto: el plano usa 40 mm; confírmalo.',
        '<b>Bisagra de piano</b>, <b>soportes de tapa con freno</b> y <b>escuadras plegables con seguro</b> para el baúl y la mesa abatible.',
        '<b>Escuadras antivuelco</b>: obligatorias en todo mueble de más de 1,20 m de alto.',
        '<b>Manijas</b>: las de barra vienen con distancias entre centros de 96, 128 o 160 mm. Compra todas iguales y marca con plantilla.',
      ])}`),
    cap(7, 'Lista de compras', 'Ejemplo real: módulo bajo de cocina de 800 mm', `
      <p>Así se lee la lista de compras de un plano del pack (código <b>${esc(b800.item.cod)}</b>):</p>
      ${tabla(['Material', 'Cantidad'], [
        ['Tablero de melamina 15 mm (2,15 × 2,44 m)', b800.r.tableros],
        ['Lámina HDF 3 mm (1,22 × 2,44 m)', b800.r.fondos],
        ['Tapacanto 0,45 mm', `${mm(b800.r.cantoFino)} m`],
        ['Tapacanto 2 mm', `${mm(b800.r.cantoGrueso)} m`],
        ...M.herrajesLista(b800.r.herr),
      ])}
      ${caja('Lo que no está en la lista', '<p>El mesón (granito, quarzstone o postformado), el lavaplatos, la grifería y la instalación eléctrica o de plomería no hacen parte de los planos de melamina.</p>')}`),
  ].join('') });

  // ====================================================================== GUÍA 2
  guias.push({ id: 'g2', archivo: 'Guias/02_Guia_Cortar_Cantear_Perforar_y_Unir.pdf', titulo: 'Guía 2 · Cortar, Cantear, Perforar y Unir', sub: 'Paso a paso, incluso sin taller: pedir el corte en el depósito y armar en casa con taladro', html: [
    portada('Cortar, Cantear, Perforar y Unir', 'Guía 2', 'De la lista de despiece al mueble armado, con taller o sin taller.', kp, arte('DOR-CO4-800')),
    cap(1, 'Dos caminos', 'Con taller o sin taller', `
      ${tabla(['', 'Sin taller', 'Con taller'], [
        ['Corte', 'Lo hace el depósito con su seccionadora', 'Sierra circular con riel o sierra de mesa'],
        ['Tapacanto', 'Lo pega el depósito con canteadora', 'Canto preencolado con plancha, o canteadora manual'],
        ['Perforaciones', 'Taladro en casa (algunos depósitos perforan cazoletas)', 'Taladro, Forstner, plantillas'],
        ['Herramienta mínima', 'Taladro atornillador, brocas, metro, escuadra', 'Todo lo anterior más sierra, prensas y mesa'],
        ['Precisión', 'La de la máquina del depósito (muy buena)', 'Depende de tu equipo y tu práctica'],
      ])}
      <p>Para empezar, el camino <b>sin taller</b> es el más rápido y el que menos errores tiene: el corte industrial queda escuadrado y el canto pegado a máquina.</p>`),
    cap(2, 'Sin taller', 'Cómo pedir el corte y el enchape en el depósito', ol([
      'Elige el color y el espesor. Para cocina, baño y lavandería pide <b>melamina RH</b>.',
      'Pregunta el <b>formato del tablero</b> de esa marca. Los planos usan 2,15 × 2,44 m.',
      'Prepara la lista: por cada pieza, <b>cantidad, largo × ancho y tapacanto</b>, en el orden del despiece. Muchos depósitos reciben la lista por correo o por WhatsApp; pregunta en qué formato la prefieren.',
      'Aclara que el <b>largo va en el sentido de la veta</b> y cuáles piezas no la llevan (en el plano de cortes se ven giradas).',
      'Pide canto de <b>0,45 mm</b> para el cuerpo y de <b>2 mm</b> para puertas y frentes, del mismo color.',
      'Pregunta si perforan las <b>cazoletas</b> de las bisagras (35 mm). Si sí, lleva marcado en qué piezas y a qué distancia.',
      'Compra el <b>fondo de HDF</b> cortado a la medida del plano.',
      'Al recibir: cuenta las piezas y mide 3 o 4 al azar <b>antes de salir</b> del depósito.',
      'Pide que <b>optimicen</b> el corte antes de pagar: a veces su programa logra una lámina menos, sobre todo si juntas varios muebles en un pedido.',
    ]) + caja('Cómo escribir cada línea', '<p><b>2 · Costado · 720 × 560 · canto 1L</b> = dos piezas de 720 mm (en la veta) por 560 mm, con canto delgado en un lado largo. Si el canto es grueso: <b>canto 2L 2A (2 mm)</b>.</p>')),
    cap(3, 'Con taller', 'Cortar melamina en casa sin astillar', ul([
      'Usa un <b>disco para melamina</b> o de muchos dientes (de 40 a 60 en un disco de 7¼"), bien afilado.',
      'Con <b>sierra circular de mano</b>, la cara buena va <b>hacia abajo</b> (el disco astilla al salir por arriba). En <b>sierra de mesa</b>, la cara buena va <b>hacia arriba</b>.',
      'Pega cinta de enmascarar sobre la línea de corte y marca encima: reduce el astillado.',
      'Usa un riel o una regla prensada como guía; nunca a pulso.',
      'Cuenta el ancho del corte (3 a 4 mm): mide desde el borde correcto de la línea.',
      'Corta primero las piezas grandes y saca las pequeñas de los retazos, como en el plano de cortes.',
      '<b>Gafas, tapabocas y protección auditiva</b>: el polvo de aglomerado es fino y molesto.',
    ])),
    cap(4, 'Tapacanto', 'Pegar el canto a mano', ol([
      'Compra <b>canto preencolado</b> (trae el pegante por detrás).',
      'Corta un tramo 2 cm más largo que la pieza.',
      'Pásale una plancha de ropa caliente (sin vapor) por encima, con un papel de por medio, mientras presionas con un trapo o un taco de madera.',
      'Deja enfriar un minuto y refila los sobrantes con un refilador de cantos o una cuchilla bien afilada, en ángulo.',
      'Lija suave el borde con lija de 220 para quitar el filo.',
    ]) + caja('El canto de 2 mm', '<p>El de 2 mm no se pega bien con plancha: necesita canteadora o pegante de contacto y prensado. Si no tienes canteadora, pide en el depósito solo el enchape de puertas y frentes.</p>')),
    cap(5, 'Perforar', 'Perforaciones limpias y precisas', `
      ${ul([
        'Brocas: 3 mm (guías), 4 mm (pasante de tornillo), 5 mm (pines de entrepaño), 8 mm (tarugos) y Forstner de 35 mm (cazoletas).',
        'Usa un <b>tope de profundidad</b> (un collarín o cinta en la broca) para no atravesar la cara vista.',
        'Para los pines de entrepaño, haz una <b>plantilla</b> con un listón perforado cada 32 mm, a 37 mm del borde: todos los costados quedan iguales.',
        'Para la cazoleta, perfora con el taladro bien perpendicular; si tienes, usa un soporte de taladro o una guía.',
        'Para pasacables (escritorios), sierra copa de 60 mm, perforando por las dos caras para que no astille.',
      ])}`),
    cap(6, 'Armado', 'Paso a paso para cualquier mueble', ol([
      '<b>Ordena las piezas</b> y marca cada una con su número del despiece (con lápiz, por la cara que no se ve).',
      '<b>Arma el cuerpo</b>: base y techo (o travesaños) entre los dos costados. Verifica la escuadra midiendo las dos diagonales: deben dar lo mismo.',
      '<b>Divisiones</b> entre base y techo, a la medida del plano.',
      '<b>Fondo</b>: con el cuerpo boca abajo y en escuadra, clava o grapa el HDF cada 10 cm.',
      '<b>Zócalo o patas</b>.',
      '<b>Entrepaños</b> sobre sus pines.',
      '<b>Cajones</b>: arma la caja, monta las correderas a la misma altura en el cuerpo y en la caja, y al final atornilla el frente visible desde adentro dejando 1,5 mm de luz.',
      '<b>Puertas</b>: atornilla las bisagras, cuelga la puerta y regula con los tornillos de la bisagra hasta que las luces queden parejas.',
      '<b>Manijas</b> con plantilla de cartón.',
    ]) + caja('Cada plano trae su propio paso a paso', '<p>Además de este orden general, cada plano del pack trae su paso a paso según sus piezas (camas, repisas flotantes, mesas abatibles, corredizas…).</p>')),
    cap(7, 'Instalación', 'Seguridad al instalar', `
      ${caja('Muebles altos', ul(['Arma el cuerpo acostado y levántalo entre dos personas.', 'Ánclalo al muro con escuadras antivuelco: un mueble alto sin anclar se puede volcar sobre un niño.']), 'alerta')}
      ${ul(['<b>Alacenas</b>: primero un listón de apoyo nivelado; luego cuelga y atornilla por dentro al muro.', '<b>Drywall</b>: usa anclajes para drywall o atornilla a los parales; no cuelgues peso en la placa sola.', '<b>Cocina</b>: nivela todas las patas antes de poner el mesón.', '<b>Baño</b>: sella con silicona los cantos cercanos al agua.'])}`),
    cap(8, 'Errores comunes', 'Lo que más plata hace perder', tabla(['Error', 'Cómo evitarlo'], [
      ['Pedir piezas en cm y la tienda corta en mm (o al revés)', 'Todo el pack está en milímetros: dilo al pedir'],
      ['Cambiar el espesor sin recalcular', 'Usa «Ajustar medidas» en el portal'],
      ['Olvidar el canto de un lado visible', 'Revisa la columna Tapacanto línea por línea'],
      ['Atornillar dos veces en el mismo hueco', 'Tarugo con pegante y vuelve a atornillar'],
      ['Fondo clavado con el mueble fuera de escuadra', 'Mide diagonales antes de clavar'],
      ['No anclar muebles altos', 'Escuadras antivuelco siempre'],
    ])),
  ].join('') });

  // ====================================================================== GUÍA 3
  const W = 2130, Hh = 2420, UTIL = (W * Hh) / 1e6;
  const porCat = FAM.map((f) => { const rs = f.items.map((i) => M.construir(i)); return [esc(f.nombre), f.items.length, `${Math.min(...rs.map((r) => r.tableros))} a ${Math.max(...rs.map((r) => r.tableros))}`, `${Math.round(rs.reduce((n, r) => n + r.aprovechamiento, 0) / rs.length)} %`]; });
  const mn = plano('DOR-MN1-450'), co = plano('DOR-CO4-800');
  const juntos = M.optimizar([...mn.r.piezas, ...mn.r.piezas, ...co.r.piezas].filter((p) => p.material === 'melamina'), M.CONFIG);
  const separados = 2 * mn.r.tableros + co.r.tableros;
  const est = (m2) => Math.ceil((m2 * 1.2) / UTIL);
  const clo = plano('CLO-COR-1800');
  guias.push({ id: 'g3', archivo: 'Guias/03_Guia_Optimizacion_de_Cortes_y_Laminas.pdf', titulo: 'Guía 3 · Optimización de Cortes y Aprovechamiento de Láminas', sub: 'Cuántas láminas comprar para que no falte material ni se pierda plata en retazos', html: [
    portada('Optimización de Cortes y Láminas', 'Guía 3', 'Cuántas láminas comprar, cómo acomodar las piezas y qué hacer con los retazos.', kp, D.tablero(clo.r.optimizacion, 0, (k) => k + 1)),
    cap(1, 'Por qué importa', 'Cada lámina mal calculada es plata', `
      <p>Un tablero de 2,15 × 2,44 m tiene 5,25 m². Después de refilar 10 mm por cada borde quedan <b>${String(UTIL.toFixed(2)).replace('.', ',')} m² útiles</b>, y cada corte de la sierra se come 3 a 4 mm. Si compras una lámina de menos, el trabajo se para; si compras una de más, se queda en el taller.</p>
      ${caja('Lo que ya hace el pack', '<p>Cada plano trae el número de tableros y el <b>plano de cortes</b> ya resuelto (cortes en guillotina, respetando la veta). Esta guía sirve para cuando juntas varios muebles, cambias medidas o diseñas algo propio.</p>')}`),
    cap(2, 'Cálculo rápido', 'Estimar las láminas en 3 pasos', `
      ${ol(['Suma el área de todas las piezas de melamina: largo × ancho × cantidad (en metros).', 'Multiplica por 1,2 (20 % de desperdicio para muebles con piezas de varios tamaños; 1,1 si casi todas son grandes e iguales).', `Divide por ${String(UTIL.toFixed(2)).replace('.', ',')} m² y redondea siempre hacia arriba.`])}
      ${tabla(['Ejemplo del pack', 'm² de piezas', 'Estimado (× 1,2)', 'Tableros del plano de cortes'], [
        [esc(mn.item.nombre) + ' 450', String(mn.r.m2mel).replace('.', ','), est(mn.r.m2mel), mn.r.tableros],
        [esc(co.item.nombre) + ' 800', String(co.r.m2mel).replace('.', ','), est(co.r.m2mel), co.r.tableros],
        [esc(clo.item.nombre) + ' 1.800', String(clo.r.m2mel).replace('.', ','), est(clo.r.m2mel), clo.r.tableros],
      ])}
      <p>El estimado sirve para cotizar rápido. El número que manda es el del <b>plano de cortes</b>, porque una pieza muy larga o muy ancha puede obligar a abrir otra lámina aunque el área alcance.</p>`),
    cap(3, 'Juntar pedidos', 'Varios muebles en un solo corte', `
      <p>Las sobras de un mueble sirven para otro. Ejemplo calculado con el optimizador del pack:</p>
      ${tabla(['Pedido', 'Tableros'], [
        ['2 mesas de noche de 2 cajones (450) + 1 cómoda de 4 cajones (800), cortadas por separado', separados],
        ['Los mismos 3 muebles en un solo pedido', juntos.tableros.length],
      ])}
      ${juntos.tableros.length < separados ? `<p>Juntando el pedido te ahorras <b>${separados - juntos.tableros.length} tablero${separados - juntos.tableros.length > 1 ? 's' : ''}</b>.</p>` : '<p>En este caso el número de tableros es el mismo, pero sobra un retazo más grande y útil.</p>'}
      ${caja('Reglas para acomodar piezas', ul(['Primero las piezas grandes (costados, puertas), luego las medianas y al final las pequeñas en los huecos.', 'Agrupa piezas del mismo ancho en una franja: cada corte largo saca varias piezas.', 'Corta en guillotina: cada corte atraviesa el pedazo completo, como lo hace la seccionadora del depósito.', 'Las piezas con veta no se giran; las de colores lisos y las ocultas (cajones, listones) sí.']))}`),
    cap(4, 'Leer el plano de cortes', 'Cómo se usa el diagrama de cada plano', `
      <div class="tab" style="max-width:120mm">${D.tablero(clo.r.optimizacion, 0, (k) => clo.r.piezas.indexOf(clo.r.piezas.filter((p) => p.material === 'melamina')[k]) + 1)}</div>
      ${ul(['Cada rectángulo es una pieza; el número es su fila en el despiece.', 'El texto «Veta a lo largo» marca el sentido de la veta: el largo del tablero.', 'Lo blanco es retazo. Si quedan retazos grandes, anótalos: sirven para repisas, divisiones de cajón o muebles pequeños.', 'Si la tienda tiene su propio optimizador, dale la lista del despiece y compara el número de tableros con el del plano.'])}`),
    cap(5, 'Todas las categorías', 'Tableros por categoría en el pack', tabla(['Categoría', 'Planos', 'Tableros por mueble', 'Aprovechamiento promedio'], porCat) +
      '<p>El aprovechamiento bajo en muebles pequeños es normal: compras una lámina completa para una mesa de noche. Por eso conviene juntar muebles en un pedido o pedir en el depósito «media lámina» si la venden.</p>'),
    cap(6, 'Retazos y fondos', 'Retazos, HDF y tapacanto', ul([
      'Guarda retazos de más de 30 cm de lado, de pie y sin humedad.',
      'Usos de retazos: repisas, divisiones internas de cajón, tacos de refuerzo, plantillas de perforación.',
      'El HDF de 3 mm viene en lámina de 1,22 × 2,44 m. Los fondos de cajón casi siempre salen de los retazos del fondo del mueble.',
      'Tapacanto: cada plano trae los metros con un 10 % de sobra. Compra el rollo o los metros exactos según venda tu depósito.',
    ])),
  ].join('') });

  // ====================================================================== GUÍA 4
  guias.push({ id: 'g4', archivo: 'Guias/04_Guia_Diseno_3D_SketchUp_y_Render.pdf', titulo: 'Guía 4 · Diseño 3D para Carpintería (SketchUp + Render)', sub: 'Presenta el mueble en 3D al cliente antes de cortar una sola pieza', html: [
    portada('Diseño 3D para Carpintería', 'Guía 4', 'Cómo modelar en SketchUp un mueble del pack con sus medidas exactas y presentarlo al cliente antes de cortar.', kp, arte('TV-CEN-2400')),
    cap(1, 'Por qué en 3D', 'Vender antes de cortar', `
      <p>Un cliente aprueba más rápido lo que ve. Con una imagen 3D del mueble en su color, en su espacio y con sus medidas, se reducen los cambios después de cortar (que son los que más plata cuestan) y puedes cobrar el anticipo con tranquilidad.</p>
      ${caja('Importante', '<p>Este pack <b>no incluye archivos de SketchUp (.skp) ni renders hechos</b>. Esta guía te enseña a modelar cualquier plano del pack con las medidas del despiece, que es lo que necesitas para presentar tus propios proyectos.</p>', 'alerta')}`),
    cap(2, 'Programas', 'Qué programa usar', tabla(['Programa', 'Costo', 'Para qué'], [
      ['<b>SketchUp Free</b> (en el navegador)', 'Gratis', 'Aprender y proyectos personales. Según sus términos, el plan gratis es para uso no comercial: si vas a cobrar por diseños, revisa la licencia'],
      ['<b>SketchUp</b> (planes de pago)', 'Suscripción anual', 'Uso comercial, más herramientas y extensiones'],
      ['<b>Blender</b>', 'Gratis y de código abierto', 'Render realista (motor Cycles). Curva de aprendizaje más alta'],
      ['Programas especializados de carpintería', 'De pago', 'Generan despiece y cortes desde el 3D; útiles cuando ya tienes volumen'],
    ]) + '<p>Revisa precios y condiciones en la página oficial de cada programa: cambian con frecuencia.</p>'),
    cap(3, 'Preparar SketchUp', 'Unidades y orden', ol([
      'Abre un modelo nuevo con una plantilla en <b>milímetros</b> (o cambia las unidades a mm en la información del modelo). Todos los planos del pack están en mm.',
      'Crea etiquetas (capas) por tipo: Cuerpo, Puertas, Cajones, Herrajes, Muro. Así puedes ocultar las puertas para mostrar el interior.',
      'Guarda una vez el modelo vacío como «Plantilla melamina 15 mm».',
    ])),
    cap(4, 'Modelar', 'Un módulo del pack, pieza por pieza', `
      ${ol([
        'Toma un plano del pack, por ejemplo el <b>módulo bajo de cocina de 800 mm</b>. Su despiece dice: costado 720 × 560 (2), travesaños 770 × 100 (2), base 770 × 560, entrepaño 768 × 537 y puertas 717 × 397 (2).',
        'Dibuja un rectángulo escribiendo las medidas exactas (por ejemplo, 560;720) y dale <b>15 mm</b> de espesor con Empujar/Tirar.',
        'Selecciona la pieza y conviértela en <b>componente</b> con el nombre del despiece («Costado»). Las piezas repetidas se copian como el mismo componente: si cambias una, cambian todas.',
        'Copia el segundo costado con Mover + Ctrl y escribe la distancia exacta: 800 − 15 = 785 mm.',
        'Pon la base, los travesaños y el entrepaño entre los costados; usa la inferencia (puntos finales y medios) para que encajen sin huecos.',
        'Agrega las puertas superpuestas con su luz de 1,5 mm y ponlas en la etiqueta «Puertas».',
        'Aplica el color: descarga de la página del fabricante la imagen del diseño de melamina que eligió el cliente y úsala como textura, con la veta en el sentido del largo.',
      ])}
      ${caja('Truco', '<p>Modela solo una vez cada diseño y guárdalo como componente en tu biblioteca. Para otra medida, cambia el ancho con la herramienta Escalar <b>solo en los componentes que crecen</b> (techo, base, entrepaños) y mueve el costado, nunca escales el espesor.</p>')}`),
    cap(5, 'Presentar', 'Escenas, cotas e imágenes', ul([
      'Crea escenas: <b>frente cerrado</b>, <b>puertas abiertas</b> (oculta la etiqueta Puertas) y una <b>vista en el espacio</b> con el muro y el piso.',
      'Pon cotas generales (ancho, alto y fondo) con la herramienta de dimensión: el cliente confirma que cabe.',
      'Activa las sombras y elige un estilo limpio; exporta cada escena como imagen PNG de buena resolución.',
      'Envía las imágenes por WhatsApp junto con la cotización.',
    ])),
    cap(6, 'Render', 'Del modelo a una imagen realista', `
      ${ul(['Un <b>render</b> calcula luces, reflejos y texturas para que la imagen parezca una foto.', 'Hay motores de render de pago que se instalan dentro de SketchUp, y la opción gratuita de exportar el modelo y renderizarlo en <b>Blender</b>.', 'Para cotizar muebles de melamina, muchas veces basta una imagen de SketchUp con sombras y la textura real del color. El render vale la pena en proyectos grandes (cocinas, vestidores).', 'Consejos: una luz principal suave, piso y muro neutros, y la cámara a la altura de los ojos (unos 1.600 mm).'])}`),
    cap(7, 'Flujo de trabajo', 'Del cliente al corte', ol([
      'Visita y mide el espacio (ancho, alto, fondo, tomas eléctricas, tubería, zócalos y marcos).',
      'Elige el plano del pack más parecido y ajústale las medidas en el portal.',
      'Modélalo en 3D con el color que eligió el cliente.',
      'Envía imágenes + cotización (Guía «Cómo cobrar»).',
      'Recibe el anticipo y lleva el despiece al depósito.',
      'Arma, instala y toma fotos del resultado para tu catálogo.',
    ])),
  ].join('') });

  // ====================================================================== BONO: CÓMO COBRAR
  const P = { tablero: 230000, hdf: 45000, cantoF: 1200, cantoG: 3000, corte: 15000, enchape: 1500, corredera: 25000, manija: 5000, tornilleria: 15000, riel: 180000, dia: 120000 };
  const mat = clo.r.tableros * P.tablero + clo.r.fondos * P.hdf + clo.r.cantoFino * P.cantoF + clo.r.cantoGrueso * P.cantoG;
  const serv = clo.r.tableros * P.corte + (clo.r.cantoFino + clo.r.cantoGrueso) * P.enchape;
  const nCorr = Object.values(clo.r.herr.correderas).reduce((a, b) => a + b, 0);
  const herr = nCorr * P.corredera + (clo.r.herr.manijas + 2) * P.manija + P.tornilleria + P.riel;
  const mo = 2 * P.dia, trans = 60000;
  const directo = mat + serv + herr + mo + trans;
  const conInd = directo * 1.15;
  const precio = Math.ceil(conInd / (1 - 0.3) / 1000) * 1000;
  guias.push({ id: 'cobrar', bono: true, archivo: 'Bonos/Bono_Como_Cobrar_un_Trabajo_de_Carpinteria_en_Colombia.pdf', titulo: 'Bono · Cómo Cobrar un Trabajo de Carpintería en Colombia', sub: 'Márgenes, anticipo del 50 % y cotización profesional, sin cotizar al ojo', html: [
    portada('Cómo Cobrar un Trabajo de Carpintería', 'Bono', 'Una forma ordenada de calcular el precio, pedir el anticipo y presentar una cotización profesional en Colombia.', [[TOTAL, 'planos'], ['50 %', 'anticipo'], ['COP', 'pesos'], ['1', 'fórmula']], arte('CLO-COR-1800')),
    cap(1, 'El problema', 'Cotizar «al ojo» sale caro', `
      <p>El error más común es cobrar «lo que cobra el otro» o sumar solo el material. Así se trabaja gratis sin darse cuenta: se olvidan el corte, el canto, el transporte, los días de trabajo, la broca que se partió y la visita para medir.</p>
      ${caja('La idea de esta guía', '<p>Calcular el <b>costo real</b> con la lista de materiales del plano, sumarle tu trabajo y los gastos que no se ven, y ponerle una <b>ganancia sobre el precio</b>. La calculadora del pack hace estas cuentas por ti.</p>')}`),
    cap(2, 'La fórmula', 'Del costo al precio', `
      ${ol([
        '<b>Materiales</b>: tableros + HDF + tapacanto (cantidades del plano × precio de tu depósito).',
        '<b>Servicios</b>: corte, enchape y perforaciones que pagues en el depósito.',
        '<b>Herrajes</b>: bisagras, correderas, manijas, rieles, tornillería (lista del plano).',
        '<b>Mano de obra</b>: días de trabajo × valor de tu día. El valor de tu día es lo que quieres ganar al mes dividido entre los días que trabajas.',
        '<b>Transporte e instalación</b>.',
        '<b>Gastos indirectos e imprevistos</b>: herramienta, brocas, discos, celular, visitas para medir, errores. Entre 10 y 20 % del costo es un rango usado; ajústalo a tu caso.',
        '<b>Ganancia sobre el precio</b>: precio = costo total ÷ (1 − ganancia). Con 30 %, de cada $100.000 que cobras, $30.000 son ganancia.',
      ])}
      ${caja('¿Ganancia sobre el costo o sobre el precio?', '<p>Sumarle un 30 % al costo no es lo mismo que ganar un 30 % del precio. Si el costo es $700.000: sumando 30 % cobras $910.000 y la ganancia es el 23 % del precio. Dividiendo entre 0,7 cobras $1.000.000 y la ganancia sí es el 30 %.</p>', 'alerta')}`),
    cap(3, 'Ejemplo resuelto', `${esc(clo.item.nombre)} de 1,80 m`, `
      <p>Cantidades reales del plano <b>${esc(clo.item.cod)}</b> del pack. Los precios son <b>de ejemplo</b>: cámbialos por los de tu depósito y tu ciudad.</p>
      ${tabla(['Concepto', 'Cálculo', 'Valor'], [
        ['Tableros de melamina 15 mm', `${clo.r.tableros} × ${cop(P.tablero)}`, cop(clo.r.tableros * P.tablero)],
        ['Láminas HDF 3 mm', `${clo.r.fondos} × ${cop(P.hdf)}`, cop(clo.r.fondos * P.hdf)],
        ['Tapacanto 0,45 mm', `${mm(clo.r.cantoFino)} m × ${cop(P.cantoF)}`, cop(clo.r.cantoFino * P.cantoF)],
        ['Tapacanto 2 mm', `${mm(clo.r.cantoGrueso)} m × ${cop(P.cantoG)}`, cop(clo.r.cantoGrueso * P.cantoG)],
        ['Corte en el depósito', `${clo.r.tableros} tableros × ${cop(P.corte)}`, cop(clo.r.tableros * P.corte)],
        ['Enchape', `${mm(clo.r.cantoFino + clo.r.cantoGrueso)} m × ${cop(P.enchape)}`, cop((clo.r.cantoFino + clo.r.cantoGrueso) * P.enchape)],
        ['Kit de riel corredizo', '1', cop(P.riel)],
        ['Correderas, manijas y tornillería', `${nCorr} pares, ${clo.r.herr.manijas + 2} manijas`, cop(herr - P.riel)],
        ['Mano de obra', `2 días × ${cop(P.dia)}`, cop(mo)],
        ['Transporte', '', cop(trans)],
        ['<b>Costo directo</b>', '', `<b>${cop(directo)}</b>`],
        ['Indirectos e imprevistos (15 %)', '', cop(conInd - directo)],
        ['<b>Precio con 30 % de ganancia</b>', `${cop(conInd)} ÷ 0,7, redondeado`, `<b>${cop(precio)}</b>`],
        ['Anticipo del 50 %', '', cop(precio / 2)],
      ])}`),
    cap(4, 'Anticipo', 'El 50 % antes de cortar', `
      ${ul([
        'Pide el <b>50 % de anticipo</b> al aprobar la cotización: con eso compras el material y el cliente se compromete.',
        'El <b>50 % restante</b>, al entregar o al terminar la instalación, después de que el cliente revise el trabajo.',
        'Entrega un <b>recibo</b> de cada pago (puede ser digital) con el número de la cotización.',
        'Deja por escrito que <b>los cambios después de cortar se cobran aparte</b>, porque el material ya está cortado.',
        'Si el trabajo es grande, puedes dividirlo en 3 pagos: 50 % al aprobar, 30 % al llevar el material armado, 20 % al instalar.',
      ])}`),
    cap(5, 'Cotización', 'Qué debe llevar una cotización profesional', `
      ${tabla(['Parte', 'Ejemplo'], [
        ['Tus datos', 'Nombre o marca, cédula o NIT, teléfono, ciudad'],
        ['Datos del cliente', 'Nombre, dirección, fecha de la visita'],
        ['Número y fecha', 'COT-2026-015 · 24/11/2026'],
        ['Descripción', 'Clóset de 2 puertas corredizas, 1.800 × 2.200 × 600 mm, melamina 15 mm color Rovere, 3 cajones, tubo colgador'],
        ['Incluye', 'Material, corte y enchape, herrajes, transporte, armado e instalación'],
        ['No incluye', 'Resanes, pintura, obra eléctrica o de plomería, desmonte de muebles viejos'],
        ['Plazo', '8 días hábiles desde el anticipo'],
        ['Forma de pago', '50 % de anticipo, 50 % contra entrega'],
        ['Validez', '8 a 15 días (el precio del tablero cambia)'],
        ['Garantía', 'Herrajes y armado por 6 meses; no cubre humedad, golpes ni mal uso'],
      ])}
      ${caja('Adjunta la imagen 3D', '<p>Una imagen del mueble (Guía 4) junto a la cotización vende más que cualquier descripción.</p>')}`),
    cap(6, 'Negociar', 'Cómo responder «está muy caro» sin regalar tu trabajo', ul([
      'Ofrece <b>opciones</b>, no descuentos: bisagras normales en vez de cierre suave, menos cajones, color liso en vez de maderado.',
      'Divide el proyecto en <b>etapas</b>: primero el cuerpo del clóset, después las puertas.',
      'Explica qué incluye tu precio (instalación, garantía, anclaje) frente a «el que lo hace más barato».',
      'Nunca bajes la parte de mano de obra por debajo de tu valor día: ahí está tu sueldo.',
    ])),
    cap(7, 'Formalidad', 'RUT, factura e impuestos', `
      ${ul(['Tener <b>RUT</b> te permite contratar con empresas y conjuntos residenciales.', 'Si eres <b>responsable de IVA</b> o estás obligado a facturar electrónicamente, el impuesto se suma al precio y se discrimina en la factura.', 'Si no lo eres, no cobres IVA.', 'Las reglas y los topes cambian: confírmalos con la DIAN o con un contador antes de cotizar a empresas.'])}
      ${caja('Aviso', '<p>Esta guía da un método de cálculo. No es asesoría contable ni tributaria.</p>', 'alerta')}`),
  ].join('') });
  return guias;
};
