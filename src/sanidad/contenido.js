// ============================================================================
// Contenido del Plan de Saneamiento Básico (Resolución 2674 de 2013, artículo 26)
// ----------------------------------------------------------------------------
// Todo se arma con los datos del establecimiento (d). Los documentos se describen como
// bloques (títulos, párrafos, listas, tablas) que se escriben en PDF y en Word.
// Fuentes de los valores técnicos (revisadas en noviembre de 2026):
//   - Res. 2674 de 2013: plan escrito con procedimientos, cronogramas, registros, listas de chequeo y
//     responsables de 4 programas (art. 26); certificado médico al menos una vez al año (art. 11);
//     capacitación continua (art. 12). Varias secretarías piden 10 h de capacitación al año.
//   - Res. 2115 de 2007: cloro residual libre 0,3 a 2,0 mg/L y pH 6,5 a 9,0 en el agua potable.
//   - Decreto 1575 de 2007: lavado y desinfección de tanques de almacenamiento cada 6 meses.
//   - Res. 2184 de 2019: bolsas blanca (aprovechables), verde (orgánicos) y negra (no aprovechables).
//   - Res. 316 de 2018: el aceite de cocina usado se entrega a un gestor registrado.
// Concentraciones de hipoclorito y rangos de temperatura: valores de referencia de uso común en BPM;
// el documento pide seguir la etiqueta del producto y lo que exija cada secretaría.
// ============================================================================
const { TIPOS, AREAS } = require('./datos');
const F = require('./fechas');

const VERSION = 'Versión 2026-2027';

// ---------------------------------------------------------------------------- soluciones desinfectantes
const SOLUCIONES = [
  { id: 'contacto', ppm: 200, uso: 'Superficies, utensilios, tablas y menaje que tocan alimentos', tiempo: '5 minutos, luego dejar secar al aire' },
  { id: 'frutas', ppm: 100, uso: 'Frutas y verduras (inmersión después de lavarlas)', tiempo: '5 minutos; enjuagar con agua potable si la etiqueta lo indica' },
  { id: 'ambiental', ppm: 500, uso: 'Pisos, paredes, puertas, estanterías y exterior de equipos', tiempo: '10 minutos' },
  { id: 'banos', ppm: 1000, uso: 'Baños, canecas de residuos, sifones y trapeadores', tiempo: '10 minutos' },
];
// mL de hipoclorito por litro de agua = ppm ÷ (concentración % × 10)
const mlPorLitro = (ppm, c) => Math.round((ppm / (c * 10)) * 10) / 10;
const fmt = (n) => String(n).replace('.', ',');

