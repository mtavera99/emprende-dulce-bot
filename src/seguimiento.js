const store = require('./store');
const waService = require('./whatsappService');

const ACTIVO = process.env.SEGUIMIENTO_ACTIVO !== '0'; // Activo por defecto

async function ejecutarSeguimientos() {
  if (!ACTIVO) return;

  const candidatos = store.obtenerCandidatosSeguimiento();
  if (candidatos.length === 0) return;

  console.log(`[SEGUIMIENTO] Evaluando ${candidatos.length} prospectos para remarketing...`);

  for (const { phone, paso, lead, conv } of candidatos) {
    try {
      // Doble verificación de seguridad
      if (lead.status === 'PAGADO' || lead.paused) continue;

      let texto = '';
      if (paso === 1) {
        // PASO 1 (Downsell a $7.000 COP con urgencia de 2 horas - Creativo A-Z)
        texto =
          `No quiero que te quedes fuera por el precio 🙌\n\n` +
          `Por ser de los primeros interesados, he desbloqueado para ti un *descuento exclusivo válido por 2 horas.* ⏳\n\n` +
          `Puedes llevarte TODO el Superpack completo por solo *$7.000 COP*. Es un pequeño empujón para que empieces hoy mismo.\n\n` +
          `¡Dime y te envío los datos actualizados! 🍰`;
        store.setLeadPrecio(phone, 7000);
      } else if (paso === 2) {
        // PASO 2 (Prueba transparente / Tour por dentro - Creativo A-Z)
        const host = process.env.RENDER_EXTERNAL_URL || 'https://emprende-dulce-bot.onrender.com';
        texto =
          `Quiero que veas exactamente lo que vas a recibir antes de decidir 👀\n\n` +
          `En este enlace te muestro el Pack completo por dentro: cada carpeta, cada archivo, cada guía. Sin sorpresas, todo clarito:\n` +
          `👉 ${host}\n\n` +
          `Son recursos que van a llevarte de la mano paso a paso, para que no tengas que adivinar nada ni empezar desde cero.\n\n` +
          `¿Te gustaría aprovechar la promo de *$7.000* antes de que vuelva a subir? 🙌`;
      } else if (paso === 3) {
        // PASO 3 (Inversión total del riesgo / "Te doy acceso primero" / Palabra Clave "HONESTIDAD" - Creativo A-Z)
        texto =
          `Te hago una propuesta: te damos acceso primero a todo el pack en modo vista previa en tu plataforma para que lo revises y confirmes que es lo que prometimos 🙌\n\n` +
          `Cuando verifiques que es lo que buscas, nos envías el pago de *$7.000* y se abre el pack completo. Sin trucos, solo honestidad ✨\n\n` +
          `Si te interesa la oferta:\n\n` +
          `Escribe acá la palabra *“HONESTIDAD”* , te doy acceso primero 📲`;
        store.setLeadPrecio(phone, 7000);
      } else if (paso === 4) {
        // PASO 4 (Último aviso de expiración antes del cierre de 24 horas)
        const templateName = process.env.META_TEMPLATE_REMARKETING;
        if (templateName) {
          await waService.sendTemplate(phone, templateName);
          store.agregarMensaje(phone, { from: 'bot', text: `[PLANTILLA HSM REMARKETING: ${templateName}]`, type: 'text' });
          store.registrarSeguimientoEnviado(phone, paso);
          console.log(`[SEGUIMIENTO] Plantilla HSM ${templateName} enviada con éxito a +${phone}`);
          continue;
        } else {
          texto =
            `¡Hola de nuevo! ✨ Te escribo porque tu cupo especial con descuento de *$7.000 COP* está a punto de cerrarse para volver a su precio regular de $10.000.\n\n` +
            `Si todavía quieres asegurar tus 3 Guías Maestras (Helados Artesanales, Postres en Vaso y Recetario Navideño) con acceso permanente, solo avísame por aquí antes de que expire 🙌`;
        }
      }

      if (texto) {
        await waService.sendTextMessage(phone, texto);
        store.agregarMensaje(phone, { from: 'bot', text: `[REMARKETING CREATIVO A-Z PASO ${paso}] ${texto}`, type: 'text' });
        store.registrarSeguimientoEnviado(phone, paso);
        console.log(`[SEGUIMIENTO] Remarketing Paso ${paso} enviado con éxito a +${phone}`);
      }
    } catch (err) {
      console.error(`[SEGUIMIENTO ERROR] Falló envío a +${phone}:`, err.message);
    }
  }
}

// Iniciar cron / intervalo en segundo plano (cada 5 minutos)
function iniciarScheduler(intervaloMs = 5 * 60 * 1000) {
  console.log(`[SEGUIMIENTO] Scheduler iniciado (revisa cada ${intervaloMs / 60000} minutos).`);
  setInterval(() => {
    ejecutarSeguimientos().catch(err => {
      console.error('[SEGUIMIENTO CRON ERROR]:', err);
    });
  }, intervaloMs);
}

module.exports = {
  ejecutarSeguimientos,
  iniciarScheduler
};
