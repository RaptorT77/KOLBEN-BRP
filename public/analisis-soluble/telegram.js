/**
 * ============================================================================
 * TELEGRAM.JS — MÓDULO DE INTEGRACIÓN TELEGRAM, OCR INDUSTRIAL & MOTOR DE ALERTAS
 * Monitoreo de Soluble / Refrigerante — Línea "E" (BRP / KOLBEN)
 * Bot Oficial: @DASHBOARD_BRP_bot (https://t.me/DASHBOARD_BRP_bot)
 * ============================================================================
 */

const OFFICIAL_BOT_TOKEN = '9151291473:AAEDQ-q0fUckTWTv3Rw2v9mYsaEBdaaWVV4';
const OFFICIAL_BOT_USERNAME = 'DASHBOARD_BRP_bot';
const OFFICIAL_DEFAULT_CHAT_ID = '786120019'; // Chat ID verificado de Tony

// SECCIÓN DE CONFIGURACIÓN OFICIAL
const TELEGRAM_CONFIG = {
  botToken: OFFICIAL_BOT_TOKEN,
  botUsername: OFFICIAL_BOT_USERNAME,
  chatId: OFFICIAL_DEFAULT_CHAT_ID,
  
  // Parámetros operativos
  pollIntervalMs: 5000,                           // Sondeo cada 5 segundos
  alertInactivityLimitMs: 2 * 60 * 60 * 1000,    // 2 HORAS (alerta por falta de lectura)
  minConcentrationThreshold: 4,                   // Nivel mínimo requerido (0-10)
  maxConcentrationThreshold: 8,                   // Rango superior de trabajo
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
      TELEGRAM_CONFIG.chatId = parsed.chatId || OFFICIAL_DEFAULT_CHAT_ID;
      TELEGRAM_CONFIG.minConcentrationThreshold = parsed.minConcentrationThreshold || 4;
    } else {
      TELEGRAM_CONFIG.botToken = OFFICIAL_BOT_TOKEN;
      TELEGRAM_CONFIG.chatId = OFFICIAL_DEFAULT_CHAT_ID;
    }
  } catch (err) {
    TELEGRAM_CONFIG.botToken = OFFICIAL_BOT_TOKEN;
    TELEGRAM_CONFIG.chatId = OFFICIAL_DEFAULT_CHAT_ID;
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
 * Incluye corrección automática si existía el registro previo erróneo de 2 para Tanque02.
 */
function getStoredReadings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.READINGS);
    if (!raw) return { Tanque01: [], Tanque02: [], Tanque03: [] };
    const data = JSON.parse(raw);

    // Corrección automática: rectificar lectura errónea previa (2 en lugar de 5) para Tanque02
    if (data.Tanque02 && Array.isArray(data.Tanque02)) {
      let corrected = false;
      data.Tanque02.forEach(rec => {
        if (rec.valor === 2 && (rec.hora === '11:54' || rec.hora === '11:55')) {
          rec.valor = 5;
          corrected = true;
        }
      });
      if (corrected) {
        saveStoredReadings(data);
      }
    }
    
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
 * Obtiene la URL pública directa de una foto enviada por Telegram.
 */
async function getTelegramPhotoUrl(fileId) {
  const token = TELEGRAM_CONFIG.botToken || OFFICIAL_BOT_TOKEN;
  if (!token || !fileId) return null;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
    const data = await res.json();
    if (data.ok && data.result && data.result.file_path) {
      return `https://api.telegram.org/file/bot${token}/${data.result.file_path}`;
    }
  } catch (e) {
    console.error('Error obteniendo ruta de foto de Telegram:', e);
  }
  return null;
}

/**
 * ============================================================================
 * MOTOR DE VISIÓN COMPUTACIONAL Y OCR PARA LECTURA DE SOLUBLE
 * ============================================================================
 */

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Extrae y mapea posibles caracteres confusos de OCR a dígitos 0 a 10.
 */
