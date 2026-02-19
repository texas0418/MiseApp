import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronDown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useProjects } from '@/contexts/ProjectContext';
import Colors from '@/constants/colors';
import { Department } from '@/types';
import { DEPARTMENTS } from '@/mocks/data';

export default function NewCrewScreen() {
  const router = useRouter();
  const { addCrewMember } = useProjects();

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState<Department>('camera');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [showDepartments, setShowDepartments] = useState(false);

  const handleSave = useCallback(() => {
    if (!name.trim() || !role.trim()) {
      Alert.alert('Missing Info', 'Please enter name and role.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addCrewMember({
      id: Date.now().toString(),
      name: name.trim(),
      role: role.trim(),
      department,
      phone: phone.trim(),
      email: email.trim(),
    });
    router.back();
  }, [name, role, department, phone, email, addCrewMember, router]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.field}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Full name"
          placeholderTextColor={Colors.text.tertiary}
          testID="crew-name-input"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Role</Text>
        <TextInput
          style={styles.input}
          value={role}
          onChangeText={setRole}
          placeholder="e.g. Director of Photography"
          placeholderTextColor={Colors.text.tertiary}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Department</Text>
        <TouchableOpacity style={styles.selector} onPress={() => setShowDepartments(!showDepartments)} activeOpacity={0.7}>
          <Text style={styles.selectorText}>{DEPARTMENTS.find(d => d.value === department)?.label}</Text>
          <ChevronDown color={Colors.text.tertiary} size={18} />
        </TouchableOpacity>
        {showDepartments && (
          <View style={styles.optionsList}>
            {DEPARTMENTS.map(d => (
              <TouchableOpacity
                key={d.value}
                style={[styles.option, department === d.value && styles.optionActive]}
                onPress={() => { setDepartment(d.value as Department); setShowDepartments(false); }}
              >
                <Text style={[styles.optionText, department === d.value && styles.optionTextActive]}>{d.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="+1 555-0100"
          placeholderTextColor={Colors.text.tertiary}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="email@example.com"
          placeholderTextColor={Colors.text.tertiary}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8} testID="save-crew-button">
        <Text style={styles.saveButtonText}>Add Crew Member</Text>
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
});
