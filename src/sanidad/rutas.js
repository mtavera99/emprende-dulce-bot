// Rutas web de sanidad: vista previa pública, formulario de datos y descarga de los documentos generados
const accesos = require('../accesos');
const D = require('./documentos');
const { validar, limpio, MAX_EDICIONES } = require('./datos');
const pagina = require('./pagina');

// Límite simple por IP para la vista previa pública (evita que la usen como generador masivo)
const visitas = new Map();
function limite(req, res, max = 40, ventanaMs = 10 * 60 * 1000) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  const ahora = Date.now();
  const v = (visitas.get(ip) || []).filter((t) => ahora - t < ventanaMs);
  v.push(ahora);
  visitas.set(ip, v);
  if (visitas.size > 5000) for (const [k, xs] of visitas) if (!xs.some((t) => ahora - t < ventanaMs)) visitas.delete(k);
  if (v.length > max) { res.status(429).send('Demasiadas solicitudes. Intenta de nuevo en unos minutos.'); return false; }
  return true;
}

function datosMuestra(q) {
  const nombre = limpio(q.nombre, 80), nit = limpio(q.nit, 20);
  if (nombre.length < 2 || !/^[0-9][0-9.\- ]{4,18}[0-9]$/.test(nit)) return null;
  return { nombre, nit, ciudad: limpio(q.ciudad, 60), direccion: limpio(q.direccion, 120) };
}

// Acceso completo de sanidad, o null si ya respondió con error
function accesoSanidad(req, res) {
  const pa = require('../paginaAcceso');
  const st = accesos.estado(req.params.token);
  res.set('Cache-Control', 'private, no-store');
  if (!st.ok) { res.status(st.motivo === 'no_existe' ? 404 : 410).send(pa.paginaNoValida(st.motivo, st.acceso)); return null; }
  if (st.acceso.producto !== 'sanidad' || st.acceso.tipo !== 'completo') { res.redirect(`/acceso/${encodeURIComponent(st.acceso.token)}`); return null; }
  return st.acceso;
}

function enviar(res, g, inline) {
  res.set({ 'Content-Type': g.tipo, 'Content-Length': g.datos.length, 'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename="${g.nombre.replace(/"/g, '')}"` });
  res.end(g.datos);
}

// opciones.alGuardar(acceso, primeraVez): aviso por WhatsApp cuando el cliente guarda sus datos en la web
function montar(app, opciones = {}) {
  app.get('/prueba-sanidad', (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.send(pagina.paginaVistaPrevia());
  });
  app.get('/prueba-sanidad/planilla.svg', (req, res) => {
    if (!limite(req, res)) return;
    const d = datosMuestra(req.query);
    if (!d) return res.status(400).send('Escribe el nombre del negocio y el NIT.');
    res.set({ 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': 'no-store' });
    res.send(D.muestra(d, 'svg'));
  });
  app.all('/prueba-sanidad/planilla.pdf', (req, res) => {
    if (!limite(req, res)) return;
    const d = datosMuestra({ ...req.query, ...(req.body || {}) });
    if (!d) return res.status(400).send('Escribe el nombre del negocio y el NIT.');
    enviar(res, { nombre: `Muestra_Recepcion_Materias_Primas_${d.nombre.normalize('NFD').replace(/[^\w]+/g, '_').slice(0, 40)}.pdf`, tipo: 'application/pdf', datos: D.muestra(d) }, true);
  });

  app.post('/acceso/:token/datos', (req, res) => {
    const a = accesoSanidad(req, res); if (!a) return;
    if (a.negocio && (a.ediciones || 0) >= MAX_EDICIONES) return res.status(403).send(pagina.paginaCompleta(a));
    const v = validar({ ...req.body, autorizaPrevio: !!a.negocio });
    if (!v.ok) return res.status(400).send(pagina.paginaCompleta(a, { entrada: { ...req.body, ...v.datos, areas: v.datos.areas }, errores: v.errores }));
    const primera = !a.negocio;
    accesos.actualizar(a.token, { negocio: v.datos, negocioAt: Date.now(), negocioPor: 'web', ediciones: primera ? 0 : (a.ediciones || 0) + 1, autorizaDatosAt: Date.now() });
    if (opciones.alGuardar) Promise.resolve().then(() => opciones.alGuardar(a, primera)).catch((e) => console.error('[SANIDAD] Aviso al guardar:', e.message));
    res.redirect(303, `/acceso/${encodeURIComponent(a.token)}?ok=1#documentos`);
  });

  app.get('/s/:token/todo.zip', (req, res) => {
    const a = accesoSanidad(req, res); if (!a) return;
    if (!a.negocio) return res.redirect(`/acceso/${encodeURIComponent(a.token)}`);
    accesos.registrarUso(a.token, 'descargas');
    enviar(res, D.zipTodo(a.negocio, a.plan), false);
  });
  app.get('/s/:token/:archivo', (req, res) => {
    const a = accesoSanidad(req, res); if (!a) return;
    if (!a.negocio) return res.redirect(`/acceso/${encodeURIComponent(a.token)}`);
    const m = /^([a-z_]+)\.(pdf|docx)$/.exec(String(req.params.archivo || ''));
    const dc = m && D.doc(m[1]);
    if (!dc) return res.status(404).send('Documento no encontrado');
    if (!D.permitido(dc, a.plan)) return res.status(403).send(require('../paginaAcceso').paginaNoValida('bloqueado', a));
    const g = D.generar(m[1], m[2], a.negocio, a.plan);
    if (!g) return res.status(404).send('Documento no encontrado');
    accesos.registrarUso(a.token, 'descargas');
    enviar(res, g, m[2] === 'pdf');
  });
}

module.exports = { montar };
