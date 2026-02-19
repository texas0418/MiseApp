import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronDown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useProjects } from '@/contexts/ProjectContext';
import Colors from '@/constants/colors';
import { ShotType, ShotMovement, ShotStatus } from '@/types';
import { SHOT_TYPES, SHOT_MOVEMENTS } from '@/mocks/data';

export default function NewShotScreen() {
  const router = useRouter();
  const { addShot, activeProjectId, activeProject } = useProjects();

  const [sceneNumber, setSceneNumber] = useState('');
  const [shotNumber, setShotNumber] = useState('');
  const [type, setType] = useState<ShotType>('medium');
  const [movement, setMovement] = useState<ShotMovement>('static');
  const [lens, setLens] = useState('50mm');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [showTypes, setShowTypes] = useState(false);
  const [showMovements, setShowMovements] = useState(false);

  const handleSave = useCallback(() => {
    if (!activeProjectId) {
      Alert.alert('No Project', 'Please select a project first.');
      return;
    }
    if (!sceneNumber.trim() || !shotNumber.trim()) {
      Alert.alert('Missing Info', 'Please enter scene and shot numbers.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addShot({
      id: Date.now().toString(),
      projectId: activeProjectId,
      sceneNumber: parseInt(sceneNumber, 10) || 1,
      shotNumber: shotNumber.trim(),
      type,
      movement,
      lens: lens.trim() || '50mm',
      description: description.trim(),
      notes: notes.trim(),
      status: 'planned' as ShotStatus,
    });
    router.back();
  }, [activeProjectId, sceneNumber, shotNumber, type, movement, lens, description, notes, addShot, router]);

  if (!activeProject) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No project selected</Text>
        <Text style={styles.emptySubtitle}>Select a project from the Projects tab first</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.projectLabel}>
        <Text style={styles.projectLabelText}>Adding to: {activeProject.title}</Text>
      </View>

      <View style={styles.row}>
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={styles.label}>Scene #</Text>
          <TextInput
            style={styles.input}
            value={sceneNumber}
            onChangeText={setSceneNumber}
            placeholder="1"
            placeholderTextColor={Colors.text.tertiary}
            keyboardType="number-pad"
          />
        </View>
        <View style={{ width: 12 }} />
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={styles.label}>Shot #</Text>
          <TextInput
            style={styles.input}
            value={shotNumber}
            onChangeText={setShotNumber}
            placeholder="1A"
            placeholderTextColor={Colors.text.tertiary}
          />
        </View>
        <View style={{ width: 12 }} />
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={styles.label}>Lens</Text>
          <TextInput
            style={styles.input}
            value={lens}
            onChangeText={setLens}
            placeholder="50mm"
            placeholderTextColor={Colors.text.tertiary}
          />
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Shot Type</Text>
        <TouchableOpacity style={styles.selector} onPress={() => setShowTypes(!showTypes)} activeOpacity={0.7}>
          <Text style={styles.selectorText}>{SHOT_TYPES.find(t => t.value === type)?.label}</Text>
          <ChevronDown color={Colors.text.tertiary} size={18} />
        </TouchableOpacity>
        {showTypes && (
          <View style={styles.optionsList}>
            {SHOT_TYPES.map(t => (
              <TouchableOpacity
                key={t.value}
                style={[styles.option, type === t.value && styles.optionActive]}
                onPress={() => { setType(t.value as ShotType); setShowTypes(false); }}
              >
                <Text style={[styles.optionText, type === t.value && styles.optionTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Camera Movement</Text>
        <TouchableOpacity style={styles.selector} onPress={() => setShowMovements(!showMovements)} activeOpacity={0.7}>
          <Text style={styles.selectorText}>{SHOT_MOVEMENTS.find(m => m.value === movement)?.label}</Text>
          <ChevronDown color={Colors.text.tertiary} size={18} />
        </TouchableOpacity>
        {showMovements && (
          <View style={styles.optionsList}>
            {SHOT_MOVEMENTS.map(m => (
              <TouchableOpacity
                key={m.value}
                style={[styles.option, movement === m.value && styles.optionActive]}
                onPress={() => { setMovement(m.value as ShotMovement); setShowMovements(false); }}
              >
                <Text style={[styles.optionText, movement === m.value && styles.optionTextActive]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the shot"
          placeholderTextColor={Colors.text.tertiary}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={styles.input}
          value={notes}
          onChangeText={setNotes}
          placeholder="Additional notes"
          placeholderTextColor={Colors.text.tertiary}
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8} testID="save-shot-button">
        <Text style={styles.saveButtonText}>Add Shot</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  projectLabel: {
    backgroundColor: Colors.accent.goldBg,
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  projectLabelText: {
    fontSize: 13,
    color: Colors.accent.gold,
    fontWeight: '600' as const,
  },
  row: {
    flexDirection: 'row',
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.bg.input,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: Colors.text.primary,
    borderWidth: 0.5,
    borderColor: Colors.border.subtle,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 14,
  },
  selector: {
    backgroundColor: Colors.bg.input,
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: Colors.border.subtle,
  },
  selectorText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  optionsList: {
    backgroundColor: Colors.bg.elevated,
    borderRadius: 10,
    marginTop: 8,
    borderWidth: 0.5,
    borderColor: Colors.border.subtle,
    overflow: 'hidden',
  },
  option: {
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border.subtle,
  },
  optionActive: {
    backgroundColor: Colors.accent.goldBg,
  },
  optionText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  optionTextActive: {
    color: Colors.accent.gold,
    fontWeight: '600' as const,
  },
  saveButton: {
    backgroundColor: Colors.accent.gold,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.inverse,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
});
