# Mapa de Calor de Mantenimiento — Línea E

Aplicación web ejecutiva, moderna y sobria diseñada para reproducir fielmente el diagrama de calor de mantenimiento de la Línea E a partir del documento oficial `Mapa_Calor_Mantenimiento_Linea_E.pdf`, permitiendo visualizar y actualizar el estado de todas las actividades en una sola pantalla con persistencia local.

---

## 1. Requisitos Previos

- **Node.js**: Versión 18.18.0 o superior (probado y verificado en Node.js v24 y v20).
- **npm**: Versión 9.0 o superior (o gestor compatible como `pnpm` o `yarn`).
- Navegador web moderno compatible con estándares ECMAScript y CSS Grid / Flexbox (Chrome, Edge, Firefox, Safari).

---

## 2. Instalación y Ejecución Local

### Paso 1: Clonar o situarse en el directorio del proyecto
```bash
cd d:/RESEARCH/BRP
```

### Paso 2: Instalar dependencias
```bash
npm install
```

### Paso 3: Iniciar el servidor de desarrollo
```bash
npm run dev
```
La aplicación estará disponible de inmediato en [http://localhost:3000](http://localhost:3000).

### Paso 4: Compilar para producción (Validación de tipos y optimización)
```bash
npm run build
```

### Paso 5: Iniciar el servidor de producción
```bash
npm run start
```

---

## 3. Despliegue en Vercel

El proyecto está diseñado bajo los estándares oficiales de Next.js (App Router) para desplegarse en **Vercel con cero configuración adicional**:

### Opción A: Despliegue desde Git (GitHub / GitLab / Bitbucket)
1. Sube este repositorio a tu cuenta de GitHub, GitLab o Bitbucket.
2. Ingresa a tu panel de control en [Vercel](https://vercel.com).
3. Haz clic en **Add New...** -> **Project**.
4. Importa el repositorio del proyecto.
5. Vercel detectará automáticamente el framework **Next.js**.
6. Mantén las configuraciones predeterminadas (no se requieren variables de entorno).
7. Haz clic en **Deploy**.

### Opción B: Despliegue desde la línea de comandos (Vercel CLI)
```bash
npm i -g vercel
vercel login
vercel
```
Para producción directa:
```bash
vercel --prod
```

---

## 4. Estructura de Carpetas

```
BRP/
├── app/
│   ├── globals.css         # Estilos globales, variables de paleta y tipografía corporativa
│   ├── layout.tsx          # Shell principal y metadata ejecutiva
│   └── page.tsx            # Página principal que integra la matriz, cabecera y modal
├── components/
│   ├── Header.tsx          # Barra superior ejecutiva con indicadores, leyenda y controles
│   ├── HeatmapMatrix.tsx   # Matriz visual del mapa de calor (16 filas × 30 columnas)
│   └── StatusModal.tsx     # Diálogo emergente para actualizar el estado de celdas activas
├── data/
│   └── activities.json     # Fuente única de datos estructurada y extraída fielmente del PDF
├── lib/
│   ├── schema.ts           # Validación estricta con esquemas Zod (DiagramDataSchema)
│   ├── useDiagramStore.ts  # Hook de estado con sincronización en localStorage y validaciones
│   └── utils.ts            # Utilidad de combinación de clases Tailwind (cn)
├── types/
│   └── diagram.ts          # Definiciones estrictas de TypeScript para entidades y estados
├── Mapa_Calor_Mantenimiento_Linea_E.pdf # Documento original fuente
├── package.json            # Dependencias y scripts de construcción
├── tailwind.config.ts      # Paleta neutra corporativa y colores de estado
├── tsconfig.json           # Configuración de TypeScript con alias @/*
└── README.md               # Documentación integral del sistema
```

---

## 5. Archivo de Datos (`data/activities.json`) y Estados Permitidos

El archivo `data/activities.json` es la **única fuente de verdad** del sistema y fue generado mediante un análisis vectorial y de color del documento original.

### Estados de Actividad Permitidos:

| Estado | Código Interno | Color de Referencia | Comportamiento en la Interfaz |
| :--- | :---: | :---: | :--- |
| **Deshabilitado** | `disabled` | Gris (`#9CA3AF` / `#F3F4F6`) | Cuadro inactivo, cursor bloqueado (`cursor-not-allowed`). **No es seleccionable ni editable**. |
| **Pendiente** | `pending` | Rojo (`#DC2626` / `#FEF2F2`) | Estado inicial de todas las actividades activas del PDF. Permite alternar estado. |
| **En proceso** | `in_progress` | Ámbar (`#D97706` / `#FFFBEB`) | Actividad en curso. Permite alternar estado. |
| **Concluido** | `completed` | Verde (`#16A34A` / `#F0FDF4`) | Actividad concluida satisfactoriamente. Permite alternar estado. |

### Reglas Estrictas de Integridad:
1. **Protección de Celdas Deshabilitadas**: Ninguna celda con estado original `disabled` puede convertirse a un estado activo. El hook `useDiagramStore` rechaza cualquier intento de mutación.
2. **Ciclo de Estados Activos**: Las celdas activas (`isEditable: true`) únicamente pueden transicionar entre `pending`, `in_progress` y `completed`.

---

## 6. Actualización y Persistencia de Estados

1. **Selección de una Actividad Habilitada**: Al hacer clic en cualquier celda activa (roja, ámbar o verde), se despliega el componente `StatusModal`.
2. **Selección del Nuevo Estado**: El usuario selecciona entre "Pendiente", "En proceso" o "Concluido".
3. **Actualización Inmediata y Reactiva**:
   - El color de fondo, indicador y etiqueta de la celda cambian instantáneamente en pantalla.
   - Las tarjetas de resumen superior (Total, Deshabilitadas, Pendientes, En proceso, Concluidas) se recalculan automáticamente en tiempo real.
4. **Persistencia Local (`localStorage`)**:
   - Cada cambio se almacena bajo la clave `brp_heatmap_activities_v1` en el navegador del usuario.
   - Al recargar o reabrir el navegador, se restauran automáticamente las modificaciones realizadas.
5. **Restablecimiento**: El botón **"Restablecer"** en la barra superior borra las modificaciones locales y restaura todas las celdas a su estado original exacto del PDF.

---

## 7. Inventario y Auditoría de Datos del PDF

- **Documento analizado**: `Mapa_Calor_Mantenimiento_Linea_E.pdf` (2 páginas, 1 matriz continua).
- **Total de Celdas en la Matriz**: **480 celdas** (16 filas × 30 columnas).
- **Celdas Grises / Deshabilitadas**: **314 celdas** (65.42%).
- **Celdas Rojas / Pendientes**: **166 celdas** (34.58%).
- **Celdas Ámbar / En Proceso**: **0 celdas** (en el PDF original todas las activas son rojas).
- **Celdas Verdes / Concluidas**: **0 celdas** (en el PDF original no hay concluidas).
- **Incertidumbres o textos ilegibles**: **0**. El 100% de los encabezados, equipos y estados fueron interpretados y verificados con certeza matemática.
