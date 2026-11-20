const store = require('./store');
const waService = require('./whatsappService');
const ocrValidator = require('./ocrValidator');
const paymentVerifier = require('./paymentVerifier');
const audioService = require('./audioService');
const accesos = require('./accesos');
const productCatalog = require('./productCatalog');

class ConversationFlow {
  constructor() {
    this.defaultPrice = 10000;
  }

  getSettings() {
    return store.getSettings();
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
    const detection = productCatalog.identificarProducto(phone, text, message, lead);
    
    // Guardar el producto y la atribución del anuncio en el lead
    const updates = { producto: detection.producto };
    if (detection.adId) updates.adId = detection.adId;
    if (detection.metodo) updates.metodoDeteccion = detection.metodo;
    if (detection.referral) updates.referral = detection.referral;

    store.saveLead(phone, updates);
    return detection.producto;
  }

  async handleTextMessage(phone, rawText, message = null) {
    const text = rawText.toLowerCase().trim();
    const settings = this.getSettings();
    const precio = settings.precioOferta || this.defaultPrice;
    const precioCOP = '$' + Number(precio).toLocaleString('es-CO');

    // Detección automática infalible (Prioridad 1: Meta Ad Referral ID, Prioridad 2: Keywords, Prioridad 3: Historial)
    const producto = this.detectarProducto(phone, text, message);

    const lead = store.getLead(phone);
    const conv = store.obtenerConversacion(phone);
    const botMessages = (conv?.messages || []).filter(m => m.from === 'bot');
    const pitchYaEnviado = (lead && lead.step !== 'INICIO') || botMessages.length > 0;

    // Detección de Objeción de Desconfianza / Seguridad / Estafa / Garantía / "Mándalo primero"
    const patronesDesconfianza = /(estaf|robo|roban|engañ|segur[oa]|confi|garant|miedo|desconfi|c[oó]mo\s+s[eé]|es\s+(algo\s+)?real|sospech|tan\s+barat|primer.*(m[aá]nd|env[ií]|pas)|(m[aá]nd|env[ií]|pas).*primer|pago\s+despu[eé]s)/i;
    const esDudaSeguridad = patronesDesconfianza.test(text);

    if (esDudaSeguridad) {
      const titular = settings.nequiTitular || 'Manuel Tavera';
      const num = settings.nequiNumero || '3058742138';
      let respuestaConfianza = '';
      if (producto === 'moldes') {
        respuestaConfianza =
          `¡Te entiendo 100%! Es completamente normal y prudente tener precaución al comprar por internet hoy en día 🙏✨\n\n` +
          `Para darte total tranquilidad y seguridad:\n` +
          `✅ *Cuenta Personal Verificada:* Nequi y Daviplata están directamente a nombre de ${titular} (${num}).\n` +
          `✅ *Entrega Automática e Inmediata:* Apenas envíes la foto o captura de tu comprobante, nuestro sistema te libera en menos de 10 segundos aquí mismo el acceso permanente a Google Drive con las 10 carpetas completas (+2.000 Moldes en PDF listos para imprimir en casa) + las 4 Guías Técnicas y la Calculadora de Costos.\n` +
          `✅ *¿Por qué solo ${precioCOP}?* Porque es 100% digital descargable, sin intermediarios ni gastos de envío físico ni patronistas costosos. Queremos que cualquier persona en Colombia pueda coser y emprender su propio taller sin gastar de más.\n\n` +
          `¿Te gustaría que te comparta los daticos para asegurar tu cupo con total confianza? 🧵`;
      } else {
        respuestaConfianza =
          `¡Te entiendo 100%! Es completamente normal y prudente tener precaución al comprar por internet hoy en día 🙏✨\n\n` +
          `Para darte total tranquilidad y seguridad:\n` +
          `✅ *Cuenta Personal Verificada:* Nequi y Daviplata están directamente a nombre de ${titular} (${num}).\n` +
          `✅ *Entrega Automática e Inmediata:* Apenas envíes la foto o captura de tu comprobante, nuestro sistema te libera en menos de 10 segundos aquí mismo los 3 Libros Completos en PDF + la Plantilla Excel de Costeo + el acceso permanente a Google Drive.\n` +
          `✅ *¿Por qué solo ${precioCOP}?* Porque es 100% digital descargable, sin intermediarios ni gastos de imprenta ni envíos físicos. Queremos que cualquier persona en Colombia pueda empezar su emprendimiento dulce desde casa sin una inversión gigante.\n\n` +
          `¿Te gustaría que te comparta los daticos para asegurar tu cupo con total confianza? 🍰`;
      }
      await waService.sendTextMessage(phone, respuestaConfianza);
      store.agregarMensaje(phone, { from: 'bot', text: respuestaConfianza, type: 'text' });
      return;
    }

    // 0. Detección especial de palabra clave "HONESTIDAD" (Inversión de Riesgo / Acceso Primero - Estilo Creativo A-Z)
    const esHonestidad = /\b(honestidad|honesto|acceso\s+primero|dame\s+el\s+acceso|env[ií]alo\s+primero|verificar\s+primero|p[aá]salo\s+primero|mu[eé]stramelo\s+primero)\b/i.test(text);
    if (esHonestidad) {
      store.setLeadPrecio(phone, 7000);
      const num = settings.nequiNumero || '3058742138';
      const titular = settings.nequiTitular || 'Manuel Tavera';
      const host = process.env.RENDER_EXTERNAL_URL || 'https://emprende-dulce-bot.onrender.com';
      const prueba = accesos.crear(phone, producto, 'prueba');
      const portalUrl = `${host}/prueba/${prueba.token}`;
      const minutos = accesos.MINUTOS_PRUEBA;
      const detalleHonestidad = producto === 'moldes'
        ? `_(Tienes ${minutos} minutos para ver el pack por dentro y descargar gratis un patrón completo en todas sus tallas, la tabla de medidas y la calculadora. El resto se desbloquea con el pago)_`
        : `_(Tienes ${minutos} minutos para ver el pack por dentro y descargar gratis 5 recetas de Postres en Vaso y la calculadora de costos. El resto se desbloquea con el pago)_`;

      const replyHonestidad =
        `¡Trato hecho! 🤝✨ Aquí tienes tu acceso prioritario para que compruebes con tus propios ojos la calidad del material:\n\n` +
        `👉 ${portalUrl}\n\n` +
        `${detalleHonestidad}\n\n` +
        `📌 Cuando verifiques que es exactamente lo que prometimos, transfieres los *$7.000 COP* a cualquiera de nuestras cuentas oficiales:\n\n` +
        `🟢 *Nequi / Llave / Bre-B:* \`${num}\`\n` +
        `🟡 *Daviplata:* \`${settings.daviplataNumero || num}\`\n` +
        `👤 *Titular:* ${titular}\n\n` +
        `Apenas transfieras, me envías la foto del comprobante por aquí para dejar tu acceso 100% permanente de por vida. ¡Confío plenamente en tu palabra! 🙌${producto === 'moldes' ? '🧵' : '🍰'}`;

      await waService.sendTextMessage(phone, replyHonestidad);
      store.agregarMensaje(phone, { from: 'bot', text: replyHonestidad, type: 'text' });
      const leadH = store.getLead(phone) || {};
      store.saveLead(phone, {
        status: 'ACCESO_HONESTIDAD_ENTREGADO', precioOfrecido: 7000, producto,
        prueba: { token: prueba.token, inicio: prueba.createdAt, vence: prueba.expiresAt, pasos: 0 },
        seguimientosEnviados: Math.max(leadH.seguimientosEnviados || 0, 3),
      });
      return;
    }

    // 1. Detección precisa de INTENCIÓN DE COMPRA / PAGO / INTERÉS (incluye botones automáticos de anuncios Meta)
    const patronesCompra = [
      /\b(nequi|daviplata|bancolombia|transfiya|bre-?b)\b/i,
      /\b(como|c[oó]mo|donde|d[oó]nde)\s+(hago\s+(para\s+)?|puedo\s+|se\s+puede\s+|podr[ií]a\s+)?(pag|compr|consign|transfer|cancel|adquir)/i,
      /\b(datos|medios)\s+(de\s+)?pago\b/i,
      /\b(quiero|deseo)\s+(compr|adquir|el\s+pack|los\s+libros|la\s+gu[ií]a)/i,
      /\b(lo|la)\s+(quiero|deseo)\b/i,
      /\b(me\s+interesa|estoy\s+interesad[oa]|estaba\s+interesad[oa]|interesad[oa]|interesa)\b/i,
      /\b(si|sí)\s+(me\s+interesa|quiero)\b/i,
      /\b(transferir|consignar|comprar|comprarlo|adquirir|adquirirlo|apartar|cupo)\b/i,
      /\b(a\s+d[oó]nde|a\s+qu[eé]\s+n[uú]mero)\b/i,
      /\b(p[aá]same|dame|deme)\s+(la\s+cuenta|el\s+n[uú]mero|el\s+nequi|el\s+daviplata)\b/i,
      /\b(n[uú]mero\s+de\s+(nequi|cuenta|daviplata))\b/i,
      /\b(cu[aá]nto\s+(vale|cuesta)|precio|costo)\b/i
    ];
    const esInteresCompra = patronesCompra.some(re => re.test(text));

    // Si el pitch ya fue enviado y responde una afirmación ("sí", "claro", "dale de una", "bueno", "listo", "ok", "de una", "hágale", etc.)
    const palabrasAfirmativas = /\b(si|sí|sii|claro|dale|de\s*una|bueno|listo|ok|oka|yes|por\s*favor|vale|h[aá]gale|me\s*sirve|quiero|perfecto|excelente|s[uú]per|va)\b/i;
    const esAfirmacionCorta = pitchYaEnviado && text.length <= 35 && palabrasAfirmativas.test(text) && !text.includes('?') && !text.includes('¿');

    // Detección de solicitud de descuento de $7.000 o datos actualizados tras remarketing
    const esPedido7k = /\b(7\.?000|siete\s*mil|descuento|promo(ci[oó]n)?|datos\s+actualizados|la\s+oferta)\b/i.test(text);
    const currentLead = store.getLead(phone);
    const yaTieneOferta7k = currentLead && (currentLead.precioOfrecido === 7000 || (currentLead.seguimientosEnviados && currentLead.seguimientosEnviados >= 1));

    if (esPedido7k || (yaTieneOferta7k && (esInteresCompra || esAfirmacionCorta))) {
      store.setLeadPrecio(phone, 7000);
      return await this.sendPaymentDetails(phone, settings, '7.000');
    }

    if (esInteresCompra || esAfirmacionCorta) {
      return await this.sendPaymentDetails(phone, settings, precioCOP);
    }

    // 2. Detección de "YA PAGUÉ" o aviso de comprobante
    if (
      text.includes('ya pague') ||
      text.includes('ya pagué') ||
      text.includes('ya transferi') ||
      text.includes('ya transferí') ||
      text.includes('ya consigne') ||
      text.includes('ya consigné') ||
      text.includes('ahi le envie') ||
      text.includes('ahí le envié') ||
      text.includes('listo el pago') ||
      text.includes('comprobante') ||
      text.includes('adjunto') ||
      text.includes('ya lo mande')
    ) {
      const reply = `¡Excelente! 🙌 Por favor adjúntame por aquí la *captura de pantalla o foto del comprobante* para que nuestro sistema te entregue de inmediato el enlace de descarga con todos los libros y tus 3 regalos 🎁`;
      await waService.sendTextMessage(phone, reply);
      store.agregarMensaje(phone, { from: 'bot', text: reply, type: 'text' });
      return;
    }

    // 3. Duda o aclaración: "¿Cómo así? / ¿De qué trata? / ¿De qué se trata? / ¿Qué incluye?"
    const esDudaAclaracion = /\b(de\s+qu[eé]\s+(se\s+)?trata|c[oó]mo\s+as[ií]|no\s+entiendo|qu[eé]\s+(es|incluye)|expl[ií]came|cu[eé]ntame|m[aá]s\s+info(rmaci[oó]n)?|en\s+qu[eé]\s+consiste)\b/i.test(text) ||
      text.includes('de que se trata') ||
      text.includes('de qué se trata') ||
      text.includes('como asi') ||
      text.includes('cómo así') ||
      text.includes('no entiendo');

    if (esDudaAclaracion) {
      if (pitchYaEnviado) {
        let aclaracion = '';
        if (producto === 'moldes') {
          aclaracion =
            `¡Con todo gusto te aclaro! 😊\n\n` +
            `Es una colección digital gigante con *+2.000 Moldes y Patrones de Costura en PDF* organizados en 10 carpetas:\n` +
            `👗 *1. Vestidos, Blusas y Moda Femenina* (XS a XXL)\n` +
            `🏃‍♀️ *2. Ropa Deportiva, Pijamas y Lencería*\n` +
            `👶 *3. Ropa Infantil, Mascotas y Bolsos/Accesorios*\n` +
            `📐 *4. Catálogo Maestro, Guía de Impresión en Casa (hoja carta/A4) y Calculadora de Costos en Excel*\n\n` +
            `Todo te queda en solo *${precioCOP} COP* hoy (pago único con acceso de por vida a Google Drive en tu celular).\n\n` +
            `¿Te gustaría que te comparta los datos de Nequi o Daviplata para apartar tu cupo? 🧵`;
        } else {
          aclaracion =
            `¡Con todo gusto te aclaro! 😊\n\n` +
            `Es una colección digital completa con *3 Recetarios en PDF* de alta definición:\n` +
            `🍦 *1. Helados Artesanales* (fórmulas cremosas que no se cristalizan sin máquinas costosas)\n` +
            `🧁 *2. Postres en Vaso* (12 recetas listas para vender en vasito domo)\n` +
            `🎄 *3. Recetario Navideño* (natillas, buñuelos, anchetas y torta negra)\n\n` +
            `Más la plantilla de costeo en Excel para que calcules tus ganancias exactas.\n\n` +
            `Todo te queda en solo *${precioCOP} COP* hoy (pago único con acceso de por vida a tu celular).\n\n` +
            `¿Te gustaría que te comparta los datos de Nequi o Daviplata para apartar tu cupo?`;
        }
        await waService.sendTextMessage(phone, aclaracion);
        store.agregarMensaje(phone, { from: 'bot', text: aclaracion, type: 'text' });
        return;
      }
    }

    // 4. Duda: "¿Es físico o digital? / ¿Cómo se recibe?"
    if (text.includes('fisico') || text.includes('físico') || text.includes('digital') || text.includes('pdf') || text.includes('libro') || text.includes('imprimir')) {
      let reply = '';
      if (producto === 'moldes') {
        reply =
          `Son *100% digitales en formato PDF de alta definición* 📱✨\n\n` +
          `Los descargas directamente a tu celular, tablet o computador. Vienen preparados para imprimirse en tu propia impresora de casa en hojas tamaño carta normales o A4 (sin necesidad de plotter ni programas raros).\n\n` +
          `Incluye las 10 carpetas con los +2.000 moldes y los 4 bonos por solo *${precioCOP} COP* (pago único, acceso para siempre).\n\n` +
          `¿Te paso los daticos de Nequi o Daviplata para aprovechar el descuento hoy? ✂️`;
      } else {
        reply =
          `Son *100% digitales en formato PDF de alta definición* 📱✨\n\n` +
          `Los descargas directamente a tu celular, tablet o computador para verlos siempre sin necesidad de internet, o si prefieres también los puedes imprimir.\n\n` +
          `Incluye los 3 Libros y los 3 Bonos por solo *${precioCOP} COP* (pago único, acceso para siempre).\n\n` +
          `¿Te paso los daticos de Nequi o Daviplata para aprovechar el descuento hoy?`;
      }
      await waService.sendTextMessage(phone, reply);
      store.agregarMensaje(phone, { from: 'bot', text: reply, type: 'text' });
      return;
    }

    // 5. Duda: "Máquinas / experiencia / tela / ingredientes"
    if (text.includes('maquina') || text.includes('máquina') || text.includes('experiencia') || text.includes('dificil') || text.includes('difícil') || text.includes('ingrediente') || text.includes('plotter')) {
      let reply = '';
      if (producto === 'moldes') {
        reply =
          `¡Cero complicaciones! 🧵 No necesitas ser modista experta ni tener plotter o máquinas industriales.\n\n` +
          `Los moldes vienen listos para imprimir en cualquier impresora común de casa en hojas carta normales, traen márgenes de costura y líneas guía de ensamblado súper fáciles. Incluye además el manual técnico para principiantes paso a paso.\n\n` +
          `¿Te gustaría asegurar tu acceso con la promo de *${precioCOP}*? ✂️`;
      } else {
        reply =
          `¡Cero complicaciones! 👩‍🍳 No necesitas ninguna máquina industrial costosa ni tener experiencia previa.\n\n` +
          `Todas las recetas están formuladas para hacer en casa con batidora o licuadora tradicional, y los ingredientes se consiguen en cualquier supermercado o tienda de barrio de Colombia.\n\n` +
          `¿Te gustaría asegurar tu acceso con la promo de *${precioCOP}*?`;
      }
      await waService.sendTextMessage(phone, reply);
      store.agregarMensaje(phone, { from: 'bot', text: reply, type: 'text' });
      return;
    }

    // 6. Lead inicial (nunca se le ha enviado el pitch)
    if (!pitchYaEnviado) {
      return await this.sendMainPitch(phone, settings, precioCOP, producto);
    }

    // 7. Fallback inteligente con IA Gemini para cualquier otra consulta
    return await this._responderConGemini(phone, rawText, settings, precioCOP, producto);
  }

