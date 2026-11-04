/**
 * ============================================================================
 * TELEGRAM.JS — MÓDULO DE INTEGRACIÓN TELEGRAM & MOTOR DE ALERTAS INDUSTRIALES
 * Monitoreo de Soluble / Refrigerante — Línea "E" (BRP / KOLBEN)
 * Bot Oficial: @DASHBOARD_BRP_bot (https://t.me/DASHBOARD_BRP_bot)
 * ============================================================================
 */

const OFFICIAL_BOT_TOKEN = '9151291473:AAEDQ-q0fUckTWTv3Rw2v9mYsaEBdaaWVV4';
const OFFICIAL_BOT_USERNAME = 'DASHBOARD_BRP_bot';

// SECCIÓN DE CONFIGURACIÓN OFICIAL
const TELEGRAM_CONFIG = {
  botToken: OFFICIAL_BOT_TOKEN,
  botUsername: OFFICIAL_BOT_USERNAME,
  chatId: '', // Se auto-detecta dinámicamente o se configura manualmente
  
  // Parámetros operativos
  pollIntervalMs: 5000,                   // Sondeo cada 5 segundos
  alertInactivityLimitMs: 2 * 60 * 60 * 1000, // 2 HORAS (alerta por falta de lectura)
  minConcentrationThreshold: 4,           // Nivel mínimo requerido (0-10)
  maxConcentrationThreshold: 8,           // Rango superior de trabajo
  historyMaxDurationMs: 7 * 24 * 60 * 60 * 1000, // 1 SEMANA (168 horas)
  
  // Etiquetas oficiales requeridas
  validTags: {
    'Tanque01': /Tanque01\s+Linea\s+E/i,
    'Tanque02': /Tanque02\s+Linea\s+E/i,
    'Tanque03': /Tanque03\s+Linea\s+E/i
  }
};

// Claves de Almacenamiento Local
const STORAGE_KEYS = {
  CONFIG: 'brp_soluble_telegram_config_v1',
  READINGS: 'brp_soluble_readings_v1',
  ALERTS: 'brp_soluble_active_alerts_v1',
  PROCESSED_MSGS: 'brp_soluble_processed_msgs_v1',
  LAST_UPDATE_ID: 'brp_soluble_telegram_last_update_id_v1'
};

/**
 * Carga la configuración guardada desde localStorage o usa los valores oficiales por defecto.
 */
function loadTelegramConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (saved) {
      const parsed = JSON.parse(saved);
      TELEGRAM_CONFIG.botToken = parsed.botToken || OFFICIAL_BOT_TOKEN;
      TELEGRAM_CONFIG.chatId = parsed.chatId || '';
      TELEGRAM_CONFIG.minConcentrationThreshold = parsed.minConcentrationThreshold || 4;
    } else {
      TELEGRAM_CONFIG.botToken = OFFICIAL_BOT_TOKEN;
    }
  } catch (err) {
    TELEGRAM_CONFIG.botToken = OFFICIAL_BOT_TOKEN;
  }
  return TELEGRAM_CONFIG;
}

/**
 * Guarda la configuración de Telegram en localStorage.
 */
function saveTelegramConfig(newConfig) {
  Object.assign(TELEGRAM_CONFIG, newConfig);
  if (!TELEGRAM_CONFIG.botToken) TELEGRAM_CONFIG.botToken = OFFICIAL_BOT_TOKEN;
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify({
    botToken: TELEGRAM_CONFIG.botToken,
    chatId: TELEGRAM_CONFIG.chatId,
    minConcentrationThreshold: TELEGRAM_CONFIG.minConcentrationThreshold
  }));
}

/**
 * Obtiene el registro de lecturas válidas almacenadas.
 */
