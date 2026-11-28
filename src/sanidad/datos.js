// ============================================================================
// Datos del establecimiento: campos, valores por defecto según el tipo de negocio y validación.
// Llegan del formulario de /acceso/:token o de las preguntas por WhatsApp; se guardan en el acceso.
// ============================================================================
const TIPOS = {
  restaurante: { nombre: 'Restaurante', areas: ['recepcion', 'cocina', 'frio', 'lavado', 'comedor', 'banos', 'residuos'] },
  panaderia: { nombre: 'Panadería / pastelería', areas: ['recepcion', 'panaderia', 'lavado', 'barra', 'banos', 'residuos'] },
  cafeteria: { nombre: 'Cafetería', areas: ['recepcion', 'cocina', 'lavado', 'barra', 'comedor', 'banos', 'residuos'] },
  comidas_rapidas: { nombre: 'Comidas rápidas', areas: ['recepcion', 'cocina', 'frio', 'lavado', 'barra', 'comedor', 'banos', 'residuos'] },
  charcuteria: { nombre: 'Charcutería / fama', areas: ['recepcion', 'frio', 'lavado', 'barra', 'banos', 'residuos'] },
  otro: { nombre: 'Otro negocio de alimentos', areas: ['recepcion', 'cocina', 'lavado', 'banos', 'residuos'] },
};

const AREAS = {
  recepcion: 'Recepción y almacenamiento de materias primas',
  cocina: 'Cocina (zona de cocción)',
  frio: 'Zona de preparación en frío',
  panaderia: 'Zona de amasado y horneo',
  lavado: 'Zona de lavado de loza y utensilios',
  barra: 'Barra / mostrador de atención',
  comedor: 'Comedor / área de servicio',
  banos: 'Baños y vestier del personal',
  residuos: 'Área de almacenamiento de residuos',
};

const MAX_EDICIONES = 5;

const limpio = (v, max) => String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
function lista(v, maxItems, maxLargo) {
  const xs = Array.isArray(v) ? v : String(v == null ? '' : v).split(/[\n,;]+/);
  const out = [];
  for (const it of xs) {
    const t = limpio(it, maxLargo).replace(/^(\d{1,2}[.)]|[-•*])\s*/, '').trim();
    if (!t || /^(ninguno|ninguna|no|no tengo|n\/a|na)$/i.test(t)) continue;
    if (!out.some((o) => o.toLowerCase() === t.toLowerCase())) out.push(t);
    if (out.length >= maxItems) break;
  }
  return out;
}

function hoyColombia() {
  return new Date(Date.now() - 5 * 3600e3).toISOString().slice(0, 10);
}

// Devuelve { ok, datos, errores } ; errores: { campo: mensaje }
function validar(entrada = {}) {
  const e = {};
  const d = {
    nombre: limpio(entrada.nombre, 80),
    razonSocial: limpio(entrada.razonSocial, 100),
    nit: limpio(entrada.nit, 20),
    direccion: limpio(entrada.direccion, 120),
    ciudad: limpio(entrada.ciudad, 60),
    departamento: limpio(entrada.departamento, 40),
    telefono: limpio(entrada.telefono, 20),
    correo: limpio(entrada.correo, 80),
    tipo: TIPOS[entrada.tipo] ? entrada.tipo : '',
    encargado: limpio(entrada.encargado, 80),
    propietario: limpio(entrada.propietario, 80),
    manipuladores: lista(entrada.manipuladores, 30, 60),
    refrigeracion: lista(entrada.refrigeracion, 15, 50),
    congelacion: lista(entrada.congelacion, 15, 50),
    proveedores: lista(entrada.proveedores, 20, 60),
    agua: entrada.agua === 'tanque' ? 'tanque' : 'acueducto',
    tanqueLitros: Math.min(100000, Math.max(0, Math.round(Number(String(entrada.tanqueLitros || '').replace(/\D/g, '')) || 0))),
    empresaPlagas: limpio(entrada.empresaPlagas, 80),
    frecuenciaPlagas: String(entrada.frecuenciaPlagas) === '3' ? 3 : 6,
    hipoclorito: Math.min(15, Math.max(1, Number(String(entrada.hipoclorito || '5').replace(',', '.')) || 5)),
    horario: limpio(entrada.horario, 60),
    inicio: /^\d{4}-\d{2}-\d{2}$/.test(String(entrada.inicio || '')) ? String(entrada.inicio) : hoyColombia(),
  };
  const areas = (Array.isArray(entrada.areas) ? entrada.areas : String(entrada.areas || '').split(',')).filter((a) => AREAS[a]);
  d.areas = areas.length ? [...new Set(areas)] : (TIPOS[d.tipo] || TIPOS.otro).areas.slice();
  if (!d.propietario) d.propietario = d.encargado;

  if (d.nombre.length < 2) e.nombre = 'Escribe el nombre del negocio.';
  if (!/^[0-9][0-9.\- ]{4,18}[0-9]$/.test(d.nit)) e.nit = 'Escribe el NIT o la cédula solo con números (puede llevar puntos y el dígito de verificación con guion).';
  if (d.direccion.length < 5) e.direccion = 'Escribe la dirección del local.';
  if (d.ciudad.length < 3) e.ciudad = 'Escribe la ciudad o municipio.';
  if (d.telefono.replace(/\D/g, '').length < 7) e.telefono = 'Escribe un teléfono de contacto.';
  if (d.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.correo)) e.correo = 'El correo no parece válido (puedes dejarlo vacío).';
  if (!d.tipo) e.tipo = 'Elige el tipo de negocio.';
  if (d.encargado.length < 3) e.encargado = 'Escribe el nombre del encargado del plan.';
  if (!d.manipuladores.length) e.manipuladores = 'Escribe al menos un manipulador de alimentos (puede ser el mismo encargado).';
  if (!d.refrigeracion.length && !d.congelacion.length) e.refrigeracion = 'Escribe al menos una nevera o congelador (por ejemplo: Nevera cocina).';
  const ini = Date.parse(d.inicio + 'T12:00:00Z');
  const hoy = Date.parse(hoyColombia() + 'T12:00:00Z');
  if (!Number.isFinite(ini) || ini < hoy - 62 * 864e5 || ini > hoy + 62 * 864e5) e.inicio = 'La fecha de inicio debe estar dentro de los próximos (o últimos) 2 meses.';
  if (d.agua === 'tanque' && !d.tanqueLitros) d.tanqueLitros = 0;
  if (!entrada.autoriza && !entrada.autorizaPrevio) e.autoriza = 'Para generar los documentos necesitamos tu autorización para usar estos datos.';
  return { ok: Object.keys(e).length === 0, datos: d, errores: e };
}

module.exports = { TIPOS, AREAS, MAX_EDICIONES, validar, lista, limpio, hoyColombia };
