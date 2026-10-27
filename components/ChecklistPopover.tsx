'use client';

import React, { useEffect, useState } from 'react';
import { ChecklistGroup } from '@/data/equipmentChecklists';
import { ActivityStatus } from '@/types/diagram';
import { Check, CheckSquare, Square, X } from 'lucide-react';
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
  isPinned?: boolean;
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
  isPinned = false,
  onMouseEnter,
  onMouseLeave,
}) => {
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  // Detección de ancho de pantalla para comportamiento móvil/tablet
  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cierre con la tecla Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const allTasks = group.tasks;
  const totalTasks = allTasks.length;

  // Tareas aplicables (se excluyen las marcadas como NA)
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

  // Badge visual de estado resultante
  const getStatusBadge = () => {
    if (applicableCount === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-black bg-[#22C55E] text-black shadow-xs">
          OK (Todos NA)
        </span>
      );
    }
    if (noneCompleted) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-black bg-[#EF4444] text-black shadow-xs">
          PEND. (Rojo)
        </span>
      );
    }
    if (allCompleted) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-black bg-[#22C55E] text-black shadow-xs">
          OK (Verde)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-black bg-[#F59E0B] text-black shadow-xs">
        RUN (Ámbar)
      </span>
    );
  };

  // En móviles, tablets o cuando está anclado (pinned), se muestra como modal centrado con backdrop
  const showAsModal = isMobileScreen || isPinned;

  // Contenido interno de la tarjeta emergente
  const popoverContent = (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        'w-full max-w-[560px] bg-white rounded-xl sm:rounded-2xl shadow-2xl border-2 border-corporate-primary/40 flex flex-col overflow-hidden select-none text-corporate-text animate-in fade-in zoom-in-95 duration-150',
        showAsModal ? 'max-h-[92vh] sm:max-h-[86vh]' : 'max-h-[500px]'
      )}
      role="dialog"
      aria-modal={showAsModal}
      aria-label={`Checklist ${group.groupName}`}
    >
      {/* Cabecera ejecutiva fija (Sticky) */}
      <div className="bg-gradient-to-r from-[#173D60] to-[#1F4E79] text-white p-3 sm:p-4 flex items-start justify-between gap-3 border-b border-[#2C6191] flex-shrink-0">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 text-[10px] sm:text-[10.5px] font-bold tracking-wider uppercase">
              Checklist Oficial
            </span>
            <span className="text-[11px] text-blue-200 truncate font-medium">
              {colName}
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white truncate leading-tight">
            {rowName}
          </h3>
          <p className="text-xs font-semibold text-blue-100 flex items-center gap-1.5 truncate">
            <span className="text-amber-300 font-extrabold">Grupo {group.groupCode}:</span>
            <span className="truncate">{group.groupName}</span>
          </p>
        </div>

        {/* Botón de cierre en cabecera optimizado para toque táctil (mínimo 44x44px de área táctil) */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Cerrar ventana emergente"
          className="text-white bg-white/10 hover:bg-white/20 active:bg-white/30 p-2 sm:p-2.5 rounded-xl transition-all flex items-center justify-center flex-shrink-0 touch-manipulation shadow-xs"
          title="Cerrar ventana (Esc)"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Barra de progreso y cálculo de estado en tiempo real (Sticky) */}
      <div className="bg-slate-50 border-b border-corporate-border px-3.5 py-2.5 flex items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-corporate-subtext hidden xs:inline">Estado:</span>
          {getStatusBadge()}
        </div>
        <div className="flex items-center gap-2 text-right">
          <span className="text-[11px] font-bold text-slate-700">
            {completedApplicableCount}/{applicableCount} ({progressPercent}%)
            {naCount > 0 && <span className="text-slate-500 font-semibold ml-1">[{naCount} NA]</span>}
          </span>
          <div className="w-14 sm:w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
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

      {/* Encabezado de columnas de la lista (Sticky) */}
      <div className="bg-slate-100 border-b border-slate-200 px-3 py-1.5 text-[10px] font-bold text-slate-600 flex items-center gap-2 flex-shrink-0">
        <div className="w-12 text-center flex-shrink-0">OK</div>
        <div className="w-12 text-center flex-shrink-0">NA</div>
        <div className="w-12 text-center flex-shrink-0">ITEM</div>
        <div className="flex-1 min-w-0">ACTIVIDAD / VERIFICACIÓN</div>
        <div className="w-12 text-center flex-shrink-0 hidden xs:block">ESTADO</div>
      </div>

      {/* Lista desplazable de actividades con áreas táctiles amplias (min-h-[44px]) */}
      <div className="flex-1 overflow-y-auto overscroll-contain divide-y divide-slate-100 p-1 touch-pan-y">
        {allTasks.map((task) => {
          const isNA = naTaskIds.includes(task.id);
          const isOK = completedTaskIds.includes(task.id) && !isNA;

          return (
            <div
              key={task.id}
              className={cn(
                'p-2 sm:p-2.5 flex items-center gap-2 rounded-lg transition-colors text-xs leading-snug min-h-[48px]',
                isNA
                  ? 'bg-slate-100/80 text-slate-500'
                  : isOK
                  ? 'bg-green-50/80 text-slate-900 font-medium'
                  : 'hover:bg-slate-50 active:bg-slate-100 text-slate-700'
              )}
            >
              {/* Checkbox OK (Realizado) con área táctil cómoda de 44x44px */}
              <button
                type="button"
                onClick={() => onToggleTask(task.id)}
                disabled={isNA}
                aria-label={`Marcar como realizada tarea ${task.itemNumber}`}
                className="w-12 min-h-[44px] flex items-center justify-center flex-shrink-0 touch-manipulation"
              >
                {isOK ? (
                  <div className="w-5 h-5 rounded-md bg-[#22C55E] text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <div
                    className={cn(
                      'w-5 h-5 rounded-md border-2 bg-white transition-colors',
                      isNA
                        ? 'border-slate-200 opacity-40 cursor-not-allowed'
                        : 'border-slate-300 hover:border-green-500'
                    )}
                  />
                )}
              </button>

              {/* Checkbox NA (No Aplica) con área táctil cómoda de 44x44px */}
              <button
                type="button"
                onClick={() => onToggleNA(task.id)}
                aria-label={`Marcar como No Aplica tarea ${task.itemNumber}`}
                className="w-12 min-h-[44px] flex items-center justify-center flex-shrink-0 touch-manipulation"
              >
                <div
                  className={cn(
                    'px-2 py-1 rounded-md text-[10px] font-black border transition-all text-center min-w-[34px]',
                    isNA
                      ? 'bg-slate-800 text-white border-slate-900 shadow-xs scale-105'
                      : 'bg-white text-slate-600 border-slate-300 hover:border-slate-500 hover:bg-slate-100'
                  )}
                >
                  NA
                </div>
              </button>

              {/* Número oficial de ítem (ej. 10.1, 40.3, 300.1) */}
              <span className="w-12 text-center font-mono text-[11px] text-slate-500 font-bold flex-shrink-0">
                {task.itemNumber}
              </span>

              {/* Descripción de la actividad (al tocar activa/desactiva OK si no es NA) */}
              <div
                onClick={() => {
                  if (!isNA) onToggleTask(task.id);
                }}
                className={cn(
                  'flex-1 min-w-0 select-text cursor-pointer py-1',
                  isNA && 'line-through text-slate-400'
                )}
              >
                <span className={cn(isOK && 'text-slate-900 font-semibold')}>
                  {task.description}
                </span>
              </div>

              {/* Badge individual OK / NA / PEND */}
              <div className="w-12 text-center flex-shrink-0 hidden xs:block">
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

      {/* Pie del menú con botones de acción y botón de cierre SIEMPRE visible */}
      <div className="bg-slate-50 border-t border-corporate-border p-2.5 sm:p-3 flex items-center justify-between gap-2 text-xs flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onToggleAll(true)}
            className="px-2.5 sm:px-3 py-1.5 min-h-[38px] text-[11px] font-bold text-green-800 bg-green-100 hover:bg-green-200 active:bg-green-300 rounded-lg border border-green-300 transition-colors flex items-center gap-1 touch-manipulation"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Marcar</span> OK
          </button>
          <button
            type="button"
            onClick={() => onToggleAll(false)}
            className="px-2.5 sm:px-3 py-1.5 min-h-[38px] text-[11px] font-bold text-red-800 bg-red-100 hover:bg-red-200 active:bg-red-300 rounded-lg border border-red-300 transition-colors flex items-center gap-1 touch-manipulation"
          >
            <Square className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Desmarcar</span>
          </button>
        </div>

        {/* Botón principal de Cerrar visible y cómodo en cualquier teléfono, tablet o PC */}
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 min-h-[38px] text-[11px] sm:text-xs font-bold text-slate-800 hover:text-slate-950 bg-white border-2 border-slate-300 hover:border-slate-400 active:bg-slate-100 rounded-lg transition-all shadow-xs flex items-center gap-1 touch-manipulation"
        >
          <X className="w-3.5 h-3.5" />
          <span>Cerrar</span>
        </button>
      </div>
    </div>
  );

  // Renderizado condicional:
  // 1. En móviles/tablets o modo anclado: Modal centrado con fondo oscuro semitransparente (Backdrop) que se cierra al tocar fuera
  if (showAsModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-100 overscroll-contain">
        {/* Fondo oscuro para cerrar al tocar fuera */}
        <div
          className="absolute inset-0"
          onClick={onClose}
          aria-hidden="true"
        />
        {/* Tarjeta modal centrada */}
        <div className="relative z-10 w-full flex justify-center">
          {popoverContent}
        </div>
      </div>
    );
  }

  // 2. En Desktop no anclado (hover libre con mouse): Posicionado cerca de la celda pero asegurando visibilidad
  const desktopStyle: React.CSSProperties = position
    ? {
        position: 'fixed',
        top: `${Math.min(Math.max(position.top, 50), typeof window !== 'undefined' ? window.innerHeight - 500 : 50)}px`,
        left: `${Math.min(Math.max(position.left, 20), typeof window !== 'undefined' ? window.innerWidth - 580 : 20)}px`,
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
    <div style={desktopStyle}>
      {popoverContent}
    </div>
  );
};
