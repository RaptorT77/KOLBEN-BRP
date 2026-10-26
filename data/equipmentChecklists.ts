// Definición de checklists de actividades de mantenimiento preventivo y correctivo
// Fuente de verdad: Documento operativo oficial (PMQ756 CARGADOR / Línea E)

export interface ChecklistTask {
  id: string;
  order: number;
  description: string;
}

export interface ChecklistGroup {
  groupCode: number;
  groupName: string;
  tasks: ChecklistTask[];
}

export interface EquipmentChecklistPlan {
  planId: string;
  planName: string;
  equipmentName: string;
  groups: Record<number, ChecklistGroup>;
}

// Catálogo específico para PMQ756 3M Cargador (según imagen adjunta)
export const PMQ756_CHECKLIST: EquipmentChecklistPlan = {
  planId: 'PREV_C_3M_PMQ756',
  planName: 'PREV C 3M PMQ756',
  equipmentName: 'PMQ756 CARGADOR',
  groups: {
    10: {
      groupCode: 10,
      groupName: 'LOTO',
      tasks: [
        {
          id: '10_1',
          order: 1,
          description: 'Eliminar suministros de energia ( electrica,neumatica,hidraulica,mecanica) colocar candados',
        },
        {
          id: '10_2',
          order: 2,
          description: 'Bajar interruptor principal electrico( confirmar ausencia de voltaje con multimetro)',
        },
        {
          id: '10_3',
          order: 3,
          description: 'Cerrar llave principal de suministro de aire',
        },
        {
          id: '10_4',
          order: 4,
          description: 'Cerrar llave principal de soluble',
        },
        {
          id: '10_5',
          order: 5,
          description: 'Candadear sistemas de energia principal',
        },
      ],
    },
    30: {
      groupCode: 30,
      groupName: 'Neumatico',
      tasks: [
        {
          id: '30_1',
          order: 1,
          description: 'Limpieza o cambio de filtro de FRL',
        },
        {
          id: '30_2',
          order: 2,
          description: 'Recuperar nivel de aceite de lubricador (revisar 8 gotas por minuto ,ajustar en caso necesario)',
        },
        {
          id: '30_3',
          order: 3,
          description: 'Eliminar fugas en grippers, mangueras',
        },
      ],
    },
    60: {
      groupCode: 60,
      groupName: 'Guias',
      tasks: [
        {
          id: '60_1',
          order: 1,
          description: 'Lubricar de chumaceras',
        },
        {
          id: '60_2',
          order: 2,
          description: 'Lubricar guias embaladas',
        },
      ],
    },
    110: {
      groupCode: 110,
      groupName: 'Sensores',
      tasks: [
        {
          id: '110_1',
          order: 1,
          description: 'Revisar sensores de presencia de pieza y cargador.',
        },
        {
          id: '110_2',
          order: 2,
          description: 'Revisar fijacion de sensores',
        },
        {
          id: '110_3',
          order: 3,
          description: 'Revision de conectores de sensores',
        },
      ],
    },
    20: {
      groupCode: 20,
      groupName: 'Panel de control y potencia',
      tasks: [
        {
          id: '20_1',
          order: 1,
          description: 'Limpieza interna y externa',
        },
        {
          id: '20_2',
          order: 2,
          description: 'Revisar correcto hermetismo',
        },
        {
          id: '20_3',
          order: 3,
          description: 'Revisar o corregir correcto cierre de puertas',
        },
      ],
    },
    220: {
      groupCode: 220,
      groupName: 'Banda transportadora',
      tasks: [
        {
          id: '220_1',
          order: 1,
          description: 'Verificar alineación y tensión de banda.',
        },
        {
          id: '220_2',
          order: 2,
          description: 'Limpieza de guias de banda.',
        },
        {
          id: '220_3',
          order: 3,
          description: 'Chumaceras de transmisión de banda, lubricar con grasa.',
        },
      ],
    },
  },
};

// Checklists estándar por código de grupo para permitir consulta en todas las filas (ej. TRANSPORTADORES)
export const STANDARD_GROUP_CHECKLISTS: Record<number, ChecklistGroup> = {
  10: PMQ756_CHECKLIST.groups[10],
  20: PMQ756_CHECKLIST.groups[20],
  30: PMQ756_CHECKLIST.groups[30],
  40: {
    groupCode: 40,
    groupName: 'Transportador',
    tasks: [
      {
        id: '40_1',
        order: 1,
        description: 'Verificar alineación y tensión de banda o cadena transportadora.',
      },
      {
        id: '40_2',
        order: 2,
        description: 'Limpieza de guías de transportador y rodillos de retorno.',
      },
      {
        id: '40_3',
        order: 3,
        description: 'Chumaceras y chumaceras tensoras de transmisión, lubricar con grasa.',
      },
    ],
  },
  60: PMQ756_CHECKLIST.groups[60],
  110: PMQ756_CHECKLIST.groups[110],
  220: PMQ756_CHECKLIST.groups[220],
};

/**
 * Obtiene las tareas de checklist para una celda dada (equipo + columna)
 */
export function getChecklistForCell(rowId: string, colCode: number, colName?: string): ChecklistGroup | null {
  // Si es la fila PMQ756 (row_3)
  if (rowId === 'row_3') {
    if (PMQ756_CHECKLIST.groups[colCode]) {
      return PMQ756_CHECKLIST.groups[colCode];
    }
  }

  // Si existe en el catálogo estándar de grupos
  if (STANDARD_GROUP_CHECKLISTS[colCode]) {
    return STANDARD_GROUP_CHECKLISTS[colCode];
  }

  // Fallback genérico para cualquier otra columna activa
  return {
    groupCode: colCode,
    groupName: colName || `Grupo ${colCode}`,
    tasks: [
      {
        id: `${colCode}_1`,
        order: 1,
        description: `Inspección física y limpieza operativa (${colName || colCode}).`,
      },
      {
        id: `${colCode}_2`,
        order: 2,
        description: `Verificación funcional, fijaciones y ajuste mecánico/eléctrico.`,
      },
      {
        id: `${colCode}_3`,
        order: 3,
        description: `Prueba operativa y confirmación de funcionamiento sin anomalías.`,
      },
    ],
  };
}
