'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import rawData from '@/data/activities.json';
import { DiagramDataSchema } from '@/lib/schema';
import { ActivityCell, ActivityStatus, DiagramData } from '@/types/diagram';

const STORAGE_KEY = 'brp_heatmap_activities_v1';

// Validate initial data strictly using Zod
const initialData: DiagramData = DiagramDataSchema.parse(rawData);

export function useDiagramStore() {
  // Initialize directly with original PDF data so it renders immediately
  const [cells, setCells] = useState<ActivityCell[]>(initialData.cells);
  const [selectedCell, setSelectedCell] = useState<ActivityCell | null>(null);

  // Sync with localStorage on client mount
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedStatuses = JSON.parse(stored) as Record<string, ActivityStatus>;
        setCells((prev) =>
          prev.map((cell) => {
            // Guard disabled cells - they must NEVER become active
            if (!cell.isEditable || cell.initialStatus === 'disabled') {
              return { ...cell, status: 'disabled' };
            }
            const storedStatus = parsedStatuses[cell.id];
            if (storedStatus && ['pending', 'in_progress', 'completed'].includes(storedStatus)) {
              return { ...cell, status: storedStatus };
            }
            return cell;
          })
        );
      }
    } catch (e) {
      console.error('Failed to load saved state from localStorage:', e);
    }
  }, []);

  // Update cell status
  const updateCellStatus = useCallback((cellId: string, newStatus: ActivityStatus) => {
    setCells((prev) => {
      const targetCell = prev.find((c) => c.id === cellId);
      if (!targetCell || !targetCell.isEditable || targetCell.initialStatus === 'disabled') {
        return prev;
      }

      if (!['pending', 'in_progress', 'completed'].includes(newStatus)) {
        return prev;
      }

      const updated = prev.map((cell) =>
        cell.id === cellId ? { ...cell, status: newStatus } : cell
      );

      // Persist to localStorage
      try {
        const toPersist: Record<string, ActivityStatus> = {};
        for (const c of updated) {
          if (c.isEditable && c.status !== c.initialStatus) {
            toPersist[c.id] = c.status;
          }
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toPersist));
      } catch (e) {
        console.error('Failed to save to localStorage:', e);
      }

      return updated;
    });

    setSelectedCell((prev) => {
      if (prev && prev.id === cellId) {
        return { ...prev, status: newStatus };
      }
      return prev;
    });
  }, []);

  // Cycle to next status
  const cycleCellStatus = useCallback((cellId: string) => {
    const targetCell = cells.find((c) => c.id === cellId);
    if (!targetCell || !targetCell.isEditable) return;

    const sequence: ActivityStatus[] = ['pending', 'in_progress', 'completed'];
    const currentIndex = sequence.indexOf(targetCell.status);
    const nextStatus = sequence[(currentIndex + 1) % sequence.length];
    updateCellStatus(cellId, nextStatus);
  }, [cells, updateCellStatus]);

  // Reset to original PDF state
  const resetToOriginal = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear localStorage:', e);
    }
    setCells(initialData.cells.map((c) => ({ ...c, status: c.initialStatus })));
    if (selectedCell) {
      const original = initialData.cells.find((c) => c.id === selectedCell.id);
      if (original) setSelectedCell({ ...original });
    }
  }, [selectedCell]);

  // Dynamic summary calculation
  const summary = useMemo(() => {
    let disabled = 0;
    let pending = 0;
    let inProgress = 0;
    let completed = 0;

    for (const cell of cells) {
      if (cell.status === 'disabled') disabled++;
      else if (cell.status === 'pending') pending++;
      else if (cell.status === 'in_progress') inProgress++;
      else if (cell.status === 'completed') completed++;
    }

    return {
      totalActivities: cells.length,
      disabledActivities: disabled,
      pendingActivities: pending,
      inProgressActivities: inProgress,
      completedActivities: completed,
    };
  }, [cells]);

  return {
    diagramData: initialData,
    cells,
    summary,
    selectedCell,
    setSelectedCell,
    updateCellStatus,
    cycleCellStatus,
    resetToOriginal,
  };
}
