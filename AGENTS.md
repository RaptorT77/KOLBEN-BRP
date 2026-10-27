# AGENTS.md — Instrucciones y Contexto para Agentes de IA (KOLBEN-BRP)

Este archivo proporciona el contexto completo y las reglas operativas obligatorias para cualquier modelo o agente de IA que trabaje en este repositorio (`RaptorT77/KOLBEN-BRP`).

---

## 1. Visión General del Proyecto

- **Nombre del Proyecto**: Mapa de Calor de Mantenimiento — Línea E (BRP / KOLBEN).
- **Objetivo**: Aplicación web ejecutiva, moderna y sobria que reproduce fielmente el diagrama de calor de mantenimiento de la Línea E contenido en el documento PDF oficial `Mapa_Calor_Mantenimiento_Linea_E.pdf`, permitiendo visualizar y actualizar el estado de las actividades en tiempo real y sincronizado automáticamente entre todos los dispositivos (móviles, tablets y PC).
- **Repositorio GitHub**: `https://github.com/RaptorT77/KOLBEN-BRP`
- **Despliegue en Vivo (GitHub Pages)**: `https://raptort77.github.io/KOLBEN-BRP/`
- **Ramas del Repositorio**:
  - `main`: Código fuente completo del proyecto.
  - `gh-pages`: Despliegue estático generado por Next.js (`out/` con `.nojekyll`).

---

## 2. Regla de Oro: Fidelidad Estricta al PDF (No Inventar Información)

- **Fuente de Verdad**: `Mapa_Calor_Mantenimiento_Linea_E.pdf` (almacenado en la raíz).
- **Prohibido agregar**: No inventar nombres de equipos, actividades, fechas, responsables, notas o porcentajes que no figuren en el PDF.
- **Estructura de la Matriz**:
  - **16 filas de Equipos** (Línea E: R01 a R16 con nombres normalizados de operaciones):
    1. `TRANSPORTADORES`
    2. `PMQ1231 3M Gantry OP05`
    3. `PMQ756 3M Cargador`
    4. `PMQ757 3M Kanzaky OP10`
    5. `PMQ758 3M Kanzaky OP20`
    6. `PMQ759 3M Kanzaky OP30`
    7. `PMQ760 3M Kanzaky OP40`
    8. `PMQ761 3M Robodrill OP50-1`
    9. `PMQ762 3M Robodrill OP60-1`
    10. `PMQ763 3M Robodrill OP50-2`
    11. `PMQ764 3M Robodrill OP60-2`
    12. `PMQ765 3M Kanzaky OP70-1`
    13. `PMQ766 3M Kanzaky OP70-2`
    14. `PMQ767 3M Kanzaky OP80`
    15. `PMQ768 CASETA`
    16. `PMQ781 3M Extractor de rebaba`
  - **30 columnas de Actividades** (C01 a C30, grupos 10 a 300 con items numerados oficialmente ej. `10.1`, `40.3`, `300.1`).
  - **Total de Celdas**: Exactamente **480 celdas**.
  - **Celdas Deshabilitadas (Gris)**: **316 celdas** (`isEditable: false`, `initialStatus: "disabled"`). No pueden ser activadas ni editadas. (Incluye columnas desactivadas 150, 180 y 190 para PMQ756 Cargador).
  - **Celdas Editables (Activas)**: **164 celdas** (`isEditable: true`, `initialStatus: "pending"`). Incluye columna 220 (Banda transportadora) para PMQ757 3M Kanzaky OP10 y PMQ756 Cargador.

---

## 3. Convenciones Visuales, Menús Emergentes y Checklists

### Selección de Fila y Menú Emergente Interactivo
- **Selección de Fila**: Se puede seleccionar cualquier fila con el mouse haciendo clic sobre el nombre del equipo en la columna fija de la izquierda (ej. `TRANSPORTADORES`, `PMQ759 3M Kanzaky OP30`, etc.). La fila activa se resalta visiblemente.
- **Menú Emergente (Checklist Oficial)**: El menú emergente aparece **si y solo si** se hace clic sobre alguna casilla válida (activa y editable). En casillas deshabilitadas estructuralmente no se abre ningún menú. Al posicionar el cursor sobre una celda solo se resalta en el inspector del pie.
- **Exclusividad por Coordenada (Fila × Columna)**:
  - Cada celda (`${rowId}_${colId}`) mantiene su propio estado de checkboxes de forma totalmente independiente. Por ejemplo, `TRANSPORTADORES × 10 LOTO` tiene un registro único de casillas marcadas que no altera ni comparte con `PMQ759 3M Kanzaky OP30 × 10 LOTO`.
- **Casilla adicional "NA" (No Aplica)**:
  - Cada actividad cuenta con una casilla adicional denominada **NA**.
  - Al marcar **NA**, esa tarea se excluye y es ignorada en la evaluación de color como si no existiera.