function extractDigitFromOcrText(text) {
  if (!text) return null;
  const cleaned = String(text).trim();

  // 1. Coincidencia exacta o delimitada por palabra
  const match = cleaned.match(/\b(10|[0-9])\b/);
  if (match) return parseInt(match[1], 10);

  // 2. Coincidencia con 10
  if (/10/.test(cleaned)) return 10;

  // 3. Cualquier dígito aislado
  const anyDigit = cleaned.match(/[0-9]/);
  if (anyDigit) return parseInt(anyDigit[0], 10);

  // 4. Mapeo de confusiones tipográficas comunes en OCR industrial:
  if (/[sS§$]/.test(cleaned)) return 5;
  if (/[oOD]/.test(cleaned)) return 0;
  if (/[lI|!]/.test(cleaned)) return 1;
  if (/[bB]/.test(cleaned)) return 8;
  if (/[zZ]/.test(cleaned)) return 2;

  return null;
}

/**
 * Crea un canvas procesado con recorte opcional y realce de contraste/binarización.
 */
function createCroppedCanvas(img, cropBox = null, enhanceContrast = true) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  const naturalW = img.naturalWidth || img.width || 300;
  const naturalH = img.naturalHeight || img.height || 300;

  let sx = 0, sy = 0, sw = naturalW, sh = naturalH;
  if (cropBox) {
    sx = Math.max(0, cropBox.x);
    sy = Math.max(0, cropBox.y);
    sw = Math.min(naturalW - sx, cropBox.w);
    sh = Math.min(naturalH - sy, cropBox.h);
  }

  // Escalado para garantizar definición en OCR
  let scale = 1;
  if (sh < 220) scale = Math.min(3, 220 / Math.max(sh, 1));
  canvas.width = Math.round(sw * scale);
  canvas.height = Math.round(sh * scale);

  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

  if (enhanceContrast) {
    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      let min = 255, max = 0;

      for (let i = 0; i < data.length; i += 4) {
        const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        if (lum < min) min = lum;
        if (lum > max) max = lum;
      }

      const range = max - min || 1;
      for (let i = 0; i < data.length; i += 4) {
        const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const normalized = ((lum - min) / range) * 255;
        const val = normalized > 135 ? 255 : (normalized < 85 ? 0 : normalized);
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
      }
      ctx.putImageData(imgData, 0, 0);
    } catch (e) {
      console.warn('Canvas pixel processing skipped (CORS fallback):', e);
    }
  }

  return canvas;
}

/**
 * Detecta la caja de la tarjeta o pantalla de lectura (zona de alto contraste brillante central).
 */
function findBrightCardBoundingBox(img) {
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(img, 0, 0, w, h);

  try {
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    const minY = Math.round(h * 0.18);
    const maxY = Math.round(h * 0.82);
    const minX = Math.round(w * 0.12);
    const maxX = Math.round(w * 0.88);

    let boxMinX = maxX, boxMaxX = minX;
    let boxMinY = maxY, boxMaxY = minY;
    let brightCount = 0;

    for (let y = minY; y < maxY; y++) {
      for (let x = minX; x < maxX; x++) {
        const idx = (y * w + x) * 4;
        const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        if (lum > 165) {
          brightCount++;
          if (x < boxMinX) boxMinX = x;
          if (x > boxMaxX) boxMaxX = x;
          if (y < boxMinY) boxMinY = y;
          if (y > boxMaxY) boxMaxY = y;
        }
      }
    }

    if (brightCount > 300 && boxMaxX > boxMinX && boxMaxY > boxMinY) {
      const bw = boxMaxX - boxMinX;
      const bh = boxMaxY - boxMinY;
      if (bw > 25 && bh > 25 && bw < w * 0.95 && bh < h * 0.95) {
        const padX = Math.round(bw * 0.05);
        const padY = Math.round(bh * 0.05);
        return {
          x: Math.max(0, boxMinX - padX),
          y: Math.max(0, boxMinY - padY),
          w: Math.min(w - Math.max(0, boxMinX - padX), bw + padX * 2),
          h: Math.min(h - Math.max(0, boxMinY - padY), bh + padY * 2)
        };
      }
    }
  } catch (err) {
    console.warn('Bounding box detection fallback:', err);
  }

  // Zona central de enfoque por defecto
  return {
    x: Math.round(w * 0.22),
    y: Math.round(h * 0.28),
    w: Math.round(w * 0.56),
    h: Math.round(h * 0.44)
  };
}

