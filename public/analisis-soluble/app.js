/**
 * ============================================================================
 * APP.JS — CONTROLADOR PRINCIPAL DEL LAYOUT Y DASHBOARD DE SOLUBLE
 * Línea "E" / BRP (KOLBEN)
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Estado Global de Navegación Histórica de Gráficas
  let historyOffsetHours = 0; // 0 = últimas 24 horas (en vivo); incrementos de 24 horas hacia atrás

  // Mapeo Oficial de Tanques a Operaciones Alimentadas (Regla 4)
  const TANK_FEED_MAP = {
    'Tanque01': ['OP50.1', 'OP60.1'],
    'Tanque02': ['Op50.2', 'OP60.2'],
    'Tanque03': ['Op70.1', 'Op70.2', 'Op80']
  };

  // Helper para buscar elementos por data-section de forma insensible a mayúsculas
  function getSectionElements(sectionName) {
    if (!sectionName) return [];
    const target = sectionName.trim().toLowerCase();
    const all = document.querySelectorAll('[data-section]');
    const results = [];
    all.forEach(el => {
      const val = (el.getAttribute('data-section') || '').trim().toLowerCase();
      if (val === target) {
        results.push(el);
      }
    });
    return results;
  }

  // Referencias DOM
  const tooltipEl = document.getElementById('hmiTooltip');
  const btnPrev = document.getElementById('btnHistPrev');
  const btnNext = document.getElementById('btnHistNext');
  const historyLabel = document.getElementById('histWindowLabel');
  const btnDownloadCsv = document.getElementById('btnDownloadCsv');
  const btnConfigTelegram = document.getElementById('btnConfigTelegram');
  const modalTelegram = document.getElementById('modalTelegram');
  const modalClose = document.getElementById('modalClose');
  const btnSaveTelegramConfig = document.getElementById('btnSaveTelegramConfig');
  const btnTestTelegram = document.getElementById('btnTestTelegram');
  const btnLoadDemoData = document.getElementById('btnLoadDemoData');
  const btnClearData = document.getElementById('btnClearData');
  const inputSimText = document.getElementById('simTelegramText');
  const btnSimSubmit = document.getElementById('btnSimSubmit');

  /**
   * ========================================================================
   * 1. EVALUACIÓN Y ACTUALIZACIÓN DE ESTADOS DE INDICADORES (REGLA 5)
   * ========================================================================
   */
  function updateIndicatorStatuses() {
    const readings = window.TelegramService.getReadings();
    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const minThreshold = window.TelegramService.CONFIG.minConcentrationThreshold || 4;

    // Estados calculados por Tanque
    const tankStatuses = {};

    ['Tanque01', 'Tanque02', 'Tanque03'].forEach(tankId => {
      const list = readings[tankId] || [];
      const tankElements = getSectionElements(tankId);

      tankElements.forEach(tankEl => {
        tankEl.classList.remove('status-green', 'status-blink-red', 'status-grey');

        if (list.length === 0) {
          // Sin capturas registradas: Fuera de línea (Gris fijo)
          tankStatuses[tankId] = 'offline';
          tankEl.classList.add('status-grey');
        } else {
          const lastCapture = list[list.length - 1];
          const elapsed = now - lastCapture.timestamp;

          // Regla: Rojo parpadeante si concentración < requerido o última captura > 24 horas
          if (lastCapture.valor < minThreshold || elapsed > ONE_DAY_MS) {
            tankStatuses[tankId] = 'warning';
            tankEl.classList.add('status-blink-red');
          } else {
            // Dentro de parámetros: Verde fijo
            tankStatuses[tankId] = 'ok';
            tankEl.classList.add('status-green');
          }
        }
      });
    });

    // Actualizar Operaciones según el tanque que las alimenta (Regla 4 y 5)
    Object.entries(TANK_FEED_MAP).forEach(([tankId, ops]) => {
      const tankState = tankStatuses[tankId];

      ops.forEach(opName => {
        const opElements = getSectionElements(opName);
        opElements.forEach(opEl => {
          // Regla Estricta: OP60.1 y OP60.2 permanecen siempre en ROJO FIJO (operaciones deshabilitadas)
          const normOp = opName.toUpperCase();
          if (normOp === 'OP60.1' || normOp === 'OP60.2') {
            opEl.classList.remove('status-green', 'status-blink-red', 'status-grey');
            opEl.classList.add('status-red');
            return;
          }

          // Operaciones alimentadas reflejan el estado del tanque
          opEl.classList.remove('status-green', 'status-blink-red', 'status-grey');
          if (tankState === 'warning') {
            opEl.classList.add('status-blink-red');
          } else if (tankState === 'ok') {
            opEl.classList.add('status-green');
          } else if (tankState === 'offline') {
            opEl.classList.add('status-grey');
          }
        });
      });
    });

    // Certificación: Siempre verde fijo en estado normal
    const certElements = getSectionElements('Certificación');
    certElements.forEach(certEl => {
      if (!certEl.classList.contains('status-green')) {
        certEl.classList.add('status-green');
      }
    });
  }

  /**
   * ========================================================================
   * 2. RENDERIZADO DE LAS 3 GRÁFICAS DE 24 HORAS CON HISTÓRICO (REGLA 6)
   * ========================================================================
   */
  function renderAllCharts() {
    const readings = window.TelegramService.getReadings();
    renderSingleChart('chartSvg01', readings.Tanque01 || [], 'Tanque01');
    renderSingleChart('chartSvg02', readings.Tanque02 || [], 'Tanque02');
    renderSingleChart('chartSvg03', readings.Tanque03 || [], 'Tanque03');
    updateHistoryControls();
  }

  function renderSingleChart(svgId, allSamples, tankName) {
    const svg = document.getElementById(svgId);
    if (!svg) return;

    // Dimensiones del área de dibujo
    const width = 690;
    const height = 75;
    const paddingLeft = 32;
    const paddingRight = 15;
    const paddingTop = 8;
    const paddingBottom = 16;

    const plotWidth = width - paddingLeft - paddingRight;
    const plotHeight = height - paddingTop - paddingBottom;

    // Ventana de 24 muestras (horas 1 a 24)
    const totalSamples = allSamples.length;
    let endIndex = totalSamples - historyOffsetHours;
    if (endIndex < 24) endIndex = Math.min(24, totalSamples);
    const startIndex = Math.max(0, endIndex - 24);

    const windowSamples = allSamples.slice(startIndex, endIndex);

    // Limpiar SVG
    svg.innerHTML = '';

    // 1. Líneas de Guía Horizontales (Eje Y: escala 0 a 10)
    const yTicks = [0, 2, 4, 6, 8, 10];
    yTicks.forEach(tickVal => {
      const y = paddingTop + plotHeight - (tickVal / 10) * plotHeight;

      // Línea de cuadrícula tenue
      const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      gridLine.setAttribute('x1', paddingLeft);
      gridLine.setAttribute('y1', y);
      gridLine.setAttribute('x2', width - paddingRight);
      gridLine.setAttribute('y2', y);
      gridLine.setAttribute('stroke', '#e2e8f0');
      gridLine.setAttribute('stroke-width', '1');
      svg.appendChild(gridLine);

      // Etiqueta del valor en el Eje Y
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', paddingLeft - 5);
      text.setAttribute('y', y + 3);
      text.setAttribute('text-anchor', 'end');
      text.setAttribute('font-size', '9');
      text.setAttribute('font-weight', '700');
      text.setAttribute('fill', '#64748b');
      text.textContent = tickVal;
      svg.appendChild(text);
    });

    // 2. Ticks y Etiquetas del Eje X (1 a 24 horas)
    const stepX = plotWidth / 23;
    for (let h = 1; h <= 24; h++) {
      const x = paddingLeft + (h - 1) * stepX;
      
      const xText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      xText.setAttribute('x', x);
      xText.setAttribute('y', height - 2);
      xText.setAttribute('text-anchor', 'middle');
      xText.setAttribute('font-size', '8.5');
      xText.setAttribute('font-weight', '600');
      xText.setAttribute('fill', '#64748b');
      xText.textContent = h;
      svg.appendChild(xText);
    }

    // 3. Trazado de la Línea de Concentración si existen datos
    if (windowSamples.length > 0) {
      const points = [];
      windowSamples.forEach((item, idx) => {
        const x = paddingLeft + idx * stepX;
        const valClamped = Math.max(0, Math.min(10, item.valor));
        const y = paddingTop + plotHeight - (valClamped / 10) * plotHeight;
        points.push({ x, y, item, hourIndex: idx + 1 });
      });

      // Crear Polyline Azul
      if (points.length > 1) {
        const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        const pointsStr = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
        polyline.setAttribute('points', pointsStr);
        polyline.setAttribute('fill', 'none');
        polyline.setAttribute('stroke', '#2563eb');
        polyline.setAttribute('stroke-width', '1.8');
        polyline.setAttribute('stroke-linejoin', 'round');
        svg.appendChild(polyline);
      }

      // Marcadores circulares y Tooltips interactivos
      points.forEach(p => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', p.x);
        circle.setAttribute('cy', p.y);
        circle.setAttribute('r', '2.5');
        circle.setAttribute('fill', '#1d4ed8');
        circle.setAttribute('stroke', '#ffffff');
        circle.setAttribute('stroke-width', '1');
        circle.style.cursor = 'pointer';

        circle.addEventListener('mouseenter', (e) => {
          tooltipEl.innerHTML = `<strong>${tankName} (Hora ${p.hourIndex})</strong><br>Concentración: <strong>${p.item.valor}</strong><br>Fecha: ${p.item.dia} ${p.item.hora}`;
          tooltipEl.style.display = 'block';
          tooltipEl.style.left = `${e.clientX + 10}px`;
          tooltipEl.style.top = `${e.clientY - 30}px`;
        });

        circle.addEventListener('mousemove', (e) => {
          tooltipEl.style.left = `${e.clientX + 10}px`;
          tooltipEl.style.top = `${e.clientY - 30}px`;
        });

        circle.addEventListener('mouseleave', () => {
          tooltipEl.style.display = 'none';
        });

        svg.appendChild(circle);
      });
    }
  }

  function updateHistoryControls() {
    if (historyOffsetHours === 0) {
      historyLabel.textContent = 'Ventana: Últimas 24 horas (En Vivo)';
      btnNext.disabled = true;
    } else {
      const daysBack = (historyOffsetHours / 24).toFixed(1);
      historyLabel.textContent = `Histórico: -${daysBack} días (${historyOffsetHours}h atrás)`;
      btnNext.disabled = false;
    }

    const MAX_HIST_HOURS = 7 * 24;
    btnPrev.disabled = (historyOffsetHours >= MAX_HIST_HOURS - 24);
  }

  // Navegación de Gráficas: Flechas en el lado derecho (Regla 6)
  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      historyOffsetHours = Math.min(7 * 24 - 24, historyOffsetHours + 24);
      renderAllCharts();
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      historyOffsetHours = Math.max(0, historyOffsetHours - 24);
      renderAllCharts();
    });
  }

  /**
   * ========================================================================
   * 3. DESCARGA DE DATOS EN CSV (REGLA 9)
   * Columnas exactas: Consecutivo, Día, Hora, Valor
   * ========================================================================
   */
  function exportReadingsToCsv() {
    const readings = window.TelegramService.getReadings();
    const rows = [
      ['Consecutivo', 'Día', 'Hora', 'Valor']
    ];

    let counter = 1;
    ['Tanque01', 'Tanque02', 'Tanque03'].forEach(tankId => {
      const list = readings[tankId] || [];
      list.forEach(r => {
        rows.push([
          counter++,
          r.dia,
          r.hora,
          r.valor
        ]);
      });
    });

    if (rows.length === 1) {
      alert('No hay registros de lecturas disponibles para descargar en CSV.');
      return;
    }

    const csvContent = '\uFEFF' + rows.map(r => r.join(',')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const today = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `Monitoreo_Soluble_Linea_E_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (btnDownloadCsv) {
    btnDownloadCsv.addEventListener('click', exportReadingsToCsv);
  }

  /**
   * ========================================================================
   * 4. TOOLTIPS E INTERACCIÓN CON ELEMENTOS DEL LAYOUT SVG
   * ========================================================================
   */
  const interactiveSections = document.querySelectorAll('[data-section]');
  interactiveSections.forEach(el => {
    el.addEventListener('mouseenter', (e) => {
      const name = el.getAttribute('data-section');
      let statusDesc = 'Operativo / En línea';

      if (el.classList.contains('status-red')) {
        statusDesc = 'Operación Deshabilitada (Rojo fijo)';
      } else if (el.classList.contains('status-blink-red')) {
        statusDesc = 'Alerta: Concentración baja o última lectura > 24h';
      } else if (el.classList.contains('status-green')) {
        statusDesc = 'Concentración dentro de parámetros (OK)';
      } else if (el.classList.contains('status-grey')) {
        statusDesc = 'Fuera de línea';
      }

      tooltipEl.innerHTML = `<strong>${name}</strong><br>Estado: ${statusDesc}`;
      tooltipEl.style.display = 'block';
      tooltipEl.style.left = `${e.clientX + 12}px`;
      tooltipEl.style.top = `${e.clientY + 12}px`;
    });

    el.addEventListener('mousemove', (e) => {
      tooltipEl.style.left = `${e.clientX + 12}px`;
      tooltipEl.style.top = `${e.clientY + 12}px`;
    });

    el.addEventListener('mouseleave', () => {
      tooltipEl.style.display = 'none';
    });
  });

  /**
   * ========================================================================
   * 5. GESTIÓN DE CONFIGURACIÓN Y SIMULACIÓN DE TELEGRAM
   * ========================================================================
   */
  if (btnConfigTelegram) {
    btnConfigTelegram.addEventListener('click', () => {
      const cfg = window.TelegramService.CONFIG;
      const defaultToken = window.TelegramService.OFFICIAL_BOT_TOKEN;
      const defaultChatId = window.TelegramService.OFFICIAL_DEFAULT_CHAT_ID || '786120019';
      document.getElementById('telegramBotToken').value = cfg.botToken || defaultToken;
      document.getElementById('telegramChatId').value = cfg.chatId || defaultChatId;
      document.getElementById('telegramMinConcentration').value = cfg.minConcentrationThreshold || 4;
      modalTelegram.classList.add('active');
    });
  }

  if (modalClose) {
    modalClose.addEventListener('click', () => {
      modalTelegram.classList.remove('active');
    });
  }

  // Botón para auto-detectar el Chat ID desde getUpdates
  const btnDetectChatId = document.getElementById('btnDetectChatId');
  if (btnDetectChatId) {
    btnDetectChatId.addEventListener('click', async () => {
      btnDetectChatId.disabled = true;
      btnDetectChatId.textContent = 'Buscando...';
      const res = await window.TelegramService.detectChatId();
      btnDetectChatId.disabled = false;
      btnDetectChatId.textContent = '🔍 Auto-detectar';

      if (res.success) {
        document.getElementById('telegramChatId').value = res.chatId;
        alert(`✅ Chat ID detectado con éxito:\n${res.chatId} (${res.chatTitle})\n\nYa puedes probar la conexión.`);
      } else {
        alert(
          'ℹ️ No se detectó ningún mensaje entrante aún.\n\n' +
          '1. Abre Telegram y entra a: https://t.me/DASHBOARD_BRP_bot\n' +
          '2. Presiona "Iniciar" o envía cualquier mensaje (ej. /start o Hola)\n' +
          '3. Vuelve aquí y presiona "Auto-detectar".'
        );
      }
    });
  }

  if (btnSaveTelegramConfig) {
    btnSaveTelegramConfig.addEventListener('click', () => {
      const token = document.getElementById('telegramBotToken').value.trim() || window.TelegramService.OFFICIAL_BOT_TOKEN;
      const chatId = document.getElementById('telegramChatId').value.trim();
      const minConc = parseInt(document.getElementById('telegramMinConcentration').value, 10) || 4;

      window.TelegramService.saveConfig({
        botToken: token,
        chatId: chatId,
        minConcentrationThreshold: minConc
      });

      alert('Configuración de Telegram guardada correctamente.');
      modalTelegram.classList.remove('active');
      updateIndicatorStatuses();
    });
  }

  if (btnTestTelegram) {
    btnTestTelegram.addEventListener('click', async () => {
      btnTestTelegram.disabled = true;
      btnTestTelegram.textContent = 'Verificando...';

      const tokenInput = document.getElementById('telegramBotToken').value.trim() || window.TelegramService.OFFICIAL_BOT_TOKEN;
      let chatIdInput = document.getElementById('telegramChatId').value.trim();

      // Si el Chat ID está vacío, intentamos auto-detectarlo automáticamente
      if (!chatIdInput) {
        btnTestTelegram.textContent = 'Detectando Chat ID...';
        const detectRes = await window.TelegramService.detectChatId();
        if (detectRes.success) {
          chatIdInput = detectRes.chatId;
          document.getElementById('telegramChatId').value = chatIdInput;
          window.TelegramService.saveConfig({ botToken: tokenInput, chatId: chatIdInput });
        } else {
          btnTestTelegram.disabled = false;
          btnTestTelegram.textContent = 'Probar Conexión con Telegram';
          alert(
            '⚠️ Para enviar el mensaje de prueba, primero debes iniciar una conversación con el bot:\n\n' +
            '1. Entra a: https://t.me/DASHBOARD_BRP_bot (@DASHBOARD_BRP_bot)\n' +
            '2. Presiona "Iniciar" o envía /start\n' +
            '3. Vuelve a hacer clic aquí en "Probar Conexión con Telegram".\n\n' +
            'Tu Chat ID se vinculará automáticamente.'
          );
          return;
        }
      }

      btnTestTelegram.textContent = 'Enviando prueba...';
      const ok = await window.TelegramService.sendMessage(
        '🔔 <b>Prueba de Conexión Exitosa:</b> El sistema de Monitoreo de Soluble Línea E (BRP / KOLBEN) está vinculado correctamente.',
        chatIdInput
      );
      btnTestTelegram.disabled = false;
      btnTestTelegram.textContent = 'Probar Conexión con Telegram';

      if (ok) {
        alert(`✅ Mensaje de prueba enviado exitosamente a Telegram.\nChat ID vinculado: ${chatIdInput}`);
      } else {
        alert('❌ No se pudo enviar el mensaje. Asegúrate de haber enviado /start al bot en Telegram antes de probar.');
      }
    });
  }

  // Simulación de Entrada Telegram
  if (btnSimSubmit) {
    btnSimSubmit.addEventListener('click', () => {
      const text = inputSimText.value.trim();
      if (!text) return;

      const res = window.TelegramService.parseAndRegister(text);
      if (res.success) {
        alert(`Lectura registrada correctamente:\nTanque: ${res.record.tanque}\nValor: ${res.record.valor}\nFecha: ${res.record.dia} ${res.record.hora}`);
        inputSimText.value = '';
        renderAllCharts();
        updateIndicatorStatuses();
      } else {
        alert(`Error al procesar lectura:\n${res.reason}`);
      }
    });
  }

  // Simulación y prueba de OCR desde archivo de imagen (Regla 7)
  const btnSimImageSubmit = document.getElementById('btnSimImageSubmit');
  const simImageInput = document.getElementById('simImageInput');
  const simTankSelect = document.getElementById('simTankSelect');
  const simOcrStatus = document.getElementById('simOcrStatus');

  if (btnSimImageSubmit && simImageInput) {
    btnSimImageSubmit.addEventListener('click', async () => {
      const file = simImageInput.files && simImageInput.files[0];
      if (!file) {
        alert('Por favor selecciona un archivo de imagen primero.');
        return;
      }

      const tank = simTankSelect ? simTankSelect.value : 'Tanque02';
      const label = `${tank} Linea E`;

      if (simOcrStatus) simOcrStatus.textContent = 'Analizando imagen con OCR...';
      btnSimImageSubmit.disabled = true;

      try {
        const extractedValue = await window.TelegramService.extractNumberFromImage(file);
        if (extractedValue !== null) {
          const res = window.TelegramService.parseAndRegister(label, null, null, null, extractedValue);
          if (res.success) {
            if (simOcrStatus) simOcrStatus.textContent = `✅ OCR Exitoso: ${extractedValue} Brix registrado para ${tank}.`;
            alert(`✅ OCR Exitoso!\nTanque: ${res.record.tanque}\nValor extraído de imagen: ${res.record.valor} Brix\nFecha y Hora: ${res.record.dia} ${res.record.hora}`);
            renderAllCharts();
            updateIndicatorStatuses();
          } else {
            if (simOcrStatus) simOcrStatus.textContent = `❌ Error: ${res.reason}`;
            alert(`Error al registrar:\n${res.reason}`);
          }
        } else {
          if (simOcrStatus) simOcrStatus.textContent = '❌ No se pudo extraer un dígito numérico (0-10) de la imagen.';
          alert('No se pudo extraer una lectura válida (0-10) de la imagen.');
        }
      } catch (err) {
        if (simOcrStatus) simOcrStatus.textContent = `Error: ${err.message}`;
        alert(`Error procesando OCR: ${err.message}`);
      } finally {
        btnSimImageSubmit.disabled = false;
      }
    });
  }

  // Cargar datos demo de referencia (para verificar visualmente las 3 gráficas como en la imagen)
  if (btnLoadDemoData) {
    btnLoadDemoData.addEventListener('click', () => {
      const sampleWaves = {
        Tanque01: [7, 2, 6, 6, 8, 4, 3, 3, 2, 5, 7, 9, 9, 2, 6, 5, 9, 7, 9, 3, 9, 5, 8, 3, 2],
        Tanque02: [6, 2, 6, 6, 8, 4, 3, 3, 2, 4, 6, 9, 9, 2, 6, 5, 9, 7, 9, 3, 9, 5, 8, 3, 2],
        Tanque03: [6, 2, 5, 5, 7, 4, 3, 3, 2, 4, 6, 8, 8, 2, 6, 5, 8, 7, 8, 3, 8, 5, 7, 3, 2]
      };

      const now = new Date();
      const mockReadings = { Tanque01: [], Tanque02: [], Tanque03: [] };

      ['Tanque01', 'Tanque02', 'Tanque03'].forEach(tankId => {
        const wave = sampleWaves[tankId];
        wave.forEach((val, i) => {
          const sampleDate = new Date(now.getTime() - (24 - i) * 3600 * 1000);
          mockReadings[tankId].push({
            consecutivo: i + 1,
            dia: sampleDate.toISOString().split('T')[0],
            hora: sampleDate.toTimeString().split(' ')[0].substring(0, 5),
            valor: val,
            timestamp: sampleDate.getTime(),
            tanque: tankId
          });
        });
      });

      window.TelegramService.saveReadings(mockReadings);
      alert('Datos de referencia cargados exitosamente.');
      modalTelegram.classList.remove('active');
      renderAllCharts();
      updateIndicatorStatuses();
    });
  }

  // Limpiar base de datos
  if (btnClearData) {
    btnClearData.addEventListener('click', () => {
      if (confirm('¿Está seguro de que desea reiniciar la base de datos de solubles?')) {
        window.TelegramService.saveReadings({ Tanque01: [], Tanque02: [], Tanque03: [] });
        renderAllCharts();
        updateIndicatorStatuses();
      }
    });
  }

  /**
   * ========================================================================
   * 6. CICLO PERIÓDICO (ALERTAS DE INACTIVIDAD DE 2 HORAS) Y TIEMPO REAL
   * ========================================================================
   */
  // Escuchar lecturas entrantes desde Telegram en tiempo real
  window.addEventListener('brp_reading_registered', () => {
    renderAllCharts();
    updateIndicatorStatuses();
  });

  renderAllCharts();
  updateIndicatorStatuses();
  window.TelegramService.checkInactivityAlerts();

  setInterval(() => {
    window.TelegramService.checkInactivityAlerts();
    updateIndicatorStatuses();
  }, 60000);
});
