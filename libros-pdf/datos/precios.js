// ============================================================================
// CATÁLOGO ÚNICO DE PRECIOS — Emprende Dulce
// ----------------------------------------------------------------------------
// Todos los costeos de los tres libros salen de este archivo. Si cambias un
// precio aquí y vuelves a compilar (npm run build), se actualizan solas todas
// las tablas de costos, márgenes y resúmenes.
//
// Precios de REFERENCIA en COP, supermercado de cadena / distribuidor de
// repostería en ciudad principal, noviembre de 2026. Verifícalos en tu ciudad.
//   cantidad: tamaño de la presentación que compras (en la unidad indicada)
//   unidad:   'g' | 'ml' | 'un'
//   precio:   lo que pagas por esa presentación
// ============================================================================

const ingredientes = {
  // --- Lácteos -------------------------------------------------------------
  crema_batir:     { nombre: 'Crema de leche para batir 35% grasa', cantidad: 1000, unidad: 'ml', precio: 27000 },
  crema_vegetal:   { nombre: 'Crema vegetal para batir (tipo chantilly)', cantidad: 1000, unidad: 'ml', precio: 17000 },
  condensada:      { nombre: 'Leche condensada', cantidad: 420, unidad: 'g', precio: 11500 },
  evaporada:       { nombre: 'Leche evaporada', cantidad: 400, unidad: 'g', precio: 7500 },
  leche_entera:    { nombre: 'Leche entera', cantidad: 1100, unidad: 'ml', precio: 4800 },
  leche_polvo:     { nombre: 'Leche en polvo entera', cantidad: 380, unidad: 'g', precio: 16500 },
  queso_crema:     { nombre: 'Queso crema', cantidad: 400, unidad: 'g', precio: 14500 },
  mantequilla:     { nombre: 'Mantequilla sin sal', cantidad: 250, unidad: 'g', precio: 10500 },
  arequipe:        { nombre: 'Arequipe', cantidad: 500, unidad: 'g', precio: 11500 },
  queso_costeno:   { nombre: 'Queso costeño', cantidad: 500, unidad: 'g', precio: 13000 },
  leche_coco:      { nombre: 'Leche de coco en lata', cantidad: 400, unidad: 'ml', precio: 9000 },

  // --- Secos y endulzantes -------------------------------------------------
  azucar:          { nombre: 'Azúcar blanca', cantidad: 1000, unidad: 'g', precio: 4800 },
  azucar_glass:    { nombre: 'Azúcar glass (pulverizada)', cantidad: 500, unidad: 'g', precio: 6000 },
  panela:          { nombre: 'Panela', cantidad: 500, unidad: 'g', precio: 3200 },
  glucosa:         { nombre: 'Glucosa líquida (jarabe de glucosa)', cantidad: 500, unidad: 'g', precio: 9000 },
  harina:          { nombre: 'Harina de trigo', cantidad: 1000, unidad: 'g', precio: 4900 },
  fecula_maiz:     { nombre: 'Fécula de maíz', cantidad: 380, unidad: 'g', precio: 7500 },
  almidon_yuca:    { nombre: 'Almidón de yuca', cantidad: 500, unidad: 'g', precio: 5000 },
  polvo_hornear:   { nombre: 'Polvo de hornear', cantidad: 100, unidad: 'g', precio: 3500 },
  gelatina:        { nombre: 'Gelatina sin sabor', cantidad: 25, unidad: 'g', precio: 3500 },
  arroz:           { nombre: 'Arroz blanco', cantidad: 1000, unidad: 'g', precio: 4500 },
  sal:             { nombre: 'Sal', cantidad: 500, unidad: 'g', precio: 1800 },
  coco_rallado:    { nombre: 'Coco rallado deshidratado', cantidad: 200, unidad: 'g', precio: 7000 },
  pasas:           { nombre: 'Uvas pasas', cantidad: 250, unidad: 'g', precio: 7000 },
  frutas_confitadas:{ nombre: 'Frutas confitadas picadas', cantidad: 250, unidad: 'g', precio: 9000 },
  mani_mantequilla:{ nombre: 'Mantequilla de maní', cantidad: 340, unidad: 'g', precio: 14000 },

  // --- Chocolate, café, aromas --------------------------------------------
  cacao:           { nombre: 'Cacao en polvo 100% sin azúcar', cantidad: 200, unidad: 'g', precio: 11000 },
  chocolate:       { nombre: 'Chocolate de cobertura semiamargo', cantidad: 500, unidad: 'g', precio: 21000 },
  chocolate_blanco:{ nombre: 'Chocolate blanco de cobertura', cantidad: 500, unidad: 'g', precio: 23000 },
  chispas:         { nombre: 'Chispas de chocolate', cantidad: 200, unidad: 'g', precio: 7500 },
  cafe:            { nombre: 'Café instantáneo', cantidad: 85, unidad: 'g', precio: 13500 },
  vainilla:        { nombre: 'Esencia de vainilla', cantidad: 250, unidad: 'ml', precio: 4500 },
  canela:          { nombre: 'Canela (astillas o molida)', cantidad: 50, unidad: 'g', precio: 5000 },
  clavos:          { nombre: 'Clavos de olor', cantidad: 10, unidad: 'g', precio: 2000 },
  jengibre:        { nombre: 'Jengibre molido', cantidad: 20, unidad: 'g', precio: 3500 },
  ron:             { nombre: 'Ron', cantidad: 375, unidad: 'ml', precio: 24000 },
  vino:            { nombre: 'Vino tinto de cocina', cantidad: 750, unidad: 'ml', precio: 16000 },
  grajeas:         { nombre: 'Grajeas / sprinkles navideños', cantidad: 100, unidad: 'g', precio: 4000 },

  // --- Galletas y crocantes ------------------------------------------------
  galleta_ducales: { nombre: 'Galletas tipo saltín dulce (Ducales)', cantidad: 294, unidad: 'g', precio: 7500 },
  galleta_maria:   { nombre: 'Galletas tipo María', cantidad: 400, unidad: 'g', precio: 7000 },
  galleta_choco:   { nombre: 'Galletas de chocolate rellenas (tipo sándwich)', cantidad: 400, unidad: 'g', precio: 10000 },
  soletas:         { nombre: 'Galletas soletas (de huevo)', cantidad: 200, unidad: 'g', precio: 6500 },
  barquillos:      { nombre: 'Barquillos', cantidad: 100, unidad: 'g', precio: 4000 },

  // --- Frescos -------------------------------------------------------------
  huevos:          { nombre: 'Huevos AA', cantidad: 30, unidad: 'un', precio: 18000 },
  fresas:          { nombre: 'Fresas', cantidad: 1000, unidad: 'g', precio: 10000 },
  moras:           { nombre: 'Moras de Castilla', cantidad: 1000, unidad: 'g', precio: 7000 },
  pulpa_maracuya:  { nombre: 'Pulpa de maracuyá (congelada, sin azúcar)', cantidad: 500, unidad: 'g', precio: 7000 },
  limones:         { nombre: 'Limón Tahití', cantidad: 1000, unidad: 'g', precio: 4500 },
  mango_biche:     { nombre: 'Mango verde (biche)', cantidad: 1000, unidad: 'g', precio: 5000 },
  banano:          { nombre: 'Banano maduro', cantidad: 1000, unidad: 'g', precio: 4000 },
  brevas:          { nombre: 'Brevas frescas', cantidad: 1000, unidad: 'g', precio: 8000 },
  bocadillo:       { nombre: 'Bocadillo de guayaba', cantidad: 360, unidad: 'g', precio: 5500 },
  aceite:          { nombre: 'Aceite vegetal', cantidad: 1000, unidad: 'ml', precio: 9500 },
};