/**
 * Ejecuta OCR sobre una fuente de imagen (URL, Blob o HTMLImageElement).
 * Extrae un número entero entre 0 y 10.
 */
async function extractNumberFromImage(imageSource) {
  if (!imageSource) return null;
  try {
    let img;
    if (typeof imageSource === 'string') {
      img = await loadImage(imageSource);
    } else if (imageSource instanceof HTMLImageElement) {
      img = imageSource;
    } else if (imageSource instanceof Blob) {
      const objUrl = URL.createObjectURL(imageSource);
      img = await loadImage(objUrl);
    } else {
      return null;
    }

    const tesseractLib = window.Tesseract;
    if (!tesseractLib) {
      console.warn('[OCR] Tesseract.js no está disponible en window.');
      return null;
    }

    // Estrategia 1: Zona brillante de alta reflectancia (tarjeta o pantalla refractómetro)
    const brightBox = findBrightCardBoundingBox(img);
    const canvasBright = createCroppedCanvas(img, brightBox, true);
    try {
      const resBright = await tesseractLib.recognize(canvasBright, 'eng');
      const valBright = extractDigitFromOcrText(resBright?.data?.text);
      if (valBright !== null && valBright >= 0 && valBright <= 10) {
        console.log(`[OCR] Detectado en caja brillante: ${valBright} (raw: "${resBright?.data?.text?.trim()}")`);
        return valBright;
      }
    } catch (e1) {
      console.warn('OCR intento 1 error:', e1);
    }

    // Estrategia 2: Recorte central del 50%
    const centerBox = {
      x: Math.round(img.naturalWidth * 0.22),
      y: Math.round(img.naturalHeight * 0.28),
      w: Math.round(img.naturalWidth * 0.56),
      h: Math.round(img.naturalHeight * 0.44)
    };
    const canvasCenter = createCroppedCanvas(img, centerBox, true);
    try {
      const resCenter = await tesseractLib.recognize(canvasCenter, 'eng');
      const valCenter = extractDigitFromOcrText(resCenter?.data?.text);
      if (valCenter !== null && valCenter >= 0 && valCenter <= 10) {
        console.log(`[OCR] Detectado en recorte central: ${valCenter} (raw: "${resCenter?.data?.text?.trim()}")`);
        return valCenter;
      }
    } catch (e2) {
      console.warn('OCR intento 2 error:', e2);
    }

    // Estrategia 3: Imagen completa con realce
    const canvasFull = createCroppedCanvas(img, null, true);
    try {
      const resFull = await tesseractLib.recognize(canvasFull, 'eng');
      const valFull = extractDigitFromOcrText(resFull?.data?.text);
      if (valFull !== null && valFull >= 0 && valFull <= 10) {
        console.log(`[OCR] Detectado en imagen completa: ${valFull} (raw: "${resFull?.data?.text?.trim()}")`);
        return valFull;
      }
    } catch (e3) {
      console.warn('OCR intento 3 error:', e3);
    }

  } catch (err) {
    console.error('[OCR] Error general al procesar imagen:', err);
  }
  return null;
}

/**
 * ============================================================================
 * PARSEO Y REGISTRO OFICIAL DE LECTURAS (REGLA 7)
 * ============================================================================
 */
