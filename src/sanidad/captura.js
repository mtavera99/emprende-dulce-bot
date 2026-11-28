// ============================================================================
// Captura guiada de los datos del negocio por WhatsApp (después de pagar)
// ----------------------------------------------------------------------------
// Una pregunta a la vez. El estado se guarda en el lead (capturaSanidad: { paso, datos }).
// Al final se muestra el resumen y el cliente confirma con SÍ (que también autoriza usar los datos).
// Los campos opcionales (proveedores, empresa de fumigación, horario, hipoclorito) se ajustan en el
// formulario del enlace personal.
// ============================================================================
const { TIPOS, validar, lista, limpio, hoyColombia } = require('./datos');

const TIPOS_LISTA = Object.keys(TIPOS);
const norm = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
const ninguno = (t) => /^(no|ninguna?|no tengo|ningun[oa]?|nada|0|n\/a|na)$/.test(norm(t));

function fechaDe(texto) {
  const n = norm(texto);
  if (/^(hoy|ya|ahora|de una|desde hoy)$/.test(n)) return hoyColombia();
  if (/^manana$/.test(n)) return new Date(Date.now() - 5 * 3600e3 + 864e5).toISOString().slice(0, 10);
  let m = n.match(/^(\d{1,2})[/\-. ](\d{1,2})(?:[/\-. ](\d{2,4}))?$/);
  if (m) {
    const hoy = hoyColombia();
    let anio = m[3] ? Number(m[3].length === 2 ? `20${m[3]}` : m[3]) : Number(hoy.slice(0, 4));
    const iso = `${anio}-${String(m[2]).padStart(2, '0')}-${String(m[1]).padStart(2, '0')}`;
    // Sin año y ya pasó hace más de 2 meses: es del año siguiente
    if (!m[3] && Date.parse(iso) < Date.parse(hoy) - 62 * 864e5) anio += 1;
    const r = `${anio}-${String(m[2]).padStart(2, '0')}-${String(m[1]).padStart(2, '0')}`;
    return Number.isFinite(Date.parse(`${r}T12:00:00Z`)) && new Date(`${r}T12:00:00Z`).getUTCDate() === Number(m[1]) ? r : null;
  }
  m = n.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? n : null;
}

// Cada pregunta: texto, y cómo leer la respuesta (devuelve el valor o { error })
const PREGUNTAS = [
  { campo: 'nombre', texto: '1️⃣ ¿Cómo se llama el negocio? (así saldrá en todos los documentos)',
    leer: (t) => (limpio(t, 80).length >= 2 ? limpio(t, 80) : { error: 'Escríbeme el nombre del negocio, por favor.' }) },
  { campo: 'nit', texto: '2️⃣ ¿Cuál es el NIT del negocio? Si no tiene, escribe la cédula del propietario.',
    leer: (t) => (/^[0-9][0-9.\- ]{4,18}[0-9]$/.test(limpio(t, 20)) ? limpio(t, 20) : { error: 'Escríbelo solo con números (puede llevar puntos y el dígito de verificación con guion), por ejemplo 900123456-7.' }) },
  { campo: 'direccion', texto: '3️⃣ ¿Cuál es la dirección del local?',
    leer: (t) => (limpio(t, 120).length >= 5 ? limpio(t, 120) : { error: 'Escríbeme la dirección completa del local.' }) },
  { campo: 'ciudad', texto: '4️⃣ ¿En qué ciudad o municipio está?',
    leer: (t) => (limpio(t, 60).length >= 3 ? limpio(t, 60) : { error: 'Escríbeme la ciudad o el municipio.' }) },
  { campo: 'telefono', texto: '5️⃣ ¿Qué teléfono pongo en los documentos? Si es este mismo número, responde *ESTE*.',
    leer: (t, phone) => (/^(este|el mismo|mismo|este mismo|este numero|el de aqui)$/.test(norm(t)) ? String(phone || '').replace(/^57/, '')
      : limpio(t, 20).replace(/\D/g, '').length >= 7 ? limpio(t, 20) : { error: 'Escríbeme un teléfono de contacto (o *ESTE* para usar este número).' }) },
  { campo: 'tipo', texto: `6️⃣ ¿Qué tipo de negocio es? Responde con el número:\n${TIPOS_LISTA.map((k, i) => `*${i + 1}* ${TIPOS[k].nombre}`).join('\n')}`,
    leer: (t) => {
      const n = norm(t);
      const i = Number((n.match(/^\d$/) || [])[0]);
      if (i >= 1 && i <= TIPOS_LISTA.length) return TIPOS_LISTA[i - 1];
      const k = TIPOS_LISTA.find((x) => n.includes(x.replace('_', ' ')) || n.includes(norm(TIPOS[x].nombre).split(' ')[0]));
      return k || { error: `Responde con un número del 1 al ${TIPOS_LISTA.length}.` };
    } },
  { campo: 'encargado', texto: '7️⃣ ¿Quién es el responsable del plan de saneamiento? (nombre completo; normalmente el dueño o el administrador)',
    leer: (t) => (limpio(t, 80).length >= 3 ? limpio(t, 80) : { error: 'Escríbeme el nombre completo del responsable.' }) },
  { campo: 'manipuladores', texto: '8️⃣ Escríbeme los nombres de las personas que manipulan alimentos, separados por coma (incluye al responsable si también cocina).',
    leer: (t) => { const xs = lista(t, 30, 60); return xs.length ? xs : { error: 'Escríbeme al menos un nombre.' }; } },
  { campo: 'refrigeracion', texto: '9️⃣ ¿Qué neveras o equipos de refrigeración tienen? Dales un nombre corto, separados por coma (por ejemplo: Nevera cocina, Vitrina bebidas). Si no tienen, responde *NINGUNA*.',
    leer: (t) => (ninguno(t) ? [] : lista(t, 15, 50)) },
  { campo: 'congelacion', texto: '🔟 ¿Y congeladores? Igual: nombres separados por coma, o *NINGUNO*.',
    leer: (t, _p, datos) => {
      const xs = ninguno(t) ? [] : lista(t, 15, 50);
      if (!xs.length && !(datos.refrigeracion || []).length) return { error: 'Para el registro de temperaturas necesito al menos una nevera o un congelador. Escríbeme su nombre.' };
      return xs;
    } },
  { campo: 'agua', texto: '1️⃣1️⃣ El agua del local llega:\n*1* Directo del acueducto\n*2* Del acueducto a un tanque de almacenamiento',
    leer: (t) => { const n = norm(t); if (/^(1|directo|acueducto|red)$/.test(n)) return 'acueducto'; if (/^2\b|tanque/.test(n)) return 'tanque'; return { error: 'Responde *1* o *2*.' }; } },
  { campo: 'inicio', texto: '1️⃣2️⃣ ¿Desde qué fecha empiezan los registros? Responde *HOY* o una fecha como 01/12.',
    leer: (t) => fechaDe(t) || { error: 'No entendí la fecha. Responde *HOY* o escríbela como día/mes, por ejemplo 01/12.' } },
];

