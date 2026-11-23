const store = require('./store');
const waService = require('./whatsappService');
const ocrValidator = require('./ocrValidator');
const paymentVerifier = require('./paymentVerifier');
const audioService = require('./audioService');
const accesos = require('./accesos');
const productCatalog = require('./productCatalog');
const ventas = require('./ventas');

// Limpia la respuesta de la IA: sin enlaces inventados, sin [placeholders] y sin frases cortadas
function limpiarRespuestaIA(texto, finishReason) {
  const host = ventas.host().replace(/^https?:\/\//, '');
  let t = String(texto || '')
    .replace(/https?:\/\/\S+/g, (u) => (u.includes(host) || u.includes('wa.me/') ? u : ''))
    .replace(/\[[^\]]{0,60}\]/g, '')
    .replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  if (finishReason === 'MAX_TOKENS' || !/[.!?…)\p{Extended_Pictographic}]$/u.test(t)) {
    const corte = Math.max(t.lastIndexOf('. '), t.lastIndexOf('! '), t.lastIndexOf('? '), t.lastIndexOf('\n'));
    if (corte > 40) t = t.slice(0, corte + 1).trim();
  }
  return t;
}

class ConversationFlow {
  constructor() {
    this.defaultPrice = 10000;
  }

  getSettings() {
    return store.getSettings();
  }

  // Comprador: venta aprobada, o acceso completo desbloqueado a mano desde el panel (sin registrar venta)
  esComprador(phone) {
    return store.yaCompro(phone) || !!accesos.completoDe(phone);
  }

  async handleIncomingMessage(phone, message) {
    // Si el bot está pausado por el operador humano, no responde automáticamente
    if (store.isPaused(phone)) {
      console.log(`[FLOW] Chat ${phone} está pausado por operador humano. Bot en silencio.`);
      // Solo registramos el mensaje en el store
      if (message.type === 'text') {
        store.agregarMensaje(phone, { from: 'cliente', text: message.text?.body || '', type: 'text' });
      } else if (message.type === 'image') {
        const img = await this.descargarYGuardarImagen(phone, message.image);
        store.agregarMensaje(phone, { from: 'cliente', text: '📷 [Comprobante/Imagen]' + (message.image?.caption ? ` ${message.image.caption}` : ''), type: 'image', mediaUrl: img.url });
      } else if (message.type === 'audio' || message.type === 'voice') {
        store.agregarMensaje(phone, { from: 'cliente', text: '🎙️ [Nota de voz recibida]', type: 'audio' });
      }
      return;
    }

    const msgType = message.type;

    // 1. Mensaje de TEXTO
    if (msgType === 'text') {
      const text = (message.text?.body || '').trim();
      store.agregarMensaje(phone, { from: 'cliente', text, type: 'text' });
      return await this.handleTextMessage(phone, text, message);
    }

    // 2. Mensaje de AUDIO / NOTA DE VOZ (Transcripción inteligente con IA)
    if (msgType === 'audio' || msgType === 'voice') {
      return await this.handleAudioMessage(phone, message.audio || message.voice);
    }

    // 3. Mensaje de IMAGEN (Comprobante de pago)
    if (msgType === 'image') {
      const img = await this.descargarYGuardarImagen(phone, message.image);
      store.agregarMensaje(phone, { from: 'cliente', text: '📷 [Comprobante enviado]' + (message.image?.caption ? ` ${message.image.caption}` : ''), type: 'image', mediaUrl: img.url });
      return await this.handleImageMessage(phone, message.image, img);
    }

    // 4. Botones / Respuestas interactivas
    if (msgType === 'interactive') {
      const btnId = message.interactive?.button_reply?.id || '';
      const btnTitle = message.interactive?.button_reply?.title || '';
      store.agregarMensaje(phone, { from: 'cliente', text: `🔘 ${btnTitle}`, type: 'button' });
      return await this.handleButtonReply(phone, btnId, btnTitle);
    }

    // Otros tipos (documentos, sticker, etc.)
    store.agregarMensaje(phone, { from: 'cliente', text: `📎 [Archivo tipo ${msgType}]`, type: msgType });
  }

  detectarProducto(phone, text, message = null) {
    const lead = store.getLead(phone);
    // Si el cliente ya compró o el producto se corrigió a mano en el panel, el producto queda fijo.
    if (lead && lead.producto && (lead.productoFijado || lead.status === 'PAGADO')) return lead.producto;
    const detection = productCatalog.identificarProducto(phone, text, message, lead);
    // Las palabras clave solo eligen producto si el cliente todavía no tenía uno.
    // Un anuncio nuevo (referral) sí puede cambiarlo.
    if (lead && lead.producto && detection.metodo && detection.metodo.startsWith('TEXT_KEYWORD') && detection.producto !== lead.producto) {
      return lead.producto;
    }
    
    // Guardar el producto y la atribución del anuncio en el lead
    const updates = { producto: detection.producto };
    if (detection.adId) updates.adId = detection.adId;
    if (detection.metodo) updates.metodoDeteccion = detection.metodo;
    if (detection.referral) updates.referral = detection.referral;

    store.saveLead(phone, updates);
    return detection.producto;
  }

  // Envía un texto y lo guarda en el historial del chat
  async decir(phone, texto) {
    await waService.sendTextMessage(phone, texto);
    store.agregarMensaje(phone, { from: 'bot', text: texto, type: 'text' });
  }

  async enviarImagen(phone, url, caption = '') {
    try {
      await waService.sendImage(phone, url, caption);
      store.agregarMensaje(phone, { from: 'bot', text: `🖼️ [Imagen] ${caption || url.split('/').pop()}`, type: 'image', mediaUrl: url });
      return true;
    } catch (e) {
      console.error(`[FLOW] No se pudo enviar la imagen ${url} a +${phone}:`, e.message);
      return false;
    }
  }

  async enviarDocumento(phone, doc) {
    try {
      await waService.sendDocument(phone, doc.url, doc.nombre, doc.caption);
      store.agregarMensaje(phone, { from: 'bot', text: `📄 [Documento] ${doc.nombre}`, type: 'document', mediaUrl: doc.url });
      return true;
    } catch (e) {
      console.error(`[FLOW] No se pudo enviar el documento ${doc.nombre} a +${phone}:`, e.message);
      return false;
    }
  }

