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

---

## 3. Auditoría de Datos del PDF (`data/activities.json`)

El archivo `data/activities.json` fue verificado celda por celda a partir del PDF original:

- **Estructura**: Matriz rectangular de **16 Filas de Equipos × 30 Columnas de Actividades = 480 Celdas**.
- **Equipos (Filas R01 a R16)**:
  1. `R01`: AGV's (12 Actividades activas)
  2. `R02`: Lavadora de pallets (10 Actividades activas)
  3. `R03`: Transportador de rodillos de entrada a lavadora (9 Actividades activas)
  4. `R04`: Transportador de rodillos de salida a lavadora (9 Actividades activas)
  5. `R05`: Transportador de rodillos de rodillos (9 Actividades activas)
  6. `R06`: Mesa de transferencia de 90° (9 Actividades activas)
  7. `R07`: Carro de transferencia (9 Actividades activas)
  8. `R08`: Transportador de rodillos por gravedad (9 Actividades activas)
  9. `R09`: Elevador de pallets (10 Actividades activas)
  10. `R10`: Desapilador de pallets (10 Actividades activas)
  11. `R11`: Estación de inspección (10 Actividades activas)
  12. `R12`: Estación de ensamble 1 (12 Actividades activas)
  13. `R13`: Estación de ensamble 2 (12 Actividades activas)
  14. `R14`: Estación de ensamble 3 (12 Actividades activas)
  15. `R15`: Estación de pruebas (12 Actividades activas)
  16. `R16`: Estación de empaque (12 Actividades activas)

- **Distribución de Celdas**:
  - **314 celdas deshabilitadas (`disabled`)**: Celdas grises que representan actividades no aplicables para ese equipo. `isEditable: false`.
  - **166 celdas activas (`pending`)**: Celdas rojas iniciales que representan actividades de mantenimiento asignadas. `isEditable: true`.
  - **0 celdas ambiguas o ilegibles**: 100% verificado contra el archivo vectorial.

---

## 4. Arquitectura del Código y Componentes

```
BRP/
├── app/
│   ├── globals.css         # Estilos globales, variables de paleta corporate y reset
│   ├── layout.tsx          # Wrapper raíz y metadata
│   └── page.tsx            # Vista principal: orquesta el store, cabecera, matriz y modal
├── components/
│   ├── Header.tsx          # Cabecera ejecutiva con contadores en vivo, leyenda, zoom y filtro
│   ├── HeatmapMatrix.tsx   # Matriz responsiva con freeze panes 2D, etiquetas horizontales
│   └── StatusModal.tsx     # Diálogo para alternar entre PEND., RUN y OK
├── data/
│   └── activities.json     # 480 celdas validadas
├── lib/
│   ├── schema.ts           # Esquemas Zod para validación estricta en tiempo de ejecución
│   ├── supabaseClient.ts   # Conexión Supabase Realtime y constantes de canal/tabla
│   ├── useDiagramStore.ts  # Hook central de estado: Broadcast, Supabase DB, localStorage
│   └── utils.ts            # Utilidad cn (clsx + tailwind-merge)
├── types/
│   └── diagram.ts          # Interfaces TypeScript: ActivityCell, ActivityStatus, DiagramData
├── next.config.mjs         # Exportación estática con basePath: '/KOLBEN-BRP'
├── tailwind.config.ts      # Tokens de color corporativos
├── AGENTS.md               # Instrucciones automáticas para agentes de IA
└── PROJECT_CONTEXT.md      # Este documento maestro
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
