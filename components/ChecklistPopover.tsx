'use client';

import React from 'react';
import { ChecklistGroup } from '@/data/equipmentChecklists';
import { ActivityStatus } from '@/types/diagram';
import { Check, CheckSquare, Square, X, AlertCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChecklistPopoverProps {
  isOpen: boolean;
  rowName: string;
  colName: string;
  group: ChecklistGroup;
  completedTaskIds: string[];
  cellStatus: ActivityStatus;
  onToggleTask: (taskId: string) => void;
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
  cellStatus,
  onToggleTask,
  onToggleAll,
  onClose,
  position,
  onMouseEnter,
  onMouseLeave,
}) => {
  if (!isOpen) return null;

  const totalTasks = group.tasks.length;
  const completedCount = completedTaskIds.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
  const allCompleted = totalTasks > 0 && completedCount === totalTasks;
  const noneCompleted = completedCount === 0;

  // Status visual badge
  const getStatusBadge = () => {
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

  // Determine popover position: fixed near cell or centered if coords not given
  const popoverStyle: React.CSSProperties = position
    ? {
        position: 'fixed',
        top: `${Math.min(Math.max(position.top, 60), window.innerHeight - 440)}px`,
        left: `${Math.min(Math.max(position.left, 20), window.innerWidth - 460)}px`,
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
      className="w-[94vw] max-w-[480px] bg-white rounded-xl shadow-2xl border-2 border-corporate-primary/40 overflow-hidden animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md select-none text-corporate-text"
      role="dialog"
      aria-label={`Checklist ${group.groupName}`}
    >
      {/* Top Banner with Equipment and Group */}
      <div className="bg-gradient-to-r from-[#173D60] to-[#1F4E79] text-white p-3 sm:p-3.5 flex items-start justify-between gap-2 border-b border-[#2C6191]">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-200 text-[10px] font-bold tracking-wider uppercase">
              Checklist Oficial
            </span>
            <span className="text-[11px] text-blue-200 truncate">
              {rowName.includes('756') ? 'PLAN PREV C 3M PMQ756' : 'Plan Preventivo Línea E'}
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

      {/* Dynamic Status & Progress Bar */}
      <div className="bg-slate-50 border-b border-corporate-border px-3.5 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-corporate-subtext">Estado resultante:</span>
          {getStatusBadge()}
        </div>
        <div className="flex items-center gap-2 text-right">
          <span className="text-[11px] font-bold text-slate-700">
            {completedCount} de {totalTasks} ({progressPercent}%)
          </span>
          <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-300',
                allCompleted ? 'bg-green-500' : noneCompleted ? 'bg-red-400' : 'bg-amber-500'
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Checklist Tasks List */}
      <div className="max-h-[260px] sm:max-h-[300px] overflow-y-auto divide-y divide-slate-100 p-1 overscroll-contain">
        {group.tasks.map((task) => {
          const isChecked = completedTaskIds.includes(task.id);

          return (
            <div
              key={task.id}
              onClick={() => onToggleTask(task.id)}
              className={cn(
                'p-2.5 sm:p-3 flex items-start gap-2.5 cursor-pointer rounded-md transition-colors text-xs leading-snug',
                isChecked
                  ? 'bg-green-50/70 hover:bg-green-100/70 text-slate-900 font-medium'
                  : 'hover:bg-slate-50 text-slate-700'
              )}
            >
              {/* Checkbox Icon */}
              <div className="mt-0.5 flex-shrink-0">
                {isChecked ? (
                  <div className="w-4 h-4 rounded bg-[#22C55E] text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded border-2 border-slate-300 hover:border-slate-500 bg-white transition-colors" />
                )}
              </div>

              {/* Order Number */}
              <span className="font-mono text-[11px] text-slate-400 font-bold flex-shrink-0 mt-0.5">
                #{task.order}
              </span>

              {/* Description */}
              <div className="flex-1 select-text">
                <span className={cn(isChecked && 'text-slate-900 font-semibold')}>
                  {task.description}
                </span>
              </div>

              {/* Individual Task OK / NOK badge */}
              <div className="flex-shrink-0 self-center">
                <span
                  className={cn(
                    'text-[10px] font-black px-1.5 py-0.5 rounded shadow-xs',
                    isChecked
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  )}
                >
                  {isChecked ? 'OK' : 'NOK'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer / Quick Actions & Rules Indicator */}
      <div className="bg-slate-50 border-t border-corporate-border p-2.5 sm:p-3 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onToggleAll(true)}
            className="px-2.5 py-1 text-[11px] font-bold text-green-800 bg-green-100 hover:bg-green-200 rounded border border-green-300 transition-colors flex items-center gap-1"
          >
            <CheckSquare className="w-3 h-3" />
            Marcar Todos
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
          className="px-3 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors shadow-xs"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};
