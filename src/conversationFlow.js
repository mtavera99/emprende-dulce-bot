const store = require('./store');
const waService = require('./whatsappService');
const ocrValidator = require('./ocrValidator');
const paymentVerifier = require('./paymentVerifier');

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
        store.agregarMensaje(phone, { from: 'cliente', text: '📷 [Comprobante/Imagen]', type: 'image' });
      }
      return;
    }

    const msgType = message.type;

    // 1. Mensaje de TEXTO
    if (msgType === 'text') {
      const text = (message.text?.body || '').trim();
      store.agregarMensaje(phone, { from: 'cliente', text, type: 'text' });
      return await this.handleTextMessage(phone, text);
    }

    // 2. Mensaje de IMAGEN (Comprobante de pago)
    if (msgType === 'image') {
      store.agregarMensaje(phone, { from: 'cliente', text: '📷 [Comprobante enviado]', type: 'image' });
      return await this.handleImageMessage(phone, message.image);
    }

    // 3. Botones / Respuestas interactivas
    if (msgType === 'interactive') {
      const btnId = message.interactive?.button_reply?.id || '';
      const btnTitle = message.interactive?.button_reply?.title || '';
      store.agregarMensaje(phone, { from: 'cliente', text: `🔘 ${btnTitle}`, type: 'button' });
      return await this.handleButtonReply(phone, btnId, btnTitle);
    }

    // Otros tipos (audio, documentos, sticker)
    store.agregarMensaje(phone, { from: 'cliente', text: `📎 [Archivo tipo ${msgType}]`, type: msgType });
  }

  async handleTextMessage(phone, rawText) {
    const text = rawText.toLowerCase();
    const settings = this.getSettings();
    const precio = settings.precioOferta || this.defaultPrice;
    const precioCOP = '$' + Number(precio).toLocaleString('es-CO');

    // Detección de intención de PAGO / NÚMERO DE CUENTA
    if (
      text.includes('nequi') ||
      text.includes('daviplata') ||
      text.includes('bancolombia') ||
      text.includes('cuenta') ||
      text.includes('como pago') ||
      text.includes('donde pago') ||
      text.includes('datos de pago') ||
      text.includes('quiero comprar') ||
      text.includes('lo quiero') ||
      text.includes('me interesa') ||
      text.includes('comprar') ||
      text.includes('transferir') ||
      text.includes('numero')
    ) {
      return await this.sendPaymentDetails(phone, settings, precioCOP);
    }

    // Detección de "YA PAGUÉ" o aviso de comprobante
    if (
      text.includes('ya pague') ||
      text.includes('ya transferi') ||
      text.includes('ya consigne') ||
      text.includes('ahi le envie') ||
      text.includes('listo el pago') ||
      text.includes('comprobante')
    ) {
      const reply = `¡Excelente! 🙌 Por favor adjúntame por aquí la *captura de pantalla o foto del comprobante* para que nuestro sistema te entregue de inmediato el enlace de descarga con todos los libros y tus 3 regalos 🎁`;
      await waService.sendTextMessage(phone, reply);
      store.agregarMensaje(phone, { from: 'bot', text: reply, type: 'text' });
      return;
    }

    // Duda: "¿Es físico o digital? / ¿Cómo se recibe?"
    if (text.includes('fisico') || text.includes('digital') || text.includes('pdf') || text.includes('libro')) {
      const reply =
        `Son *100% digitales en formato PDF de alta definición* 📱✨\n\n` +
        `Los descargas directamente a tu celular, tablet o computador para verlos siempre sin necesidad de internet, o si prefieres también los puedes imprimir.\n\n` +
        `Incluye los 3 Libros y los 3 Bonos por solo *${precioCOP} COP* (pago único, acceso para siempre).\n\n` +
        `¿Te paso los daticos de Nequi o Daviplata para aprovechar el descuento hoy?`;
      await waService.sendTextMessage(phone, reply);
      store.agregarMensaje(phone, { from: 'bot', text: reply, type: 'text' });
      return;
    }

    // Duda: "Máquinas / experiencia / ingredientes"
    if (text.includes('maquina') || text.includes('experiencia') || text.includes('dificil') || text.includes('ingrediente')) {
      const reply =
        `¡Cero complicaciones! 👩‍🍳 No necesitas ninguna máquina industrial costosa ni tener experiencia previa.\n\n` +
        `Todas las recetas están formuladas para hacer en casa con batidora o licuadora tradicional, y los ingredientes se consiguen en cualquier supermercado o tienda de barrio de Colombia.\n\n` +
        `¿Te gustaría asegurar tu acceso con la promo de *${precioCOP}*?`;
      await waService.sendTextMessage(phone, reply);
      store.agregarMensaje(phone, { from: 'bot', text: reply, type: 'text' });
      return;
    }

    // Lead inicial / Saludo / Click de anuncio
    return await this.sendMainPitch(phone, settings, precioCOP);
  }

  async sendMainPitch(phone, settings, precioCOP) {
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
    store.saveLead(phone, { status: 'INTERESADO', step: 'PITCH_ENVIADO' });
  }

  async sendPaymentDetails(phone, settings, precioCOP) {
    const num = settings.nequiNumero || '3058742138';
    const titular = settings.nequiTitular || 'Manuel Tavera';
    const reply =
      `¡Excelente decisión! 🚀 Aquí tienes las cuentas oficiales para tu transferencia de *${precioCOP} COP*:\n\n` +
      `💚 *Nequi / Llave / Bre-B:* \`${num}\`\n` +
      `💛 *Daviplata:* \`${settings.daviplataNumero || num}\`\n` +
      `👤 *Titular:* ${titular}\n\n` +
      `_Toca el número para copiarlo en un segundo._\n\n` +
      `Apenas hagas la transferencia, *envíame la captura de pantalla por este chat* y en segundos te entrego el enlace de acceso con todos los libros y tus 3 regalos 🎁`;

    await waService.sendTextMessage(phone, reply);
    store.agregarMensaje(phone, { from: 'bot', text: reply, type: 'text' });
    store.saveLead(phone, { status: 'ESPERA_PAGO', step: 'DATOS_PAGO_ENVIADOS' });

    // Crear orden pendiente en el store
    store.crearPedido(phone, {
      amount: settings.precioOferta || this.defaultPrice,
      paymentMethod: 'NEQUI'
    });
  }

  async handleImageMessage(phone, imageObj) {
    const settings = this.getSettings();
    const aviso = `🔍 ¡Recibí tu comprobante! Estoy validándolo en nuestro sistema bancario, dame unos segundos...`;
    await waService.sendTextMessage(phone, aviso);
    store.agregarMensaje(phone, { from: 'bot', text: aviso, type: 'text' });

    try {
      // 1. Descargar imagen desde Meta WhatsApp Cloud API
      let buffer = null;
      if (imageObj.id) {
        const media = await waService.downloadMedia(imageObj.id);
        buffer = media.buffer;
      }

      // 2. Ejecutar análisis OCR con IA
      let ocrResult = { isValid: false };
      if (buffer) {
        ocrResult = await ocrValidator.validateReceipt(buffer, {
          minAmount: settings.precioOferta || this.defaultPrice,
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
          bankTxId: verification.transaction?.id,
          aprobadoPor: `banco_${verification.bank.toLowerCase()}`
        });
        store.aprobarPedido(pedido.id, {
          reference: verification.reference || cleanRef,
          aprobadoPor: `banco_${verification.bank.toLowerCase()}`
        });

        const confirmMsg =
          `¡Pago verificado con éxito en nuestra cuenta! 🎉🍰\n\n` +
          `Bienvenido(a) a la familia de *Emprende Dulce*. Aquí tienes tu acceso oficial e inmediato a todo el material:\n\n` +
          `🔗 *Enlace de Descarga Permanente (Google Drive):*\n` +
          `${settings.driveLink}\n\n` +
          `📁 *Tu pack incluye:*\n` +
          `✓ Guía Maestra de Helados Artesanales (42 págs PDF)\n` +
          `✓ Postres en Vaso para Emprender (39 págs PDF)\n` +
          `✓ Recetario Navideño y Cajas de Regalo (30 págs PDF)\n` +
          `✓ Bono 1: Plantilla de Costeo en Excel\n` +
          `✓ Bono 2: Guía de Conservación y Empaques\n` +
          `✓ Bono 3: Diseños de Etiquetas en Canva\n\n` +
          `¡Muchos éxitos en tu emprendimiento dulce! Si tienes cualquier pregunta con alguna receta, aquí estamos para ayudarte 🙌`;

        await waService.sendTextMessage(phone, confirmMsg);
        store.agregarMensaje(phone, { from: 'bot', text: confirmMsg, type: 'text' });
        store.saveLead(phone, { status: 'PAGADO', step: 'ENTREGADO' });
        return;
      }

      // CASO C: PENDIENTE DE NOTIFICACIÓN BANCARIA (En espera de la alerta de Nequi/Daviplata)
      console.log(`[FLOW PENDING] Comprobante recibido, esperando notificación bancaria para +${phone}...`);
      const pedido = store.crearPedido(phone, {
        amount: cleanAmount,
        reference: cleanRef,
        status: 'PENDIENTE',
        ocrData: ocrResult,
        notas: `Comprobante recibido por bot. Ref=${cleanRef || 'S/R'}. Esperando confirmación de Nequi/Daviplata.`
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

          const autoMsg =
            `¡Transferencia confirmada en nuestro banco! 🎉🍰\n\n` +
            `Aquí tienes tu acceso oficial e inmediato a la colección *Emprende Dulce 2026*:\n\n` +
            `🔗 *Enlace de Descarga Permanente (Google Drive):*\n` +
            `${settings.driveLink}\n\n` +
            `📁 *Incluye tus 3 Libros y 3 Bonos:* Helados Artesanales (42 pág), Postres en Vaso (39 pág), Recetario Navideño (30 pág) y Plantillas de Costeo.\n\n` +
            `¡Muchos éxitos en tu emprendimiento dulce! 🚀`;

          await waService.sendTextMessage(phone, autoMsg);
          store.agregarMensaje(phone, { from: 'bot', text: autoMsg, type: 'text' });
          store.saveLead(phone, { status: 'PAGADO', step: 'ENTREGADO' });
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
        notas: `Error en lectura automática: ${err.message}`
      });
    }
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
}

module.exports = new ConversationFlow();
