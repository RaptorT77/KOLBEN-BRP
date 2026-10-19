'use client';

import React, { useState, useMemo } from 'react';
import { ActivityCell, ActivityStatus, DiagramColumn, DiagramRow } from '@/types/diagram';
import { cn } from '@/lib/utils';

interface HeatmapMatrixProps {
  columns: DiagramColumn[];
  rows: DiagramRow[];
  cells: ActivityCell[];
  selectedCell: ActivityCell | null;
  onCellClick: (cell: ActivityCell) => void;
  scale: number;
  autoFit: boolean;
  colorMode: 'soft' | 'solid';
}

export const HeatmapMatrix: React.FC<HeatmapMatrixProps> = ({
  columns,
  rows,
  cells,
  selectedCell,
  onCellClick,
  scale,
  autoFit,
}) => {
  const [hoveredCell, setHoveredCell] = useState<ActivityCell | null>(null);

  // Quick lookup map: `${rowId}_${colId}` -> cell
  const cellMap = useMemo(() => {
    const map = new Map<string, ActivityCell>();
    for (const cell of cells) {
      map.set(`${cell.rowId}_${cell.colId}`, cell);
    }
    return map;
  }, [cells]);

  // Abreviaturas solicitadas: Pendiente = PEND., En Proceso = RUN, Concluido = OK
  const getStatusLabel = (status: ActivityStatus) => {
    switch (status) {
      case 'pending':
        return 'PEND.';
      case 'in_progress':
        return 'RUN';
      case 'completed':
        return 'OK';
      case 'disabled':
      default:
        return '';
    }
  };

  const getStatusFullLabel = (status: ActivityStatus) => {
    switch (status) {
      case 'pending':
        return 'Pendiente (PEND.)';
      case 'in_progress':
        return 'En proceso (RUN)';
      case 'completed':
        return 'Concluido (OK)';
      case 'disabled':
      default:
        return 'Deshabilitado';
    }
  };

  // Colores solicitados: Fondo ROJO para PEND., Fondo AMBAR para RUN, Fondo VERDE para OK, texto en color NEGRO
  const getCellStyles = (cell: ActivityCell | undefined, isSelected: boolean) => {
    if (!cell || !cell.isEditable || cell.status === 'disabled') {
      return {
        container: 'bg-[#E5E7EB] border-[#D1D5DB] cursor-not-allowed text-[#6B7280]',
        text: 'text-[#6B7280]',
      };
    }

    let statusStyles = {
      // PEND. = Fondo Rojo (#EF4444 o #DC2626), Texto Negro
      container: 'bg-[#EF4444] border-[#B91C1C] text-black',
      text: 'text-black font-extrabold',
    };

    if (cell.status === 'in_progress') {
      // RUN = Fondo Ámbar (#F59E0B o #D97706), Texto Negro
      statusStyles = {
        container: 'bg-[#F59E0B] border-[#B45309] text-black',
        text: 'text-black font-extrabold',
      };
    } else if (cell.status === 'completed') {
      // OK = Fondo Verde (#22C55E o #16A34A), Texto Negro
      statusStyles = {
        container: 'bg-[#22C55E] border-[#15803D] text-black',
        text: 'text-black font-extrabold',
      };
    }

    return {
      container: cn(
        statusStyles.container,
        'cursor-pointer hover:brightness-105 active:scale-95 transition-all duration-75',
        isSelected && 'ring-2 ring-corporate-accent z-10 scale-[1.02] shadow-sm'
      ),
      text: statusStyles.text,
    };
  };

  return (
    <div className="flex-1 w-full h-full p-2 sm:p-3 overflow-hidden flex flex-col justify-between items-center select-none">
      <div
        className={cn(
          'w-full bg-white rounded-lg border border-corporate-border shadow-xs overflow-hidden flex flex-col',
          autoFit ? 'h-[calc(100vh-100px)]' : ''
        )}
        style={!autoFit ? { transform: `scale(${scale})`, transformOrigin: 'top center' } : undefined}
      >
        <div className="w-full flex-1 flex flex-col overflow-x-auto overflow-y-hidden">
          <table className="w-full h-full border-collapse table-fixed text-[10px]">
            {/* Header Row */}
            <thead>
              <tr className="bg-[#1F4E79] text-white border-b border-corporate-border">
                {/* Equipment header cell */}
                <th className="w-[180px] min-w-[160px] p-2 text-left font-bold text-xs tracking-tight border-r border-[#2C6191] bg-[#173D60] sticky left-0 z-20">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-blue-200">
                      Columna / Fila
                    </span>
                    <span className="text-white font-semibold text-xs">
                      Pestaña / Grupo
                    </span>
                  </div>
                </th>

                {/* 30 Column Headers */}
                {columns.map((col) => {
                  const isHoveredCol = hoveredCell?.colId === col.id;
                  return (
                    <th
                      key={col.id}
                      title={col.name}
                      className={cn(
                        'p-1 border-r border-[#2C6191] text-center font-semibold relative group h-[135px] align-bottom pb-2 transition-colors',
                        isHoveredCol ? 'bg-[#2B6EA9]' : 'hover:bg-[#255C8E]'
                      )}
                    >
                      <div className="h-full flex flex-col items-center justify-end">
                        <div className="vertical-header-text text-[10.5px] font-medium leading-none tracking-tight text-slate-100 max-h-[115px] overflow-hidden text-ellipsis">
                          {col.name}
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Matrix Body: 16 Rows */}
            <tbody className="divide-y divide-corporate-border">
              {rows.map((row, rowIdx) => {
                const isGroupHeader = row.id === 'row_1';
                const isAlternate = rowIdx % 2 === 1;
                const isHoveredRow = hoveredCell?.rowId === row.id;

                return (
                  <tr
                    key={row.id}
                    className={cn(
                      'transition-colors h-[calc((100%-135px)/16)] min-h-[25px]',
                      isHoveredRow ? 'bg-blue-50/40' : isAlternate ? 'bg-corporate-muted/30' : 'bg-white'
                    )}
                  >
                    {/* Equipment Name (Left Header) */}
                    <td
                      title={row.name}
                      className={cn(
                        'px-2.5 py-0.5 font-semibold text-corporate-text border-r border-corporate-border truncate sticky left-0 z-10 shadow-xs transition-colors',
                        isHoveredRow
                          ? 'bg-blue-100/70 text-blue-900 font-bold'
                          : isGroupHeader
                          ? 'bg-slate-100 font-bold'
                          : isAlternate
                          ? 'bg-[#F8FAFC]'
                          : 'bg-white'
                      )}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className={cn(
                            'w-1.5 h-1.5 rounded-full flex-shrink-0',
                            isHoveredRow ? 'bg-blue-600' : 'bg-slate-400'
                          )}
                        />
                        <span className="truncate text-[10.5px] leading-tight">
                          {row.name}
                        </span>
                      </div>
                    </td>

                    {/* 30 Cells */}
                    {columns.map((col) => {
                      const cell = cellMap.get(`${row.id}_${col.id}`);
                      const isSelected = selectedCell?.id === cell?.id;
                      const styles = getCellStyles(cell, isSelected);

                      return (
                        <td
                          key={col.id}
                          onMouseEnter={() => setHoveredCell(cell || null)}
                          onMouseLeave={() => setHoveredCell(null)}
                          onClick={() => {
                            if (cell && cell.isEditable) {
                              onCellClick(cell);
                            }
                          }}
                          className={cn(
                            'p-0 border-r border-b border-corporate-border text-center select-none relative group',
                            styles.container
                          )}
                        >
                          {cell?.isEditable ? (
                            <div className="w-full h-full flex items-center justify-center px-0.5">
                              {/* Texto Horizontal con fuente negrita y color negro solicitado */}
                              <span
                                className={cn(
                                  'text-[9.5px] sm:text-[10px] font-black text-black tracking-tighter leading-none block truncate',
                                  styles.text
                                )}
                              >
                                {getStatusLabel(cell.status)}
                              </span>
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#E5E7EB]">
                              <span className="text-[10px] text-gray-400 opacity-40 font-bold">—</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Executive Quick Inspector Bar at bottom of table */}
        <div className="h-6 bg-corporate-bg border-t border-corporate-border px-3 flex items-center justify-between text-[11px] text-corporate-subtext flex-shrink-0">
          <div className="flex items-center gap-2 truncate">
            {hoveredCell ? (
              <>
                <span className="font-semibold text-corporate-text">
                  {hoveredCell.rowName}
                </span>
                <span>▸</span>
                <span className="font-semibold text-corporate-text">
                  {hoveredCell.colName}
                </span>
                <span>▸</span>
                <span
                  className={cn(
                    'font-bold px-1.5 py-0.2 rounded text-[10px] text-black',
                    hoveredCell.status === 'disabled'
                      ? 'bg-gray-200 text-gray-700'
                      : hoveredCell.status === 'pending'
                      ? 'bg-[#EF4444]'
                      : hoveredCell.status === 'in_progress'
                      ? 'bg-[#F59E0B]'
                      : 'bg-[#22C55E]'
                  )}
                >
                  {getStatusFullLabel(hoveredCell.status)}
                </span>
                {hoveredCell.isEditable && (
                  <span className="text-[10px] text-blue-600 font-medium">
                    (Clic para cambiar estado)
                  </span>
                )}
              </>
            ) : (
              <span className="text-gray-400">
                Pasa el cursor sobre cualquier celda para inspeccionar detalles o haz clic en un cuadro activo para editarlo.
              </span>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[10px] text-gray-500">
            <span>Matriz: 16 Filas × 30 Columnas</span>
            <span>•</span>
            <span>Persistencia: Local</span>
          </div>
        </div>
      </div>
    </div>
  );
};
