// ============================================================================
// Planillas de vigilancia (registros RG-01 a RG-10)
// ----------------------------------------------------------------------------
// modo 'blanco': una hoja por formato (o por equipo/semana) con los datos del negocio, para fotocopiar.
// modo 'meses' (Plan Llave en Mano): las hojas de los 4 meses del ciclo, ya armadas con las fechas de
//   cada día o semana, los equipos, las áreas, el personal, los rangos y las tareas programadas.
//   Las lecturas, marcas y firmas quedan en blanco: se escriben el día en que se hace cada actividad.
// Cada hoja: { codigo, titulo, periodo, campos, cols, filas, notas, altoFila }
// ============================================================================
const C = require('./contenido');
const F = require('./fechas');
const { AREAS } = require('./datos');

const COD = Object.fromEntries(C.REGISTROS.map((r) => [r.id, r.codigo]));
const vacias = (n, cols) => Array.from({ length: n }, () => Array(cols).fill(''));
const PERIODO_BLANCO = 'Mes: ____________________   Año: ________';
const enRango = (n) => (n.length > 14 ? n.slice(0, 13) + '…' : n);

function temperaturas(d, modo, ci) {
  const eqs = C.equipos(d);
  const lista = eqs.length ? eqs : [{ nombre: '____________________', tipo: '', rango: '' }];
  const cols = [{ titulo: 'Fecha', ancho: 0.09 }, { titulo: 'Hora mañana', ancho: 0.08, align: 'center' }, { titulo: '°C mañana', ancho: 0.08, align: 'center' },
    { titulo: 'Hora tarde', ancho: 0.08, align: 'center' }, { titulo: '°C tarde', ancho: 0.08, align: 'center' }, { titulo: '¿En rango? Sí / No', ancho: 0.09, align: 'center' },
    { titulo: 'Acción correctiva (si no está en rango)', ancho: 0.26 }, { titulo: 'Responsable', ancho: 0.14 }, { titulo: 'Firma', ancho: 0.1 }];
  const notas = ['Refrigeración: entre 0 °C y 4 °C. Congelación: -18 °C o menos. Lee el termómetro del equipo (o uno de punzón calibrado) al abrir y en la tarde.',
    'Si la lectura está fuera de rango: revisa que la puerta cierre, no sobrecargues, vuelve a medir en 30 minutos y, si sigue igual, pasa los alimentos a otro equipo y llama al técnico.'];
  const hojas = [];
  for (const e of lista) {
    const campos = [['Equipo', e.nombre], ['Tipo', e.tipo || '__________'], ['Rango permitido', e.rango || '__________']];
    if (modo === 'meses') {
      for (const m of ci.porMes) hojas.push({ codigo: COD.temperaturas, titulo: 'Control de temperaturas de equipos de frío', periodo: m.titulo, campos, cols, notas,
        filas: m.dias.map((dia) => [F.dia(dia), '', '', '', '', '', '', d.encargado, '']) });
    } else {
      hojas.push({ codigo: COD.temperaturas, titulo: 'Control de temperaturas de equipos de frío', periodo: PERIODO_BLANCO, campos, cols, notas, filas: vacias(31, cols.length) });
    }
  }
  return hojas;
}

