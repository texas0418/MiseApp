import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Plus, FileText, AlertCircle, Clock, Film, Check, X } from 'lucide-react-native';
import { useProjects, useProjectWrapReports } from '@/contexts/ProjectContext';
import Colors from '@/constants/colors';
import { WrapReport } from '@/types';

function StatBadge({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <View style={styles.statBadge}>
      <Text style={[styles.statValue, color ? { color } : {}]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function WrapCard({ item }: { item: WrapReport }) {
  const otHours = item.overtimeMinutes > 0 ? `${(item.overtimeMinutes / 60).toFixed(1)}h OT` : 'No OT';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.dayBadge}><Text style={styles.dayText}>DAY {item.dayNumber}</Text></View>
        <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
      </View>
      <View style={styles.timeRow}>
        <Text style={styles.timeLabel}>Call: <Text style={styles.timeValue}>{item.callTime}</Text></Text>
        <Text style={styles.timeLabel}>Wrap: <Text style={styles.timeValue}>{item.actualWrap}</Text></Text>
        <Text style={[styles.timeLabel, item.overtimeMinutes > 0 && { color: Colors.status.warning }]}>{otHours}</Text>
      </View>
      <View style={styles.statsRow}>
        <StatBadge label="Shots" value={`${item.shotsCompleted}/${item.shotsPlanned}`} />
        <StatBadge label="Takes" value={item.totalTakes} />
        <StatBadge label="Circled" value={item.circledTakes} color={Colors.status.active} />
        <StatBadge label="NG" value={item.ngTakes} color={Colors.status.error} />
      </View>
      <View style={styles.scenesRow}>
        <Text style={styles.scenesLabel}>Scheduled:</Text>
        <Text style={styles.scenesText}>{item.scenesScheduled}</Text>
      </View>
      <View style={styles.scenesRow}>
        <Text style={styles.scenesLabel}>Completed:</Text>
        <Text style={[styles.scenesText, { color: Colors.status.active }]}>{item.scenesCompleted}</Text>
      </View>
      {item.weatherConditions ? <Text style={styles.weatherText}>🌤 {item.weatherConditions}</Text> : null}
      {item.notes ? <Text style={styles.notesText}>{item.notes}</Text> : null}
    </View>
  );
}

export default function WrapReportsScreen() {
  const { activeProject, activeProjectId } = useProjects();
  const reports = useProjectWrapReports(activeProjectId);
  const router = useRouter();

  const totals = useMemo(() => ({
    days: reports.length,
    totalShots: reports.reduce((s, r) => s + r.shotsCompleted, 0),
    totalTakes: reports.reduce((s, r) => s + r.totalTakes, 0),
    totalOT: reports.reduce((s, r) => s + r.overtimeMinutes, 0),
  }), [reports]);

  if (!activeProject) {
    return <View style={styles.empty}><AlertCircle color={Colors.text.tertiary} size={48} /><Text style={styles.emptyTitle}>No project selected</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Wrap Reports' }} />
      {reports.length > 0 && (
        <View style={styles.summaryBar}>
          <StatBadge label="Days" value={totals.days} />
          <StatBadge label="Shots" value={totals.totalShots} />
          <StatBadge label="Takes" value={totals.totalTakes} />
          <StatBadge label="OT" value={totals.totalOT > 0 ? `${(totals.totalOT / 60).toFixed(1)}h` : '0'} color={totals.totalOT > 0 ? Colors.status.warning : undefined} />
        </View>
      )}
      <FlatList data={reports} keyExtractor={item => item.id} renderItem={({ item }) => <WrapCard item={item} />} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}
        ListEmptyComponent={<View style={styles.emptyInner}><FileText color={Colors.text.tertiary} size={48} /><Text style={styles.emptyTitle}>No wrap reports yet</Text><Text style={styles.emptySub}>Generate a report after each shoot day</Text></View>}
      />
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/new-wrap-report' as never)} activeOpacity={0.8}><Plus color={Colors.text.inverse} size={24} /></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  list: { padding: 16, paddingBottom: 100 },
  summaryBar: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: Colors.bg.secondary, borderBottomWidth: 0.5, borderBottomColor: Colors.border.subtle },
  card: { backgroundColor: Colors.bg.card, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 0.5, borderColor: Colors.border.subtle },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dayBadge: { backgroundColor: Colors.accent.goldBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  dayText: { fontSize: 12, fontWeight: '800', color: Colors.accent.gold, letterSpacing: 1 },
  dateText: { fontSize: 13, color: Colors.text.secondary },
  timeRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  timeLabel: { fontSize: 12, color: Colors.text.tertiary },
  timeValue: { color: Colors.text.primary, fontWeight: '600' },
  statsRow: { flexDirection: 'row', marginBottom: 12 },
  statBadge: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: Colors.text.primary },
  statLabel: { fontSize: 9, color: Colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  scenesRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  scenesLabel: { fontSize: 12, color: Colors.text.tertiary, width: 80 },
  scenesText: { fontSize: 12, color: Colors.text.primary, fontWeight: '500', flex: 1 },
  weatherText: { fontSize: 11, color: Colors.text.secondary, marginTop: 8 },
  notesText: { fontSize: 12, color: Colors.text.secondary, marginTop: 8, lineHeight: 18 },
  empty: { flex: 1, backgroundColor: Colors.bg.primary, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyInner: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text.primary, marginTop: 16 },
  emptySub: { fontSize: 14, color: Colors.text.secondary, marginTop: 4, textAlign: 'center' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.accent.gold, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.accent.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
});
