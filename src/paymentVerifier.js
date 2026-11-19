const fs = require('fs');
const path = require('path');
const store = require('./store');

// ============================================================================
// 🛡️ SISTEMA DE VERIFICACIÓN AUTOMÁTICA DE PAGOS (NEQUI / DAVIPLATA / LLAVE)
// ============================================================================
// Elimina el riesgo de fraude por generadores falsos de comprobantes en Colombia.
// Cruza la lectura visual del OCR contra el libro mayor (ledger) de notificaciones
// reales recibidas por correo (Gmail), push de Nequi/Daviplata o webhook de MacroDroid.
// ============================================================================

const DIR = store.getDir();
const LEDGER_FILE = path.join(DIR, 'transacciones_bancarias.json');

function loadLedger() {
  try {
    if (fs.existsSync(LEDGER_FILE)) {
      return JSON.parse(fs.readFileSync(LEDGER_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('[PAYMENT_VERIFIER] Error leyendo transacciones_bancarias.json:', err.message);
  }
  return [];
}

function saveLedger(data) {
  const tmpPath = `${LEDGER_FILE}.tmp`;
  try {
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmpPath, LEDGER_FILE);
  } catch (err) {
    console.error('[PAYMENT_VERIFIER] Error guardando transacciones_bancarias.json:', err.message);
    try {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    } catch {}
  }
}

// Ledger en memoria persistente
let transactions = loadLedger();

// Suscriptores para auto-aprobación en tiempo real cuando llega notificación bancaria
const pendingCustomerChecks = new Map();

class PaymentVerifier {
  constructor() {
    this.webhookKey = process.env.PAYMENT_WEBHOOK_KEY || 'dulce_pay_secret_2026';
  }

  getWebhookKey() {
    return this.webhookKey;
  }

  getAllTransactions() {
    return transactions.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }

  /**
   * Ingesta una notificación bancaria real recibida de MacroDroid, Tasker,
   * Gmail Forwarder, o llamada de API directa.
   */
  ingestNotification(payload = {}) {
    let parsed = null;

    // Caso 1: Payload ya estructurado
    if (payload.reference && payload.amount) {
      parsed = {
        bank: (payload.bank || 'NEQUI').toUpperCase(),
        reference: String(payload.reference).trim().toUpperCase(),
        amount: Number(payload.amount),
        sender: payload.sender || payload.from || 'Cliente Nequi',
        rawText: payload.rawText || payload.text || '',
        timestamp: payload.timestamp ? Number(payload.timestamp) : Date.now()
      };
    } else {
      // Caso 2: Texto sin procesar de notificación Push / SMS / Correo
      const text = payload.text || payload.body || payload.notification || payload.message || '';
      parsed = this.parseNotificationText(text);
    }

    if (!parsed || !parsed.amount) {
      return { success: false, reason: 'No se pudo interpretar monto o formato de la notificación bancaria' };
    }

    // Normalizar referencia
    const cleanRef = parsed.reference ? parsed.reference.replace(/\s+/g, '').toUpperCase() : null;

    // Verificar si esta notificación bancaria ya fue registrada anteriormente (evita duplicados de push/sms)
    if (cleanRef) {
      const existing = transactions.find(t => t.reference && t.reference.toUpperCase() === cleanRef);
      if (existing) {
        console.log(`[PAYMENT_VERIFIER] Transacción ya registrada previamente: Ref ${cleanRef}`);
        return { success: true, duplicate: true, transaction: existing };
      }
    }

    const tx = {
      id: `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      bank: parsed.bank || 'NEQUI',
      reference: cleanRef || `AUTO-${Date.now().toString().slice(-6)}`,
      amount: parsed.amount,
      sender: parsed.sender || 'Cliente',
      rawText: parsed.rawText || '',
      status: 'UNCLAIMED', // UNCLAIMED | CLAIMED
      claimedByPhone: null,
      claimedAt: null,
      timestamp: parsed.timestamp || Date.now()
    };

    transactions.unshift(tx);
    saveLedger(transactions);
    console.log(`[PAYMENT_VERIFIER] 💰 Nueva transacción acreditada en banco: ${tx.bank} $${tx.amount} Ref:${tx.reference} (${tx.sender})`);

    // Resolver escuchadores pendientes en espera de comprobante
    this.resolvePendingWatchers(tx);

    return { success: true, transaction: tx };
  }

  /**
   * Parser universal para notificaciones bancarias colombianas
   * Soporta: Nequi, Daviplata, Transfiya / Llave Bre-B, Bancolombia
   */
  parseNotificationText(text = '') {
    if (!text || typeof text !== 'string') return null;

    const lower = text.toLowerCase();
    let bank = 'NEQUI';
    if (lower.includes('daviplata')) bank = 'DAVIPLATA';
    else if (lower.includes('transfiya') || lower.includes('llave') || lower.includes('bre-b')) bank = 'LLAVE_BRE_B';
    else if (lower.includes('bancolombia')) bank = 'BANCOLOMBIA';

    // 1. Extraer Monto
    let amount = 0;
    // Busca $10.000, $10000, 10.000 COP, 10,000
    const amountMatch = text.match(/\$\s*([0-9]{1,3}(?:[.,][0-9]{3})*|[0-9]+)/);
    if (amountMatch) {
      const numStr = amountMatch[1].replace(/[.,]/g, '');
      amount = parseInt(numStr, 10);
    } else {
      const rawNumMatch = text.match(/(?:por|de|valor|recibiste|transfirieron)\s*([0-9]{1,3}(?:[.,][0-9]{3})+)/i);
      if (rawNumMatch) {
        amount = parseInt(rawNumMatch[1].replace(/[.,]/g, ''), 10);
      }
    }

    // 2. Extraer Referencia
    let reference = null;
    // Nequi normalmente usa Ref: M1234567 o similar
    const refMatch =
      text.match(/(?:ref|referencia|comprobante|aprobaci[oó]n|autorizaci[oó]n|nro|id)[:\s#]*([A-Z0-9\s]{5,15})/i) ||
      text.match(/\b(M\s*[0-9]{6,8})\b/i);

    if (refMatch) {
      reference = refMatch[1].trim().replace(/\s+/g, '').toUpperCase();
    }

    // 3. Extraer Remitente / Quien envía
    let sender = 'Cliente';
    const senderMatch =
      text.match(/(?:de|envi[oó]|transfiri[oó])\s+([A-ZÁÉÍÓÚÑa-záéíóúñ\s]{3,35})(?:\.|,|por|con|ref|a\s+tu)/i);
    if (senderMatch) {
      sender = senderMatch[1].trim();
    }

    return {
      bank,
      amount,
      reference,
      sender,
      rawText: text,
      timestamp: Date.now()
    };
  }

  /**
   * Verifica un comprobante extraído por el OCR contra el libro de transacciones reales.
   * Reglas de validación:
   * 1. Antifraude: Si la referencia ya fue reclamada por otro teléfono -> FRAUDE / RECHAZO
   * 2. Cruce exacto: Referencia coincide con una transacción UNCLAIMED en el libro mayor.
   * 3. Cruce temporal (si OCR leyó mal la referencia): Transacción UNCLAIMED con monto exacto en los últimos 20 min.
   */
  verifyPayment({ reference, amount, bank }, customerPhone) {
    const lead = customerPhone ? store.getLead(customerPhone) : null;
    const minAmount = (lead && lead.precioOfrecido) ? lead.precioOfrecido : (store.getSettings().precioOferta || 7000);

    // Regla 1: Validar si la referencia ya fue usada anteriormente en alguna compra (Antifraude)
    if (cleanRef) {
      // Revisar en transacciones bancarias ya reclamadas
      const claimedTx = transactions.find(
        t => t.reference && t.reference.toUpperCase() === cleanRef && t.status === 'CLAIMED'
      );
      if (claimedTx && claimedTx.claimedByPhone !== customerPhone) {
        return {
          verified: false,
          fraud: true,
          reason: 'REFERENCIA_DUPLICADA_BANCARIA',
          message: `La referencia ${cleanRef} ya fue utilizada anteriormente en otra orden.`
        };
      }

      // Revisar en pedidos del bot ya aprobados
      const todosPedidos = store.todosLosPedidos();
      const pedidoReusado = todosPedidos.find(
        p => p.status === 'VERIFICADO' && p.reference && p.reference.toUpperCase() === cleanRef && p.phone !== customerPhone
      );
      if (pedidoReusado) {
        return {
          verified: false,
          fraud: true,
          reason: 'COMPROBANTE_YA_CANJEADO',
          message: `El comprobante con referencia ${cleanRef} ya fue canjeado por otro número.`
        };
      }
    }

    // Regla 2: Buscar coincidencia exacta en el libro mayor de pagos reales
    if (cleanRef) {
      const match = transactions.find(
        t => t.reference && t.reference.toUpperCase() === cleanRef && t.status === 'UNCLAIMED'
      );

      if (match) {
        // Verificar monto suficiente
        if (match.amount >= minAmount) {
          // Reclamar la transacción
          match.status = 'CLAIMED';
          match.claimedByPhone = customerPhone;
          match.claimedAt = Date.now();
          saveLedger(transactions);

          return {
            verified: true,
            method: 'CRUCE_EXACTO_LIBRO_MAYOR',
            transaction: match,
            amount: match.amount,
            reference: match.reference,
            bank: match.bank
          };
        }
      }
    }

    // Regla 3: Cruce blando por monto y ventana de tiempo reciente (por si el OCR leyó borrosa la referencia)
    const twentyMinsAgo = Date.now() - 25 * 60 * 1000;
    const matchRecent = transactions.find(
      t =>
        t.status === 'UNCLAIMED' &&
        t.amount >= minAmount &&
        (t.timestamp || 0) >= twentyMinsAgo
    );

    if (matchRecent) {
      matchRecent.status = 'CLAIMED';
      matchRecent.claimedByPhone = customerPhone;
      matchRecent.claimedAt = Date.now();
      saveLedger(transactions);

      return {
        verified: true,
        method: 'CRUCE_TEMPORAL_MONTO',
        transaction: matchRecent,
        amount: matchRecent.amount,
        reference: matchRecent.reference || cleanRef || 'REF-AUTO-CRUCE',
        bank: matchRecent.bank
      };
    }

    // Regla 4: No está aún en el libro mayor
    // (Puede que la notificación tarde unos segundos en llegar por red o correo)
    return {
      verified: false,
      fraud: false,
      reason: 'PENDIENTE_NOTIFICACION_BANCO',
      cleanReference: cleanRef,
      amount: amount || minAmount,
      bank: bank || 'NEQUI'
    };
  }

  /**
   * Pone al cliente en lista de espera activa. Si la notificación de Nequi/Daviplata
   * llega dentro de los siguientes timeoutMs, se auto-aprueba y entrega de inmediato.
   */
  waitForIncomingPayment(phone, { reference, amount, orderId }, callback, timeoutMs = 90000) {
    const key = phone;
    const timer = setTimeout(() => {
      pendingCustomerChecks.delete(key);
      callback(null); // Timeout expirado
    }, timeoutMs);

    pendingCustomerChecks.set(key, {
      reference: reference ? reference.replace(/\s+/g, '').toUpperCase() : null,
      amount: Number(amount) || 10000,
      orderId,
      timer,
      callback
    });
  }

  resolvePendingWatchers(newTx) {
    if (!newTx || newTx.status === 'CLAIMED') return;

    for (const [phone, watcher] of pendingCustomerChecks.entries()) {
      let matched = false;
      if (watcher.reference && newTx.reference && newTx.reference.toUpperCase() === watcher.reference) {
        matched = true;
      } else if (!watcher.reference && newTx.amount >= watcher.amount) {
        matched = true;
      }

      if (matched) {
        clearTimeout(watcher.timer);
        pendingCustomerChecks.delete(phone);

        // Reclamar la transacción
        newTx.status = 'CLAIMED';
        newTx.claimedByPhone = phone;
        newTx.claimedAt = Date.now();
        saveLedger(transactions);

        try {
          watcher.callback(newTx);
        } catch (err) {
          console.error('[PAYMENT_VERIFIER] Error en callback de watcher:', err.message);
        }
        break;
      }
    }
  }
}

module.exports = new PaymentVerifier();