  ultimoDelBot(phone) {
    const msgs = (store.obtenerConversacion(phone).messages || []).filter((m) => m.from !== 'cliente');
    return msgs[msgs.length - 1] || null;
  }

  async handleTextMessage(phone, rawText, message = null) {
    const text = String(rawText || '').trim();
    const settings = this.getSettings();
    const producto = this.detectarProducto(phone, text.toLowerCase(), message);
    const lead = store.getLead(phone) || {};
    const conv = store.obtenerConversacion(phone);
    const botMessages = (conv?.messages || []).filter(m => m.from === 'bot');
    const pitchYaEnviado = (lead.step && lead.step !== 'INICIO') || botMessages.length > 0;

    // A. Quien ya compró recibe soporte, nunca datos de pago ni ofertas (salvo que responda al Upsell)
    if (this.esComprador(phone)) {
      if (lead.esperaRespuestaUpsell) {
        if (/^(si|sí|claro|quiero|me interesa|de una|dale|por favor|1)/i.test(text)) {
          return await this.enviarDatosPagoUpsell(phone);
        }
        if (/^(no|gracias|no gracias|ahora no|2)/i.test(text)) {
          store.saveLead(phone, { esperaRespuestaUpsell: false, esperaUpsell: false });
          return await this.decir(phone, '¡Entendido! 🙌 Disfruta mucho tu Mega Pack de Moldes 🧵 Si necesitas cualquier cosa con la impresión o el armado, aquí estamos a la orden.');
        }
      }
      return await this.atenderComprador(phone, text);
    }

    // B. No quiere más mensajes: se responde una vez y se apagan los seguimientos
    if (ventas.esRechazo(text)) {
      store.saveLead(phone, { optOut: true, optOutAt: Date.now() });
      return await this.decir(phone, `Listo, no te escribo más 🙏 Si algún día lo quieres, me escribes por aquí y con gusto te ayudo.`);
    }
    if (lead.optOut) store.saveLead(phone, { optOut: false });

    // C. HONESTIDAD: acceso de prueba primero
    if (/\b(honestidad|honesto|acceso\s+primero|env[ií]alo\s+primero|verificar\s+primero|p[aá]salo\s+primero|mu[eé]stramelo\s+primero)\b/i.test(text)) {
      return await this.enviarHonestidad(phone, settings, producto);
    }

    // D. Desconfianza: se le muestra el material gratis en vez de pedirle que confíe
    if (ventas.esDesconfianza(text)) return await this.responderDesconfianza(phone, producto);

    // E. Pide cómo pagar
    if (ventas.esPedidoPago(text)) return await this.sendPaymentDetails(phone, settings, ventas.precioDe(lead));

    // F. Pide el descuento que se le ofreció en el seguimiento
    const ofrecioDescuento = (lead.precioOfrecido && lead.precioOfrecido < ventas.precioNormal()) || (lead.seguimientosEnviados || 0) >= 1;
    if (ofrecioDescuento && ventas.esPedidoDescuento(text)) {
      if (!lead.precioOfrecido || lead.precioOfrecido >= ventas.precioNormal()) store.setLeadPrecio(phone, ventas.precioDescuento());
      return await this.sendPaymentDetails(phone, settings, ventas.precioDe(store.getLead(phone)));
    }

    // G. Avisa que ya pagó
    if (ventas.esAvisoPago(text)) {
      return await this.decir(phone, `¡Gracias! 🙌 Envíame por aquí la *captura del comprobante* y te llega tu enlace personal con ${ventas.infoPack(producto).queIncluye}.`);
    }

    // H. Primer mensaje: presentación del producto con imagen real
    if (!pitchYaEnviado) return await this.sendMainPitch(phone, settings, null, producto);

    // I. Pide fotos, catálogo, ejemplo o la muestra
    if (ventas.esPedidoMuestra(text)) return await this.enviarMuestra(phone, producto);

    // I2. Respuesta a los botones escrita a mano (si el celular no mostró los botones)
    const nt = ventas.normalizar(text);
    if (lead.step === 'BOTONES_ENVIADOS' && /^(1|uno|comprar|comprar ahora|comprar \d+|quiero comprar)$/.test(nt)) return await this.sendPaymentDetails(phone, settings, ventas.precioDe(lead));
    if (lead.step === 'BOTONES_ENVIADOS' && /^(2|dos)$/.test(nt)) return await this.enviarMuestra(phone, producto);

    // J. Respuesta afirmativa corta: depende de lo último que se le preguntó
    if (ventas.esAfirmacion(text)) {
      const step = lead.step || '';
      if (step === 'MUESTRA_OFRECIDA' && !lead.muestraEnviada) return await this.enviarMuestra(phone, producto);
      if (step === 'DATOS_PAGO_ENVIADOS') {
        const ult = this.ultimoDelBot(phone);
        const yaRecordado = ult && /captura del comprobante/.test(ult.text || '') && !/Nequi/.test(ult.text || '');
        if (yaRecordado) return; // no repetir lo mismo
        return await this.decir(phone, `¡Perfecto! 🙌 Quedo pendiente de la *captura del comprobante* para enviarte tu enlace.`);
      }
      return await this.sendPaymentDetails(phone, settings, ventas.precioDe(lead));
    }

    // K. Cualquier otra pregunta: IA con el contenido real del pack
    return await this._responderConGemini(phone, text, settings, producto);
  }