// ---------------------------------------------------------------------------- superficies y equipos (POES)
// diaria: va en la planilla diaria de limpieza; si no, va en la de tareas semanales y mensuales (cada)
const ITEMS = [
  { id: 'mesones', nombre: 'Mesones y superficies de trabajo', frec: 'Después de cada uso y al final de la jornada', diaria: true, sol: 'contacto',
    pasos: 'Retira los residuos con espátula o toalla de papel. Lava con agua y detergente usando esponja. Enjuaga con agua potable. Aplica la solución de 200 ppm con atomizador, deja actuar 5 minutos y deja secar al aire.' },
  { id: 'tablas', nombre: 'Tablas de picar y cuchillos', frec: 'Después de cada uso', diaria: true, sol: 'contacto',
    pasos: 'Lava con agua y detergente, restregando con cepillo. Enjuaga. Sumerge 5 minutos en la solución de 200 ppm y deja escurrir en un lugar limpio. Usa tablas separadas para carnes crudas y para alimentos listos para consumir; descarta las tablas con ranuras profundas.' },
  { id: 'menaje', nombre: 'Ollas, loza, vasos y cubiertos', frec: 'Después de cada uso', diaria: true, sol: 'contacto',
    pasos: 'Retira los residuos de comida a la caneca. Lava con detergente en la poceta. Enjuaga con agua potable. Desinfecta por inmersión 5 minutos en solución de 200 ppm. Deja secar al aire boca abajo, sin secar con limpiones.' },
  { id: 'lavaplatos', nombre: 'Lavaplatos y pocetas', frec: 'Al final de cada jornada', diaria: true, sol: 'contacto',
    pasos: 'Retira residuos de la rejilla. Lava con detergente y esponja. Enjuaga. Aplica la solución de 200 ppm y deja secar.' },
  { id: 'estufa', nombre: 'Estufa, plancha y hornillas', frec: 'Al final de cada jornada', diaria: true, sol: 'ambiental', si: (d) => d.areas.includes('cocina'),
    pasos: 'Con el equipo apagado y frío, retira la grasa con espátula. Lava con desengrasante y esponja, enjuaga con un paño húmedo y seca. Los quemadores se lavan por separado una vez por semana.' },
  { id: 'horno', nombre: 'Horno, latas y moldes', frec: 'Latas y moldes después de cada uso; horno al final de la jornada', diaria: true, sol: 'contacto', si: (d) => d.tipo === 'panaderia' || d.areas.includes('panaderia'),
    pasos: 'Con el horno frío, retira residuos y migas con cepillo. Limpia el interior con un paño húmedo y desengrasante. Lava latas y moldes con detergente, enjuaga, desinfecta con solución de 200 ppm y deja secar.' },
  { id: 'amasado', nombre: 'Mesa de amasado, amasadora y batidora', frec: 'Después de cada uso', diaria: true, sol: 'contacto', si: (d) => d.tipo === 'panaderia' || d.areas.includes('panaderia'),
    pasos: 'Desconecta el equipo. Retira la masa con espátula plástica. Lava las piezas desmontables con agua y detergente, enjuaga, desinfecta con solución de 200 ppm y deja secar antes de armar.' },
  { id: 'cafe', nombre: 'Máquina de café, licuadoras y molino', frec: 'Al final de cada jornada (vaso de licuadora después de cada uso)', diaria: true, sol: 'contacto', si: (d) => d.tipo === 'cafeteria',
    pasos: 'Sigue el manual de la máquina para la purga y limpieza del grupo y la lanceta. Lava vasos y piezas desmontables con detergente, enjuaga, desinfecta con solución de 200 ppm y deja secar.' },
  { id: 'tajadora', nombre: 'Tajadora, molino y gramera', frec: 'Después de cada uso y al cambiar de producto', diaria: true, sol: 'contacto', si: (d) => d.tipo === 'charcuteria',
    pasos: 'Desconecta el equipo y usa guante anticorte. Retira los residuos, desmonta las piezas que indica el fabricante, lava con detergente, enjuaga, desinfecta con solución de 200 ppm y deja secar antes de armar.' },
  { id: 'freidora', nombre: 'Freidoras', frec: 'Filtrado del aceite a diario; lavado al cambiar el aceite', diaria: false, cada: 'semanal', sol: 'ambiental', si: (d) => d.tipo === 'comidas_rapidas' || d.tipo === 'restaurante',
    pasos: 'Con el aceite frío, fíltralo a diario. Cámbialo cuando oscurezca, huela mal o haga espuma; el usado se guarda en recipiente cerrado para el gestor. Al cambiarlo, lava la cuba con desengrasante, enjuaga y seca bien.' },
  { id: 'vitrina', nombre: 'Vitrinas exhibidoras', frec: 'Al final de cada jornada', diaria: true, sol: 'contacto', si: (d) => ['panaderia', 'cafeteria', 'charcuteria', 'comidas_rapidas'].includes(d.tipo),
    pasos: 'Retira los productos a un lugar refrigerado o protegido. Limpia bandejas y vidrios con agua y detergente, enjuaga, desinfecta las bandejas con solución de 200 ppm y seca.' },
  { id: 'mostrador', nombre: 'Mostrador y barra de atención', frec: 'Al final de cada jornada y cuando se ensucie', diaria: true, sol: 'contacto', si: (d) => d.areas.includes('barra'),
    pasos: 'Retira objetos y residuos. Limpia con paño húmedo y detergente, enjuaga y aplica la solución de 200 ppm.' },
  { id: 'mesas', nombre: 'Mesas y sillas del comedor', frec: 'Después de cada cliente; sillas al final de la jornada', diaria: true, sol: 'contacto', si: (d) => d.areas.includes('comedor'),
    pasos: 'Retira residuos. Limpia con paño húmedo y detergente y luego con un paño con solución de 200 ppm. Usa paños distintos para mesas y para baños.' },
  { id: 'pisos', nombre: 'Pisos y sifones', frec: 'Al final de cada jornada (y cuando se ensucie)', diaria: true, sol: 'ambiental',
    pasos: 'Barre en húmedo para no levantar polvo. Restriega con agua y detergente, empezando por lo más limpio y terminando en la salida. Enjuaga, aplica solución de 500 ppm y retira el exceso con haragán. Limpia la rejilla del sifón.' },
  { id: 'canecas', nombre: 'Canecas de residuos', frec: 'Exterior a diario; interior cada semana o cuando se ensucien', diaria: true, sol: 'banos',
    pasos: 'Vacía la caneca. Lava por dentro y por fuera con agua, detergente y cepillo, en un lugar alejado de los alimentos. Aplica la solución de 1000 ppm, deja actuar 10 minutos, enjuaga y deja secar boca abajo antes de poner la bolsa nueva.' },
  { id: 'banos', nombre: 'Baños y lavamanos', frec: 'A diario y cuando se necesite', diaria: true, sol: 'banos',
    pasos: 'Con guantes y elementos exclusivos para el baño: retira la basura, lava sanitario, lavamanos y piso con detergente, enjuaga y aplica la solución de 1000 ppm. Repone jabón, toallas de papel y papel higiénico.' },
  { id: 'neveras', nombre: 'Neveras y congeladores', frec: 'Exterior a diario; interior cada semana; descongelado cada mes (o cuando el hielo pase de 1 cm)', diaria: false, cada: 'semanal', sol: 'contacto',
    pasos: 'Pasa los alimentos a otro equipo frío. Retira bandejas y lávalas con detergente. Limpia el interior con paño y detergente, enjuaga, aplica la solución de 200 ppm y seca. Vuelve a guardar los alimentos tapados y rotulados, cuando el equipo esté en su temperatura.' },
  { id: 'campana', nombre: 'Campana extractora y filtros', frec: 'Filtros cada semana; exterior a diario', diaria: false, cada: 'semanal', sol: 'ambiental', si: (d) => d.areas.includes('cocina'),
    pasos: 'Con la estufa apagada, retira los filtros y déjalos en remojo con agua caliente y desengrasante. Restriega, enjuaga y deja secar. Limpia el exterior de la campana con desengrasante.' },
  { id: 'paredes', nombre: 'Paredes, puertas, ventanas y mallas', frec: 'Cada semana (salpicaduras: de inmediato)', diaria: false, cada: 'semanal', sol: 'ambiental',
    pasos: 'De arriba hacia abajo: retira el polvo, lava con detergente y esponja, enjuaga y aplica solución de 500 ppm. Revisa que las mallas no estén rotas.' },
  { id: 'estanterias', nombre: 'Estanterías, bodega y canastas', frec: 'Cada semana', diaria: false, cada: 'semanal', sol: 'ambiental',
    pasos: 'Retira los productos, revisa fechas de vencimiento (lo primero que vence, lo primero que se usa). Limpia con paño y detergente, aplica solución de 500 ppm, deja secar y vuelve a ubicar los productos a 15 cm del piso y separados de la pared.' },
  { id: 'techos', nombre: 'Techos, lámparas y rejillas de ventilación', frec: 'Cada mes', diaria: false, cada: 'mensual', sol: 'ambiental',
    pasos: 'Cubre los alimentos y equipos. Retira polvo y telarañas con escoba de mango largo o paño húmedo. Limpia las lámparas apagadas y frías.' },
  { id: 'trampa', nombre: 'Trampa de grasa y desagües', frec: 'Cada mes (o antes si se llena)', diaria: false, cada: 'mensual', sol: 'banos', si: (d) => d.areas.includes('cocina') || d.areas.includes('lavado'),
    pasos: 'Fuera del horario de preparación: retira la grasa acumulada a una bolsa negra cerrada, lava con agua y detergente, aplica solución de 1000 ppm y deja correr agua.' },
];

function items(d) {
  return ITEMS.filter((it) => !it.si || it.si(d));
}

const nombreTipo = (d) => (TIPOS[d.tipo] || TIPOS.otro).nombre;
const equipos = (d) => [...d.refrigeracion.map((n) => ({ nombre: n, tipo: 'Refrigeración', rango: 'Entre 0 °C y 4 °C', max: 4 })),
  ...d.congelacion.map((n) => ({ nombre: n, tipo: 'Congelación', rango: '-18 °C o menos', max: -18 }))];

function campos(d) {
  return [
    ['Nombre del establecimiento', d.nombre], ...(d.razonSocial ? [['Razón social', d.razonSocial]] : []), ['NIT o cédula', d.nit],
    ['Dirección', d.direccion], ['Ciudad o municipio', `${d.ciudad}${d.departamento ? `, ${d.departamento}` : ''}`], ['Teléfono', d.telefono],
    ...(d.correo ? [['Correo', d.correo]] : []), ['Tipo de establecimiento', nombreTipo(d)], ['Propietario o representante', d.propietario],
    ['Responsable del plan de saneamiento', d.encargado], ...(d.horario ? [['Horario de atención', d.horario]] : []),
  ];
}

