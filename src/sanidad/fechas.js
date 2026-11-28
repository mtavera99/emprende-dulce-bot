// Fechas del ciclo de 4 meses (en UTC para que no cambien con la zona horaria del servidor)
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const fecha = (iso) => new Date(`${iso}T12:00:00Z`);
const iso = (d) => d.toISOString().slice(0, 10);
const masDias = (d, n) => new Date(d.getTime() + n * 864e5);
function masMeses(d, n) {
  const r = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1, 12));
  const ultimo = new Date(Date.UTC(r.getUTCFullYear(), r.getUTCMonth() + 1, 0, 12)).getUTCDate();
  r.setUTCDate(Math.min(d.getUTCDate(), ultimo));
  return r;
}
const dd = (d) => `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
const larga = (d) => `${d.getUTCDate()} de ${MESES[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
const corta = (d) => `${dd(d)}/${d.getUTCFullYear()}`;
const dia = (d) => `${DIAS[d.getUTCDay()]} ${dd(d)}`;
const mesAnio = (d) => `${MESES[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
const mesCorto = (d) => `${MESES[d.getUTCMonth()].slice(0, 3)}-${String(d.getUTCFullYear()).slice(2)}`;

// Ciclo entre visitas: desde la fecha de inicio hasta el día antes de cumplir 4 meses
function ciclo(inicioIso, meses = 4) {
  const ini = fecha(inicioIso);
  const fin = masDias(masMeses(ini, meses), -1);
  const dias = [];
  for (let d = ini; d <= fin; d = masDias(d, 1)) dias.push(d);
  // Agrupados por mes calendario
  const porMes = [];
  for (const d of dias) {
    const clave = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
    let m = porMes[porMes.length - 1];
    if (!m || m.clave !== clave) porMes.push(m = { clave, titulo: mesAnio(d), dias: [] });
    m.dias.push(d);
  }
  // Semanas de lunes a domingo
  const semanas = [];
  for (const d of dias) {
    const lunes = masDias(d, -((d.getUTCDay() + 6) % 7));
    let s = semanas[semanas.length - 1];
    if (!s || iso(s.lunes) !== iso(lunes)) semanas.push(s = { lunes, dias: [] });
    s.dias.push(d);
  }
  return { ini, fin, dias, porMes, semanas };
}

module.exports = { MESES, DIAS, fecha, iso, masDias, masMeses, dd, larga, corta, dia, mesAnio, mesCorto, ciclo };
