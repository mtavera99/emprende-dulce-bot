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
    const text = rawText.toLowerCase().trim();
    const settings = this.getSettings();
    const precio = settings.precioOferta || this.defaultPrice;
    const precioCOP = '$' + Number(precio).toLocaleString('es-CO');

    const lead = store.getLead(phone);
    const conv = store.obtenerConversacion(phone);
    const botMessages = (conv?.messages || []).filter(m => m.from === 'bot');
    const pitchYaEnviado = (lead && lead.step !== 'INICIO') || botMessages.length > 0;

    // 1. Detección precisa de INTENCIÓN DE COMPRA / PAGO / INTERÉS con límites de palabra (evita trampas como 'hola quiero')
    const patronesCompra = [
      /\b(nequi|daviplata|bancolombia|transfiya|bre-?b)\b/i,
      /\b(como|donde|dónde)\s+(pago|compro|consigno|transfiero|cancelo)\b/i,
      /\b(datos|medios)\s+(de\s+)?pago\b/i,
      /\b(quiero\s+comprar|lo\s+quiero|la\s+quiero|lo\s+deseo)\b/i,
      /\b(me\s+interesa|estoy\s+interesad[oa]|estaba\s+interesad[oa]|interesad[oa]|interesa)\b/i,
      /\b(si|sí)\s+(me\s+interesa|quiero)\b/i,
      /\b(transferir|consignar|comprar|apartar|cupo)\b/i,
      /\b(a\s+d[oó]nde|a\s+qu[eé]\s+n[uú]mero)\b/i,
      /\b(p[aá]same|dame|deme)\s+(la\s+cuenta|el\s+n[uú]mero|el\s+nequi|el\s+daviplata)\b/i,
      /\b(n[uú]mero\s+de\s+(nequi|cuenta|daviplata))\b/i,
      /\b(cu[aá]nto\s+(vale|cuesta)|precio|costo)\b/i
    ];
    const esInteresCompra = patronesCompra.some(re => re.test(text));

    // Si el pitch ya fue enviado y responde una afirmación ("sí", "claro", "dale de una", "bueno", "listo", "ok", "de una", "hágale", etc.)
    const palabrasAfirmativas = /\b(si|sí|sii|claro|dale|de\s*una|bueno|listo|ok|oka|yes|por\s*favor|vale|h[aá]gale|me\s*sirve|quiero|perfecto|excelente|s[uú]per|va)\b/i;
    const esAfirmacionCorta = pitchYaEnviado && text.length <= 35 && palabrasAfirmativas.test(text) && !text.includes('?') && !text.includes('¿');

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
        const aclaracion =
          `¡Con todo gusto te aclaro! 😊\n\n` +
          `Es una colección digital completa con *3 Recetarios en PDF* de alta definición:\n` +
          `🍦 *1. Helados Artesanales* (fórmulas cremosas que no se cristalizan sin máquinas costosas)\n` +
          `🧁 *2. Postres en Vaso* (12 recetas listas para vender en vasito domo)\n` +
          `🎄 *3. Recetario Navideño* (natillas, buñuelos, anchetas y torta negra)\n\n` +
          `Más la plantilla de costeo en Excel para que calcules tus ganancias exactas.\n\n` +
          `Todo te queda en solo *${precioCOP} COP* hoy (pago único con acceso de por vida a tu celular).\n\n` +
          `¿Te gustaría que te comparta los datos de Nequi o Daviplata para apartar tu cupo?`;
        await waService.sendTextMessage(phone, aclaracion);
        store.agregarMensaje(phone, { from: 'bot', text: aclaracion, type: 'text' });
        return;
      }
    }

    // 4. Duda: "¿Es físico o digital? / ¿Cómo se recibe?"
    if (text.includes('fisico') || text.includes('físico') || text.includes('digital') || text.includes('pdf') || text.includes('libro')) {
      const reply =
        `Son *100% digitales en formato PDF de alta definición* 📱✨\n\n` +
        `Los descargas directamente a tu celular, tablet o computador para verlos siempre sin necesidad de internet, o si prefieres también los puedes imprimir.\n\n` +
        `Incluye los 3 Libros y los 3 Bonos por solo *${precioCOP} COP* (pago único, acceso para siempre).\n\n` +
        `¿Te paso los daticos de Nequi o Daviplata para aprovechar el descuento hoy?`;
      await waService.sendTextMessage(phone, reply);
      store.agregarMensaje(phone, { from: 'bot', text: reply, type: 'text' });
      return;
    }

    // 5. Duda: "Máquinas / experiencia / ingredientes"
    if (text.includes('maquina') || text.includes('máquina') || text.includes('experiencia') || text.includes('dificil') || text.includes('difícil') || text.includes('ingrediente')) {
      const reply =
        `¡Cero complicaciones! 👩‍🍳 No necesitas ninguna máquina industrial costosa ni tener experiencia previa.\n\n` +
        `Todas las recetas están formuladas para hacer en casa con batidora o licuadora tradicional, y los ingredientes se consiguen en cualquier supermercado o tienda de barrio de Colombia.\n\n` +
        `¿Te gustaría asegurar tu acceso con la promo de *${precioCOP}*?`;
      await waService.sendTextMessage(phone, reply);
      store.agregarMensaje(phone, { from: 'bot', text: reply, type: 'text' });
      return;
    }

    // 6. Lead inicial (nunca se le ha enviado el pitch)
    if (!pitchYaEnviado) {
      return await this.sendMainPitch(phone, settings, precioCOP);
    }

    // 7. Fallback inteligente con IA Gemini para cualquier otra consulta
    return await this._responderConGemini(phone, rawText, settings, precioCOP);
  }

  async _responderConGemini(phone, userText, settings, precioCOP) {
    try {
      const key = process.env.GEMINI_API_KEY;
      const model = process.env.GEMINI_MODEL || 'gemini-flash-latest';
      if (!key) {
        return await this.sendPaymentDetails(phone, settings, precioCOP);
      }

      const conv = store.obtenerConversacion(phone);
      const historial = (conv?.messages || []).slice(-6).map(m => `${m.from === 'bot' ? 'Asistente' : 'Cliente'}: ${m.text}`).join('\n');

      const systemPrompt = `Eres Sofía, asesora experta de "Emprende Dulce" en Colombia.
Tu tono es cálido, colombiano, dulce, servicial y persuasivo.
Reglas clave:
- Responde de forma muy natural y concisa (máximo 2 a 3 líneas estilo WhatsApp real).
- El producto es digital: 3 recetarios PDF (Helados Artesanales, Postres en Vaso y Recetas Navideñas) + plantilla Excel de costeo por solo ${precioCOP} COP pago único.
- Si el cliente pregunta algo específico (ej: "¿cómo pago?", "¿es seguro?", "¿qué ingredientes?"), responde con empatía y claridad.
- Si el cliente muestra interés o acuerdo, facilítale transferir los ${precioCOP} COP a Nequi o Daviplata (${settings.nequiNumero || '3058742138'} a nombre de Manuel Tavera).
- Cierra siempre invitándolo amablemente a adquirir el pack por Nequi o Daviplata.
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
          generationConfig: { maxOutputTokens: 200, temperature: 0.3 }
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
      `👤 *Titular:* ${titular} _(en Nequi/Daviplata te saldrá como MAN*** TAV*** o Manuel Tavera)_\n\n` +
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
          `📥 *Enlace de Descarga Directa (Web Oficial):*\n` +
          `https://emprende-dulce-bot.onrender.com/descargar\n\n` +
          `🔗 *O en Google Drive:*\n` +
          `${settings.driveLink}\n\n` +
          `📁 *Tu pack incluye:*\n` +
          `✓ Guía Maestra de Helados Artesanales (47 págs PDF)\n` +
          `✓ Postres en Vaso para Emprender (41 págs PDF)\n` +
          `✓ Recetario Navideño y Cajas de Regalo (35 págs PDF)\n` +
          `✓ Bono 1: Plantilla de Costeo en Excel y Web\n` +
          `✓ Bono 2: Directorio de Proveedores en Colombia\n` +
          `✓ Bono 3: Guía de Ventas por WhatsApp\n\n` +
          `¡Muchos éxitos en tu emprendimiento dulce! Si tienes cualquier pregunta con alguna receta, aquí estamos para ayudarte 🙌`;

        await waService.sendTextMessage(phone, confirmMsg);
        store.agregarMensaje(phone, { from: 'bot', text: confirmMsg, type: 'text' });
        store.saveLead(phone, { status: 'PAGADO', step: 'ENTREGADO' });
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
          aprobadoPor: 'ia_leona_auto',
          notas: `Auto-aprobado por IA (Modelo A Leona). Banco: ${bankName}. Ref: ${autoRef}`
        });

        store.aprobarPedido(pedido.id, {
          reference: autoRef,
          aprobadoPor: 'ia_leona_auto'
        });

        const confirmMsg =
          `¡Comprobante verificado con éxito! 🎉🍰\n\n` +
          `Bienvenido(a) a la familia de *Emprende Dulce*. Aquí tienes tu acceso oficial e inmediato a todo el material:\n\n` +
          `📥 *Enlace de Descarga Directa (Web Oficial):*\n` +
          `https://emprende-dulce-bot.onrender.com/descargar\n\n` +
          `🔗 *O en Google Drive:*\n` +
          `${settings.driveLink}\n\n` +
          `📁 *Tu pack incluye:*\n` +
          `✓ Guía Maestra de Helados Artesanales (47 págs PDF)\n` +
          `✓ Postres en Vaso para Emprender (41 págs PDF)\n` +
          `✓ Recetario Navideño y Cajas de Regalo (35 págs PDF)\n` +
          `✓ Bono 1: Plantilla de Costeo en Excel y Web\n` +
          `✓ Bono 2: Directorio de Proveedores en Colombia\n` +
          `✓ Bono 3: Guía de Ventas por WhatsApp\n\n` +
          `¡Muchos éxitos en tu emprendimiento dulce! Si tienes cualquier pregunta con alguna receta, aquí estamos para ayudarte 🙌`;

        await waService.sendTextMessage(phone, confirmMsg);
        store.agregarMensaje(phone, { from: 'bot', text: confirmMsg, type: 'text' });
        store.saveLead(phone, { status: 'PAGADO', step: 'ENTREGADO' });
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

          const autoMsg =
            `¡Transferencia confirmada en nuestro banco! 🎉🍰\n\n` +
            `Aquí tienes tu acceso oficial e inmediato a la colección *Emprende Dulce 2026*:\n\n` +
            `🔗 *Enlace de Descarga Permanente (Google Drive):*\n` +
            `${settings.driveLink}\n\n` +
            `📁 *Incluye tus 3 Libros y 3 Bonos:* Helados Artesanales (47 pág), Postres en Vaso (41 pág), Recetario Navideño (35 pág) y Plantillas de Costeo.\n\n` +
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
