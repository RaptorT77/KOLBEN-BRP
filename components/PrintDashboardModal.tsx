'use client';

import React, { useEffect, useMemo } from 'react';
import { DiagramColumn, DiagramRow, ActivityCell, DiagramSummary } from '@/types/diagram';
import { Printer, X, Calendar, Clock, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PrintDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: DiagramColumn[];
  rows: DiagramRow[];
  cells: ActivityCell[];
  summary: DiagramSummary;
}

export const PrintDashboardModal: React.FC<PrintDashboardModalProps> = ({
  isOpen,
  onClose,
  columns,
  rows,
  cells,
  summary,
}) => {
  const basePath = process.env.NODE_ENV === 'production' ? '/KOLBEN-BRP' : '';

  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Fecha y hora formateadas para el dashboard impreso
  const reportDate = useMemo(() => {
    const now = new Date();
    return {
      date: now.toLocaleDateString('es-MX', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      time: now.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  }, []);

  // Mapa rápido de celdas: `${rowId}_${colId}` -> ActivityCell
  const cellMap = useMemo(() => {
    const map = new Map<string, ActivityCell>();
    for (const cell of cells) {
      map.set(`${cell.rowId}_${cell.colId}`, cell);
    }
    return map;
  }, [cells]);

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  const totalActive = summary.totalActivities - summary.disabledActivities;
  const globalProgressPercent =
    totalActive > 0 ? Math.round((summary.completedActivities / totalActive) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto overscroll-contain">
      <div className="relative w-full max-w-7xl bg-white rounded-2xl shadow-2xl border border-slate-300 flex flex-col max-h-[96vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Barra superior de control (Se oculta en la impresión) */}
        <div className="no-print bg-[#173D60] text-white px-4 py-2.5 flex items-center justify-between gap-3 border-b border-[#2C6191] flex-shrink-0">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-amber-300" />
            <div>
              <h2 className="text-sm sm:text-base font-bold leading-tight">
                Vista Previa — Imprimir Dashboard (1 Sola Página en PDF)
              </h2>
              <p className="text-[11px] text-blue-200">
                Optimizado para exportar el mapa de calor con encabezado oficial y créditos discretos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 active:bg-green-700 text-black font-extrabold text-xs shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 stroke-[2.5]" />
              <span>Imprimir / Guardar en PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-all cursor-pointer"
              title="Cerrar vista previa"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido imprimible de una sola página */}
        <div className="printable-report-content flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 text-slate-800 bg-white flex flex-col justify-between">
          
          {/* ==================== ENCABEZADO INSTITUCIONAL ==================== */}
          <div className="flex items-center justify-between gap-3 border-b-2 border-[#173D60] pb-2 flex-shrink-0">
            {/* Esquina Izquierda: LOGO_KS-1.bmp */}
            <div className="flex items-center flex-shrink-0">
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
                className="h-11 sm:h-13 w-auto object-contain block"
              />
            </div>

            {/* Centro: Título Oficial y Metadatos */}
            <div className="flex-1 text-center px-1">
              <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-black text-[#173D60] tracking-tight leading-tight uppercase">
                Relación de mantenimientos preventivos Linea &ldquo;E&rdquo; Producto 9X3
              </h1>
              <div className="mt-0.5 flex items-center justify-center gap-2 text-[10px] text-slate-600 font-bold">
                <span>KOLBEN &bull; BRP &bull; LÍNEA E</span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span className="capitalize">{reportDate.date}</span>
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{reportDate.time}</span>
                </span>
                <span>&bull;</span>
                <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 rounded text-[9px]">
                  PDF Oficial
                </span>
              </div>
            </div>

            {/* Esquina Derecha: LOGO_JIFIX_BRP-1.jpg */}
            <div className="flex items-center justify-end flex-shrink-0">
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
                className="h-11 sm:h-13 w-auto object-contain block rounded-xs"
              />
            </div>
          </div>

          {/* ==================== RESUMEN SEMAFÓRICO COMPACTO ==================== */}
          <div className="flex items-center justify-between gap-1.5 text-center flex-shrink-0 bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                Estatus Actual:
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800">
                Total: <strong>{summary.totalActivities}</strong>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E5E7EB] text-[#4B5563] border border-[#D1D5DB]">
                Deshab: <strong>{summary.disabledActivities}</strong>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#EF4444] text-black">
                PEND: <strong>{summary.pendingActivities}</strong>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#F59E0B] text-black">
                RUN: <strong>{summary.inProgressActivities}</strong>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#22C55E] text-black">
                OK: <strong>{summary.completedActivities}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-700">
                Avance: <strong className="text-blue-800">{globalProgressPercent}%</strong>
              </span>
              <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${globalProgressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* ==================== MATRIZ COMPLETA DEL DASHBOARD (16 x 30) ==================== */}
          <div className="border border-slate-300 rounded-lg overflow-hidden shadow-xs flex-1">
            <table className="w-full border-collapse text-[8.5px] table-fixed">
              <thead>
                <tr className="bg-[#1F4E79] text-white">
                  <th className="p-1 text-left font-bold border-r border-[#2C6191] w-[145px]">
                    Equipo / Fila
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col.id}
                      className="p-0.5 border-r border-[#2C6191] text-center font-medium text-[8px] h-[75px] align-bottom pb-1"
                    >
                      <div className="vertical-header-text overflow-hidden text-ellipsis max-h-[68px] leading-tight tracking-tighter">
                        {col.name}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rows.map((row) => (
                  <tr key={row.id} className="h-5">
                    <td className="px-1.5 py-0.2 font-bold text-[8.5px] text-[#173D60] border-r border-slate-300 bg-slate-50 truncate leading-tight">
                      {row.name}
                    </td>
                    {columns.map((col) => {
                      const cell = cellMap.get(`${row.id}_${col.id}`);
                      if (!cell || !cell.isEditable || cell.status === 'disabled') {
                        return (
                          <td
                            key={col.id}
                            className="p-0 border-r border-slate-200 bg-[#E5E7EB] text-center text-[#6B7280] font-bold text-[7.5px]"
                          >
                            —
                          </td>
                        );
                      }
                      const isOK = cell.status === 'completed';
                      const isRUN = cell.status === 'in_progress';
                      return (
                        <td
                          key={col.id}
                          className={cn(
                            'p-0 border-r border-slate-200 text-center font-black text-[7.5px] text-black leading-none',
                            isOK && 'bg-[#22C55E]',
                            isRUN && 'bg-[#F59E0B]',
                            !isOK && !isRUN && 'bg-[#EF4444]'
                          )}
                        >
                          {isOK ? 'OK' : isRUN ? 'RUN' : 'PEND.'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ==================== CRÉDITOS DISCRETOS Y ARMONIZADOS AL PIE ==================== */}
          <div className="border-t border-slate-200 pt-1.5 flex items-center justify-between text-[8px] sm:text-[8.5px] text-slate-500 flex-shrink-0">
            <div>
              <span className="font-semibold text-slate-700">Sistema de Control de Mantenimiento</span>
              <span className="mx-1">&bull;</span>
              <span>Línea E (Producto 9X3)</span>
              <span className="mx-1">&bull;</span>
              <span>KOLBEN / BRP</span>
            </div>

            {/* Créditos solicitados por el usuario */}
            <div className="text-right flex items-center gap-1.5 flex-wrap justify-end">
              <span className="font-bold text-slate-800">Jose Antonio De Jesus Galicia</span>
              <span>&bull;</span>
              <span className="font-mono text-blue-700 font-semibold">dejesus.antonio@hcaa.com.mx</span>
              <span>&bull;</span>
              <span className="font-bold text-slate-800">HC Advanced Automation S.A de C.V.</span>
              <span>&bull;</span>
              <span className="text-blue-700 underline font-mono">https://www.hcaa.com.mx/</span>
              <span>&bull;</span>
              <span className="text-slate-600">Puebla, Puebla, MX</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