// ---------------------------------------------------------------------------- PLAN DE SANEAMIENTO
function plan(d) {
  const ini = F.fecha(d.inicio);
  const c = d.hipoclorito;
  const its = items(d);
  const B = [];
  const h1 = (t, salto = true) => B.push({ t: 'h1', texto: t, salto });
  const h2 = (t) => B.push({ t: 'h2', texto: t });
  const p = (t) => B.push({ t: 'p', texto: t });
  const ul = (xs) => B.push({ t: 'ul', items: xs });
  const tabla = (cols, filas, o = {}) => B.push({ t: 'tabla', cols, filas, ...o });

  B.push({ t: 'portada', kicker: `PLAN DE SANEAMIENTO BÁSICO · ${VERSION}`, titulo: d.nombre,
    subtitulo: 'Documento elaborado según la Resolución 2674 de 2013 del Ministerio de Salud y Protección Social (artículo 26)',
    campos: [...campos(d), ['Fecha de elaboración', F.larga(ini)], ['Revisión', 'Una vez al año, o antes si cambian los procesos, el personal, los equipos o las instalaciones']],
    pie: 'Este plan debe estar escrito, firmado y disponible en el establecimiento para la autoridad sanitaria. Lo escrito aquí debe cumplirse en el día a día: la visita verifica el documento, los registros y las condiciones reales del local.' });
  B.push({ t: 'firmas', items: [`Elaboró: ${d.encargado}\nResponsable del plan`, `Aprobó: ${d.propietario}\nPropietario o representante`] });

  h1('Contenido', true);
  ul(['1. Introducción y objetivos', '2. Alcance y marco normativo', '3. Información del establecimiento', '4. Responsables', '5. Definiciones',
    '6. Programa de Limpieza y Desinfección (con POES)', '7. Programa de Manejo de Residuos Sólidos', '8. Programa de Control Integral de Plagas',
    '9. Programa de Abastecimiento de Agua Potable', '10. Salud y capacitación del personal manipulador', '11. Registros, verificación y acciones correctivas',
    '12. Lista de chequeo de verificación', '13. Control de cambios']);

  h1('1. Introducción y objetivos', false);
  p(`El Plan de Saneamiento Básico de ${d.nombre} reúne los procedimientos, cronogramas, registros, listas de chequeo y responsables de los cuatro programas que exige el artículo 26 de la Resolución 2674 de 2013: limpieza y desinfección, manejo de residuos sólidos, control integral de plagas y abastecimiento de agua potable. Su propósito es prevenir la contaminación de los alimentos que se preparan, almacenan y venden en el establecimiento.`);
  h2('Objetivo general');
  p('Mantener las instalaciones, equipos, utensilios y personal en condiciones higiénicas que reduzcan el riesgo de contaminación física, química y biológica de los alimentos.');
  h2('Objetivos específicos');
  ul(['Definir qué se limpia y desinfecta, cómo, con qué producto, con qué frecuencia y quién lo hace.',
    'Separar, almacenar y entregar los residuos sin que se conviertan en foco de plagas o contaminación.',
    'Prevenir la entrada y el refugio de plagas, y contar con el servicio de una empresa autorizada para el control químico.',
    'Garantizar que el agua usada para preparar alimentos, lavar y desinfectar sea potable, en cantidad suficiente.',
    'Dejar evidencia diaria en los registros (planillas) de que los procedimientos se cumplen, y corregir a tiempo lo que falle.']);

  h1('2. Alcance y marco normativo');
  p(`Aplica a todas las áreas del establecimiento (${d.areas.map((a) => AREAS[a]).join('; ')}), a sus equipos y utensilios y a todas las personas que trabajan en él, incluido el personal temporal.`);
  tabla([{ titulo: 'Norma', ancho: 0.32 }, { titulo: 'Qué regula', ancho: 0.68 }], [
    ['Ley 9 de 1979', 'Código Sanitario Nacional: medidas sanitarias generales para alimentos y establecimientos.'],
    ['Resolución 2674 de 2013 (Ministerio de Salud)', 'Requisitos sanitarios para quienes fabrican, preparan, almacenan, transportan y venden alimentos. Artículo 26: plan de saneamiento. Artículo 11: estado de salud del manipulador. Artículo 12: educación y capacitación.'],
    ['Resolución 1229 de 2013 (Ministerio de Salud)', 'Modelo de inspección, vigilancia y control sanitario que aplican las secretarías de salud.'],
    ['Decreto 1575 de 2007 y Resolución 2115 de 2007', 'Calidad del agua para consumo humano (cloro residual libre de 0,3 a 2,0 mg/L y pH de 6,5 a 9,0) y lavado de tanques de almacenamiento.'],
    ['Resolución 2184 de 2019 (Ministerio de Ambiente)', 'Código de colores para separar los residuos: blanco (aprovechables), verde (orgánicos aprovechables) y negro (no aprovechables).'],
    ['Resolución 316 de 2018 (Ministerio de Ambiente)', 'Manejo del aceite de cocina usado: se entrega a un gestor registrado, nunca al desagüe.'],
  ]);
  B.push({ t: 'nota', texto: `La secretaría de salud de ${d.ciudad} puede pedir requisitos o formatos adicionales. Si en la visita te piden un cambio, ajústalo en la versión de Word de este documento y regístralo en el control de cambios.` });

  h1('3. Información del establecimiento');
  tabla([{ titulo: 'Dato', ancho: 0.38 }, { titulo: 'Valor', ancho: 0.62 }], campos(d));
  h2('Áreas del establecimiento');
  ul(d.areas.map((a) => AREAS[a]));
  h2('Equipos de frío');
  const eqs = equipos(d);
  if (eqs.length) tabla([{ titulo: 'Equipo', ancho: 0.45 }, { titulo: 'Tipo', ancho: 0.25 }, { titulo: 'Temperatura de trabajo', ancho: 0.3 }], eqs.map((e) => [e.nombre, e.tipo, e.rango]));
  else p('El establecimiento no reporta equipos de frío. Si instala alguno, inclúyalo en este plan y en el registro de temperaturas.');
  h2('Abastecimiento de agua');
  p(d.agua === 'tanque' ? `Acueducto con tanque de almacenamiento${d.tanqueLitros ? ` de ${d.tanqueLitros.toLocaleString('es-CO')} litros` : ''}.` : 'Acueducto municipal, conectado directamente a la red (sin tanque de almacenamiento).');

  h1('4. Responsables');
  tabla([{ titulo: 'Rol', ancho: 0.24 }, { titulo: 'Nombre', ancho: 0.26 }, { titulo: 'Funciones', ancho: 0.5 }], [
    ['Propietario o representante', d.propietario, 'Aprueba el plan, asigna los recursos (productos, elementos, servicios externos) y garantiza que se cumpla.'],
    ['Responsable del plan', d.encargado, 'Capacita al personal, verifica a diario los registros, firma las planillas, aplica las acciones correctivas, programa los servicios externos y actualiza el plan.'],
    ['Manipuladores de alimentos', d.manipuladores.join(', '), 'Cumplen los procedimientos de limpieza y desinfección, residuos e higiene personal, y diligencian las planillas en el momento en que hacen cada actividad.'],
    ['Empresas externas', d.empresaPlagas ? `${d.empresaPlagas} (control de plagas)` : 'Por definir', 'Control químico de plagas y lavado de tanque, con concepto sanitario vigente; entregan certificado de cada servicio.'],
  ]);

  h1('5. Definiciones');
  tabla([{ titulo: 'Término', ancho: 0.27 }, { titulo: 'Significado', ancho: 0.73 }], [
    ['Limpieza', 'Quitar la suciedad, los restos de alimentos y la grasa con agua y detergente.'],
    ['Desinfección', 'Reducir los microorganismos de una superficie limpia hasta un nivel seguro, con un desinfectante o con calor.'],
    ['ppm', 'Partes por millón: la concentración de la solución desinfectante (200 ppm = 200 mg de cloro por litro).'],
    ['POES', 'Procedimiento Operativo Estandarizado de Saneamiento: el paso a paso escrito para limpiar y desinfectar cada área o equipo.'],
    ['Contaminación cruzada', 'Paso de microorganismos o sustancias de un alimento crudo, una superficie o una persona a un alimento listo para consumir.'],
    ['Plaga', 'Animales que pueden contaminar los alimentos: cucarachas, moscas, roedores, hormigas, aves, entre otros.'],
    ['Control integral de plagas', 'Medidas preventivas (estructura, orden y limpieza) más el control químico hecho por una empresa autorizada.'],
    ['Residuo aprovechable', 'Plástico, vidrio, metal, papel, cartón y multicapa limpios y secos (bolsa blanca).'],
    ['Residuo orgánico aprovechable', 'Restos de comida, cáscaras y residuos de alimentos (bolsa verde).'],
    ['Residuo no aprovechable', 'Papel higiénico, servilletas sucias y empaques contaminados con comida o grasa (bolsa negra).'],
    ['Agua potable', 'Agua apta para consumo humano según la Resolución 2115 de 2007.'],
    ['Cloro residual libre', 'Cloro que queda en el agua después de desinfectarla; protege el agua hasta el grifo.'],
    ['Acción correctiva', 'Lo que se hace cuando algo se sale de lo establecido, para corregirlo y evitar que se repita.'],
    ['Manipulador de alimentos', 'Toda persona que tiene contacto con alimentos, superficies o utensilios que tocan alimentos.'],
  ]);

  // ------------------------------------------------ 6. Limpieza y desinfección
  h1('6. Programa de Limpieza y Desinfección');
  h2('Objetivo');
  p('Establecer los procedimientos, frecuencias, productos y responsables para limpiar y desinfectar áreas, equipos, utensilios y superficies, de modo que no sean fuente de contaminación.');
  h2('Responsables');
  p(`Ejecutan: los manipuladores de alimentos (${d.manipuladores.join(', ')}). Verifica y firma: ${d.encargado}.`);
  h2('Productos y elementos');
  tabla([{ titulo: 'Producto o elemento', ancho: 0.3 }, { titulo: 'Para qué se usa', ancho: 0.4 }, { titulo: 'Cuidados', ancho: 0.3 }], [
    ['Detergente líquido o en polvo', 'Limpieza de todas las superficies', 'Enjuagar bien antes de desinfectar.'],
    ['Desengrasante', 'Estufas, campanas, freidoras y hornos', 'Usar con guantes; no mezclar con hipoclorito.'],
    [`Hipoclorito de sodio al ${fmt(c)} %`, 'Desinfección (ver tabla de soluciones)', 'Preparar cada día; no mezclar con ácidos, amoníaco ni otros limpiadores; guardar lejos de los alimentos.'],
    ['Jabón antibacterial de manos y toallas de papel', 'Lavado de manos', 'Dispensador lleno en cada lavamanos.'],
    ['Esponjas, cepillos, haraganes y traperos', 'Limpieza', 'Separados y marcados: unos para cocina y otros para baños. Cambiar cuando estén gastados.'],
    ['Atomizadores y baldes rotulados', 'Aplicar las soluciones', 'Cada recipiente con el nombre de la solución y su concentración.'],
    ['Guantes, delantal y tapabocas', 'Protección del trabajador', 'De uso exclusivo para limpieza.'],
  ]);
  h2('Preparación de las soluciones desinfectantes');
  p(`Fórmula: mL de hipoclorito = (ppm que necesitas × litros de agua) ÷ (concentración del hipoclorito en % × 10). Con el hipoclorito al ${fmt(c)} % que usa el establecimiento:`);
  tabla([{ titulo: 'Uso', ancho: 0.42 }, { titulo: 'Concentración', ancho: 0.14, align: 'center' }, { titulo: 'Por 1 litro de agua', ancho: 0.14, align: 'center' }, { titulo: 'Por 10 litros', ancho: 0.12, align: 'center' }, { titulo: 'Tiempo de contacto', ancho: 0.18 }],
    SOLUCIONES.map((s) => [s.uso, `${s.ppm} ppm`, `${fmt(mlPorLitro(s.ppm, c))} mL`, `${fmt(Math.round(mlPorLitro(s.ppm, c) * 10))} mL`, s.tiempo]));
  ul(['Mide el hipoclorito con una jeringa o un vaso medidor exclusivo; nunca "a ojo".',
    'Prepara las soluciones al empezar la jornada: con el tiempo pierden fuerza. Regístralo en la planilla RG-03.',
    'Si usas otro desinfectante (amonio cuaternario, ácido peracético o un producto para frutas y verduras), sigue la dosis de su etiqueta o ficha técnica y guarda esa ficha en la carpeta.',
    'Para las manos no se usa hipoclorito: se usa jabón antibacterial.']);
  h2('Procedimiento general de limpieza y desinfección');
  ul(['1. Retirar residuos y restos de alimentos.', '2. Lavar con agua y detergente, restregando.', '3. Enjuagar con agua potable hasta quitar el detergente.',
    '4. Desinfectar con la solución que corresponde.', '5. Dejar actuar el tiempo de contacto y dejar secar al aire (no secar con limpiones).']);
  h2('POES por superficie y equipo');
  tabla([{ titulo: 'Superficie o equipo', ancho: 0.2 }, { titulo: 'Frecuencia', ancho: 0.18 }, { titulo: 'Procedimiento', ancho: 0.44 }, { titulo: 'Solución', ancho: 0.18 }],
    its.map((it) => { const s = SOLUCIONES.find((x) => x.id === it.sol); return [{ texto: it.nombre, bold: true }, it.frec, it.pasos, `${s.ppm} ppm (${fmt(mlPorLitro(s.ppm, c))} mL por litro)`]; }), { size: 7.6 });
  h2('Lavado de manos');
  p('Todo el personal se lava las manos al entrar a trabajar, antes de tocar alimentos, después de ir al baño, de tocar alimentos crudos, basura, dinero, el celular o la cara, de toser o estornudar y después de limpiar. Pasos: mojar las manos, aplicar jabón, frotar palmas, dorso, entre los dedos, uñas y muñecas durante al menos 20 segundos, enjuagar, secar con toalla de papel y cerrar la llave con la misma toalla.');
  h2('Verificación y acciones correctivas');
  ul(['Cada día, quien limpia marca la tarea en la planilla RG-02; el responsable revisa y firma.',
    'Si una superficie queda sucia o con olor, se repite el procedimiento completo y se anota en observaciones.',
    'Si se acaba un producto, se repone el mismo día; mientras tanto no se prepara en la superficie afectada.']);

  // ------------------------------------------------ 7. Residuos
  h1('7. Programa de Manejo de Residuos Sólidos');
  h2('Objetivo');
  p('Separar en la fuente, almacenar y entregar los residuos de forma que no contaminen los alimentos ni atraigan plagas, cumpliendo el código de colores nacional.');
  h2('Clasificación y código de colores (Resolución 2184 de 2019)');
  tabla([{ titulo: 'Bolsa / caneca', ancho: 0.2 }, { titulo: 'Tipo de residuo', ancho: 0.25 }, { titulo: 'Ejemplos en el establecimiento', ancho: 0.55 }], [
    [{ texto: 'VERDE', bold: true, relleno: '#bbf7d0' }, 'Orgánicos aprovechables', 'Cáscaras, restos de frutas y verduras, restos de comida, cunchos de café, cáscaras de huevo.'],
    [{ texto: 'BLANCA', bold: true }, 'Aprovechables', 'Plástico, vidrio, latas, papel y cartón limpios y secos, cajas de leche o jugo (multicapa).'],
    [{ texto: 'NEGRA', bold: true, relleno: '#cbd5e1' }, 'No aprovechables', 'Servilletas y papel sucios, papel higiénico, empaques con grasa o comida, barrido.'],
    [{ texto: 'ACEITE USADO', bold: true, relleno: '#fde68a' }, 'Aceite de cocina usado', 'En recipiente plástico cerrado y rotulado. Se entrega a un gestor registrado con certificado (Resolución 316 de 2018). Nunca al desagüe ni a la basura.'],
  ]);
  h2('Procedimiento');
  ul(['Canecas con tapa de pedal, lavables, rotuladas y con la bolsa del color que corresponde, en cada área donde se generan residuos.',
    'Las canecas se vacían cuando lleguen a 3/4 de su capacidad y siempre al final de la jornada. Nunca se dejan residuos en las áreas de preparación de un día para otro.',
    'Las bolsas se cierran y se llevan al área de almacenamiento temporal por la ruta más corta, sin pasar sobre alimentos destapados.',
    'El área de almacenamiento de residuos está separada de las áreas de alimentos, cubierta, con canecas tapadas y se limpia y desinfecta cada vez que se entregan los residuos.',
    'Los residuos se sacan en los días y horarios del operador de aseo de la ciudad. Los aprovechables se pueden entregar a un reciclador de oficio u organización de recicladores.',
    'Después de manipular residuos, el personal se lava las manos antes de volver a tocar alimentos.']);
  h2('Verificación y acciones correctivas');
  ul(['Registro diario en la planilla RG-06 (bolsas por tipo, aceite entregado y limpieza de canecas).',
    'Si una caneca está rota, sin tapa o sin bolsa del color correcto, se cambia el mismo día.',
    'Si aparecen moscas o malos olores en el área de residuos, se adelanta la limpieza y se revisa la frecuencia de entrega.']);

  // ------------------------------------------------ 8. Plagas
  h1('8. Programa de Control Integral de Plagas');
  h2('Objetivo');
  p('Evitar la entrada, el refugio y la proliferación de plagas con medidas preventivas, inspecciones internas y el control químico hecho por una empresa autorizada.');
  h2('Medidas preventivas');
  ul(['Puertas ajustadas al piso, ventanas con malla, rejillas en sifones y desagües, y grietas selladas.',
    'Alimentos guardados en recipientes cerrados, sobre estibas o estantes a 15 cm del piso y separados de la pared.',
    'Rotación de inventario: lo primero que entra (o vence) es lo primero que sale.',
    'Sin residuos de comida en superficies, pisos ni canecas destapadas al final de la jornada.',
    'Sin objetos en desuso, cajas o cartones acumulados, que sirven de refugio.']);
  h2('Inspección interna (semanal)');
  p('Cada semana el responsable recorre todas las áreas y anota en la planilla RG-05 si encuentra evidencias: excrementos, huellas, roeduras, insectos vivos o muertos, nidos o malos olores; y el estado de mallas, puertas, sellos y sifones.');
  tabla([{ titulo: 'Punto de inspección', ancho: 0.55 }, { titulo: 'Qué revisar', ancho: 0.45 }], [
    ...d.areas.map((a) => [AREAS[a], a === 'residuos' ? 'Canecas tapadas, piso limpio, sin moscas ni roedores' : a === 'recepcion' ? 'Empaques sin roeduras, estantes a 15 cm del piso' : 'Rincones, debajo de equipos, sifones, mallas y puertas']),
  ]);
  h2('Control químico');
  p(`Lo hace únicamente una empresa de control de plagas con concepto sanitario vigente${d.empresaPlagas ? ` (actualmente: ${d.empresaPlagas})` : ''}, cada ${d.frecuenciaPlagas} meses o con la frecuencia que la empresa recomiende según los hallazgos. El personal del establecimiento no aplica venenos ni cebos dentro de las áreas de alimentos.`);
  ul(['Antes del servicio: guardar o cubrir alimentos, utensilios y equipos.',
    'Después del servicio: respetar el tiempo de reingreso que indique la empresa, ventilar, y lavar y desinfectar superficies y utensilios antes de volver a preparar.',
    'Pedir y archivar el certificado de cada servicio (fecha, productos, dosis, áreas tratadas y próxima fecha) y la copia del concepto sanitario de la empresa.']);
  h2('Acciones correctivas');
  ul(['Si se encuentran evidencias: limpiar y desinfectar la zona, retirar alimentos posiblemente contaminados, sellar la entrada encontrada y, si se repite, llamar a la empresa para un servicio adicional.']);

  // ------------------------------------------------ 9. Agua
  h1('9. Programa de Abastecimiento de Agua Potable');
  h2('Objetivo');
  p('Garantizar que el agua para preparar alimentos, lavar y desinfectar sea potable y suficiente, y conservar su calidad dentro del establecimiento.');
  h2('Fuente y almacenamiento');
  p(d.agua === 'tanque'
    ? `El agua llega del acueducto y se almacena en un tanque${d.tanqueLitros ? ` de ${d.tanqueLitros.toLocaleString('es-CO')} litros` : ''}. El tanque se mantiene tapado y se lava y desinfecta como mínimo cada 6 meses (Decreto 1575 de 2007) por una empresa registrada, que entrega certificado. Algunas secretarías piden hacerlo más seguido: confirma con la tuya.`
    : 'El agua llega directamente de la red del acueducto, sin tanque de almacenamiento. Si en el futuro se instala un tanque, debe lavarse y desinfectarse como mínimo cada 6 meses (Decreto 1575 de 2007).');
  h2('Verificación de la calidad (semanal)');
  ul(['Cada semana se mide en el grifo de la cocina el cloro residual libre y el pH con un kit comparador (se consigue en tiendas de piscinas o de productos de laboratorio).',
    'Valores aceptables (Resolución 2115 de 2007): cloro residual libre de 0,3 a 2,0 mg/L y pH de 6,5 a 9,0. El agua debe verse clara y sin olor ni sabor extraños.',
    'Se anota en la planilla RG-07, junto con el lavado del tanque cuando aplique.']);
  h2('Acciones correctivas');
  ul(['Cloro por debajo de 0,3 mg/L, agua turbia o con olor: avisar a la empresa de acueducto, no usar esa agua para preparar alimentos ni para la última enjuagada, y usar agua potable envasada hasta que se normalice.',
    'Corte de agua: suspender la preparación si no hay agua potable suficiente para lavarse las manos y lavar utensilios.']);

  // ------------------------------------------------ 10. Personal
  h1('10. Salud y capacitación del personal manipulador');
  h2('Estado de salud (artículo 11)');
  p('Cada manipulador cuenta con certificado médico de aptitud para manipular alimentos, renovado por lo menos una vez al año, que se archiva en la carpeta. Quien tenga diarrea, vómito, fiebre, infecciones en la piel, heridas sin cubrir o síntomas respiratorios no manipula alimentos hasta recuperarse.');
  h2('Prácticas higiénicas');
  ul(['Uniforme limpio y completo, de color claro, solo para el trabajo; gorro o cofia que cubra todo el cabello; tapabocas cuando se requiera.',
    'Uñas cortas, limpias y sin esmalte; sin joyas, relojes ni accesorios; sin maquillaje en exceso.',
    'No comer, fumar, masticar chicle ni usar el celular en las áreas de preparación.',
    'Lavado de manos frecuente según el procedimiento del numeral 6.']);
  p('La verificación diaria se registra en la planilla RG-08.');
  h2('Capacitación (artículo 12)');
  p('El personal recibe capacitación continua en buenas prácticas de manipulación desde que ingresa. Programa sugerido de 10 horas en el año (varias secretarías piden esta intensidad):');
  tabla([{ titulo: 'Sesión', ancho: 0.1, align: 'center' }, { titulo: 'Tema', ancho: 0.6 }, { titulo: 'Duración', ancho: 0.15, align: 'center' }, { titulo: 'Mes', ancho: 0.15 }],
    CAPACITACIONES.map((t, i) => [String(i + 1), t, '2,5 horas', F.mesAnio(F.masMeses(ini, i))]));
  p('La capacitación la puede dar el responsable del plan o una persona o entidad idónea. Si la hace una entidad externa, se archiva su constancia. La asistencia se registra en la planilla RG-09.');

  // ------------------------------------------------ 11. Registros
  h1('11. Registros, verificación y acciones correctivas');
  tabla([{ titulo: 'Código', ancho: 0.11 }, { titulo: 'Registro', ancho: 0.45 }, { titulo: 'Frecuencia', ancho: 0.22 }, { titulo: 'Quién lo diligencia', ancho: 0.22 }],
    REGISTROS.map((r) => [r.codigo, r.titulo, r.frecuencia, r.quien]));
  ul(['Las planillas se diligencian en el momento en que se hace la actividad, con bolígrafo, sin tachones ni corrector. Un error se corrige con una línea, la corrección y la firma.',
    'El responsable revisa y firma los registros cada semana.',
    'Los registros se archivan en la carpeta del plan por lo menos un año.',
    'Toda lectura o actividad fuera de lo establecido lleva su acción correctiva escrita en la misma planilla.']);

  h1('12. Lista de chequeo de verificación');
  p('El responsable la diligencia cada mes en la planilla RG-10. Estos son los puntos que se revisan:');
  tabla([{ titulo: 'N°', ancho: 0.07, align: 'center' }, { titulo: 'Punto de verificación', ancho: 0.93 }], CHEQUEO.map((t, i) => [String(i + 1), t]), { size: 8 });

  h1('13. Control de cambios');
  tabla([{ titulo: 'Versión', ancho: 0.12 }, { titulo: 'Fecha', ancho: 0.2 }, { titulo: 'Descripción del cambio', ancho: 0.48 }, { titulo: 'Aprobó', ancho: 0.2 }],
    [['01', F.corta(ini), 'Elaboración del plan', d.propietario], ['', '', '', ''], ['', '', '', ''], ['', '', '', '']]);
  B.push({ t: 'firmas', items: [`${d.encargado}\nResponsable del plan`, `${d.propietario}\nPropietario o representante`] });
  return B;
}

