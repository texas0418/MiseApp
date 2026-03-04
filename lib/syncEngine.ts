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
// UUID helpers — app uses numeric IDs, Supabase expects UUIDs
// ---------------------------------------------------------------------------

function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

/**
 * Convert a non-UUID id (like a timestamp "1772595741080") into a
 * deterministic, valid UUID so the same local ID always maps to the
 * same UUID in Supabase.
 */
function deterministicUUID(input: string): string {
  let hex: string;
  try {
    hex = BigInt(input).toString(16).padStart(32, '0').slice(0, 32);
  } catch {
    // If input isn't a number, hash it simply
    let h = 0;
    for (let i = 0; i < input.length; i++) {
      h = ((h << 5) - h + input.charCodeAt(i)) | 0;
    }
    hex = Math.abs(h).toString(16).padStart(32, '0').slice(0, 32);
  }
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

/** Convert any id field to UUID if it isn't already */
function ensureUUID(value: string | null | undefined): string | null | undefined {
  if (!value) return value;
  if (isValidUUID(value)) return value;
  return deterministicUUID(value);
}

/** Convert all known id/FK fields in a row to UUIDs */
function convertRowIds(row: Record<string, any>): Record<string, any> {
  if (row.id) row.id = ensureUUID(row.id);
  if (row.project_id) row.project_id = ensureUUID(row.project_id);
  if (row.shot_id) row.shot_id = ensureUUID(row.shot_id);
  if (row.scene_id) row.scene_id = ensureUUID(row.scene_id);
  if (row.location_id) row.location_id = ensureUUID(row.location_id);
  if (row.crew_member_id) row.crew_member_id = ensureUUID(row.crew_member_id);
  if (row.invited_by) row.invited_by = ensureUUID(row.invited_by);
  return row;
}

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
      console.error(`[SyncEngine] Push failed for ${item.table}/${item.recordId}:`, error.message);
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
    convertRowIds(row);
    row.updated_at = new Date().toISOString();
    if (action === 'insert') delete row.created_at; // Let Supabase default

    const { error } = await supabase.from(table).upsert(row, { onConflict: 'id' });
    if (error) throw error;
  }

  if (action === 'delete') {
    const safeId = ensureUUID(recordId) || recordId;
    // Soft delete
    const { error } = await supabase
      .from(table)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', safeId);
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
        convertRowIds(row);
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
