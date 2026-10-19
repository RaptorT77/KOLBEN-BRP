'use client';

import React, { useState } from 'react';
import { DiagramSummary } from '@/types/diagram';
import { RotateCcw, ZoomIn, ZoomOut, Maximize2, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  summary: DiagramSummary;
  onReset: () => void;
  scale: number;
  setScale: (scale: number) => void;
  autoFit: boolean;
  setAutoFit: (fit: boolean) => void;
  colorMode: 'soft' | 'solid';
  setColorMode: (mode: 'soft' | 'solid') => void;
}

export const Header: React.FC<HeaderProps> = ({
  summary,
  onReset,
  scale,
  setScale,
  autoFit,
  setAutoFit,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-corporate-border px-4 lg:px-5 py-2.5 flex-shrink-0 shadow-xs select-none">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-2.5">
          {/* Title and Identification */}
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-7 bg-corporate-primary rounded-xs" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-corporate-text tracking-tight leading-none">
                  Mapa de Calor de Mantenimiento — Línea E
                </h1>
                <span className="text-[10px] font-semibold bg-corporate-muted text-corporate-subtext px-1.5 py-0.5 rounded border border-corporate-border">
                  PDF Oficial
                </span>
              </div>
              <p className="text-[11px] text-corporate-subtext font-normal mt-0.5">
                Visualización ejecutiva y control de estado de actividades en tiempo real
              </p>
            </div>
          </div>

          {/* Indicators and Summary Cards with New Colors (ROJO, AMBAR, VERDE, Texto Negro) */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* Total */}
            <div className="bg-corporate-muted/80 border border-corporate-border rounded px-2.5 py-1 flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-corporate-subtext uppercase tracking-wider">
                Total
              </span>
              <span className="text-xs font-bold text-corporate-text">
                {summary.totalActivities}
              </span>
            </div>

            {/* Deshabilitadas */}
            <div className="bg-[#E5E7EB] border border-[#D1D5DB] rounded px-2.5 py-1 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#9CA3AF]" />
              <span className="text-[10px] font-semibold text-[#4B5563] uppercase tracking-wider">
                Deshabilitadas
              </span>
              <span className="text-xs font-bold text-[#1F2937]">
                {summary.disabledActivities}
              </span>
            </div>

            {/* Pendientes = PEND. (Fondo Rojo, Texto Negro) */}
            <div className="bg-[#EF4444] border border-[#DC2626] rounded px-2.5 py-1 flex items-center gap-1.5 shadow-xs">
              <span className="text-[10px] font-black text-black uppercase tracking-wider">
                PEND.
              </span>
              <span className="text-xs font-black text-black bg-white/40 px-1 rounded">
                {summary.pendingActivities}
              </span>
            </div>

            {/* En Proceso = RUN (Fondo Ámbar, Texto Negro) */}
            <div className="bg-[#F59E0B] border border-[#D97706] rounded px-2.5 py-1 flex items-center gap-1.5 shadow-xs">
              <span className="text-[10px] font-black text-black uppercase tracking-wider">
                RUN
              </span>
              <span className="text-xs font-black text-black bg-white/40 px-1 rounded">
                {summary.inProgressActivities}
              </span>
            </div>

            {/* Concluidas = OK (Fondo Verde, Texto Negro) */}
            <div className="bg-[#22C55E] border border-[#16A34A] rounded px-2.5 py-1 flex items-center gap-1.5 shadow-xs">
              <span className="text-[10px] font-black text-black uppercase tracking-wider">
                OK
              </span>
              <span className="text-xs font-black text-black bg-white/40 px-1 rounded">
                {summary.completedActivities}
              </span>
            </div>
          </div>

          {/* Controls: Legend, Zoom & Reset */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Legend with matching colors and black text */}
            <div className="hidden lg:flex items-center gap-2 text-xs bg-corporate-bg px-2.5 py-1 rounded border border-corporate-border">
              <span className="text-[10px] font-semibold text-corporate-subtext uppercase tracking-wider mr-1">
                Leyenda:
              </span>
              <div className="flex items-center gap-1 bg-[#E5E7EB] border border-[#D1D5DB] px-1.5 py-0.5 rounded">
                <span className="text-[#4B5563] text-[10px] font-bold">Deshabilitado</span>
              </div>
              <div className="flex items-center gap-1 bg-[#EF4444] border border-[#DC2626] px-1.5 py-0.5 rounded">
                <span className="text-black text-[10px] font-black">PEND.</span>
              </div>
              <div className="flex items-center gap-1 bg-[#F59E0B] border border-[#D97706] px-1.5 py-0.5 rounded">
                <span className="text-black text-[10px] font-black">RUN</span>
              </div>
              <div className="flex items-center gap-1 bg-[#22C55E] border border-[#16A34A] px-1.5 py-0.5 rounded">
                <span className="text-black text-[10px] font-black">OK</span>
              </div>
            </div>

            {/* Scale controls */}
            <div className="flex items-center bg-corporate-muted border border-corporate-border rounded p-0.5">
              <button
                type="button"
                onClick={() => setAutoFit(true)}
                title="Ajustar automáticamente a una sola pantalla"
                className={`px-2 py-0.5 text-[10px] font-medium rounded flex items-center gap-1 transition-colors ${
                  autoFit
                    ? 'bg-white text-corporate-text shadow-xs font-semibold'
                    : 'text-corporate-subtext hover:text-corporate-text'
                }`}
              >
                <Maximize2 className="w-2.5 h-2.5" />
                <span>Ajustar</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAutoFit(false);
                  setScale(Math.max(0.7, scale - 0.05));
                }}
                disabled={autoFit}
                title="Reducir escala"
                className="p-1 text-corporate-subtext hover:text-corporate-text disabled:opacity-40 transition-colors"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <span className="text-[10px] font-mono text-corporate-subtext px-1">
                {autoFit ? 'Auto' : `${Math.round(scale * 100)}%`}
              </span>
              <button
                type="button"
                onClick={() => {
                  setAutoFit(false);
                  setScale(Math.min(1.2, scale + 0.05));
                }}
                disabled={autoFit}
                title="Aumentar escala"
                className="p-1 text-corporate-subtext hover:text-corporate-text disabled:opacity-40 transition-colors"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
            </div>

            {/* Reset button */}
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              title="Restablecer valores del PDF original"
              className="flex items-center gap-1 text-[11px] font-medium text-corporate-subtext hover:text-corporate-text bg-white hover:bg-corporate-muted px-2.5 py-1 rounded border border-corporate-border transition-colors shadow-xs"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restablecer</span>
            </button>
          </div>
        </div>
      </header>

      {/* Confirmation Modal for Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4">
          <div className="bg-white rounded-lg shadow-xl border border-corporate-border w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="p-4 flex items-start gap-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-full border border-amber-200 flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-corporate-text">
                  ¿Restablecer estados originales?
                </h3>
                <p className="text-xs text-corporate-subtext mt-1">
                  Esta acción revertirá todas las actividades al estado original del PDF (166 PEND. y 314 deshabilitadas).
                </p>
              </div>
            </div>
            <div className="px-4 py-2.5 bg-corporate-bg border-t border-corporate-border flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1 text-xs font-medium text-corporate-subtext hover:text-corporate-text bg-white border border-corporate-border rounded hover:bg-corporate-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onReset();
                  setShowResetConfirm(false);
                }}
                className="px-3 py-1 text-xs font-medium text-white bg-corporate-primary hover:bg-corporate-text rounded transition-colors shadow-xs"
              >
                Confirmar Restablecimiento
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
