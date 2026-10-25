# Mapa de Calor de Mantenimiento — Línea E (BRP / KOLBEN)

[![GitHub Pages Deployment](https://img.shields.io/badge/Live_Site-GitHub_Pages-22c55e?style=for-the-badge&logo=github)](https://raptort77.github.io/KOLBEN-BRP/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2.35-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase Realtime](https://img.shields.io/badge/Supabase-Realtime_Sync-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

Aplicación web ejecutiva y profesional diseñada para reproducir con total fidelidad el diagrama de calor de mantenimiento de la Línea E a partir del documento oficial `Mapa_Calor_Mantenimiento_Linea_E.pdf`. Permite visualizar y actualizar el estado de las actividades en una sola pantalla con **sincronización automática e instantánea entre todos los dispositivos (móviles, tablets y computadoras) en tiempo real**.

---

## 🌐 Enlaces Oficiales

- **Aplicación Web en Vivo:** [https://raptort77.github.io/KOLBEN-BRP/](https://raptort77.github.io/KOLBEN-BRP/)
- **Repositorio de Código en GitHub:** [https://github.com/RaptorT77/KOLBEN-BRP](https://github.com/RaptorT77/KOLBEN-BRP)

---

## ⚡ Características Principales

1. **Sincronización Multi-Dispositivo en Tiempo Real (<50ms):**
   - Cualquier cambio de estado realizado en un celular, tablet o computadora se refleja de inmediato y automáticamente en todas las demás pantallas abiertas sin necesidad de recargar.
   - Desarrollado con el motor de emisión WebSocket de Supabase Realtime y respaldado en base de datos en la nube.
2. **Fidelidad Absoluta al PDF Oficial (Sin Información Inventada):**
   - Matriz exacta de **16 filas de Equipos × 30 columnas de Actividades = 480 celdas**.
   - **314 celdas deshabilitadas** (bloqueadas, no editables).
   - **166 celdas activas** (inicialmente pendientes).
3. **Formato y Abreviaturas Ejecutivas:**
   - Texto horizontal en color negro (`font-black`) sobre fondos de alto contraste:
     - `PEND.`: Fondo **ROJO** (`#EF4444`).
     - `RUN`: Fondo **ÁMBAR** (`#F59E0B`).
     - `OK`: Fondo **VERDE** (`#22C55E`).
     - `—`: Fondo **GRIS** (`#E5E7EB`, deshabilitada / inactiva).
4. **Optimización Móvil y Tablet de Alto Rendimiento:**
   - Paneles congelados bidimensionales (Freeze Panes 2D): cabeceras de actividades y columna de equipos siempre visibles al hacer scroll.
   - Filtro por equipo para inspección rápida en pantallas pequeñas.
   - Controles de zoom táctiles e inteligentes (+ / - / Ajuste automático).
5. **Indicador de Conexión en Vivo:**
   - Badge ejecutivo con punto pulsante en la cabecera: **`🟢 En vivo`**, que otorga certeza visual del enlace activo en tiempo real.
6. **Resiliencia Local y Modo Offline:**
   - Si se interrumpe la conexión, los cambios se respaldan en `localStorage` y se sincronizan al recuperar la red.

---

## 📋 Convenciones de Estado de la Matriz

| Estado | Abreviatura | Color de Fondo | Color de Texto | Comportamiento |
| :--- | :---: | :---: | :---: | :--- |
| **Pendiente** | `PEND.` | Rojo (`#EF4444`) | Negro (`#000000`, `font-black`) | Actividad programada pendiente de ejecución. |
| **En Proceso** | `RUN` | Ámbar (`#F59E0B`) | Negro (`#000000`, `font-black`) | Actividad en curso. |
| **Concluido** | `OK` | Verde (`#22C55E`) | Negro (`#000000`, `font-black`) | Actividad finalizada exitosamente. |
| **Deshabilitado** | `—` | Gris (`#E5E7EB`) | Gris Oscuro (`#4B5563`, `font-bold`) | Intersección no aplicable según el PDF (bloqueada). |

---

## 🏗️ Estructura del Proyecto

```
BRP/
├── app/
│   ├── globals.css         # Estilos globales y paleta corporate
│   ├── layout.tsx          # Shell principal y configuración de viewport
│   └── page.tsx            # Vista principal que coordina el store y componentes
├── components/
│   ├── Header.tsx          # Barra ejecutiva: contadores en vivo, leyenda, zoom y filtro
│   ├── HeatmapMatrix.tsx   # Matriz responsiva con freeze panes 2D y etiquetas horizontales
│   └── StatusModal.tsx     # Diálogo emergente para alternar estados (PEND., RUN, OK)
├── data/
│   └── activities.json     # 480 celdas extraídas rigurosamente del PDF oficial
├── lib/
│   ├── schema.ts           # Validación estricta con esquemas Zod
│   ├── supabaseClient.ts   # Conector Supabase Realtime y canales WebSocket
│   ├── useDiagramStore.ts  # Store central con difusión broadcast, DB y localStorage
│   └── utils.ts            # Utilidad cn (clsx + tailwind-merge)
├── types/
│   └── diagram.ts          # Interfaces TypeScript de la matriz y celdas
├── AGENTS.md               # Contexto e instrucciones obligatorias para agentes de IA
├── PROJECT_CONTEXT.md      # Manual maestro de arquitectura, datos y decisiones
├── Mapa_Calor_Mantenimiento_Linea_E.pdf # Documento original fuente
├── next.config.mjs         # Configuración de export estático con basePath: '/KOLBEN-BRP'
├── package.json            # Dependencias y scripts
└── README.md               # Esta documentación
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
La aplicación se abrirá en [http://localhost:3000](http://localhost:3000).

### 4. Compilar para producción (Exportación estática)
```bash
npm run build
```
Genera la carpeta `out/` lista para ser desplegada en GitHub Pages o cualquier servidor estático.

---

## 📡 Despliegue en GitHub Pages

Para publicar una nueva versión en la rama `gh-pages`:

```powershell
# 1. Compilar el export estático
npm run build

# 2. Asegurar el bypass de Jekyll
powershell -Command "New-Item -Path out\.nojekyll -ItemType File -Force"

# 3. Empujar el contenido de out/ a la rama gh-pages
git add -f out
$tree = (git write-tree --prefix=out).Trim()
$commit = (git commit-tree $tree -m "deploy: update GitHub Pages build").Trim()
git push origin "${commit}:refs/heads/gh-pages"
git reset HEAD out
```

---

## 🔒 Auditoría de Seguridad y Datos

- **Persistencia en Nube**: Tabla `public.brp_heatmap_state` en Supabase con **Row Level Security (RLS)** activado y políticas de acceso anónimo seguro de lectura y actualización.
- **Validación en Tiempo de Ejecución**: Toda lectura de datos se valida mediante esquemas de **Zod** (`DiagramDataSchema`).
- **Integridad de Celdas Deshabilitadas**: El store `useDiagramStore` rechaza cualquier intento de mutación sobre celdas con estado original `disabled`, impidiendo alteraciones indebidas.
