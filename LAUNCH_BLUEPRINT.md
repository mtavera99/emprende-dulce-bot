# 🚀 BLUEPRINT DE LANZAMIENTO: OPERACIÓN LOW TICKET X1 EN 24 HORAS
### *De 0 a 100+ ventas diarias con WhatsApp Bot y Nequi en Colombia*

---

## FASE 1: PREPARACIÓN DE ACTIVOS DIGITALES (HOY MISMO)

### 1. Alojar los Productos en Google Drive:
1. Abre tu Google Drive y crea una carpeta principal llamada: `Emprende Dulce - Acceso Alumnos VIP`.
2. Dentro de esa carpeta, sube los archivos creados en `/products`:
   * `01_Helados_Artesanales_Guia_Maestra.md` (o en PDF).
   * `02_Postres_en_Vaso_Para_Emprender.md` (o en PDF).
   * `Bono_01_Calculadora_Costos_y_Precios.html` (los alumnos le dan doble clic y abre en su navegador).
   * `Bono_02_Directorio_Proveedores_Colombia.md`.
   * `Bono_03_Guia_Ventas_WhatsApp_Postres.md`.
3. Haz clic derecho en la carpeta principal de Drive -> **Compartir** -> Acceso general: **"Cualquier persona con el enlace puede ser lector"** -> Copia ese enlace.
4. Pega ese enlace en la variable `GOOGLE_DRIVE_LINK` de tu archivo `.env`.

---

## FASE 2: EL BOT EN RENDER Y NÚMERO DE WHATSAPP (MAÑANA)

### 1. Por qué creamos un servicio independiente (No mezclar con Novika):
* Tu bot `novika-bot` maneja logística física (Interrapidísimo, contraentrega, base de datos compleja).
* Este nuevo bot `lowticket-bot` es un microservicio ultra liviano dedicado 100% a:
  1. Recibir prospectos de pauta.
  2. Enviar el pitch de \$10.000 COP y datos de Nequi.
  3. Validar con Inteligencia Artificial (Visión OCR) el pantallazo del pago.
  4. Entregar el link de Google Drive.
  5. Ofrecer el Order Bump de \$5.000 COP.
* Al ser independiente en Render, no hay riesgo de alterar tus clientes de Novika ni de BikerPro.

### 2. Pasos para conectar el nuevo número en Meta:
1. Cuando compres la nueva línea mañana, regístrala en la app de Meta for Developers:
   * Ve a [Meta for Developers](https://developers.facebook.com/apps/1674014744079330/whatsapp-business/wa-configurations-v2/?business_id=2320254758771368).
   * En tu WhatsApp Business Account, agrega el nuevo número de teléfono mediante SMS o llamada.
   * Meta te entregará un **`Phone Number ID`** exclusivo para esa línea.
2. En Render:
   * Crea un nuevo **Web Service** conectado a este repositorio `lowticket-bot`.
   * En "Environment Variables", agrega:
     * `META_PHONE_NUMBER_ID`: El ID del nuevo número.
     * `META_ACCESS_TOKEN`: Tu token de usuario del sistema (el mismo que ya tienes funcionando).
     * `META_VERIFY_TOKEN`: `lowticket_verify_token_2026`.
     * `NEQUI_NUMERO`: Tu número de Nequi / Daviplata donde recibirás la plata.
     * `NEQUI_TITULAR`: Tu nombre completo (para que la IA valide el comprobante).
     * `GOOGLE_DRIVE_LINK`: Tu enlace de Google Drive.
     * `OPENAI_API_KEY`: Tu clave de OpenAI para la visión artificial (o modo simulación).
3. Configurar el Webhook en Meta:
   * En la configuración de WhatsApp en Meta Developers, pon la URL de Render: `https://tu-servicio-en-render.onrender.com/webhook`.
   * Verify token: `lowticket_verify_token_2026`.
   * Suscríbete al campo `messages`.

---

## FASE 3: AISLAMIENTO DE CUENTA COMERCIAL Y FANPAGE EN META

Para no poner en riesgo la cuenta principal de Novika/BikerPro:
1. **Crea una Fanpage nueva (Página de Facebook):**
   * Nombre sugerido: `Emprende Dulce Colombia` o `Academia Emprende Dulce`.
   * Categoría: *Educación / Creador digital*.
   * Foto de perfil: Un logo bonito de un postre/helado (generado con Canva o IA).
   * Vincula el nuevo número de WhatsApp Business a esta Fanpage.
2. **Cuenta Publicitaria:**
   * Puedes usar una cuenta de anuncios secundaria dentro de tu Business Manager (`business_id=2320254758771368`) o tu cuenta habitual, pero seleccionando como identidad la nueva Fanpage.
   * Así, ante los ojos del público y los algoritmos de Meta, la marca es completamente nueva e independiente.

---

## FASE 4: MONTAJE DE LA CAMPAÑA EN META ADS MANAGER

1. **Objetivo:** *Interacción* -> Seleccionar *Apps de mensajería* (WhatsApp).
2. **Número de destino:** Seleccionar el nuevo número de WhatsApp vinculado a la Fanpage.
3. **Público:**
   * Lugar: Colombia.
   * Edad: 24 a 60 años.
   * Sexo: Mujeres (o Todos).
   * Segmentación: **Abierta / Broad** (Cero intereses seleccionados). El algoritmo de Meta busca compradores automáticamente gracias al texto del anuncio.
4. **Anuncio:**
   * Texto principal: Usa el **Copy 1** de `creatives/ANUNCIOS_Y_COPIES_GANADORES.md`.
   * Mensaje de inicio predeterminado en WhatsApp:
     > *"Hola, vi la promoción en Facebook y quiero la oferta de Helados y Postres por $10.000 COP 🍨"*
   * Presupuesto: \$30.000 a \$40.000 COP diarios para empezar.

---

## FASE 5: LA MÁQUINA DE VENTAS (DÍA A DÍA)

* El prospecto ve el anuncio -> Toca el botón de WhatsApp.
* Tu bot responde en menos de 2 segundos con el desglose del producto y el número de Nequi.
* El cliente transfiere \$10.000 por Nequi y envía el pantallazo al chat.
* La IA lee el pantallazo, confirma el dinero y envía automáticamente el enlace de Google Drive.
* El bot le ofrece el Order Bump de \$5.000 COP por el pack navideño.
* **Tú solo revisas el saldo de Nequi multiplicándose.**
