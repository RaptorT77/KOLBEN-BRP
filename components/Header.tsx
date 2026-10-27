'use client';

import React, { useState } from 'react';
import { DiagramSummary, DiagramRow } from '@/types/diagram';
import { SyncStatus } from '@/lib/useDiagramStore';
import { RotateCcw, ZoomIn, ZoomOut, Maximize2, AlertTriangle, Layers, Filter, Radio, FileText, Printer, LayoutGrid } from 'lucide-react';

interface HeaderProps {
  summary: DiagramSummary;
  onReset?: () => void;
  onPrintReport?: () => void;
  onPrintDashboard?: () => void;
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
  onPrintReport,
  onPrintDashboard,
  scale,
  setScale,
  autoFit,
  setAutoFit,
  rows = [],
  selectedRowId = 'all',
  onSelectRowId,
  syncStatus = 'connected',
}) => {
  const basePath = process.env.NODE_ENV === 'production' ? '/KOLBEN-BRP' : '';

  return (
    <>
      <header className="bg-white border-b border-corporate-border px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 flex-shrink-0 shadow-xs select-none">
        {/* Fila Principal Institucional: Logo Izquierdo - TÍTULO CENTRADO - Logo Derecho */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Esquina Superior Izquierda: LOGO_KS-1.bmp */}
          <div className="flex items-center flex-shrink-0">
            <div className="p-0.5 rounded-lg border border-slate-200/80 bg-white shadow-xs">
              <img
                src={`${basePath}/LOGO_KS-1.bmp`}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.tried) {
                    target.dataset.tried = 'true';
                    target.src = 'LOGO_KS-1.bmp';
                  }
                }}
                alt="Logo KS"
                className="h-9 sm:h-12 md:h-14 w-auto object-contain block"
              />
            </div>
          </div>

          {/* Centro: Título Oficial Armonizado con Estado en Vivo */}
          <div className="flex-1 flex flex-col items-center justify-center text-center px-1 sm:px-3 min-w-0">
            <h1 className="text-[11.5px] xs:text-xs sm:text-base md:text-lg lg:text-xl font-black text-[#173D60] tracking-tight leading-tight uppercase line-clamp-2">
              Relación de mantenimientos preventivos Linea &ldquo;E&rdquo; Producto 9X3
            </h1>
            
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 flex-wrap">
              <span className="hidden sm:inline-block text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                KOLBEN &bull; BRP &bull; LÍNEA E
              </span>

              <span className="inline-block text-[8.5px] sm:text-[9.5px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200">
                PDF Oficial
              </span>

              {/* Indicador de Sincronización en Vivo */}
              {syncStatus === 'connected' && (
                <span
                  className="inline-flex items-center gap-1 text-[8.5px] sm:text-[9.5px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-200"
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
                  className="inline-flex items-center gap-1 text-[8.5px] sm:text-[9.5px] font-medium bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded border border-amber-200"
                  title="Conectando al canal de sincronización"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  <span>Sincronizando...</span>
                </span>
              )}
              {syncStatus === 'offline' && (
                <span
                  className="inline-flex items-center gap-1 text-[8.5px] sm:text-[9.5px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded border border-gray-300"
                  title="Modo local (los cambios se guardan localmente)"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  <span>Local</span>
                </span>
              )}
            </div>
          </div>

          {/* Esquina Superior Derecha: LOGO_JIFIX_BRP-1.jpg */}
          <div className="flex items-center justify-end flex-shrink-0">
            <div className="p-0.5 rounded-lg border border-slate-200/80 bg-white shadow-xs">
              <img
                src={`${basePath}/LOGO_JIFIX_BRP-1.jpg`}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.tried) {
                    target.dataset.tried = 'true';
                    target.src = 'LOGO_JIFIX_BRP-1.jpg';
                  }
                }}
                alt="Logo JI&FIX SIGMA / BRP"
                className="h-9 sm:h-12 md:h-14 w-auto object-contain block rounded-xs"
              />
            </div>
          </div>
        </div>

        {/* Segunda Fila: Resumen de Contadores y Barra de Herramientas Operativa */}
        <div className="mt-2 pt-2 border-t border-corporate-border flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          {/* Contadores de Resumen Semafórico */}
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

          {/* Botones de Acción y Controles */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Quick Filter by Equipment (Mobile / Tablet / PC helper) */}
            {onSelectRowId && rows.length > 0 && (
              <div className="flex items-center">
                <select
                  value={selectedRowId}
                  onChange={(e) => onSelectRowId(e.target.value)}
                  className="text-[10px] sm:text-[11px] font-medium bg-corporate-muted border border-corporate-border rounded px-2 py-1 text-corporate-text focus:outline-none focus:ring-1 focus:ring-corporate-accent max-w-[130px] sm:max-w-[170px] truncate"
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

            {/* Botón Imprimir Dashboard (1 sola página PDF del estatus actual del heatmap) */}
            <button
              type="button"
              onClick={onPrintDashboard}
              title="Imprimir solo el Dashboard actual en PDF (1 página con matriz y créditos)"
              className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black text-[#173D60] bg-amber-100 hover:bg-amber-200 active:scale-95 px-2.5 sm:px-3 py-1 rounded-md border border-amber-300 transition-all shadow-xs cursor-pointer touch-manipulation"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#173D60] stroke-[2.5]" />
              <span className="hidden xs:inline">Imprimir Dashboard</span>
              <span className="xs:hidden">Dashboard</span>
            </button>

            {/* Botón Imprimir Informe */}
            <button
              type="button"
              onClick={onPrintReport}
              title="Imprimir informe ejecutivo completo detallado en PDF"
              className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black text-white bg-gradient-to-r from-[#173D60] to-[#1F4E79] hover:from-[#1F4E79] hover:to-[#2B6EA9] active:scale-95 px-2.5 sm:px-3 py-1 rounded-md border border-[#173D60] transition-all shadow-xs cursor-pointer touch-manipulation"
            >
              <Printer className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden xs:inline">Imprimir Informe</span>
              <span className="xs:hidden">Informe</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