const CAPACITACIONES = [
  'Buenas prácticas de manipulación (Resolución 2674 de 2013): salud e higiene del manipulador, lavado de manos y uniforme',
  'Limpieza y desinfección: preparación de soluciones y POES del establecimiento',
  'Contaminación cruzada, cadena de frío, temperaturas y recepción de materias primas',
  'Manejo de residuos, control de plagas y agua potable',
];

const REGISTROS = [
  { codigo: 'RG-01', id: 'temperaturas', titulo: 'Control de temperaturas de equipos de frío', frecuencia: '2 veces al día', quien: 'Manipulador asignado' },
  { codigo: 'RG-02', id: 'limpieza', titulo: 'Limpieza y desinfección de áreas y equipos', frecuencia: 'Diaria, semanal y mensual', quien: 'Quien hace la limpieza' },
  { codigo: 'RG-03', id: 'soluciones', titulo: 'Preparación de soluciones desinfectantes', frecuencia: 'Diaria', quien: 'Quien prepara la solución' },
  { codigo: 'RG-04', id: 'recepcion', titulo: 'Recepción de materias primas', frecuencia: 'En cada entrega', quien: 'Quien recibe el pedido' },
  { codigo: 'RG-05', id: 'plagas', titulo: 'Inspección y control de plagas', frecuencia: 'Semanal y en cada servicio', quien: 'Responsable del plan' },
  { codigo: 'RG-06', id: 'residuos', titulo: 'Manejo de residuos sólidos', frecuencia: 'Diaria', quien: 'Manipulador asignado' },
  { codigo: 'RG-07', id: 'agua', titulo: 'Control de agua potable', frecuencia: 'Semanal', quien: 'Responsable del plan' },
  { codigo: 'RG-08', id: 'higiene', titulo: 'Higiene y estado de salud del personal', frecuencia: 'Diaria', quien: 'Responsable del plan' },
  { codigo: 'RG-09', id: 'capacitacion', titulo: 'Asistencia a capacitación', frecuencia: 'En cada sesión', quien: 'Responsable del plan' },
  { codigo: 'RG-10', id: 'chequeo', titulo: 'Lista de chequeo de verificación del plan', frecuencia: 'Mensual', quien: 'Responsable del plan' },
];

