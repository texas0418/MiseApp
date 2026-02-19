import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Plus, Palette, AlertCircle } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useProjects, useProjectMoodBoard } from '@/contexts/ProjectContext';
import Colors from '@/constants/colors';
import { MoodBoardItem } from '@/types';

function MoodBoardCard({ item }: { item: MoodBoardItem }) {
  if (item.type === 'color') {
    return (
      <View style={styles.colorCard}>
        <View style={[styles.colorSwatch, { backgroundColor: item.color ?? '#333' }]} />
        <Text style={styles.colorLabel}>{item.label}</Text>
        <Text style={styles.colorHex}>{item.color}</Text>
      </View>
    );
  }

  if (item.type === 'reference' && item.imageUrl) {
    return (
      <View style={styles.refCard}>
        <Image source={{ uri: item.imageUrl }} style={styles.refImage} contentFit="cover" />
        <View style={styles.refOverlay}>
          <Text style={styles.refLabel}>{item.label}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.noteCard}>
      <Text style={styles.noteLabel}>{item.label}</Text>
      <Text style={styles.noteText}>{item.note}</Text>
    </View>
  );
}

export default function MoodBoardsScreen() {
  const { activeProject, activeProjectId } = useProjects();
  const items = useProjectMoodBoard(activeProjectId);
  const router = useRouter();

  const boards = useMemo(() => {
    const grouped: Record<string, MoodBoardItem[]> = {};
    items.forEach(item => {
      if (!grouped[item.boardName]) grouped[item.boardName] = [];
      grouped[item.boardName].push(item);
    });
    return Object.entries(grouped).map(([name, boardItems]) => ({ name, items: boardItems }));
  }, [items]);

  if (!activeProject) {
    return (
      <View style={styles.emptyContainer}>
        <Stack.Screen options={{ title: 'Mood Boards' }} />
        <AlertCircle color={Colors.text.tertiary} size={48} />
        <Text style={styles.emptyTitle}>No project selected</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Mood Boards' }} />

      <FlatList
        data={boards}
        keyExtractor={item => item.name}
        renderItem={({ item: board }) => (
          <View style={styles.boardSection}>
            <Text style={styles.boardTitle}>{board.name}</Text>
            <View style={styles.boardGrid}>
              {board.items.map(item => (
                <MoodBoardCard key={item.id} item={item} />
              ))}
            </View>
          </View>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyInner}>
            <Palette color={Colors.text.tertiary} size={48} />
            <Text style={styles.emptyTitle}>No mood boards</Text>
            <Text style={styles.emptySubtitle}>Build visual reference boards for your film</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/new-mood-item' as never)} activeOpacity={0.8}>
        <Plus color={Colors.text.inverse} size={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  list: { padding: 16, paddingBottom: 100 },
  boardSection: { marginBottom: 24 },
  boardTitle: { fontSize: 16, fontWeight: '700' as const, color: Colors.text.primary, marginBottom: 12, letterSpacing: -0.3 },
  boardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorCard: { width: '30%' as unknown as number, flexGrow: 0, flexShrink: 0, flexBasis: '30%', backgroundColor: Colors.bg.card, borderRadius: 12, overflow: 'hidden', borderWidth: 0.5, borderColor: Colors.border.subtle },
  colorSwatch: { height: 60, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  colorLabel: { fontSize: 11, fontWeight: '600' as const, color: Colors.text.primary, paddingHorizontal: 8, paddingTop: 6 },
  colorHex: { fontSize: 9, color: Colors.text.tertiary, paddingHorizontal: 8, paddingBottom: 8, fontVariant: ['tabular-nums'] },
  refCard: { width: '47%' as unknown as number, flexGrow: 0, flexShrink: 0, flexBasis: '47%', height: 140, borderRadius: 12, overflow: 'hidden', borderWidth: 0.5, borderColor: Colors.border.subtle },
  refImage: { width: '100%', height: '100%' },
  refOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 8, backgroundColor: 'rgba(0,0,0,0.6)' },
  refLabel: { fontSize: 11, fontWeight: '600' as const, color: '#fff' },
  noteCard: { width: '100%' as unknown as number, backgroundColor: Colors.bg.card, borderRadius: 12, padding: 14, borderWidth: 0.5, borderColor: Colors.border.subtle, borderLeftWidth: 3, borderLeftColor: Colors.accent.gold },
  noteLabel: { fontSize: 13, fontWeight: '600' as const, color: Colors.text.primary, marginBottom: 4 },
  noteText: { fontSize: 12, color: Colors.text.secondary, lineHeight: 18 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.accent.gold, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.accent.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  emptyContainer: { flex: 1, backgroundColor: Colors.bg.primary, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyInner: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600' as const, color: Colors.text.primary, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: Colors.text.secondary, marginTop: 4, textAlign: 'center' },
});
