# 🛡️ GUÍA DE ACTIVACIÓN: VERIFICACIÓN AUTOMÁTICA DE PAGOS (NEQUI / DAVIPLATA)

Este sistema evita que te estafen con capturas de pantalla falsas generadas en internet. Funciona cruzando la foto que envía el cliente contra las notificaciones bancarias reales de tu cuenta.

El bot ya tiene listo el receptor seguro en Render:
* **URL del Webhook:** `https://emprende-dulce-bot.onrender.com/api/payment-notification`
* **Clave de Seguridad (Header):** `x-api-key: dulce_pay_secret_2026`

Tienes **3 formas** de ponerlo a funcionar. Elige la que prefieras:

## ¿Por qué el correo no sirve para Nequi personal?
Nequi **NUNCA envía correos electrónicos** por transferencias ordinarias entre cuentas (P2P de celular a celular). Nequi únicamente emite **notificaciones Push en la pantalla de tu celular** y en la campanita de la app. Por esta razón, el método 100% automatizado en Colombia para cuentas personales de Nequi y Daviplata es reenviar las notificaciones Push mediante **MacroDroid**.

---

## MÉTODO 1: App Gratuita MacroDroid (El método 100% automático para Nequi y Daviplata)

Si tienes un celular Android donde está instalado Nequi o Daviplata (incluso un celular secundario que dejes conectado al Wi-Fi):

1. Instala la app gratuita **MacroDroid** desde Google Play Store.
2. Abre MacroDroid y toca en **"Añadir macro"**.
3. **Disparador (Trigger - Cuadro Rojo):**
   * Toca el `+` -> **Eventos de dispositivo** -> **Notificación** -> **Notificación recibida**.
   * Selecciona: **Seleccionar aplicación(es)**.
   * Marca en la lista: **Nequi** y **DaviPlata**.
   * En "Contenido del texto", deja seleccionado **Cualquiera** -> Aceptar.
4. **Acción (Action - Cuadro Azul):**
   * Toca el `+` -> **Conectividad** -> **Solicitud HTTP**.
   * **Método:** `POST`
   * **URL:** `https://emprende-dulce-bot.onrender.com/api/payment-notification`
   * **Encabezados (Headers):**
     * Añade Header 1: Nombre `Content-Type`, Valor `application/json`
     * Añade Header 2: Nombre `x-api-key`, Valor `dulce_pay_secret_2026`
   * **Cuerpo del contenido (Body):**
     * Selecciona formato `Texto / JSON` y pega exactamente esto:
     ```json
     {"text": "[notif_title] - [notif_message]"}
     ```
   * Guarda la acción.
5. Ponle de nombre a la macro `Notificaciones Nequi Bot` y dale **Guardar**.
6. **¡Listo!** Cada vez que alguien te transfiera a Nequi o Daviplata, tu celular reenviará la alerta al bot en 1 segundo. Cuando el cliente mande el comprobante a WhatsApp, el bot lo cruza automáticamente y le entrega los libros sin que tú toques el celular.

---

## OPCIÓN 2: Google Apps Script en Gmail (100% en la Nube - Sin apps en el celular)

Si Nequi te envía correos a `mtavera99@gmail.com` cada vez que recibes dinero:

1. Entra desde tu computador a [script.google.com](https://script.google.com) con tu cuenta `mtavera99@gmail.com`.
2. Haz clic en **"Nuevo proyecto"**.
3. Pega este código:

```javascript
function reenviarAlertasNequi() {
  const query = 'from:(nequi.com.co OR bancolombia.com) "transfirieron" is:unread';
  const threads = GmailApp.search(query, 0, 5);
  
  for (const thread of threads) {
    const messages = thread.getMessages();
    for (const msg of messages) {
      if (msg.isUnread()) {
        const bodyText = msg.getPlainBody();
        const payload = {
          text: msg.getSubject() + " " + bodyText,
          sender: msg.getFrom()
        };
        
        UrlFetchApp.fetch('https://emprende-dulce-bot.onrender.com/api/payment-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'dulce_pay_secret_2026'
          },
          payload: JSON.stringify(payload),
          muteHttpExceptions: true
        });
        
        msg.markRead();
      }
    }
  }
}
```

4. Haz clic en el ícono del **Reloj (Activadores / Triggers)** a la izquierda.
5. Añadir activador -> Función `reenviarAlertasNequi` -> Fuente del evento: **Basado en tiempo** -> Cada **1 minuto**.
6. **¡Listo!** Google revisará tu correo 24/7 en sus propios servidores y le avisará al bot cada vez que te paguen, incluso si tu celular está apagado.

---

## OPCIÓN 3: Validación Asistida en el Panel Web (Activa desde YA sin configurar nada)

Si vas a prender la pauta hoy mismo y prefieres no configurar MacroDroid todavía:

1. El cliente ve el anuncio, escribe al WhatsApp y manda la foto de la transferencia.
2. El bot la recibe, ejecuta la visión artificial (OCR) para leer la referencia y el monto, y registra el pedido en tu panel:
   * **Panel:** `https://emprende-dulce-bot.onrender.com/panel?token=dulce_panel_1023979300_2026#pendientes`
3. Abres el panel desde tu celular o computador, ves la captura del comprobante y lo que leyó la IA.
4. Presionas el botón verde **"✅ Aprobar y Entregar"**.
5. Al instante, el bot le manda automáticamente por WhatsApp el mensaje de felicitación, el link permanente de Google Drive y los 3 bonos de regalo.