  // Soporte para compradores: reenvía su enlace y explica cómo abrir los archivos
  async atenderComprador(phone, text) {
    const ventasCliente = store.pedidosDeTelefono(phone).filter((p) => p.status === 'VERIFICADO' || p.status === 'ENTREGADO');
    const manual = accesos.completoDe(phone);
    const producto = (ventasCliente[ventasCliente.length - 1] || {}).producto || (manual && manual.producto) || (store.getLead(phone) || {}).producto || 'helados';
    const acceso = accesos.crear(phone, producto, 'completo');
    const enlace = `${ventas.host()}/acceso/${acceso.token}`;
    store.marcarAtendido(phone, false); // que el operador lo vea en el panel
    if (ventas.esSoporteDescarga(text) || ventas.esAvisoPago(text) || /\b(moldes|recetas|libros|pack)\b/i.test(text)) {
      const ayuda = producto === 'moldes'
        ? `Ya tienes tu compra activa ✅ Este es tu enlace personal:\n${enlace}\n\n` +
          `📱 *Para abrir en el celular:* toca el enlace, ábrelo en Chrome o Safari y busca el patrón que quieres. Cada patrón tiene sus PDF sueltos (ficha técnica y cada talla) que abren directo en el celular.\n` +
          `📦 Los ZIP de cada colección traen todo junto: en Android ábrelos con la app *Files de Google*; en iPhone, con la app *Archivos*.\n` +
          `🖨️ Para imprimir: tamaño real o escala 100 %, sin "ajustar a la página".\n\nSi algo no te abre, cuéntame qué te sale y te ayudo 🙌`
        : `Ya tienes tu compra activa ✅ Este es tu enlace personal:\n${enlace}\n\n` +
          `📱 Toca el enlace, ábrelo en Chrome o Safari y descarga cada libro en PDF; abren directo en el celular.\n\nSi algo no te abre, cuéntame qué te sale y te ayudo 🙌`;
      return await this.decir(phone, ayuda);
    }
    return await this._responderConGemini(phone, text, this.getSettings(), producto, { comprador: true, enlace });
  }

  async responderDesconfianza(phone, producto) {
    const lead = store.getLead(phone) || {};
    if (!lead.muestraEnviada) {
      await this.decir(phone, ventas.textoConfianza(producto));
      return await this.enviarMuestra(phone, producto, { sinIntro: true });
    }
    return await this.decir(phone,
      `Te entiendo 🙏 Arriba tienes la muestra gratis 👆 ábrela y revísala con calma antes de decidir.\n\n` +
      `El pago va a nombre de ${this.getSettings().nequiTitular || 'Manuel Tavera'} y apenas envías la captura del comprobante te llega tu enlace personal por este chat. Si tienes cualquier problema con la descarga, aquí te respondemos.`);
  }

  // Envía la muestra gratis en PDF (abre directo en el celular) y después pregunta por la compra
  async enviarMuestra(phone, producto, opciones = {}) {
    const lead = store.getLead(phone) || {};
    const precio = ventas.precioDe(lead);
    if (lead.muestraEnviada) {
      const img = ventas.imagenes(producto);
      await this.enviarImagen(phone, img.catalogo);
      if (img.mapa) await this.enviarImagen(phone, img.mapa);
      return await this.decir(phone, `Así viene el pack por dentro 👆 La muestra gratis te la envié arriba en PDF.\n\nEl pack completo con ${ventas.infoPack(producto).queIncluye} vale *${ventas.cop(precio)}*. ¿Te paso los datos de pago?`);
    }
    if (!opciones.sinIntro) {
      await this.decir(phone, producto === 'moldes'
        ? `¡Claro! 🎁 Te envío gratis el patrón completo de la *Falda Media Campana*: la ficha técnica y el molde de la talla M a escala real.`
        : `¡Claro! 🎁 Te envío gratis 5 recetas de muestra.`);
    }
    if (producto === 'moldes') await this.enviarImagen(phone, ventas.imagenes(producto).mapa, 'Así se arma el molde: se imprime en hojas Carta o A4 y se unen por las marcas');
    let enviados = 0;
    for (const doc of ventas.documentosMuestra(producto)) if (await this.enviarDocumento(phone, doc)) enviados++;
    store.saveLead(phone, { muestraEnviada: enviados > 0, step: 'MUESTRA_ENVIADA', status: lead.status === 'ESPERA_PAGO' ? lead.status : 'INTERESADO',
      ...(enviados > 0 ? { rescate: { tipo: 'muestra', at: Date.now(), enviado: false } } : {}) });
    if (!enviados) {
      return await this.decir(phone, `No pude adjuntarte el archivo 🙈 Escribe *HONESTIDAD* y te mando un enlace para descargar la muestra gratis.`);
    }
    return await this.decir(phone, ventas.textoDespuesMuestra(producto, precio));
  }

  async enviarHonestidad(phone, settings, producto) {
    const leadPrevio = store.getLead(phone) || {};
    const precio = leadPrevio.precioOfrecido && leadPrevio.precioOfrecido < ventas.precioNormal() ? leadPrevio.precioOfrecido : ventas.precioDescuento();
    store.setLeadPrecio(phone, precio);
    const prueba = accesos.crear(phone, producto, 'prueba');
    const portalUrl = `${ventas.host()}/prueba/${prueba.token}`;
    const minutos = accesos.MINUTOS_PRUEBA;
    const duracion = minutos >= 60 ? `${Math.round(minutos / 60)} horas` : `${minutos} minutos`;
    const detalle = producto === 'moldes'
      ? `_(Tienes ${duracion} para ver el pack por dentro y descargar gratis un patrón completo en todas sus tallas, la tabla de medidas y la calculadora. El resto se desbloquea con el pago)_`
      : `_(Tienes ${duracion} para ver el pack por dentro y descargar gratis 5 recetas de Postres en Vaso y la calculadora de costos. El resto se desbloquea con el pago)_`;
    const reply =
      `¡Trato hecho! 🤝 Aquí tienes tu acceso de prueba:\n\n👉 ${portalUrl}\n\n${detalle}\n\n` +
      `Si te convence, transfieres *${ventas.cop(precio)}* a:\n\n${ventas.cuentas(settings)}\n\n` +
      `y me envías la captura del comprobante por aquí para dejarte el acceso completo de por vida 🙌`;
    await this.decir(phone, reply);
    store.saveLead(phone, {
      status: 'ACCESO_HONESTIDAD_ENTREGADO', producto,
      prueba: { token: prueba.token, inicio: prueba.createdAt, vence: prueba.expiresAt, pasos: 0 },
      seguimientosEnviados: Math.max(leadPrevio.seguimientosEnviados || 0, 3),
    });
  }