function parseAndRegisterReading(rawText, messageId = null, customDate = null, fromChatId = null, explicitNumericValue = null) {
  if (!rawText && explicitNumericValue === null) {
    return { success: false, reason: 'Texto o lectura vacía' };
  }

  // 1. Identificar Tanque según etiquetas oficiales requeridas
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
  let numericValue = null;

  if (explicitNumericValue !== null && !isNaN(explicitNumericValue)) {
    numericValue = parseInt(explicitNumericValue, 10);
  } else {
    // REGLA CRÍTICA: Eliminar la etiqueta del tanque antes de buscar el número en el texto
    // para evitar que "Tanque02" sea erróneamente interpretado como lectura 2
    const cleanText = rawText
      .replace(/Tanque\s*0?[123]/gi, ' ')
      .replace(/L[ií]nea\s*[Ee]/gi, ' ')
      .trim();

    const numberMatch = cleanText.match(/(?:valor|brix|lectura|concentraci[oó]n)?\s*:?\s*(\b10|[0-9]\b)/i);
    if (numberMatch) {
      numericValue = parseInt(numberMatch[1], 10);
    }
  }

  if (numericValue === null || isNaN(numericValue)) {
    solicitarReenvioLectura(identifiedTank, fromChatId);
    return {
      success: false,
      reason: 'No se encontró un número entero válido (0 a 10) en la fotografía o texto.'
    };
  }

  if (numericValue < 0 || numericValue > 10) {
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

  // Evitar duplicados inmediatos idénticos en menos de 1 minuto
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
  const msg = `⚠️ <b>Aviso Línea E:</b> No fue posible extraer una lectura numérica válida (entero 0-10) de la imagen para el <b>${tankId}</b>. Por favor envíe nuevamente una fotografía nítida con la etiqueta "<b>${tankId} Linea E</b>".`;
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
 * ============================================================================
 * MOTOR DE CONSULTA EN TIEMPO REAL (TELEGRAM POLLING CON SOPORTE OCR DE FOTOS)
 * ============================================================================
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
          const welcomeMsg = `👋 <b>Bienvenido al Monitor de Soluble Línea E (BRP)</b>\n\nPara registrar lecturas de soluble, envíe la foto del refractómetro o pantalla con una de estas etiquetas oficiales:\n• <code>Tanque01 Linea E</code>\n• <code>Tanque02 Linea E</code>\n• <code>Tanque03 Linea E</code>\n\nEl sistema extraerá automáticamente el valor numérico (0 a 10) desde la fotografía mediante OCR y actualizará el layout en tiempo real.`;
          await sendTelegramMessage(welcomeMsg, chatId);
          continue;
        }

        const hasTag = Object.values(TELEGRAM_CONFIG.validTags).some(rx => rx.test(rawText));
        if (hasTag) {
          let identifiedTank = null;
          for (const [tankKey, regex] of Object.entries(TELEGRAM_CONFIG.validTags)) {
            if (regex.test(rawText)) {
              identifiedTank = tankKey;
              break;
            }
          }

          // Verificar si el operador escribió el valor en el texto
          const cleanText = rawText
            .replace(/Tanque\s*0?[123]/gi, ' ')
            .replace(/L[ií]nea\s*[Ee]/gi, ' ')
            .trim();
          const textMatch = cleanText.match(/(?:valor|brix|lectura|concentraci[oó]n)?\s*:?\s*(\b10|[0-9]\b)/i);
          let extractedValue = textMatch ? parseInt(textMatch[1], 10) : null;

          // Si el texto no incluye un número explícito, extraer de la fotografía mediante OCR
          if (extractedValue === null && Array.isArray(msg.photo) && msg.photo.length > 0) {
            const bestPhoto = msg.photo[msg.photo.length - 1];
            const photoUrl = await getTelegramPhotoUrl(bestPhoto.file_id);
            if (photoUrl) {
              console.log(`[OCR Telegram] Procesando fotografía de ${identifiedTank}:`, photoUrl);
              extractedValue = await extractNumberFromImage(photoUrl);
              console.log(`[OCR Telegram] Resultado extraído:`, extractedValue);
            }
          }

          const res = parseAndRegisterReading(rawText, msg.message_id, msg.date * 1000, chatId, extractedValue);
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
  OFFICIAL_DEFAULT_CHAT_ID: OFFICIAL_DEFAULT_CHAT_ID,
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
  pollUpdates: pollTelegramUpdates,
  extractNumberFromImage: extractNumberFromImage
};
