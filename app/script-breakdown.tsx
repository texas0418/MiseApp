import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Plus, FileText, MapPin, Clock, Users, Package, AlertCircle } from 'lucide-react-native';
import { useProjects, useProjectBreakdowns } from '@/contexts/ProjectContext';
import Colors from '@/constants/colors';
import { SceneBreakdown } from '@/types';

const TIME_COLORS: Record<string, string> = {
  'day': '#FBBF24',
  'night': '#60A5FA',
  'dawn': '#FB923C',
  'dusk': '#E879F9',
  'magic-hour': '#F472B6',
};

function BreakdownCard({ item }: { item: SceneBreakdown }) {
  const timeColor = TIME_COLORS[item.timeOfDay] ?? Colors.text.tertiary;

  return (
    <View style={styles.card} testID={`breakdown-${item.id}`}>
      <View style={styles.cardHeader}>
        <View style={styles.sceneNum}>
          <Text style={styles.sceneNumText}>{item.sceneNumber}</Text>
        </View>
        <View style={styles.cardHeaderText}>
          <Text style={styles.sceneName}>{item.sceneName}</Text>
          <View style={styles.tagRow}>
            <View style={[styles.tag, { backgroundColor: timeColor + '18' }]}>
              <Text style={[styles.tagText, { color: timeColor }]}>{item.intExt}</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: timeColor + '18' }]}>
              <Text style={[styles.tagText, { color: timeColor }]}>{item.timeOfDay.toUpperCase()}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{item.pageCount} pg</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.detailRow}>
          <MapPin color={Colors.text.tertiary} size={12} />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>

        {item.cast.length > 0 && (
          <View style={styles.detailRow}>
            <Users color={Colors.text.tertiary} size={12} />
            <Text style={styles.detailText}>{item.cast.join(', ')}</Text>
          </View>
        )}

        {item.props.length > 0 && (
          <View style={styles.detailRow}>
            <Package color={Colors.text.tertiary} size={12} />
            <Text style={styles.detailText}>{item.props.join(', ')}</Text>
          </View>
        )}

        {item.specialEquipment.length > 0 && (
          <View style={styles.equipRow}>
            {item.specialEquipment.map((eq, i) => (
              <View key={i} style={styles.equipBadge}>
                <Text style={styles.equipText}>{eq}</Text>
              </View>
            ))}
          </View>
        )}

        {item.notes ? (
          <Text style={styles.notes}>{item.notes}</Text>
        ) : null}
      </View>
    </View>
  );
}

export default function ScriptBreakdownScreen() {
  const { activeProject, activeProjectId } = useProjects();
  const breakdowns = useProjectBreakdowns(activeProjectId);
  const router = useRouter();

  const stats = useMemo(() => {
    const totalPages = breakdowns.reduce((sum, b) => {
      const parts = b.pageCount.split(' ');
      const whole = parseInt(parts[0]) || 0;
      return sum + whole;
    }, 0);
    return { scenes: breakdowns.length, pages: totalPages };
  }, [breakdowns]);

  if (!activeProject) {
    return (
      <View style={styles.emptyContainer}>
        <Stack.Screen options={{ title: 'Script Breakdown' }} />
        <AlertCircle color={Colors.text.tertiary} size={48} />
        <Text style={styles.emptyTitle}>No project selected</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Script Breakdown' }} />

      <View style={styles.statsBar}>
        <FileText color={Colors.accent.gold} size={16} />
        <Text style={styles.statsText}>{stats.scenes} scenes</Text>
        <Text style={styles.statsDetail}>~{stats.pages} pages</Text>
      </View>

      <FlatList
        data={breakdowns}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <BreakdownCard item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyInner}>
            <FileText color={Colors.text.tertiary} size={48} />
            <Text style={styles.emptyTitle}>No scenes broken down</Text>
            <Text style={styles.emptySubtitle}>Break down your script scene by scene</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/new-breakdown' as never)}
        activeOpacity={0.8}
      >
        <Plus color={Colors.text.inverse} size={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  statsBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: Colors.bg.secondary, borderBottomWidth: 0.5, borderBottomColor: Colors.border.subtle, gap: 8 },
  statsText: { flex: 1, fontSize: 14, fontWeight: '600' as const, color: Colors.text.primary },
  statsDetail: { fontSize: 12, color: Colors.text.tertiary },
  list: { padding: 16, paddingBottom: 100 },
  card: { backgroundColor: Colors.bg.card, borderRadius: 14, marginBottom: 12, borderWidth: 0.5, borderColor: Colors.border.subtle, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  sceneNum: { width: 44, height: 44, borderRadius: 10, backgroundColor: Colors.bg.elevated, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border.medium },
  sceneNumText: { fontSize: 18, fontWeight: '800' as const, color: Colors.accent.gold },
  cardHeaderText: { flex: 1 },
  sceneName: { fontSize: 15, fontWeight: '600' as const, color: Colors.text.primary, marginBottom: 4 },
  tagRow: { flexDirection: 'row', gap: 6 },
  tag: { backgroundColor: Colors.bg.elevated, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  tagText: { fontSize: 9, fontWeight: '700' as const, color: Colors.text.secondary, letterSpacing: 0.5 },
  cardBody: { paddingHorizontal: 14, paddingBottom: 14, gap: 6 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 12, color: Colors.text.secondary, flex: 1 },
  equipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  equipBadge: { backgroundColor: Colors.status.warning + '15', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, borderWidth: 0.5, borderColor: Colors.status.warning + '33' },
  equipText: { fontSize: 10, fontWeight: '600' as const, color: Colors.status.warning },
  notes: { fontSize: 11, color: Colors.text.tertiary, fontStyle: 'italic' as const, marginTop: 4 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.accent.gold, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.accent.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  emptyContainer: { flex: 1, backgroundColor: Colors.bg.primary, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyInner: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600' as const, color: Colors.text.primary, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: Colors.text.secondary, marginTop: 4, textAlign: 'center' },
});
