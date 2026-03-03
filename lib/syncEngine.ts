// ---------------------------------------------------------------------------
// lib/syncEngine.ts — Core sync logic for offline-first multi-device sync
//
// Design:
//   1. AsyncStorage is always the source of truth for instant local reads
//   2. Mutations are queued (syncQueue.ts) and pushed to Supabase in background
//   3. Remote changes are pulled incrementally (since last sync timestamp)
//   4. Conflicts resolved via last-write-wins on updated_at
//   5. Soft deletes (deleted_at) are synced then purged after 30 days
// ---------------------------------------------------------------------------

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import {
  SYNCABLE_TABLES,
  type TableConfig,
  recordToSnake,
  recordToCamel,
} from '@/lib/syncConfig';
import {
  getPendingItems,
  dequeue,
  markFailed,
  pruneFailedItems,
  type SyncQueueItem,
} from '@/lib/syncQueue';

// ---------------------------------------------------------------------------
// Sync cursor — tracks last sync time per table
// ---------------------------------------------------------------------------

const SYNC_CURSOR_PREFIX = 'mise_sync_cursor_';

export async function getLastSyncTime(table: string): Promise<string | null> {
  return AsyncStorage.getItem(`${SYNC_CURSOR_PREFIX}${table}`);
}

export async function setLastSyncTime(table: string, timestamp: string): Promise<void> {
  await AsyncStorage.setItem(`${SYNC_CURSOR_PREFIX}${table}`, timestamp);
}

export async function clearAllSyncCursors(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const cursorKeys = keys.filter((k) => k.startsWith(SYNC_CURSOR_PREFIX));
  if (cursorKeys.length > 0) {
    await AsyncStorage.multiRemove(cursorKeys);
  }
}

// ---------------------------------------------------------------------------
// Sync status — observable by UI
// ---------------------------------------------------------------------------

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

type SyncStatusListener = (status: SyncStatus, detail?: string) => void;
const listeners: SyncStatusListener[] = [];
let currentStatus: SyncStatus = 'idle';

export function getSyncStatus(): SyncStatus {
  return currentStatus;
}

