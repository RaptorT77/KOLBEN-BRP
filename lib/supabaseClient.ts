import { createClient } from '@supabase/supabase-js';

// Supabase configuration for real-time multi-device sync
export const SUPABASE_URL = 'https://dnpfbfooosdrmyfbrjmk.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRucGZiZm9vb3Nkcm15ZmJyam1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNzY5NTMsImV4cCI6MjA4MDY1Mjk1M30.Z46m0AU1ZJbqQ2-ujKaRY3k953Rtz7C5-Vom-Pk3tl8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 20,
    },
  },
});

export const REALTIME_ROOM = 'brp_heatmap_sync_room';
export const STATE_ROW_ID = 'main';
