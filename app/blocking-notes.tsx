import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Plus, Move, AlertCircle, Camera, Users } from 'lucide-react-native';
import { useProjects, useProjectBlockingNotes } from '@/contexts/ProjectContext';
import Colors from '@/constants/colors';
import { BlockingNote } from '@/types';

function BlockingCard({ item }: { item: BlockingNote }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.sceneBadge}><Text style={styles.sceneBadgeText}>Scene {item.sceneNumber}</Text></View>
        <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <View style={styles.detailSection}>
        <View style={styles.detailRow}><Users color={Colors.status.info} size={14} /><Text style={styles.detailLabel}>Actors:</Text><Text style={styles.detailText}>{item.actorPositions}</Text></View>
        <View style={styles.detailRow}><Camera color={Colors.accent.gold} size={14} /><Text style={styles.detailLabel}>Camera:</Text><Text style={styles.detailText}>{item.cameraPosition}</Text></View>
        <View style={styles.detailRow}><Move color={Colors.status.active} size={14} /><Text style={styles.detailLabel}>Movement:</Text><Text style={styles.detailText}>{item.movementNotes}</Text></View>
      </View>
      {item.notes ? <Text style={styles.notesText}>📝 {item.notes}</Text> : null}
    </View>
  );
}

export default function BlockingNotesScreen() {
  const { activeProject, activeProjectId } = useProjects();
  const notes = useProjectBlockingNotes(activeProjectId);
  const router = useRouter();

  if (!activeProject) {
    return <View style={styles.empty}><AlertCircle color={Colors.text.tertiary} size={48} /><Text style={styles.emptyTitle}>No project selected</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Blocking & Rehearsal' }} />
      <FlatList data={notes} keyExtractor={item => item.id} renderItem={({ item }) => <BlockingCard item={item} />} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}
        ListEmptyComponent={<View style={styles.emptyInner}><Move color={Colors.text.tertiary} size={48} /><Text style={styles.emptyTitle}>No blocking notes</Text><Text style={styles.emptySub}>Plan actor positions and camera staging</Text></View>}
      />
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/new-blocking-note' as never)} activeOpacity={0.8}><Plus color={Colors.text.inverse} size={24} /></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  list: { padding: 16, paddingBottom: 100 },
  card: { backgroundColor: Colors.bg.card, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 0.5, borderColor: Colors.border.subtle },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sceneBadge: { backgroundColor: Colors.status.info + '18', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  sceneBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.status.info },
  dateText: { fontSize: 12, color: Colors.text.tertiary },
  title: { fontSize: 16, fontWeight: '700', color: Colors.text.primary, marginBottom: 6 },
  description: { fontSize: 13, color: Colors.text.secondary, lineHeight: 20, marginBottom: 12 },
  detailSection: { gap: 8, marginBottom: 10 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  detailLabel: { fontSize: 11, fontWeight: '700', color: Colors.text.tertiary, width: 65 },
  detailText: { fontSize: 12, color: Colors.text.primary, flex: 1, lineHeight: 18 },
  notesText: { fontSize: 12, color: Colors.accent.goldLight, marginTop: 8, fontStyle: 'italic' },
  empty: { flex: 1, backgroundColor: Colors.bg.primary, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyInner: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text.primary, marginTop: 16 },
  emptySub: { fontSize: 14, color: Colors.text.secondary, marginTop: 4, textAlign: 'center' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.accent.gold, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.accent.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
});