// Empaques y materiales, costo POR UNIDAD (precio mayorista por caja/paquete).
const empaques = {
  vaso7:         { nombre: 'Vaso PET 7 oz + tapa domo', precio: 320 },
  vaso5:         { nombre: 'Vaso 5 oz + tapa (helado)', precio: 260 },
  tarrina1l:     { nombre: 'Tarrina 1 L con tapa (helado)', precio: 1100 },
  tarrina500:    { nombre: 'Tarrina 500 ml con tapa (helado)', precio: 700 },
  cuchara:       { nombre: 'Cuchara plástica', precio: 60 },
  sticker:       { nombre: 'Sticker vinilo laminado', precio: 120 },
  palito:        { nombre: 'Palito de madera', precio: 60 },
  bolsa_paleta:  { nombre: 'Bolsa para paleta', precio: 50 },
  capacillo:     { nombre: 'Capacillo / pirotín', precio: 30 },
  bolsa_celofan: { nombre: 'Bolsa celofán con cinta', precio: 150 },
  frasco:        { nombre: 'Frasco de vidrio 250 ml con tapa', precio: 2200 },
  caja4:         { nombre: 'Caja kraft con visor (4 vasos)', precio: 2800 },
  caja_mini:     { nombre: 'Caja kraft pequeña con visor', precio: 1800 },
  caja_mediana:  { nombre: 'Caja regalo mediana con tapa', precio: 4500 },
  caja_grande:   { nombre: 'Caja regalo grande rígida', precio: 9000 },
  relleno:       { nombre: 'Papel seda / viruta de relleno', precio: 400 },
  cinta:         { nombre: 'Cinta o rafia (50 cm)', precio: 300 },
  tarjeta:       { nombre: 'Tarjeta impresa', precio: 250 },
  molde_torta:   { nombre: 'Molde de aluminio individual con tapa', precio: 700 },
  bolsa_buñuelo: { nombre: 'Bolsa de papel antigrasa', precio: 120 },
};

// Costos indirectos: gas, energía, agua, detergente, servilletas, mermas.
// Se suman como porcentaje sobre la materia prima de cada receta.
const factorIndirectos = 0.10;

module.exports = { ingredientes, empaques, factorIndirectos, fechaPrecios: 'noviembre de 2026' };
