import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Plus, Paintbrush, AlertCircle } from 'lucide-react-native';
import { useProjects, useProjectColorReferences } from '@/contexts/ProjectContext';
import Colors from '@/constants/colors';
import { ColorReference, LUTStyle } from '@/types';
import { LUT_STYLES } from '@/mocks/data';

function ColorSwatch({ color, size = 24 }: { color: string; size?: number }) {
  return <View style={[styles.swatch, { backgroundColor: color, width: size, height: size, borderRadius: size / 4 }]} />;
}

function LutPreview({ lutStyle }: { lutStyle: LUTStyle }) {
  const lut = LUT_STYLES.find(l => l.value === lutStyle);
  if (!lut) return null;
  return (
    <View style={styles.lutPreview}>
      {lut.colors.map((c, i) => <View key={i} style={[styles.lutBar, { backgroundColor: c }]} />)}
    </View>
  );
}

function ColorRefCard({ item }: { item: ColorReference }) {
  const lut = LUT_STYLES.find(l => l.value === item.lutStyle);
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitle}>{item.name}</Text>
          {item.sceneNumber && <Text style={styles.sceneText}>Scene {item.sceneNumber}</Text>}
        </View>
        <LutPreview lutStyle={item.lutStyle} />
      </View>
      <View style={styles.paletteRow}>
        <View style={styles.paletteItem}><ColorSwatch color={item.primaryColor} size={32} /><Text style={styles.paletteLabel}>Primary</Text></View>
        <View style={styles.paletteItem}><ColorSwatch color={item.secondaryColor} size={32} /><Text style={styles.paletteLabel}>Secondary</Text></View>
        <View style={styles.paletteItem}><ColorSwatch color={item.accentColor} size={32} /><Text style={styles.paletteLabel}>Accent</Text></View>
      </View>
      <View style={styles.attributeRow}>
        <View style={styles.attrChip}><Text style={styles.attrText}>{item.contrast} contrast</Text></View>
        <View style={styles.attrChip}><Text style={styles.attrText}>{item.saturation}</Text></View>
        <View style={styles.attrChip}><Text style={styles.attrText}>{item.temperature}</Text></View>
      </View>
      {lut && <Text style={styles.lutLabel}>LUT: {lut.label} — {lut.description}</Text>}
      {item.referenceFilm && <Text style={styles.refFilm}>🎬 Ref: {item.referenceFilm}</Text>}
      {item.notes ? <Text style={styles.notesText}>{item.notes}</Text> : null}
    </View>
  );
}

export default function ColorReferencesScreen() {
  const { activeProject, activeProjectId } = useProjects();
  const refs = useProjectColorReferences(activeProjectId);
  const router = useRouter();
  const [showGuide, setShowGuide] = useState(false);

  if (!activeProject) {
    return <View style={styles.empty}><AlertCircle color={Colors.text.tertiary} size={48} /><Text style={styles.emptyTitle}>No project selected</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Color & LUT Reference' }} />
      <TouchableOpacity style={styles.guideToggle} onPress={() => setShowGuide(!showGuide)}>
        <Text style={styles.guideToggleText}>{showGuide ? 'Hide' : 'Show'} LUT Style Guide</Text>
      </TouchableOpacity>
      {showGuide && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.guideScroll} contentContainerStyle={styles.guideContent}>
          {LUT_STYLES.map(lut => (
            <View key={lut.value} style={styles.guideCard}>
              <View style={styles.guideColors}>{lut.colors.map((c, i) => <View key={i} style={[styles.guideColorBar, { backgroundColor: c }]} />)}</View>
              <Text style={styles.guideName}>{lut.label}</Text>
              <Text style={styles.guideDesc}>{lut.description}</Text>
            </View>
          ))}
        </ScrollView>
      )}
      <FlatList data={refs} keyExtractor={item => item.id} renderItem={({ item }) => <ColorRefCard item={item} />} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}
        ListEmptyComponent={<View style={styles.emptyInner}><Paintbrush color={Colors.text.tertiary} size={48} /><Text style={styles.emptyTitle}>No color references</Text><Text style={styles.emptySub}>Define the visual look per scene</Text></View>}
      />
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/new-color-reference' as never)} activeOpacity={0.8}><Plus color={Colors.text.inverse} size={24} /></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  list: { padding: 16, paddingBottom: 100 },
  guideToggle: { padding: 12, alignItems: 'center', backgroundColor: Colors.bg.secondary, borderBottomWidth: 0.5, borderBottomColor: Colors.border.subtle },
  guideToggleText: { fontSize: 13, fontWeight: '600', color: Colors.accent.gold },
  guideScroll: { maxHeight: 140, backgroundColor: Colors.bg.secondary },
  guideContent: { padding: 12, gap: 10 },
  guideCard: { width: 120, backgroundColor: Colors.bg.card, borderRadius: 10, padding: 10, borderWidth: 0.5, borderColor: Colors.border.subtle },
  guideColors: { flexDirection: 'row', height: 30, borderRadius: 6, overflow: 'hidden', marginBottom: 6 },
  guideColorBar: { flex: 1 },
  guideName: { fontSize: 12, fontWeight: '700', color: Colors.text.primary },
  guideDesc: { fontSize: 9, color: Colors.text.tertiary, marginTop: 2 },
  card: { backgroundColor: Colors.bg.card, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 0.5, borderColor: Colors.border.subtle },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.text.primary },
  sceneText: { fontSize: 11, color: Colors.text.tertiary, marginTop: 2 },
  lutPreview: { flexDirection: 'row', width: 60, height: 20, borderRadius: 4, overflow: 'hidden' },
  lutBar: { flex: 1 },
  paletteRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  paletteItem: { alignItems: 'center', gap: 4 },
  paletteLabel: { fontSize: 9, color: Colors.text.tertiary, textTransform: 'uppercase' },
  swatch: { borderWidth: 1, borderColor: Colors.border.subtle },
  attributeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 10 },
  attrChip: { backgroundColor: Colors.bg.elevated, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  attrText: { fontSize: 10, color: Colors.text.secondary, fontWeight: '600', textTransform: 'capitalize' },
  lutLabel: { fontSize: 11, color: Colors.text.secondary, marginBottom: 6 },
  refFilm: { fontSize: 12, color: Colors.accent.goldLight, marginBottom: 4 },
  notesText: { fontSize: 12, color: Colors.text.tertiary, fontStyle: 'italic', marginTop: 4, lineHeight: 18 },
  empty: { flex: 1, backgroundColor: Colors.bg.primary, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyInner: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text.primary, marginTop: 16 },
  emptySub: { fontSize: 14, color: Colors.text.secondary, marginTop: 4, textAlign: 'center' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.accent.gold, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.accent.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
});
