const store = require('./src/store');
const panel = require('./src/panel');
const panelChat = require('./src/panel-chat');

console.log('1. Probando store...');
console.log(' - Directorio de datos:', store.getDir());
console.log(' - Disco persistente:', store.esDiscoPersistente());
console.log(' - Panel token:', panel.panelToken());

console.log('2. Registrando lead y pedido...');
const testPhone = '573009998877';
store.saveLead(testPhone, { status: 'INTERESADO', step: 'PITCH_ENVIADO' });
store.crearPedido(testPhone, { amount: 10000, status: 'PENDIENTE' });
store.agregarMensaje(testPhone, { from: 'cliente', text: 'Hola, me interesa el pack de helados y postres' });
store.agregarMensaje(testPhone, { from: 'bot', text: '¡Hola! Te presento la colección Emprende Dulce 2026...' });

console.log('3. Métricas actuales:');
console.log(store.metricas());

console.log('4. Generando HTML del panel...');
const html = panel.render();
console.log(' - Panel generado con éxito:', html.length, 'bytes');

console.log('5. Generando HTML del chat individual...');
const chatHtml = panelChat.renderChat(testPhone);
console.log(' - Chat generado con éxito:', chatHtml.length, 'bytes');

console.log('✅ TODAS LAS PRUEBAS PASARON EXITOSAMENTE!');
process.exit(0);
