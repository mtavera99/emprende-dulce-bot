// ============================================================================
// Reglas y textos de venta por producto
// ----------------------------------------------------------------------------
// Un solo lugar para: precios (normal y descuento), contenido REAL de cada pack
// (lo usa también la IA para no inventar), textos de seguimiento, horario de
// silencio y detección de intención (pagar, pedir muestra, rechazar, etc.).
// ============================================================================
const fs = require('fs');
const path = require('path');
const store = require('./store');

const PUBLIC = path.join(__dirname, '../public/descargas');
const TZ = 'America/Bogota';

// ---------------------------------------------------------------------------- precios
function precioNormal() {
  return Number(store.getSettings().precioOferta) || 10000;
}

function precioDescuento() {
  return Number(store.getSettings().precioDescuento) || Number(process.env.PRECIO_DESCUENTO) || 8000;
}

// Precio que se le ofreció a este cliente (quien ya recibió $7.000 lo conserva)
function precioDe(lead) {
  return (lead && Number(lead.precioOfrecido)) || precioNormal();
}

function cop(v) {
  return '$' + Math.round(Number(v) || 0).toLocaleString('es-CO');
}

// ---------------------------------------------------------------------------- horario
// No se escriben seguimientos entre las 9 p. m. y las 7 a. m. (hora de Colombia)
function horaColombia(ms = Date.now()) {
  return Number(new Date(ms).toLocaleString('en-US', { timeZone: TZ, hour: 'numeric', hour12: false })) % 24;
}

function enHorarioSilencio(ms = Date.now()) {
  const h = horaColombia(ms);
  const desde = Number(process.env.SILENCIO_DESDE || 21);
  const hasta = Number(process.env.SILENCIO_HASTA || 7);
  return desde > hasta ? (h >= desde || h < hasta) : (h >= desde && h < hasta);
}

// ---------------------------------------------------------------------------- contenido real
function manifestMoldes() {
  try { return JSON.parse(fs.readFileSync(path.join(PUBLIC, 'moldes/manifest.json'), 'utf8')); } catch (_) { return { colecciones: [], totales: {} }; }
}

function infoPack(producto) {
  if (producto === 'moldes') {
    const m = manifestMoldes();
    const T = m.totales || {};
    return {
      producto,
      nombre: 'Mega Pack de Moldes de Costura 2026',
      emoji: '🧵',
      queIncluye: 'las 10 colecciones de moldes y los 4 bonos',
      colecciones: m.colecciones.map((c) => ({ id: c.id, titulo: c.titulo, prendas: c.prendas.map((p) => `${p.nombre} (${p.n_tallas} tallas)`) })),
      totales: { patrones: T.patrones || 34, moldes: T.moldes || 1210, imprimibles: T.moldes_imprimibles || 2420, hojas: T.hojas_carta || 3764 },
    };
  }
  return {
    producto: 'helados',
    nombre: 'Colección Emprende Dulce 2026',
    emoji: '🍰',
    queIncluye: 'los 3 libros y los 3 bonos',
  };
}