function limpieza(d, modo, ci) {
  const its = C.items(d);
  const diarias = its.filter((i) => i.diaria);
  const otras = its.filter((i) => !i.diaria);
  const hojas = [];
  // Hasta 8 tareas diarias por hoja
  const grupos = [];
  for (let i = 0; i < diarias.length; i += 8) grupos.push(diarias.slice(i, i + 8));
  const notas = ['Marca X cuando la tarea quede hecha (lavar, enjuagar, desinfectar y dejar secar). Si no se hizo, escribe el motivo al respaldo.',
    `Soluciones: superficies y utensilios 200 ppm (${C.fmt(C.mlPorLitro(200, d.hipoclorito))} mL de hipoclorito al ${C.fmt(d.hipoclorito)} % por litro); pisos 500 ppm; baños y canecas 1000 ppm.`];
  const diaria = (g, grupo, periodo, dias) => {
    const cols = [{ titulo: 'Fecha', ancho: 0.09 }, ...grupo.map((it) => ({ titulo: it.nombre, ancho: 0.62 / grupo.length, align: 'center' })),
      { titulo: 'Responsable', ancho: 0.17 }, { titulo: 'Firma', ancho: 0.12 }];
    const titulo = `Limpieza y desinfección diaria${grupos.length > 1 ? ` (${g + 1} de ${grupos.length})` : ''}`;
    return { codigo: COD.limpieza, titulo, periodo, campos: [], cols, notas,
      filas: dias ? dias.map((dia) => [F.dia(dia), ...grupo.map(() => ''), d.encargado, '']) : vacias(31, cols.length) };
  };
  // Tareas semanales y mensuales con su fecha programada
  const colsP = [{ titulo: 'Fecha programada', ancho: 0.12 }, { titulo: 'Superficie o equipo', ancho: 0.26 }, { titulo: 'Frecuencia', ancho: 0.11 },
    { titulo: 'Fecha realizada', ancho: 0.11 }, { titulo: 'Observaciones', ancho: 0.2 }, { titulo: 'Responsable', ancho: 0.12 }, { titulo: 'Firma', ancho: 0.08 }];
  const notasP = ['Las tareas semanales se programan cada lunes y las mensuales el primer lunes del mes. Si las haces otro día, escribe la fecha real en «Fecha realizada».'];
  if (modo === 'meses') {
    for (const m of ci.porMes) {
      const lunes = m.dias.filter((x) => x.getUTCDay() === 1);
      const filas = [];
      for (const [k, l] of lunes.entries()) {
        for (const it of otras) {
          if (it.cada === 'mensual' && k > 0) continue;
          filas.push([F.dia(l), it.nombre, it.cada === 'mensual' ? 'Mensual' : 'Semanal', '', '', d.encargado, '']);
        }
      }
      grupos.forEach((grupo, g) => hojas.push(diaria(g, grupo, m.titulo, m.dias)));
      if (filas.length) hojas.push({ codigo: COD.limpieza, titulo: 'Limpieza y desinfección semanal y mensual', periodo: m.titulo, campos: [], cols: colsP, notas: notasP, filas });
    }
  } else {
    const filas = [];
    grupos.forEach((grupo, g) => hojas.push(diaria(g, grupo, PERIODO_BLANCO, null)));
    for (let s = 0; s < 4; s++) for (const it of otras) if (it.cada !== 'mensual' || s === 0) filas.push(['', it.nombre, it.cada === 'mensual' ? 'Mensual' : 'Semanal', '', '', '', '']);
    hojas.push({ codigo: COD.limpieza, titulo: 'Limpieza y desinfección semanal y mensual', periodo: PERIODO_BLANCO, campos: [], cols: colsP, notas: notasP, filas });
  }
  return hojas;
}

function soluciones(d, modo, ci) {
  const c = d.hipoclorito;
  const cols = [{ titulo: 'Fecha', ancho: 0.1 }, ...C.SOLUCIONES.map((s) => ({ titulo: `${s.uso.split(' (')[0].split(',')[0]}: ${s.ppm} ppm (${C.fmt(C.mlPorLitro(s.ppm, c))} mL/L · ${C.fmt(Math.round(C.mlPorLitro(s.ppm, c) * 10))} mL en 10 L)`, ancho: 0.135, align: 'center' })),
    { titulo: 'Litros preparados', ancho: 0.1, align: 'center' }, { titulo: 'Preparó', ancho: 0.14 }, { titulo: 'Firma', ancho: 0.12 }];
  const campos = [['Producto', `Hipoclorito de sodio al ${C.fmt(c)} %`], ['Fórmula', 'mL = ppm × litros ÷ (% × 10)']];
  const notas = ['Marca X en cada solución preparada ese día. Mide con jeringa o vaso medidor exclusivo. No mezcles el hipoclorito con otros productos.'];
  if (modo === 'meses') return ci.porMes.map((m) => ({ codigo: COD.soluciones, titulo: 'Preparación de soluciones desinfectantes', periodo: m.titulo, campos, cols, notas, filas: m.dias.map((dia) => [F.dia(dia), '', '', '', '', '', d.encargado, '']) }));
  return [{ codigo: COD.soluciones, titulo: 'Preparación de soluciones desinfectantes', periodo: PERIODO_BLANCO, campos, cols, notas, filas: vacias(31, cols.length) }];
}

