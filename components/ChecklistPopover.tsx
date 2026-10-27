'use client';

import React from 'react';
import { ChecklistGroup } from '@/data/equipmentChecklists';
import { ActivityStatus } from '@/types/diagram';
import { Check, CheckSquare, Square, X, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChecklistPopoverProps {
  isOpen: boolean;
  rowName: string;
  colName: string;
  group: ChecklistGroup;
  completedTaskIds: string[];
  naTaskIds: string[];
  cellStatus: ActivityStatus;
  onToggleTask: (taskId: string) => void;
  onToggleNA: (taskId: string) => void;
  onToggleAll: (complete: boolean) => void;
  onClose: () => void;
  position?: { top: number; left: number };
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const ChecklistPopover: React.FC<ChecklistPopoverProps> = ({
  isOpen,
  rowName,
  colName,
  group,
  completedTaskIds,
  naTaskIds,
  cellStatus,
  onToggleTask,
  onToggleNA,
  onToggleAll,
  onClose,
  position,
  onMouseEnter,
  onMouseLeave,
}) => {
  if (!isOpen) return null;

  const allTasks = group.tasks;
  const totalTasks = allTasks.length;

  // Tareas aplicables (excluyendo aquellas marcadas como NA)
  const applicableTasks = allTasks.filter((t) => !naTaskIds.includes(t.id));
  const applicableCount = applicableTasks.length;
  const completedApplicableCount = applicableTasks.filter((t) =>
    completedTaskIds.includes(t.id)
  ).length;
  const naCount = naTaskIds.length;

  const progressPercent =
    applicableCount > 0
      ? Math.round((completedApplicableCount / applicableCount) * 100)
      : 100;
  const allCompleted = applicableCount > 0 && completedApplicableCount === applicableCount;
  const noneCompleted = completedApplicableCount === 0 && applicableCount > 0;

  // Badge visual de estado según la regla estricta
  const getStatusBadge = () => {
    if (applicableCount === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-black bg-[#22C55E] text-black shadow-xs">
          OK (Todos NA)
        </span>
      );
    }
    if (noneCompleted) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-black bg-[#EF4444] text-black shadow-xs">
          PEND. (Rojo)
        </span>
      );
    }
    if (allCompleted) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-black bg-[#22C55E] text-black shadow-xs">
          OK (Verde)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-black bg-[#F59E0B] text-black shadow-xs">
        RUN (Ámbar)
      </span>
    );
  };

  // Posicionamiento adaptativo en pantalla
  const popoverStyle: React.CSSProperties = position
    ? {
        position: 'fixed',
        top: `${Math.min(Math.max(position.top, 50), typeof window !== 'undefined' ? window.innerHeight - 480 : 50)}px`,
        left: `${Math.min(Math.max(position.left, 10), typeof window !== 'undefined' ? window.innerWidth - 560 : 10)}px`,
        zIndex: 50,
      }
    : {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 50,
      };

  return (
    <div
      style={popoverStyle}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="w-[96vw] max-w-[550px] bg-white rounded-xl shadow-2xl border-2 border-corporate-primary/40 overflow-hidden animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md select-none text-corporate-text"
      role="dialog"
      aria-label={`Checklist ${group.groupName}`}
    >
      {/* Cabecera del Menú Emergente */}
      <div className="bg-gradient-to-r from-[#173D60] to-[#1F4E79] text-white p-3 sm:p-3.5 flex items-start justify-between gap-2 border-b border-[#2C6191]">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-200 text-[10px] font-bold tracking-wider uppercase">
              Checklist Oficial
            </span>
            <span className="text-[11px] text-blue-200 truncate">
              {colName}
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white truncate leading-tight">
            {rowName}
          </h3>
          <p className="text-xs font-semibold text-blue-100 flex items-center gap-1.5 truncate">
            <span className="text-amber-300 font-extrabold">Grupo {group.groupCode}:</span>
            <span>{group.groupName}</span>
          </p>
        </div>

        <button
          onClick={onClose}
          className="text-blue-200 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors flex-shrink-0"
          title="Cerrar menú emergente"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Barra de Progreso y Estado Resultante */}
      <div className="bg-slate-50 border-b border-corporate-border px-3.5 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-corporate-subtext">Estado celda:</span>
          {getStatusBadge()}
        </div>
        <div className="flex items-center gap-2 text-right">
          <span className="text-[11px] font-bold text-slate-700">
            {completedApplicableCount} de {applicableCount} ({progressPercent}%)
            {naCount > 0 && <span className="text-slate-500 font-medium ml-1">[{naCount} NA]</span>}
          </span>
          <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-300',
                allCompleted || applicableCount === 0
                  ? 'bg-green-500'
                  : noneCompleted
                  ? 'bg-red-400'
                  : 'bg-amber-500'
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Encabezado de columnas de la lista */}
      <div className="bg-slate-100 border-b border-slate-200 px-3 py-1.5 text-[10px] font-bold text-slate-600 flex items-center gap-2">
        <div className="w-10 text-center flex-shrink-0">OK</div>
        <div className="w-10 text-center flex-shrink-0">NA</div>
        <div className="w-12 text-center flex-shrink-0">ITEM</div>
        <div className="flex-1">ACTIVIDAD / VERIFICACIÓN</div>
        <div className="w-12 text-center flex-shrink-0">ESTADO</div>
      </div>

      {/* Lista de Tareas Oficiales con Checkbox OK y Checkbox NA */}
      <div className="max-h-[280px] sm:max-h-[320px] overflow-y-auto divide-y divide-slate-100 p-1 overscroll-contain">
        {allTasks.map((task) => {
          const isNA = naTaskIds.includes(task.id);
          const isOK = completedTaskIds.includes(task.id) && !isNA;

          return (
            <div
              key={task.id}
              className={cn(
                'p-2 sm:p-2.5 flex items-center gap-2 rounded-md transition-colors text-xs leading-snug',
                isNA
                  ? 'bg-slate-100/70 text-slate-500 opacity-75'
                  : isOK
                  ? 'bg-green-50/70 text-slate-900 font-medium'
                  : 'hover:bg-slate-50 text-slate-700'
              )}
            >
              {/* Checkbox OK (Realizado) */}
              <div
                onClick={() => onToggleTask(task.id)}
                title={isNA ? 'Tarea marcada como No Aplica' : isOK ? 'Desmarcar OK' : 'Marcar OK'}
                className="w-10 flex items-center justify-center flex-shrink-0 cursor-pointer py-1"
              >
                {isOK ? (
                  <div className="w-4 h-4 rounded bg-[#22C55E] text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : (
                  <div
                    className={cn(
                      'w-4 h-4 rounded border-2 bg-white transition-colors',
                      isNA
                        ? 'border-slate-200 opacity-40 cursor-not-allowed'
                        : 'border-slate-300 hover:border-green-500'
                    )}
                  />
                )}
              </div>

              {/* Checkbox NA (No Aplica) */}
              <div
                onClick={() => onToggleNA(task.id)}
                title={isNA ? 'Quitar NA' : 'Marcar como No Aplica (no cuenta para el estado)'}
                className="w-10 flex items-center justify-center flex-shrink-0 cursor-pointer py-1"
              >
                <div
                  className={cn(
                    'px-1.5 py-0.5 rounded text-[10px] font-black border transition-all',
                    isNA
                      ? 'bg-slate-700 text-white border-slate-800 shadow-xs scale-105'
                      : 'bg-white text-slate-500 border-slate-300 hover:border-slate-500 hover:bg-slate-100'
                  )}
                >
                  NA
                </div>
              </div>

              {/* Número oficial de ítem (ej. 10.1, 40.3, 300.1) */}
              <span className="w-12 text-center font-mono text-[11px] text-slate-500 font-bold flex-shrink-0">
                {task.itemNumber}
              </span>

              {/* Descripción de la actividad */}
              <div
                onClick={() => {
                  if (!isNA) onToggleTask(task.id);
                }}
                className={cn(
                  'flex-1 select-text cursor-pointer',
                  isNA && 'line-through text-slate-400'
                )}
              >
                <span className={cn(isOK && 'text-slate-900 font-semibold')}>
                  {task.description}
                </span>
              </div>

              {/* Badge individual OK / NA / PEND */}
              <div className="w-12 text-center flex-shrink-0">
                <span
                  className={cn(
                    'text-[9.5px] font-black px-1.5 py-0.5 rounded shadow-xs inline-block',
                    isNA
                      ? 'bg-slate-200 text-slate-700 border border-slate-300'
                      : isOK
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  )}
                >
                  {isNA ? 'NA' : isOK ? 'OK' : 'PEND'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pie del menú con botones de acción rápida */}
      <div className="bg-slate-50 border-t border-corporate-border p-2.5 sm:p-3 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onToggleAll(true)}
            className="px-2.5 py-1 text-[11px] font-bold text-green-800 bg-green-100 hover:bg-green-200 rounded border border-green-300 transition-colors flex items-center gap-1"
          >
            <CheckSquare className="w-3 h-3" />
            Marcar Todos (OK)
          </button>
          <button
            type="button"
            onClick={() => onToggleAll(false)}
            className="px-2.5 py-1 text-[11px] font-bold text-red-800 bg-red-100 hover:bg-red-200 rounded border border-red-300 transition-colors flex items-center gap-1"
          >
            <Square className="w-3 h-3" />
            Desmarcar
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="px-3.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors shadow-xs"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};