// Texto que se le da a la IA para que solo hable de lo que el pack trae de verdad
function conocimiento(producto) {
  const p = infoPack(producto);
  if (producto === 'moldes') {
    const lista = p.colecciones.map((c) => `- ${c.id} ${c.titulo}: ${c.prendas.join('; ')}`).join('\n');
    return `PRODUCTO: ${p.nombre}. Es digital (PDF), se entrega por este chat con un enlace personal. Precio ${cop(precioNormal())} pago único.
CONTENIDO EXACTO (no hay nada más): ${p.totales.patrones} patrones profesionales en 10 colecciones:
${lista}
- Tallas: adulto XS a XXL (6 tallas); bebé 0-3 a 18-24 meses; niña y niño 2 a 10; mascotas S a XL; bolsos en 3 tamaños.
- Cada patrón trae: ficha técnica de 6 páginas (dibujo plano de la prenda adelante y atrás, tabla de medidas, consumo de tela, despiece pieza por pieza, secuencia de armado y guía de impresión) y un PDF por talla a escala real en hoja Carta y en A4. Las hojas vienen numeradas (A1, A2, B1…) con marcas para unirlas con cinta. Incluye márgenes de costura.
- En total ${p.totales.moldes.toLocaleString('es-CO')} moldes de pieza (cada pieza en cada talla), que en Carta y A4 son ${p.totales.imprimibles.toLocaleString('es-CO')} moldes imprimibles.
- 4 bonos: Manual Técnico de Costura, Guía de Telas, Agujas y Prensatelas, Tabla de Medidas y Cómo Medir, Calculadora de Costos y Precios.
NO INCLUYE: fotos de prendas reales (las fichas traen dibujos técnicos), videos, ni prendas que no estén en la lista. Para hombre solo hay la Bermuda Clásica Formal (Hombre), el Hoodie unisex, el Jogger y el Scrub médico; NO hay camisas polo, pantalones de dril de hombre ni bóxers. Los archivos vienen en carpetas ZIP por colección y también se pueden abrir los PDF sueltos desde el enlace.`;
  }
  return `PRODUCTO: ${p.nombre}. Es digital (PDF), se entrega por este chat con un enlace personal. Precio ${cop(precioNormal())} pago único.
CONTENIDO EXACTO: 3 libros en PDF: Guía Maestra de Helados Artesanales (47 páginas), Postres en Vaso para Emprender (41 páginas, 12 recetas: tres leches, pie de limón, cheesecake, tiramisú, marquesa, entre otras) y Recetario Navideño y Cajas de Regalo (35 páginas). Bonos: calculadora de costos y precios (Excel y web), directorio de proveedores en Colombia y guía de ventas por WhatsApp.
NO INCLUYE videos, cursos en vivo ni asesoría personalizada.`;
}

// ---------------------------------------------------------------------------- muestras
function host() {
  return process.env.RENDER_EXTERNAL_URL || 'https://emprende-dulce-bot.onrender.com';
}

function imagenes(producto) {
  const h = host();
  if (producto === 'moldes') {
    return {
      catalogo: `${h}/descargas/muestras/img/moldes_1_catalogo.jpg`,
      portada: `${h}/descargas/muestras/img/moldes_2_ficha_portada.jpg`,
      mapa: `${h}/descargas/muestras/img/moldes_3_mapa_impresion.jpg`,
      hoja: `${h}/descargas/muestras/img/moldes_4_hoja_escala_real.jpg`,
    };
  }
  return { catalogo: `${h}/descargas/muestra_receta_oficial.jpg` };
}

// PDF de muestra que se envían por WhatsApp (abren directo en el celular)
function documentosMuestra(producto) {
  const h = host();
  if (producto === 'moldes') {
    return [
      { url: `${h}/muestra/Muestra_Falda_Ficha_Tecnica.pdf`, nombre: 'Muestra_Falda_Ficha_Tecnica.pdf', caption: 'Ficha técnica completa de la Falda Media Campana (6 páginas)' },
      { url: `${h}/muestra/Muestra_Falda_Talla_M_Carta.pdf`, nombre: 'Muestra_Falda_Talla_M_Carta.pdf', caption: 'Molde de la talla M en hoja Carta, a escala real' },
    ];
  }
  return [{ url: `${h}/muestra/Muestra_Postres_en_Vaso_5_Recetas.pdf`, nombre: 'Muestra_Postres_en_Vaso_5_Recetas.pdf', caption: '5 recetas de Postres en Vaso con costeo' }];
}

// ---------------------------------------------------------------------------- textos
function cuentas(settings) {
  const num = settings.nequiNumero || '3058742138';
  return `💚 *Nequi / Llave / Bre-B:* \`${num}\`\n` +
    `💛 *Daviplata:* \`${settings.daviplataNumero || num}\`\n` +
    `👤 *Titular:* ${settings.nequiTitular || 'Manuel Tavera'} _(en Nequi o Daviplata te puede salir como MAN*** TAV***)_`;
}

