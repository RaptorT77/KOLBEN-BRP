// Catálogo maestro oficial de actividades de mantenimiento preventivo y correctivo por grupo
// Fuente de verdad: Documento técnico oficial (Checklist Línea E / Grupos 10 a 300)

export interface ChecklistTask {
  id: string;
  itemNumber: string; // ej. "10.1", "40.3", "300.1"
  description: string;
}

export interface ChecklistGroup {
  groupCode: number;
  groupName: string;
  tasks: ChecklistTask[];
}

export const ALL_GROUP_CHECKLISTS: Record<number, ChecklistGroup> = {
  10: {
    groupCode: 10,
    groupName: 'LOTO',
    tasks: [
      {
        id: '10_1',
        itemNumber: '10.1',
        description: 'Eliminar suministros de energia ( electrica,neumatica,hidraulica,mecanica) colocar candados',
      },
      {
        id: '10_2',
        itemNumber: '10.2',
        description: 'Bajar interruptor principal electrico( confirmar ausencia de voltaje con multimetro)',
      },
      {
        id: '10_3',
        itemNumber: '10.3',
        description: 'Cerrar llave principal de suministro de aire',
      },
      {
        id: '10_4',
        itemNumber: '10.4',
        description: 'Cerrar llave principal de soluble',
      },
      {
        id: '10_5',
        itemNumber: '10.5',
        description: 'Candadear sistemas de energia principal',
      },
    ],
  },
  20: {
    groupCode: 20,
    groupName: 'Panel de control y potencia',
    tasks: [
      {
        id: '20_1',
        itemNumber: '20.1',
        description: 'Limpieza interna y externa',
      },
      {
        id: '20_2',
        itemNumber: '20.2',
        description: 'Revisar correcto hermetismo',
      },
      {
        id: '20_3',
        itemNumber: '20.3',
        description: 'Revisar o corregir correcto cierre de puertas',
      },
    ],
  },
  30: {
    groupCode: 30,
    groupName: 'Neumatico',
    tasks: [
      {
        id: '30_1',
        itemNumber: '30.1',
        description: 'Limpieza o cambio de filtro de FRL',
      },
      {
        id: '30_2',
        itemNumber: '30.2',
        description: 'Recuperar nivel de aceite de lubricador (revisar 8 gotas por minuto ,ajustar en caso necesario)',
      },
      {
        id: '30_3',
        itemNumber: '30.3',
        description: 'Eliminar fugas en grippers, mangueras',
      },
    ],
  },
  40: {
    groupCode: 40,
    groupName: 'Transportador',
    tasks: [
      {
        id: '40_1',
        itemNumber: '40.1',
        description: 'Revisar sensores y cables de cilindros centradores',
      },
      {
        id: '40_2',
        itemNumber: '40.2',
        description: 'Limpieza de riel y ajuste en tornilleria.',
      },
      {
        id: '40_3',
        itemNumber: '40.3',
        description: 'Desmontar tapa y revisar estado de banda de Transportador IAI (REALIZAR LIMPIEZA / REMPLAZAR BANDA)',
      },
      {
        id: '40_4',
        itemNumber: '40.4',
        description: 'Revisar servomotor de transportador',
      },
      {
        id: '40_5',
        itemNumber: '40.5',
        description: 'Revisar estado de cable de servomotor y apretar clemas en controlador.',
      },
      {
        id: '40_6',
        itemNumber: '40.6',
        description: 'Revisar amortiguadores en general.',
      },
      {
        id: '40_7',
        itemNumber: '40.7',
        description: 'Revisar razador de pallet, que limpien y estado de sujecion del pallet.',
      },
      {
        id: '40_8',
        itemNumber: '40.8',
        description: 'Revisar correcto funcionamienro de sensores de presencia de piezas en pallet',
      },
      {
        id: '40_9',
        itemNumber: '40.9',
        description: 'Prueba para revisar atoramiento de pallet (10 ciclos)',
      },
    ],
  },
  50: {
    groupCode: 50,
    groupName: 'SISTEMA ELECTRICO',
    tasks: [
      {
        id: '50_1',
        itemNumber: '50.1',
        description: 'Comprobar el correcto funcionamiento de las luces interiores tablero principal y panel de operación,',
      },
      {
        id: '50_2',
        itemNumber: '50.2',
        description: 'Limpieza a Tablero principal y operación.',
      },
      {
        id: '50_3',
        itemNumber: '50.3',
        description: 'Comprobar el correcto funcionamiento de selectores, lámparas, botones de emergencia.',
      },
      {
        id: '50_4',
        itemNumber: '50.4',
        description: 'Revisar tornillería y hermetismo de tableros principal y operación.',
      },
      {
        id: '50_5',
        itemNumber: '50.5',
        description: 'Limpiar e inspeccionar todos los interruptores de limite, cables y conectores.',
      },
      {
        id: '50_6',
        itemNumber: '50.6',
        description: 'Comprobar el correcto funcionamiento del aire acondicionado, Limpiar rejillas y cambio de estela filtrante.',
      },
      {
        id: '50_7',
        itemNumber: '50.7',
        description: 'Limpiar y comprobar el correcto funcionamiento de interruptores de pedal.',
      },
      {
        id: '50_8',
        itemNumber: '50.8',
        description: 'Si es necesario realice la reparaciones o sustituciones.',
      },
    ],
  },
  60: {
    groupCode: 60,
    groupName: 'Guias',
    tasks: [
      {
        id: '60_1',
        itemNumber: '60.1',
        description: 'Lubricar de chumaceras',
      },
      {
        id: '60_2',
        itemNumber: '60.2',
        description: 'Lubricar guias embaladas',
      },
    ],
  },
  70: {
    groupCode: 70,
    groupName: 'SISTEMA DE HUSILLO',
    tasks: [
      {
        id: '70_1',
        itemNumber: '70.1',
        description: 'Asegurar funcionamiento de sello de aire husillo',
      },
      {
        id: '70_2',
        itemNumber: '70.2',
        description: 'Checar sistema mecanico del eje C. (giro de 180 °) del chuck',
      },
      {
        id: '70_3',
        itemNumber: '70.3',
        description: 'Checar guardas y tornilleria',
      },
    ],
  },
  80: {
    groupCode: 80,
    groupName: 'Servomotores Z, Y, X, 4to y motor de husillo',
    tasks: [
      {
        id: '80_1',
        itemNumber: '80.1',
        description: 'Revisar aislamiento de motor y cable de alimentacion (<10Megaohms,Nok)',
      },
      {
        id: '80_2',
        itemNumber: '80.2',
        description: 'Revisar estado de acoplamiento en caso de daño avisar para su programacion',
      },
      {
        id: '80_3',
        itemNumber: '80.3',
        description: 'Revisar estado de cableado de encoder y conectores',
      },
      {
        id: '80_4',
        itemNumber: '80.4',
        description: 'Revisar estado de freno de eje Z asi como su cableado de alimentacion',
      },
      {
        id: '80_5',
        itemNumber: '80.5',
        description: 'Limpieza o cambio de ventilador de husillo, asi como las rejillas de enfrimiento de motor',
      },
      {
        id: '80_6',
        itemNumber: '80.6',
        description: 'Revisar o cambio de valvula de frenado de 4to eje (254-1447)',
      },
    ],
  },
  90: {
    groupCode: 90,
    groupName: 'Sistema de filtraje step1',
    tasks: [
      {
        id: '90_1',
        itemNumber: '90.1',
        description: 'Revisar aislamiento de motor de bombas de barridos (<10Megaohms,Nok)',
      },
      {
        id: '90_2',
        itemNumber: '90.2',
        description: 'Revisar y limpiar filtros tipos tambor',
      },
      {
        id: '90_3',
        itemNumber: '90.3',
        description: 'Revisar los barridos de los filtros tambor, destapar tuberia de ser necesario y realizar limpieza.',
      },
      {
        id: '90_4',
        itemNumber: '90.4',
        description: 'Revisar fugas en tuberias de barridos',
      },
      {
        id: '90_5',
        itemNumber: '90.5',
        description: 'Revisar y cambio de filtros de motor de bombas de barridos',
      },
    ],
  },
  100: {
    groupCode: 100,
    groupName: 'Sistema de filtraje step 2',
    tasks: [
      {
        id: '100_1',
        itemNumber: '100.1',
        description: 'Revisar aislamiento de motor de extractor (<10Megaohms,Nok)',
      },
      {
        id: '100_2',
        itemNumber: '100.2',
        description: 'Revisar y cambio de filtros de motor de extractor',
      },
      {
        id: '100_3',
        itemNumber: '100.3',
        description: 'Colocar tornilleria y guardas de extractor',
      },
    ],
  },
  110: {
    groupCode: 110,
    groupName: 'Sensores',
    tasks: [
      {
        id: '110_1',
        itemNumber: '110.1',
        description: 'Revisar sensores de presencia de pieza y cargador.',
      },
      {
        id: '110_2',
        itemNumber: '110.2',
        description: 'Revisar fijacion de sensores',
      },
      {
        id: '110_3',
        itemNumber: '110.3',
        description: 'Revision de conectores de sensores',
      },
    ],
  },
  120: {
    groupCode: 120,
    groupName: 'Sistema de ejes',
    tasks: [
      {
        id: '120_1',
        itemNumber: '120.1',
        description: 'Checar estado fisico y tornilleria de guardas de eje X',
      },
      {
        id: '120_2',
        itemNumber: '120.2',
        description: 'Limpieza a Servo de eje X ,Z , revision de razadores',
      },
    ],
  },
  130: {
    groupCode: 130,
    groupName: 'Lubricacion central',
    tasks: [
      {
        id: '130_1',
        itemNumber: '130.1',
        description: 'Limpieza de deposito de aceite asi como filtro de succion de bomba',
      },
      {
        id: '130_2',
        itemNumber: '130.2',
        description: 'Revisar mecanismo de bomba de lubricacion',
      },
      {
        id: '130_3',
        itemNumber: '130.3',
        description: 'Revisar y confirmar senales de sensor de nivel y presion',
      },
      {
        id: '130_4',
        itemNumber: '130.4',
        description: 'Limpieza o cambio de disificadores (con sistema de ultrasonido)',
      },
      {
        id: '130_5',
        itemNumber: '130.5',
        description: 'Checar la llegada de aceite hasta el punto de aplicación',
      },
      {
        id: '130_6',
        itemNumber: '130.6',
        description: 'Eliminar fugas existentes en mangueras,block\'s,dosificadores',
      },
      {
        id: '130_7',
        itemNumber: '130.7',
        description: 'Llenar deposito de aceite tipo E (3 litros)',
      },
      {
        id: '130_8',
        itemNumber: '130.8',
        description: 'Confirmar tiempo de lubricacion ( un pulso cada 15- 20 min)',
      },
    ],
  },
  140: {
    groupCode: 140,
    groupName: 'GUARDAS',
    tasks: [
      {
        id: '140_1',
        itemNumber: '140.1',
        description: 'Revisar y ajustar tornillería, fijación y estado general de guardas.',
      },
    ],
  },
  150: {
    groupCode: 150,
    groupName: 'Sistema de cargador',
    tasks: [
      {
        id: '150_1',
        itemNumber: '150.1',
        description: 'Ajuste de gripper revisar holguras, fugas, forzamiento.',
      },
      {
        id: '150_2',
        itemNumber: '150.2',
        description: 'Revision o cambio de sensores flojos en gripper',
      },
    ],
  },
  160: {
    groupCode: 160,
    groupName: 'Sistema de robot',
    tasks: [
      {
        id: '160_1',
        itemNumber: '160.1',
        description: 'Ajuste de gripper revisar holguras, fugas, forzamiento.',
      },
      {
        id: '160_2',
        itemNumber: '160.2',
        description: 'Revision o cambio de sensores flojos en gripper',
      },
    ],
  },
  170: {
    groupCode: 170,
    groupName: 'Magazin',
    tasks: [
      {
        id: '170_1',
        itemNumber: '170.1',
        description: 'Engrasar engrane de giro y leva de seguidor',
      },
      {
        id: '170_2',
        itemNumber: '170.2',
        description: 'Cambio de seguidor de elevacion de Magazin y Clamp de Husillo',
      },
      {
        id: '170_3',
        itemNumber: '170.3',
        description: 'Revisar o cambio de resorte de fijacion de Magazin',
      },
      {
        id: '170_4',
        itemNumber: '170.4',
        description: 'Revisar o cambio de engrane de husiilo y Magazin',
      },
    ],
  },
  180: {
    groupCode: 180,
    groupName: 'Puerta frontal',
    tasks: [
      {
        id: '180_1',
        itemNumber: '180.1',
        description: 'Revisar y colocar guardas faltantes',
      },
      {
        id: '180_2',
        itemNumber: '180.2',
        description: 'Revisar y validar funcionamiento de interlock',
      },
      {
        id: '180_3',
        itemNumber: '180.3',
        description: 'Revisar fijacion de bases y soportes, colocar tonrilleria faltante',
      },
      {
        id: '180_4',
        itemNumber: '180.4',
        description: 'Limpieza de area en general',
      },
    ],
  },
  190: {
    groupCode: 190,
    groupName: 'Drives',
    tasks: [
      {
        id: '190_1',
        itemNumber: '190.1',
        description: 'Limpieza e inspeccion de ventiladores',
      },
      {
        id: '190_2',
        itemNumber: '190.2',
        description: 'Reapriete de conexiones de servomotores',
      },
    ],
  },
  200: {
    groupCode: 200,
    groupName: 'CILINDROS',
    tasks: [
      {
        id: '200_1',
        itemNumber: '200.1',
        description: 'Revisar cilindros neumaticos, fugas en valvula, y conexiones.',
      },
      {
        id: '200_2',
        itemNumber: '200.2',
        description: 'Regular velocidades de cilindro',
      },
      {
        id: '200_3',
        itemNumber: '200.3',
        description: 'Revisar montajes y alineacion de cilindros de puertas',
      },
      {
        id: '200_4',
        itemNumber: '200.4',
        description: 'Revisar sensores de cilindros (abierto y cerrado de puerta)',
      },
      {
        id: '200_5',
        itemNumber: '200.5',
        description: 'Verificar holguras de Grippers de transfer',
      },
      {
        id: '200_6',
        itemNumber: '200.6',
        description: 'Revisar y lubricar con aceite tipo E guias embaladas de transfer',
      },
    ],
  },
  210: {
    groupCode: 210,
    groupName: 'BOMBA DE ALTA PRESION',
    tasks: [
      {
        id: '210_1',
        itemNumber: '210.1',
        description: 'Revisar fugas en valvula y conexiones.',
      },
      {
        id: '210_2',
        itemNumber: '210.2',
        description: 'Revisar manometros de alta presion',
      },
      {
        id: '210_3',
        itemNumber: '210.3',
        description: 'Revisar y limpiar de filtros de agua.',
      },
      {
        id: '210_4',
        itemNumber: '210.4',
        description: 'Verificar estado de filtro de acometida. 2240000055',
      },
      {
        id: '210_5',
        itemNumber: '210.5',
        description: 'Revisar fugas en conexiones de bomba y repararla y/o cambiar bomba',
      },
      {
        id: '210_6',
        itemNumber: '210.6',
        description: 'Verificar tensión de banda de bomba de alta presión',
      },
    ],
  },
  220: {
    groupCode: 220,
    groupName: 'Banda transportadora',
    tasks: [
      {
        id: '220_1',
        itemNumber: '220.1',
        description: 'Verificar alineación y tensión de banda.',
      },
      {
        id: '220_2',
        itemNumber: '220.2',
        description: 'Limpieza de guias de banda.',
      },
      {
        id: '220_3',
        itemNumber: '220.3',
        description: 'Chumaceras de transmisión de banda, lubricar con grasa.',
      },
    ],
  },
  230: {
    groupCode: 230,
    groupName: 'LUBRICACION CENTRAL',
    tasks: [
      {
        id: '230_1',
        itemNumber: '230.1',
        description: 'Limpieza de deposito de aceite asi como filtro de succion de bomba',
      },
      {
        id: '230_2',
        itemNumber: '230.2',
        description: 'Revisar mecanismo de bomba de lubricacion',
      },
      {
        id: '230_3',
        itemNumber: '230.3',
        description: 'Revisar y confirmar senales de sensor de nivel y presion',
      },
      {
        id: '230_4',
        itemNumber: '230.4',
        description: 'Limpieza o cambio de dosificadores (con sistema de ultrasonido)',
      },
      {
        id: '230_5',
        itemNumber: '230.5',
        description: 'Checar la llegada de aceite hasta el punto de aplicación',
      },
      {
        id: '230_6',
        itemNumber: '230.6',
        description: 'Eliminar fugas existentes en mangueras,block\'s,dosificadores',
      },
      {
        id: '230_7',
        itemNumber: '230.7',
        description: 'Llenar deposito de aceite tipo E (3 litros)',
      },
      {
        id: '230_8',
        itemNumber: '230.8',
        description: 'Confirmar tiempo de lubricacion ( un pulso cada 15- 20 min)',
      },
    ],
  },
  240: {
    groupCode: 240,
    groupName: 'Sistema de soluble',
    tasks: [
      {
        id: '240_1',
        itemNumber: '240.1',
        description: 'Limpieza de válvulas soluble neumáticas',
      },
      {
        id: '240_2',
        itemNumber: '240.2',
        description: 'Revisar las mangueras de soluble (grietas, sujeción)',
      },
    ],
  },
  250: {
    groupCode: 250,
    groupName: 'Transportador',
    tasks: [
      {
        id: '250_1',
        itemNumber: '250.1',
        description: 'Revisar sensores y cables de cilindros centradores',
      },
      {
        id: '250_2',
        itemNumber: '250.2',
        description: 'Limpieza de riel y ajuste en tornilleria.',
      },
      {
        id: '250_3',
        itemNumber: '250.3',
        description: 'Desmontar tapa y revisar estado de banda de Transportador IAI (REALIZAR LIMPIEZA / REMPLAZAR BANDA)',
      },
      {
        id: '250_4',
        itemNumber: '250.4',
        description: 'Revisar servomotor de transportador',
      },
      {
        id: '250_5',
        itemNumber: '250.5',
        description: 'Revisar estado de cable de servomotor y apretar clemas en controlador.',
      },
      {
        id: '250_6',
        itemNumber: '250.6',
        description: 'Revisar amortiguadores en general.',
      },
      {
        id: '250_7',
        itemNumber: '250.7',
        description: 'Revisar razador de pallet, que limpien y estado de sujecion del pallet.',
      },
      {
        id: '250_8',
        itemNumber: '250.8',
        description: 'Revisar correcto funcionamienro de sensores de presencia de piezas en pallet',
      },
      {
        id: '250_9',
        itemNumber: '250.9',
        description: 'Prueba para revisar atoramiento de pallet (10 ciclos)',
      },
    ],
  },
  260: {
    groupCode: 260,
    groupName: 'Extractor de neblina',
    tasks: [
      {
        id: '260_1',
        itemNumber: '260.1',
        description: 'Verificar estado y limpiar extractor de neblina',
      },
      {
        id: '260_2',
        itemNumber: '260.2',
        description: 'Cambio de filtro en motor',
      },
    ],
  },
  270: {
    groupCode: 270,
    groupName: 'Cubierta y Bancadas',
    tasks: [
      {
        id: '270_1',
        itemNumber: '270.1',
        description: 'Revisar estado de razadores y guardas telescopicas de eje X, Y, Z',
      },
      {
        id: '270_2',
        itemNumber: '270.2',
        description: 'Remover rebaba acumulada sobre recorrido en bancada de ejes X, Y, Z',
      },
      {
        id: '270_3',
        itemNumber: '270.3',
        description: 'Colocar correctamete guardas y tornilleria de soporte faltante',
      },
    ],
  },
  280: {
    groupCode: 280,
    groupName: 'Sistema de sujecion de pieza',
    tasks: [
      {
        id: '280_1',
        itemNumber: '280.1',
        description: 'Revisar libre movimiento de chuck,localizador',
      },
      {
        id: '280_2',
        itemNumber: '280.2',
        description: 'Revisar correcto funcionamieto de sensores chuck, localizador',
      },
      {
        id: '280_3',
        itemNumber: '280.3',
        description: 'Revisar correcto funcionamiento de Gapsensor',
      },
      {
        id: '280_4',
        itemNumber: '280.4',
        description: 'Eliminar fugas existentes en mangueras, block\'s',
      },
    ],
  },
  290: {
    groupCode: 290,
    groupName: 'Rotocople',
    tasks: [
      {
        id: '290_1',
        itemNumber: '290.1',
        description: 'Revisar y corregir fugas en conectores y estado de mangueras',
      },
      {
        id: '290_2',
        itemNumber: '290.2',
        description: 'Revisar o cambiar sensores de cilindro (regleta)',
      },
    ],
  },
  300: {
    groupCode: 300,
    groupName: 'Stopper',
    tasks: [
      {
        id: '300_1',
        itemNumber: '300.1',
        description: 'Revisar y engrasar stopper',
      },
    ],
  },
};

/**
 * Obtiene las actividades oficiales de checklist para cualquier columna por código de grupo
 */
export function getChecklistForCell(_rowId: string, colCode: number, colName?: string): ChecklistGroup | null {
  if (ALL_GROUP_CHECKLISTS[colCode]) {
    return ALL_GROUP_CHECKLISTS[colCode];
  }

  // Fallback seguro si existiera un grupo no registrado
  return {
    groupCode: colCode,
    groupName: colName || `Grupo ${colCode}`,
    tasks: [
      {
        id: `${colCode}_1`,
        itemNumber: `${colCode}.1`,
        description: `Inspección física y limpieza operativa (${colName || colCode}).`,
      },
      {
        id: `${colCode}_2`,
        itemNumber: `${colCode}.2`,
        description: `Verificación funcional, fijaciones y ajuste mecánico/eléctrico.`,
      },
      {
        id: `${colCode}_3`,
        itemNumber: `${colCode}.3`,
        description: `Prueba operativa y confirmación de funcionamiento sin anomalías.`,
      },
    ],
  };
}
