import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronDown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useProjects } from '@/contexts/ProjectContext';
import Colors from '@/constants/colors';
import { VFXComplexity } from '@/types';

const COMPLEXITY_OPTIONS: { label: string; value: VFXComplexity }[] = [
  { label: 'Simple', value: 'simple' },
  { label: 'Moderate', value: 'moderate' },
  { label: 'Complex', value: 'complex' },
  { label: 'Hero Shot', value: 'hero' },
];

export default function NewVFXScreen() {
  const router = useRouter();
  const { addVFXShot, activeProjectId, activeProject } = useProjects();

  const [sceneNumber, setSceneNumber] = useState('');
  const [shotNumber, setShotNumber] = useState('');
  const [description, setDescription] = useState('');
  const [complexity, setComplexity] = useState<VFXComplexity>('moderate');
  const [vendor, setVendor] = useState('');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [showComplexity, setShowComplexity] = useState(false);

  const handleSave = useCallback(() => {
    if (!activeProjectId) { Alert.alert('No Project', 'Select a project first.'); return; }
    if (!sceneNumber.trim() || !description.trim()) { Alert.alert('Missing Info', 'Enter scene number and description.'); return; }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addVFXShot({
      id: Date.now().toString(),
      projectId: activeProjectId,
      sceneNumber: parseInt(sceneNumber, 10) || 1,
      shotNumber: shotNumber.trim() || '1A',
      description: description.trim(),
      complexity,
      status: 'pending',
      vendor: vendor.trim(),
      deadline: deadline.trim(),
      notes: notes.trim(),
      estimatedCost: parseFloat(estimatedCost) || 0,
    });
    router.back();
  }, [activeProjectId, sceneNumber, shotNumber, description, complexity, vendor, deadline, notes, estimatedCost, addVFXShot, router]);

  if (!activeProject) {
    return (<View style={styles.emptyContainer}><Text style={styles.emptyTitle}>No project selected</Text></View>);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.projectLabel}>
        <Text style={styles.projectLabelText}>VFX for: {activeProject.title}</Text>
      </View>
      <View style={styles.row}>
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={styles.label}>Scene #</Text>
          <TextInput style={styles.input} value={sceneNumber} onChangeText={setSceneNumber} placeholder="1" placeholderTextColor={Colors.text.tertiary} keyboardType="number-pad" />
        </View>
        <View style={{ width: 12 }} />
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={styles.label}>Shot #</Text>
          <TextInput style={styles.input} value={shotNumber} onChangeText={setShotNumber} placeholder="1A" placeholderTextColor={Colors.text.tertiary} />
        </View>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Describe the VFX work needed" placeholderTextColor={Colors.text.tertiary} multiline numberOfLines={3} textAlignVertical="top" />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Complexity</Text>
        <TouchableOpacity style={styles.selector} onPress={() => setShowComplexity(!showComplexity)}>
          <Text style={styles.selectorText}>{COMPLEXITY_OPTIONS.find(c => c.value === complexity)?.label}</Text>
          <ChevronDown color={Colors.text.tertiary} size={18} />
        </TouchableOpacity>
        {showComplexity && (
          <View style={styles.optionsList}>
            {COMPLEXITY_OPTIONS.map(c => (
              <TouchableOpacity key={c.value} style={[styles.option, complexity === c.value && styles.optionActive]} onPress={() => { setComplexity(c.value); setShowComplexity(false); }}>
                <Text style={[styles.optionText, complexity === c.value && styles.optionTextActive]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Vendor</Text>
        <TextInput style={styles.input} value={vendor} onChangeText={setVendor} placeholder="VFX vendor name" placeholderTextColor={Colors.text.tertiary} />
      </View>
      <View style={styles.row}>
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={styles.label}>Deadline</Text>
          <TextInput style={styles.input} value={deadline} onChangeText={setDeadline} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.text.tertiary} />
        </View>
        <View style={{ width: 12 }} />
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={styles.label}>Est. Cost ($)</Text>
          <TextInput style={styles.input} value={estimatedCost} onChangeText={setEstimatedCost} placeholder="0" placeholderTextColor={Colors.text.tertiary} keyboardType="decimal-pad" />
        </View>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Notes</Text>
        <TextInput style={styles.input} value={notes} onChangeText={setNotes} placeholder="Reference notes, style guidance..." placeholderTextColor={Colors.text.tertiary} />
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
        <Text style={styles.saveButtonText}>Add VFX Shot</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { padding: 20, paddingBottom: 40 },
  projectLabel: { backgroundColor: Colors.accent.goldBg, borderRadius: 8, padding: 10, marginBottom: 20 },
  projectLabelText: { fontSize: 13, color: Colors.accent.gold, fontWeight: '600' as const },
  row: { flexDirection: 'row' },
  field: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '600' as const, color: Colors.text.secondary, textTransform: 'uppercase' as const, letterSpacing: 0.8, marginBottom: 8 },
  input: { backgroundColor: Colors.bg.input, borderRadius: 10, padding: 14, fontSize: 16, color: Colors.text.primary, borderWidth: 0.5, borderColor: Colors.border.subtle },
  textArea: { minHeight: 80, paddingTop: 14 },
  selector: { backgroundColor: Colors.bg.input, borderRadius: 10, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 0.5, borderColor: Colors.border.subtle },
  selectorText: { fontSize: 16, color: Colors.text.primary },
  optionsList: { backgroundColor: Colors.bg.elevated, borderRadius: 10, marginTop: 8, borderWidth: 0.5, borderColor: Colors.border.subtle, overflow: 'hidden' },
  option: { padding: 12, borderBottomWidth: 0.5, borderBottomColor: Colors.border.subtle },
  optionActive: { backgroundColor: Colors.accent.goldBg },
  optionText: { fontSize: 14, color: Colors.text.secondary },
  optionTextActive: { color: Colors.accent.gold, fontWeight: '600' as const },
  saveButton: { backgroundColor: Colors.accent.gold, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 12 },
  saveButtonText: { fontSize: 16, fontWeight: '700' as const, color: Colors.text.inverse },
  emptyContainer: { flex: 1, backgroundColor: Colors.bg.primary, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '600' as const, color: Colors.text.primary },
});
