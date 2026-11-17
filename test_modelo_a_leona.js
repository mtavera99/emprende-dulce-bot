const assert = require('assert');
const store = require('./src/store');
const conversationFlow = require('./src/conversationFlow');
const ocrValidator = require('./src/ocrValidator');
const waService = require('./src/whatsappService');

// Mock waService.downloadMedia and sendTextMessage to test in-memory
const sentMessages = [];
waService.sendTextMessage = async (phone, text) => {
  sentMessages.push({ phone, text });
  return { success: true };
};

waService.downloadMedia = async (mediaId) => {
  return {
    buffer: Buffer.from('mock_image_bytes_' + mediaId),
    contentType: 'image/jpeg'
  };
};

async function runTests() {
  console.log('🦁 ========================================================');
  console.log('🦁 INICIANDO TEST SUITE E2E: MODELO A (AUTO-ENTREGA LEONA)');
  console.log('🦁 ========================================================\n');

  // Asegurar que modoAutoEntregaLeona está activo
  store.updateSettings({ modoAutoEntregaLeona: true });

  // --------------------------------------------------------------------------
  // TEST 1: Auto-entrega inmediata por IA con comprobante válido ($10.000 COP)
  // --------------------------------------------------------------------------
  console.log('Test 1: Comprobante válido enviado por Cliente 1 (+573001112233)...');
  const phone1 = '573001112233';
  sentMessages.length = 0;

  // Mockeamos la respuesta del OCR para este test
  const originalValidate = ocrValidator.validateReceipt;
  ocrValidator.validateReceipt = async () => ({
    isValid: true,
    amount: 10000,
    bank: 'nequi',
    reference: 'M987654',
    date: '17 Nov 2026',
    reason: 'Comprobante verificado con éxito'
  });

  await conversationFlow.handleIncomingMessage(phone1, {
    type: 'image',
    image: { id: 'media_valido_001' }
  });

  const pedidos1 = store.pedidosDeTelefono(phone1);
  assert.ok(pedidos1.length > 0, 'Debe haber creado un pedido');
  const pedido1 = pedidos1[pedidos1.length - 1];
  console.log(`   Estado pedido: ${pedido1.status}`);
  console.log(`   Aprobado por: ${pedido1.aprobadoPor}`);
  console.log(`   Referencia: ${pedido1.reference}`);
  assert.strictEqual(pedido1.status, 'VERIFICADO', 'El pedido debe estar VERIFICADO de inmediato');
  assert.strictEqual(pedido1.aprobadoPor, 'ia_leona_auto', 'Debe haber sido aprobado por ia_leona_auto');

  // Verificar que se envió el enlace de Google Drive
  const ultimoMsg1 = sentMessages[sentMessages.length - 1];
  assert.ok(ultimoMsg1.text.includes('drive.google.com'), 'Debe incluir el enlace de Drive');
  assert.ok(ultimoMsg1.text.includes('47 págs PDF'), 'Debe incluir Helados 47 pág');
  console.log('   ✅ Test 1 APROBADO: Acceso y libros entregados automáticamente en segundos.\n');

  // --------------------------------------------------------------------------
  // TEST 2: Antifraude - Intento de reuso del comprobante desde otro teléfono
  // --------------------------------------------------------------------------
  console.log('Test 2: Cliente 2 (+573009998877) intenta usar el mismo comprobante (Ref: M987654)...');
  const phone2 = '573009998877';
  sentMessages.length = 0;

  await conversationFlow.handleIncomingMessage(phone2, {
    type: 'image',
    image: { id: 'media_copiado_002' }
  });

  const pedidos2 = store.pedidosDeTelefono(phone2);
  const pedido2 = pedidos2[pedidos2.length - 1];
  console.log(`   Estado pedido fraude: ${pedido2.status}`);
  console.log(`   Motivo rechazo: ${pedido2.motivoRechazo}`);
  assert.strictEqual(pedido2.status, 'RECHAZADO', 'El pedido duplicado debe ser RECHAZADO');

  const alertMsg = sentMessages.find(m => m.phone === phone2 && m.text.includes('Aviso de Seguridad Bancaria'));
  assert.ok(alertMsg, 'Debe haber enviado aviso de seguridad bancaria al cliente 2');
  console.log('   ✅ Test 2 APROBADO: Intento de fraude bloqueado automáticamente.\n');

  // --------------------------------------------------------------------------
  // TEST 3: Imagen no concluyente / ilegible o monto menor
  // --------------------------------------------------------------------------
  console.log('Test 3: Cliente 3 (+573005554433) envía foto borrosa o no válida...');
  const phone3 = '573005554433';
  sentMessages.length = 0;

  ocrValidator.validateReceipt = async () => ({
    isValid: false,
    amount: 0,
    bank: 'otro',
    reference: '',
    reason: 'Imagen borrosa o no corresponde a transferencia bancaria'
  });

  await conversationFlow.handleIncomingMessage(phone3, {
    type: 'image',
    image: { id: 'media_borroso_003' }
  });

  const pedidos3 = store.pedidosDeTelefono(phone3);
  const pedido3 = pedidos3[pedidos3.length - 1];
  console.log(`   Estado pedido ilegible: ${pedido3.status}`);
  assert.strictEqual(pedido3.status, 'PENDIENTE', 'Debe quedar en PENDIENTE para revisión de operador');
  const pendingMsg = sentMessages.find(m => m.phone === phone3 && m.text.includes('revisión prioritaria'));
  assert.ok(pendingMsg, 'Debe haber avisado que queda en revisión prioritaria');
  console.log('   ✅ Test 3 APROBADO: Comprobante ilegible enviado a cola de panel sin entrega indebida.\n');

  // --------------------------------------------------------------------------
  // TEST 4: Toggle switch para desactivar y reactivar Modo Leona
  // --------------------------------------------------------------------------
  console.log('Test 4: Alternar switch de Auto-Entrega Leona...');
  store.updateSettings({ modoAutoEntregaLeona: false });
  assert.strictEqual(store.getSettings().modoAutoEntregaLeona, false, 'Modo Leona debe estar desactivado');

  store.updateSettings({ modoAutoEntregaLeona: true });
  assert.strictEqual(store.getSettings().modoAutoEntregaLeona, true, 'Modo Leona debe estar reactivado');
  console.log('   ✅ Test 4 APROBADO: El switch de control responde correctamente.\n');

  // Restaurar método original
  ocrValidator.validateReceipt = originalValidate;

  console.log('🎉 ========================================================');
  console.log('🎉 TODOS LOS TESTS DEL MODELO A PASARON AL 100%!');
  console.log('🎉 ========================================================');
}

runTests().catch(err => {
  console.error('❌ Error en test suite:', err);
  process.exit(1);
});
