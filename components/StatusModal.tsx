'use client';

import React from 'react';
import { ActivityCell, ActivityStatus } from '@/types/diagram';
import { X } from 'lucide-react';

interface StatusModalProps {
  cell: ActivityCell | null;
  onClose: () => void;
  onSelectStatus: (cellId: string, status: ActivityStatus) => void;
}

export const StatusModal: React.FC<StatusModalProps> = ({
  cell,
  onClose,
  onSelectStatus,
}) => {
  if (!cell || !cell.isEditable) return null;

  const options: {
    status: ActivityStatus;
    code: string;
    label: string;
    description: string;
    badgeBg: string;
    borderActive: string;
  }[] = [
    {
      status: 'pending',
      code: 'PEND.',
      label: 'Pendiente',
      description: 'Actividad identificada pendiente de ejecución.',
      badgeBg: 'bg-[#EF4444]',
      borderActive: 'border-[#EF4444] ring-2 ring-[#EF4444]',
    },
    {
      status: 'in_progress',
      code: 'RUN',
      label: 'En proceso',
      description: 'Actividad en curso o en etapa de atención.',
      badgeBg: 'bg-[#F59E0B]',
      borderActive: 'border-[#F59E0B] ring-2 ring-[#F59E0B]',
    },
    {
      status: 'completed',
      code: 'OK',
      label: 'Concluido',
      description: 'Actividad finalizada satisfactoriamente.',
      badgeBg: 'bg-[#22C55E]',
      borderActive: 'border-[#22C55E] ring-2 ring-[#22C55E]',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4">
      <div 
        className="bg-white rounded-lg shadow-xl border border-corporate-border w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-corporate-border bg-corporate-bg/70">
          <div>
            <h3 className="text-sm font-bold text-corporate-text">
              Actualizar Estado de Actividad
            </h3>
            <p className="text-xs text-corporate-subtext">
              Línea E — Mantenimiento Preventivo / Correctivo
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-corporate-subtext hover:text-corporate-text p-1 rounded-md hover:bg-corporate-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Metadata Card */}
          <div className="bg-corporate-muted/50 rounded border border-corporate-border p-3 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-corporate-subtext">Equipo / Pestaña:</span>
              <span className="font-bold text-corporate-text">{cell.rowName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-corporate-subtext">Columna / Actividad:</span>
              <span className="font-bold text-corporate-text text-right max-w-[240px] truncate" title={cell.colName}>
                {cell.colName}
              </span>
            </div>
          </div>

          {/* Status Selection Options */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-corporate-subtext uppercase tracking-wider block">
              Seleccionar Nuevo Estado
            </label>
            <div className="space-y-2">
              {options.map((opt) => {
                const isCurrent = cell.status === opt.status;
                return (
                  <button
                    key={opt.status}
                    type="button"
                    onClick={() => {
                      onSelectStatus(cell.id, opt.status);
                      onClose();
                    }}
                    className={`w-full text-left p-3 rounded border transition-all flex items-center gap-3 ${
                      isCurrent
                        ? `${opt.borderActive} bg-corporate-bg`
                        : 'border-corporate-border hover:border-corporate-subtext/40 hover:bg-corporate-muted/30'
                    }`}
                  >
                    {/* Badge con abreviatura y fondo solicitado con texto negro */}
                    <div className={`${opt.badgeBg} w-16 py-1 text-center rounded border border-black/10 font-black text-black text-xs shadow-xs`}>
                      {opt.code}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-corporate-text">
                          {opt.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] uppercase font-semibold bg-corporate-primary text-white px-1.5 py-0.5 rounded">
                            Actual
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-corporate-subtext mt-0.5">
                        {opt.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-corporate-border bg-corporate-bg/70 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-corporate-subtext hover:text-corporate-text bg-white border border-corporate-border rounded hover:bg-corporate-muted transition-colors shadow-xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