const CHEQUEO = [
  'El plan de saneamiento está escrito, firmado y disponible en el establecimiento.',
  'Las planillas del mes están al día, diligenciadas y firmadas.',
  'Las superficies, equipos y utensilios están limpios y en buen estado.',
  'Hay detergente, desinfectante, jabón de manos y toallas de papel suficientes.',
  'Las soluciones desinfectantes se preparan a diario y los recipientes están rotulados.',
  'Las neveras y congeladores están en su rango de temperatura y tienen termómetro.',
  'Los alimentos están tapados, rotulados, sobre estantes a 15 cm del piso y sin productos vencidos.',
  'Las canecas tienen tapa, pedal y la bolsa del color correcto; el área de residuos está limpia.',
  'El aceite usado se guarda en recipiente cerrado y se entrega a un gestor con certificado.',
  'No hay evidencias de plagas; mallas, puertas, sellos y rejillas están en buen estado.',
  'El certificado del último servicio de control de plagas está vigente y archivado.',
  'El agua cumple los valores de cloro y pH de la última medición; el tanque (si hay) tiene su certificado de lavado vigente.',
  'El personal tiene uniforme completo, uñas cortas, sin joyas, y se lava las manos correctamente.',
  'Los certificados médicos y las constancias de capacitación del personal están vigentes y archivados.',
  'Las acciones correctivas del mes anterior se cumplieron.',
];

