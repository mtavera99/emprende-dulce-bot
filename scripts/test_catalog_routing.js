const { PRODUCTOS, identificarProducto } = require('../src/productCatalog');

console.log('🧪 INICIANDO PRUEBAS DE ENRUTAMIENTO DE PRODUCTOS Y META AD REFERRALS\n');

let passed = 0;
let total = 0;

function assert(desc, condition) {
  total++;
  if (condition) {
    console.log(`✅ [PASS] ${desc}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${desc}`);
  }
}

// 1. Mensaje con Ad Referral del Video de Moldes (source_id: 120250542591850743)
const res1 = identificarProducto('573138615813', 'Hola, información por favor', {
  referral: {
    source_id: '120250542591850743',
    source_type: 'ad',
    headline: '🧵 +2.000 Moldes en PDF por solo $10.000 COP'
  }
});
assert('Meta Ad ID de Video de Moldes asigna "moldes" incluso con texto genérico ("Hola, información")', res1.producto === 'moldes' && res1.metodo === 'META_AD_ID');

// 2. Mensaje con Ad Referral del Banner Azul (source_id: 120250544614590743)
const res2 = identificarProducto('573138615813', 'Precio', {
  referral: {
    source_id: '120250544614590743',
    source_type: 'ad'
  }
});
assert('Meta Ad ID del Banner Azul asigna "moldes" con texto corto ("Precio")', res2.producto === 'moldes' && res2.adId === '120250544614590743');

// 3. Mensaje con Ad Referral del Poster Taller (source_id: 120250544654690743)
const res3 = identificarProducto('573138615813', 'Buenas tardes', {
  referral: {
    source_id: '120250544654690743',
    source_type: 'ad'
  }
});
assert('Meta Ad ID de Poster Taller asigna "moldes"', res3.producto === 'moldes');

// 4. Mensaje con AdSet ID de Moldes (source_id: 120250544614580743)
const res4 = identificarProducto('573138615813', 'Me interesa', {
  referral: {
    source_id: '120250544614580743'
  }
});
assert('Meta AdSet ID de Moldes asigna "moldes"', res4.producto === 'moldes');

// 5. Mensaje sin referral pero con texto predeterminado de Moldes
const res5 = identificarProducto('573138615813', 'Hola, quiero los +2.000 Moldes de Costura en PDF por $10.000 🧵');
assert('Texto de WhatsApp de Moldes asigna "moldes"', res5.producto === 'moldes' && res5.metodo === 'TEXT_KEYWORD_MOLDES');

// 6. Mensaje de Helados con texto de repostería
const res6 = identificarProducto('573138615813', 'Hola, quiero el recetario de Helados y postres en vaso por $10.000 🍨');
assert('Texto de Helados asigna "helados"', res6.producto === 'helados' && res6.metodo === 'TEXT_KEYWORD_HELADOS');

// 7. Lead previo con producto 'moldes' haciendo una pregunta de seguimiento
const res7 = identificarProducto('573138615813', '¿Cuánto demora en llegar?', null, { producto: 'moldes' });
assert('Lead con historial de "moldes" mantiene "moldes" en preguntas subsecuentes', res7.producto === 'moldes' && res7.metodo === 'LEAD_HISTORY');

// 8. Mensaje genérico sin historial ni referral (Fallback por defecto a Helados)
const res8 = identificarProducto('573138615813', 'Hola');
assert('Mensaje totalmente vacío/genérico hace fallback seguro a "helados"', res8.producto === 'helados' && res8.metodo === 'DEFAULT');

console.log(`\n🏁 RESULTADO FINAL: ${passed} / ${total} pruebas pasadas con éxito.`);
if (passed === total) {
  console.log('🎉 ¡TODAS LAS PRUEBAS PASARON AL 100%! El bot nunca confundirá los productos.');
  process.exit(0);
} else {
  process.exit(1);
}
