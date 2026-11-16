const store = require('./store');
const waService = require('./whatsappService');

const ACTIVO = process.env.SEGUIMIENTO_ACTIVO !== '0'; // Activo por defecto

async function ejecutarSeguimientos() {
  if (!ACTIVO) return;

  const candidatos = store.obtenerCandidatosSeguimiento();
  if (candidatos.length === 0) return;

  console.log(`[SEGUIMIENTO] Evaluando ${candidatos.length} prospectos para recuperación...`);

  for (const { phone, paso, lead, conv } of candidatos) {
    try {
      // Doble verificación de seguridad
      if (lead.status === 'PAGADO' || lead.paused) continue;

      let texto = '';
      if (paso === 1) {
        texto =
          `¡Hola! 🙌 Noté que te interesó la colección de *Emprende Dulce* pero no alcanzaste a confirmar tu pago de los $10.000 COP.\n\n` +
          `Recuerda que tu cupo con los *3 Libros Completos en PDF + los 3 Bonos de Regalo* sigue reservado para ti hoy.\n\n` +
          `¿Te quedó alguna duda con los ingredientes o necesitas los daticos de Nequi / Daviplata de nuevo? 🍰`;
      } else if (paso === 2) {
        texto =
          `¡Hola de nuevo! ✨ Te escribo para avisarte que los cupos promocionales del Pack *Emprende Dulce 2026* por $10.000 COP están por cerrarse para volver a su precio regular.\n\n` +
          `Si todavía quieres asegurar tus 3 Guías Maestras (Helados Artesanales, Postres en Vaso y Recetario Navideño) con acceso permanente, solo avísame por aquí para reactivar tu cupo 🙌`;
      }

      if (texto) {
        await waService.sendTextMessage(phone, texto);
        store.agregarMensaje(phone, { from: 'bot', text: `[SEGUIMIENTO PASO ${paso}] ${texto}`, type: 'text' });
        store.registrarSeguimientoEnviado(phone, paso);
        console.log(`[SEGUIMIENTO] Paso ${paso} enviado con éxito a +${phone}`);
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