// ---------------------------------------------------------------------------- CRONOGRAMAS
function cronogramas(d) {
  const ini = F.fecha(d.inicio);
  const its = items(d);
  const meses = Array.from({ length: 12 }, (_, i) => F.masMeses(ini, i));
  const marca = (ms) => meses.map((_, i) => ({ texto: ms.includes(i) ? 'X' : '', align: 'center', bold: true, relleno: ms.includes(i) ? '#ccfbf1' : null }));
  const cada = (n) => meses.map((_, i) => i).filter((i) => i % n === 0);
  const actividades = [
    ['Control de plagas por empresa autorizada (con certificado)', cada(d.frecuenciaPlagas)],
    ...(d.agua === 'tanque' ? [['Lavado y desinfección del tanque de agua (con certificado)', cada(6)]] : []),
    ['Capacitación del personal (2,5 h por sesión)', [0, 1, 2, 3]],
    ['Certificado médico de los manipuladores (renovación anual)', [0]],
    ['Verificación de termómetros (punto de hielo: 0 °C ± 1 °C)', cada(1)],
    ['Descongelado y limpieza profunda de congeladores', cada(1)],
    ['Mantenimiento preventivo de neveras y congeladores', cada(6)],
    ['Revisión de mallas, sellos, puertas y rejillas', cada(3)],
    ['Lista de chequeo de verificación del plan (RG-10)', cada(1)],
    ['Revisión y actualización del plan de saneamiento', [11]],
  ];
  return [
    { t: 'portada', kicker: `CRONOGRAMAS · ${VERSION}`, titulo: d.nombre, subtitulo: 'Cronograma de limpieza y desinfección y cronograma de actividades del año', campos: [['NIT o cédula', d.nit], ['Responsable', d.encargado], ['Desde', F.larga(ini)]] },
    { t: 'h1', texto: 'Cronograma de limpieza y desinfección', salto: true },
    { t: 'tabla', cols: [{ titulo: 'Superficie o equipo', ancho: 0.34 }, { titulo: 'Frecuencia', ancho: 0.4 }, { titulo: 'Registro', ancho: 0.1, align: 'center' }, { titulo: 'Responsable', ancho: 0.16 }],
      filas: its.map((it) => [it.nombre, it.frec, it.diaria ? 'RG-02' : 'RG-02 (sem./mes)', it.id === 'banos' || it.id === 'canecas' ? 'Manipulador asignado' : 'Quien usa el equipo']) },
    { t: 'h1', texto: 'Cronograma de actividades del año', salto: true },
    { t: 'p', texto: `Meses desde ${F.mesAnio(ini)}. Las fechas exactas de los servicios externos las fija cada empresa; anótalas en la planilla correspondiente.` },
    { t: 'tabla', size: 6.8, cols: [{ titulo: 'Actividad', ancho: 0.34 }, ...meses.map((m) => ({ titulo: `${F.MESES[m.getUTCMonth()].slice(0, 3)}\n${m.getUTCFullYear()}`, ancho: 0.055, align: 'center' }))],
      filas: actividades.map(([a, ms]) => [a, ...marca(ms)]) },
    { t: 'firmas', items: [`${d.encargado}\nResponsable del plan`] },
  ];
}

