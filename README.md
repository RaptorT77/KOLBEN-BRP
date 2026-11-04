# Sistema de Control Visual y Mantenimiento — Línea E (BRP / KOLBEN)

[![GitHub Pages Deployment](https://img.shields.io/badge/Live_Site-GitHub_Pages-22c55e?style=for-the-badge&logo=github)](https://raptort77.github.io/KOLBEN-BRP/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2.35-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase Realtime](https://img.shields.io/badge/Supabase-Realtime_Sync-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Telegram Bot API](https://img.shields.io/badge/Telegram_Bot-@DASHBOARD__BRP__bot-229ED9?style=for-the-badge&logo=telegram)](https://t.me/DASHBOARD_BRP_bot)
[![Tesseract OCR](https://img.shields.io/badge/Computer_Vision-Tesseract_OCR-blueviolet?style=for-the-badge)](https://tesseract.projectnaptha.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

Plataforma web ejecutiva e industrial de monitoreo integral para la planta de producción de BRP (Línea E / Producto 9X3). Integra en una arquitectura moderna y sincronizada dos módulos operativos fundamentales:

1. **Mapa de Calor de Mantenimiento**: Reproducción 100% fiel del documento técnico oficial `Mapa_Calor_Mantenimiento_Linea_E.pdf` con checklists interactivos por equipo, casillas OK/NA y sincronización instantánea multi-dispositivo (<50ms).
2. **Análisis y Monitoreo de Soluble / Refrigerante**: Diagrama de layout HMI industrial, gráficas de concentración de 24 horas con navegación histórica semanal, integración con Telegram Bot (@DASHBOARD_BRP_bot), visión computacional OCR para extracción automática de lecturas desde fotografías del refractómetro, motor de alertas tras 2 horas de inactividad y descarga oficial en CSV.

---

## 🌐 Enlaces Oficiales

- **Aplicación Web en Vivo (Mapa de Calor):** [https://raptort77.github.io/KOLBEN-BRP/](https://raptort77.github.io/KOLBEN-BRP/)
- **Módulo de Análisis de Soluble (Layout HMI):** [https://raptort77.github.io/KOLBEN-BRP/analisis-soluble/](https://raptort77.github.io/KOLBEN-BRP/analisis-soluble/)
- **Bot Oficial de Telegram:** [@DASHBOARD_BRP_bot](https://t.me/DASHBOARD_BRP_bot)
- **Manual Oficial de Usuario (PDF):** [Descargar Manual en PDF](https://raptort77.github.io/KOLBEN-BRP/Manual_Usuario_Mapa_Calor_Linea_E.pdf)
- **Repositorio de Código en GitHub:** [https://github.com/RaptorT77/KOLBEN-BRP](https://github.com/RaptorT77/KOLBEN-BRP)

---

## ⚡ Módulo 1: Mapa de Calor de Mantenimiento

### Características Principales
- **Sincronización en Tiempo Real Multi-Dispositivo (<50ms):** Sincronización instantánea mediante canales WebSocket de Supabase Realtime y base de datos Postgres persistente en la nube (`public.brp_heatmap_state`).
- **Fidelidad Estricta al PDF Oficial (Sin Información Inventada):** Matriz exacta de **16 filas de Equipos × 30 columnas de Actividades = 480 celdas**.
  - **314 celdas deshabilitadas** (bloqueadas, estructuralmente no editables).
  - **166 celdas activas** (inicialmente pendientes, editables por el técnico).
- **Checklist Oficial Numerado con Casillas OK y NA:**
  - Casillas táctiles ergonómicas ($\ge 44\times 44\text{px}$) con numeración técnica oficial (ej. `10.1`, `40.3`, `300.1`).
  - **Casilla "NA" (No Aplica):** Excluye y tacha la actividad sin penalizar el cálculo del semáforo.
  - **Exclusividad Estricta Fila × Columna:** Cada celda (`${rowId}_${colId}`) mantiene un estado independiente e intransferible.
- **Transición de Estados y Semáforos:**
  - `PEND.` (**Rojo**, `#EF4444`): 0 casillas aplicables concluidas.
  - `RUN` (**Ámbar**, `#F59E0B`): Entre 1 y N-1 casillas aplicables concluidas.
  - `OK` (**Verde**, `#22C55E`): 100% de casillas aplicables concluidas.
  - `NA` (**Gris**, `#E5E7EB`): Todas las tareas del grupo marcadas como NA (casilla activa).
  - `—` (**Gris**, `#E5E7EB`): Deshabilitada por diseño técnico original del PDF.
- **Exportación Ejecutiva a PDF:**
  - **Imprimir Dashboard (1 Página):** Matriz A4 landscape con logotipos oficiales (KS y JI&FIX BRP), semáforo y créditos.
  - **Imprimir Informe (Detallado):** Matriz consolidada + desglose técnico por equipo y estado en vivo de cada checkbox.

---

## 🧪 Módulo 2: Monitoreo y Análisis de Soluble / Refrigerante

### 1. Diagrama de Layout HMI Industrial
- Reproducción fiel del diagrama de planta con secciones independientes:
  - `Transportador`, `OP10`, `Op20`, `Op30`, `Op40`, `Op50.1`, `OP60.1`, `Op50.2`, `OP60.2`, `Op70.1`, `Op70.2`, `Op80`, `CASETA`, `Certificación`, `Red de Soluble General`, `Tanque01`, `Tanque02`, `Tanque03`, `Lavadora`.
- **Agrupaciones Punteadas de Alimentación:**
  - **Tanque01** alimenta a **OP50.1** y **OP60.1**.
  - **Tanque02** alimenta a **Op50.2** y **OP60.2**.
  - **Tanque03** alimenta a **Op70.1**, **Op70.2** y **Op80**.
- **Estados Dinámicos del HMI:**
  - **Verde fijo**: Concentración dentro de parámetros ($\ge 4$ Brix).
  - **Rojo parpadeante**: Concentración por debajo de lo requerido ($< 4$ Brix) o más de 24 horas sin captura.
  - **Rojo fijo**: Operaciones estructuralmente deshabilitadas (**OP60.1** y **OP60.2**).
  - **Gris fijo**: Sin datos / Fuera de línea.

### 2. Gráficas Superiores de 24 Horas con Navegación Semanal
- 3 gráficas vectoriales independientes para Tanque01, Tanque02 y Tanque03.
- **Eje Y:** Concentración de soluble (0 a 10 Brix).
- **Eje X:** Ventana móvil de las últimas 24 muestras horarias; cada nueva lectura desplaza la vista automáticamente.
- **Navegación Histórica:** Botones anterior/siguiente para recorrer hasta 1 semana completa (168 horas).
- **Reinicio Semanal:** Al completarse 7 días de muestras, la base de datos se reinicia automáticamente para un nuevo ciclo.
- **Descarga CSV:** Exportación directa en UTF-8 (con BOM para Excel) con las columnas: `Consecutivo,Día,Hora,Valor`.

### 3. Captura por Telegram, Visión OCR y Motor de Alertas
- **Bot Oficial:** `@DASHBOARD_BRP_bot` (`https://t.me/DASHBOARD_BRP_bot`).
- **Flujo de Captura:** El operador captura una foto del refractómetro y la envía con la etiqueta correspondiente:
  - `Tanque01 Linea E`
  - `Tanque02 Linea E`
  - `Tanque03 Linea E`
- **Motor de Visión Computacional (Tesseract OCR):**
  - Descarga automática de la fotografía desde los servidores de Telegram mediante la API oficial.
  - Pre-procesamiento de lienzo (`<canvas>`): detección de zona central brillante, estiramiento de contraste y binarización.
  - Extracción robusta de dígitos numéricos (0 a 10) y normalización tipográfica (`s/S` $\rightarrow$ `5`, etc.).
  - **Sanitización Estricta de Etiquetas:** Remoción de prefijos antes del análisis de texto para erradicar falsos positivos de números en el nombre del tanque (ej. evitar que `Tanque02` sea leído como concentración 2).
- **Motor de Alertas por Inactividad (2 Horas):**
  - Si un tanque no registra lecturas durante más de 2 horas, el sistema emite automáticamente una alerta a Telegram solicitando la captura inmediata.
  - Incluye prevención de spam y supresión de alertas repetitivas mientras la advertencia siga activa.
- **Probador de OCR en el Dashboard:** Herramienta integrada en el modal de ajustes para examinar y cargar archivos de imagen locales desde el navegador.

---

## 🏗️ Estructura del Repositorio

```
BRP/
├── app/
│   ├── globals.css              # Estilos globales y Tailwind CSS
│   ├── layout.tsx               # Shell principal y configuración viewport
│   └── page.tsx                 # Vista principal: Mapa de Calor
├── components/
│   ├── Header.tsx               # Barra ejecutiva: contadores, botón Soluble, zoom y filtros
│   ├── HeatmapMatrix.tsx        # Matriz responsiva con freeze panes 2D y celdas
│   ├── EquipmentChecklistModal.tsx # Modal de checklist oficial numerado con OK y NA
│   ├── PrintDashboardModal.tsx  # Modal de exportación del Dashboard en 1 página A4
│   └── PrintReportModal.tsx     # Modal de exportación del Informe Detallado
├── public/
│   ├── analisis-soluble/        # MÓDULO HMI DE SOLUBLE
│   │   ├── index.html           # Estructura del layout industrial y modal de ajustes
│   │   ├── style.css            # Estilos HMI, animaciones y diseño responsivo
│   │   ├── app.js               # Controlador HMI, gráficas SVG y exportador CSV
│   │   ├── telegram.js          # Polling Telegram, motor OCR y motor de alertas 2H
│   │   ├── tesseract.min.js     # Bundle local de motor OCR
│   │   └── worker.min.js        # Worker local de OCR
│   ├── LOGO_KS-1.png            # Logotipo oficial de KS
│   ├── LOGO_JIFIX_BRP-1.jpg     # Logotipo oficial de JI&FIX SIGMA / BRP
│   └── Manual_Usuario_Mapa_Calor_Linea_E.pdf # Manual de usuario disponible para descarga
├── manual/
│   ├── manual_usuario.html      # Manual maestro interactivo y preparado para impresión A4
│   ├── Manual_Usuario_Mapa_Calor_Linea_E.pdf # Versión compilada en PDF del manual
│   └── assets/                  # Capturas de pantalla e ilustraciones del manual
├── data/
│   ├── activities.json          # 480 celdas auditadas del PDF oficial
│   └── equipmentChecklists.ts   # Catálogo maestro de tareas de mantenimiento
├── lib/
│   ├── schema.ts                # Esquemas de validación Zod
│   ├── supabaseClient.ts        # Conexión WebSocket y cliente Supabase
│   └── useDiagramStore.ts       # Store de sincronización en tiempo real
├── AGENTS.md                    # Instrucciones operativas para agentes de IA
├── PROJECT_CONTEXT.md           # Memoria técnica completa y bitácora del proyecto
└── README.md                    # Este documento
```

---

## 🚀 Instalación y Ejecución Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/RaptorT77/KOLBEN-BRP.git
cd KOLBEN-BRP
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar el servidor de desarrollo
```bash
npm run dev
```
La aplicación principal estará disponible en [http://localhost:3000](http://localhost:3000) y el módulo de soluble en [http://localhost:3000/analisis-soluble/](http://localhost:3000/analisis-soluble/).

### 4. Compilar para producción
```bash
npm run build
```
Genera la carpeta `out/` con el sitio estático optimizado.

---

## 📡 Despliegue en GitHub Pages

El proyecto se despliega automáticamente en las ramas `main` (código fuente) y `gh-pages` (distribución compilada):

```powershell
# 1. Compilar build estático
npm run build

# 2. Asegurar el archivo .nojekyll en out/
powershell -Command "New-Item -Path out\.nojekyll -ItemType File -Force"

# 3. Confirmar cambios en main
git add .
git commit -m "feat/fix: descripción de cambios"
git push origin main

# 4. Desplegar en gh-pages
git add -f out
$tree = (git write-tree --prefix=out).Trim()
git fetch origin gh-pages
$parent = (git rev-parse origin/gh-pages).Trim()
$commit = (git commit-tree $tree -p $parent -m "deploy: update GitHub Pages build").Trim()
git push origin "${commit}:refs/heads/gh-pages"
git reset HEAD out
```

---

## 👤 Créditos Oficiales

- **Desarrollador y Automatización:** Jose Antonio De Jesus Galicia
- **Correo Electrónico:** [dejesus.antonio@hcaa.com.mx](mailto:dejesus.antonio@hcaa.com.mx)
- **Empresa:** HC Advanced Automation S.A de C.V.
- **Sitio Web:** [https://www.hcaa.com.mx/](https://www.hcaa.com.mx/)
- **Ubicación:** Puebla, Puebla, MX