function resumen(d) {
  const TIPO = (TIPOS[d.tipo] || TIPOS.otro).nombre;
  return `Revisa los datos 👇\n\n🏪 *${d.nombre}*\n🆔 NIT/C.C.: ${d.nit}\n📍 ${d.direccion}, ${d.ciudad}\n📞 ${d.telefono}\n🍽️ ${TIPO}\n👤 Responsable: ${d.encargado}\n` +
    `👥 Manipuladores: ${d.manipuladores.join(', ')}\n❄️ Neveras: ${d.refrigeracion.join(', ') || 'ninguna'}\n🧊 Congeladores: ${d.congelacion.join(', ') || 'ninguno'}\n` +
    `💧 Agua: ${d.agua === 'tanque' ? 'acueducto con tanque' : 'acueducto directo'}\n📅 Inicio de registros: ${d.inicio.split('-').reverse().join('/')}\n\n` +
    `Si todo está bien, responde *SÍ*: con eso autorizas usar estos datos para generar tus documentos. Para corregir algo, escribe el número de la pregunta (por ejemplo *3*).`;
}

function primera() {
  return { estado: { paso: 0, datos: {} }, mensaje: `Para armar tus documentos te hago ${PREGUNTAS.length} preguntas cortas 📋 (también puedes llenarlas en el formulario de tu enlace).\n\n${PREGUNTAS[0].texto}` };
}

// Procesa una respuesta. Devuelve { estado, mensaje, listo?, datos? }
function responder(estado, texto, phone) {
  const st = { paso: estado.paso || 0, datos: { ...(estado.datos || {}) }, corrigiendo: !!estado.corrigiendo };
  // Resumen mostrado: SÍ confirma; un número vuelve a esa pregunta
  if (st.paso >= PREGUNTAS.length) {
    const n = norm(texto);
    if (/^(si+|si senor|si senora|ok|listo|correcto|todo bien|esta bien|confirmo|autorizo|dale|perfecto)\b/.test(n)) {
      const v = validar({ ...st.datos, autoriza: true });
      if (v.ok) return { estado: { ...st, paso: PREGUNTAS.length }, listo: true, datos: v.datos, mensaje: '' };
      const campo = Object.keys(v.errores)[0];
      const i = Math.max(0, PREGUNTAS.findIndex((p) => p.campo === campo));
      return { estado: { ...st, paso: i, corrigiendo: true }, mensaje: `${v.errores[campo]}\n\n${PREGUNTAS[i].texto}` };
    }
    const k = Number((n.match(/^(\d{1,2})$/) || [])[1]);
    if (k >= 1 && k <= PREGUNTAS.length) return { estado: { ...st, paso: k - 1, corrigiendo: true }, mensaje: PREGUNTAS[k - 1].texto };
    return { estado: st, mensaje: `Responde *SÍ* para generar tus documentos, o el número de la pregunta que quieres corregir (1 a ${PREGUNTAS.length}).` };
  }
  const q = PREGUNTAS[st.paso];
  const v = q.leer(texto, phone, st.datos);
  if (v && typeof v === 'object' && !Array.isArray(v) && v.error) return { estado: st, mensaje: v.error };
  st.datos[q.campo] = v;
  st.paso = st.corrigiendo ? PREGUNTAS.length : st.paso + 1;
  if (st.paso >= PREGUNTAS.length) {
    const d = validar({ ...st.datos, autoriza: true }).datos;
    return { estado: { ...st, corrigiendo: false, paso: PREGUNTAS.length }, mensaje: resumen(d) };
  }
  return { estado: st, mensaje: PREGUNTAS[st.paso].texto };
}

module.exports = { PREGUNTAS, primera, responder, resumen, fechaDe };
