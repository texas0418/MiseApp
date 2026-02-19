import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Plus, Trophy, AlertCircle, Calendar, DollarSign } from 'lucide-react-native';
import { useProjects, useProjectFestivals } from '@/contexts/ProjectContext';
import Colors from '@/constants/colors';
import { FestivalSubmission, FestivalStatus } from '@/types';

const STATUS_CONFIG: Record<FestivalStatus, { color: string; label: string }> = {
  'researching': { color: Colors.text.tertiary, label: 'Researching' },
  'submitted': { color: Colors.status.info, label: 'Submitted' },
  'accepted': { color: Colors.status.active, label: 'Accepted' },
  'rejected': { color: Colors.status.error, label: 'Rejected' },
  'screening': { color: Colors.accent.gold, label: 'Screening' },
  'awarded': { color: '#F59E0B', label: 'Awarded' },
};

function FestivalCard({ item }: { item: FestivalSubmission }) {
  const status = STATUS_CONFIG[item.status];
  const deadlineDate = item.deadline ? new Date(item.deadline + 'T00:00:00') : null;
  const isUrgent = deadlineDate ? (deadlineDate.getTime() - Date.now()) < 30 * 24 * 60 * 60 * 1000 : false;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Trophy color={status.color} size={18} />
          <View style={styles.headerText}>
            <Text style={styles.festName}>{item.festivalName}</Text>
            <Text style={styles.festLocation}>{item.location}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.color + '18' }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Calendar color={Colors.text.tertiary} size={12} />
          <Text style={[styles.infoText, isUrgent && { color: Colors.status.error }]}>
            Deadline: {item.deadline || 'TBD'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <DollarSign color={Colors.text.tertiary} size={12} />
          <Text style={styles.infoText}>Fee: ${item.fee}</Text>
        </View>
        {item.category ? (
          <View style={styles.catBadge}>
            <Text style={styles.catText}>{item.category}</Text>
          </View>
        ) : null}
        {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
      </View>
    </View>
  );
}

export default function FestivalTrackerScreen() {
  const { activeProject, activeProjectId } = useProjects();
  const festivals = useProjectFestivals(activeProjectId);
  const router = useRouter();

  const stats = useMemo(() => ({
    total: festivals.length,
    submitted: festivals.filter(f => f.status === 'submitted').length,
    accepted: festivals.filter(f => f.status === 'accepted' || f.status === 'screening' || f.status === 'awarded').length,
    totalFees: festivals.reduce((s, f) => s + f.fee, 0),
  }), [festivals]);

  if (!activeProject) {
    return (
      <View style={styles.emptyContainer}>
        <Stack.Screen options={{ title: 'Festivals' }} />
        <AlertCircle color={Colors.text.tertiary} size={48} />
        <Text style={styles.emptyTitle}>No project selected</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Festival Tracker' }} />

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Tracked</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: Colors.status.info }]}>{stats.submitted}</Text>
          <Text style={styles.statLabel}>Submitted</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: Colors.status.active }]}>{stats.accepted}</Text>
          <Text style={styles.statLabel}>Accepted</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: Colors.accent.gold }]}>${stats.totalFees}</Text>
          <Text style={styles.statLabel}>Fees</Text>
        </View>
      </View>

      <FlatList
        data={festivals}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <FestivalCard item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyInner}>
            <Trophy color={Colors.text.tertiary} size={48} />
            <Text style={styles.emptyTitle}>No festivals tracked</Text>
            <Text style={styles.emptySubtitle}>Track your festival submission strategy</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/new-festival' as never)} activeOpacity={0.8}>
        <Plus color={Colors.text.inverse} size={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  statBox: { flex: 1, backgroundColor: Colors.bg.card, borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 0.5, borderColor: Colors.border.subtle },
  statValue: { fontSize: 18, fontWeight: '700' as const, color: Colors.text.primary },
  statLabel: { fontSize: 9, color: Colors.text.tertiary, marginTop: 2, fontWeight: '600' as const, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  list: { padding: 16, paddingBottom: 100 },
  card: { backgroundColor: Colors.bg.card, borderRadius: 12, marginBottom: 10, borderWidth: 0.5, borderColor: Colors.border.subtle, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  headerText: { flex: 1 },
  festName: { fontSize: 15, fontWeight: '600' as const, color: Colors.text.primary },
  festLocation: { fontSize: 12, color: Colors.text.secondary, marginTop: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: '700' as const, letterSpacing: 0.5 },
  cardBody: { paddingHorizontal: 14, paddingBottom: 14, gap: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 12, color: Colors.text.secondary },
  catBadge: { alignSelf: 'flex-start', backgroundColor: Colors.bg.elevated, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  catText: { fontSize: 10, color: Colors.text.secondary, fontWeight: '600' as const },
  notes: { fontSize: 11, color: Colors.text.tertiary, fontStyle: 'italic' as const, marginTop: 4 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.accent.gold, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.accent.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  emptyContainer: { flex: 1, backgroundColor: Colors.bg.primary, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyInner: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600' as const, color: Colors.text.primary, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: Colors.text.secondary, marginTop: 4, textAlign: 'center' },
});