export function onSyncStatusChange(listener: SyncStatusListener): () => void {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

function setStatus(status: SyncStatus, detail?: string) {
  currentStatus = status;
  listeners.forEach((fn) => fn(status, detail));
}

// ---------------------------------------------------------------------------
// Push local changes to Supabase
// ---------------------------------------------------------------------------

export async function pushLocalChanges(userId: string): Promise<{
  pushed: number;
  failed: number;
}> {
  const items = getPendingItems();
  if (items.length === 0) return { pushed: 0, failed: 0 };

  let pushed = 0;
  let failed = 0;

  for (const item of items) {
    try {
      await pushSingleItem(item, userId);
      await dequeue(item.queueId);
      pushed++;
    } catch (error: any) {
      await markFailed(item.queueId, error.message || 'Unknown error');
      failed++;
    }
  }

  // Clean up permanently failed items
  const pruned = await pruneFailedItems(3);
  if (pruned.length > 0) {
    console.warn(`[SyncEngine] Pruned ${pruned.length} permanently failed items`);
  }

  return { pushed, failed };
}

async function pushSingleItem(item: SyncQueueItem, userId: string): Promise<void> {
  const { table, recordId, action, data } = item;

  if ((action === 'insert' || action === 'update') && data) {
    const row = recordToSnake(data);
    row.user_id = userId;
    row.updated_at = new Date().toISOString();
    if (action === 'insert') delete row.created_at; // Let Supabase default

    const { error } = await supabase.from(table).upsert(row, { onConflict: 'id' });
    if (error) throw error;
  }

  if (action === 'delete') {
    // Soft delete
    const { error } = await supabase
      .from(table)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', recordId);
    if (error) throw error;
  }
}

// ---------------------------------------------------------------------------
// Pull remote changes from Supabase (incremental)
// ---------------------------------------------------------------------------

export async function pullRemoteChanges(userId: string): Promise<{
  tables: number;
  records: number;
}> {
  let totalRecords = 0;

  for (const config of SYNCABLE_TABLES) {
    try {
      const pulled = await pullTableChanges(config, userId);
      totalRecords += pulled;
    } catch (error: any) {
      console.warn(`[SyncEngine] Failed to pull ${config.table}:`, error.message);
    }
  }

  return { tables: SYNCABLE_TABLES.length, records: totalRecords };
}

async function pullTableChanges(config: TableConfig, userId: string): Promise<number> {
  const lastSync = await getLastSyncTime(config.table);

  let query = supabase
    .from(config.table)
    .select('*')
    .order('updated_at', { ascending: true });

  if (config.table === 'projects') {
    query = query.eq('user_id', userId);
  }

  if (lastSync) {
    query = query.gt('updated_at', lastSync);
  }

  query = query.limit(1000);

  const { data: rows, error } = await query;
  if (error) throw error;
  if (!rows || rows.length === 0) return 0;

  // Load local data
  const localRaw = await AsyncStorage.getItem(config.storageKey);
  let localItems: Record<string, any>[] = [];
  if (localRaw) {
    try { localItems = JSON.parse(localRaw); } catch { localItems = []; }
  }

  const localMap = new Map<string, Record<string, any>>();
  for (const item of localItems) {
    localMap.set(item.id, item);
  }

  // Merge remote into local
  let mergedCount = 0;
  for (const row of rows) {
    const camelRecord = recordToCamel<Record<string, any>>(row);

    if (camelRecord.deletedAt) {
      localMap.delete(camelRecord.id);
      mergedCount++;
      continue;
    }

    const localItem = localMap.get(camelRecord.id);
    if (!localItem) {
      localMap.set(camelRecord.id, camelRecord);
      mergedCount++;
      continue;
    }

    // Last-write-wins
    const remoteTime = new Date(camelRecord.updatedAt || 0).getTime();
    const localTime = new Date(localItem.updatedAt || 0).getTime();
    if (remoteTime >= localTime) {
      localMap.set(camelRecord.id, camelRecord);
      mergedCount++;
    }
  }

  // Save merged data
  await AsyncStorage.setItem(config.storageKey, JSON.stringify(Array.from(localMap.values())));

  // Update cursor
  const latestRow = rows[rows.length - 1];
  if (latestRow?.updated_at) {
    await setLastSyncTime(config.table, latestRow.updated_at);
  }

  return mergedCount;
}

// ---------------------------------------------------------------------------
// Full sync — push then pull
// ---------------------------------------------------------------------------

let syncInProgress = false;

export async function fullSync(userId: string): Promise<{
  pushed: number;
  pulled: number;
  failed: number;
}> {
  if (syncInProgress) return { pushed: 0, pulled: 0, failed: 0 };

  syncInProgress = true;
  setStatus('syncing');

  try {
    const pushResult = await pushLocalChanges(userId);
    const pullResult = await pullRemoteChanges(userId);
    setStatus('idle');
    return { pushed: pushResult.pushed, pulled: pullResult.records, failed: pushResult.failed };
  } catch (error: any) {
    console.error('[SyncEngine] Full sync failed:', error.message);
    setStatus('error', error.message);
    return { pushed: 0, pulled: 0, failed: 0 };
  } finally {
    syncInProgress = false;
  }
}

// ---------------------------------------------------------------------------
// Initial upload — push all local data for first-time sync
// ---------------------------------------------------------------------------

export async function initialUpload(userId: string): Promise<number> {
  let uploaded = 0;

  for (const config of SYNCABLE_TABLES) {
    try {
      const localRaw = await AsyncStorage.getItem(config.storageKey);
      if (!localRaw) continue;
      const items: Record<string, any>[] = JSON.parse(localRaw);
      if (items.length === 0) continue;

      const rows = items.map((item) => {
        const row = recordToSnake(item);
        row.user_id = userId;
        row.updated_at = row.updated_at || new Date().toISOString();
        return row;
      });

      // Batch upsert (100 at a time)
      for (let i = 0; i < rows.length; i += 100) {
        const batch = rows.slice(i, i + 100);
        const { error } = await supabase.from(config.table).upsert(batch, { onConflict: 'id' });
        if (error) {
          console.warn(`[SyncEngine] Upload error ${config.table}:`, error.message);
        } else {
          uploaded += batch.length;
        }
      }

      await setLastSyncTime(config.table, new Date().toISOString());
    } catch (error: any) {
      console.warn(`[SyncEngine] Upload failed ${config.table}:`, error.message);
    }
  }

  return uploaded;
}

// ---------------------------------------------------------------------------
// Force full re-sync
// ---------------------------------------------------------------------------

export async function forceFullResync(userId: string): Promise<void> {
  await clearAllSyncCursors();
  await pullRemoteChanges(userId);
}

export function isSyncEnabled(userId: string | null | undefined): boolean {
  return !!userId;
}
