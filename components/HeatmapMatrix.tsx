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
  selectedRowId?: string;
}

export const HeatmapMatrix: React.FC<HeatmapMatrixProps> = ({
  columns,
  rows,
  cells,
  selectedCell,
  onCellClick,
  scale,
  autoFit,
  selectedRowId = 'all',
}) => {
  const [hoveredCell, setHoveredCell] = useState<ActivityCell | null>(null);

  // Filter rows if user selected a specific equipment filter
  const visibleRows = useMemo(() => {
    if (!selectedRowId || selectedRowId === 'all') return rows;
    return rows.filter((r) => r.id === selectedRowId);
  }, [rows, selectedRowId]);

  // Quick lookup map: `${rowId}_${colId}` -> cell
  const cellMap = useMemo(() => {
    const map = new Map<string, ActivityCell>();
    for (const cell of cells) {
      map.set(`${cell.rowId}_${cell.colId}`, cell);
    }
    return map;
  }, [cells]);

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

  const getCellStyles = (cell: ActivityCell | undefined, isSelected: boolean) => {
    if (!cell || !cell.isEditable || cell.status === 'disabled') {
      return {
        container: 'bg-[#E5E7EB] border-[#D1D5DB] cursor-not-allowed text-[#6B7280]',
        text: 'text-[#6B7280]',
      };
    }

    let statusStyles = {
      container: 'bg-[#EF4444] border-[#B91C1C] text-black',
      text: 'text-black font-extrabold',
    };

    if (cell.status === 'in_progress') {
      statusStyles = {
        container: 'bg-[#F59E0B] border-[#B45309] text-black',
        text: 'text-black font-extrabold',
      };
    } else if (cell.status === 'completed') {
      statusStyles = {
        container: 'bg-[#22C55E] border-[#15803D] text-black',
        text: 'text-black font-extrabold',
      };
    }

    return {
      container: cn(
        statusStyles.container,
        'cursor-pointer active:scale-95 transition-all duration-75',
        isSelected && 'ring-2 ring-corporate-accent z-10 scale-[1.02] shadow-sm'
      ),
      text: statusStyles.text,
    };
  };

  return (
    <div className="flex-1 w-full h-full p-1.5 sm:p-2.5 lg:p-3 overflow-hidden flex flex-col justify-between items-center select-none">
      <div
        className={cn(
          'w-full bg-white rounded-lg border border-corporate-border shadow-xs overflow-hidden flex flex-col',
          autoFit ? 'h-[calc(100vh-84px)] lg:h-[calc(100vh-92px)]' : 'min-h-[500px]'
        )}
        style={!autoFit ? { transform: `scale(${scale})`, transformOrigin: 'top center' } : undefined}
      >
        {/* 2D Scrollable Matrix with Freeze Panes (Sticky X & Sticky Y) */}
        <div className="w-full flex-1 overflow-auto touch-pan-x touch-pan-y relative overscroll-contain">
          <table className="w-full border-collapse text-[10px] min-w-[1250px] lg:min-w-full lg:table-fixed">
            {/* Header Row (Sticky Top) */}
            <thead className="sticky top-0 z-20 shadow-xs">
              <tr className="bg-[#1F4E79] text-white border-b border-corporate-border">
                {/* Intersection Cell (Top-Left): Sticky Top and Sticky Left */}
                <th className="w-[140px] sm:w-[170px] lg:w-[180px] min-w-[140px] sm:min-w-[160px] p-2 text-left font-bold text-xs tracking-tight border-r border-[#2C6191] bg-[#173D60] sticky top-0 left-0 z-30 shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-blue-200">
                      Equipo / Sistema
                    </span>
                    <span className="text-white font-semibold text-[11px] sm:text-xs truncate">
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
                        'p-1 border-r border-[#2C6191] text-center font-semibold relative group h-[120px] sm:h-[135px] align-bottom pb-2 transition-colors min-w-[42px] sm:min-w-[46px] lg:min-w-0',
                        isHoveredCol ? 'bg-[#2B6EA9]' : 'hover:bg-[#255C8E]'
                      )}
                    >
                      <div className="h-full flex flex-col items-center justify-end">
                        <div className="vertical-header-text text-[9.5px] sm:text-[10.5px] font-medium leading-none tracking-tight text-slate-100 max-h-[105px] sm:max-h-[115px] overflow-hidden text-ellipsis">
                          {col.name}
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Matrix Body: Rows */}
            <tbody className="divide-y divide-corporate-border">
              {visibleRows.map((row, rowIdx) => {
                const isGroupHeader = row.id === 'row_1';
                const isAlternate = rowIdx % 2 === 1;
                const isHoveredRow = hoveredCell?.rowId === row.id;

                return (
                  <tr
                    key={row.id}
                    className={cn(
                      'transition-colors h-[32px] sm:h-[34px] lg:h-[calc((100%-135px)/16)] min-h-[30px]',
                      isHoveredRow ? 'bg-blue-50/40' : isAlternate ? 'bg-corporate-muted/30' : 'bg-white'
                    )}
                  >
                    {/* Equipment Name (Sticky Left Column) */}
                    <td
                      title={row.name}
                      className={cn(
                        'px-2 py-1 font-semibold text-corporate-text border-r border-corporate-border truncate sticky left-0 z-10 shadow-xs transition-colors',
                        isHoveredRow
                          ? 'bg-blue-100 text-blue-950 font-bold'
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
                        <span className="truncate text-[10px] sm:text-[10.5px] leading-tight">
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
                            'p-0 border-r border-b border-corporate-border text-center select-none relative group touch-manipulation',
                            styles.container
                          )}
                        >
                          {cell?.isEditable ? (
                            <div className="w-full h-full flex items-center justify-center px-0.5 min-h-[28px] sm:min-h-[32px]">
                              {/* Texto Horizontal con fuente negrita y color negro */}
                              <span
                                className={cn(
                                  'text-[9px] sm:text-[10px] font-black text-black tracking-tight leading-none block truncate',
                                  styles.text
                                )}
                              >
                                {getStatusLabel(cell.status)}
                              </span>
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#E5E7EB] min-h-[28px] sm:min-h-[32px]">
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

        {/* Footer / Mobile Hint & Inspector */}
        <div className="h-6 sm:h-7 bg-corporate-bg border-t border-corporate-border px-2.5 sm:px-3 flex items-center justify-between text-[10px] sm:text-[11px] text-corporate-subtext flex-shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 truncate">
            {hoveredCell ? (
              <>
                <span className="font-semibold text-corporate-text truncate max-w-[120px] sm:max-w-none">
                  {hoveredCell.rowName}
                </span>
                <span>▸</span>
                <span className="font-semibold text-corporate-text truncate max-w-[140px] sm:max-w-none">
                  {hoveredCell.colName}
                </span>
                <span>▸</span>
                <span
                  className={cn(
                    'font-black px-1.5 py-0.2 rounded text-[9.5px] text-black shadow-xs',
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
              </>
            ) : (
              <span className="text-gray-500 truncate">
                <span className="hidden sm:inline">Pasa el cursor sobre una celda para ver detalles o toca un cuadro para editarlo.</span>
                <span className="sm:hidden">👈 Desliza horizontalmente para ver las 30 columnas. Toca para editar.</span>
              </span>
            )}
          </div>
          <div className="hidden lg:flex items-center gap-2 text-[10px] text-gray-500 flex-shrink-0">
            <span>{visibleRows.length} Equipos × 30 Actividades</span>
            <span>•</span>
            <span>Persistencia Local</span>
          </div>
        </div>
      </div>
    </div>
  );
};
