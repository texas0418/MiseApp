import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useProjects } from '@/contexts/ProjectContext';
import { useLayout } from '@/utils/useLayout';
import Colors from '@/constants/colors';
import { SceneSelect, SelectRating } from '@/types';

export default function NewSelectScreen() {
  const { activeProjectId, addSceneSelect } = useProjects();
  const router = useRouter();
  const { isTablet, contentPadding } = useLayout();

  const [sceneNumber, setSceneNumber] = useState('');
  const [shotNumber, setShotNumber] = useState('');
  const [takeNumber, setTakeNumber] = useState('');
  const [rating, setRating] = useState<SelectRating>(4);
  const [isCircled, setIsCircled] = useState(false);
  const [isAlt, setIsAlt] = useState(false);
  const [editorNote, setEditorNote] = useState('');
  const [performanceNote, setPerformanceNote] = useState('');
  const [technicalNote, setTechnicalNote] = useState('');
  const [timecode, setTimecode] = useState('');

  const handleSave = () => {
    if (!sceneNumber.trim() || !shotNumber.trim() || !takeNumber.trim()) {
      Alert.alert('Required', 'Scene, shot, and take number are required.');
      return;
    }

    const select: SceneSelect = {
      id: Date.now().toString(),
      projectId: activeProjectId || '1',
      sceneNumber: parseInt(sceneNumber) || 0,
      shotNumber: shotNumber.trim(),
      takeNumber: parseInt(takeNumber) || 1,
      rating,
      isCircled,
      isAlt: isAlt && !isCircled,
      editorNote: editorNote.trim(),
      performanceNote: performanceNote.trim(),
      technicalNote: technicalNote.trim(),
      timecode: timecode.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    addSceneSelect(select);
    router.back();
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, {
          paddingHorizontal: contentPadding,
          maxWidth: isTablet ? 700 : undefined,
          alignSelf: isTablet ? 'center' as const : undefined,
          width: isTablet ? '100%' : undefined,
        }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Take Info</Text>

        <View style={styles.row}>
          <View style={styles.fieldThird}>
            <Text style={styles.label}>Scene #</Text>
            <TextInput style={styles.input} value={sceneNumber} onChangeText={setSceneNumber} placeholder="5" placeholderTextColor={Colors.text.tertiary} keyboardType="number-pad" />
          </View>
          <View style={styles.fieldThird}>
            <Text style={styles.label}>Shot #</Text>
            <TextInput style={styles.input} value={shotNumber} onChangeText={setShotNumber} placeholder="5A" placeholderTextColor={Colors.text.tertiary} />
          </View>
          <View style={styles.fieldThird}>
            <Text style={styles.label}>Take #</Text>
            <TextInput style={styles.input} value={takeNumber} onChangeText={setTakeNumber} placeholder="6" placeholderTextColor={Colors.text.tertiary} keyboardType="number-pad" />
          </View>
        </View>

        <Text style={styles.label}>Timecode (optional)</Text>
        <TextInput style={styles.input} value={timecode} onChangeText={setTimecode} placeholder="01:02:14:08" placeholderTextColor={Colors.text.tertiary} />

        <Text style={styles.sectionTitle}>Rating</Text>
        <View style={styles.ratingRow}>
          {([1, 2, 3, 4, 5] as SelectRating[]).map(r => (
            <TouchableOpacity key={r} onPress={() => setRating(r)} style={styles.ratingBtn}>
              <Star
                color={r <= rating ? Colors.accent.gold : Colors.bg.tertiary}
                fill={r <= rating ? Colors.accent.gold : 'transparent'}
                size={32}
              />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Status</Text>
        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={[styles.optionChip, isCircled && styles.circledChip]}
            onPress={() => { setIsCircled(!isCircled); if (!isCircled) setIsAlt(false); }}
          >
            <Text style={[styles.optionChipText, isCircled && { color: Colors.accent.gold }]}>⊙ Circle Select</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.optionChip, isAlt && !isCircled && styles.altChip]}
            onPress={() => { setIsAlt(!isAlt); if (!isAlt) setIsCircled(false); }}
          >
            <Text style={[styles.optionChipText, isAlt && !isCircled && { color: '#60A5FA' }]}>○ Alternate</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Notes for Editor</Text>

        <Text style={styles.label}>Editor Note *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={editorNote}
          onChangeText={setEditorNote}
          placeholder="How should this take be used in the cut? Any in/out points, things to watch for..."
          placeholderTextColor={Colors.text.tertiary}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Performance Note</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={performanceNote}
          onChangeText={setPerformanceNote}
          placeholder="What works about the performance in this take..."
          placeholderTextColor={Colors.text.tertiary}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Technical Note</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={technicalNote}
          onChangeText={setTechnicalNote}
          placeholder="Any focus, framing, or exposure issues..."
          placeholderTextColor={Colors.text.tertiary}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Add Select</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  scrollContent: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: '700' as const, color: Colors.accent.gold, marginTop: 20, marginBottom: 12, letterSpacing: 0.3 },
  label: { fontSize: 12, fontWeight: '600' as const, color: Colors.text.secondary, marginBottom: 6, marginTop: 12, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  input: { backgroundColor: Colors.bg.card, borderRadius: 10, padding: 14, fontSize: 15, color: Colors.text.primary, borderWidth: 0.5, borderColor: Colors.border.subtle },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 10 },
  fieldThird: { flex: 1 },
  ratingRow: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  ratingBtn: { padding: 4 },
  optionsRow: { flexDirection: 'row', gap: 10 },
  optionChip: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: Colors.bg.card, borderWidth: 0.5, borderColor: Colors.border.subtle, alignItems: 'center' },
  circledChip: { borderColor: Colors.accent.gold + '66', backgroundColor: Colors.accent.goldBg },
  altChip: { borderColor: '#60A5FA66', backgroundColor: '#60A5FA12' },
  optionChipText: { fontSize: 14, fontWeight: '600' as const, color: Colors.text.secondary },
  saveBtn: { backgroundColor: Colors.accent.gold, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  saveBtnText: { fontSize: 16, fontWeight: '700' as const, color: Colors.text.inverse },
});