  async _responderConGemini(phone, userText, settings, producto = 'helados', opciones = {}) {
    const respaldo = opciones.comprador
      ? `Gracias por escribirnos 🙌 Un asesor te responde en un momento. Tu enlace personal sigue activo: ${opciones.enlace}`
      : `Déjame confirmarte eso y te respondo en un momento 🙌`;
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      store.marcarAtendido(phone, false);
      return await this.decir(phone, respaldo);
    }
    try {
      const model = process.env.GEMINI_MODEL || 'gemini-flash-latest';
      const lead = store.getLead(phone) || {};
      const conv = store.obtenerConversacion(phone);
      const historial = (conv?.messages || []).slice(-8).map(m => `${m.from === 'cliente' ? 'Cliente' : 'Asesora'}: ${String(m.text || '').slice(0, 400)}`).join('\n');
      const precio = ventas.precioDe(lead);
      const reglasVenta = opciones.comprador
        ? `- ESTE CLIENTE YA COMPRÓ. Nunca le pidas pago ni le des datos de cuenta. Ayúdalo con la descarga, la impresión o dudas del contenido. Su enlace personal es: ${opciones.enlace}`
        : `- Precio que se le ofreció a este cliente: ${ventas.cop(precio)} pago único.
- NO envíes números de cuenta ni datos de pago: si el cliente quiere pagar, pregúntale "¿Te paso los datos de pago?" y el sistema se los envía.
- Si pide fotos, ejemplos o desconfía, ofrécele la muestra gratis ("¿Te envío gratis un patrón completo para que lo revises?").`;
      const prompt = `Eres Sofía, asesora por WhatsApp de una tienda de productos digitales en Colombia. Tono cálido, colombiano, sencillo y honesto.
${ventas.conocimiento(producto)}

REGLAS:
- Responde en máximo 3 líneas, como un WhatsApp real, sin saludar de nuevo si ya hay conversación.
- Solo afirma lo que está en el CONTENIDO EXACTO. Si preguntan por algo que no está (una prenda, fotos reales, videos), dilo con honestidad y menciona lo más parecido que sí trae.
${opciones.comprador ? '- El único enlace que puedes escribir es su enlace personal. Nunca escribas corchetes como "[Link]". Nunca pidas correos.' : '- Nunca escribas enlaces ni corchetes como "[Link]". Nunca pidas correos.'}
- No inventes datos de la empresa (ciudad, años, número de clientes) ni digas que hay un "sistema bancario".
${reglasVenta}

Conversación reciente:
${historial}

Cliente: ${userText}
Sofía:`;
      const pedir = (conThinking) => fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 600, temperature: 0.3, ...(conThinking ? { thinkingConfig: { thinkingBudget: 0 } } : {}) }
        })
      });
      let res = await pedir(true);
      if (!res.ok) res = await pedir(false); // modelos que no aceptan thinkingBudget
      if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
      const data = await res.json();
      const cand = data?.candidates?.[0] || {};
      let aiText = (cand.content?.parts || []).map(p => p.text || '').join('').trim().replace(/^Sof[ií]a:\s*/i, '');
      aiText = limpiarRespuestaIA(aiText, cand.finishReason);
      if (!aiText) throw new Error('Respuesta vacía');
      await this.decir(phone, aiText);
    } catch (err) {
      console.error('[FLOW GEMINI ERROR]:', err.message);
      store.marcarAtendido(phone, false);
      await this.decir(phone, respaldo);
    }
  }

  async sendMainPitch(phone, settings, _precio, producto = 'helados') {
    const img = ventas.imagenes(producto);
    await this.enviarImagen(phone, img.catalogo);
    const texto = ventas.textoPitch(producto);
    // Botones: comprar ya o ver la muestra. Si Meta no los acepta, sendButtons manda el mismo texto (pide responder 1 o 2)
    await waService.sendButtons(phone, texto, ventas.botonesPitch());
    store.agregarMensaje(phone, { from: 'bot', text: `${texto}\n[Botones: ${ventas.botonesPitch().map((b) => b.title).join(' | ')}]`, type: 'interactive' });
    store.saveLead(phone, { status: 'INTERESADO', step: 'BOTONES_ENVIADOS', producto });
  }

  async sendPaymentDetails(phone, settings, precio) {
    if (this.esComprador(phone)) return await this.atenderComprador(phone, 'enlace');
    const lead = store.getLead(phone) || {};
    const monto = Number(String(precio).replace(/\D/g, '')) || ventas.precioDe(lead);
    await this.decir(phone, ventas.textoPago(lead.producto || 'helados', settings, monto, { ofrecerMuestra: !lead.muestraEnviada }));
    store.saveLead(phone, { status: 'ESPERA_PAGO', step: 'DATOS_PAGO_ENVIADOS', precioOfrecido: lead.precioOfrecido || monto,
      rescate: { tipo: 'datos', at: Date.now(), enviado: false } });
    // El pedido solo se crea cuando el cliente envía el comprobante (handleImageMessage).
  }

  // Descarga la imagen de Meta y la guarda en el disco del bot para verla en el panel.
  async descargarYGuardarImagen(phone, imageObj) {
    try {
      if (!imageObj || !imageObj.id) return { url: null, buffer: null };
      const media = await waService.downloadMedia(imageObj.id);
      const url = store.guardarMedia(phone, media.buffer, media.mimeType);
      return { url, buffer: media.buffer, mimeType: media.mimeType };
    } catch (e) {
      console.error(`[FLOW] No se pudo guardar la imagen de +${phone}:`, e.message);
      return { url: null, buffer: null, error: e.message };
    }
  }

  async handleImageMessage(phone, imageObj, img = null) {
    const settings = this.getSettings();
    const leadImg = store.getLead(phone) || {};

    // Quien ya compró no genera una compra nueva por mandar otra imagen (salvo que esté pagando el Upsell): se le recuerda su enlace
    // y el operador la revisa en el panel (puede ser un problema de descarga o un pago de otra cosa).
    if (this.esComprador(phone) && !leadImg.esperaUpsell) {
      store.marcarAtendido(phone, false);
      return await this.atenderComprador(phone, 'enlace');
    }

    await this.decir(phone, `🔍 Recibí tu imagen, dame unos segundos para revisarla...`);

    try {
      // 1. Descargar imagen desde Meta WhatsApp Cloud API
      let buffer = img && img.buffer ? img.buffer : null;
      const comprobanteUrl = img && img.url ? img.url : null;
      if (!buffer && imageObj.id) {
        const media = await waService.downloadMedia(imageObj.id);
        buffer = media.buffer;
      }

      // 2. Ejecutar análisis OCR con IA
      let ocrResult = { isValid: false };
      const lead = store.getLead(phone) || {};
      // Mínimo aceptado: $5.000 si está pagando el Upsell, o el menor precio que se le ofreció
      const minEsperado = lead.esperaUpsell ? 5000 : Math.min(ventas.precioDe(lead), ventas.precioNormal());
      if (buffer) {
        ocrResult = await ocrValidator.validateReceipt(buffer, {
          minAmount: minEsperado,
          recipientKeyword: settings.nequiTitular
        });
      }

      // 3. Evaluar resultado del OCR y cruzar contra el Libro Mayor Bancario (Antifraude)
      const cleanRef = ocrResult.reference || null;
      const cleanAmount = ocrResult.amount || ventas.precioDe(lead);
      const bankName = ocrResult.bank || 'NEQUI';

      console.log(`[FLOW VERIFY] Evaluando comprobante de +${phone}: Ref=${cleanRef}, Monto=${cleanAmount}, Banco=${bankName}`);
      const verification = paymentVerifier.verifyPayment({
        reference: cleanRef,
        amount: cleanAmount,
        bank: bankName
      }, phone);

      // CASO A: DETECCIÓN DE FRAUDE (Comprobante ya utilizado en otra compra)
      if (verification.fraud) {
        console.warn(`[FLOW ALERT] 🚨 Fraude detectado para +${phone}: ${verification.message}`);
        const pedido = store.crearPedido(phone, {
          amount: cleanAmount,
          reference: cleanRef,
          status: 'RECHAZADO',
          ocrData: ocrResult,
          comprobanteUrl,
          motivoRechazo: verification.message
        });

        const fraudMsg =
          `⚠️ *Aviso de Seguridad Bancaria*\n\n` +
          `Hemos detectado que el número de comprobante *${cleanRef}* ya fue registrado anteriormente en nuestro sistema.\n\n` +
          `Para proteger a nuestra comunidad, no se permite el reuso de comprobantes. Si consideras que se trata de un error de tu banco, por favor escribe un mensaje para que un asesor humano lo valide manualmente 🙌`;

        await waService.sendTextMessage(phone, fraudMsg);
        store.agregarMensaje(phone, { from: 'bot', text: fraudMsg, type: 'text' });
        return;
      }

      // CASO B: ACREDITADO Y VERIFICADO EN EL LIBRO MAYOR BANCARIO
      if (verification.verified) {
        console.log(`[FLOW SUCCESS] ✅ Pago verificado contra banco (${verification.method}) para +${phone}`);
        const prodEntrega = leadImg.esperaUpsell ? 'upsell_helados' : (leadImg.producto || 'moldes');
        const pedido = store.crearPedido(phone, {
          amount: verification.amount || cleanAmount,
          reference: verification.reference || cleanRef || 'BANCO-OK',
          status: 'VERIFICADO',
          ocrData: ocrResult,
          comprobanteUrl,
          bankTxId: verification.transaction?.id,
          aprobadoPor: `banco_${verification.bank.toLowerCase()}`,
          producto: prodEntrega
        });
        store.aprobarPedido(pedido.id, {
          reference: verification.reference || cleanRef,
          aprobadoPor: `banco_${verification.bank.toLowerCase()}`
        });

        if (leadImg.esperaUpsell) {
          store.saveLead(phone, { esperaUpsell: false, esperaRespuestaUpsell: false });
          await this.enviarEntregaProducto(phone, settings, { producto: 'helados', pedidoId: pedido.id });
        } else {
          await this.enviarEntregaProducto(phone, settings);
        }
        return;
      }

      // CASO C: MODELO A (AUTO-ENTREGA POR IA ESTILO LEONA)
      // Si el modo Leona está activado y el comprobante fue validado con éxito por la IA:
      if (settings.modoAutoEntregaLeona !== false && ocrResult.isValid) {
        console.log(`[FLOW LEONA-AUTO] 🦁 Modo Leona activo: Comprobante validado por IA para +${phone} ($${cleanAmount}). Auto-aprobando y entregando...`);

        // Doble filtro antifraude de referencia contra pedidos existentes
        if (cleanRef) {
          const todos = store.todosLosPedidos();
          const yaUsado = todos.find(
            p => p.status === 'VERIFICADO' && p.reference && p.reference.toUpperCase() === cleanRef.toUpperCase() && p.phone !== phone
          );
          if (yaUsado) {
            console.warn(`[FLOW ALERT] 🚨 Fraude detectado (referencia repetida en pedidos): ${cleanRef}`);
            store.crearPedido(phone, {
              amount: cleanAmount,
              reference: cleanRef,
              status: 'RECHAZADO',
              ocrData: ocrResult,
              comprobanteUrl,
              motivoRechazo: `Referencia ${cleanRef} ya reclamada por otro comprador`
            });
            const fraudMsg =
              `⚠️ *Aviso de Seguridad Bancaria*\n\n` +
              `El comprobante con referencia *${cleanRef}* ya fue registrado previamente en otra compra.\n\n` +
              `Si realizaste un pago independiente, por favor escribe un mensaje para que un asesor humano lo valide de inmediato 🙌`;
            await waService.sendTextMessage(phone, fraudMsg);
            store.agregarMensaje(phone, { from: 'bot', text: fraudMsg, type: 'text' });
            return;
          }
        }

        const autoRef = cleanRef || `LEONA-${Date.now().toString().slice(-6)}`;
        const prodEntrega = leadImg.esperaUpsell ? 'upsell_helados' : (leadImg.producto || 'moldes');
        const pedido = store.crearPedido(phone, {
          amount: cleanAmount,
          reference: autoRef,
          status: 'VERIFICADO',
          ocrData: ocrResult,
          comprobanteUrl,
          aprobadoPor: 'ia_leona_auto',
          notas: `Auto-aprobado por IA (Modelo A Leona). Banco: ${bankName}. Ref: ${autoRef}`,
          producto: prodEntrega
        });

        store.aprobarPedido(pedido.id, {
          reference: autoRef,
          aprobadoPor: 'ia_leona_auto'
        });

        if (leadImg.esperaUpsell) {
          store.saveLead(phone, { esperaUpsell: false, esperaRespuestaUpsell: false });
          await this.enviarEntregaProducto(phone, settings, { producto: 'helados', pedidoId: pedido.id });
        } else {
          await this.enviarEntregaProducto(phone, settings);
        }
        return;
      }

      // CASO C1: LA IMAGEN NO ES UN COMPROBANTE (foto de un modelo, captura de un anuncio, etc.)
      if (ocrResult.esComprobante === false) {
        const yaTieneDatos = leadImg.step === 'DATOS_PAGO_ENVIADOS' || leadImg.status === 'ESPERA_PAGO';
        const msg = yaTieneDatos
          ? `Esa imagen no parece un comprobante de transferencia 🤔 Cuando hagas el pago, envíame la captura donde se vea el valor, la fecha y la referencia, y te llega tu enlace.`
          : (leadImg.producto === 'moldes'
            ? `¡Recibí tu imagen! 😊 ¿Es un modelo que estás buscando? Cuéntame qué prenda es y te digo si está en el pack.`
            : `¡Recibí tu imagen! 😊 Cuéntame en qué te puedo ayudar.`);
        store.marcarAtendido(phone, false);
        return await this.decir(phone, msg);
      }

      // CASO C2: IMAGEN NO CONCLUYENTE BAJO MODO LEONA (La foto no es clara o no es comprobante)
      if (settings.modoAutoEntregaLeona !== false && !ocrResult.isValid) {
        console.log(`[FLOW LEONA-PENDING] Comprobante no concluyente para +${phone}. Dejando en cola de revisión.`);
        store.crearPedido(phone, {
          amount: cleanAmount,
          reference: cleanRef,
          status: 'PENDIENTE',
          ocrData: ocrResult,
          comprobanteUrl,
          notas: `Comprobante no concluyente por IA: ${ocrResult.reason || 'Ilegible'}`
        });

        let avisoRevisar =
          `🔍 Recibí tu comprobante, pero la imagen no se ve completamente clara o los datos están borrosos.\n\n` +
          `No te preocupes: ya quedó en *revisión prioritaria* en nuestro panel y en contados minutos un asesor lo validará manualmente 🙌\n\n` +
          `_Si tienes una captura más nítida donde se lea bien el valor y la referencia, puedes enviarla por aquí._`;

        if (ocrResult.titularValido === false) {
          avisoRevisar =
            `Recibí tu comprobante 🙌 No alcanzo a confirmar en la imagen que el destino sea la cuenta de *${settings.nequiTitular || 'Manuel Tavera'}*, así que un asesor lo revisa a mano en unos minutos y te confirma por aquí.\n\n` +
            `_Si te equivocaste de número, la cuenta correcta es Nequi o Daviplata ${settings.nequiNumero || '3058742138'}._`;
        } else if (ocrResult.amount && ocrResult.amount < minEsperado) {
          avisoRevisar =
            `Recibí tu comprobante 🙌 Veo un valor de *${ventas.cop(ocrResult.amount)}* y el precio que te ofrecí es *${ventas.cop(minEsperado)}*. Un asesor lo revisa en unos minutos y te confirma por aquí.`;
        }
        store.marcarAtendido(phone, false);

        await waService.sendTextMessage(phone, avisoRevisar);
        store.agregarMensaje(phone, { from: 'bot', text: avisoRevisar, type: 'text' });
        return;
      }

      // CASO D: MODO BANCO ESTRICTO (ESPERANDO NOTIFICACIÓN BANCARIA REAL EN LIBRO MAYOR)
      console.log(`[FLOW STRICT BANK] Modo Banco estricto activo, esperando acreditación en libro mayor para +${phone}...`);
      const pedido = store.crearPedido(phone, {
        amount: cleanAmount,
        reference: cleanRef,
        status: 'PENDIENTE',
        ocrData: ocrResult,
        notas: `Comprobante recibido (Modo Banco estricto). Ref=${cleanRef || 'S/R'}. Esperando confirmación de Nequi/Daviplata.`
      });

      const waitMsg =
        `🔍 ¡Recibí tu comprobante! Nuestro sistema está esperando la acreditación automática en nuestra cuenta bancaria.\n\n` +
        `Si realizaste la transferencia hace un momento, en unos segundos tu acceso se activará automáticamente ✨`;

      await waService.sendTextMessage(phone, waitMsg);
      store.agregarMensaje(phone, { from: 'bot', text: waitMsg, type: 'text' });

      // Iniciar escuchador activo de 90 segundos: si la alerta bancaria llega en este lapso, auto-aprueba
      paymentVerifier.waitForIncomingPayment(phone, {
        reference: cleanRef,
        amount: cleanAmount,
        orderId: pedido.id
      }, async (matchedTx) => {
        if (matchedTx) {
          console.log(`[FLOW AUTO-RESOLVE] 🚀 Alerta bancaria recibida a tiempo para +${phone}! Entregando...`);
          store.aprobarPedido(pedido.id, {
            reference: matchedTx.reference,
            aprobadoPor: `banco_${matchedTx.bank.toLowerCase()}`
          });

          if (leadImg.esperaUpsell) {
            store.saveLead(phone, { esperaUpsell: false, esperaRespuestaUpsell: false });
            await this.enviarEntregaProducto(phone, settings, { producto: 'helados', pedidoId: pedido.id });
          } else {
            await this.enviarEntregaProducto(phone, settings);
          }
        } else {
          console.log(`[FLOW TIMEOUT] No llegó notificación automática en 90s para +${phone}. Queda en cola de panel.`);
        }
      }, 90000);
    } catch (err) {
      console.error('[FLOW ERROR] Procesando comprobante:', err.message);
      const fallbackMsg =
        `Recibí tu comprobante 📄 En este momento un asesor está confirmando la cuenta bancaria para enviarte el enlace en seguida 🙌`;
      await waService.sendTextMessage(phone, fallbackMsg);
      store.agregarMensaje(phone, { from: 'bot', text: fallbackMsg, type: 'text' });

      store.marcarAtendido(phone, false);
      store.crearPedido(phone, {
        amount: ventas.precioDe(store.getLead(phone)),
        status: 'PENDIENTE',
        comprobanteUrl: img && img.url ? img.url : null,
        notas: `Error en lectura automática: ${err.message}`
      });
    }
  }

  async enviarEntregaProducto(phone, settings, opciones = {}) {
    const lead = store.getLead(phone);
    // Pedido que se está entregando: el indicado, o el último VERIFICADO de este cliente
    const verificados = store.pedidosDeTelefono(phone).filter((p) => p.status === 'VERIFICADO' || p.status === 'ENTREGADO');
    const pedido = (opciones.pedidoId && store.obtenerPedido(opciones.pedidoId)) || verificados[verificados.length - 1] || store.obtenerPedidoPorTelefono(phone);
    const producto = opciones.producto || (pedido && pedido.producto) || (lead && lead.producto) || 'helados';
    const host = process.env.RENDER_EXTERNAL_URL || 'https://emprende-dulce-bot.onrender.com';
    const acceso = accesos.crear(phone, producto, 'completo', { pedidoId: pedido && pedido.id });
    const enlace = `${host}/acceso/${acceso.token}`;
    if (pedido) store.actualizarPedido(pedido.id, { accesoToken: acceso.token });
    let confirmMsg = '';

    if (producto === 'moldes') {
      confirmMsg =
        `¡Pago verificado con éxito en nuestro sistema! 🎉🧵\n\n` +
        `Bienvenido(a) al *Mega Pack de +2.000 Moldes y Patrones de Costura 2026*. Aquí tienes tu acceso oficial e inmediato a todo el material:\n\n` +
        `📥 *Tu enlace personal de descarga (guárdalo, es solo tuyo):*\n` +
        `${enlace}\n\n` +
        `📁 *Tu paquete contiene:*\n` +
        `✓ 2.420 moldes listos para imprimir: 34 patrones profesionales con 1.210 moldes de pieza (cada pieza en cada talla), en hoja Carta y en A4\n` +
        `✓ 10 colecciones en ZIP: vestidos, blusas, pantalones, faldas, deportiva, lencería, infantil y bebé, mascotas, bolsos y uniformes\n` +
        `✓ Cada patrón con ficha técnica de 6 páginas y un PDF por talla a escala real\n` +
        `✓ 4 bonos: Manual Técnico de Costura, Guía de Telas y Agujas, Tabla de Medidas y Calculadora de Costos\n\n` +
        `📱 *En el celular:* abre el enlace en Chrome o Safari y toca «Abrir los PDF sueltos» en cada colección; cada patrón abre directo, sin descomprimir.\n\n` +
        `Imprime al 100 % (tamaño real) y mide el cuadro de 5 × 5 cm antes de unir las hojas. Si tienes cualquier consulta con la impresión o el armado, aquí estamos para ayudarte 🙌✂`;
    } else {
      confirmMsg =
        `¡Comprobante verificado con éxito! 🎉🍰\n\n` +
        `Bienvenido(a) a la familia de *Emprende Dulce*. Aquí tienes tu acceso oficial e inmediato a todo el material:\n\n` +
        `📥 *Tu enlace personal de descarga (guárdalo, es solo tuyo):*\n` +
        `${enlace}\n\n` +
        `📁 *Tu pack incluye:*\n` +
        `✓ Guía Maestra de Helados Artesanales (47 págs PDF)\n` +
        `✓ Postres en Vaso para Emprender (41 págs PDF)\n` +
        `✓ Recetario Navideño y Cajas de Regalo (35 págs PDF)\n` +
        `✓ Bono 1: Plantilla de Costeo en Excel y Web\n` +
        `✓ Bono 2: Directorio de Proveedores en Colombia\n` +
        `✓ Bono 3: Guía de Ventas por WhatsApp\n\n` +
        `¡Muchos éxitos en tu emprendimiento dulce! Si tienes cualquier pregunta con alguna receta, aquí estamos para ayudarte 🙌`;
    }

    await waService.sendTextMessage(phone, confirmMsg);
    store.agregarMensaje(phone, { from: 'bot', text: confirmMsg, type: 'text' });
    store.saveLead(phone, { status: 'PAGADO', step: 'ENTREGADO', accesoToken: acceso.token });

    if (producto === 'moldes' && !opciones.sinUpsell) {
      setTimeout(async () => {
        try {
          await this.enviarOfertaUpsell(phone);
        } catch (e) {
          console.error('[UPSELL] Error enviando oferta upsell:', e.message);
        }
      }, 2500);
    }

    return acceso;
  }

  async enviarOfertaUpsell(phone) {
    const texto =
      `🎁 *¡OFERTA EXCLUSIVA DE AGRADECIMIENTO!*\n\n` +
      `Por haber adquirido hoy tu Mega Pack de Moldes de Costura, tienes acceso exclusivo a nuestro segundo éxito de ventas:\n\n` +
      `🍨 *Pack Completo Emprende Dulce 2026*\n` +
      `✓ Guía Maestra de Helados Artesanales Gourmet\n` +
      `✓ Postres en Vaso Domo para Vender\n` +
      `✓ Recetario Navideño y Cajas de Regalo\n` +
      `✓ Plantilla de Costeo Automatizada en Excel\n\n` +
      `Su precio normal es de *$10.000 COP*, pero solo por hoy para ti se queda en *solo $5.000 COP* (pago único) 🎉\n\n` +
      `¿Deseas agregarlo a tu pedido?`;

    const botones = [
      { id: 'btn_upsell_si', title: '🍰 Sí, por $5.000' },
      { id: 'btn_upsell_no', title: 'No, gracias' }
    ];

    store.saveLead(phone, { esperaRespuestaUpsell: true });
    await waService.sendButtons(phone, texto, botones);
    store.agregarMensaje(phone, { from: 'bot', text: `${texto}\n[Botones: 🍰 Sí, por $5.000 | No, gracias]`, type: 'interactive' });
  }

  async enviarDatosPagoUpsell(phone) {
    const settings = this.getSettings();
    const numero = settings.nequiNumero || '3058742138';
    const titular = settings.nequiTitular || 'Manuel Tavera';

    const texto =
      `¡Excelente decisión! 🍰🎉 Aquí tienes los datos para tu pago especial de *$5.000 COP*:\n\n` +
      `🟣 *Nequi:* ${numero}\n` +
      `🔴 *Daviplata:* ${numero}\n` +
      `👤 *Titular:* ${titular}\n` +
      `💰 *Monto exacto:* $5.000 COP\n\n` +
      `📲 Cuando realices la transferencia de *$5.000*, envíame por aquí la captura del comprobante y nuestro sistema te enviará tu acceso de inmediato 🙌`;

    store.saveLead(phone, {
      esperaUpsell: true,
      esperaRespuestaUpsell: false,
      precioOfrecido: 5000,
      step: 'DATOS_PAGO_UPSELL'
    });

    await this.decir(phone, texto);
  }

  async handleButtonReply(phone, btnId, btnTitle) {
    const settings = this.getSettings();
    const lead = store.getLead(phone) || {};

    // Botones del flujo Upsell
    if (btnId === 'btn_upsell_si') {
      return await this.enviarDatosPagoUpsell(phone);
    }
    if (btnId === 'btn_upsell_no') {
      store.saveLead(phone, { esperaRespuestaUpsell: false, esperaUpsell: false });
      return await this.decir(phone, '¡Entendido! 🙌 Disfruta mucho tu Mega Pack de Moldes 🧵 Si necesitas cualquier consulta con la impresión o el armado, aquí estamos a la orden.');
    }

    if (this.esComprador(phone)) return await this.atenderComprador(phone, 'enlace');

    const precio = settings.precioOferta || this.defaultPrice;
    const precioCOP = '$' + Number(precio).toLocaleString('es-CO');

    if (btnId.includes('pago') || btnId.includes('comprar')) {
      return await this.sendPaymentDetails(phone, settings, ventas.precioDe(lead));
    }
    if (btnId.includes('muestra')) {
      return await this.enviarMuestra(phone, lead.producto || 'helados');
    }
    if (btnId.includes('info')) {
      return await this.sendMainPitch(phone, settings, precioCOP, (store.getLead(phone) || {}).producto || 'helados');
    }
  }

  /**
   * Procesa notas de voz y audios de WhatsApp:
   * 1. Descarga el audio desde Meta Cloud API
   * 2. Lo transcribe con Gemini 2.5 Flash
   * 3. Lo almacena en el historial como '🎙️ "texto"'
   * 4. Lo pasa por handleTextMessage para responder con la lógica comercial exacta
   */
  async handleAudioMessage(phone, audioMeta) {
    const mediaId = audioMeta?.id;
    console.log(`[FLOW] 🎙️ Recibida nota de voz de +${phone} (mediaId: ${mediaId || 'no-id'})`);

    if (!mediaId) {
      const msgError = '¡Hola! 🙌 Nos llegó una nota de voz pero no pudimos abrirla. ¿Podrías escribirnos tu pregunta por aquí para responderte de inmediato?';
      await waService.sendTextMessage(phone, msgError);
      store.agregarMensaje(phone, { from: 'bot', text: msgError, type: 'text' });
      return;
    }

    try {
      // 1. Descargar el archivo de audio de WhatsApp
      const media = await waService.downloadMedia(mediaId);
      if (!media || !media.buffer) {
        throw new Error('No se pudo descargar el buffer de audio de WhatsApp');
      }

      // 2. Transcribir el audio usando Gemini 2.5 Flash
      const resTrans = await audioService.transcribe(media.buffer, media.mimeType);

      if (resTrans.ok && resTrans.text) {
        const text = resTrans.text.trim();
        console.log(`[FLOW] 🎙️ Audio de +${phone} transcrito con éxito: "${text}"`);
        // Registrar en el chat lo que dijo el cliente con ícono de audio para que se vea claro en el panel
        store.agregarMensaje(phone, { from: 'cliente', text: `🎙️ "${text}"`, type: 'audio' });

        // Procesar como texto normal para que responda con toda la lógica del guión de ventas
        return await this.handleTextMessage(phone, text);
      }

      // Audio sin voz clara o falla de la transcripción: se pide por escrito UNA vez y el operador lo ve en el panel
      console.warn(`[FLOW] Audio de +${phone} sin transcribir:`, resTrans.error || 'inaudible');
      store.agregarMensaje(phone, { from: 'cliente', text: resTrans.inaudible ? '🎙️ [Nota de voz sin voz clara]' : `🎙️ [Nota de voz sin transcribir: ${String(resTrans.error || '').slice(0, 80)}]`, type: 'audio' });
      store.marcarAtendido(phone, false);
      const msgInaudible = 'No pude escuchar bien tu nota de voz 🙈 ¿Me la escribes por aquí? Así te respondo enseguida.';
      const ult = this.ultimoDelBot(phone);
      if (ult && ult.text === msgInaudible) return; // no repetir el mismo pedido en cada audio
      await this.decir(phone, msgInaudible);
    } catch (err) {
      console.error(`[FLOW ERROR] Error al procesar audio de +${phone}:`, err.message);
      store.agregarMensaje(phone, { from: 'cliente', text: '🎙️ [Error al descargar/procesar audio]', type: 'audio' });

      const msgFallo = '¡Hola! No alcancé a reproducir tu audio 🙈 ¿Me podrías escribir por aquí qué duda tienes para ayudarte de inmediato?';
      try {
        await waService.sendTextMessage(phone, msgFallo);
        store.agregarMensaje(phone, { from: 'bot', text: msgFallo, type: 'text' });
      } catch (sendErr) {
        console.error('[FLOW ERROR] No se pudo enviar mensaje de fallback:', sendErr.message);
      }
    }
  }
}

module.exports = new ConversationFlow();
