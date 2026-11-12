const axios = require('axios');

class WhatsAppService {
  constructor() {
    this.phoneNumberId = process.env.META_PHONE_NUMBER_ID;
    this.accessToken = process.env.META_ACCESS_TOKEN;
    this.apiUrl = `https://graph.facebook.com/v21.0/${this.phoneNumberId}/messages`;
  }

  async sendTextMessage(to, text) {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to,
          type: 'text',
          text: { body: text, preview_url: true }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error(`[WA ERROR] No se pudo enviar mensaje a ${to}:`, error.response?.data || error.message);
      throw error;
    }
  }

  async markAsRead(messageId) {
    try {
      await axios.post(
        this.apiUrl,
        {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (e) {
      // Ignorar errores al marcar leído
    }
  }

  /**
   * Descarga una imagen recibida en WhatsApp usando su mediaId
   * Devuelve un Buffer con los datos binarios de la imagen.
   */
  async downloadMedia(mediaId) {
    try {
      // 1. Obtener la URL temporal del media
      const mediaInfoUrl = `https://graph.facebook.com/v21.0/${mediaId}`;
      const infoRes = await axios.get(mediaInfoUrl, {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      });
      const downloadUrl = infoRes.data.url;

      // 2. Descargar el binario usando la URL obtenida
      const fileRes = await axios.get(downloadUrl, {
        headers: { 'Authorization': `Bearer ${this.accessToken}` },
        responseType: 'arraybuffer'
      });

      return Buffer.from(fileRes.data);
    } catch (error) {
      console.error(`[MEDIA ERROR] Error descargando mediaId ${mediaId}:`, error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new WhatsAppService();
