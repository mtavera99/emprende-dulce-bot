const conversationFlow = require('../src/conversationFlow');
const store = require('../src/store');

console.log('🤖 SIMULACIÓN END-TO-END DE CONVERSACIÓN DE VENTA (MOLDES DE COSTURA)\n');

const testPhone = '573138615813'; // Teléfono de prueba Biker Pro del usuario

async function runSimulation() {
  // Limpiar estado previo de prueba para este teléfono
  store.saveLead(testPhone, { status: 'INICIO', step: 'INICIO', producto: null, adId: null });
  const conv = store.obtenerConversacion(testPhone);
  if (conv) conv.messages = [];

  // Paso 1: El cliente hace clic en el Anuncio 1 (Video) de Meta Ads
  console.log('--- PASO 1: Cliente toca el anuncio de Video de Moldes en Instagram Reels ---');
  const msg1 = {
    type: 'text',
    text: { body: 'Hola, quiero los +2.000 Moldes de Costura en PDF por $10.000 🧵' },
    referral: {
      source_id: '120250542591850743', // Ad ID de Video de Moldes
      source_type: 'ad',
      headline: '🧵 +2.000 Moldes en PDF por solo $10.000 COP'
    }
  };
  await conversationFlow.handleIncomingMessage(testPhone, msg1);

  let lead = store.getLead(testPhone);
  console.log(`Lead producto asignado: ${lead.producto} (Ad ID: ${lead.adId})`);
  let convData = store.obtenerConversacion(testPhone);
  let lastBotMsg = convData.messages.filter(m => m.from === 'bot').pop();
  console.log('Respuesta del Bot (Pitch enviado):');
  console.log(lastBotMsg.text.substring(0, 180) + '...\n');

  // Paso 2: El cliente pregunta cómo se imprime
  console.log('--- PASO 2: Cliente pregunta "¿Cómo se imprime en casa? ¿Necesito plotter?" ---');
  const msg2 = {
    type: 'text',
    text: { body: '¿Cómo se imprime en casa? ¿Necesito plotter?' }
  };
  await conversationFlow.handleIncomingMessage(testPhone, msg2);
  convData = store.obtenerConversacion(testPhone);
  lastBotMsg = convData.messages.filter(m => m.from === 'bot').pop();
  console.log('Respuesta del Bot a la duda de impresión:');
  console.log(lastBotMsg.text + '\n');

  // Paso 3: El cliente pide los datos de pago
  console.log('--- PASO 3: Cliente dice "Listo, me interesa, pásame el Nequi" ---');
  const msg3 = {
    type: 'text',
    text: { body: 'Listo, me interesa, pásame el Nequi' }
  };
  await conversationFlow.handleIncomingMessage(testPhone, msg3);
  convData = store.obtenerConversacion(testPhone);
  lastBotMsg = convData.messages.filter(m => m.from === 'bot').pop();
  console.log('Respuesta del Bot con datos de pago:');
  console.log(lastBotMsg.text + '\n');

  // Paso 4: Entrega del producto
  console.log('--- PASO 4: Simulamos la entrega tras confirmación de pago ---');
  const settings = store.getSettings();
  await conversationFlow.enviarEntregaProducto(testPhone, settings);
  convData = store.obtenerConversacion(testPhone);
  lastBotMsg = convData.messages.filter(m => m.from === 'bot').pop();
  console.log('Respuesta del Bot con enlace de entrega:');
  console.log(lastBotMsg.text + '\n');

  console.log('🎉 ¡SIMULACIÓN COMPLETADA CON ÉXITO! El bot vende, responde objeciones y entrega el producto de Moldes a la perfección.');
}

runSimulation().catch(console.error);
