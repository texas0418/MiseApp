import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Plus, Clock, AlertCircle, AlertTriangle } from 'lucide-react-native';
import { useProjects, useProjectTimeEntries } from '@/contexts/ProjectContext';
import Colors from '@/constants/colors';
import { TimeEntry, Department } from '@/types';

const DEPT_COLORS: Record<string, string> = {
  direction: Colors.department.direction, camera: Colors.department.camera, sound: Colors.department.sound,
  art: Colors.department.art, lighting: Colors.department.lighting, production: Colors.department.production,
  talent: Colors.department.talent, postProduction: Colors.department.postProduction,
};

function TimeCard({ item }: { item: TimeEntry }) {
  const deptColor = item.department ? DEPT_COLORS[item.department] ?? Colors.text.tertiary : Colors.text.tertiary;
  const hasOT = item.overtimeHours > 0;

  return (
    <View style={[styles.card, hasOT && styles.cardOT]}>
      <View style={styles.cardHeader}>
        <View style={[styles.deptBadge, { backgroundColor: deptColor + '20' }]}>
          <Text style={[styles.deptText, { color: deptColor }]}>{(item.department ?? 'general').toUpperCase()}</Text>
        </View>
        <Text style={styles.dateText}>{new Date(item.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
      </View>
      <View style={styles.timeRow}>
        <View style={styles.timeBlock}><Text style={styles.timeLabel}>Call</Text><Text style={styles.timeValue}>{item.callTime}</Text></View>
        <View style={styles.timeBlock}><Text style={styles.timeLabel}>Wrap</Text><Text style={styles.timeValue}>{item.wrapTime}</Text></View>
        {item.lunchStart && <View style={styles.timeBlock}><Text style={styles.timeLabel}>Lunch</Text><Text style={styles.timeValue}>{item.lunchStart}-{item.lunchEnd}</Text></View>}
      </View>
      <View style={styles.hoursRow}>
        <View style={styles.hourItem}><Text style={styles.hourValue}>{item.scheduledHours}h</Text><Text style={styles.hourLabel}>Scheduled</Text></View>
        <View style={styles.hourItem}><Text style={styles.hourValue}>{item.actualHours}h</Text><Text style={styles.hourLabel}>Actual</Text></View>
        <View style={styles.hourItem}>
          <Text style={[styles.hourValue, hasOT ? { color: Colors.status.warning } : {}]}>{item.overtimeHours}h</Text>
          <Text style={styles.hourLabel}>Overtime</Text>
          {hasOT && <AlertTriangle color={Colors.status.warning} size={10} style={{ marginTop: 2 }} />}
        </View>
      </View>
      {item.notes ? <Text style={styles.notesText}>{item.notes}</Text> : null}
    </View>
  );
}

export default function TimeTrackerScreen() {
  const { activeProject, activeProjectId } = useProjects();
  const entries = useProjectTimeEntries(activeProjectId);
  const router = useRouter();

  const summary = useMemo(() => {
    const totalScheduled = entries.reduce((s, e) => s + e.scheduledHours, 0);
    const totalActual = entries.reduce((s, e) => s + e.actualHours, 0);
    const totalOT = entries.reduce((s, e) => s + e.overtimeHours, 0);
    const deptOT: Record<string, number> = {};
    entries.forEach(e => { if (e.department && e.overtimeHours > 0) { deptOT[e.department] = (deptOT[e.department] ?? 0) + e.overtimeHours; } });
    return { totalScheduled, totalActual, totalOT, deptOT, entries: entries.length };
  }, [entries]);

  if (!activeProject) {
    return <View style={styles.empty}><AlertCircle color={Colors.text.tertiary} size={48} /><Text style={styles.emptyTitle}>No project selected</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Time Tracker' }} />
      {entries.length > 0 && (
        <View style={styles.summaryBar}>
          <View style={styles.summaryItem}><Text style={styles.summaryValue}>{summary.totalScheduled}h</Text><Text style={styles.summaryLabel}>Scheduled</Text></View>
          <View style={styles.summaryItem}><Text style={styles.summaryValue}>{summary.totalActual}h</Text><Text style={styles.summaryLabel}>Actual</Text></View>
          <View style={styles.summaryItem}><Text style={[styles.summaryValue, summary.totalOT > 0 ? { color: Colors.status.warning } : {}]}>{summary.totalOT}h</Text><Text style={styles.summaryLabel}>Overtime</Text></View>
        </View>
      )}
      <FlatList data={entries} keyExtractor={item => item.id} renderItem={({ item }) => <TimeCard item={item} />} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}
        ListEmptyComponent={<View style={styles.emptyInner}><Clock color={Colors.text.tertiary} size={48} /><Text style={styles.emptyTitle}>No time entries</Text><Text style={styles.emptySub}>Track hours and overtime per department</Text></View>}
      />
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/new-time-entry' as never)} activeOpacity={0.8}><Plus color={Colors.text.inverse} size={24} /></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  list: { padding: 16, paddingBottom: 100 },
  summaryBar: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: Colors.bg.secondary, borderBottomWidth: 0.5, borderBottomColor: Colors.border.subtle },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 20, fontWeight: '700', color: Colors.text.primary },
  summaryLabel: { fontSize: 9, color: Colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  card: { backgroundColor: Colors.bg.card, borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 0.5, borderColor: Colors.border.subtle },
  cardOT: { borderColor: Colors.status.warning + '40' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  deptBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  deptText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  dateText: { fontSize: 12, color: Colors.text.tertiary },
  timeRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  timeBlock: {},
  timeLabel: { fontSize: 10, color: Colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 0.5 },
  timeValue: { fontSize: 14, fontWeight: '600', color: Colors.text.primary, marginTop: 2 },
  hoursRow: { flexDirection: 'row', marginBottom: 8 },
  hourItem: { flex: 1, alignItems: 'center' },
  hourValue: { fontSize: 16, fontWeight: '700', color: Colors.text.primary },
  hourLabel: { fontSize: 9, color: Colors.text.tertiary, textTransform: 'uppercase', marginTop: 2 },
  notesText: { fontSize: 11, color: Colors.text.tertiary, fontStyle: 'italic', marginTop: 8 },
  empty: { flex: 1, backgroundColor: Colors.bg.primary, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyInner: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text.primary, marginTop: 16 },
  emptySub: { fontSize: 14, color: Colors.text.secondary, marginTop: 4, textAlign: 'center' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.accent.gold, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.accent.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
});
