# Documento de Contexto Maestro y Arquitectura del Proyecto (PROJECT_CONTEXT.md)

Este documento contiene la memoria técnica, decisiones de diseño, auditoría de datos del PDF y el historial completo de implementación del proyecto **Mapa de Calor de Mantenimiento — Línea E**.

---

## 1. Ficha Técnica del Proyecto

- **Cliente / Organización**: BRP / KOLBEN
- **Entorno de Producción**: GitHub Pages ([https://raptort77.github.io/KOLBEN-BRP/](https://raptort77.github.io/KOLBEN-BRP/))
- **Repositorio Fuente**: GitHub ([https://github.com/RaptorT77/KOLBEN-BRP](https://github.com/RaptorT77/KOLBEN-BRP))
- **Documento Fuente Primario**: `Mapa_Calor_Mantenimiento_Linea_E.pdf` (almacenado en la raíz del repositorio)
- **Framework & Runtime**: Next.js 14.2.35 (React 18.3.1, TypeScript 5.6.3, Node.js 24/20)
- **Capa de Tiempo Real**: Supabase Realtime (WebSocket Broadcast + Postgres Table State)
- **Persistencia en la Nube**: Supabase Project ID `dnpfbfooosdrmyfbrjmk` (Región `us-west-1`)

---

## 2. Historial de Requerimientos y Evolución del Sistema

1. **Requerimiento Inicial**:
   - Analizar el documento vectorial `Mapa_Calor_Mantenimiento_Linea_E.pdf`.
   - Crear una aplicación ejecutiva en una sola pantalla que reproduzca fielmente la matriz de mantenimiento.
   - **Regla Estricta**: No inventar información; respetar al 100% los nombres, órdenes y agrupaciones del PDF.
   - Auditar e interpretar el 100% de los elementos del PDF sin incertidumbres.

2. **Requerimiento de Formato y Abreviaturas**:
   - Estados con texto horizontal en color negro (`#000000`, `font-black`):
     - **Pendiente**: Abreviatura `PEND.`, fondo **ROJO** (`#EF4444`).
     - **En Proceso**: Abreviatura `RUN`, fondo **ÁMBAR** (`#F59E0B`).
     - **Concluido**: Abreviatura `OK`, fondo **VERDE** (`#22C55E`).
     - **Deshabilitado**: Abreviatura `—`, fondo **GRIS** (`#E5E7EB`).
   - Las celdas deben mostrar claramente la abreviatura horizontal sin rotación vertical.

3. **Requerimiento de Alojamiento en GitHub**:
   - Subir el repositorio completo a `https://github.com/RaptorT77/KOLBEN-BRP`.
   - Configuración de ramas: `main` (código fuente) y `gh-pages` (despliegue estático con `basePath: '/KOLBEN-BRP'` y `.nojekyll`).

4. **Requerimiento de Optimización Móvil y Tablet**:
   - Paneles congelados bidimensionales (Freeze Panes 2D): Columna izquierda de equipos fija en scroll horizontal; fila superior de actividades fija en scroll vertical.
   - Filtro rápido desplegable por equipo para inspección focalizada en pantallas pequeñas.
   - Control de zoom interactivo (+ / - / Ajustar a pantalla) adaptativo.
   - Contenedores de resumen con soporte táctil deslizable (`overflow-x-auto`).

5. **Requerimiento de Sincronización en Tiempo Real Multi-Dispositivo**:
   - Si un usuario actualiza el estado de cualquier celda desde cualquier dispositivo (teléfono, tablet o PC), la información debe actualizarse en la web y en todos los demás dispositivos **inmediatamente (<50ms) y de forma automática** sin requerir refrescar la página.
   - Persistencia en la nube para que nuevos dispositivos carguen el estado consolidado.
   - Indicador visual ejecutivo en la cabecera: `🟢 En vivo` con animación pulsante.

6. **Requerimiento de Menú Emergente de Checklist y Ajuste de Columnas PMQ756**:
   - Ajuste de columnas para `PMQ756 3M Cargador`: Únicamente activas las columnas del documento oficial: 10 (LOTO), 20 (Panel de control y potencia), 30 (Neumático), 60 (Guías), 110 (Sensores) y 220 (Banda transportadora). Las demás (150, 180, 190) fueron desactivadas y pasadas a gris.
   - Selección de fila interactiva: Permite seleccionar cualquier equipo (ej. `TRANSPORTADORES` o `PMQ756 3M Cargador`) haciendo clic sobre la fila.

7. **Requerimiento de Catálogo Completo de 30 Grupos, Numeración Oficial, Checkbox NA y Nombres OP**:
   - **Nombres Normalizados de Filas**: Se actualizaron las 16 filas con su código de operación (`PMQ1231 3M Gantry OP05`, `PMQ757 3M Kanzaky OP10`, `PMQ758 3M Kanzaky OP20`, ..., `PMQ767 3M Kanzaky OP80`, etc.).
   - **Catálogo Maestro de 30 Grupos**: Implementación de todos los grupos del 10 al 300 con su numeración oficial (ej. `10.1`, `40.1`, `300.1`) según el documento técnico oficial.
   - **Casilla Adicional "NA"**: Cada renglón cuenta con una casilla "NA"; al marcarla, ese renglón se ignora del cálculo de estado (no cuenta como pendiente ni como concluido).
   - **Exclusividad Estricta por Coordenada**: El patrón de checkboxes es único y exclusivo para cada coordenada Fila × Columna (`${rowId}_${colId}`).

8. **Requerimiento de Optimización Móvil Completa, Visibilidad Permanente y Cierre Multi-Dispositivo**:
   - **Visibilidad 100% Garantizada**: En smartphones, tablets y pantallas táctiles (o al hacer clic en cualquier celda), la ventana emergente se proyecta como un diálogo modal centrado (`showAsModal`) con fondo oscuro semitransparente (`bg-black/60 backdrop-blur-[2px]`). Esto previene desbordamientos o recortes en los bordes de la pantalla.
   - **Mecanismos Intuitivos de Cierre**: Se puede cerrar la ventana emergente en cualquier dispositivo mediante 4 vías independientes:
     1. Tocando en cualquier punto fuera de la tarjeta (el backdrop oscuro interactivo actúa como disparador de cierre).
     2. Botón `X` en la esquina superior derecha de la cabecera (área táctil $\ge 44\times 44\text{px}$).
     3. Botón de pie de página `Cerrar` con icono y alto contraste (altura táctil $\ge 44\text{px}$).
     4. Pulsando la tecla `Escape` en teclados físicos o virtuales.
   - **Zonas Táctiles Ergonómicas**: Checkboxes de OK y NA con dimensiones mínimas de $44\times 44\text{px}$ para manipulación táctil con un solo pulgar sin errores.
   - **Compatibilidad con Barras del Sistema**: Uso de unidades de altura dinámicas (`88dvh` / `88vh`) y margen inferior seguro (`env(safe-area-inset-bottom)`) para evitar que la barra de inicio de iOS o la barra de navegación de Android tapen los botones de acción.
   - **Bloqueo de Desplazamiento de Fondo**: Evita movimientos involuntarios o temblores de la matriz mientras el operador desliza la lista de actividades.

9. **Requerimiento de Identidad Gráfica Institucional (Logos Oficiales y Título Normalizado)**:
   - **Esquina Superior Izquierda**: Logotipo oficial de KS (`LOGO_KS-1.bmp` / `.png`).
   - **Centro**: Título oficial normalizado: `"Relación de mantenimientos preventivos Linea \"E\" Producto 9X3"` con tipografía ejecutiva de alto impacto (`text-[#173D60]`, negrita extra) y etiquetas de metadatos.
   - **Esquina Superior Derecha**: Logotipo oficial de BRP / JI&FIX SIGMA (`LOGO_JIFIX_BRP-1.jpg`).
   - **Armonización Estética**: Fila de cabecera dedicada a la identidad corporativa y segunda fila optimizada para contadores de semáforo, selector de equipos y botones de acción.

10. **Requerimiento de Botón "Imprimir Informe", Exportación a PDF Consolidado y Créditos Oficiales**:
   - **Sustitución de Botón**: El botón "Restablecer" fue reemplazado por **"Imprimir Informe"** (`Printer` icon) en la esquina superior derecha de la barra de acciones.
   - **Modal de Vista Previa y PDF (`PrintReportModal`)**: Despliega un informe ejecutivo completo que integra:
     1. Encabezado institucional con logotipos (`LOGO_KS-1.bmp` a la izquierda y `LOGO_JIFIX_BRP-1.jpg` a la derecha), título oficial y fecha/hora de emisión.
     2. Resumen semafórico con cifras en vivo (Total 480, Deshabilitadas 317, Pendientes, En Proceso, Concluidas y Avance Global).
     3. **Dashboard Completo**: Matriz total del mapa de calor (16 equipos × 30 columnas) con las abreviaturas y colores exactos.
     4. **Desglose de Grupos y Checkboxes en Tiempo Real**: Reporte detallado por cada equipo de sus columnas activas, mostrando el estado último de cada checkbox (`[✓]` completada, `[NA]` no aplica, `[○]` pendiente).
     5. **Créditos Oficiales al Final del Reporte**:
        - Jose Antonio De Jesus Galicia (`dejesus.antonio@hcaa.com.mx`)
        - HC Advanced Automation S.A de C.V. (`https://www.hcaa.com.mx/`)
        - Puebla, Puebla, MX
   - **Estilos de Impresión (`@media print`)**: Formato horizontal A4 (`landscape`), márgenes calibrados, forzado de colores exactos y exclusión de elementos de interfaz para exportar un PDF impecable en 1 clic.

---

## 3. Auditoría de Datos del PDF (`data/activities.json`)

El archivo `data/activities.json` fue verificado celda por celda a partir del documento oficial:

- **Estructura**: Matriz rectangular de **16 Filas de Equipos × 30 Columnas de Actividades = 480 Celdas**.
- **Distribución de Celdas**:
  - **317 celdas deshabilitadas (`disabled`)**: Celdas grises que representan actividades no aplicables para ese equipo. `isEditable: false`.
  - **163 celdas activas (`pending`)**: Celdas rojas iniciales que representan actividades de mantenimiento asignadas. `isEditable: true`.
  - **Checklists Detallados**: Catálogo en `data/equipmentChecklists.ts` con las tareas oficiales de inspección y mantenimiento por grupo.

---

## 4. Arquitectura del Código y Componentes

```
BRP/
├── app/
│   ├── globals.css              # Estilos globales, variables de paleta corporate y reset
│   ├── layout.tsx               # Wrapper raíz y metadata
│   └── page.tsx                 # Vista principal: orquesta el store, cabecera, matriz y modal
├── components/
│   ├── Header.tsx               # Cabecera ejecutiva con contadores en vivo, leyenda, zoom y filtro
│   ├── HeatmapMatrix.tsx        # Matriz responsiva con freeze panes 2D, selección de fila y hover popover
│   ├── ChecklistPopover.tsx     # Menú emergente interactivo con checkboxes y cálculo de estado
│   └── StatusModal.tsx          # Diálogo para alternar entre PEND., RUN y OK
├── data/
│   ├── activities.json          # 480 celdas validadas con Zod
│   └── equipmentChecklists.ts   # Tareas y grupos oficiales para PMQ756 y grupos estándar
├── lib/
│   ├── schema.ts                # Esquemas Zod para validación estricta en tiempo de ejecución
│   ├── supabaseClient.ts        # Conexión Supabase Realtime y constantes de canal/tabla
│   ├── useDiagramStore.ts       # Hook central de estado: Broadcast, Supabase DB, localStorage
│   └── utils.ts                 # Utilidad cn (clsx + tailwind-merge)
├── types/
│   └── diagram.ts               # Interfaces TypeScript: ActivityCell, ActivityStatus, DiagramData
├── next.config.mjs              # Exportación estática con basePath: '/KOLBEN-BRP'
├── tailwind.config.ts           # Tokens de color corporativos
├── AGENTS.md                    # Instrucciones automáticas para agentes de IA
└── PROJECT_CONTEXT.md           # Este documento maestro
```

---

## 5. Funcionamiento del Motor de Tiempo Real (`lib/useDiagramStore.ts`)

1. **Montaje Inicial (0ms)**:
   - Carga inmediatamente los datos de `activities.json` + `localStorage` para evitar cualquier parpadeo de pantalla.
   - En paralelo, consulta la base de datos Supabase:
     ```ts
     supabase.from('brp_heatmap_state').select('cells_state').eq('id', 'main').single()
     ```
   - Si existen cambios guardados en la nube, los aplica y actualiza el almacenamiento local.

2. **Canal WebSocket de Difusión Inmediata**:
   - Conexión al canal `brp_heatmap_sync_room` de Supabase.
   - Al hacer clic en un estado en el Dispositivo A:
     - **Actualización Optimista**: La interfaz del Dispositivo A cambia inmediatamente (0ms).
     - **Emisión WebSocket**: Envía evento `cell_updated` con `{ cellId, newStatus, timestamp }`.
     - **Recepción en Otros Dispositivos**: El Dispositivo B y C reciben el evento en `<50ms` y actualizan la celda y los contadores en pantalla automáticamente.
     - **Persistencia en Base de Datos**: Guarda asíncronamente en `brp_heatmap_state.cells_state`.

3. **Restablecimiento Sincronizado**:
   - El botón "Restablecer" envía el evento `reset_all`.
   - Todos los dispositivos conectados revierten instantáneamente a las 166 PEND. y 314 deshabilitadas originales.

---

## 6. Variables y Credenciales de Supabase

- **URL de la API**: `https://dnpfbfooosdrmyfbrjmk.supabase.co`
- **Tabla**: `public.brp_heatmap_state` (con Row Level Security habilitado y políticas de acceso anónimo de lectura/escritura).
- **Publicación en Tiempo Real**: `ALTER PUBLICATION supabase_realtime ADD TABLE public.brp_heatmap_state;` con `REPLICA IDENTITY FULL`.

---

## 7. Comandos de Construcción y Despliegue

```powershell
# Instalar dependencias
npm install

# Servidor local de desarrollo
npm run dev

# Compilar export estático para GitHub Pages
npm run build

# Desplegar a GitHub Pages (gh-pages)
powershell -Command "New-Item -Path out\.nojekyll -ItemType File -Force"
git add -f out
$tree = (git write-tree --prefix=out).Trim()
$commit = (git commit-tree $tree -m 'deploy: update GitHub Pages build').Trim()
git push origin `"${commit}:refs/heads/gh-pages`"
git reset HEAD out
```
