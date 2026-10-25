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
  - **16 filas de Equipos** (Línea E: R01 a R16).
  - **30 columnas de Actividades** (C01 a C30).
  - **Total de Celdas**: Exactamente **480 celdas**.
  - **Celdas Deshabilitadas (Gris)**: **314 celdas** (`isEditable: false`, `initialStatus: "disabled"`). No pueden ser activadas ni editadas bajo ninguna circunstancia.
  - **Celdas Editables (Activas)**: **166 celdas** (`isEditable: true`, `initialStatus: "pending"`).

---

## 3. Convenciones Visuales y de Estado

Las celdas de estado tienen abreviaturas horizontales en texto negro y fondos específicos según la directiva del usuario:

| Estado | Abreviatura | Color de Fondo | Color de Texto | Significado |
| :--- | :---: | :---: | :---: | :--- |
| **Pendiente** | `PEND.` | Rojo (`#EF4444` / Tailwind `bg-red-500`) | Negro (`#000000`, `font-black`) | Actividad por realizar (estado original de las 166 activas) |
| **En Proceso** | `RUN` | Ámbar (`#F59E0B` / Tailwind `bg-amber-500`) | Negro (`#000000`, `font-black`) | Actividad actualmente en ejecución |
| **Concluido** | `OK` | Verde (`#22C55E` / Tailwind `bg-green-500`) | Negro (`#000000`, `font-black`) | Actividad concluida satisfactoriamente |
| **Deshabilitada** | `—` | Gris (`#E5E7EB` / Tailwind `bg-gray-200`) | Gris Oscuro (`#4B5563`, `font-bold`) | Intersección no aplicable según el PDF (bloqueada) |

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
