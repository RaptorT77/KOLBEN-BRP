'use client';

import React, { useState } from 'react';
import { DiagramSummary, DiagramRow } from '@/types/diagram';
import { SyncStatus } from '@/lib/useDiagramStore';
import { RotateCcw, ZoomIn, ZoomOut, Maximize2, AlertTriangle, Layers, Filter, Radio, FileText } from 'lucide-react';

interface HeaderProps {
  summary: DiagramSummary;
  onReset: () => void;
  scale: number;
  setScale: (scale: number) => void;
  autoFit: boolean;
  setAutoFit: (fit: boolean) => void;
  colorMode: 'soft' | 'solid';
  setColorMode: (mode: 'soft' | 'solid') => void;
  rows?: DiagramRow[];
  selectedRowId?: string;
  onSelectRowId?: (rowId: string) => void;
  syncStatus?: SyncStatus;
}

export const Header: React.FC<HeaderProps> = ({
  summary,
  onReset,
  scale,
  setScale,
  autoFit,
  setAutoFit,
  rows = [],
  selectedRowId = 'all',
  onSelectRowId,
  syncStatus = 'connected',
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showMobileDetails, setShowMobileDetails] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-corporate-border px-3 sm:px-4 lg:px-5 py-2 flex-shrink-0 shadow-xs select-none">
        {/* Main top row */}
        <div className="flex items-center justify-between gap-2">
          {/* Title & Badge */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-2 h-6 sm:h-7 bg-corporate-primary rounded-xs flex-shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-xs sm:text-sm lg:text-base font-bold text-corporate-text tracking-tight leading-tight truncate">
                  Mapa de Calor — Línea E
                </h1>
                <span className="hidden xs:inline-block text-[9px] sm:text-[10px] font-semibold bg-corporate-muted text-corporate-subtext px-1.5 py-0.2 rounded border border-corporate-border">
                  PDF Oficial
                </span>
                {/* Live Sync Status Indicator */}
                {syncStatus === 'connected' && (
                  <span
                    className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200"
                    title="Sincronización en vivo activa entre todos los dispositivos"
                  >
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    <span>En vivo</span>
                  </span>
                )}
                {syncStatus === 'connecting' && (
                  <span
                    className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-medium bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200"
                    title="Conectando al canal de sincronización en tiempo real"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    <span>Sincronizando...</span>
                  </span>
                )}
                {syncStatus === 'offline' && (
                  <span
                    className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-300"
                    title="Modo local (los cambios se guardan localmente)"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                    <span>Local</span>
                  </span>
                )}
              </div>
              <p className="hidden md:block text-[10.5px] text-corporate-subtext font-normal truncate">
                Visualización ejecutiva de estado de actividades
              </p>
            </div>
          </div>

          {/* Action buttons (Mobile & Desktop) */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Scale controls (Desktop / Tablet) */}
            <div className="hidden sm:flex items-center bg-corporate-muted border border-corporate-border rounded p-0.5">
              <button
                type="button"
                onClick={() => setAutoFit(true)}
                title="Ajustar automáticamente a una sola pantalla"
                className={`px-1.5 sm:px-2 py-0.5 text-[10px] font-medium rounded flex items-center gap-1 transition-colors ${
                  autoFit
                    ? 'bg-white text-corporate-text shadow-xs font-semibold'
                    : 'text-corporate-subtext hover:text-corporate-text'
                }`}
              >
                <Maximize2 className="w-2.5 h-2.5" />
                <span className="hidden md:inline">Ajustar</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAutoFit(false);
                  setScale(Math.max(0.6, scale - 0.05));
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
                  setScale(Math.min(1.3, scale + 0.05));
                }}
                disabled={autoFit}
                title="Aumentar escala"
                className="p-1 text-corporate-subtext hover:text-corporate-text disabled:opacity-40 transition-colors"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
            </div>

            {/* Quick Filter by Equipment (Mobile / Tablet helper) */}
            {onSelectRowId && rows.length > 0 && (
              <div className="flex items-center">
                <select
                  value={selectedRowId}
                  onChange={(e) => onSelectRowId(e.target.value)}
                  className="text-[10px] sm:text-[11px] font-medium bg-corporate-muted border border-corporate-border rounded px-2 py-1 text-corporate-text focus:outline-none focus:ring-1 focus:ring-corporate-accent max-w-[130px] sm:max-w-[180px] truncate"
                  title="Filtrar por equipo específico"
                >
                  <option value="all">Todos los Equipos ({rows.length})</option>
                  {rows.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Manual PDF button */}
            <a
              href="Manual_Usuario_Mapa_Calor_Linea_E.pdf"
              target="_blank"
              rel="noopener noreferrer"
              title="Descargar Manual de Usuario Oficial en PDF"
              className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-[#1F4E79] hover:text-[#173D60] bg-blue-50 hover:bg-blue-100 active:bg-blue-200 px-2 py-1 rounded border border-blue-200 transition-colors shadow-xs"
            >
              <FileText className="w-3 h-3 text-[#1F4E79]" />
              <span className="hidden xs:inline">Manual PDF</span>
            </a>

            {/* Reset button */}
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              title="Restablecer valores del PDF original"
              className="flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-corporate-subtext hover:text-corporate-text bg-white hover:bg-corporate-muted px-2 py-1 rounded border border-corporate-border transition-colors shadow-xs"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Restablecer</span>
            </button>
          </div>
        </div>

        {/* Second Row: Summary Indicators & Legend (Optimized for Mobile Touch Scroll) */}
        <div className="mt-2 pt-1.5 border-t border-corporate-border flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          {/* Summary counters with horizontal scroll on small devices */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Total */}
            <div className="bg-corporate-muted/80 border border-corporate-border rounded px-2 py-0.5 flex items-center gap-1.5">
              <span className="text-[9.5px] font-semibold text-corporate-subtext uppercase tracking-wider">
                Total
              </span>
              <span className="text-[11px] font-bold text-corporate-text">
                {summary.totalActivities}
              </span>
            </div>

            {/* Deshabilitadas */}
            <div className="bg-[#E5E7EB] border border-[#D1D5DB] rounded px-2 py-0.5 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]" />
              <span className="text-[9.5px] font-semibold text-[#4B5563] uppercase tracking-wider">
                Deshab.
              </span>
              <span className="text-[11px] font-bold text-[#1F2937]">
                {summary.disabledActivities}
              </span>
            </div>

            {/* PEND. (Fondo Rojo, Texto Negro) */}
            <div className="bg-[#EF4444] border border-[#DC2626] rounded px-2 py-0.5 flex items-center gap-1 shadow-xs">
              <span className="text-[9.5px] font-black text-black tracking-wider">
                PEND.
              </span>
              <span className="text-[11px] font-black text-black bg-white/40 px-1 rounded">
                {summary.pendingActivities}
              </span>
            </div>

            {/* RUN (Fondo Ámbar, Texto Negro) */}
            <div className="bg-[#F59E0B] border border-[#D97706] rounded px-2 py-0.5 flex items-center gap-1 shadow-xs">
              <span className="text-[9.5px] font-black text-black tracking-wider">
                RUN
              </span>
              <span className="text-[11px] font-black text-black bg-white/40 px-1 rounded">
                {summary.inProgressActivities}
              </span>
            </div>

            {/* OK (Fondo Verde, Texto Negro) */}
            <div className="bg-[#22C55E] border border-[#16A34A] rounded px-2 py-0.5 flex items-center gap-1 shadow-xs">
              <span className="text-[9.5px] font-black text-black tracking-wider">
                OK
              </span>
              <span className="text-[11px] font-black text-black bg-white/40 px-1 rounded">
                {summary.completedActivities}
              </span>
            </div>
          </div>

          {/* Compact Legend on right */}
          <div className="flex items-center gap-1.5 text-xs flex-shrink-0">
            <span className="hidden xl:inline-block text-[10px] font-semibold text-corporate-subtext uppercase tracking-wider mr-1">
              Leyenda:
            </span>
            <div className="flex items-center gap-1 bg-[#E5E7EB] border border-[#D1D5DB] px-1.5 py-0.5 rounded">
              <span className="text-[#4B5563] text-[9.5px] font-bold">—</span>
            </div>
            <div className="flex items-center gap-1 bg-[#EF4444] border border-[#DC2626] px-1.5 py-0.5 rounded">
              <span className="text-black text-[9.5px] font-black">PEND.</span>
            </div>
            <div className="flex items-center gap-1 bg-[#F59E0B] border border-[#D97706] px-1.5 py-0.5 rounded">
              <span className="text-black text-[9.5px] font-black">RUN</span>
            </div>
            <div className="flex items-center gap-1 bg-[#22C55E] border border-[#16A34A] px-1.5 py-0.5 rounded">
              <span className="text-black text-[9.5px] font-black">OK</span>
            </div>
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
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