// ---------------------------------------------------------------------------- CHECKLIST DE LA VISITA
function checklist(d, plan) {
  const docs = [
    'Plan de Saneamiento Básico firmado (impreso) y su versión en Word para ajustes',
    'Cronogramas de limpieza y de actividades del año',
    'Planillas RG-01 a RG-10 al día (temperaturas, limpieza, soluciones, recepción, plagas, residuos, agua, higiene, capacitación y lista de chequeo)',
    'Carteles pegados: lavado de manos, código de colores, normas de higiene, soluciones, temperaturas y acceso restringido',
  ];
  const ext = [
    ['Certificado del servicio de control de plagas', 'Empresa de control de plagas con concepto sanitario favorable vigente', `Cada ${d.frecuenciaPlagas} meses o según la empresa`, 'Fecha, áreas tratadas, productos y dosis, firma del técnico y próxima fecha. Pide también copia del concepto sanitario de la empresa.'],
    ['Certificado de lavado y desinfección del tanque de agua', 'Empresa registrada para lavado de tanques', 'Mínimo cada 6 meses (Decreto 1575 de 2007)', d.agua === 'tanque' ? 'Aplica: tu local tiene tanque.' : 'Solo si el local tiene tanque de almacenamiento.'],
    ['Certificado médico de cada manipulador', 'Médico o IPS (examen de aptitud para manipular alimentos)', 'Al ingresar y por lo menos una vez al año (Res. 2674, art. 11)', `Uno por persona: ${d.manipuladores.join(', ')}.`],
    ['Constancia del curso de manipulación de alimentos', 'Persona o entidad capacitadora idónea (algunas secretarías ofrecen cursos gratuitos)', 'Capacitación continua; varias secretarías piden 10 h al año', 'Con nombre y documento del trabajador, horas, temas y fecha.'],
    ['Certificado de entrega del aceite de cocina usado', 'Gestor de aceite registrado ante la autoridad ambiental', 'En cada entrega', 'Aplica si se fríe o se usa aceite en cantidad.'],
    ['Fichas técnicas y hojas de seguridad de los productos de limpieza', 'Proveedor de los productos', 'Al cambiar de producto', 'Especialmente del desinfectante y su concentración.'],
  ];
  return [
    { t: 'portada', kicker: 'CARPETA PARA LA VISITA DE LA SECRETARÍA DE SALUD', titulo: d.nombre, subtitulo: 'Qué documentos tener listos y qué certificados externos debes conseguir y anexar', campos: [['NIT o cédula', d.nit], ['Ciudad', d.ciudad], ['Responsable', d.encargado]],
      pie: 'Importante: este paquete trae toda la documentación, los procedimientos y las planillas. Los certificados de la tabla de certificados externos no se pueden generar aquí: los expiden empresas, médicos o entidades autorizadas después de prestar el servicio.' },
    { t: 'h1', texto: '1. Documentos de este paquete', salto: true },
    { t: 'tabla', cols: [{ titulo: '¿Lo tengo?', ancho: 0.12, align: 'center' }, { titulo: 'Documento', ancho: 0.88 }], filas: docs.map((x) => ['[   ]', x]) },
    { t: 'h1', texto: '2. Certificados externos que debes anexar', salto: false },
    { t: 'tabla', size: 7.6, cols: [{ titulo: '¿Lo tengo?', ancho: 0.09, align: 'center' }, { titulo: 'Certificado', ancho: 0.21 }, { titulo: 'Quién lo expide', ancho: 0.24 }, { titulo: 'Cada cuánto', ancho: 0.18 }, { titulo: 'Qué debe decir', ancho: 0.28 }],
      filas: ext.map((r) => ['[   ]', { texto: r[0], bold: true }, r[1], r[2], r[3]]) },
    { t: 'h1', texto: '3. Otros documentos que suelen pedir', salto: false },
    { t: 'ul', items: ['Registro mercantil (Cámara de Comercio) y RUT del establecimiento.', 'Acta o concepto sanitario de la visita anterior, si existe, con las acciones que se pidieron corregir.',
      'Facturas o remisiones de los proveedores (los productos empacados deben tener registro, permiso o notificación sanitaria INVIMA).',
      'Recibos o contrato del servicio de aseo.'] },
    { t: 'h1', texto: '4. El día de la visita', salto: false },
    { t: 'ul', items: ['Ten la carpeta en un lugar fijo y conocido por todo el personal.', 'Muestra las planillas del día al día: lo que más se revisa es que estén diligenciadas en el momento y firmadas.',
      'Deja que el inspector vea las neveras, la bodega, el área de residuos y los baños: deben coincidir con lo que dice el plan.',
      'Anota las observaciones del acta y corrígelas en el plazo que te den; regístralo en el control de cambios del plan.'] },
    { t: 'nota', texto: plan === 'llave'
      ? 'Tu Plan Llave en Mano trae las planillas de 4 meses ya armadas con fechas, equipos, áreas, personal y rangos. Cada día tu equipo solo escribe la lectura o marca la tarea en el momento en que la hace, y firma. Las lecturas no vienen escritas: deben corresponder a lo que realmente pasó en tu local.'
      : 'Las planillas en blanco vienen con los datos de tu negocio. Fotocópialas o imprímelas cada mes y diligéncialas en el momento en que haces cada actividad.' },
  ];
}