function getStoredReadings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.READINGS);
    if (!raw) return { Tanque01: [], Tanque02: [], Tanque03: [] };
    const data = JSON.parse(raw);
    
    // Verificación de reinicio semanal (Regla 6)
    const allTimestamps = [
      ...(data.Tanque01 || []).map(r => r.timestamp),
      ...(data.Tanque02 || []).map(r => r.timestamp),
      ...(data.Tanque03 || []).map(r => r.timestamp)
    ].filter(Boolean);

    if (allTimestamps.length > 0) {
      const minTime = Math.min(...allTimestamps);
      const maxTime = Math.max(...allTimestamps);
      if (maxTime - minTime >= TELEGRAM_CONFIG.historyMaxDurationMs) {
        console.warn('Se ha completado 1 semana de muestras. Reiniciando la base de datos...');
        const resetData = { Tanque01: [], Tanque02: [], Tanque03: [] };
        localStorage.setItem(STORAGE_KEYS.READINGS, JSON.stringify(resetData));
        return resetData;
      }
    }

    return {
      Tanque01: data.Tanque01 || [],
      Tanque02: data.Tanque02 || [],
      Tanque03: data.Tanque03 || []
    };
  } catch (e) {
    console.error('Error leyendo base de datos de solubles:', e);
    return { Tanque01: [], Tanque02: [], Tanque03: [] };
  }
}

/**
 * Guarda las lecturas en localStorage.
 */
function saveStoredReadings(readings) {
  localStorage.setItem(STORAGE_KEYS.READINGS, JSON.stringify(readings));
}

/**
 * Registro de IDs de mensajes procesados para prevenir duplicidad.
 */
function isMessageAlreadyProcessed(messageId) {
  if (!messageId) return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROCESSED_MSGS);
    const list = raw ? JSON.parse(raw) : [];
    return list.includes(String(messageId));
  } catch (e) {
    return false;
  }
}

function markMessageProcessed(messageId) {
  if (!messageId) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROCESSED_MSGS);
    const list = raw ? JSON.parse(raw) : [];
    if (!list.includes(String(messageId))) {
      list.push(String(messageId));
      if (list.length > 500) list.shift();
      localStorage.setItem(STORAGE_KEYS.PROCESSED_MSGS, JSON.stringify(list));
    }
  } catch (e) {
    console.error(e);
  }
}

/**
 * Envía un mensaje de texto mediante la API de Telegram.
 */
async function sendTelegramMessage(text, targetChatId = null) {
  const token = TELEGRAM_CONFIG.botToken || OFFICIAL_BOT_TOKEN;
  const chat = targetChatId || TELEGRAM_CONFIG.chatId;

  if (!token || !chat) {
    console.warn('[Telegram] No se pudo enviar mensaje: falta token o chatId');
    return false;
  }
  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chat,
        text: text,
        parse_mode: 'HTML'
      })
    });
    const result = await resp.json();
    return result.ok;
  } catch (err) {
    console.error('Error enviando mensaje a Telegram:', err);
    return false;
  }
}

/**
 * Detecta automáticamente el Chat ID a partir de los mensajes recibidos en Telegram.
 */
