// Cálculo de costos a partir de datos/precios.js. Todas las cifras de los
// libros salen de aquí para que nunca haya dos números distintos para lo mismo.
const P = require('../datos/precios');

const redondearComercial = (v, paso = 500) => Math.ceil(v / paso) * paso;

function costoIngrediente(ing) {
  if (!ing.ref) return 0;
  const p = P.ingredientes[ing.ref];
  if (!p) throw new Error(`Falta el precio del ingrediente "${ing.ref}" en datos/precios.js`);
  if (ing.u && ing.u !== p.unidad) {
    throw new Error(`Unidad incompatible en "${ing.n}": receta usa ${ing.u}, el catálogo usa ${p.unidad}`);
  }
  return (p.precio / p.cantidad) * ing.cant;
}

function costoEmpaque(lista = []) {
  return lista.reduce((s, id) => {
    const e = P.empaques[id];
    if (!e) throw new Error(`Falta el empaque "${id}" en datos/precios.js`);
    return s + e.precio;
  }, 0);
}

// recetasPorId permite que una receta use otra como sub-preparación
// (ej. un sabor de helado que parte de la Base Universal).
function costear(receta, recetasPorId) {
  const lineas = [];
  for (const ing of receta.ingredientes) {
    if (ing.grupo) continue;
    let costo = 0;
    if (ing.sub) {
      const sub = recetasPorId[ing.sub];
      if (!sub) throw new Error(`Sub-receta "${ing.sub}" no existe (usada en ${receta.id})`);
      costo = costear(sub, recetasPorId).materia * (ing.fraccion ?? 1);
    } else {
      costo = costoIngrediente(ing);
    }
    lineas.push({ ing, costo });
  }
  const materia = lineas.reduce((s, l) => s + l.costo, 0);
  const indirectos = materia * P.factorIndirectos;
  const porciones = receta.rinde?.porciones || 1;
  const ingPorcion = (materia + indirectos) / porciones;
  const empaque = costoEmpaque(receta.empaque);
  const unitario = ingPorcion + empaque;
  const r = { lineas, materia, indirectos, porciones, ingPorcion, empaque, unitario };

  if (receta.precioVenta) {
    r.precio = receta.precioVenta;
    r.ganancia = r.precio - unitario;
    r.margen = r.ganancia / r.precio;
    r.precioMin60 = redondearComercial(unitario / 0.4);
  }
  if (receta.formatoAlt) {
    const f = receta.formatoAlt;
    const unit = ingPorcion * f.equivalePorciones + costoEmpaque(f.empaque);
    r.alt = { nombre: f.nombre, unitario: unit, precio: f.precio, ganancia: f.precio - unit, margen: (f.precio - unit) / f.precio };
  }
  return r;
}

// Cajas regalo: suman piezas de recetas ya costeadas + empaque propio.
function costearCaja(caja, recetasPorId) {
  const lineas = caja.items.map((it) => {
    const rec = recetasPorId[it.receta];
    if (!rec) throw new Error(`Receta "${it.receta}" no existe (caja ${caja.id})`);
    const c = costear(rec, recetasPorId);
    // Costo por pieza sin el empaque individual de venta suelta, salvo que se pida.
    const pieza = it.conEmpaque ? c.unitario : c.ingPorcion + costoEmpaque(it.empaque);
    return { it, rec, costo: pieza * it.cantidad };
  });
  const contenido = lineas.reduce((s, l) => s + l.costo, 0);
  const empaque = costoEmpaque(caja.empaque);
  const unitario = contenido + empaque;
  const precio = caja.precioVenta;
  return { lineas, contenido, empaque, unitario, precio, ganancia: precio - unitario, margen: (precio - unitario) / precio, precioMin60: redondearComercial(unitario / 0.4) };
}

const cop = (v) => '$' + Math.round(v).toLocaleString('es-CO');
const pct = (v) => Math.round(v * 100) + '%';

module.exports = { costear, costearCaja, costoEmpaque, cop, pct, redondearComercial, P };
