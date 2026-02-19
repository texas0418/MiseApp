import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useProjects } from '@/contexts/ProjectContext';
import Colors from '@/constants/colors';

export default function NewContinuityScreen() {
  const router = useRouter();
  const { addContinuityNote, activeProjectId, activeProject } = useProjects();

  const [sceneNumber, setSceneNumber] = useState('');
  const [shotNumber, setShotNumber] = useState('');
  const [description, setDescription] = useState('');
  const [details, setDetails] = useState('');

  const handleSave = useCallback(() => {
    if (!activeProjectId) { Alert.alert('No Project', 'Select a project first.'); return; }
    if (!sceneNumber.trim() || !description.trim()) { Alert.alert('Missing Info', 'Enter scene number and description.'); return; }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addContinuityNote({
      id: Date.now().toString(),
      projectId: activeProjectId,
      sceneNumber: parseInt(sceneNumber, 10) || 1,
      shotNumber: shotNumber.trim() || '1A',
      description: description.trim(),
      details: details.trim(),
      timestamp: new Date().toISOString(),
    });
    router.back();
  }, [activeProjectId, sceneNumber, shotNumber, description, details, addContinuityNote, router]);

  if (!activeProject) {
    return (<View style={styles.emptyContainer}><Text style={styles.emptyTitle}>No project selected</Text></View>);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.projectLabel}>
        <Text style={styles.projectLabelText}>Continuity for: {activeProject.title}</Text>
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
        <Text style={styles.label}>What to track</Text>
        <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="e.g. Hair position, Prop placement" placeholderTextColor={Colors.text.tertiary} />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Details</Text>
        <TextInput style={[styles.input, styles.textArea]} value={details} onChangeText={setDetails} placeholder="Describe the exact state for continuity matching..." placeholderTextColor={Colors.text.tertiary} multiline numberOfLines={5} textAlignVertical="top" />
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
        <Text style={styles.saveButtonText}>Add Continuity Note</Text>
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
  textArea: { minHeight: 120, paddingTop: 14 },
  saveButton: { backgroundColor: Colors.accent.gold, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 12 },
  saveButtonText: { fontSize: 16, fontWeight: '700' as const, color: Colors.text.inverse },
  emptyContainer: { flex: 1, backgroundColor: Colors.bg.primary, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '600' as const, color: Colors.text.primary },
});
