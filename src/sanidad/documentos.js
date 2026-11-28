// ============================================================================
// Catálogo de documentos del producto sanidad y su generación (PDF, Word y ZIP)
// Se generan al pedirlos, con los datos que el cliente guardó; nada queda en disco.
// ============================================================================
const C = require('./contenido');
const P = require('./planillas');
const R = require('./render');
const F = require('./fechas');
const { crearDocx } = require('./docx');
const { crearZip } = require('./zip');

const GRUPOS = {
  plan: 'Plan de saneamiento y programas',
  carteles: 'Carteles para imprimir y pegar',
  blanco: 'Planillas con los datos de tu negocio (para fotocopiar cada mes)',
  meses: 'Planillas de 4 meses listas para imprimir · Llave en Mano',
};

const PLANILLAS = C.REGISTROS.map((r) => r);
const CATALOGO = [
  { id: 'plan', grupo: 'plan', titulo: 'Plan de Saneamiento Básico', sub: 'Los 4 programas (limpieza y desinfección, residuos, plagas y agua potable), POES por equipo, responsables, registros y lista de chequeo', formatos: ['pdf', 'docx'], plan: 'personalizado', archivo: 'Plan_de_Saneamiento_Basico' },
  { id: 'cronogramas', grupo: 'plan', titulo: 'Cronogramas', sub: 'Cronograma de limpieza y desinfección y cronograma de actividades de 12 meses', formatos: ['pdf'], plan: 'personalizado', archivo: 'Cronogramas' },
  { id: 'checklist', grupo: 'plan', titulo: 'Carpeta para la visita y certificados externos', sub: 'Qué tener listo para la Secretaría de Salud y qué certificados pedir (fumigación, tanque, médico, curso)', formatos: ['pdf'], plan: 'personalizado', archivo: 'Checklist_Visita_y_Certificados' },
  { id: 'carteles', grupo: 'carteles', titulo: '6 carteles', sub: 'Lavado de manos, código de colores, normas de higiene, soluciones desinfectantes, temperaturas y área restringida', formatos: ['pdf'], plan: 'personalizado', archivo: 'Carteles' },
  ...PLANILLAS.map((r) => ({ id: `f_${r.id}`, grupo: 'blanco', titulo: `${r.codigo} · ${r.titulo}`, sub: `Frecuencia: ${r.frecuencia.toLowerCase()}`, formatos: ['pdf'], plan: 'personalizado', planilla: r.id, modo: 'blanco', archivo: `${r.codigo}_${r.titulo.replace(/\s+/g, '_')}` })),
  ...PLANILLAS.map((r) => ({ id: `m_${r.id}`, grupo: 'meses', titulo: `${r.codigo} · ${r.titulo} · 4 meses`, sub: 'Fechas, equipos, áreas, personal y rangos ya puestos', formatos: ['pdf'], plan: 'llave', planilla: r.id, modo: 'meses', archivo: `4_meses_${r.codigo}_${r.titulo.replace(/\s+/g, '_')}` })),
];

const rango = (plan) => require('./planes').rango(plan);
const permitido = (doc, plan) => !!doc && rango(plan || 'personalizado') >= rango(doc.plan);
const doc = (id) => CATALOGO.find((x) => x.id === id) || null;
const sinTildes = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w.-]+/g, '_').replace(/_+/g, '_');

function nombreArchivo(dc, d, formato) {
  return `${sinTildes(dc.archivo)}_${sinTildes(d.nombre).slice(0, 40)}.${formato}`;
}

function bloquesDe(id, d, plan) {
  if (id === 'plan') return C.plan(d);
  if (id === 'cronogramas') return C.cronogramas(d);
  if (id === 'checklist') return C.checklist(d, plan);
  return null;
}

// Devuelve { nombre, tipo, datos } o null si no existe / no está en el plan
function generar(id, formato, d, plan) {
  const dc = doc(id);
  if (!dc || !dc.formatos.includes(formato) || !permitido(dc, plan)) return null;
  const encabezadoIzq = `${d.nombre} · NIT/C.C. ${d.nit}`;
  let datos;
  if (dc.planilla) {
    datos = R.planillasPDF(d, P.hojas(dc.planilla, d, dc.modo), { titulo: dc.titulo });
  } else if (id === 'carteles') {
    datos = R.cartelesPDF(d, C.carteles(d));
  } else {
    const bloques = bloquesDe(id, d, plan);
    const meta = { titulo: `${dc.titulo} · ${d.nombre}`, negocio: d.nombre, bloques, encabezadoIzq,
      encabezadoDer: `${dc.titulo} · ${C.VERSION} · ${F.corta(F.fecha(d.inicio))}`, pie: `${d.nombre} · ${d.direccion}, ${d.ciudad} · Res. 2674 de 2013`,
      encabezado: `${d.nombre} · NIT/C.C. ${d.nit} · ${dc.titulo} · ${C.VERSION}` };
    datos = formato === 'docx' ? crearDocx(meta) : R.documentoPDF(meta);
  }
  return { nombre: nombreArchivo(dc, d, formato), tipo: formato === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/pdf', datos };
}

// Todo lo del plan en un ZIP, ordenado en carpetas
function zipTodo(d, plan) {
  const carpeta = { plan: '1_Plan_y_programas', carteles: '2_Carteles', blanco: '3_Planillas_en_blanco', meses: '4_Planillas_4_meses' };
  const archivos = [];
  for (const dc of CATALOGO) {
    if (!permitido(dc, plan)) continue;
    for (const f of dc.formatos) {
      const g = generar(dc.id, f, d, plan);
      if (g) archivos.push({ nombre: `${carpeta[dc.grupo]}/${g.nombre}`, datos: g.datos });
    }
  }
  return { nombre: `Plan_de_Saneamiento_${sinTildes(d.nombre).slice(0, 40)}.zip`, tipo: 'application/zip', datos: crearZip(archivos) };
}

// Planilla de muestra de la vista previa gratis (recepción de materias primas con nombre y NIT)
function muestra(entrada, formato = 'pdf') {
  const d = {
    nombre: entrada.nombre, nit: entrada.nit, direccion: entrada.direccion || 'Dirección del local', ciudad: entrada.ciudad || 'Ciudad', telefono: entrada.telefono || '__________',
    encargado: '______________________', proveedores: [],
  };
  const hojas = P.FORMATOS.recepcion(d, 'blanco', null, 22);
  const pdf = R.planillasPDF(d, hojas, { objeto: true, titulo: 'Muestra gratis · Recepción de materias primas', marca: `${d.nombre} · NIT/C.C. ${d.nit} · Muestra gratis del Plan de Saneamiento Básico (Res. 2674 de 2013)` });
  return formato === 'svg' ? pdf.paginas[0].svg() : pdf.buffer();
}

module.exports = { CATALOGO, GRUPOS, doc, permitido, generar, zipTodo, muestra, nombreArchivo };
