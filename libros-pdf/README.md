# Emprende Dulce · Libros editoriales

Fuente de los tres libros del pack y sistema para compilarlos a PDF.

| Libro | Archivo PDF | Páginas |
|---|---|---|
| Helados Artesanales Sin Máquina | `dist/pdf/01_Helados_Artesanales_Guia_Maestra.pdf` | 32 |
| Postres en Vaso para Emprender | `dist/pdf/02_Postres_en_Vaso_Para_Emprender.pdf` | 34 |
| Recetario Navideño de Postres y Cajas Regalo | `dist/pdf/03_Recetario_Navideno_Postres_y_Cajas_Regalo.pdf` | 30 |

La calculadora corregida (Bono 01) está en `bonos/Bono_01_Calculadora_Costos_y_Precios.html` y viene cargada con el Tres Leches del libro 02. Sus cifras coinciden con las del libro.

## Estructura

```
datos/precios.js     Catálogo ÚNICO de precios de ingredientes y empaques
libros/*.js          Contenido de cada libro (texto, recetas, cajas)
src/costeo.js        Cálculo de costos, márgenes y cajas
src/plantilla.js     Convierte un libro en HTML
src/estilos.css      Diseño editorial para impresión (tamaño carta)
src/build.js         Compila HTML y PDF
src/verificar.js     Revisa que cada receta quepa en sus páginas
fotos/               (opcional) fotos de producto, ver abajo
dist/                Salida: html/ y pdf/
```

## Compilar

Requiere Node 18+ y Google Chrome instalado.

```bash
npm install
npm run build          # los tres libros
npm run build:helados  # solo uno
node src/verificar.js  # después de editar recetas
```

Para usar otro Chrome/Chromium: `CHROME_PATH=/ruta/al/chrome npm run build`.
En contenedores Linux puede hacer falta `CHROME_SINGLE_PROCESS=1`.

## Actualizar precios

Edita `datos/precios.js` y vuelve a compilar. Todas las tablas de costeo, márgenes, resúmenes y cajas regalo se recalculan solas. El precio de venta de cada receta está en su campo `precioVenta` dentro de `libros/*.js`.

## Agregar fotos

Pon una foto con el `id` de la receta como nombre en `fotos/` (por ejemplo `fotos/tres-leches.jpg`, `fotos/caja-ejecutiva.jpg`) y recompila. Aparece automáticamente en la cabecera de la receta. Si una receta con foto deja de caber en su página, `src/verificar.js` lo indica.

## Tipografía

El diseño usa Playfair Display (títulos) e Inter (texto) si están instaladas (gratis en Google Fonts), o Georgia y Helvetica como alternativa. Los PDF de `dist/` se compilaron en un entorno que solo tenía Noto Sans, así que los títulos salieron en esa fuente. Para la versión final, instala las dos fuentes y vuelve a compilar.
