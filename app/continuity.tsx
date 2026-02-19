import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Plus, BookOpen, AlertCircle } from 'lucide-react-native';
import { useProjects, useProjectContinuity } from '@/contexts/ProjectContext';
import Colors from '@/constants/colors';
import { ContinuityNote } from '@/types';

function ContinuityCard({ item }: { item: ContinuityNote }) {
  const time = new Date(item.timestamp);
  const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.card} testID={`continuity-${item.id}`}>
      <View style={styles.cardHeader}>
        <View style={styles.sceneBadge}>
          <Text style={styles.sceneBadgeText}>Sc.{item.sceneNumber} / {item.shotNumber}</Text>
        </View>
        <Text style={styles.timeText}>{timeStr}</Text>
      </View>
      <Text style={styles.descText}>{item.description}</Text>
      <Text style={styles.detailsText}>{item.details}</Text>
    </View>
  );
}

export default function ContinuityScreen() {
  const { activeProject, activeProjectId } = useProjects();
  const notes = useProjectContinuity(activeProjectId);
  const router = useRouter();

  const sorted = useMemo(() => {
    return [...notes].sort((a, b) => a.sceneNumber - b.sceneNumber || a.shotNumber.localeCompare(b.shotNumber));
  }, [notes]);

  if (!activeProject) {
    return (
      <View style={styles.emptyContainer}>
        <Stack.Screen options={{ title: 'Continuity' }} />
        <AlertCircle color={Colors.text.tertiary} size={48} />
        <Text style={styles.emptyTitle}>No project selected</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Continuity Notes' }} />
      <View style={styles.statsBar}>
        <BookOpen color={Colors.accent.gold} size={16} />
        <Text style={styles.statsText}>{notes.length} note{notes.length !== 1 ? 's' : ''}</Text>
        <Text style={styles.statsDetail}>{activeProject.title}</Text>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ContinuityCard item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyInner}>
            <BookOpen color={Colors.text.tertiary} size={48} />
            <Text style={styles.emptyTitle}>No continuity notes</Text>
            <Text style={styles.emptySubtitle}>Track wardrobe, props, and details between takes</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/new-continuity' as never)} activeOpacity={0.8}>
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
  card: { backgroundColor: Colors.bg.card, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 0.5, borderColor: Colors.border.subtle },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sceneBadge: { backgroundColor: Colors.accent.goldBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  sceneBadgeText: { fontSize: 12, fontWeight: '700' as const, color: Colors.accent.gold, fontVariant: ['tabular-nums'] },
  timeText: { fontSize: 11, color: Colors.text.tertiary, fontVariant: ['tabular-nums'] },
  descText: { fontSize: 14, fontWeight: '600' as const, color: Colors.text.primary, marginBottom: 4 },
  detailsText: { fontSize: 13, color: Colors.text.secondary, lineHeight: 19 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.accent.gold, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.accent.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  emptyContainer: { flex: 1, backgroundColor: Colors.bg.primary, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyInner: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600' as const, color: Colors.text.primary, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: Colors.text.secondary, marginTop: 4, textAlign: 'center' },
});
