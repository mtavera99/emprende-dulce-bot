// Lectura de archivos sueltos dentro de un ZIP, sin librerías externas.
// Sirve para que el comprador abra en el celular un PDF del pack sin descomprimir
// el ZIP completo. Soporta entradas "stored" (0) y "deflate" (8).
const fs = require('fs');
const zlib = require('zlib');

const cache = new Map(); // ruta -> { mtime, entradas }

function leerDirectorio(ruta) {
  const st = fs.statSync(ruta);
  const c = cache.get(ruta);
  if (c && c.mtime === st.mtimeMs) return c.entradas;

  const fd = fs.openSync(ruta, 'r');
  try {
    // Fin del directorio central: firma 0x06054b50 en los últimos 64 KB
    const largoCola = Math.min(st.size, 65557);
    const cola = Buffer.alloc(largoCola);
    fs.readSync(fd, cola, 0, largoCola, st.size - largoCola);
    let eocd = -1;
    for (let i = cola.length - 22; i >= 0; i--) if (cola.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
    if (eocd < 0) throw new Error('ZIP sin directorio central');
    const total = cola.readUInt16LE(eocd + 10);
    const tamDir = cola.readUInt32LE(eocd + 12);
    const inicioDir = cola.readUInt32LE(eocd + 16);
    const dir = Buffer.alloc(tamDir);
    fs.readSync(fd, dir, 0, tamDir, inicioDir);

    const entradas = [];
    let p = 0;
    for (let n = 0; n < total; n++) {
      if (dir.readUInt32LE(p) !== 0x02014b50) throw new Error('Directorio central inválido');
      const metodo = dir.readUInt16LE(p + 10);
      const comprimido = dir.readUInt32LE(p + 20);
      const tamano = dir.readUInt32LE(p + 24);
      const lNombre = dir.readUInt16LE(p + 28);
      const lExtra = dir.readUInt16LE(p + 30);
      const lComent = dir.readUInt16LE(p + 32);
      const offset = dir.readUInt32LE(p + 42);
      const nombre = dir.toString('utf8', p + 46, p + 46 + lNombre);
      if (!nombre.endsWith('/')) entradas.push({ n: entradas.length, nombre, metodo, comprimido, tamano, offset });
      p += 46 + lNombre + lExtra + lComent;
    }
    cache.set(ruta, { mtime: st.mtimeMs, entradas });
    return entradas;
  } finally {
    fs.closeSync(fd);
  }
}

// Devuelve un stream con el contenido descomprimido de la entrada
function abrirEntrada(ruta, entrada) {
  const fd = fs.openSync(ruta, 'r');
  const cab = Buffer.alloc(30);
  fs.readSync(fd, cab, 0, 30, entrada.offset);
  fs.closeSync(fd);
  if (cab.readUInt32LE(0) !== 0x04034b50) throw new Error('Cabecera local inválida');
  const inicio = entrada.offset + 30 + cab.readUInt16LE(26) + cab.readUInt16LE(28);
  const crudo = fs.createReadStream(ruta, { start: inicio, end: inicio + entrada.comprimido - 1 });
  if (entrada.metodo === 0) return crudo;
  if (entrada.metodo === 8) return crudo.pipe(zlib.createInflateRaw());
  throw new Error(`Método de compresión no soportado: ${entrada.metodo}`);
}

module.exports = { leerDirectorio, abrirEntrada };
