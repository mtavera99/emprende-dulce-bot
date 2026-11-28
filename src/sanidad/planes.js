// ============================================================================
// Planes del Plan de Saneamiento Básico (producto "sanidad")
// ----------------------------------------------------------------------------
//   Personalizado   $49.900 (seguimiento $39.900): plan, programas, POES, cronogramas, carteles,
//                   checklist de la visita y todas las planillas en blanco con los datos del negocio.
//   Llave en Mano   $79.900 (seguimiento $69.900): todo lo anterior + las planillas de 4 meses ya
//                   armadas con las fechas, equipos, áreas, personal, rangos y frecuencias del negocio.
// Mismo formato que src/planes.js (moldes) para que el flujo los trate igual.
// El plan sale del valor pagado: $69.900 o más → Llave en Mano; $39.900 o más → Personalizado.
// ============================================================================
const PLANES = {
  personalizado: { id: 'personalizado', rango: 1, nombre: 'Plan Personalizado', precio: Number(process.env.PRECIO_SANIDAD) || 49900,
    descuento: Number(process.env.PRECIO_DESCUENTO_SANIDAD) || 39900, boton: '📋 Personalizado', emoji: '📋' },
  llave: { id: 'llave', rango: 2, nombre: 'Plan Llave en Mano', precio: Number(process.env.PRECIO_SANIDAD_LLAVE) || 79900,
    descuento: Number(process.env.PRECIO_DESCUENTO_SANIDAD_LLAVE) || 69900, boton: '🔑 Llave en mano', emoji: '🔑' },
};
const ORDEN = ['personalizado', 'llave'];

const disponibles = () => ORDEN.slice();
const hayPlanes = () => true;
const activo = (plan) => ORDEN.includes(plan);
const rango = (plan) => (PLANES[plan] ? PLANES[plan].rango : 1);
const info = (plan) => ({ ...(PLANES[plan] || PLANES.personalizado) });

function deMonto(monto) {
  const m = Number(monto) || 0;
  return m >= PLANES.llave.descuento ? 'llave' : 'personalizado';
}

// Plan que nombra el cliente: "el de 79", "llave en mano", "el diligenciado", "el personalizado", "el de 49.900"
function elegido(texto) {
  const n = String(texto || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[.$]/g, '');
  if (/\b(llave( en mano)?|diligenciad\w*|completo|el mas completo|4 meses|cuatro meses|el de (79|69)|(79|69) ?(mil|900)|79900|69900)\b/.test(n)) return 'llave';
  if (/\b(personalizad\w*|el sencillo|el basico|el mas barato|el de (49|39)|(49|39) ?(mil|900)|49900|39900|el primero)\b/.test(n)) return 'personalizado';
  return null;
}

const enfoqueMaster = () => false;

module.exports = { PLANES, ORDEN, disponibles, hayPlanes, activo, rango, info, deMonto, elegido, enfoqueMaster };