// ---------------------------------------------------------------------------- CARTELES
function carteles(d) {
  const c = d.hipoclorito;
  return [
    { titulo: 'LÁVATE LAS MANOS', color: '#0e7490', sub: 'Antes de tocar alimentos y cada vez que cambies de tarea',
      lineas: ['1. Moja tus manos con agua', '2. Aplica jabón antibacterial', '3. Frota palmas, dorso y entre los dedos', '4. Limpia uñas y muñecas (20 segundos o más)', '5. Enjuaga con abundante agua', '6. Seca con toalla de papel', '7. Cierra la llave con la toalla'],
      pie: 'Al entrar · después del baño · después de tocar crudos, basura, dinero o celular · después de toser o estornudar' },
    { titulo: 'SEPARA TUS RESIDUOS', color: '#166534', sub: 'Código de colores nacional · Resolución 2184 de 2019', residuos: true },
    { titulo: 'NORMAS DE HIGIENE', color: '#1e3a8a', sub: 'Para todo el personal que manipula alimentos',
      lineas: ['Uniforme limpio y completo, gorro que cubra todo el cabello', 'Uñas cortas, limpias y sin esmalte', 'Sin anillos, pulseras, relojes ni aretes', 'No comer, fumar ni masticar chicle aquí', 'No usar el celular mientras preparas alimentos', 'Si estás enfermo o tienes heridas, avisa a tu jefe', 'Lávate las manos antes de volver a trabajar'] },
    { titulo: 'SOLUCIONES DESINFECTANTES', color: '#7c2d12', sub: `Hipoclorito de sodio al ${fmt(c)} % · prepara cada día · mide con jeringa`,
      tabla: SOLUCIONES.map((s) => [s.uso, `${s.ppm} ppm`, `${fmt(mlPorLitro(s.ppm, c))} mL por litro`, `${fmt(Math.round(mlPorLitro(s.ppm, c) * 10))} mL en 10 L`]),
      pie: 'No mezcles el hipoclorito con otros productos · guárdalo rotulado y lejos de los alimentos' },
    { titulo: 'TEMPERATURAS', color: '#1d4ed8', sub: 'Revisa y anota 2 veces al día en la planilla RG-01',
      lineas: ['Refrigeración: entre 0 °C y 4 °C', 'Congelación: -18 °C o menos', 'No sobrecargues las neveras ni dejes la puerta abierta', 'Alimentos tapados, rotulados y con fecha', 'Crudos abajo, listos para consumir arriba', 'Si la temperatura no está en el rango: avisa y anota la acción'] },
    { titulo: 'ÁREA RESTRINGIDA', color: '#991b1b', sub: 'Solo personal autorizado',
      lineas: ['Ingreso solo con uniforme completo', 'Lávate las manos al entrar', 'Prohibido el ingreso de mascotas'], pie: d.nombre },
  ];
}

module.exports = { VERSION, SOLUCIONES, ITEMS, items, equipos, campos, nombreTipo, mlPorLitro, fmt, plan, cronogramas, checklist, carteles, REGISTROS, CHEQUEO, CAPACITACIONES };
