/**
 * ============================================================================
 * TELEGRAM.JS — MÓDULO DE INTEGRACIÓN TELEGRAM & MOTOR DE ALERTAS INDUSTRIALES
 * Monitoreo de Soluble / Refrigerante — Línea "E" (BRP / KOLBEN)
 * ============================================================================
 */

// SECCIÓN DE CONFIGURACIÓN CLARAMENTE IDENTIFICADA
const TELEGRAM_CONFIG = {
  // Credenciales y endpoints de Telegram Bot API
  botToken: '', // Token del bot (ej. '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ')
  chatId: '',   // ID del chat o grupo de supervisores (ej. '-1001234567890')
  
  // Parámetros operativos
  pollIntervalMs: 15000,                  // Consulta cada 15 segundos
  alertInactivityLimitMs: 2 * 60 * 60 * 1000, // 2 HORAS (alerta por falta de lectura)
  minConcentrationThreshold: 4,           // Nivel mínimo requerido (entero 0-10)
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
  PROCESSED_MSGS: 'brp_soluble_processed_msgs_v1'
};

/**
 * Carga la configuración guardada desde localStorage o usa los valores por defecto.
 */
function loadTelegramConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.assign(TELEGRAM_CONFIG, parsed);
    }
  } catch (err) {
    console.warn('No se pudo cargar la configuración de Telegram:', err);
  }
  return TELEGRAM_CONFIG;
}

/**
 * Guarda la configuración de Telegram en localStorage.
 */
function saveTelegramConfig(newConfig) {
  Object.assign(TELEGRAM_CONFIG, newConfig);
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
    
    // Verificación de reinicio semanal (Regla 6: al completarse 1 semana se reinicia la base de datos)
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
      if (list.length > 500) list.shift(); // Evitar crecimiento desmedido
      localStorage.setItem(STORAGE_KEYS.PROCESSED_MSGS, JSON.stringify(list));
    }
  } catch (e) {
    console.error(e);
  }
}

/**
 * Envía un mensaje de texto mediante la API de Telegram.
 */
async function sendTelegramMessage(text) {
  if (!TELEGRAM_CONFIG.botToken || !TELEGRAM_CONFIG.chatId) {
    console.log('[Telegram Mock/Local] Alerta no enviada (falta token o chatId):', text);
    return false;
  }
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CONFIG.chatId,
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
 * PARSEO Y VALIDACIÓN DE LECTURA DESDE MENSAJE DE TELEGRAM (REGLA 7)
 * - Identifica etiqueta ("Tanque01 Linea E", etc.)
 * - Extrae valor entero entre 0 y 10
 * - Valida completitud e integridad (no inventa datos, no duplica)
 */
function parseAndRegisterReading(rawText, messageId = null, customDate = null) {
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
  // Busca expresiones como "Lectura: 7", "Brix 6", "valor: 5", o número aislado en la línea
  const numberMatch = rawText.match(/(?:valor|brix|lectura|concentraci[oó]n)?\s*:?\s*(\b10|[0-9]\b)/i);
  if (!numberMatch) {
    // Si no se pudo extraer una lectura válida, se solicita nuevamente la captura
    solicitarReenvioLectura(identifiedTank);
    return {
      success: false,
      reason: 'No se encontró un número entero válido (0 a 10) en la lectura.'
    };
  }

  const numericValue = parseInt(numberMatch[1], 10);
  if (isNaN(numericValue) || numericValue < 0 || numericValue > 10) {
    solicitarReenvioLectura(identifiedTank);
    return {
      success: false,
      reason: `El valor extraído (${numericValue}) está fuera del rango permitido (0-10).`
    };
  }

  // 4. Registro oficial con Fecha y Hora
  const now = customDate ? new Date(customDate) : new Date();
  const dayStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM

  const readings = getStoredReadings();
  const tankList = readings[identifiedTank] || [];

  // Validar lectura intermedia para evitar duplicidad de información en el mismo minuto
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

  // Desactivar alerta activa para este tanque al recibir lectura válida
  clearActiveAlert(identifiedTank);

  return {
    success: true,
    record: newRecord
  };
}

/**
 * Solicita nuevamente la captura si la imagen/texto no contiene lectura válida.
 */
function solicitarReenvioLectura(tankId) {
  const msg = `⚠️ <b>Aviso Línea E:</b> No fue posible extraer una lectura numérica válida (entero 0-10) para el <b>${tankId}</b>. Por favor envíe nuevamente una fotografía nítida con la etiqueta "<b>${tankId} Linea E</b>".`;
  sendTelegramMessage(msg);
}

/**
 * GESTIÓN DE ALERTAS POR FALTA DE LECTURA (> 2 HORAS) (REGLA 8)
 */
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

/**
 * Chequea la inactividad de cada tanque.
 * Si han pasado más de 2 horas sin nueva lectura y no hay alerta activa, envía mensaje.
 */
async function checkInactivityAlerts() {
  const readings = getStoredReadings();
  const alerts = getActiveAlerts();
  const now = Date.now();
  const limitMs = TELEGRAM_CONFIG.alertInactivityLimitMs; // 2 horas

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
      // Verificar si ya existe una alerta activa para evitar envíos repetitivos
      const alertInfo = alerts[tankId];
      if (!alertInfo || !alertInfo.active) {
        // Enviar alerta oficial por Telegram
        const message = `⚠️ <b>Aviso de Mantenimiento Línea E:</b> Se requiere enviar la lectura actual del soluble para el <b>${tankId}</b>. Han transcurrido más de 2 horas sin registro.`;
        const sent = await sendTelegramMessage(message);
        setActiveAlert(tankId);
        console.log(`[Alerta 2H Generada] ${tankId} - Mensaje enviado: ${sent}`);
      }
    }
  }
}

// Inicializar configuración al cargar módulo
loadTelegramConfig();

// Exportar funciones para uso en app.js
window.TelegramService = {
  CONFIG: TELEGRAM_CONFIG,
  loadConfig: loadTelegramConfig,
  saveConfig: saveTelegramConfig,
  getReadings: getStoredReadings,
  saveReadings: saveStoredReadings,
  parseAndRegister: parseAndRegisterReading,
  checkInactivityAlerts: checkInactivityAlerts,
  sendMessage: sendTelegramMessage,
  clearActiveAlert: clearActiveAlert,
  getActiveAlerts: getActiveAlerts
};

