# CONTEXTO INTEGRAL: LANZAMIENTO MODELO LOW-TICKET DIGITAL (INFOPRODUCTOS & WHATSAPP)

Hola Kiro (Claude Opus 5.5). Eres el Director Creativo y Estratega de Producto Digital de esta operación. 

Hemos completado una investigación forense exhaustiva sobre el modelo de negocio digital de venta masiva de infoproductos de bajo costo (Low Ticket) en Colombia y Latinoamérica (el mismo modelo que operan figuras como @soykevinuv_ y marcas con anuncios perennes en Meta Ads Library como Formativa360). 

A continuación tienes todo el contexto de lo descubierto, los activos técnicos que ya dejamos construidos y las tareas prioritarias en las que necesitamos tu máxima capacidad analítica y creativa.

---

## 1. El Diagnóstico del Modelo de Negocio (Forensic Analysis)

1. **La Falla de Hotmart en Low-Ticket:**
   - En Hotmart, para un producto de $10.000 COP (~$2.50 USD), la pasarela retiene entre 35% y 40% en comisiones fijas y porcentuales, los retiros tienen costos adicionales y el checkout con tarjeta/efecty tiene una tasa de abandono del 70%.
2. **El "Método Secreto" de Alta Rentabilidad (WhatsApp + Nequi Directo):**
   - Tráfico pagado desde Meta Ads (Click-to-WhatsApp) segmentado en Colombia.
   - Las personas escriben a un WhatsApp comercial con un mensaje predeterminado: *"Hola, quiero la oferta del Pack Emprende Dulce por $10.000 COP"*.
   - Un bot automatizado presenta la oferta irresistible, responde dudas y envía el QR / número de Nequi y Daviplata.
   - **Comisión de pasarela:** 0%.
   - **Liquidez:** Instantánea al celular.
   - **Tasa de conversión en chat:** 25% a 40% (4x a 6x mayor que una página web tradicional).
3. **Automatización con Visión Artificial (OCR):**
   - El cliente envía la captura de pantalla de su transferencia por Nequi.
   - Una IA de visión (OpenAI GPT-4o-mini o Gemini Flash) audita la imagen en segundos: extrae valor transferido ($10.000), número de cuenta destino, fecha y número de referencia.
   - Si es válido, el bot entrega inmediatamente el enlace de descarga de los PDFs y bonos.
4. **Order Bump Inmediato (Incremento del Ticket Promedio):**
   - Exactamente 3 segundos después de entregar el pack principal, el bot envía una oferta relámpago complementaria por $5.000 COP (ej. *Recetario Navideño de Postres o Guía de Salsas Gourmet*). 
   - Entre 20% y 35% de los compradores transfieren los $5.000 adicionales, elevando el ticket promedio a $15.000 COP con **0 costo marginal**.

---

## 2. Lo que ya Construimos y dejamos Listo en Código e Infraestructura

Hemos preparado toda la base técnica y operativa en el entorno local (`/Users/santiagotavera/Desktop/Trabajos/lowticket-bot/`):

1. **Infoproductos y Bonos Compilados (Adjuntos en esta sesión):**
   - `01_Helados_Artesanales_Guia_Maestra.pdf`: Fórmulas base cremosas sin máquina heladera, 5 sabores comerciales y paletas rellenas.
   - `02_Postres_en_Vaso_Para_Emprender.pdf`: Postres individuales en domo PET de 7 oz (3 Leches tradicional, Pie de limón sin horno, Tiramisú exprés, Fresas con crema gourmet).
   - `03_Remedios_Naturales_Ancestrales_Salud.pdf`: Fórmulas alternativas para regulación de glucosa, digestión y presión arterial.
   - `Bono_01_Calculadora_Costos_y_Precios.html`: Calculadora interactiva en JavaScript para celular y PC que calcula costo unitario de ingredientes y precio de venta con 70% de margen neto.
   - `Bono_02_Directorio_Proveedores_Colombia.pdf`: Directorio mayorista de envases e insumos en Medellín, Bogotá y Cali.
   - `Bono_03_Guia_Ventas_WhatsApp_Postres.pdf`: Guía de comercialización por estados de WhatsApp y cajas mixtas.
   - `Emprende_Dulce_Pack_Completo_2026.zip`: Bundle listo para alojamiento y descarga.
2. **Página de Facebook Creada con Branding Profesional:**
   - **Nombre:** `Emprende Dulce Colombia` (ID: `61596126466400`).
   - Foto de portada y avatar de heladería artesanal boutique generados en alta resolución y publicados.
3. **Cuenta Publicitaria Meta Creada y Blindada:**
   - **Nombre:** `Emprende Dulce Ads` (ID: `1136356202211956`).
   - Moneda: **COP (Pesos Colombianos)** | Zona Horaria: **America/Bogota (GMT-05:00)**.
   - Totalmente desacoplada de la cuenta de e-commerce físico de contraentrega (`Novika`) para evitar contaminación de píxeles o contingencias.
4. **Bot de WhatsApp Independiente (`lowticket-bot`):**
   - Servidor Node.js / Express con Webhook de Meta Cloud API (`lowticket_verify_token_2026`).
   - Pipeline de visión artificial con prompt para OCR de recibos bancarios.
   - Máquina de estados de conversación con entrega automática y order bump retardado.

---

## 3. Tus Objetivos y Misión como Claude Opus 5.5 en Kiro

Queremos que tomes el control de la calidad de producto, la persuasión comercial y la escalabilidad de este ecosistema:

### Objetivo 1: Elevar los PDFs a Nivel Editorial Premium
- Revisa los PDFs adjuntos. Queremos enriquecerlos a fondo:
  - Añadir paso a paso detallado, secretos de reposteros para evitar cristalización en frío, tablas de rendimiento exacto por porción y costeo comercial en pesos colombianos.
  - Generar versiones en código (HTML/CSS o Markdown estructurado) que podamos compilar a PDF con diseño digno de una editorial gourmet de $50 USD, pero vendido a $10.000 COP para generar un efecto *WOW* que elimine cualquier reembolso y genere recompra.

### Objetivo 2: Creativos y Estrategia Publicitaria Ganadora (Meta Ads)
- Diseñar 5 guiones de video en formato UGC (User Generated Content) de 30-45 segundos para Reels/TikTok, diseñados para Click-to-WhatsApp:
  - Gancho disruptivo (0-3 segundos).
  - Problema/Empatía (3-15 segundos).
  - Demostración visual del producto y facilidad de emprender desde casa (15-30 segundos).
  - Llamado a la acción irresistible: *"Escribe por WhatsApp y recibe el pack completo + 3 bonos por solo $10.000 COP hoy"* (30-45 segundos).
- Redactar los Copies definitivos para Meta Ads con ángulos emocionales probados (madres cabeza de hogar, ingresos extra de fin de semana, desempleados o amantes de la repostería).

### Objetivo 3: Optimización del Funnel de WhatsApp y Order Bumps
- Pulir los copys de venta del bot para que el cierre sea 100% natural, amigable y transmita máxima confianza.
- Definir 2 nuevos Order Bumps y Upsells de $5.000 COP y $15.000 COP para testear.
- Diseñar la secuencia de seguimiento (retargeting en frío por chat) para las personas que piden información pero no transfieren en las primeras 2 horas.

Por favor, confirma que has recibido todo el contexto y los archivos adjuntos, y preséntame tu análisis inicial y tu propuesta de trabajo paso a paso para arrancar.
