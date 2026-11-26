/**
 * Servicio de transcripción de notas de voz de WhatsApp usando Gemini 2.5 Flash / OpenAI Whisper
 */
// Respuestas del modelo que NO son una transcripción: dice que no recibió el audio, pide que se lo envíen,
// o habla de sí mismo. Pasa cuando el audio no le llega (por ejemplo, un intermediario descarta el archivo).
const NO_TRANSCRIPCION = [
  /\btranscrib\w*\b/,                                                            // un cliente casi nunca dice "transcribir"
  /\bproporcion\w*\b.{0,40}\b(audio|nota de voz|grabacion)\b/,
  /\bno (he |se ha |se han )?(recibido|recibi|adjuntado|incluido|proporcionado)\b.{0,25}\b(audio|nota de voz|grabacion)\b/,
  /\bno (veo|encuentro)\b.{0,15}\b(ningun|ninguna|el|la|un|una)? ?(audio|nota de voz|grabacion)\b/,
  /\b(no puedo|no me es posible|no tengo (la )?(capacidad|acceso))\b.{0,30}\b(escuchar|oir|reproducir|procesar|transcribir|acceder a)\b.{0,30}\b(audio|audios|nota|notas|grabacion|archivos? de audio)\b/,
  /\b(como (un |una )?(modelo de lenguaje|asistente virtual|ia|inteligencia artificial)|soy (un|una) (modelo de lenguaje|asistente virtual|ia))\b/,
  /\b(please (provide|upload|share|send)|i can.?t (hear|listen|access|process)|no audio (was )?(provided|attached)|didn.?t (receive|get) (the|any) audio|as an ai)\b/,
];
function esRespuestaSinAudio(texto) {
  const n = String(texto || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return NO_TRANSCRIPCION.some((re) => re.test(n));
}

class AudioService {
  constructor() {
    this.maxBytes = 16 * 1024 * 1024; // 16 MB max
  }

  getGeminiKey() {
    return (
      process.env.GEMINI_API_KEY ||
      (process.env.IA_API_KEY && process.env.IA_API_KEY.startsWith('AIza') ? process.env.IA_API_KEY : null) ||
      (!process.env.OPENAI_API_KEY && process.env.IA_API_KEY && !process.env.IA_API_KEY.startsWith('sk-') ? process.env.IA_API_KEY : null)
    );
  }

  getGeminiModel() {
    return process.env.GEMINI_MODEL || 'gemini-3.1-flash';
  }

  getOpenAIKey() {
    return (
      process.env.OPENAI_API_KEY ||
      (process.env.IA_API_KEY && process.env.IA_API_KEY.startsWith('sk-') ? process.env.IA_API_KEY : null)
    );
  }

  isAvailable() {
    return Boolean(this.getGeminiKey() || this.getOpenAIKey());
  }

  /**
   * Transcribe un buffer de audio a texto
   * @param {Buffer} buffer - Bytes del archivo de audio
   * @param {string} mimeType - Tipo MIME (ej: "audio/ogg; codecs=opus", "audio/mp4", etc.)
   * @returns {Promise<{ ok: boolean, text?: string, error?: string, inaudible?: boolean }>}
   */
  async transcribe(buffer, mimeType = 'audio/ogg') {
    if (!buffer || !buffer.length) {
      return { ok: false, error: 'Buffer de audio vacío' };
    }

    if (buffer.length > this.maxBytes) {
      return { ok: false, error: 'Audio excede el tamaño máximo permitido' };
    }

    const geminiKey = this.getGeminiKey();
    const openaiKey = this.getOpenAIKey();
    if (geminiKey) {
      const r = await this._transcribeWithGemini(buffer, mimeType, geminiKey);
      // Si Gemini no recibió el audio o falló, y hay clave de OpenAI, se intenta con Whisper
      if (!r.ok && !r.inaudible && openaiKey) return await this._transcribeWithWhisper(buffer, mimeType, openaiKey);
      return r;
    }

    if (openaiKey) {
      return await this._transcribeWithWhisper(buffer, mimeType, openaiKey);
    }

    return {
      ok: false,
      error: 'No hay API Key configurada para transcripción de audio (GEMINI_API_KEY u OPENAI_API_KEY)'
    };
  }

  /**
   * Transcribe directamente usando Google Gemini multimodal
   */
  async _transcribeWithGemini(buffer, mimeType, apiKey) {
    try {
      const model = this.getGeminiModel();
      const baseUrl = (process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com').replace(/\/$/, '');
      // Limpiar mimeType (remover codecs=opus si viene)
      const cleanMime = String(mimeType || 'audio/ogg').split(';')[0].trim();
      const base64Data = buffer.toString('base64');

      const url = `${baseUrl}/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const prompt =
        'Eres un asistente de transcripción para atención al cliente en WhatsApp Colombia.\n' +
        'Transcribe EXACTAMENTE lo que dice esta nota de voz al español, palabra por palabra, tal cual lo que el cliente expresa.\n' +
        'NO agregues introducciones, NO respondas la pregunta del cliente y NO des explicaciones.\n' +
        'Contexto: Es un cliente interesado en comprar un pack digital de moldes de costura o de recetas de postres y helados en Colombia. Puede preguntar por medios de pago (Nequi, Daviplata), precios, contenido, cómo se descarga o pedir asesoría.\n' +
        'Si el audio no tiene voz humana, solo tiene ruido blanco, silencio o es totalmente incomprensible, responde exactamente: INAUDIBLE';

      const pedir = (conThinking) => fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                // Nombres oficiales de la API (camelCase). Con "inline_data" en snake_case algunos intermediarios
                // (como el proveedor de GEMINI_BASE_URL) descartan el audio y el modelo solo recibe el texto.
                { inlineData: { mimeType: cleanMime, data: base64Data } }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.0,
            maxOutputTokens: 1024,
            // Sin "thinking": en los modelos 2.5 el razonamiento gastaba los tokens y el texto llegaba vacío
            ...(conThinking ? { thinkingConfig: { thinkingBudget: 0 } } : {})
          }
        })
      });
      let res = await pedir(true);
      if (!res.ok && res.status === 400) res = await pedir(false);

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.error(`[AUDIO ERROR] Gemini HTTP ${res.status}:`, errText.slice(0, 200));
        return { ok: false, error: `Gemini ${res.status}: ${errText.slice(0, 150)}` };
      }

      const data = await res.json();
      const rawText = (data?.candidates?.[0]?.content?.parts || [])
        .map(p => p.text || '')
        .join('')
        .trim();

      if (!rawText) {
        const motivo = data?.candidates?.[0]?.finishReason || data?.promptFeedback?.blockReason || 'sin texto';
        console.error('[AUDIO ERROR] Gemini no devolvió transcripción:', motivo);
        return { ok: false, error: `Gemini sin transcripción (${motivo})` };
      }
      if (/^INAUDIBLE\.?$/i.test(rawText)) {
        return { ok: false, inaudible: true, error: 'Audio inaudible o sin voz humana' };
      }
      if (esRespuestaSinAudio(rawText)) {
        console.error('[AUDIO ERROR] El modelo no recibió el audio y respondió:', rawText.slice(0, 120));
        return { ok: false, sinAudio: true, error: 'El modelo no recibió el audio' };
      }

      // Limpieza de comillas extras que a veces agrega el modelo
      const cleaned = rawText.replace(/^["'«“]+|["'»”]+$/g, '').trim();

      return {
        ok: true,
        text: cleaned
      };
    } catch (err) {
      console.error('[AUDIO ERROR] Excepción transcribiendo con Gemini:', err.message);
      return { ok: false, error: err.message };
    }
  }

  /**
   * Fallback con OpenAI Whisper si se configura OPENAI_API_KEY
   */
  async _transcribeWithWhisper(buffer, mimeType, apiKey) {
    try {
      const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
      let filename = 'audio.ogg';
      if (mimeType.includes('mp4')) filename = 'audio.mp4';
      if (mimeType.includes('wav')) filename = 'audio.wav';
      if (mimeType.includes('mp3') || mimeType.includes('mpeg')) filename = 'audio.mp3';

      const cleanMime = mimeType.split(';')[0].trim();

      // Armar multipart/form-data manualmente para no requerir form-data extra
      const pre = Buffer.from(
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
        `Content-Type: ${cleanMime}\r\n\r\n`
      );
      const mid = Buffer.from(
        `\r\n--${boundary}\r\n` +
        `Content-Disposition: form-data; name="model"\r\n\r\nwhisper-1\r\n` +
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="language"\r\n\r\nes\r\n` +
        `--${boundary}--\r\n`
      );

      const bodyBuffer = Buffer.concat([pre, buffer, mid]);

      const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': `multipart/form-data; boundary=${boundary}`
        },
        body: bodyBuffer
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        return { ok: false, error: `Whisper ${res.status}: ${errText.slice(0, 150)}` };
      }

      const data = await res.json();
      const text = (data?.text || '').trim();
      if (!text) return { ok: false, inaudible: true, error: 'Transcripción vacía' };
      if (esRespuestaSinAudio(text)) return { ok: false, sinAudio: true, error: 'El modelo no recibió el audio' };

      return { ok: true, text };
    } catch (err) {
      console.error('[AUDIO ERROR] Excepción transcribiendo con Whisper:', err.message);
      return { ok: false, error: err.message };
    }
  }
}

const audioService = new AudioService();
audioService.esRespuestaSinAudio = esRespuestaSinAudio;
module.exports = audioService;