function textoPitch(producto) {
  if (producto === 'moldes') {
    return `¡Hola! 🧵 Te cuento qué trae el *Mega Pack de Moldes de Costura 2026*:\n\n` +
      `✅ *34 patrones profesionales* en 10 colecciones: vestidos, blusas y camisas, pantalones y shorts, faldas, ropa deportiva, lencería y pijamas, infantil y bebé, mascotas, bolsos y uniformes\n` +
      `✅ Cada patrón en *todas sus tallas* (XS a XXL en adulto) a *escala real*: 2.420 moldes listos para imprimir en tu casa en hoja Carta o A4\n` +
      `✅ Ficha técnica de cada prenda: medidas, consumo de tela, despiece y paso a paso de armado\n` +
      `✅ 4 bonos: manual de costura, guía de telas y agujas, tabla de medidas y calculadora de costos\n\n` +
      `Todo por *${cop(precioNormal())}* pago único. Te llega por este chat.\n\n` +
      `Toca un botón 👇 o responde *1* para comprar ahora o *2* para recibir *gratis* un patrón completo de muestra 🎁`;
  }
  return `¡Hola! 🍰 Te cuento qué trae la colección *Emprende Dulce 2026*:\n\n` +
    `📖 *Helados Artesanales* (47 págs): fórmulas cremosas, paletas rellenas y helados de paila\n` +
    `🧁 *Postres en Vaso* (41 págs): 12 recetas para vender, con costeo\n` +
    `🎄 *Recetario Navideño y Cajas de Regalo* (35 págs)\n` +
    `🎁 Bonos: calculadora de costos, directorio de proveedores y guía de ventas por WhatsApp\n\n` +
    `Todo por *${cop(precioNormal())}* pago único. Te llega por este chat.\n\n` +
    `Toca un botón 👇 o responde *1* para comprar ahora o *2* para recibir *gratis* 5 recetas de muestra 🎁`;
}

// Botones del primer mensaje (título máximo 20 caracteres en WhatsApp)
function botonesPitch() {
  return [
    { id: 'comprar', title: `💳 Comprar ${cop(precioNormal())}` },
    { id: 'muestra', title: '🎁 Muestra gratis' },
  ];
}

// Primer seguimiento a los 15 minutos de enviar los datos de pago o la muestra
function textoRescate(tipo) {
  return tipo === 'muestra'
    ? `¿Tuviste algún problema con Nequi o con abrir el archivo? 🙌 Cuéntame y te ayudo por aquí.\n\nSi la muestra te gustó y quieres el pack completo, responde *sí* y te paso los datos de pago.`
    : `¿Tuviste algún problema con Nequi o con abrir el archivo? 🙌 Cuéntame y te ayudo por aquí.\n\nSi ya transferiste, envíame la captura del comprobante y te llega tu enlace enseguida.`;
}

function enlaceCalculadora(producto) {
  return `${host()}/regalo/calculadora?p=${producto === 'moldes' ? 'moldes' : 'helados'}`;
}

function textoPago(producto, settings, precio, opciones = {}) {
  const p = infoPack(producto);
  return `¡Listo! 🙌 Estas son las cuentas para tu transferencia de *${cop(precio)}*:\n\n` +
    `${cuentas(settings)}\n\n` +
    `_Toca el número para copiarlo._\n\n` +
    `Cuando hagas la transferencia, *envíame la captura del comprobante por este chat* y te llega tu enlace personal con ${p.queIncluye} ${p.emoji}` +
    (opciones.ofrecerMuestra ? `\n\n_¿Prefieres ver antes una muestra gratis? Escribe *MUESTRA*._` : '');
}

function textoDespuesMuestra(producto, precio) {
  const p = infoPack(producto);
  return producto === 'moldes'
    ? `Ahí te van 👆 la ficha técnica completa y el molde de la talla M. Ábrelo en el celular o imprímelo al 100 % (tamaño real) y mide el cuadro de 5 × 5 cm.\n\n` +
      `Así vienen los *34 patrones* del pack, cada uno en todas sus tallas. Si te gusta, el pack completo con ${p.queIncluye} vale *${cop(precio)}*. ¿Te paso los datos de pago?`
    : `Ahí te va 👆 la muestra con 5 recetas y su costeo.\n\nSi te gusta, la colección completa con ${p.queIncluye} vale *${cop(precio)}*. ¿Te paso los datos de pago?`;
}

