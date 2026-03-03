// components/SyncStatusIndicator.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Cloud, CloudOff, RefreshCw, AlertCircle, Check } from 'lucide-react-native';
import { useSync } from '@/contexts/SyncContext';
import Colors from '@/constants/colors';

export default function SyncStatusIndicator({ compact = false }: { compact?: boolean }) {
  const { syncStatus, pendingCount, lastSyncedAt, isSyncing, isSyncEnabled, syncNow } = useSync();

  if (!isSyncEnabled) {
    if (compact) return null;
    return (
      <View style={styles.container}>
        <CloudOff color={Colors.text.tertiary} size={14} />
        <Text style={styles.offlineText}>Local only</Text>
      </View>
    );
  }

  const getStatusIcon = () => {
    if (isSyncing) return <ActivityIndicator size="small" color={Colors.accent.gold} />;
    if (syncStatus === 'error') return <AlertCircle color={Colors.status.error} size={14} />;
    if (syncStatus === 'offline') return <CloudOff color={Colors.status.warning} size={14} />;
    if (pendingCount > 0) return <Cloud color={Colors.status.warning} size={14} />;
    return <Check color={Colors.status.active} size={14} />;
  };

  const getStatusText = () => {
    if (isSyncing) return 'Syncing...';
    if (syncStatus === 'error') return 'Sync error';
    if (syncStatus === 'offline') return `Offline (${pendingCount} pending)`;
    if (pendingCount > 0) return `${pendingCount} pending`;
    return 'Synced';
  };

  const getLastSyncText = () => {
    if (!lastSyncedAt) return '';
    const diff = Date.now() - new Date(lastSyncedAt).getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(lastSyncedAt).toLocaleDateString();
  };

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactContainer} onPress={syncNow} activeOpacity={0.7} disabled={isSyncing}>
        {getStatusIcon()}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {getStatusIcon()}
      <Text style={styles.statusText}>{getStatusText()}</Text>
      {lastSyncedAt && !isSyncing && <Text style={styles.timeText}>{getLastSyncText()}</Text>}
      {!isSyncing && (
        <TouchableOpacity onPress={syncNow} style={styles.syncButton} activeOpacity={0.7}>
          <RefreshCw color={Colors.accent.gold} size={14} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: Colors.bg.card, borderRadius: 8, borderWidth: 0.5, borderColor: Colors.border.subtle },
  compactContainer: { padding: 6 },
  statusText: { fontSize: 12, color: Colors.text.secondary },
  timeText: { fontSize: 11, color: Colors.text.tertiary },
  offlineText: { fontSize: 12, color: Colors.text.tertiary },
  syncButton: { marginLeft: 4, padding: 4 },
});
