'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import rawData from '@/data/activities.json';
import { DiagramDataSchema } from '@/lib/schema';
import { ActivityCell, ActivityStatus, DiagramData } from '@/types/diagram';
import { supabase, REALTIME_ROOM, STATE_ROW_ID } from '@/lib/supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

const STORAGE_KEY = 'brp_heatmap_activities_v1';

// Validate initial data strictly using Zod
const initialData: DiagramData = DiagramDataSchema.parse(rawData);

export type SyncStatus = 'connected' | 'connecting' | 'offline';

export function useDiagramStore() {
  const [cells, setCells] = useState<ActivityCell[]>(initialData.cells);
  const [selectedCell, setSelectedCell] = useState<ActivityCell | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('connecting');
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Helper to apply incoming statuses dictionary
  const applyRemoteStatuses = useCallback((statuses: Record<string, ActivityStatus>) => {
    if (!statuses || typeof statuses !== 'object') return;
    setCells((prev) =>
      prev.map((cell) => {
        // Guard disabled cells - they must NEVER become active
        if (!cell.isEditable || cell.initialStatus === 'disabled') {
          return { ...cell, status: 'disabled' };
        }
        const newStatus = statuses[cell.id];
        if (newStatus && ['pending', 'in_progress', 'completed'].includes(newStatus)) {
          return { ...cell, status: newStatus };
        }
        // If not in statuses, keep initialStatus
        return { ...cell, status: cell.initialStatus };
      })
    );
  }, []);

  // Helper to apply a single cell update from remote broadcast
  const applySingleRemoteUpdate = useCallback((cellId: string, newStatus: ActivityStatus) => {
    if (!['pending', 'in_progress', 'completed'].includes(newStatus)) return;
    setCells((prev) =>
      prev.map((cell) => {
        if (cell.id === cellId && cell.isEditable && cell.initialStatus !== 'disabled') {
          return { ...cell, status: newStatus };
        }
        return cell;
      })
    );
    setSelectedCell((prev) => {
      if (prev && prev.id === cellId) {
        return { ...prev, status: newStatus };
      }
      return prev;
    });
  }, []);

  // 1. Initial local load + Supabase fetch + Realtime subscription
  useEffect(() => {
    let isMounted = true;

    // Load from localStorage immediately for 0-latency first paint
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as Record<string, ActivityStatus>;
          setCells((prev) =>
            prev.map((cell) => {
              if (!cell.isEditable || cell.initialStatus === 'disabled') {
                return { ...cell, status: 'disabled' };
              }
              const st = parsed[cell.id];
              if (st && ['pending', 'in_progress', 'completed'].includes(st)) {
                return { ...cell, status: st };
              }
              return cell;
            })
          );
        }
      }
    } catch (e) {
      console.warn('Local storage load warning:', e);
    }

    // Connect to Supabase Cloud & Subscribe to Realtime events
    const initRealtime = async () => {
      try {
        setSyncStatus('connecting');

        // Fetch latest state from cloud
        const { data, error } = await supabase
          .from('brp_heatmap_state')
          .select('cells_state')
          .eq('id', STATE_ROW_ID)
          .single();

        if (isMounted) {
          if (!error && data?.cells_state) {
            applyRemoteStatuses(data.cells_state);
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(data.cells_state));
            } catch {
              // ignore storage quota
            }
          }
        }

        // Setup Realtime Channel for instantaneous cross-device sync
        const channel = supabase.channel(REALTIME_ROOM, {
          config: {
            broadcast: { self: false }, // only listen to other devices
          },
        });

        channel
          // Instantaneous peer broadcast when any device clicks a status
          .on('broadcast', { event: 'cell_updated' }, ({ payload }) => {
            if (payload && payload.cellId && payload.newStatus) {
              applySingleRemoteUpdate(payload.cellId, payload.newStatus);
            }
          })
          // Instantaneous peer broadcast when reset is triggered
          .on('broadcast', { event: 'reset_all' }, () => {
            try {
              localStorage.removeItem(STORAGE_KEY);
            } catch {
              // ignore
            }
            setCells(initialData.cells.map((c) => ({ ...c, status: c.initialStatus })));
            setSelectedCell(null);
          })
          // Postgres changes fallback
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'brp_heatmap_state',
              filter: `id=eq.${STATE_ROW_ID}`,
            },
            (payload) => {
              const row = payload.new as { cells_state?: Record<string, ActivityStatus> };
              if (row?.cells_state) {
                applyRemoteStatuses(row.cells_state);
                try {
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(row.cells_state));
                } catch {
                  // ignore
                }
              }
            }
          )
          .subscribe((status) => {
            if (!isMounted) return;
            if (status === 'SUBSCRIBED') {
              setSyncStatus('connected');
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              setSyncStatus('offline');
            }
          });

        channelRef.current = channel;
      } catch (err) {
        console.error('Realtime sync initialization error:', err);
        if (isMounted) setSyncStatus('offline');
      }
    };

    initRealtime();

    return () => {
      isMounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [applyRemoteStatuses, applySingleRemoteUpdate]);

  // Update cell status with optimistic local update + instantaneous broadcast + cloud persistence
  const updateCellStatus = useCallback((cellId: string, newStatus: ActivityStatus) => {
    if (!['pending', 'in_progress', 'completed'].includes(newStatus)) {
      return;
    }

    setCells((prev) => {
      const targetCell = prev.find((c) => c.id === cellId);
      if (!targetCell || !targetCell.isEditable || targetCell.initialStatus === 'disabled') {
        return prev;
      }

      const updated = prev.map((cell) =>
        cell.id === cellId ? { ...cell, status: newStatus } : cell
      );

      // Extract modified states
      const toPersist: Record<string, ActivityStatus> = {};
      for (const c of updated) {
        if (c.isEditable && c.status !== c.initialStatus) {
          toPersist[c.id] = c.status;
        }
      }

      // 1. Save to local storage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toPersist));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }

      // 2. Broadcast immediately over WebSocket to all open devices/tabs (< 50ms)
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'cell_updated',
          payload: { cellId, newStatus, timestamp: Date.now() },
        });
      }

      // 3. Persist to Supabase Database asynchronously
      supabase
        .from('brp_heatmap_state')
        .update({
          cells_state: toPersist,
          updated_at: new Date().toISOString(),
        })
        .eq('id', STATE_ROW_ID)
        .then(({ error }) => {
          if (error) {
            console.error('Supabase persistence error:', error);
          }
        });

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

  // Reset to original PDF state across all devices
  const resetToOriginal = useCallback(() => {
    // 1. Local storage cleanup
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('LocalStorage clear error:', e);
    }

    // 2. Local state reset
    setCells(initialData.cells.map((c) => ({ ...c, status: c.initialStatus })));
    if (selectedCell) {
      const original = initialData.cells.find((c) => c.id === selectedCell.id);
      if (original) setSelectedCell({ ...original });
    }

    // 3. Broadcast reset to all devices immediately
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'reset_all',
        payload: { timestamp: Date.now() },
      });
    }

    // 4. Update cloud database
    supabase
      .from('brp_heatmap_state')
      .update({
        cells_state: {},
        updated_at: new Date().toISOString(),
      })
      .eq('id', STATE_ROW_ID)
      .then(({ error }) => {
        if (error) console.error('Cloud reset error:', error);
      });
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
    syncStatus,
  };
}