function textoConfianza(producto) {
  return producto === 'moldes'
    ? `Te entiendo, hay mucho engaño en internet 🙏 Por eso no te pido que confíes: *mira primero el material*.\n\n` +
      `Te mando gratis un patrón completo (ficha técnica + molde a escala real) para que lo abras y lo revises antes de pagar. Si te convence, compras el pack; si no, no pierdes nada.`
    : `Te entiendo, hay mucho engaño en internet 🙏 Por eso no te pido que confíes: *mira primero el material*.\n\n` +
      `Te mando gratis 5 recetas de muestra para que las revises antes de pagar. Si te convencen, compras la colección; si no, no pierdes nada.`;
}

// Seguimientos: solo se envían dentro de las 24 h desde el último mensaje del cliente
function textoSeguimiento(paso, producto, precio) {
  const p = infoPack(producto);
  const e = p.emoji;
  if (paso === 1) {
    return `Te dejo un regalo 🎁 la *Calculadora de Costos y Precios* que viene en el pack, para que veas cuánto puedes cobrar ${producto === 'moldes' ? 'por cada prenda' : 'por cada postre'}:\n${enlaceCalculadora(producto)}\n\n` +
      `Y si hoy te animas, te dejo el ${producto === 'moldes' ? 'pack completo' : 'paquete completo'} en *${cop(precio)}* en lugar de ${cop(precioNormal())}. ` +
      `Solo dime "sí" y te paso los datos ${e}`;
  }
  if (paso === 2) {
    return producto === 'moldes'
      ? `Te muestro cómo viene cada patrón por dentro 👆 La ficha trae medidas, consumo de tela, despiece y el mapa para unir las hojas.\n\n¿Quieres que te envíe gratis un patrón completo para que lo revises? 🎁`
      : `Así viene cada receta por dentro 👆 con ingredientes, costeo y paso a paso.\n\n¿Quieres que te envíe gratis 5 recetas de muestra? 🎁`;
  }
  if (paso === 3) {
    return `Una propuesta: te doy acceso primero a todo el pack en modo vista previa para que veas que es lo que prometemos 🤝\n\n` +
      `Si te convence, pagas *${cop(precio)}* y se desbloquea todo.\n\nEscribe *HONESTIDAD* y te mando el acceso.`;
  }
  return `Último mensaje, para no molestarte 🙏 El precio de *${cop(precio)}* por ${p.queIncluye} sigue disponible hoy.\n\n` +
    `Si lo quieres, escríbeme "sí". Si no te interesa, no te vuelvo a escribir ${e}`;
}

// ---------------------------------------------------------------------------- intención
function normalizar(t) {
  return String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N}\s?¿]/gu, ' ').replace(/\s+/g, ' ').trim();
}

const PALABRAS_SI = new Set(('si sii siii claro dale de una bueno listo ok oka okey okay okis vale hagale perfecto excelente super va yes ' +
  'por favor porfa porfavor gracias muchas quiero lo la los me interesa deseo nequi daviplata pasame pasa mandame enviame envia manda ' +
  'el los dato datos cuenta numero senora senor amor reina linda corazon bendiciones amen y a mi una ya hagamosle de una vez ' +
  'regalame regala dame muestra pues entonces obvio seguro').split(' '));

// "sí", "si por favor", "dale de una", "ok mándame los datos"
function esAfirmacion(texto) {
  const n = normalizar(texto);
  if (!n || n.includes('?') || n.includes('¿') || n.length > 60) return false;
  const pal = n.split(' ').filter(Boolean);
  if (!pal.some((w) => /^(si+|claro|dale|bueno|listo|ok\w*|vale|hagale|perfecto|quiero|una|porfa\w*|favor|obvio|seguro|y)$/.test(w))) return false;
  return pal.every((w) => PALABRAS_SI.has(w));
}

