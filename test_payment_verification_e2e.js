const assert = require('assert');
const paymentVerifier = require('./src/paymentVerifier');
const store = require('./src/store');

console.log('🧪 INICIANDO PRUEBAS E2E DEL SISTEMA DE VERIFICACIÓN DE PAGOS');

async function runTests() {
  // Test 1: Parser de notificaciones de texto
  console.log('\n--- TEST 1: Parsing de notificaciones reales (Nequi, Daviplata, Bre-B) ---');
  
  const notifNequi = paymentVerifier.parseNotificationText('Te transfirieron $10.000 de Andrea Perez. Ref: M9182734');
  assert.strictEqual(notifNequi.bank, 'NEQUI');
  assert.strictEqual(notifNequi.amount, 10000);
  assert.strictEqual(notifNequi.reference, 'M9182734');
  console.log('✅ Notificación Nequi parseada correctamente:', notifNequi);

  const notifDaviplata = paymentVerifier.parseNotificationText('DaviPlata informa que recibiste $10.000 de Pedro Gomez. Autorización: 456789');
  assert.strictEqual(notifDaviplata.bank, 'DAVIPLATA');
  assert.strictEqual(notifDaviplata.amount, 10000);
  assert.strictEqual(notifDaviplata.reference, '456789');
  console.log('✅ Notificación Daviplata parseada correctamente:', notifDaviplata);

  const notifTransfiya = paymentVerifier.parseNotificationText('Transfiya te informa que recibiste $10.000 de Camilo Torres. Ref: TRF12345');
  assert.strictEqual(notifTransfiya.bank, 'LLAVE_BRE_B');
  assert.strictEqual(notifTransfiya.amount, 10000);
  assert.strictEqual(notifTransfiya.reference, 'TRF12345');
  console.log('✅ Notificación Bre-B / Llave parseada correctamente:', notifTransfiya);

  // Test 2: Ingesta en el Libro Mayor
  console.log('\n--- TEST 2: Ingesta en el Libro Mayor Bancario ---');
  const resIngest = paymentVerifier.ingestNotification({
    bank: 'NEQUI',
    amount: 10000,
    reference: 'M5558881',
    sender: 'Camila Rojas'
  });
  assert.strictEqual(resIngest.success, true);
  assert.strictEqual(resIngest.transaction.status, 'UNCLAIMED');
  console.log('✅ Transacción registrada como UNCLAIMED en ledger');

  // Test 3: Verificación contra OCR
  console.log('\n--- TEST 3: Cruce exitoso Comprobante OCR vs Libro Mayor ---');
  const customerPhone = '573001112233';
  const check = paymentVerifier.verifyPayment({
    reference: 'M5558881',
    amount: 10000,
    bank: 'nequi'
  }, customerPhone);

  assert.strictEqual(check.verified, true);
  assert.strictEqual(check.method, 'CRUCE_EXACTO_LIBRO_MAYOR');
  assert.strictEqual(check.transaction.status, 'CLAIMED');
  assert.strictEqual(check.transaction.claimedByPhone, customerPhone);
  console.log('✅ Cruce bancario exacto confirmado. Transacción marcada como CLAIMED.');

  // Test 4: Antifraude de reuso
  console.log('\n--- TEST 4: Detección Antifraude (Intento de reuso por otro cliente) ---');
  const scammerPhone = '573119998877';
  const scamCheck = paymentVerifier.verifyPayment({
    reference: 'M5558881',
    amount: 10000,
    bank: 'nequi'
  }, scammerPhone);

  assert.strictEqual(scamCheck.verified, false);
  assert.strictEqual(scamCheck.fraud, true);
  assert.strictEqual(scamCheck.reason, 'REFERENCIA_DUPLICADA_BANCARIA');
  console.log('✅ Antifraude bloqueó el reuso de comprobante con éxito:', scamCheck.message);

  // Test 5: Watcher en espera activa (Llega alerta bancaria después de que el cliente manda la captura)
  console.log('\n--- TEST 5: Watcher en espera activa (Alerta bancaria asíncrona) ---');
  const slowPhone = '573204445566';
  const pendingRef = 'M7773332';

  let autoApprovedTx = null;
  paymentVerifier.waitForIncomingPayment(slowPhone, {
    reference: pendingRef,
    amount: 10000,
    orderId: 'DULCE-TEST-SLOW'
  }, (tx) => {
    autoApprovedTx = tx;
  }, 5000);

  // Simulamos que a los 500ms Nequi notifica la acreditación
  setTimeout(() => {
    paymentVerifier.ingestNotification({
      bank: 'NEQUI',
      amount: 10000,
      reference: pendingRef,
      sender: 'Cliente Tardío'
    });
  }, 500);

  await new Promise(r => setTimeout(r, 1000));

  assert.notStrictEqual(autoApprovedTx, null);
  assert.strictEqual(autoApprovedTx.reference, pendingRef);
  assert.strictEqual(autoApprovedTx.status, 'CLAIMED');
  console.log('✅ Watcher detectó la acreditación en tiempo real y auto-aprobó la entrega.');

  console.log('\n======================================================');
  console.log('🎉 TODAS LAS PRUEBAS DEL SISTEMA BANCARIO PASARON AL 100%');
  console.log('======================================================\n');
}

runTests().catch(err => {
  console.error('❌ Error en pruebas:', err);
  process.exit(1);
});
