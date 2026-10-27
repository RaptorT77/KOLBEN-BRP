'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ActivityCell, ActivityStatus, CellChecklistState, DiagramColumn, DiagramRow } from '@/types/diagram';
import { cn } from '@/lib/utils';
import { ChecklistPopover } from '@/components/ChecklistPopover';
import { getChecklistForCell, ChecklistGroup } from '@/data/equipmentChecklists';
import { Check, MousePointer, Info, Filter } from 'lucide-react';

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
  checklists: Record<string, CellChecklistState>;
  onUpdateChecklist: (
    cellId: string,
    completedTaskIds: string[],
    naTaskIds: string[],
    allTaskIds: string[]
  ) => void;
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
  checklists,
  onUpdateChecklist,
}) => {
  const [hoveredCell, setHoveredCell] = useState<ActivityCell | null>(null);
  
  // Fila seleccionada con el mouse por el usuario (ej. TRANSPORTADORES o PMQ756 3M Cargador)
  // Por defecto inicializamos con 'row_1' (TRANSPORTADORES) para responder de inmediato al ejemplo del usuario
  const [activeSelectedRowId, setActiveSelectedRowId] = useState<string | null>('row_1');

  // Menú emergente (ChecklistPopover) activo al pasar el mouse sobre una columna activa
  const [activePopover, setActivePopover] = useState<{
    cell: ActivityCell;
    group: ChecklistGroup;
    position: { top: number; left: number };
    pinned: boolean;
  } | null>(null);

  const popoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Limpiar timers al desmontar
  useEffect(() => {
    return () => {
      if (popoverTimeoutRef.current) {
        clearTimeout(popoverTimeoutRef.current);
      }
    };
  }, []);

  // Filtrado de filas si el usuario usa el dropdown de equipos
  const visibleRows = useMemo(() => {
    if (!selectedRowId || selectedRowId === 'all') return rows;
    return rows.filter((r) => r.id === selectedRowId);
  }, [rows, selectedRowId]);

  // Mapa rápido de celdas: `${rowId}_${colId}` -> ActivityCell
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

  const getCellStyles = (cell: ActivityCell | undefined, isSelected: boolean, isRowSelected: boolean) => {
    if (!cell) {
      return {
        container: 'bg-[#E5E7EB] border-[#D1D5DB] text-[#6B7280]',
        text: 'text-[#6B7280]',
      };
    }

    // Celdas deshabilitadas estructuralmente del PDF (nunca editables)
    if (!cell.isEditable || cell.initialStatus === 'disabled') {
      return {
        container: 'bg-[#E5E7EB] border-[#D1D5DB] cursor-not-allowed text-[#6B7280]',
        text: 'text-[#6B7280]',
      };
    }

    // Celda editable pero con todas las tareas marcadas como NA -> Color Gris
    if (cell.status === 'disabled') {
      return {
        container: cn(
          'bg-[#E5E7EB] border-[#D1D5DB] text-[#4B5563] cursor-pointer active:scale-95 transition-all duration-75',
          isRowSelected && 'hover:brightness-105 hover:ring-1 hover:ring-blue-400',
          isSelected && 'ring-2 ring-corporate-accent z-10 scale-[1.02] shadow-sm'
        ),
        text: 'text-[#4B5563] font-black',
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
        isRowSelected && 'hover:brightness-105 hover:ring-1 hover:ring-blue-400',
        isSelected && 'ring-2 ring-corporate-accent z-10 scale-[1.02] shadow-sm'
      ),
      text: statusStyles.text,
    };
  };

  // Manejo del cursor sobre una celda activa (solo para inspector de pie, NO abre popover)
  const handleCellMouseEnter = (
    cell: ActivityCell | undefined,
    col: DiagramColumn,
    e: React.MouseEvent<HTMLTableCellElement>
  ) => {
    if (!cell) return;
    setHoveredCell(cell);
  };

  const handleCellMouseLeave = () => {
    setHoveredCell(null);
  };

  const handlePopoverMouseEnter = () => {
    if (popoverTimeoutRef.current) {
      clearTimeout(popoverTimeoutRef.current);
      popoverTimeoutRef.current = null;
    }
  };

  const handlePopoverMouseLeave = () => {
    // Popover solo se cierra al interactuar explícitamente con cerrar o fondo
  };

  // Clic en una celda: el menú emergente debe aparecer SI Y SOLO SI se da clic en una casilla válida
  const handleCellClickInternal = (
    cell: ActivityCell,
    col: DiagramColumn,
    e: React.MouseEvent<HTMLTableCellElement>
  ) => {
    // Si la celda no es válida (deshabilitada según el PDF), NO abrir menú
    if (!cell.isEditable || cell.initialStatus === 'disabled') {
      return;
    }

    // Si la fila no estaba seleccionada, seleccionarla al hacer clic
    if (activeSelectedRowId !== cell.rowId) {
      setActiveSelectedRowId(cell.rowId);
    }

    const group = getChecklistForCell(cell.rowId, col.code, col.name);
    if (group && group.tasks.length > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      setActivePopover({
        cell,
        group,
        position: {
          top: rect.bottom + 6,
          left: Math.max(20, Math.min(rect.left - 60, window.innerWidth - 460)),
        },
        pinned: true,
      });
    }

    onCellClick(cell);
  };

  // Estado de checklist para la celda actualmente abierta en el popover
  const currentCellState = useMemo(() => {
    if (!activePopover) return { completed: [], na: [] };
    const raw = checklists[activePopover.cell.id];
    if (raw) {
      return {
        completed: raw.completed || [],
        na: raw.na || [],
      };
    }
    // Si la celda está en completed pero no se había registrado objeto, asumimos todas completadas
    if (activePopover.cell.status === 'completed') {
      return {
        completed: activePopover.group.tasks.map((t) => t.id),
        na: [],
      };
    }
    return { completed: [], na: [] };
  }, [activePopover, checklists]);

  // Manejar cambio en un checkbox individual OK
  const handleToggleTask = (taskId: string) => {
    if (!activePopover) return;
    const allTaskIds = activePopover.group.tasks.map((t) => t.id);
    const prevCompleted = currentCellState.completed;
    const prevNA = currentCellState.na;

    const exists = prevCompleted.includes(taskId);
    const nextCompleted = exists
      ? prevCompleted.filter((id) => id !== taskId)
      : [...prevCompleted, taskId];

    // Si el usuario marca OK, se retira de NA
    const nextNA = prevNA.filter((id) => id !== taskId);

    onUpdateChecklist(activePopover.cell.id, nextCompleted, nextNA, allTaskIds);
  };

  // Manejar cambio en un checkbox individual NA (No Aplica)
  const handleToggleNA = (taskId: string) => {
    if (!activePopover) return;
    const allTaskIds = activePopover.group.tasks.map((t) => t.id);
    const prevCompleted = currentCellState.completed;
    const prevNA = currentCellState.na;

    const exists = prevNA.includes(taskId);
    const nextNA = exists
      ? prevNA.filter((id) => id !== taskId)
      : [...prevNA, taskId];

    // Si el usuario marca NA, se retira de OK (completado)
    const nextCompleted = prevCompleted.filter((id) => id !== taskId);

    onUpdateChecklist(activePopover.cell.id, nextCompleted, nextNA, allTaskIds);
  };

  // Marcar / Desmarcar todos los checkboxes aplicables
  const handleToggleAll = (complete: boolean) => {
    if (!activePopover) return;
    const allTaskIds = activePopover.group.tasks.map((t) => t.id);
    const currentNA = currentCellState.na;
    const nextCompleted = complete
      ? allTaskIds.filter((id) => !currentNA.includes(id))
      : [];
    onUpdateChecklist(activePopover.cell.id, nextCompleted, currentNA, allTaskIds);
  };

  const selectedRowObj = rows.find((r) => r.id === activeSelectedRowId);

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
                <th className="w-[140px] sm:w-[170px] lg:w-[185px] min-w-[140px] sm:min-w-[160px] p-2 text-left font-bold text-xs tracking-tight border-r border-[#2C6191] bg-[#173D60] sticky top-0 left-0 z-30 shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-blue-200">
                      Equipo / Fila (Clic para Seleccionar)
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
                const isRowSelected = activeSelectedRowId === row.id;

                return (
                  <tr
                    key={row.id}
                    className={cn(
                      'transition-colors h-[32px] sm:h-[34px] lg:h-[calc((100%-135px)/16)] min-h-[30px]',
                      isRowSelected
                        ? 'bg-blue-100/40 ring-1 ring-inset ring-blue-500/40'
                        : isHoveredRow
                        ? 'bg-blue-50/40'
                        : isAlternate
                        ? 'bg-corporate-muted/30'
                        : 'bg-white'
                    )}
                  >
                    {/* Equipment Name (Sticky Left Column - Clic para Seleccionar Fila) */}
                    <td
                      title={`Clic para seleccionar la fila de ${row.name}`}
                      onClick={() => {
                        setActiveSelectedRowId(row.id);
                      }}
                      className={cn(
                        'px-2 py-1 font-semibold border-r border-corporate-border truncate sticky left-0 z-10 shadow-xs transition-all cursor-pointer',
                        isRowSelected
                          ? 'bg-[#1E3A8A] text-white font-bold ring-2 ring-inset ring-blue-300'
                          : isHoveredRow
                          ? 'bg-blue-100 text-blue-950 font-bold'
                          : isGroupHeader
                          ? 'bg-slate-100 font-bold text-corporate-text'
                          : isAlternate
                          ? 'bg-[#F8FAFC] text-corporate-text'
                          : 'bg-white text-corporate-text'
                      )}
                    >
                      <div className="flex items-center justify-between gap-1.5 truncate">
                        <div className="flex items-center gap-1.5 truncate">
                          <span
                            className={cn(
                              'w-2 h-2 rounded-full flex-shrink-0 transition-all',
                              isRowSelected
                                ? 'bg-amber-400 ring-2 ring-white scale-110'
                                : isHoveredRow
                                ? 'bg-blue-600'
                                : 'bg-slate-400'
                            )}
                          />
                          <span className="truncate text-[10px] sm:text-[10.5px] leading-tight">
                            {row.name}
                          </span>
                        </div>

                        {/* Indicador visible de selección */}
                        {isRowSelected && (
                          <span className="flex-shrink-0 px-1 py-0.2 rounded bg-amber-400 text-slate-900 font-black text-[8px] uppercase tracking-wider shadow-xs">
                            Activa
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 30 Cells */}
                    {columns.map((col) => {
                      const cell = cellMap.get(`${row.id}_${col.id}`);
                      const isSelected = selectedCell?.id === cell?.id;
                      const isPopoverTarget = activePopover?.cell.id === cell?.id;
                      const styles = getCellStyles(cell, isSelected || isPopoverTarget, isRowSelected);

                      return (
                        <td
                          key={col.id}
                          onMouseEnter={(e) => handleCellMouseEnter(cell, col, e)}
                          onMouseLeave={handleCellMouseLeave}
                          onClick={(e) => {
                            if (cell) {
                              handleCellClickInternal(cell, col, e);
                            }
                          }}
                          className={cn(
                            'p-0 border-r border-b border-corporate-border text-center select-none relative group touch-manipulation',
                            styles.container,
                            isPopoverTarget && 'ring-2 ring-white scale-[1.03] z-20 shadow-md'
                          )}
                        >
                          {cell?.isEditable && cell.initialStatus !== 'disabled' ? (
                            <div className="w-full h-full flex items-center justify-center px-0.5 min-h-[28px] sm:min-h-[32px]">
                              {/* Texto Horizontal con fuente negrita */}
                              <span
                                className={cn(
                                  'text-[9px] sm:text-[10px] tracking-tight leading-none block truncate',
                                  cell.status === 'disabled'
                                    ? 'text-[#4B5563] font-black'
                                    : 'text-black font-black'
                                )}
                              >
                                {cell.status === 'disabled' ? 'NA' : getStatusLabel(cell.status)}
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

        {/* Footer / Info Inspector & Active Row Indicator */}
        <div className="h-7 sm:h-8 bg-corporate-bg border-t border-corporate-border px-2.5 sm:px-3 flex items-center justify-between text-[10px] sm:text-[11px] text-corporate-subtext flex-shrink-0">
          <div className="flex items-center gap-2 truncate">
            {/* Pill de la fila seleccionada con el mouse */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
              <MousePointer className="w-3 h-3 text-blue-700" />
              <span className="font-bold text-[10px] truncate">
                Fila activa: {selectedRowObj?.name || 'Ninguna (haz clic en un equipo)'}
              </span>
            </div>

            {hoveredCell ? (
              <div className="flex items-center gap-1.5 truncate">
                <span>▸</span>
                <span className="font-semibold text-corporate-text truncate max-w-[140px]">
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
              </div>
            ) : (
              <span className="text-gray-500 hidden md:inline truncate">
                Pasa el mouse sobre una columna activa de la fila seleccionada para desplegar su menú de checklist con checkboxes.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Accesos rápidos para seleccionar fila */}
            <button
              onClick={() => setActiveSelectedRowId('row_1')}
              className={cn(
                'px-2 py-0.5 rounded text-[10px] font-bold transition-colors border',
                activeSelectedRowId === 'row_1'
                  ? 'bg-blue-600 text-white border-blue-700'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              )}
            >
              Transportadores
            </button>
            <button
              onClick={() => setActiveSelectedRowId('row_3')}
              className={cn(
                'px-2 py-0.5 rounded text-[10px] font-bold transition-colors border',
                activeSelectedRowId === 'row_3'
                  ? 'bg-blue-600 text-white border-blue-700'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              )}
            >
              PMQ756 Cargador
            </button>
          </div>
        </div>
      </div>

      {/* Menú Emergente de Checklist oficial (aparece sobre la columna activa al pasar el mouse o al tocar en móvil) */}
      {activePopover && (
        <ChecklistPopover
          isOpen={true}
          rowName={activePopover.cell.rowName}
          colName={activePopover.cell.colName}
          group={activePopover.group}
          completedTaskIds={currentCellState.completed}
          naTaskIds={currentCellState.na}
          cellStatus={activePopover.cell.status}
          onToggleTask={handleToggleTask}
          onToggleNA={handleToggleNA}
          onToggleAll={handleToggleAll}
          onClose={() => setActivePopover(null)}
          position={activePopover.position}
          isPinned={activePopover.pinned}
          onMouseEnter={handlePopoverMouseEnter}
          onMouseLeave={handlePopoverMouseLeave}
        />
      )}
    </div>
  );
};
