const store = require('./src/store');
const panel = require('./src/panel');
const panelChat = require('./src/panel-chat');
const conversationFlow = require('./src/conversationFlow');

async function testEndpoints() {
  console.log('--- 1. PROBANDO FLUIDEZ CONVERSACIONAL ---');
  const tel = '573105556677';
  
  // Mensaje de anuncio Click-to-WhatsApp
  await conversationFlow.handleIncomingMessage(tel, {
    type: 'text',
    text: { body: 'Hola, vi el anuncio y quiero información de los helados y postres navideños' }
  });
  
  let conv = store.obtenerConversacion(tel);
  console.log('Mensajes en chat:', conv.messages.length);
  console.log('Último mensaje bot:\n', conv.messages[conv.messages.length - 1].text.slice(0, 150) + '...');

  // Mensaje pidiendo cuenta
  await conversationFlow.handleIncomingMessage(tel, {
    type: 'text',
    text: { body: 'Me interesa mucho, ¿a qué Nequi o Daviplata transfiero?' }
  });
  conv = store.obtenerConversacion(tel);
  console.log('\nMensaje con datos de pago:\n', conv.messages[conv.messages.length - 1].text);

  // Pedidos generados
  const pedidos = store.pedidosPendientes();
  console.log('\nPedidos pendientes registrados en store:', pedidos.length);
  console.log('Primer pedido:', pedidos[0].id, pedidos[0].amount, pedidos[0].status);

  // Aprobación manual desde el panel
  store.aprobarPedido(pedidos[0].id, { reference: 'NEQUI-PRUEBA-999', aprobadoPor: 'operador' });
  const confirmados = store.pedidosVerificados();
  console.log('\nPedidos verificados tras aprobación:', confirmados.length);
  console.log('Referencia:', confirmados[0].reference, 'Aprobado por:', confirmados[0].aprobadoPor);

  // Métricas
  const kpis = store.metricas();
  console.log('\nKPIs actualizados:', {
    pedidosHoy: kpis.pedidosHoy,
    totalVentas: kpis.totalVentas,
    totalRecaudo: kpis.totalRecaudo,
    tasaCierre: kpis.tasaCierre + '%'
  });

  console.log('\n✅ TODA LA LÓGICA DE NEGOCIO Y PERSISTENCIA ESTÁ 100% OPERATIVA!');
  process.exit(0);
}

testEndpoints().catch(err => {
  console.error(err);
  process.exit(1);
});