function recepcion(d, modo, ci, n = 22) {
  const cols = [{ titulo: 'Fecha', ancho: 0.07 }, { titulo: 'Hora', ancho: 0.05 }, { titulo: 'Proveedor', ancho: 0.12 }, { titulo: 'Producto', ancho: 0.12 }, { titulo: 'Cantidad', ancho: 0.06 },
    { titulo: 'Lote / vence', ancho: 0.08 }, { titulo: 'Registro INVIMA (empacados)', ancho: 0.08 }, { titulo: '°C (fríos)', ancho: 0.05, align: 'center' }, { titulo: 'Empaque íntegro C / NC', ancho: 0.06, align: 'center' },
    { titulo: 'Olor, color y textura C / NC', ancho: 0.06, align: 'center' }, { titulo: 'Transporte limpio C / NC', ancho: 0.06, align: 'center' }, { titulo: 'Acepta / Rechaza', ancho: 0.06, align: 'center' },
    { titulo: 'Recibió (firma)', ancho: 0.13 }];
  const campos = [['Proveedores habituales', d.proveedores && d.proveedores.length ? d.proveedores.join(', ') : '________________________________']];
  const notas = ['C = cumple, NC = no cumple. Refrigerados: 4 °C o menos. Congelados: -18 °C o menos (sin escarcha ni señales de descongelación). Rechaza empaques rotos, abombados, sin rótulo o vencidos.',
    'Lo rechazado se devuelve al proveedor en el momento y se anota el motivo. Lo aceptado se guarda de inmediato: primero los refrigerados y congelados.'];
  if (modo === 'meses') return ci.porMes.map((m) => ({ codigo: COD.recepcion, titulo: 'Recepción de materias primas', periodo: m.titulo, campos, cols, notas, filas: vacias(n, cols.length) }));
  return [{ codigo: COD.recepcion, titulo: 'Recepción de materias primas', periodo: PERIODO_BLANCO, campos, cols, notas, filas: vacias(n, cols.length) }];
}

function plagas(d, modo, ci) {
  const areas = d.areas.map((a) => AREAS[a]);
  const cols = [{ titulo: 'Fecha programada', ancho: 0.09 }, { titulo: 'Fecha realizada', ancho: 0.08 }, ...areas.map((a) => ({ titulo: a, ancho: 0.45 / areas.length, align: 'center' })),
    { titulo: 'Mallas, puertas, sellos y sifones OK', ancho: 0.07, align: 'center' }, { titulo: 'Hallazgo y acción tomada', ancho: 0.15 }, { titulo: 'Firma', ancho: 0.08 }];
  const campos = [['Empresa de control químico', d.empresaPlagas || '______________________'], ['Frecuencia del servicio', `Cada ${d.frecuenciaPlagas} meses o según la empresa`]];
  const notas = ['En cada área escribe SE (sin evidencia) o CE (con evidencia: excrementos, huellas, roeduras, insectos, nidos). Si hay CE, describe el hallazgo y la acción.',
    'Servicio de la empresa: fecha ______________  N.° de certificado ______________  Próximo servicio ______________  Firma ______________'];
  if (modo === 'meses') {
    return ci.porMes.map((m) => ({ codigo: COD.plagas, titulo: 'Inspección y control de plagas', periodo: m.titulo, campos, cols, notas,
      filas: m.dias.filter((x) => x.getUTCDay() === 1 || x === m.dias[0] && !m.dias.some((y) => y.getUTCDay() === 1)).map((x) => [F.dia(x), '', ...areas.map(() => ''), '', '', '']) }));
  }
  return [{ codigo: COD.plagas, titulo: 'Inspección y control de plagas', periodo: PERIODO_BLANCO, campos, cols, notas, filas: vacias(6, cols.length) }];
}

