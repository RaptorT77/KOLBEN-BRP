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
    updateCellStatus,
    resetToOriginal,
  } = useDiagramStore();

  const [scale, setScale] = useState<number>(1.0);
  const [autoFit, setAutoFit] = useState<boolean>(true);
  const [colorMode, setColorMode] = useState<'soft' | 'solid'>('soft');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleCellClick = (cell: ActivityCell) => {
    if (!cell.isEditable) return;
    setSelectedCell(cell);
    setIsModalOpen(true);
  };

  return (
    <main className="h-screen w-screen flex flex-col bg-corporate-bg overflow-hidden">
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
      />

      {/* Status Modal for Interactive Updates */}
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
