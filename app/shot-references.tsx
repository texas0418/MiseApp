import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Plus, Image as ImageIcon, AlertCircle, Tag } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useProjects, useProjectShotReferences } from '@/contexts/ProjectContext';
import Colors from '@/constants/colors';
import { ShotReference } from '@/types';

function ReferenceCard({ item }: { item: ShotReference }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.refImage} contentFit="cover" />
      <View style={styles.overlay}>
        <Text style={styles.refTitle} numberOfLines={2}>{item.title}</Text>
        {item.sceneNumber && <Text style={styles.refScene}>Sc. {item.sceneNumber}</Text>}
      </View>
      <View style={styles.cardBody}>
        <View style={styles.tagRow}>
          {item.tags.slice(0, 3).map(tag => (
            <View key={tag} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
          ))}
        </View>
        {item.lightingStyle ? <Text style={styles.lightingText}>🔦 {item.lightingStyle}</Text> : null}
        {item.notes ? <Text style={styles.notesText} numberOfLines={2}>{item.notes}</Text> : null}
      </View>
    </View>
  );
}

export default function ShotReferencesScreen() {
  const { activeProject, activeProjectId } = useProjects();
  const references = useProjectShotReferences(activeProjectId);
  const router = useRouter();

  const grouped = useMemo(() => {
    const byScene: Record<string, ShotReference[]> = { 'General': [] };
    references.forEach(ref => {
      const key = ref.sceneNumber ? `Scene ${ref.sceneNumber}` : 'General';
      if (!byScene[key]) byScene[key] = [];
      byScene[key].push(ref);
    });
    return Object.entries(byScene).filter(([, items]) => items.length > 0);
  }, [references]);

  if (!activeProject) {
    return (
      <View style={styles.empty}><AlertCircle color={Colors.text.tertiary} size={48} /><Text style={styles.emptyTitle}>No project selected</Text></View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Shot References' }} />
      <FlatList
        data={references}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ReferenceCard item={item} />}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{references.length} Reference{references.length !== 1 ? 's' : ''}</Text>
            <Text style={styles.headerSub}>Visual references for {activeProject.title}</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyInner}><ImageIcon color={Colors.text.tertiary} size={48} /><Text style={styles.emptyTitle}>No references yet</Text><Text style={styles.emptySub}>Add stills and references for your shots</Text></View>
        }
      />
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/new-shot-reference' as never)} activeOpacity={0.8}>
        <Plus color={Colors.text.inverse} size={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  list: { padding: 12, paddingBottom: 100 },
  row: { gap: 10 },
  header: { paddingHorizontal: 4, paddingBottom: 16 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text.primary },
  headerSub: { fontSize: 13, color: Colors.text.secondary, marginTop: 2 },
  card: { flex: 1, backgroundColor: Colors.bg.card, borderRadius: 12, overflow: 'hidden', marginBottom: 10, borderWidth: 0.5, borderColor: Colors.border.subtle },
  refImage: { width: '100%', height: 140 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, height: 140, justifyContent: 'flex-end', padding: 10, backgroundColor: 'rgba(0,0,0,0.35)' },
  refTitle: { fontSize: 13, fontWeight: '700', color: '#fff' },
  refScene: { fontSize: 10, color: '#ddd', marginTop: 2 },
  cardBody: { padding: 10 },
  tagRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap', marginBottom: 6 },
  tag: { backgroundColor: Colors.bg.elevated, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  tagText: { fontSize: 9, color: Colors.text.secondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  lightingText: { fontSize: 11, color: Colors.accent.gold, marginBottom: 4 },
  notesText: { fontSize: 11, color: Colors.text.tertiary, fontStyle: 'italic' },
  empty: { flex: 1, backgroundColor: Colors.bg.primary, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyInner: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text.primary, marginTop: 16 },
  emptySub: { fontSize: 14, color: Colors.text.secondary, marginTop: 4, textAlign: 'center' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.accent.gold, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.accent.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
});