  async _responderConGemini(phone, userText, settings, precioCOP, producto = 'helados') {
    try {
      const key = process.env.GEMINI_API_KEY;
      const model = process.env.GEMINI_MODEL || 'gemini-flash-latest';
      if (!key) {
        return await this.sendPaymentDetails(phone, settings, precioCOP);
      }

      const conv = store.obtenerConversacion(phone);
      const historial = (conv?.messages || []).slice(-6).map(m => `${m.from === 'bot' ? 'Asistente' : 'Cliente'}: ${m.text}`).join('\n');

      let productDetails = '';
      if (producto === 'moldes') {
        productDetails = `El producto es digital: Mega Pack de +2.000 Moldes y Patrones de Costura en formato PDF descargable para imprimir en casa en hoja carta o A4 (sin necesidad de plotter ni programas raros), tallas XS a XXL, más 4 manuales técnicos y calculadora de costos por solo ${precioCOP} COP pago único. Si preguntan cómo se imprime: explica que viene configurado para imprimir en cualquier impresora común de casa en hojas tamaño carta normales y unirlas con cinta fácilmente.`;
      } else {
        productDetails = `El producto es digital: 3 recetarios PDF (Helados Artesanales, Postres en Vaso y Recetas Navideñas) + plantilla Excel de costeo por solo ${precioCOP} COP pago único.`;
      }

      const downloadUrl = producto === 'moldes'
        ? 'https://emprende-dulce-bot.onrender.com/descargar-moldes'
        : 'https://emprende-dulce-bot.onrender.com/descargar';

      const systemPrompt = `Eres Sofía, asesora experta comercial de "Creativos Digitales" en Colombia.
Tu tono es cálido, colombiano, dulce, servicial, transparente y persuasivo.
Reglas clave:
- Responde de forma muy natural y concisa (máximo 2 a 3 líneas estilo WhatsApp real).
- ${productDetails}
- REGLA SUPREMA: JAMÁS inventes links falsos de Google Drive ni pongas corchetes o placeholders como "[Link de Acceso]". Si tienes que dar un enlace oficial, usa EXACTAMENTE este: ${downloadUrl}
- REGLA SUPREMA: JAMÁS digas que enviaste archivos al correo electrónico ni pidas correos. TODO se entrega de inmediato por este chat de WhatsApp y en el enlace oficial.
- REGLA DE RECLAMO: Si el cliente ya pagó, reclama por su dinero, pide reembolso o está angustiado: NUNCA le pidas que pague de nuevo ni le envíes datos de cuenta Nequi. Respóndele con máxima empatía y cariño, asegurándole que su dinero está seguro y que le estás confirmando su acceso oficial ya mismo.
- Si el cliente expresa desconfianza, miedo o pregunta si es seguro antes de pagar: valida su inquietud con empatía ("Te entiendo perfectamente..."), explícale que Nequi/Daviplata está a nombre de Manuel Tavera (${settings.nequiNumero || '3058742138'}), que la entrega es automática e inmediata por este mismo chat al enviar la foto del comprobante, y que cuesta $10.000 COP porque es digital descargable sin intermediarios.
- Si piden que se les envíe primero antes de pagar: diles amablemente que el sistema automático libera el paquete completo al registrar el comprobante con total garantía.
- Si el cliente muestra interés o acuerdo en comprar, facilítale transferir los ${precioCOP} COP a Nequi o Daviplata (${settings.nequiNumero || '3058742138'} a nombre de Manuel Tavera).
- No uses saludos repetitivos si ya estamos en medio de la conversación.

Historial de la conversación:
${historial}

Cliente: ${userText}
Respuesta de Sofía:`;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: { maxOutputTokens: 1000, temperature: 0.3 }
        })
      });

      if (!res.ok) {
        return await this.sendPaymentDetails(phone, settings, precioCOP);
      }

      const data = await res.json();
      let aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      aiText = aiText.replace(/^Sofía:\s*/i, '').trim();

      if (!aiText) {
        return await this.sendPaymentDetails(phone, settings, precioCOP);
      }

      await waService.sendTextMessage(phone, aiText);
      store.agregarMensaje(phone, { from: 'bot', text: aiText, type: 'text' });
    } catch (err) {
      console.error('[FLOW GEMINI ERROR]:', err.message);
      return await this.sendPaymentDetails(phone, settings, precioCOP);
    }
  }

  async sendMainPitch(phone, settings, precioCOP, producto = 'helados') {
    if (producto === 'moldes') {
      const pitchMoldes =
        `¡Hola! Qué alegría saludarte 🧵✨\n\n` +
        `Te presento el *MEGA PACK DE +2.000 MOLDES Y PATRONES DE COSTURA 2026*, la colección digital más completa de Colombia para coser tu propia ropa o emprender tu taller desde casa:\n\n` +
        `👗 *1. Vestidos, Blusas y Moda Femenina (XS a XXL)*\n` +
        `Vestidos casuales, fiesta, gala, blusas, tops, faldas, pantalones y lencería con medidas exactas.\n\n` +
        `🏃‍♀️ *2. Ropa Deportiva, Pijamas y Confort*\n` +
        `Leggings, sudaderas, tops deportivos, pijamas enteras y batas.\n\n` +
        `👶 *3. Moda Infantil, Ropa de Mascotas y Accesorios*\n` +
        `Prendas para niños y bebés, disfraces, accesorios, bolsos y ropa para perros/gatos.\n\n` +
        `🎁 *+ 4 SUPER BONOS TÉCNICOS HOY:*\n` +
        `✓ Catálogo Maestro indexado con fotos y tablas de tallas\n` +
        `✓ Manual Técnico de Escalamiento y Ajuste de Medidas\n` +
        `✓ Guía de Impresión en Casa en Hoja Carta o A4 (¡sin plotter ni programas raros!)\n` +
        `✓ Calculadora de Costos y Ganancias en Excel\n\n` +
        `💥 *OFERTA ESPECIAL:* Todo el paquete (+2.000 moldes + 4 bonos) por solo *${precioCOP} COP* (pago único, acceso de por vida a Google Drive).\n\n` +
        `¿Te gustaría que te comparta los datos de Nequi o Daviplata para apartar tu cupo hoy mismo? ✂️`;

      await waService.sendTextMessage(phone, pitchMoldes);
      store.agregarMensaje(phone, { from: 'bot', text: pitchMoldes, type: 'text' });
      store.saveLead(phone, { status: 'INTERESADO', step: 'PITCH_ENVIADO', producto: 'moldes' });
      return;
    }

    const pitch =
      `¡Hola! Qué alegría saludarte 🍰✨\n\n` +
      `Te presento la colección completa *EMPRENDE DULCE 2026*, la guía definitiva para iniciar tu negocio de helados y postres gourmet de alta rentabilidad desde casa:\n\n` +
      `📖 *1. Guía Maestra de Helados Artesanales (47 pág)*\n` +
      `Fórmulas cremosas que no se cristalizan, paletas rellenas tipo magnum y helados de paila.\n\n` +
      `🧁 *2. Postres en Vaso para Emprender (41 pág)*\n` +
      `12 recetas top (Tres Leches, Pie de Limón, Cheesecake, Tiramisú, Marquesa de Chocolate) en vasitos domo listos para vender.\n\n` +
      `🎄 *3. Recetario Navideño y Cajas de Regalo (35 pág)*\n` +
      `Nativas caseras, buñuelos esponjosos, brevas con arequipe, torta negra envinada y armado de anchetas festivas.\n\n` +
      `🎁 *+ 3 SUPER BONOS DE REGALO HOY:*\n` +
      `✓ Plantilla Excel de Costos y Precios de Venta\n` +
      `✓ Guía de Conservación, Empaques y Transporte\n` +
      `✓ Plantillas editables de Etiquetas en Canva\n\n` +
      `💥 *OFERTA ESPECIAL:* Todo el paquete completo por solo *${precioCOP} COP* (pago único, acceso para siempre).\n\n` +
      `¿Te gustaría apartar tu cupo hoy mismo?`;

    await waService.sendTextMessage(phone, pitch);
    store.agregarMensaje(phone, { from: 'bot', text: pitch, type: 'text' });
    store.saveLead(phone, { status: 'INTERESADO', step: 'PITCH_ENVIADO', producto: 'helados' });
  }

  async sendPaymentDetails(phone, settings, precioCOP) {
    const num = settings.nequiNumero || '3058742138';
    const titular = settings.nequiTitular || 'Manuel Tavera';
    const reply =
      `¡Excelente decisión! 🚀 Aquí tienes las cuentas oficiales para tu transferencia de *${precioCOP} COP*:\n\n` +
      `💚 *Nequi / Llave / Bre-B:* \`${num}\`\n` +
      `💛 *Daviplata:* \`${settings.daviplataNumero || num}\`\n` +
      `👤 *Titular:* ${titular} _(en Nequi/Daviplata te saldrá como MAN*** TAV*** o Manuel Tavera)_\n\n` +
      `_Toca el número para copiarlo en un segundo._\n\n` +
      `Apenas hagas la transferencia, *envíame la captura de pantalla por este chat* y en segundos te entrego el enlace de acceso con todos los libros y tus 3 regalos 🎁`;

    await waService.sendTextMessage(phone, reply);
    store.agregarMensaje(phone, { from: 'bot', text: reply, type: 'text' });
    store.saveLead(phone, { status: 'ESPERA_PAGO', step: 'DATOS_PAGO_ENVIADOS' });
    // NOTA: No se crea pedido en status PENDIENTE aquí. El pedido solo se crea
    // cuando el cliente realmente envía la captura/comprobante en handleImageMessage.
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
    const aviso = `🔍 ¡Recibí tu comprobante! Estoy validándolo en nuestro sistema bancario, dame unos segundos...`;
    await waService.sendTextMessage(phone, aviso);
    store.agregarMensaje(phone, { from: 'bot', text: aviso, type: 'text' });

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
      const lead = store.getLead(phone);
      const minEsperado = (lead && lead.precioOfrecido) ? lead.precioOfrecido : (settings.precioOferta || 7000);
      if (buffer) {
        ocrResult = await ocrValidator.validateReceipt(buffer, {
          minAmount: minEsperado,
          recipientKeyword: settings.nequiTitular
        });
      }

      // 3. Evaluar resultado del OCR y cruzar contra el Libro Mayor Bancario (Antifraude)
      const cleanRef = ocrResult.reference || null;
      const cleanAmount = ocrResult.amount || settings.precioOferta || this.defaultPrice;
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
        const pedido = store.crearPedido(phone, {
          amount: verification.amount || cleanAmount,
          reference: verification.reference || cleanRef || 'BANCO-OK',
          status: 'VERIFICADO',
          ocrData: ocrResult,
          comprobanteUrl,
          bankTxId: verification.transaction?.id,
          aprobadoPor: `banco_${verification.bank.toLowerCase()}`
        });
        store.aprobarPedido(pedido.id, {
          reference: verification.reference || cleanRef,
          aprobadoPor: `banco_${verification.bank.toLowerCase()}`
        });

        await this.enviarEntregaProducto(phone, settings);
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
        const pedido = store.crearPedido(phone, {
          amount: cleanAmount,
          reference: autoRef,
          status: 'VERIFICADO',
          ocrData: ocrResult,
          comprobanteUrl,
          aprobadoPor: 'ia_leona_auto',
          notas: `Auto-aprobado por IA (Modelo A Leona). Banco: ${bankName}. Ref: ${autoRef}`
        });

        store.aprobarPedido(pedido.id, {
          reference: autoRef,
          aprobadoPor: 'ia_leona_auto'
        });

        await this.enviarEntregaProducto(phone, settings);
        return;
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
            `⚠️ En el comprobante enviado, el destinatario parece transferido a una cuenta o persona distinta a *Manuel Tavera*.\n\n` +
            `Por favor asegúrate de transferir a la cuenta oficial indicada (*Nequi: 3058742138* a nombre de Manuel Tavera). Si crees que se trata de un error, déjanos un mensaje y un asesor humano lo revisará 🙌`;
        }

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

          await this.enviarEntregaProducto(phone, settings);
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

      store.crearPedido(phone, {
        amount: settings.precioOferta || this.defaultPrice,
        status: 'PENDIENTE',
        comprobanteUrl: img && img.url ? img.url : null,
        notas: `Error en lectura automática: ${err.message}`
      });
    }
  }

  async enviarEntregaProducto(phone, settings) {
    const lead = store.getLead(phone);
    const pedido = store.obtenerPedidoPorTelefono(phone);
    const producto = (pedido && pedido.producto) || (lead && lead.producto) || 'helados';
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
    return acceso;
  }

  async handleButtonReply(phone, btnId, btnTitle) {
    const settings = this.getSettings();
    const precio = settings.precioOferta || this.defaultPrice;
    const precioCOP = '$' + Number(precio).toLocaleString('es-CO');

    if (btnId.includes('pago') || btnId.includes('comprar')) {
      return await this.sendPaymentDetails(phone, settings, precioCOP);
    }
    if (btnId.includes('info')) {
      return await this.sendMainPitch(phone, settings, precioCOP);
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

      // Audio inaudible, ruido o silencio
      console.warn(`[FLOW] Audio de +${phone} inaudible o sin voz clara:`, resTrans.error || 'inaudible');
      store.agregarMensaje(phone, { from: 'cliente', text: '🎙️ [Nota de voz inaudible]', type: 'audio' });

      const msgInaudible = '¡Hola! Te escuché a medias porque se me entrecortó el audio 🙈 ¿Me podrías escribir tu duda por aquí? Así te respondo de inmediato con toda la información 🙌';
      await waService.sendTextMessage(phone, msgInaudible);
      store.agregarMensaje(phone, { from: 'bot', text: msgInaudible, type: 'text' });
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
