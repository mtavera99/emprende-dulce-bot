class WhatsAppService {
  getPhoneNumberId() {
    return process.env.META_PHONE_NUMBER_ID || '';
  }

  getAccessToken() {
    return process.env.META_ACCESS_TOKEN || '';
  }

  getApiUrl() {
    return `https://graph.facebook.com/v21.0/${this.getPhoneNumberId()}/messages`;
  }

  getConfigured() {
    return !!(this.getPhoneNumberId() && this.getAccessToken());
  }

  async sendTextMessage(to, text) {
    if (!this.getConfigured()) {
      console.warn(`[WA DEV] Simulación envío texto a ${to} (sin META_ACCESS_TOKEN): ${text.slice(0, 80)}...`);
      return { messages: [{ id: `wamid.sim_${Date.now()}` }] };
    }

    try {
      const res = await fetch(this.getApiUrl(), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: String(to).replace(/\D/g, ''),
          type: 'text',
          text: { body: text, preview_url: true }
        })
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`Meta HTTP ${res.status}: ${errText.slice(0, 200)}`);
      }
      return await res.json();
    } catch (error) {
      console.error(`[WA ERROR] No se pudo enviar texto a ${to}:`, error.message);
      throw error;
    }
  }

  async sendTemplate(to, templateName, languageCode = 'es', components = []) {
    if (!this.getConfigured()) {
      console.warn(`[WA DEV] Simulación envío template ${templateName} a ${to}`);
      return { messages: [{ id: `wamid.sim_${Date.now()}` }] };
    }

    try {
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: String(to).replace(/\D/g, ''),
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode }
        }
      };
      if (components && components.length > 0) {
        payload.template.components = components;
      }

      const res = await fetch(this.getApiUrl(), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`Meta Template HTTP ${res.status}: ${errText.slice(0, 250)}`);
      }
      return await res.json();
    } catch (error) {
      console.error(`[WA ERROR] No se pudo enviar template ${templateName} a ${to}:`, error.message);
      throw error;
    }
  }

  async sendImage(to, imageUrl, caption = '') {
    if (!this.getConfigured()) {
      console.warn(`[WA DEV] Simulación envío imagen a ${to}: ${imageUrl}`);
      return { messages: [{ id: `wamid.sim_${Date.now()}` }] };
    }

    try {
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: String(to).replace(/\D/g, ''),
        type: 'image',
        image: { link: imageUrl }
      };
      if (caption) payload.image.caption = caption;

      const res = await fetch(this.getApiUrl(), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`Meta HTTP ${res.status}: ${errText.slice(0, 200)}`);
      }
      return await res.json();
    } catch (error) {
      console.error(`[WA ERROR] No se pudo enviar imagen a ${to}:`, error.message);
      throw error;
    }
  }

  async sendDocument(to, documentUrl, filename, caption = '') {
    if (!this.getConfigured()) {
      console.warn(`[WA DEV] Simulación envío documento a ${to}: ${filename}`);
      return { messages: [{ id: `wamid.sim_${Date.now()}` }] };
    }

    try {
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: String(to).replace(/\D/g, ''),
        type: 'document',
        document: {
          link: documentUrl,
          filename: filename
        }
      };
      if (caption) payload.document.caption = caption;

      const res = await fetch(this.getApiUrl(), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`Meta HTTP ${res.status}: ${errText.slice(0, 200)}`);
      }
      return await res.json();
    } catch (error) {
      console.error(`[WA ERROR] No se pudo enviar documento a ${to}:`, error.message);
      throw error;
    }
  }

  async sendButtons(to, bodyText, buttons = []) {
    // Si Meta no acepta los botones se manda el texto; se agregan las opciones para responder con el número
    const conOpciones = /responde \*?1\*?/i.test(bodyText) || !buttons.length ? bodyText
      : `${bodyText}\n\n${buttons.slice(0, 3).map((b, i) => `*${i + 1}* ${b.title}`).join('   ')}\n_Responde con el número de la opción._`;
    if (!this.getConfigured()) {
      console.warn(`[WA DEV] Simulación botones a ${to}: ${buttons.map(b => b.title).join(', ')}`);
      return { messages: [{ id: `wamid.sim_${Date.now()}` }] };
    }

    try {
      const formattedButtons = buttons.slice(0, 3).map((b, idx) => ({
        type: 'reply',
        reply: {
          id: b.id || `btn_${idx}_${Date.now()}`,
          title: b.title.slice(0, 20)
        }
      }));

      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: String(to).replace(/\D/g, ''),
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: bodyText },
          action: { buttons: formattedButtons }
        }
      };

      const res = await fetch(this.getApiUrl(), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        return await this.sendTextMessage(to, conOpciones);
      }
      return await res.json();
    } catch (error) {
      return await this.sendTextMessage(to, conOpciones);
    }
  }

  async markAsRead(messageId) {
    if (!this.getConfigured() || !messageId) return;
    try {
      await fetch(this.getApiUrl(), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId
        })
      });
    } catch (e) {}
  }

  async downloadMedia(mediaId) {
    if (!this.getConfigured()) {
      throw new Error('Falta META_ACCESS_TOKEN para descargar medios de WhatsApp');
    }

    try {
      const mediaInfoUrl = `https://graph.facebook.com/v21.0/${mediaId}`;
      const infoRes = await fetch(mediaInfoUrl, {
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`,
          'User-Agent': 'curl/7.64.1'
        }
      });
      if (!infoRes.ok) throw new Error(`Meta Media Info Error ${infoRes.status}`);
      const infoData = await infoRes.json();
      const downloadUrl = infoData.url;
      const mimeType = infoData.mime_type;

      const fileRes = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`,
          'User-Agent': 'curl/7.64.1'
        }
      });
      if (!fileRes.ok) throw new Error(`Meta Media Download Error ${fileRes.status}`);
      const arrayBuf = await fileRes.arrayBuffer();

      return {
        buffer: Buffer.from(arrayBuf),
        mimeType
      };
    } catch (error) {
      console.error(`[MEDIA ERROR] Error descargando mediaId ${mediaId}:`, error.message);
      throw error;
    }
  }
}

module.exports = new WhatsAppService();
