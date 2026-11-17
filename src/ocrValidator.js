class OCRValidator {
  /**
   * Valida un comprobante de pago usando modelos de visión (OpenAI GPT-4o-mini o Gemini)
   * @param {Buffer} imageBuffer - Buffer de la imagen descargada de WhatsApp
   * @param {Object} expected - Datos esperados { minAmount: 10000, recipientKeyword: "Santiago" }
   */
  async validateReceipt(imageBuffer, expected = { minAmount: 10000, recipientKeyword: "" }) {
    if (!imageBuffer || !imageBuffer.length) {
      return { isValid: false, reason: "Imagen vacía o no recibida" };
    }

    const base64Image = imageBuffer.toString('base64');

    // Detección automática de llaves de IA (Gemini, OpenAI o IA_API_KEY unificada)
    const geminiKey = process.env.GEMINI_API_KEY || (process.env.IA_API_KEY && process.env.IA_API_KEY.startsWith('AIza') ? process.env.IA_API_KEY : (!process.env.OPENAI_API_KEY && process.env.IA_API_KEY && !process.env.IA_API_KEY.startsWith('sk-') ? process.env.IA_API_KEY : null));
    const openaiKey = process.env.OPENAI_API_KEY || (process.env.IA_API_KEY && process.env.IA_API_KEY.startsWith('sk-') ? process.env.IA_API_KEY : null);

    // Opción 1: Google Gemini 1.5/2.5 Flash (Gratuito / ultra económico)
    if (geminiKey) {
      return await this._validateWithGemini(base64Image, expected, geminiKey);
    }

    // Opción 2: OpenAI GPT-4o-mini
    if (openaiKey) {
      return await this._validateWithOpenAI(base64Image, expected, openaiKey);
    }

    // Modo de desarrollo / fallback
    console.warn("[OCR WARNING] No se configuró GEMINI_API_KEY, OPENAI_API_KEY ni IA_API_KEY. Modo simulación activo.");
    return {
      isValid: true,
      amount: expected.minAmount || 10000,
      bank: "nequi_simulado",
      reference: "SIM-" + Date.now().toString().slice(-6),
      reason: "Simulación de desarrollo aprobada automáticamente"
    };
  }

  async _validateWithGemini(base64Image, expected, apiKey) {
    try {
      const key = apiKey || process.env.GEMINI_API_KEY;
      const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Eres un auditor forense de transferencias bancarias en Colombia (Nequi, Daviplata, Bancolombia, Bre-B, Transfiya).
Analiza esta imagen y responde ÚNICAMENTE un JSON estricto con:
{
  "es_comprobante": boolean,
  "banco": "nequi" | "daviplata" | "bancolombia" | "bre_b" | "otro",
  "monto": number,
  "destinatario": string,
  "referencia": string,
  "fecha": string,
  "exitoso": boolean
}
Reglas:
1. "es_comprobante": true si es una captura de pantalla legítima de comprobante de transferencia bancaria, false si es una foto no relacionada, meme, selfie o captura irrelevante.
2. "monto": extrae el número entero transferido (ej: 10000 si dice $10.000).
3. "referencia": extrae el código alfanumérico o número de comprobante/aprobación (ej: M1234567, 839201).
4. "exitoso": true si la transferencia fue exitosa/enviada/aprobada.`
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
            temperature: 0.0
          }
        })
      });

      if (!res.ok) {
        const err = await res.text().catch(() => "");
        return { isValid: false, reason: `Gemini ${res.status}: ${err.slice(0, 150)}` };
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(text);
      console.log("[OCR GEMINI RESULT]", parsed);

      const minAmount = expected.minAmount || 10000;
      const amountOk = (Number(parsed.monto) || 0) >= minAmount;
      const isValid = Boolean(parsed.es_comprobante) && amountOk && (parsed.exitoso !== false);

      return {
        isValid,
        amount: Number(parsed.monto) || 0,
        bank: parsed.banco || "nequi",
        recipient: parsed.destinatario || "",
        reference: parsed.referencia || "",
        date: parsed.fecha || "",
        reason: isValid ? "Comprobante verificado con éxito por Gemini" : "Monto inferior o imagen no bancaria"
      };
    } catch (error) {
      console.error("[OCR ERROR Gemini]:", error.message);
      return { isValid: false, reason: "Error procesando con Gemini API: " + error.message };
    }
  }

  async _validateWithOpenAI(base64Image, expected, apiKey) {
    try {
      const key = apiKey || process.env.OPENAI_API_KEY;
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: `Eres un auditor forense de transferencias bancarias en Colombia (Nequi, Daviplata, Bancolombia, Bre-B). Devuelve un JSON: {"es_comprobante": boolean, "banco": string, "monto": number, "destinatario": string, "referencia": string, "fecha": string, "exitoso": boolean}`
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Analiza este comprobante de pago de Colombia y extrae los datos.' },
                { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
              ]
            }
          ],
          max_tokens: 300,
          temperature: 0.0
        })
      });

      if (!res.ok) {
        return { isValid: false, reason: `OpenAI HTTP ${res.status}` };
      }

      const data = await res.json();
      const parsed = JSON.parse(data.choices[0].message.content);
      const minAmount = expected.minAmount || 10000;
      const amountOk = (Number(parsed.monto) || 0) >= minAmount;
      const isValid = Boolean(parsed.es_comprobante) && amountOk && (parsed.exitoso !== false);

      return {
        isValid,
        amount: Number(parsed.monto) || 0,
        bank: parsed.banco || "nequi",
        recipient: parsed.destinatario || "",
        reference: parsed.referencia || "",
        date: parsed.fecha || "",
        reason: isValid ? "Comprobante verificado con éxito por OpenAI" : "Monto inferior o no es comprobante"
      };
    } catch (error) {
      console.error("[OCR ERROR OpenAI]:", error.message);
      return { isValid: false, reason: "Error procesando con OpenAI: " + error.message };
    }
  }
}

module.exports = new OCRValidator();
