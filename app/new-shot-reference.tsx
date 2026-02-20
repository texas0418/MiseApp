import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useProjects } from '@/contexts/ProjectContext';
import Colors from '@/constants/colors';

export default function NewShotReferenceScreen() {
  const router = useRouter();
  const { activeProjectId, addShotReference } = useProjects();
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sceneNumber, setSceneNumber] = useState('');
  const [lightingStyle, setLightingStyle] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');

  const handleSave = () => {
    if (!title.trim() || !activeProjectId) return;
    addShotReference({
      id: Date.now().toString(),
      projectId: activeProjectId,
      title: title.trim(),
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&q=80',
      sceneNumber: sceneNumber ? parseInt(sceneNumber) : undefined,
      lightingStyle: lightingStyle.trim() || undefined,
      notes: notes.trim(),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    });
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'New Shot Reference' }} />
      <Text style={styles.label}>Title *</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Blade Runner alley lighting" placeholderTextColor={Colors.text.tertiary} />
      <Text style={styles.label}>Image URL</Text>
      <TextInput style={styles.input} value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." placeholderTextColor={Colors.text.tertiary} autoCapitalize="none" />
      <Text style={styles.label}>Scene Number</Text>
      <TextInput style={styles.input} value={sceneNumber} onChangeText={setSceneNumber} placeholder="Optional" placeholderTextColor={Colors.text.tertiary} keyboardType="number-pad" />
      <Text style={styles.label}>Lighting Style</Text>
      <TextInput style={styles.input} value={lightingStyle} onChangeText={setLightingStyle} placeholder="e.g. Natural dusk, Neon practicals" placeholderTextColor={Colors.text.tertiary} />
      <Text style={styles.label}>Tags (comma separated)</Text>
      <TextInput style={styles.input} value={tags} onChangeText={setTags} placeholder="e.g. wide, golden-hour, moody" placeholderTextColor={Colors.text.tertiary} />
      <Text style={styles.label}>Notes</Text>
      <TextInput style={[styles.input, styles.multiline]} value={notes} onChangeText={setNotes} placeholder="Reference notes..." placeholderTextColor={Colors.text.tertiary} multiline numberOfLines={3} />
      <TouchableOpacity style={[styles.saveBtn, !title.trim() && styles.saveBtnDisabled]} onPress={handleSave} disabled={!title.trim()}>
        <Text style={styles.saveBtnText}>Save Reference</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 12, fontWeight: '700', color: Colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6, marginTop: 16 },
  input: { backgroundColor: Colors.bg.input, borderRadius: 10, padding: 14, fontSize: 15, color: Colors.text.primary, borderWidth: 0.5, borderColor: Colors.border.subtle },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: Colors.accent.gold, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: Colors.text.inverse },
});
