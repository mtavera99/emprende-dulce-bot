// Genera las imágenes que el bot envía por WhatsApp para sanidad (public/descargas/muestras/img/sanidad_*.jpg)
// con un negocio de EJEMPLO. Necesita Chrome o Chromium:  CHROME_PATH=/ruta/chrome node scripts/sanidad/build_imagenes.js
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const R = '../../src/sanidad/';
const { PDF } = require(R + 'pdf');
const D = require(R + 'documentos');
const { validar } = require(R + 'datos');

const chrome = process.env.CHROME_PATH || 'chromium';
// Primer día del mes siguiente: la primera hoja del ejemplo sale con el mes completo
function primeroDelMes() {
  const h = new Date(Date.now() - 5 * 3600e3);
  return new Date(Date.UTC(h.getUTCFullYear(), h.getUTCMonth() + 1, 1)).toISOString().slice(0, 10);
}
const OUT = path.join(__dirname, '../../public/descargas/muestras/img');

// Captura el objeto PDF de cada documento para sacar el SVG de sus páginas
let ultimo = null;
const orig = PDF.prototype.buffer;
PDF.prototype.buffer = function () { ultimo = this; return orig.call(this); };
const paginas = (id) => { D.generar(id, 'pdf', datos, 'llave'); return ultimo.paginas; };

const v = validar({ nombre: 'Restaurante Ejemplo', nit: '900123456-7', direccion: 'Calle 10 # 20-30', ciudad: 'Bogotá', telefono: '3001234567', tipo: 'restaurante',
  encargado: 'Ana María Rojas', manipuladores: 'Ana María Rojas\nLuis Pérez\nCarolina Díaz', refrigeracion: 'Nevera cocina\nVitrina de bebidas', congelacion: 'Congelador horizontal',
  agua: 'tanque', tanqueLitros: '1000', inicio: primeroDelMes(), autoriza: true });
if (!v.ok) throw new Error(JSON.stringify(v.errores));
const datos = v.datos;

function captura(nombre, html, w, h) {
  const f = path.join(os.tmpdir(), `san_${nombre}.html`);
  fs.writeFileSync(f, `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;width:${w}px;height:${h}px;overflow:hidden;font-family:Helvetica,Arial,sans-serif}</style></head><body>${html}</body></html>`);
  execFileSync(chrome, ['--headless', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', `--screenshot=${path.join(OUT, nombre)}`, `--window-size=${w},${h}`, `file://${f}`], { stdio: 'ignore' });
  console.log('  ✔', nombre);
}
const hoja = (svg, ancho, giro = 0) => `<div style="width:${ancho}px;box-shadow:0 10px 30px rgba(0,0,0,.45);transform:rotate(${giro}deg);background:#fff">${svg.replace('<svg ', `<svg style="width:${ancho}px;height:auto;display:block" `)}</div>`;

const plan = paginas('plan'), temp = paginas('m_temperaturas'), cart = paginas('carteles'), limp = paginas('m_limpieza');
captura('sanidad_1_catalogo.jpg', `<div style="background:linear-gradient(160deg,#0b3b5b,#0f766e);width:1080px;height:1080px;position:relative;color:#fff">
  <div style="padding:46px 56px 0"><div style="font-size:26px;font-weight:700;color:#99f6e4;letter-spacing:2px">RESOLUCIÓN 2674 DE 2013 · 2026-2027</div>
  <div style="font-size:64px;font-weight:800;line-height:1.05;margin-top:10px">Plan de Saneamiento<br>Básico + Planillas</div>
  <div style="font-size:28px;margin-top:14px;color:#e2e8f0">Con el nombre, NIT y dirección de tu negocio</div></div>
  <div style="position:absolute;left:60px;top:390px">${hoja(plan[0].svg(), 330, -4)}</div>
  <div style="position:absolute;left:330px;top:430px">${hoja(temp[0].svg(), 520, 2)}</div>
  <div style="position:absolute;left:770px;top:380px">${hoja(cart[1].svg(), 250, 5)}</div>
  <div style="position:absolute;left:0;right:0;bottom:0;background:#fff;color:#0b3b5b;padding:22px 56px;font-size:27px;font-weight:700;display:flex;justify-content:space-between">
    <span>Plan Personalizado $49.900</span><span>Llave en Mano (4 meses) $79.900</span></div>
  <div style="position:absolute;right:56px;top:350px;font-size:18px;color:#ccfbf1">Documentos de un negocio de ejemplo</div></div>`, 1080, 1080);
captura('sanidad_2_planillas.jpg', `<div style="background:#e2e8f0;width:1080px;height:860px;position:relative">
  <div style="position:absolute;left:40px;top:40px">${hoja(temp[0].svg(), 640, -2)}</div>
  <div style="position:absolute;left:400px;top:330px">${hoja(limp[0].svg(), 640, 2)}</div>
  <div style="position:absolute;left:40px;bottom:30px;background:#0b3b5b;color:#fff;padding:14px 22px;border-radius:10px;font-size:24px;font-weight:700">Ejemplo: planillas con fechas, neveras y personal del negocio</div></div>`, 1080, 860);