function residuos(d, modo, ci) {
  const cols = [{ titulo: 'Fecha', ancho: 0.09 }, { titulo: 'Orgánicos (VERDE) bolsas', ancho: 0.09, align: 'center' }, { titulo: 'Aprovechables (BLANCA) bolsas', ancho: 0.09, align: 'center' },
    { titulo: 'No aprovechables (NEGRA) bolsas', ancho: 0.09, align: 'center' }, { titulo: 'Aceite usado entregado (litros)', ancho: 0.09, align: 'center' }, { titulo: 'Canecas lavadas X', ancho: 0.07, align: 'center' },
    { titulo: 'Entregado a (aseo / reciclador / gestor)', ancho: 0.2 }, { titulo: 'Responsable', ancho: 0.17 }, { titulo: 'Firma', ancho: 0.11 }];
  const notas = ['Saca los residuos en los horarios del operador de aseo. El aceite usado va en recipiente cerrado al gestor registrado: guarda su certificado.'];
  if (modo === 'meses') return ci.porMes.map((m) => ({ codigo: COD.residuos, titulo: 'Manejo de residuos sólidos', periodo: m.titulo, campos: [], cols, notas, filas: m.dias.map((dia) => [F.dia(dia), '', '', '', '', '', '', d.encargado, '']) }));
  return [{ codigo: COD.residuos, titulo: 'Manejo de residuos sólidos', periodo: PERIODO_BLANCO, campos: [], cols, notas, filas: vacias(31, cols.length) }];
}

function agua(d, modo, ci) {
  const cols = [{ titulo: 'Fecha programada', ancho: 0.1 }, { titulo: 'Fecha y hora realizada', ancho: 0.11 }, { titulo: 'Punto de muestreo', ancho: 0.12 },
    { titulo: 'Cloro residual libre (mg/L) · 0,3 a 2,0', ancho: 0.11, align: 'center' }, { titulo: 'pH · 6,5 a 9,0', ancho: 0.08, align: 'center' }, { titulo: 'Color, olor y sabor normales', ancho: 0.09, align: 'center' },
    { titulo: 'Conforme Sí / No', ancho: 0.07, align: 'center' }, { titulo: 'Acción correctiva', ancho: 0.2 }, { titulo: 'Firma', ancho: 0.12 }];
  const campos = [['Fuente', d.agua === 'tanque' ? `Acueducto con tanque${d.tanqueLitros ? ` de ${d.tanqueLitros.toLocaleString('es-CO')} L` : ''}` : 'Acueducto (red directa)'], ['Valores de referencia', 'Resolución 2115 de 2007']];
  const notas = [d.agua === 'tanque' ? 'Lavado y desinfección del tanque (mínimo cada 6 meses): fecha __________ empresa __________________ N.° certificado __________ próximo __________'
    : 'Si se instala un tanque de almacenamiento, debe lavarse y desinfectarse mínimo cada 6 meses (Decreto 1575 de 2007).'];
  if (modo === 'meses') {
    return ci.porMes.map((m) => ({ codigo: COD.agua, titulo: 'Control de agua potable', periodo: m.titulo, campos, cols, notas,
      filas: m.dias.filter((x) => x.getUTCDay() === 1 || (x === m.dias[0] && !m.dias.some((y) => y.getUTCDay() === 1))).map((x) => [F.dia(x), '', 'Grifo de la cocina', '', '', '', '', '', '']) }));
  }
  return [{ codigo: COD.agua, titulo: 'Control de agua potable', periodo: PERIODO_BLANCO, campos, cols, notas, filas: vacias(6, cols.length).map((f) => { f[2] = 'Grifo de la cocina'; return f; }) }];
}