- **Regla Estricta de Transición de Estados por Checkbox**:
  - **0 casillas aplicables marcadas**: Estado en Rojo (`PEND.`, `#EF4444`, texto negro).
  - **1 a N-1 casillas aplicables marcadas**: Estado en Ámbar (`RUN`, `#F59E0B`, texto negro).
  - **Todas las casillas aplicables marcadas**: Estado en Verde (`OK`, `#22C55E`, texto negro).
  - **Todas las casillas marcadas como NA**: Estado en Gris (`NA`, `#E5E7EB`, texto `#4B5563`, casilla editable activa).
- **Acciones Rápidas**: Botones de "Marcar Todos (OK)" y "Desmarcar (PEND.)".
- **Sincronización en Tiempo Real**: Los estados de checkboxes (OK y NA) y de celdas se sincronizan instantáneamente en `localStorage` y en tiempo real con Supabase Realtime (`checklist_updated` / `cell_updated`).

| Estado | Abreviatura | Color de Fondo | Color de Texto | Significado |
| :--- | :---: | :---: | :---: | :--- |
| **Pendiente** | `PEND.` | Rojo (`#EF4444` / Tailwind `bg-red-500`) | Negro (`#000000`, `font-black`) | Actividad por realizar (0 tareas marcadas) |
| **En Proceso** | `RUN` | Ámbar (`#F59E0B` / Tailwind `bg-amber-500`) | Negro (`#000000`, `font-black`) | Actividad en ejecución (1 a N-1 tareas marcadas) |
| **Concluido** | `OK` | Verde (`#22C55E` / Tailwind `bg-green-500`) | Negro (`#000000`, `font-black`) | Actividad concluida (todas las tareas aplicables marcadas) |
| **No Aplica (Todas NA)** | `NA` | Gris (`#E5E7EB` / Tailwind `bg-gray-200`) | Gris Oscuro (`#4B5563`, `font-bold`) | Todas las tareas marcadas como NA (casilla editable) |
| **Deshabilitada** | `—` | Gris (`#E5E7EB` / Tailwind `bg-gray-200`) | Gris Tenue (`#6B7280`, `font-bold`) | Intersección no aplicable según el plan técnico del PDF |

---

## 4. Arquitectura y Sincronización en Tiempo Real Multi-Dispositivo

### Sincronización en Vivo (Supabase Realtime + Postgres)
- **Proveedor**: Supabase (`https://dnpfbfooosdrmyfbrjmk.supabase.co`).
- **Canal Realtime**: `brp_heatmap_sync_room`.
- **Eventos Broadcast**:
  - `cell_updated`: Difunde `{ cellId, newStatus, timestamp }` con latencia `<50ms` a todos los dispositivos abiertos.
  - `reset_all`: Propaga el restablecimiento al estado original del PDF a todos los clientes.
- **Persistencia en la Nube**:
  - Tabla: `public.brp_heatmap_state` (`id = 'main'`).
  - Campo: `cells_state JSONB` (almacena el diccionario de celdas modificadas).
  - Al abrir la web en un nuevo dispositivo, se descarga automáticamente el estado más reciente.
- **Caché y Resiliencia Local**:
  - Clave `localStorage`: `brp_heatmap_activities_v1`.
  - Primer render en 0ms sin parpadeos; fallback sin conexión funcional.
- **Indicador Visual en Cabecera (`Header.tsx`)**:
  - `🟢 En vivo`: Conexión WebSocket activa y sincronizada.
  - `🟡 Sincronizando...`: En proceso de conexión.
  - `⚪ Local`: Modo local sin conexión.

---

## 5. Pila Tecnológica

- **Framework**: Next.js 14 (App Router) con configuración `output: 'export'`.
- **Lenguaje**: TypeScript 5 con tipado estricto.
- **Estilos**: Tailwind CSS con paleta corporativa y CSS Grid / Flexbox con soporte de paneles congelados (freeze panes 2D en X e Y para móviles).
- **Validación**: Zod (`DiagramDataSchema` en `lib/schema.ts`).
- **Iconos**: `lucide-react`.
- **Cliente en la Nube**: `@supabase/supabase-js`.

---

## 6. Procedimiento para Actualizar el Despliegue en GitHub Pages

Al realizar modificaciones en el código, **SIEMPRE** deben actualizarse ambas ramas:

1. **Compilar el build estático de producción**:
   ```powershell
   npm run build
   ```
2. **Asegurar el archivo `.nojekyll` en `out/`**:
   ```powershell
   powershell -Command "New-Item -Path out\.nojekyll -ItemType File -Force"
   ```
3. **Confirmar y enviar cambios a la rama `main`**:
   ```powershell
   git add .
   git commit -m "feat/fix: descripción de los cambios"
   git push origin main
   ```
4. **Desplegar a la rama `gh-pages`**:
   ```powershell
   git add -f out
   $tree = (git write-tree --prefix=out).Trim()
   $commit = (git commit-tree $tree -m "deploy: update GitHub Pages build").Trim()
   git push origin "${commit}:refs/heads/gh-pages"
   git reset HEAD out
   ```
5. **Verificar el sitio en vivo**: [https://raptort77.github.io/KOLBEN-BRP/](https://raptort77.github.io/KOLBEN-BRP/)
