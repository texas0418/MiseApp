import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Plus, StickyNote, AlertCircle, Pin } from 'lucide-react-native';
import { useProjects, useProjectNotes } from '@/contexts/ProjectContext';
import Colors from '@/constants/colors';
import { ProductionNote, NoteCategory } from '@/types';

const CAT_COLORS: Record<NoteCategory, string> = {
  'general': Colors.text.secondary,
  'creative': '#E879F9',
  'technical': '#60A5FA',
  'logistics': '#4ADE80',
  'feedback': '#FB923C',
  'revision': '#F87171',
};

function NoteCard({ item }: { item: ProductionNote }) {
  const catColor = CAT_COLORS[item.category] ?? Colors.text.tertiary;
  const date = new Date(item.updatedAt);
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <View style={[styles.card, item.pinned && styles.cardPinned]}>
      <View style={styles.cardHeader}>
        <View style={[styles.catDot, { backgroundColor: catColor }]} />
        <Text style={styles.noteTitle} numberOfLines={1}>{item.title}</Text>
        {item.pinned && <Pin color={Colors.accent.gold} size={12} fill={Colors.accent.gold} />}
        <Text style={styles.dateText}>{dateStr}</Text>
      </View>
      <Text style={styles.noteContent} numberOfLines={3}>{item.content}</Text>
      <View style={styles.catBadge}>
        <Text style={[styles.catText, { color: catColor }]}>{item.category}</Text>
      </View>
    </View>
  );
}

export default function ProductionNotesScreen() {
  const { activeProject, activeProjectId } = useProjects();
  const notes = useProjectNotes(activeProjectId);
  const router = useRouter();

  const sorted = [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  if (!activeProject) {
    return (
      <View style={styles.emptyContainer}>
        <Stack.Screen options={{ title: 'Notes' }} />
        <AlertCircle color={Colors.text.tertiary} size={48} />
        <Text style={styles.emptyTitle}>No project selected</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Production Notes' }} />
      <View style={styles.statsBar}>
        <StickyNote color={Colors.accent.gold} size={16} />
        <Text style={styles.statsText}>{notes.length} note{notes.length !== 1 ? 's' : ''}</Text>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <NoteCard item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyInner}>
            <StickyNote color={Colors.text.tertiary} size={48} />
            <Text style={styles.emptyTitle}>No notes yet</Text>
            <Text style={styles.emptySubtitle}>Capture ideas, feedback, and memos</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/new-note' as never)} activeOpacity={0.8}>
        <Plus color={Colors.text.inverse} size={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  statsBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: Colors.bg.secondary, borderBottomWidth: 0.5, borderBottomColor: Colors.border.subtle, gap: 8 },
  statsText: { flex: 1, fontSize: 14, fontWeight: '600' as const, color: Colors.text.primary },
  list: { padding: 16, paddingBottom: 100 },
  card: { backgroundColor: Colors.bg.card, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 0.5, borderColor: Colors.border.subtle },
  cardPinned: { borderColor: Colors.accent.gold + '33', backgroundColor: Colors.accent.goldBg },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  catDot: { width: 6, height: 6, borderRadius: 3 },
  noteTitle: { flex: 1, fontSize: 15, fontWeight: '600' as const, color: Colors.text.primary },
  dateText: { fontSize: 11, color: Colors.text.tertiary },
  noteContent: { fontSize: 13, color: Colors.text.secondary, lineHeight: 19 },
  catBadge: { alignSelf: 'flex-start', marginTop: 8 },
  catText: { fontSize: 10, fontWeight: '600' as const, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.accent.gold, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.accent.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  emptyContainer: { flex: 1, backgroundColor: Colors.bg.primary, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyInner: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600' as const, color: Colors.text.primary, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: Colors.text.secondary, marginTop: 4, textAlign: 'center' },
});