function higiene(d, modo, ci) {
  const notas = ['En cada día escribe C (cumple) o NC (no cumple) para: uniforme limpio y completo, gorro, uñas cortas sin esmalte, sin joyas, sin heridas expuestas, sin síntomas (diarrea, vómito, fiebre, infecciones en la piel) y lavado de manos.',
    'Quien tenga síntomas no manipula alimentos ese día: anótalo en observaciones. Una raya (—) marca los días que no son de este ciclo.'];
  const DS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const cols = [{ titulo: 'Semana', ancho: 0.1 }, { titulo: 'Manipulador', ancho: 0.2 }, ...DS.map((x) => ({ titulo: x, ancho: 0.42 / 7, align: 'center' })),
    { titulo: 'Observaciones', ancho: 0.18 }, { titulo: 'Firma responsable', ancho: 0.1 }];
  const personas = d.manipuladores.length ? d.manipuladores : [''];
  const porHoja = Math.max(1, Math.floor(24 / personas.length));
  const hoja = (periodo, filas) => ({ codigo: COD.higiene, titulo: 'Higiene y estado de salud del personal', periodo, campos: [], notas, cols, filas, altoFila: 15 });
  if (modo === 'meses') {
    const hojas = [];
    for (let i = 0; i < ci.semanas.length; i += porHoja) {
      const grupo = ci.semanas.slice(i, i + porHoja);
      const filas = [];
      for (const s of grupo) {
        const enCiclo = new Set(s.dias.map((x) => (x.getUTCDay() + 6) % 7));
        const rotulo = `${F.dd(s.dias[0])} al ${F.dd(s.dias[s.dias.length - 1])}`;
        personas.forEach((n, k) => filas.push([k === 0 ? { texto: rotulo, bold: true } : '', n, ...DS.map((_, j) => (enCiclo.has(j) ? '' : { texto: '—', align: 'center' })), '', '']));
      }
      const ult = grupo[grupo.length - 1];
      hojas.push(hoja(`Del ${F.corta(grupo[0].dias[0])} al ${F.corta(ult.dias[ult.dias.length - 1])}`, filas));
    }
    return hojas;
  }
  const filas = [];
  for (let s = 0; s < Math.min(porHoja, 4); s++) personas.forEach((n, k) => filas.push([k === 0 ? '____ al ____' : '', n, ...DS.map(() => ''), '', '']));
  return [hoja('Mes: ____________________   Año: ________', filas)];
}

function capacitacion(d, modo, ci) {
  const cols = [{ titulo: 'N°', ancho: 0.05, align: 'center' }, { titulo: 'Nombre', ancho: 0.33 }, { titulo: 'Documento', ancho: 0.17 }, { titulo: 'Cargo', ancho: 0.17 }, { titulo: 'Firma', ancho: 0.28 }];
  const filas = [...d.manipuladores, ...Array(Math.max(0, 4 - d.manipuladores.length)).fill('')].map((n, i) => [String(i + 1), n, '', '', '']);
  const notas = ['Archiva junto a esta hoja el material usado y, si la dio una entidad externa, su constancia con las horas.'];
  if (modo === 'meses') {
    return C.CAPACITACIONES.map((t, i) => ({ codigo: COD.capacitacion, titulo: 'Asistencia a capacitación', periodo: `Sesión ${i + 1} de 4 · programada para ${F.mesAnio(F.masMeses(ci.ini, i))}`,
      campos: [['Tema', t], ['Duración', '2,5 horas'], ['Capacitador', d.encargado], ['Fecha realizada', '______________']], cols, notas, filas, altoFila: 20 }));
  }
  return [{ codigo: COD.capacitacion, titulo: 'Asistencia a capacitación', periodo: 'Fecha: ______________', campos: [['Tema', '______________________________________'], ['Duración', '________'], ['Capacitador', '______________________']], cols, notas, filas, altoFila: 20 }];
}

function chequeo(d, modo, ci) {
  const cols = [{ titulo: 'N°', ancho: 0.04, align: 'center' }, { titulo: 'Punto de verificación', ancho: 0.58 }, { titulo: 'Cumple', ancho: 0.07, align: 'center' }, { titulo: 'No cumple', ancho: 0.07, align: 'center' }, { titulo: 'Acción correctiva y fecha límite', ancho: 0.24 }];
  const filas = C.CHEQUEO.map((t, i) => [String(i + 1), t, '', '', '']);
  const notas = ['Firma del responsable: ______________________   Fecha de revisión: ______________'];
  if (modo === 'meses') return ci.porMes.map((m) => ({ codigo: COD.chequeo, titulo: 'Lista de chequeo de verificación del plan', periodo: m.titulo, campos: [], cols, notas, filas }));
  return [{ codigo: COD.chequeo, titulo: 'Lista de chequeo de verificación del plan', periodo: PERIODO_BLANCO, campos: [], cols, notas, filas }];
}

const FORMATOS = { temperaturas, limpieza, soluciones, recepcion, plagas, residuos, agua, higiene, capacitacion, chequeo };

function hojas(id, d, modo) {
  const ci = F.ciclo(d.inicio, 4);
  return FORMATOS[id](d, modo, ci);
}

module.exports = { FORMATOS, hojas, COD, enRango };
