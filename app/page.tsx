'use client';

import React, { useState } from 'react';
import { useDiagramStore } from '@/lib/useDiagramStore';
import { Header } from '@/components/Header';
import { HeatmapMatrix } from '@/components/HeatmapMatrix';
import { StatusModal } from '@/components/StatusModal';
import { ActivityCell } from '@/types/diagram';

export default function HomePage() {
  const {
    diagramData,
    cells,
    summary,
    selectedCell,
    setSelectedCell,
    checklists,
    updateChecklistTasks,
    updateCellStatus,
    resetToOriginal,
    syncStatus,
  } = useDiagramStore();

  const [scale, setScale] = useState<number>(1.0);
  const [autoFit, setAutoFit] = useState<boolean>(true);
  const [colorMode, setColorMode] = useState<'soft' | 'solid'>('solid');
  const [selectedRowId, setSelectedRowId] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleCellClick = (cell: ActivityCell) => {
    if (!cell.isEditable) return;
    setSelectedCell(cell);
  };

  return (
    <main className="h-full w-full flex flex-col bg-corporate-bg overflow-hidden">
      {/* Executive Header with Counters & Controls */}
      <Header
        summary={summary}
        onReset={resetToOriginal}
        scale={scale}
        setScale={setScale}
        autoFit={autoFit}
        setAutoFit={setAutoFit}
        colorMode={colorMode}
        setColorMode={setColorMode}
        rows={diagramData.rows}
        selectedRowId={selectedRowId}
        onSelectRowId={setSelectedRowId}
        syncStatus={syncStatus}
      />

      {/* Main Heatmap Matrix */}
      <HeatmapMatrix
        columns={diagramData.columns}
        rows={diagramData.rows}
        cells={cells}
        selectedCell={selectedCell}
        onCellClick={handleCellClick}
        scale={scale}
        autoFit={autoFit}
        colorMode={colorMode}
        selectedRowId={selectedRowId}
        checklists={checklists}
        onUpdateChecklist={updateChecklistTasks}
      />

      {/* Status Modal for Interactive Updates (Fallback) */}
      {isModalOpen && (
        <StatusModal
          cell={selectedCell}
          onClose={() => setIsModalOpen(false)}
          onSelectStatus={(cellId, newStatus) => {
            updateCellStatus(cellId, newStatus);
          }}
        />
      )}
    </main>
  );
}
