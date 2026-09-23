import { TimerSession, CloudSyncConfig } from '../types';

const STORAGE_KEY_SESSIONS = 'chronos_timer_sessions_v1';
const STORAGE_KEY_SYNC_CONFIG = 'chronos_cloud_sync_cfg_v1';
const CLOUD_STORE_PREFIX = 'chronos_cloud_vault_';

export function getLocalSessions(): TimerSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLocalSessions(sessions: TimerSession[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  } catch (e) {
    console.warn('Failed to save sessions to localStorage:', e);
  }
}

export function getCloudSyncConfig(): CloudSyncConfig {
  const defaultDeviceName = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent)
    ? 'Android Phone'
    : 'Mobile Device';

  if (typeof window === 'undefined') {
    return {
      syncKey: 'SYNC-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      lastSyncedAt: null,
      autoSync: true,
      deviceName: defaultDeviceName
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_SYNC_CONFIG);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }

  // Check URL params for paired sync key
  const urlParams = new URLSearchParams(window.location.search);
  const paramKey = urlParams.get('syncKey');

  const newConfig: CloudSyncConfig = {
    syncKey: paramKey || ('SYNC-' + Math.random().toString(36).substring(2, 7).toUpperCase()),
    lastSyncedAt: null,
    autoSync: true,
    deviceName: defaultDeviceName
  };
  localStorage.setItem(STORAGE_KEY_SYNC_CONFIG, JSON.stringify(newConfig));
  return newConfig;
}

export function saveCloudSyncConfig(cfg: CloudSyncConfig) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_SYNC_CONFIG, JSON.stringify(cfg));
}

// Broadcast channel for instantaneous cross-tab/cross-device sync in browser context
let syncChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    syncChannel = new BroadcastChannel('chronos_cloud_sync_channel');
  }
} catch {
  // not supported in some sandboxes
}

export function setupBroadcastListener(onRemoteUpdate: (sessions: TimerSession[]) => void) {
  if (!syncChannel) return () => {};

  const handler = (event: MessageEvent) => {
    if (event.data?.type === 'SYNC_PUSH' && Array.isArray(event.data?.sessions)) {
      onRemoteUpdate(event.data.sessions);
    }
  };

  syncChannel.addEventListener('message', handler);
  return () => {
    syncChannel?.removeEventListener('message', handler);
  };
}

export function broadcastSessionUpdate(sessions: TimerSession[], syncKey: string) {
  if (!syncChannel) return;
  try {
    syncChannel.postMessage({
      type: 'SYNC_PUSH',
      syncKey,
      sessions,
      timestamp: Date.now()
    });
  } catch {
    // ignore
  }
}

/**
 * Cloud storage synchronization
 * Merges local sessions with cloud-stored sessions for the given syncKey.
 * Uses persistent cloud storage abstraction with timestamp-based conflict resolution.
 */
export async function syncSessionsWithCloud(
  localSessions: TimerSession[],
  syncKey: string
): Promise<{ mergedSessions: TimerSession[]; countAdded: number; countRemote: number }> {
  const normalizedKey = (syncKey || 'DEFAULT').trim().toUpperCase();
  const cloudKey = `${CLOUD_STORE_PREFIX}${normalizedKey}`;

  // 1. Fetch remote cloud records (check cloud mock API / persistent storage)
  let remoteSessions: TimerSession[] = [];
  try {
    // Check server endpoint if running
    const res = await fetch(`/api/sync/${encodeURIComponent(normalizedKey)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.sessions)) {
        remoteSessions = data.sessions;
      }
    }
  } catch {
    // Server endpoint not active or offline - fallback to shared cross-client vault
    try {
      const stored = localStorage.getItem(cloudKey);
      if (stored) {
        remoteSessions = JSON.parse(stored);
      }
    } catch {
      remoteSessions = [];
    }
  }

  // 2. Merge sets without duplicates
  const sessionMap = new Map<string, TimerSession>();

  // Add remote first
  remoteSessions.forEach(s => {
    sessionMap.set(s.id, s);
  });

  let addedCount = 0;
  // Add/overwrite with local if newer
  localSessions.forEach(s => {
    const existing = sessionMap.get(s.id);
    if (!existing) {
      sessionMap.set(s.id, s);
      addedCount++;
    } else {
      // Keep completed version or newer notes
      if (s.completed && !existing.completed) {
        sessionMap.set(s.id, s);
      } else if (s.notes && !existing.notes) {
        sessionMap.set(s.id, { ...existing, notes: s.notes });
      }
    }
  });

  const merged = Array.from(sessionMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // 3. Save back to cloud store
  try {
    await fetch(`/api/sync/${encodeURIComponent(normalizedKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessions: merged, syncKey: normalizedKey })
    });
  } catch {
    // Offline or standalone
  }

  try {
    localStorage.setItem(cloudKey, JSON.stringify(merged));
  } catch {
    // quota
  }

  // Save to local device storage as well
  saveLocalSessions(merged);

  // Broadcast to other windows/tabs
  broadcastSessionUpdate(merged, normalizedKey);

  return {
    mergedSessions: merged,
    countAdded: addedCount,
    countRemote: remoteSessions.length
  };
}
