const http = require('http');

async function testLiveServer() {
  process.env.PORT = '3001';
  process.env.PANEL_TOKEN = 'test_token_123';
  process.env.META_VERIFY_TOKEN = 'test_meta_verify';

  // Iniciar servidor en puerto 3001 para no interferir
  const app = require('./src/server');
  
  // Esperar a que el servidor esté listo
  await new Promise(r => setTimeout(r, 500));

  console.log('--- TEST 1: Health Check (GET /) ---');
  let res = await fetch('http://localhost:3001/');
  let json = await res.json();
  console.log('Status:', res.status, json);
  if (res.status !== 200 || json.status !== 'online') throw new Error('Falló Test 1');

  console.log('--- TEST 2: Webhook Handshake (GET /webhook) ---');
  res = await fetch('http://localhost:3001/webhook?hub.mode=subscribe&hub.verify_token=test_meta_verify&hub.challenge=CHALLENGE_12345');
  let text = await res.text();
  console.log('Status:', res.status, 'Response:', text);
  if (text !== 'CHALLENGE_12345') throw new Error('Falló Test 2');

  console.log('--- TEST 3: Panel Auth Denied (GET /panel sin token) ---');
  res = await fetch('http://localhost:3001/panel');
  console.log('Status:', res.status);
  if (res.status !== 403) throw new Error('Falló Test 3');

  console.log('--- TEST 4: Panel Auth Granted (GET /panel?token=test_token_123) ---');
  res = await fetch('http://localhost:3001/panel?token=test_token_123');
  text = await res.text();
  console.log('Status:', res.status, 'HTML length:', text.length);
  if (res.status !== 200 || !text.includes('Emprende Dulce · Panel de Control')) throw new Error('Falló Test 4');

  console.log('--- TEST 5: Incoming Webhook Message (POST /webhook) ---');
  const metaPayload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: { display_phone_number: '573001234567', phone_number_id: 'PHONE_NUMBER_ID' },
              contacts: [{ profile: { name: 'Maria Gomez' }, wa_id: '573105556677' }],
              messages: [
                {
                  from: '573105556677',
                  id: 'wamid.test_msg_001',
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  text: { body: 'Hola, quiero información del recetario navideño y postres' },
                  type: 'text'
                }
              ]
            },
            field: 'messages'
          }
        ]
      }
    ]
  };

  res = await fetch('http://localhost:3001/webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metaPayload)
  });
  text = await res.text();
  console.log('Status:', res.status, 'Response:', text);
  if (res.status !== 200 || text !== 'EVENT_RECEIVED') throw new Error('Falló Test 5');

  // Esperar procesamiento asíncrono
  await new Promise(r => setTimeout(r, 600));

  const store = require('./src/store');
  const conv = store.obtenerConversacion('573105556677');
  console.log('Mensajes guardados en la conversación:', conv.messages.length);
  console.log('Perfil guardado:', conv.perfil);

  console.log('\n🎉 TODAS LAS PRUEBAS LIVE DEL SERVIDOR Y WEBHOOK FUNCIONARON AL 100%!');
  process.exit(0);
}

testLiveServer().catch(err => {
  console.error('❌ Error en prueba:', err);
  process.exit(1);
});
