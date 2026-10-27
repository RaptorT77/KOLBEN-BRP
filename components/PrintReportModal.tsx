'use client';

import React, { useEffect, useMemo } from 'react';
import { DiagramColumn, DiagramRow, ActivityCell, DiagramSummary, CellChecklistState, ActivityStatus } from '@/types/diagram';
import { getChecklistForCell, ChecklistGroup } from '@/data/equipmentChecklists';
import { Printer, X, Check, Calendar, Clock, Award, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: DiagramColumn[];
  rows: DiagramRow[];
  cells: ActivityCell[];
  checklists: Record<string, CellChecklistState>;
  summary: DiagramSummary;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  columns,
  rows,
  cells,
  checklists,
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

  // Fecha y hora formateadas para el reporte
  const reportDate = useMemo(() => {
    const now = new Date();
    return {
      date: now.toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: now.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
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

  // Manejador de impresión
  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  // Porcentaje global de avance sobre las celdas activas
  const totalActive = summary.totalActivities - summary.disabledActivities;
  const globalProgressPercent =
    totalActive > 0 ? Math.round((summary.completedActivities / totalActive) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto overscroll-contain">
      {/* Contenedor principal del modal (en pantalla es scrollable, en impresión se expande a todo el papel) */}
      <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-slate-300 flex flex-col max-h-[94vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Barra superior de acciones (Se oculta en la impresión con clase no-print) */}
        <div className="no-print bg-[#173D60] text-white px-4 py-3 flex items-center justify-between gap-3 border-b border-[#2C6191] flex-shrink-0">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-300" />
            <div>
              <h2 className="text-sm sm:text-base font-bold leading-tight">
                Vista Previa de Impresión — Informe Ejecutivo Completo
              </h2>
              <p className="text-[11px] text-blue-200">
                Incluye Dashboard completo, estado detallado de checkboxes por grupo y créditos oficiales.
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

        {/* Contenido imprimible estructurado (Este contenedor es el que se imprime al PDF) */}
        <div className="printable-report-content flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 text-slate-800 bg-white">
          
          {/* ==================== SECCIÓN 1: ENCABEZADO INSTITUCIONAL ==================== */}
          <div className="flex items-center justify-between gap-4 border-b-2 border-[#173D60] pb-4">
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
                className="h-14 sm:h-16 w-auto object-contain block"
              />
            </div>

            {/* Centro: Título Oficial y Metadatos */}
            <div className="flex-1 text-center px-2">
              <h1 className="text-base sm:text-xl lg:text-2xl font-black text-[#173D60] tracking-tight leading-tight uppercase">
                Relación de mantenimientos preventivos Linea &ldquo;E&rdquo; Producto 9X3
              </h1>
              <div className="mt-1 flex items-center justify-center gap-2 flex-wrap text-xs text-slate-600 font-semibold">
                <span>Planta de Producción BRP &bull; KOLBEN</span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span className="capitalize">{reportDate.date}</span>
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{reportDate.time}</span>
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
                className="h-14 sm:h-16 w-auto object-contain block rounded-xs"
              />
            </div>
          </div>

          {/* ==================== SECCIÓN 2: TARJETAS DE RESUMEN EJECUTIVO ==================== */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-3 text-center">
            {/* Total Actividades */}
            <div className="p-2 sm:p-2.5 rounded-lg border border-slate-200 bg-slate-50">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Matriz</div>
              <div className="text-lg sm:text-xl font-black text-slate-900">{summary.totalActivities}</div>
              <div className="text-[9.5px] text-slate-500">480 Celdas</div>
            </div>

            {/* Deshabilitadas */}
            <div className="p-2 sm:p-2.5 rounded-lg border border-slate-300 bg-[#E5E7EB]">
              <div className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wider">No Aplica</div>
              <div className="text-lg sm:text-xl font-black text-[#1F2937]">{summary.disabledActivities}</div>
              <div className="text-[9.5px] text-[#4B5563]">Deshabilitadas</div>
            </div>

            {/* PEND. (Rojo) */}
            <div className="p-2 sm:p-2.5 rounded-lg border border-[#DC2626] bg-[#EF4444] text-black">
              <div className="text-[10px] font-black uppercase tracking-wider">Pendientes</div>
              <div className="text-lg sm:text-xl font-black">{summary.pendingActivities}</div>
              <div className="text-[9.5px] font-bold">Por Iniciar (PEND.)</div>
            </div>

            {/* RUN (Ámbar) */}
            <div className="p-2 sm:p-2.5 rounded-lg border border-[#D97706] bg-[#F59E0B] text-black">
              <div className="text-[10px] font-black uppercase tracking-wider">En Proceso</div>
              <div className="text-lg sm:text-xl font-black">{summary.inProgressActivities}</div>
              <div className="text-[9.5px] font-bold">En Curso (RUN)</div>
            </div>

            {/* OK (Verde) */}
            <div className="p-2 sm:p-2.5 rounded-lg border border-[#16A34A] bg-[#22C55E] text-black">
              <div className="text-[10px] font-black uppercase tracking-wider">Concluidas</div>
              <div className="text-lg sm:text-xl font-black">{summary.completedActivities}</div>
              <div className="text-[9.5px] font-bold">Completadas (OK)</div>
            </div>

            {/* Avance Global */}
            <div className="p-2 sm:p-2.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-950">
              <div className="text-[10px] font-bold uppercase tracking-wider">Avance Global</div>
              <div className="text-lg sm:text-xl font-black text-blue-800">{globalProgressPercent}%</div>
              <div className="text-[9.5px] font-semibold text-blue-700">De 163 Activas</div>
            </div>
          </div>

          {/* ==================== SECCIÓN 3: DASHBOARD COMPLETO (MATRIZ MAPA DE CALOR) ==================== */}
          <div className="border border-slate-300 rounded-xl overflow-hidden shadow-xs">
            <div className="bg-[#173D60] text-white px-3 py-2 flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">
                Matriz Completa del Mapa de Calor &bull; 16 Equipos &times; 30 Actividades
              </span>
              <span className="text-[10px] text-blue-200 font-semibold">
                Estado Consolidado al Momento de Impresión
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[9px]">
                <thead>
                  <tr className="bg-[#1F4E79] text-white">
                    <th className="p-1.5 text-left font-bold border-r border-[#2C6191] min-w-[130px] w-[130px]">
                      Equipo / Fila
                    </th>
                    {columns.map((col) => (
                      <th
                        key={col.id}
                        className="p-1 border-r border-[#2C6191] text-center font-semibold text-[8px] h-[80px] align-bottom pb-1"
                        style={{ minWidth: '24px' }}
                      >
                        <div className="vertical-header-text overflow-hidden text-ellipsis max-h-[72px]">
                          {col.name}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {rows.map((row) => (
                    <tr key={row.id} className="h-6">
                      <td className="px-2 py-0.5 font-bold text-[9px] text-[#173D60] border-r border-slate-300 bg-slate-50 truncate">
                        {row.name}
                      </td>
                      {columns.map((col) => {
                        const cell = cellMap.get(`${row.id}_${col.id}`);
                        if (!cell || !cell.isEditable || cell.initialStatus === 'disabled') {
                          return (
                            <td
                              key={col.id}
                              className="p-0 border-r border-slate-200 bg-[#E5E7EB] text-center text-[#6B7280] font-bold text-[8px]"
                            >
                              —
                            </td>
                          );
                        }
                        if (cell.status === 'disabled') {
                          return (
                            <td
                              key={col.id}
                              className="p-0 border-r border-slate-200 bg-[#E5E7EB] text-center text-[#4B5563] font-bold text-[8px]"
                            >
                              NA
                            </td>
                          );
                        }
                        const isOK = cell.status === 'completed';
                        const isRUN = cell.status === 'in_progress';
                        return (
                          <td
                            key={col.id}
                            className={cn(
                              'p-0 border-r border-slate-200 text-center font-black text-[8px] text-black',
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
          </div>

          {/* ==================== SECCIÓN 4: DESGLOSE DETALLADO DE CHECKBOXES POR GRUPO ==================== */}
          <div className="pt-4 page-break-before space-y-4">
            <div className="border-b-2 border-[#173D60] pb-2 flex items-center justify-between">
              <div>
                <h2 className="text-sm sm:text-base font-black text-[#173D60] uppercase tracking-tight">
                  Desglose Detallado de Actividades y Checkboxes por Equipo (Estado Último)
                </h2>
                <p className="text-[11px] text-slate-500">
                  Registro exhaustivo de tareas verificadas (OK), no aplicables (NA) y pendientes en cada grupo activo.
                </p>
              </div>
              <div className="text-right text-[10px] font-bold text-slate-600">
                Línea E &bull; BRP / KOLBEN
              </div>
            </div>

            {/* Recorrido por cada equipo con celdas activas */}
            <div className="space-y-4">
              {rows.map((row) => {
                // Obtener las columnas editables para este equipo
                const activeCellsForRow = columns
                  .map((col) => {
                    const cell = cellMap.get(`${row.id}_${col.id}`);
                    if (!cell || !cell.isEditable || cell.initialStatus === 'disabled') return null;
                    const group = getChecklistForCell(row.id, col.code, col.name);
                    if (!group) return null;
                    const cellState = checklists[cell.id] || { completed: [], na: [] };
                    return { cell, col, group, cellState };
                  })
                  .filter((item): item is { cell: ActivityCell; col: DiagramColumn; group: ChecklistGroup; cellState: CellChecklistState } => item !== null);

                if (activeCellsForRow.length === 0) return null;

                return (
                  <div
                    key={row.id}
                    className="border border-slate-300 rounded-xl overflow-hidden bg-slate-50/50 page-break-inside-avoid"
                  >
                    {/* Encabezado del Equipo */}
                    <div className="bg-gradient-to-r from-[#173D60] to-[#1F4E79] text-white px-3 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <span className="font-extrabold text-xs sm:text-sm tracking-wide">
                          {row.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-blue-200 font-semibold">
                        {activeCellsForRow.length} Grupos de Mantenimiento Activos
                      </span>
                    </div>

                    {/* Grilla de Columnas / Grupos activos del equipo */}
                    <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activeCellsForRow.map(({ cell, col, group, cellState }) => {
                        const allTasks = group.tasks;
                        const naIds = cellState.na || [];
                        const completedIds = cellState.completed || [];
                        
                        // Tareas aplicables
                        const applicableTasks = allTasks.filter((t) => !naIds.includes(t.id));
                        const applicableCount = applicableTasks.length;
                        const completedCount = applicableTasks.filter((t) => completedIds.includes(t.id)).length;
                        const naCount = naIds.length;

                        const isAllNA = applicableCount === 0;
                        const isOK = cell.status === 'completed';
                        const isRUN = cell.status === 'in_progress';
                        const statusBadge = isAllNA ? (
                          <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-[#E5E7EB] text-[#4B5563] border border-[#D1D5DB]">
                            NA (Todos NA)
                          </span>
                        ) : isOK ? (
                          <span className="px-2 py-0.5 rounded text-[9.5px] font-black bg-[#22C55E] text-black">
                            OK ({completedCount}/{applicableCount})
                          </span>
                        ) : isRUN ? (
                          <span className="px-2 py-0.5 rounded text-[9.5px] font-black bg-[#F59E0B] text-black">
                            RUN ({completedCount}/{applicableCount})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[9.5px] font-black bg-[#EF4444] text-black">
                            PEND. (0/{applicableCount})
                          </span>
                        );

                        return (
                          <div
                            key={col.id}
                            className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs space-y-2"
                          >
                            {/* Cabecera del Grupo */}
                            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                              <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                  {col.name}
                                </span>
                                <span className="text-xs font-bold text-slate-800">
                                  Grupo {group.groupCode}: {group.groupName}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {statusBadge}
                              </div>
                            </div>

                            {/* Lista de Checkboxes de actividades */}
                            <div className="divide-y divide-slate-100 text-[10px]">
                              {allTasks.map((task) => {
                                const isNA = naIds.includes(task.id);
                                const isTaskOK = completedIds.includes(task.id) && !isNA;

                                return (
                                  <div
                                    key={task.id}
                                    className={cn(
                                      'py-1 flex items-start gap-2',
                                      isNA && 'text-slate-400',
                                      isTaskOK && 'text-slate-900 font-medium'
                                    )}
                                  >
                                    {/* Indicador visual de checkbox */}
                                    <span className="flex-shrink-0 mt-0.5">
                                      {isNA ? (
                                        <span className="px-1 py-0.2 rounded text-[8px] font-black bg-slate-800 text-white">
                                          NA
                                        </span>
                                      ) : isTaskOK ? (
                                        <span className="w-4 h-4 rounded bg-[#22C55E] text-white flex items-center justify-center font-bold text-[9px]">
                                          ✓
                                        </span>
                                      ) : (
                                        <span className="w-4 h-4 rounded border-2 border-slate-300 bg-white inline-block" />
                                      )}
                                    </span>

                                    {/* Código oficial de tarea */}
                                    <span className="font-mono text-[9.5px] text-slate-500 font-bold flex-shrink-0">
                                      {task.itemNumber}
                                    </span>

                                    {/* Descripción de la tarea */}
                                    <span className={cn('flex-1 leading-snug', isNA && 'line-through')}>
                                      {task.description}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ==================== SECCIÓN 5: CRÉDITOS OFICIALES AL FINAL DEL PDF ==================== */}
          <div className="pt-6 border-t-2 border-[#173D60] page-break-inside-avoid">
            <div className="bg-gradient-to-r from-slate-900 to-[#173D60] text-white rounded-xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Información y Validación */}
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-emerald-300">
                    Documento Oficial de Certificación y Control de Mantenimiento
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Línea E &bull; Producto 9X3 &bull; Planta BRP / KOLBEN &bull; Registrado y Sincronizado en Tiempo Real
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Generado el {reportDate.date} a las {reportDate.time}
                </p>
              </div>

              {/* Bloque de Créditos Solicitado */}
              <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-lg p-3 sm:p-3.5 text-center sm:text-right min-w-[280px]">
                <div className="text-[10px] font-bold text-amber-300 uppercase tracking-widest mb-1">
                  Desarrollado y Automatizado por:
                </div>
                <div className="text-xs sm:text-sm font-black text-white">
                  Jose Antonio De Jesus Galicia
                </div>
                <div className="text-[11px] text-blue-200 font-medium">
                  dejesus.antonio@hcaa.com.mx
                </div>
                <div className="text-[11px] font-semibold text-slate-200 mt-0.5">
                  HC Advanced Automation S.A de C.V.
                </div>
                <div className="text-[10.5px] text-blue-300 underline font-mono">
                  https://www.hcaa.com.mx/
                </div>
                <div className="text-[10px] text-slate-300 mt-0.5">
                  Puebla, Puebla, MX
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
