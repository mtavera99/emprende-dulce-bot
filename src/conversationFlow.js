const waService = require('./whatsappService');
const ocrValidator = require('./ocrValidator');

// Almacenamiento en memoria con persistencia simple
const userSessions = new Map();

class ConversationFlow {
  constructor() {
    this.nequiNumber = process.env.NEQUI_NUMERO || "3001234567";
    this.nequiTitular = process.env.NEQUI_TITULAR || "Santiago Tavera";
    this.productPrice = process.env.PRECIO_OFERTA_COP || "10.000";
    this.driveLink = process.env.GOOGLE_DRIVE_LINK || "https://drive.google.com/drive/folders/TU_CARPETA_DE_DRIVE";
  }

  getSession(phone) {
    if (!userSessions.has(phone)) {
      userSessions.set(phone, {
        step: 'START',
        firstSeen: new Date(),
        orderBumpOffered: false,
        paid: false
      });
    }
    return userSessions.get(phone);
  }

  async handleIncomingMessage(phone, message) {
    const session = this.getSession(phone);
    const msgType = message.type;

    console.log(`[MSG] De: ${phone} | Tipo: ${msgType} | Estado actual: ${session.step}`);

    // Si envía una IMAGEN (Comprobante de pago)
    if (msgType === 'image') {
      return await this.handleImageMessage(phone, session, message.image);
    }

    // Si envía TEXTO
    if (msgType === 'text') {
      const text = (message.text?.body || "").trim().toLowerCase();
      return await this.handleTextMessage(phone, session, text);
    }
  }

  async handleTextMessage(phone, session, text) {
    // Si es su primer mensaje o el mensaje típico de anuncio Click-to-WhatsApp
    if (session.step === 'START' || text.includes('oferta') || text.includes('informacion') || text.includes('info') || text.includes('curso') || text.includes('helado')) {
      return await this.sendPitchAndPaymentInfo(phone, session);
    }

    // Si está esperando pago y pregunta dudas frecuentes
    if (session.step === 'WAITING_PAYMENT') {
      if (text.includes('nequi') || text.includes('numero') || text.includes('cuenta') || text.includes('pago')) {
        await waService.sendTextMessage(
          phone,
          `📲 *Datos para tu transferencia directa de $${this.productPrice} COP:*\n\n` +
          `💚 *Nequi:* \`${this.nequiNumber}\`\n` +
          `💛 *Daviplata:* \`${this.nequiNumber}\`\n` +
          `👤 *Titular:* ${this.nequiTitular}\n\n` +
          `Apenas transfieras, envíame por aquí el pantallazo o comprobante para entregarte el enlace de acceso de inmediato 🚀`
        );
        return;
      }

      if (text.includes('seguro') || text.includes('confiable') || text.includes('garantia')) {
        await waService.sendTextMessage(
          phone,
          `¡Completamente seguro! 🙌 El acceso te llega en el mismo segundo que envíes tu comprobante.\n\n` +
          `El material está alojado en Google Drive y puedes descargarlo a tu celular o computador para tenerlo de por vida.\n\n` +
          `¿Te gustaría que te guarde uno de los cupos con la promo de *$${this.productPrice} COP*?`
        );
        return;
      }

      // Respuesta genérica recordatorio
      await waService.sendTextMessage(
        phone,
        `Quedo super atento a tu comprobante de *$${this.productPrice} COP* a Nequi (\`${this.nequiNumber}\`) para enviarte de inmediato todo el paquete y tus 3 regalos 🎁`
      );
      return;
    }

    // Si ya pagó y pregunta por el link de nuevo
    if (session.step === 'PAID') {
      await waService.sendTextMessage(
        phone,
        `¡Hola de nuevo! Recuerda que tu material lo tienes disponible aquí:\n\n🔗 ${this.driveLink}\n\n¡Cualquier duda con alguna receta, aquí estamos para ayudarte! 🍰`
      );
    }
  }

