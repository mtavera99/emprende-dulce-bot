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
// Productos con precio propio en productCatalog (muebles: $15.000 / $12.000). Los demás usan el precio del panel.
function preciosPropios(producto) {
  const p = producto && require('./productCatalog').PRODUCTOS[producto];
  return p && p.precioPropio ? p : null;
}

function precioNormal(producto) {
  const p = preciosPropios(producto);
  return p ? p.precio : Number(store.getSettings().precioOferta) || 10000;
}

function precioDescuento(producto) {
  const p = preciosPropios(producto);
  return p ? p.precioDescuento : Number(store.getSettings().precioDescuento) || Number(process.env.PRECIO_DESCUENTO) || 8000;
}

// Precio que se le ofreció a este cliente (quien ya recibió $7.000 lo conserva).
// Una oferta hecha para otro producto no cuenta (precioProducto marca de qué producto era).
function precioDe(lead) {
  const prod = lead && lead.producto;
  const ofrecido = lead && Number(lead.precioOfrecido);
  if (ofrecido && (!lead.precioProducto || lead.precioProducto === prod)) return ofrecido;
  return precioNormal(prod);
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

function manifestMuebles() {
  const m = require('./muebles/portal').manifest();
  return m && m.categorias ? { guias: [], bonos: [], ...m } : { categorias: [], guias: [], bonos: [], totales: {}, muestra: {} };
}

function infoPack(producto) {
  if (producto === 'muebles') {
    const m = manifestMuebles();
    const T = m.totales || {};
    return {
      producto,
      nombre: 'Mega Pack de Carpintería y Muebles en Melamina 2026',
      emoji: '🪚',
      queIncluye: `los ${(T.planos || 0).toLocaleString('es-CO')} planos, las ${T.guias || 4} guías y los ${T.bonos || 2} bonos`,
      categorias: m.categorias,
      muestra: m.muestra || {},
      totales: { planos: T.planos || 0, disenos: T.disenos || 0, categorias: T.categorias || 0, piezas: T.piezas || 0 },
    };
  }
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
  if (producto === 'muebles') {
    // Por diseño: cuántas medidas tiene y sus rangos (la lista completa de medidas no cabe en el mensaje a la IA)
    const r = (xs) => { const u = [...new Set(xs)].sort((a, b) => a - b); return u.length > 1 ? `${u[0]} a ${u[u.length - 1]}` : `${u[0]}`; };
    const lista = p.categorias.map((c) => `- ${c.id} ${c.nombre} (${c.planos} planos): ` +
      c.disenos.map((d) => `${d.nombre} (${d.medidas.length} planos; ancho ${r(d.medidas.map((m) => m.A))} mm, alto ${r(d.medidas.map((m) => m.H))} mm, fondo ${r(d.medidas.map((m) => m.P))} mm)`).join('; ')).join('\n');
    return `PRODUCTO: ${p.nombre}. Es digital (PDF y un catálogo web), se entrega por este chat con un enlace personal. Precio ${cop(precioNormal('muebles'))} pago único.
CONTENIDO EXACTO (no hay nada más): ${p.totales.planos.toLocaleString('es-CO')} planos: ${p.totales.disenos} diseños base, cada uno en sus medidas estándar (anchos, altos y fondos comerciales) y configuraciones, en 5 categorías:
${lista}
- Cada plano trae: vista frontal con medidas, despiece pieza por pieza en milímetros (cantidad, largo, ancho y tapacanto), lista de herrajes y tornillería, cuántos tableros de 2,15 × 2,44 m y láminas de HDF comprar, metros de tapacanto, plano de cortes por tablero y paso a paso de armado.
- Si preguntan cómo así tantos planos: son ${p.totales.disenos} diseños de mueble, cada uno calculado en sus medidas estándar; cada medida es un plano propio con su despiece, herrajes y cortes. No digas que son ${p.totales.planos.toLocaleString('es-CO')} muebles o modelos distintos.
- Melamina de 15 mm (las camas en 18 mm). En el catálogo web el comprador puede cambiar ancho, alto, fondo y espesor de los muebles de cuerpo, escritorios y tocadores, y se recalcula el despiece.
- Sirve sin taller: se lleva el despiece a un depósito (Madecentro, Homecenter u otro) que corta y enchapa, y se arma en casa con taladro.
- 4 guías en PDF: Materiales, tableros y herrajes; Cortar, cantear, perforar y unir (incluye el camino sin taller); Optimización de cortes y láminas; Diseño 3D con SketchUp y render.
- 2 bonos: Calculadora de costos, láminas y cotización en pesos colombianos (se abre en el navegador) y Guía para cobrar un trabajo de carpintería en Colombia (márgenes, anticipo del 50 %, cotización).
NO INCLUYE: archivos de SketchUp (.skp) ni renders hechos, videos, mesones (granito o postformado), módulos esquineros de cocina, camarotes ni camas altas, camas con cajones, puertas de vidrio, instalaciones eléctricas ni de plomería. Los planos no están probados en un taller físico: se calculan con reglas de construcción estándar y se recomienda revisar las medidas antes de cortar.`;
  }
  if (producto === 'moldes') {
    const lista = p.colecciones.map((c) => `- ${c.id} ${c.titulo}: ${c.prendas.join('; ')}`).join('\n');
    return `PRODUCTO: ${p.nombre}. Es digital (PDF), se entrega por este chat con un enlace personal. Precio ${cop(precioNormal(producto))} pago único.
CONTENIDO EXACTO (no hay nada más): ${p.totales.patrones} patrones profesionales en 10 colecciones:
${lista}
- Tallas: adulto XS a XXL (6 tallas); bebé 0-3 a 18-24 meses; niña y niño 2 a 10; mascotas S a XL; bolsos en 3 tamaños.
- Cada patrón trae: ficha técnica de 6 páginas (dibujo plano de la prenda adelante y atrás, tabla de medidas, consumo de tela, despiece pieza por pieza, secuencia de armado y guía de impresión) y un PDF por talla a escala real en hoja Carta y en A4. Las hojas vienen numeradas (A1, A2, B1…) con marcas para unirlas con cinta. Incluye márgenes de costura.
- En total ${p.totales.moldes.toLocaleString('es-CO')} moldes de pieza (cada pieza en cada talla), que en Carta y A4 son ${p.totales.imprimibles.toLocaleString('es-CO')} moldes imprimibles.
- 4 bonos: Manual Técnico de Costura, Guía de Telas, Agujas y Prensatelas, Tabla de Medidas y Cómo Medir, Calculadora de Costos y Precios.
- Si dicen que 34 son pocos o preguntan cómo así 34 si son +2.000 moldes: explica con honestidad que son 34 prendas distintas; cada prenda trae todas sus piezas (delantero, espalda, mangas, cuello…) en cada talla, y eso da ${p.totales.moldes.toLocaleString('es-CO')} moldes de pieza, que se pueden imprimir en Carta o en A4 (${p.totales.imprimibles.toLocaleString('es-CO')}). No digas que son 2.000 prendas o modelos distintos.
NO INCLUYE: fotos de prendas reales (las fichas traen dibujos técnicos), videos, ni prendas que no estén en la lista. Para hombre solo hay la Bermuda Clásica Formal (Hombre), el Hoodie unisex, el Jogger y el Scrub médico; NO hay camisas polo, pantalones de dril de hombre ni bóxers. Los archivos vienen en carpetas ZIP por colección y también se pueden abrir los PDF sueltos desde el enlace.`;
  }
  return `PRODUCTO: ${p.nombre}. Es digital (PDF), se entrega por este chat con un enlace personal. Precio ${cop(precioNormal(producto))} pago único.
CONTENIDO EXACTO: 3 libros en PDF: Guía Maestra de Helados Artesanales (47 páginas), Postres en Vaso para Emprender (41 páginas, 12 recetas: tres leches, pie de limón, cheesecake, tiramisú, marquesa, entre otras) y Recetario Navideño y Cajas de Regalo (35 páginas). Bonos: calculadora de costos y precios (Excel y web), directorio de proveedores en Colombia y guía de ventas por WhatsApp.
NO INCLUYE videos, cursos en vivo ni asesoría personalizada.`;
}

// ---------------------------------------------------------------------------- muestras
function host() {
  return process.env.RENDER_EXTERNAL_URL || 'https://emprende-dulce-bot.onrender.com';
}

function imagenes(producto) {
  const h = host();
  if (producto === 'muebles') {
    return {
      catalogo: `${h}/descargas/muestras/img/muebles_1_catalogo.jpg`,
      plano: `${h}/descargas/muestras/img/muebles_2_plano.jpg`,
      cortes: `${h}/descargas/muestras/img/muebles_3_cortes.jpg`,
    };
  }
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
  if (producto === 'muebles') {
    const m = infoPack('muebles').muestra;
    return [{ url: `${h}/muestra/Muestra_Muebles_Plano_Mesa_de_Noche.pdf`, nombre: 'Muestra_Muebles_Plano_Mesa_de_Noche.pdf', caption: `Plano completo: ${m.nombre || 'Mesa de noche de 2 cajones'} (${m.cod || 'DOR-MN1-450'}), despiece en mm` }];
  }
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

// Qué es la muestra gratis, en pocas palabras (para reenvíos y para la IA)
function descripcionMuestra(producto) {
  if (producto === 'moldes') return '2 PDF: la ficha técnica y el molde de la talla M de la Falda Media Campana';
  if (producto === 'muebles') return `1 PDF: el plano completo de la ${(infoPack('muebles').muestra.nombre || 'mesa de noche de 2 cajones').toLowerCase()}`;
  return '1 PDF con 5 recetas de Postres en Vaso';
}

function textoPitch(producto) {
  if (producto === 'muebles') {
    const p = infoPack('muebles');
    // Primer mensaje corto (3 líneas): con el bloque largo respondía el 31 % de los clientes frente al 67 % de moldes
    return `🪚 *${p.totales.planos.toLocaleString('es-CO')} planos reales* de cocinas, clósets, escritorios, camas y más, con medidas en mm y despiece listo para llevar al depósito\n` +
      `📘 4 guías + calculadora de láminas y costos + guía de diseño 3D\n` +
      `💳 *${cop(precioNormal(producto))}* pago único, te llega por este chat. Toca *Comprar* o pide la *muestra gratis* 👇`;
  }
  if (producto === 'moldes') {
    return `¡Hola! 🧵 Te cuento qué trae el *Mega Pack de Moldes de Costura 2026*:\n\n` +
      `✅ *2.420 moldes a escala real* listos para imprimir en tu casa: son *34 prendas completas*, cada una con todas sus piezas en *todas sus tallas* (XS a XXL en adulto; también niños, bebé y mascotas), en hoja Carta y en A4\n` +
      `✅ 10 colecciones: vestidos, blusas y camisas, pantalones y shorts, faldas, ropa deportiva, lencería y pijamas, infantil y bebé, mascotas, bolsos y uniformes\n` +
      `✅ Ficha técnica de cada prenda: medidas, consumo de tela, despiece y paso a paso de armado\n` +
      `✅ 4 bonos: manual de costura, guía de telas y agujas, tabla de medidas y calculadora de costos\n\n` +
      `Todo por *${cop(precioNormal(producto))}* pago único. Te llega por este chat.\n\n` +
      `Toca un botón 👇 o responde *1* para comprar ahora o *2* para recibir *gratis* un patrón completo de muestra 🎁`;
  }
  return `¡Hola! 🍰 Te cuento qué trae la colección *Emprende Dulce 2026*:\n\n` +
    `📖 *Helados Artesanales* (47 págs): fórmulas cremosas, paletas rellenas y helados de paila\n` +
    `🧁 *Postres en Vaso* (41 págs): 12 recetas para vender, con costeo\n` +
    `🎄 *Recetario Navideño y Cajas de Regalo* (35 págs)\n` +
    `🎁 Bonos: calculadora de costos, directorio de proveedores y guía de ventas por WhatsApp\n\n` +
    `Todo por *${cop(precioNormal(producto))}* pago único. Te llega por este chat.\n\n` +
    `Toca un botón 👇 o responde *1* para comprar ahora o *2* para recibir *gratis* 5 recetas de muestra 🎁`;
}

// Botones del primer mensaje (título máximo 20 caracteres en WhatsApp)
function botonesPitch(producto) {
  return [
    { id: 'comprar', title: `💳 Comprar ${cop(precioNormal(producto))}` },
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
  return `${host()}/regalo/calculadora?p=${['moldes', 'muebles'].includes(producto) ? producto : 'helados'}`;
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
  if (producto === 'muebles') {
    return `Ahí te va 👆 el plano completo de la *${p.muestra.nombre || 'Mesa de noche de 2 cajones'}*: vista con medidas, despiece en mm con tapacanto, herrajes, láminas, plano de cortes y armado.\n\n` +
      `Así vienen los *${p.totales.planos.toLocaleString('es-CO')} planos* del pack. Si te gusta, el pack completo con ${p.queIncluye} vale *${cop(precio)}*. ¿Te paso los datos de pago?`;
  }
  return producto === 'moldes'
    ? `Ahí te van 👆 la ficha técnica completa y el molde de la talla M. Ábrelo en el celular o imprímelo al 100 % (tamaño real) y mide el cuadro de 5 × 5 cm.\n\n` +
      `Así vienen los *34 patrones* del pack, cada uno en todas sus tallas. Si te gusta, el pack completo con ${p.queIncluye} vale *${cop(precio)}*. ¿Te paso los datos de pago?`
    : `Ahí te va 👆 la muestra con 5 recetas y su costeo.\n\nSi te gusta, la colección completa con ${p.queIncluye} vale *${cop(precio)}*. ¿Te paso los datos de pago?`;
}

function textoConfianza(producto) {
  if (producto === 'muebles') {
    return `Te entiendo, hay mucho engaño en internet 🙏 Por eso no te pido que confíes: *mira primero el material*.\n\n` +
      `Te mando gratis un plano completo con su despiece en mm para que lo abras y lo revises antes de pagar. Si te convence, compras el pack; si no, no pierdes nada.`;
  }
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
    return `Te dejo un regalo 🎁 la *Calculadora de Costos y Precios* que viene en el pack, para que veas cuánto puedes cobrar ${{ moldes: 'por cada prenda', muebles: 'por cada mueble (calcula láminas, herrajes y anticipo)' }[producto] || 'por cada postre'}:\n${enlaceCalculadora(producto)}\n\n` +
      `Y si hoy te animas, te dejo el ${producto === 'helados' ? 'paquete completo' : 'pack completo'} en *${cop(precio)}* en lugar de ${cop(precioNormal(producto))}. ` +
      `Solo dime "sí" y te paso los datos ${e}`;
  }
  if (paso === 2 && producto === 'muebles') {
    return `Te muestro cómo viene cada plano por dentro 👆 Despiece en mm con tapacanto, herrajes, cuántas láminas comprar y el plano de cortes.\n\n¿Quieres que te envíe gratis un plano completo para que lo revises? 🎁`;
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
  if (/^((si |ok |bueno )?(me parece|me parece muy|me parece super|esta|muy|super|todo) (bien|perfecto|excelente|genial|bueno)|genial|chevere|de acuerdo|hagamosle|hagamoslo|me sirve)( (gracias|por favor|porfa))?$/.test(n)) return true;
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
    /^(por )?(nequi|daviplata|bre b|llave)$/.test(n) ||
    // "saque número le envío", "páseme el número", "deme la cuenta", "cuál es el número"
    /\b(saque|saca|sacame|saqueme|pase|pasa|paseme|passe|mande|manda|envie|envia|digame|dime|regale|cual es|cual seria|me da|me das|me pasa|me pasas|me manda|me envia)\b.{0,15}\b(el |su |ese |la |los )?(numero|nequi|daviplata|cuenta|llave|datos)\b/.test(n) ||
    // "a ese número", "a qué número", "a cuál número", "al nequi"
    /^(y |o |entonces |ok |listo |bueno )?(a|al|en) (ese|este|que|cual|su|el|cual es el) ?(numero|nequi|daviplata|cuenta|llave)\b/.test(n) ||
    /^(y |o |entonces )?(a|al|por) (nequi|daviplata)$/.test(n) ||
    /\b(a|al) (que|cual) (numero|nequi|daviplata|cuenta)\b/.test(n) ||
    // "le envío ya", "le transfiero", "le consigno ahorita" (avisa que va a pagar, sin comprobante todavía)
    /^(ya |listo |bueno |ok |entonces )?(le|te) (consigno|transfiero|pago|giro|envio la plata|mando la plata|envio el dinero|mando el dinero)( ya| ahorita| de una| ahora)?$/.test(n) ||
    // "sí, pásamelos", "mándelos", "envíemelos"
    /\b(pasamelos|pasemelos|mandamelos|mandemelos|enviamelos|enviemelos|mandelos|envielos|pasalos|mandalos|envialos|regalamelos)\b/.test(n) ||
    // "quiero el pack", "lo quiero", "me lo llevo", "lo compro", "quiero comprarlo"
    /^(si |ok |listo |bueno |dale )?(quiero (el|ese|este) (pack|paquete|kit|combo|mega pack)|(lo|la|los) quiero|me (lo|la|los) llevo|(lo|la|los) compro|quiero (comprarlo|comprarla|adquirirlo|pagarlo))( ya| de una| por favor| porfa)?$/.test(n);
}

// La última pregunta del bot fue si le pasa los datos de pago ("¿Te los envío de una vez?", "¿Te paso los datos?")
function ofreceDatosPago(texto) {
  const n = normalizar(texto);
  if (/nequi|daviplata/.test(n) && /\d{3} ?\d{3} ?\d{4}/.test(n)) return false; // ya trae las cuentas
  if (/\b(muestra|gratis|patron|receta)/.test(n)) return false; // ofrece la muestra, no los datos de pago
  return /\b(te|le) (los |las )?(paso|envio|mando|comparto|doy) (ya |de una |de una vez |ahora |ahorita )?.{0,25}\b(datos|cuentas?|numero|nequi|daviplata|pago)\b/.test(n) ||
    /\b(te|le) (los|las) (paso|envio|mando)\s*\?\s*$/.test(n) ||
    /\b(te|le) (los |las )?(paso|envio|mando|comparto) (ya|de una|de una vez|ahora|ahorita)\b/.test(n) ||
    /\bquieres que te (pase|envie|mande|comparta) (los datos|las cuentas|el numero)\b/.test(n) ||
    /\b(datos|cuentas) (de pago|para (pagar|la transferencia))\b.{0,20}\?/.test(n);
}

// Respuesta a "¿te paso los datos?": cualquier intención de seguir ("quiero el diseño", "o cómo", "dale", "sí")
// que no sea un no, una duda de confianza ni otra pregunta larga
function aceptaDatosPago(texto) {
  const n = normalizar(texto);
  if (!n || esRechazo(texto) || esDesconfianza(texto) || /^no\b/.test(n)) return false;
  if (n.split(' ').length > 8) return false;
  if (esAfirmacion(texto) || esPedidoPago(texto)) return true;
  return /\b(si+|quiero|dale|listo|ok\w*|bueno|hagale|de una|como|claro|porfa\w*|favor|envie\w*|mande\w*|pase\w*|numero|nequi|daviplata|cuenta|perfecto|va|vale|ya|ahora|ahorita|comprar|compro|pago|pagar)\b/.test(n);
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
  return /\b(quiero|dame|pasame|aprovechar|tomo|acepto|si)\b.*\b(descuento|promo|promocion|oferta|datos actualizados)\b/.test(n) || /^(7|8|12)\s?000$/.test(n.replace(/\s/g, ''));
}

// Avisa que ya pagó o que manda el comprobante
function esAvisoPago(texto) {
  const n = normalizar(texto);
  return /\b(ya (pague|transferi|consigne|cancele|envie|mande|hice)|listo el pago|ahi (le|te) (envie|mande)|te (envie|mande) el comprobante|comprobante)\b/.test(n);
}

// "No me llegó", "nada que llega": espera algo (la muestra) que no ve en el chat
function esNoLlego(texto) {
  const n = normalizar(texto);
  return /\b(no (me )?(ha |han )?(llega|llegado|llego|llegan|llegaron|aparece|aparecen)|nada que (llega|aparece|sale)|no (veo|recibo|recibi|me sale) (nada|el archivo|los archivos|la muestra|el pdf|el patron|el molde|ningun)|todavia nada|aun nada|y la muestra|donde (esta|quedo) la muestra|no ha llegado nada|no me ha llegado nada|sigo esperando)\b/.test(n);
}

// La IA ofrece la muestra ("¿Te envío gratis un patrón completo?") o dice que ya envió un archivo
function iaOfreceMuestra(texto) {
  const n = normalizar(texto);
  return /\b(te (envio|mando|comparto)|quieres que te (envie|mande|comparta)|te gustaria (que te envie|recibir|ver))\b.{0,80}\b(gratis|muestra|patron|molde|recetas?|plano)\b/.test(n) || /\bmuestra gratis\b.{0,40}\?/.test(n) || /\?.{0,5}$/.test(n) && /\bmuestra\b/.test(n);
}
function iaDiceQueEnvio(texto) {
  // Sin las preguntas ("¿Quieres que te envíe…?") ni el subjuntivo "que te envíe", que sin tildes se escribe igual que "te envié"
  const n = normalizar(texto).replace(/¿[^?]*\?/g, ' ').replace(/[^.!?]*\?/g, ' ').replace(/\b(que|si) te (lo |la |los |las )?(envie|mande|reenvie|adjunte|comparta|comparti)\b/g, ' ');
  return /\b(te (lo |la |los |las )?acabo de (enviar|mandar|reenviar|adjuntar|compartir)|te (lo |la |los |las )?(envie|mande|reenvie|adjunte|comparti)|ya te (lo |la |los |las )?(envie|mande|reenvie|adjunte)|te (lo |la |los |las )?(estoy enviando|reenvio|adjunto)|aqui (te )?(va|van|tienes) (el|la|los|las) (patron|molde|muestra|pdf|archivo|ficha|plano))\b/.test(n);
}

// Promete pagar después: "pago mañana al mediodía", "cuando baje al pueblo", "estoy sin señal"
function esPagoPospuesto(texto) {
  const n = normalizar(texto);
  if (!n || n.includes('?') || n.includes('¿') || /\bsera que\b/.test(n) || esAvisoPago(texto)) return false;
  const cuando = /\b(manana|pasado manana|mas tarde|en un rato|al rato|ratico|esta tarde|esta noche|en la tarde|en la noche|el (lunes|martes|miercoles|jueves|viernes|sabado|domingo)|(este|el) fin de semana|la (otra|proxima) semana|quincena|fin de mes)\b/.test(n);
  const pago = /\b(pag\w*|consign\w*|transfier\w*|transfer\w*|deposit\w*|compr\w*|nequi|daviplata|plata|dinero|saldo|(le|te) (mando|envio|hago))\b/.test(n);
  const fuerte = /\b(cuando (me paguen|me pague|baje|bajo|llegue|salga|vaya|pueda|tenga)|(sin|no tengo|no hay|poca|mala) (senal|cobertura|datos|internet)|zona rural|en el campo|en la finca|en la vereda|no tengo (plata|dinero|saldo)|no me han pagado|ahorita no (tengo|puedo))\b/.test(n);
  return (cuando && pago) || fuerte;
}

// Hora (ms) del recordatorio que se acordó, o null si no se puede saber o cae fuera de las 24 h de WhatsApp
function momentoRecordatorio(texto, ahora = Date.now()) {
  const n = normalizar(texto);
  const H = 3600e3;
  const enCol = (dias, hora) => { const d = new Date(ahora - 5 * H); d.setUTCDate(d.getUTCDate() + dias); d.setUTCHours(hora, 0, 0, 0); return d.getTime() + 5 * H; };
  let t = null;
  const hm = n.match(/\ba las (\d{1,2})\b/);
  let hora = hm ? Number(hm[1]) : null;
  if (hora !== null && hora >= 1 && hora <= 7) hora += 12; // "a las 3" = 3 p. m.
  if (/\bpasado manana\b/.test(n)) t = null;
  else if (/\bmanana\b/.test(n) && !/\bhoy\b/.test(n)) {
    if (hora === null) hora = /\b(mediodia|medio dia)\b/.test(n) ? 12 : /\b(tarde)\b/.test(n) ? 15 : /\bnoche\b/.test(n) ? 19 : /\b(temprano|en la manana|por la manana)\b/.test(n) ? 9 : 10;
    t = enCol(horaColombia(ahora) < 5 ? 0 : 1, hora); // a la madrugada, "mañana" es el mismo día
  } else if (/\b(mas tarde|en un rato|al rato|ratico)\b/.test(n)) t = ahora + 3 * H;
  else if (/\b(esta tarde|en la tarde|hoy)\b/.test(n)) { t = enCol(0, hora === null ? 15 : hora); if (t <= ahora) t = ahora + 2 * H; }
  else if (/\b(esta noche|en la noche)\b/.test(n)) t = enCol(0, hora === null ? 19 : hora);
  if (t === null || t < ahora + 30 * 60e3 || t - ahora > 23 * H || enHorarioSilencio(t)) return null;
  return t;
}

function textoPagoPospuesto(precio, recordarAt, cuentasTexto, ahora = Date.now()) {
  const dia = (ms) => new Date(ms - 5 * 3600e3).toISOString().slice(0, 10);
  const cuando = recordarAt ? (dia(recordarAt) === dia(ahora) ? 'más tarde' : 'mañana') : null;
  return `¡Con gusto! 🙌 Te guardo el precio de *${cop(precio)}*${cuando ? ` para ${cuando}` : ' para cuando puedas'}.\n\n` +
    (cuentasTexto ? `Te dejo las cuentas para que las tengas a mano:\n\n${cuentasTexto}\n\n` : '') +
    `Cuando hagas la transferencia, mándame la captura del comprobante por aquí y te llega tu enlace al instante.` +
    (recordarAt ? ` Te escribo ${cuando} para recordarte 😊` : ' 😊');
}

function textoRecordatorioPago(precio, cuentasTexto) {
  return `¡Hola! 🙌 Como quedamos, te recuerdo que tu precio de *${cop(precio)}* sigue guardado.\n\n${cuentasTexto}\n\n` +
    `Cuando hagas la transferencia, mándame la captura del comprobante por aquí y te llega tu enlace al instante.`;
}

// "No abre", "no me abre el enlace", "no puedo abrir"
function esNoAbre(texto) {
  const n = normalizar(texto);
  return /\b(no (me )?(abre|abren|carga|cargan|funciona|funcionan|sale|salen|descarga|descargan|deja|abrio|cargo)|no (puedo|pude|logro) (abrir|ver|descargar|entrar|bajar)|no (se )?(abre|abren|descarga|descargan))\b/.test(n);
}

// Problemas del comprador con la descarga
function esSoporteDescarga(texto) {
  const n = normalizar(texto);
  return /\b(link|enlace|no (me )?(abre|abren|sale|salen|llega|llegaron|funciona|carga|descarga)|descarg\w*|archivo\w*|zip|abrir|abro|correo|drive|no puedo|error)\b/.test(n);
}

module.exports = {
  precioNormal, precioDescuento, precioDe, cop, enHorarioSilencio, horaColombia,
  infoPack, conocimiento, imagenes, documentosMuestra, descripcionMuestra, host,
  textoPitch, botonesPitch, textoRescate, enlaceCalculadora, textoPago, textoDespuesMuestra, textoConfianza, textoSeguimiento, cuentas,
  normalizar, esAfirmacion, esPedidoPago, ofreceDatosPago, aceptaDatosPago, esPedidoMuestra, esDesconfianza, esRechazo, esPedidoDescuento, esAvisoPago, esSoporteDescarga,
  esNoLlego, esNoAbre, iaOfreceMuestra, iaDiceQueEnvio, esPagoPospuesto, momentoRecordatorio, textoPagoPospuesto, textoRecordatorioPago,
};