async function detectChatIdFromUpdates() {
  const token = TELEGRAM_CONFIG.botToken || OFFICIAL_BOT_TOKEN;
  if (!token) return { success: false, reason: 'Falta Bot Token' };
  try {
    const resp = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=25`);
    const data = await resp.json();
    if (data.ok && Array.isArray(data.result) && data.result.length > 0) {
      for (let i = data.result.length - 1; i >= 0; i--) {
        const item = data.result[i];
        const msg = item.message || item.channel_post;
        if (msg && msg.chat && msg.chat.id) {
          const detectedId = String(msg.chat.id);
          TELEGRAM_CONFIG.chatId = detectedId;
          saveTelegramConfig(TELEGRAM_CONFIG);
          const fromUser = msg.from ? `@${msg.from.username || msg.from.first_name}` : 'Chat';
          return {
            success: true,
            chatId: detectedId,
            chatTitle: msg.chat.title || fromUser
          };
        }
      }
    }
    return {
      success: false,
      reason: 'No se encontraron mensajes en el bot aún.'
    };
  } catch (e) {
    return { success: false, reason: e.message };
  }
}

/**
 * PARSEO Y VALIDACIÓN DE LECTURA DESDE MENSAJE DE TELEGRAM (REGLA 7)
 */
function parseAndRegisterReading(rawText, messageId = null, customDate = null, fromChatId = null) {
  if (!rawText) return { success: false, reason: 'Texto vacío' };

  // 1. Identificar Tanque
  let identifiedTank = null;
  for (const [tankKey, regex] of Object.entries(TELEGRAM_CONFIG.validTags)) {
    if (regex.test(rawText)) {
      identifiedTank = tankKey;
      break;
    }
  }

  if (!identifiedTank) {
    return {
      success: false,
      reason: 'Etiqueta no válida. Se requiere "Tanque01 Linea E", "Tanque02 Linea E" o "Tanque03 Linea E".'
    };
  }

  // 2. Prevenir duplicidad de mensaje
  if (messageId && isMessageAlreadyProcessed(messageId)) {
    return { success: false, reason: 'Mensaje duplicado ya procesado anteriormente.' };
  }

  // 3. Extracción de lectura numérica (entero entre 0 y 10)
  const numberMatch = rawText.match(/(?:valor|brix|lectura|concentraci[oó]n)?\s*:?\s*(\b10|[0-9]\b)/i);
  if (!numberMatch) {
    solicitarReenvioLectura(identifiedTank, fromChatId);
    return {
      success: false,
      reason: 'No se encontró un número entero válido (0 a 10) en la lectura.'
    };
  }

  const numericValue = parseInt(numberMatch[1], 10);
  if (isNaN(numericValue) || numericValue < 0 || numericValue > 10) {
    solicitarReenvioLectura(identifiedTank, fromChatId);
    return {
      success: false,
      reason: `El valor extraído (${numericValue}) está fuera del rango permitido (0-10).`
    };
  }

  // 4. Registro oficial con Fecha y Hora
  const now = customDate ? new Date(customDate) : new Date();
  const dayStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);

  const readings = getStoredReadings();
  const tankList = readings[identifiedTank] || [];

  const lastReading = tankList[tankList.length - 1];
  if (lastReading && Math.abs(now.getTime() - lastReading.timestamp) < 60000 && lastReading.value === numericValue) {
    return { success: false, reason: 'Lectura idéntica recibida hace menos de 1 minuto.' };
  }

  const consecutive = tankList.length + 1;
  const newRecord = {
    consecutivo: consecutive,
    dia: dayStr,
    hora: timeStr,
    valor: numericValue,
    timestamp: now.getTime(),
    tanque: identifiedTank
  };

  tankList.push(newRecord);
  readings[identifiedTank] = tankList;
  saveStoredReadings(readings);

  if (messageId) {
    markMessageProcessed(messageId);
  }

  clearActiveAlert(identifiedTank);

  window.dispatchEvent(new CustomEvent('brp_reading_registered', { detail: newRecord }));

  return {
    success: true,
    record: newRecord
  };
}

function solicitarReenvioLectura(tankId, fromChatId = null) {
  const msg = `⚠️ <b>Aviso Línea E:</b> No fue posible extraer una lectura numérica válida (entero 0-10) para el <b>${tankId}</b>. Por favor envíe nuevamente una fotografía nítida con la etiqueta "<b>${tankId} Linea E</b>".`;
  sendTelegramMessage(msg, fromChatId);
}

function getActiveAlerts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ALERTS);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function setActiveAlert(tankId) {
  const alerts = getActiveAlerts();
  alerts[tankId] = { active: true, sentAt: Date.now() };
  localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
}

function clearActiveAlert(tankId) {
  const alerts = getActiveAlerts();
  if (alerts[tankId]) {
    delete alerts[tankId];
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  }
}

async function checkInactivityAlerts() {
  const readings = getStoredReadings();
  const alerts = getActiveAlerts();
  const now = Date.now();
  const limitMs = TELEGRAM_CONFIG.alertInactivityLimitMs;

  const tanks = ['Tanque01', 'Tanque02', 'Tanque03'];

  for (const tankId of tanks) {
    const list = readings[tankId] || [];
    let lastCaptureTime = 0;
    
    if (list.length > 0) {
      lastCaptureTime = list[list.length - 1].timestamp;
    }

    const elapsed = now - lastCaptureTime;
    const isInactive = (lastCaptureTime === 0) || (elapsed >= limitMs);

    if (isInactive) {
      const alertInfo = alerts[tankId];
      if (!alertInfo || !alertInfo.active) {
        const message = `⚠️ <b>Aviso de Mantenimiento Línea E:</b> Se requiere enviar la lectura actual del soluble para el <b>${tankId}</b>. Han transcurrido más de 2 horas sin registro.`;
        const sent = await sendTelegramMessage(message);
        setActiveAlert(tankId);
        console.log(`[Alerta 2H Generada] ${tankId} - Mensaje enviado: ${sent}`);
      }
    }
  }
}

/**
 * MOTOR DE CONSULTA EN TIEMPO REAL (TELEGRAM POLLING)
 */
let isPollingActive = false;

async function pollTelegramUpdates() {
  if (isPollingActive) return;
  const token = TELEGRAM_CONFIG.botToken || OFFICIAL_BOT_TOKEN;
  if (!token) return;

  isPollingActive = true;
  try {
    let lastUpdateId = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_UPDATE_ID) || '0', 10);
    const url = `https://api.telegram.org/bot${token}/getUpdates?offset=${lastUpdateId + 1}&limit=10`;

    const response = await fetch(url);
    if (!response.ok) {
      isPollingActive = false;
      return;
    }

    const data = await response.json();
    if (data.ok && Array.isArray(data.result) && data.result.length > 0) {
      for (const update of data.result) {
        if (update.update_id > lastUpdateId) {
          lastUpdateId = update.update_id;
          localStorage.setItem(STORAGE_KEYS.LAST_UPDATE_ID, String(lastUpdateId));
        }

        const msg = update.message || update.channel_post;
        if (!msg) continue;

        const chatId = String(msg.chat.id);
        if (!TELEGRAM_CONFIG.chatId) {
          TELEGRAM_CONFIG.chatId = chatId;
          saveTelegramConfig(TELEGRAM_CONFIG);
          console.log(`[Telegram Auto-Detect] Chat ID configurado automáticamente: ${chatId}`);
        }

        const rawText = (msg.caption || msg.text || '').trim();

        if (rawText === '/start') {
          const welcomeMsg = `👋 <b>Bienvenido al Monitor de Soluble Línea E (BRP)</b>\n\nPara registrar lecturas de soluble, envíe la foto del refractómetro o mensaje con una de estas etiquetas oficiales:\n• <code>Tanque01 Linea E</code>\n• <code>Tanque02 Linea E</code>\n• <code>Tanque03 Linea E</code>\n\nEl sistema registrará el valor numérico (0 a 10) y actualizará el layout en tiempo real.`;
          await sendTelegramMessage(welcomeMsg, chatId);
          continue;
        }

        const hasTag = Object.values(TELEGRAM_CONFIG.validTags).some(rx => rx.test(rawText));
        if (hasTag) {
          const res = parseAndRegisterReading(rawText, msg.message_id, msg.date * 1000, chatId);
          if (res.success) {
            const confirmMsg = `✅ <b>Lectura Registrada con Éxito</b>\n<b>Tanque:</b> ${res.record.tanque}\n<b>Concentración:</b> ${res.record.valor} Brix\n<b>Fecha y Hora:</b> ${res.record.dia} ${res.record.hora}\n\n<i>Dashboard actualizado en vivo.</i>`;
            await sendTelegramMessage(confirmMsg, chatId);
          }
        }
      }
    }
  } catch (err) {
    console.debug('Polling telegram tick:', err.message);
  } finally {
    isPollingActive = false;
  }
}

// Inicializar configuración al cargar módulo
loadTelegramConfig();

// Sondeo periódico cada 5 segundos
setInterval(pollTelegramUpdates, TELEGRAM_CONFIG.pollIntervalMs);
setTimeout(pollTelegramUpdates, 1000);

// Exportar funciones para uso en app.js
window.TelegramService = {
  OFFICIAL_BOT_TOKEN: OFFICIAL_BOT_TOKEN,
  CONFIG: TELEGRAM_CONFIG,
  loadConfig: loadTelegramConfig,
  saveConfig: saveTelegramConfig,
  getReadings: getStoredReadings,
  saveReadings: saveStoredReadings,
  parseAndRegister: parseAndRegisterReading,
  checkInactivityAlerts: checkInactivityAlerts,
  sendMessage: sendTelegramMessage,
  detectChatId: detectChatIdFromUpdates,
  clearActiveAlert: clearActiveAlert,
  getActiveAlerts: getActiveAlerts,
  pollUpdates: pollTelegramUpdates
};