// Pide expresamente cómo pagar
function esPedidoPago(texto) {
  const n = normalizar(texto);
  return /\b(datos|dato|numero|cuenta|llave)\b.*\b(pago|pagar|nequi|daviplata|consignar|transferir)\b/.test(n) ||
    /\b(pasame|mandame|enviame|dame|regalame|deme|envieme|mandeme)\b.*\b(datos|dato|numero|cuenta|nequi|daviplata|llave)\b/.test(n) ||
    /\b(como|donde|a donde|a que numero|a cual)\b.*\b(pago|pagar|pagarle|consigno|consignar|consignarle|transfiero|transferir|transferirle|compro|comprar|comprarlo|cancelo|cancelar|adquirir|adquirirlo)\b/.test(n) ||
    /\b(quiero|voy a)\s+(comprar|pagar|adquirir|consignar|transferir)/.test(n) ||
    /^(por )?(nequi|daviplata|bre b|llave)$/.test(n);
}

// Pide ver el producto: fotos, catálogo, ejemplo, muestra
function esPedidoMuestra(texto) {
  const n = normalizar(texto);
  return /\b(foto|fotos|imagen|imagenes|catalogo|ejemplo|muestra|muestrame|mostrar|muestras|video|videos|ver el material|ver los moldes|ver como|como vienen|como viene|como son|como se ven|vista previa|pantallazo|captura)\b/.test(n);
}

// Duda de si es real / miedo a estafa
function esDesconfianza(texto) {
  const n = normalizar(texto);
  return /\b(estafa\w*|estafar|robo|roban|robaron|robar|engano\w*|enganar|miedo|desconfi\w*|sospech\w*|garantia|confiable|confiar|confio|es real|algo real|tan cierto|es cierto|es seguro|sera seguro|seguro que|no me llegaron|nunca me llegaron|no me enviaron|nunca me enviaron|perdi mi dinero|perdi la plata|primero (me )?(mand|envi|pas)\w*|si (envian|mandan|llegan|llega)|como se que|como saber)\b/.test(n);
}

// Ya no quiere / pide que no le escriban
function esRechazo(texto) {
  const n = normalizar(texto);
  if (/\b(no me (escriban|escribas|escriba|molesten|molestes)|dejen? de (escribir|escribirme|molestar)|no (me )?(vuelvan|vuelvas) a escribir|no quiero (ya )?(nada|mas)|ya no (quiero|me interesa)|no me interesa|no gracias|stop|basta|borrame|eliminame|no estoy interesad\w*)\b/.test(n)) return 'fuerte';
  return null;
}

// Pide el descuento que se le ofreció
function esPedidoDescuento(texto) {
  const n = normalizar(texto);
  if (n.includes('?') || /\b(sera|todavia|aun|hasta cuando|el lunes|manana|despues)\b/.test(n)) return false;
  return /\b(quiero|dame|pasame|aprovechar|tomo|acepto|si)\b.*\b(descuento|promo|promocion|oferta|datos actualizados)\b/.test(n) || /^(7|8)\s?000$/.test(n.replace(/\s/g, ''));
}

// Avisa que ya pagó o que manda el comprobante
function esAvisoPago(texto) {
  const n = normalizar(texto);
  return /\b(ya (pague|transferi|consigne|cancele|envie|mande|hice)|listo el pago|ahi (le|te) (envie|mande)|te (envie|mande) el comprobante|comprobante)\b/.test(n);
}

// Problemas del comprador con la descarga
function esSoporteDescarga(texto) {
  const n = normalizar(texto);
  return /\b(link|enlace|no (me )?(abre|abren|sale|salen|llega|llegaron|funciona|carga|descarga)|descarg\w*|archivo\w*|zip|abrir|abro|correo|drive|no puedo|error)\b/.test(n);
}

module.exports = {
  precioNormal, precioDescuento, precioDe, cop, enHorarioSilencio, horaColombia,
  infoPack, conocimiento, imagenes, documentosMuestra, host,
  textoPitch, botonesPitch, textoRescate, enlaceCalculadora, textoPago, textoDespuesMuestra, textoConfianza, textoSeguimiento, cuentas,
  normalizar, esAfirmacion, esPedidoPago, esPedidoMuestra, esDesconfianza, esRechazo, esPedidoDescuento, esAvisoPago, esSoporteDescarga,
};
