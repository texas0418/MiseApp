import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Plus, Sparkles, AlertCircle } from 'lucide-react-native';
import { useProjects, useProjectVFX } from '@/contexts/ProjectContext';
import Colors from '@/constants/colors';
import { VFXShot, VFXShotStatus, VFXComplexity } from '@/types';

const STATUS_CONFIG: Record<VFXShotStatus, { color: string; label: string }> = {
  'pending': { color: Colors.text.tertiary, label: 'Pending' },
  'in-progress': { color: Colors.status.info, label: 'In Progress' },
  'review': { color: Colors.status.warning, label: 'Review' },
  'approved': { color: Colors.status.active, label: 'Approved' },
  'final': { color: Colors.accent.gold, label: 'Final' },
};

const COMPLEXITY_CONFIG: Record<VFXComplexity, { color: string; label: string }> = {
  'simple': { color: Colors.status.active, label: 'Simple' },
  'moderate': { color: Colors.status.info, label: 'Moderate' },
  'complex': { color: Colors.status.warning, label: 'Complex' },
  'hero': { color: Colors.status.error, label: 'Hero' },
};

function VFXCard({ item }: { item: VFXShot }) {
  const status = STATUS_CONFIG[item.status];
  const complexity = COMPLEXITY_CONFIG[item.complexity];

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.shotRef}>
          <Text style={styles.shotRefText}>Sc.{item.sceneNumber} / {item.shotNumber}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.color + '18' }]}>
          <View style={[styles.statusDot, { backgroundColor: status.color }]} />
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>
      <Text style={styles.descText}>{item.description}</Text>
      <View style={styles.metaRow}>
        <View style={[styles.complexBadge, { backgroundColor: complexity.color + '15' }]}>
          <Text style={[styles.complexText, { color: complexity.color }]}>{complexity.label}</Text>
        </View>
        {item.vendor ? <Text style={styles.vendorText}>{item.vendor}</Text> : null}
        <Text style={styles.costText}>${item.estimatedCost.toLocaleString()}</Text>
      </View>
      {item.deadline ? (
        <Text style={styles.deadlineText}>Due: {item.deadline}</Text>
      ) : null}
      {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
    </View>
  );
}

export default function VFXTrackerScreen() {
  const { activeProject, activeProjectId } = useProjects();
  const vfxShots = useProjectVFX(activeProjectId);
  const router = useRouter();

  const stats = useMemo(() => ({
    total: vfxShots.length,
    completed: vfxShots.filter(v => v.status === 'approved' || v.status === 'final').length,
    totalCost: vfxShots.reduce((s, v) => s + v.estimatedCost, 0),
  }), [vfxShots]);

  if (!activeProject) {
    return (
      <View style={styles.emptyContainer}>
        <Stack.Screen options={{ title: 'VFX Tracker' }} />
        <AlertCircle color={Colors.text.tertiary} size={48} />
        <Text style={styles.emptyTitle}>No project selected</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'VFX Tracker' }} />

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Shots</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: Colors.status.active }]}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Done</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: Colors.status.warning }]}>${stats.totalCost.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Est. Cost</Text>
        </View>
      </View>

      <FlatList
        data={vfxShots}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <VFXCard item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyInner}>
            <Sparkles color={Colors.text.tertiary} size={48} />
            <Text style={styles.emptyTitle}>No VFX shots</Text>
            <Text style={styles.emptySubtitle}>Track visual effects work</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/new-vfx' as never)} activeOpacity={0.8}>
        <Plus color={Colors.text.inverse} size={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  statBox: { flex: 1, backgroundColor: Colors.bg.card, borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 0.5, borderColor: Colors.border.subtle },
  statValue: { fontSize: 20, fontWeight: '700' as const, color: Colors.text.primary },
  statLabel: { fontSize: 10, color: Colors.text.tertiary, marginTop: 2, fontWeight: '600' as const, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  list: { padding: 16, paddingBottom: 100 },
  card: { backgroundColor: Colors.bg.card, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 0.5, borderColor: Colors.border.subtle },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  shotRef: { backgroundColor: Colors.bg.elevated, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  shotRefText: { fontSize: 12, fontWeight: '700' as const, color: Colors.text.primary, fontVariant: ['tabular-nums'] },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, gap: 4 },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusText: { fontSize: 10, fontWeight: '700' as const, letterSpacing: 0.5 },
  descText: { fontSize: 14, color: Colors.text.primary, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  complexBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  complexText: { fontSize: 10, fontWeight: '700' as const },
  vendorText: { fontSize: 11, color: Colors.text.secondary },
  costText: { fontSize: 12, fontWeight: '600' as const, color: Colors.accent.gold },
  deadlineText: { fontSize: 11, color: Colors.text.tertiary, marginTop: 6 },
  notes: { fontSize: 11, color: Colors.text.tertiary, fontStyle: 'italic' as const, marginTop: 4 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.accent.gold, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.accent.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  emptyContainer: { flex: 1, backgroundColor: Colors.bg.primary, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyInner: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600' as const, color: Colors.text.primary, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: Colors.text.secondary, marginTop: 4, textAlign: 'center' },
});