  async handleImageMessage(phone, session, imageObj) {
    await waService.sendTextMessage(phone, `🔍 Recibí tu comprobante. Estoy validándolo en nuestro sistema, dame 10 segundos...`);

    try {
      // 1. Descargar imagen desde Meta WhatsApp Cloud API
      const imageBuffer = await waService.downloadMedia(imageObj.id);

      // 2. Pasar por el validador de Visión con IA
      const validation = await ocrValidator.validateReceipt(imageBuffer, {
        minAmount: 10000,
        recipientKeyword: this.nequiTitular.split(" ")[0] // Primer nombre
      });

      console.log(`[VALIDATION] Tel: ${phone} | Resultado:`, validation);

      if (validation.isValid) {
        session.step = 'PAID';
        session.paid = true;

        // 3. Entrega triunfal del producto
        await waService.sendTextMessage(
          phone,
          `🎉 *¡PAGO CONFIRMADO CON ÉXITO!*\n\n` +
          `Bienvenido(a) a la comunidad de *Emprende Dulce*. Tu acceso permanente de por vida ya está habilitado.\n\n` +
          `📥 *DESCARGA AQUÍ TODO TU MATERIAL Y BONOS:*\n` +
          `👉 ${this.driveLink}\n\n` +
          `📦 *¿Qué vas a encontrar en tu carpeta?*\n` +
          `✅ 1. Guía Maestra de Helados Artesanales Sin Máquina.\n` +
          `✅ 2. Recetario de Postres en Vaso de Alta Rentabilidad.\n` +
          `✅ 3. Calculadora Interactiva de Costos y Precios en Excel/HTML.\n` +
          `✅ 4. Directorio de Proveedores Mayoristas en Colombia.\n` +
          `✅ 5. Guía de Ventas por WhatsApp.\n\n` +
          `¡Guarda este enlace en tus favoritos de Google Chrome o descárgalo a tu celular!`
        );

        // 4. Disparar el Order Bump con retraso de 3 segundos
        setTimeout(async () => {
          await waService.sendTextMessage(
            phone,
            `🎁 *OFERTA ESPECIAL DE BIENVENIDA (Solo por 15 minutos):*\n\n` +
            `Por ser nuevo alumno, puedes desbloquear hoy nuestro *Mega Pack de Mini Donas Gourmet + Recetas Especiales de Navidad* con más de 120 recetas adicionales por solo *$5.000 COP adicionales* (Precio normal: $30.000).\n\n` +
            `¿Te gustaría agregarlo a tu carpeta antes de cerrar tu orden? Responde con un *SÍ* y te paso los detalles 🔥`
          );
        }, 3000);

      } else {
        // Comprobante dudoso o monto menor
        await waService.sendTextMessage(
          phone,
          `⚠️ Recibimos tu imagen, pero nuestro sistema no pudo validar la transferencia de *$${this.productPrice} COP* a Nequi.\n\n` +
          `Por favor asegúrate de enviar la captura de pantalla completa donde se vea claramente el valor ($10.000), la fecha de hoy y el número de aprobación de Nequi / Daviplata.`
        );
      }
    } catch (error) {
      console.error("[ERROR PROCESANDO COMPROBANTE]:", error);
      await waService.sendTextMessage(
        phone,
        `Tuvimos un pequeño inconveniente leyendo la imagen. Un asesor humano revisará tu comprobante en breve para enviarte el enlace. ¡Gracias por tu paciencia!`
      );
    }
  }

  async sendPitchAndPaymentInfo(phone, session) {
    session.step = 'WAITING_PAYMENT';

    const pitch = 
      `¡Hola! 👋 Qué alegría saludarte. Claro que sí, la super promoción de *Emprende Dulce* sigue activa hoy por solo *$${this.productPrice} COP* (Un solo pago para siempre). 🍨✨\n\n` +
      `Te llevas TODO el paquete completo listo para estudiar o montar tu negocio desde casa:\n\n` +
      `🍨 *1. CURSO MAESTRO: HELADOS ARTESANALES SIN MÁQUINA*\n` +
      `Aprende el secreto de la textura cremosa sin necesidad de comprar máquinas costosas (Helados cremosos, paletas de agua, bases neutras y técnicas de veteado).\n\n` +
      `🍰 *2. CURSO: POSTRES EN VASO PARA VENDER*\n` +
      `Tres Leches, Tiramisú fácil sin horno, Pay de limón crocante, Mousse de maracuyá y Fresas con crema gourmet.\n\n` +
      `🎁 *3 REGALOS EXCLUSIVOS INCLUIDOS HOY:*\n` +
      `✅ *Bono 1:* Calculadora Interactiva de Costos, Gramajes y Precios (en Excel y versión para celular).\n` +
      `✅ *Bono 2:* Directorio de Proveedores Mayoristas en Colombia (Envases, bases, lácteos con 40% de descuento).\n` +
      `✅ *Bono 3:* Guía Práctica para vender 100 vasos a la semana por WhatsApp sin pagar publicidad.\n\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `💰 *PRECIO ÚNICO:* Solo *$${this.productPrice} PESOS COLOMBIANOS*\n` +
      `━━━━━━━━━━━━━━━━━━━\n\n` +
      `💳 *Medios de Pago Disponibles:*\n` +
      `💚 *Nequi:* \`${this.nequiNumber}\`\n` +
      `💛 *Daviplata:* \`${this.nequiNumber}\`\n` +
      `👤 *Titular:* ${this.nequiTitular}\n\n` +
      `📲 *Apenas hagas tu transferencia, envíame por aquí la captura de pantalla de tu pago y nuestro sistema te enviará tu acceso de inmediato.* 🚀`;

    await waService.sendTextMessage(phone, pitch);
  }
}

module.exports = new ConversationFlow();
