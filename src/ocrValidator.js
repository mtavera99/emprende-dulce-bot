const axios = require('axios');

class OCRValidator {
  /**
   * Valida un comprobante de pago usando modelos de visión (OpenAI GPT-4o-mini o Gemini)
   * @param {Buffer} imageBuffer - Buffer de la imagen descargada de WhatsApp
   * @param {Object} expected - Datos esperados { minAmount: 10000, recipientKeyword: "Santiago" }
   */
  async validateReceipt(imageBuffer, expected = { minAmount: 10000, recipientKeyword: "" }) {
    const base64Image = imageBuffer.toString('base64');

    // Opción 1: OpenAI GPT-4o-mini (Cuesta $0.0001 USD por validación)
    if (process.env.OPENAI_API_KEY) {
      return await this._validateWithOpenAI(base64Image, expected);
    }

    // Opción 2: Google Gemini 1.5 Flash (Gratuito / ultra económico)
    if (process.env.GEMINI_API_KEY) {
      return await this._validateWithGemini(base64Image, expected);
    }

    // Modo de desarrollo: Si no hay API key configurada en local
    console.warn("[OCR WARNING] No se configuró OPENAI_API_KEY ni GEMINI_API_KEY. Modo simulación activo.");
    return {
      isValid: true,
      amount: expected.minAmount,
      bank: "nequi_simulado",
      reference: "SIM-" + Date.now(),
      reason: "Simulación de desarrollo aprobada automáticamente"
    };
  }

  async _validateWithOpenAI(base64Image, expected) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: `Eres un auditor forense de transferencias bancarias en Colombia (Nequi, Daviplata, Bancolombia, Bre-B, Transfiya).
Tu tarea es analizar la captura de pantalla de un comprobante de pago y devolver un JSON estricto con los datos extraídos.

Devuelve SIEMPRE este formato JSON:
{
  "es_comprobante_bancario": true | false,
  "billetera": "nequi" | "daviplata" | "bancolombia" | "desconocido",
  "monto": 10000,
  "destinatario": "nombre o numero que aparece en la imagen",
  "fecha_hora": "texto de la fecha y hora si aparece",
  "numero_referencia": "codigo M... o autorizacion",
  "parece_autentico": true | false
}`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analiza este comprobante de pago y extrae los datos en el formato JSON indicado.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 300,
          temperature: 0.1
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const parsed = JSON.parse(response.data.choices[0].message.content);
      console.log("[OCR OPENAI RESULT]", parsed);

      // Reglas de validación:
      const minAmount = expected.minAmount || 10000;
      const amountOk = (parsed.monto || 0) >= minAmount;
      const isReceipt = parsed.es_comprobante_bancario && parsed.parece_autentico;

      let recipientOk = true;
      if (expected.recipientKeyword && expected.recipientKeyword.trim() !== '') {
        const dest = (parsed.destinatario || "").toLowerCase();
        recipientOk = dest.includes(expected.recipientKeyword.toLowerCase());
      }

      const isValid = isReceipt && amountOk && recipientOk;

      return {
        isValid,
        amount: parsed.monto || 0,
        bank: parsed.billetera || "desconocido",
        recipient: parsed.destinatario || "",
        reference: parsed.numero_referencia || "",
        date: parsed.fecha_hora || "",
        reason: isValid ? "Comprobante verificado con éxito" : "El comprobante no cumple con los criterios de monto o destinatario"
      };
    } catch (error) {
      console.error("[OCR ERROR OpenAI]:", error.response?.data || error.message);
      return { isValid: false, reason: "Error procesando la imagen con IA" };
    }
  }

  async _validateWithGemini(base64Image, expected) {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const response = await axios.post(
        url,
        {
          contents: [
            {
              parts: [
                {
                  text: `Eres un auditor de comprobantes Nequi / Bancolombia en Colombia. Analiza la imagen y responde ÚNICAMENTE un JSON con:
{"es_comprobante": boolean, "monto": number, "destinatario": string, "referencia": string, "fecha": string}`
                },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: base64Image
                  }
                }
              ]
            }
          ],
          generationConfig: {
            response_mime_type: "application/json",
            temperature: 0.1
          }
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const text = response.data.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(text);
      console.log("[OCR GEMINI RESULT]", parsed);

      const minAmount = expected.minAmount || 10000;
      const amountOk = (parsed.monto || 0) >= minAmount;
      const isValid = Boolean(parsed.es_comprobante) && amountOk;

      return {
        isValid,
        amount: parsed.monto || 0,
        recipient: parsed.destinatario || "",
        reference: parsed.referencia || "",
        reason: isValid ? "Comprobante aprobado por Gemini" : "Monto inferior o imagen no bancaria"
      };
    } catch (error) {
      console.error("[OCR ERROR Gemini]:", error.response?.data || error.message);
      return { isValid: false, reason: "Error con Gemini API" };
    }
  }
}

module.exports = new OCRValidator();
