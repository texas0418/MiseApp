import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Stack } from 'expo-router';
import { ClipboardList, MapPin, Clock, Users, AlertCircle } from 'lucide-react-native';
import { useProjects, useProjectSchedule } from '@/contexts/ProjectContext';
import Colors from '@/constants/colors';

export default function CallSheetsScreen() {
  const { activeProject, activeProjectId, crew } = useProjects();
  const schedule = useProjectSchedule(activeProjectId);

  if (!activeProject) {
    return (
      <View style={styles.emptyContainer}>
        <Stack.Screen options={{ title: 'Call Sheets' }} />
        <AlertCircle color={Colors.text.tertiary} size={48} />
        <Text style={styles.emptyTitle}>No project selected</Text>
      </View>
    );
  }

  if (schedule.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Stack.Screen options={{ title: 'Call Sheets' }} />
        <ClipboardList color={Colors.text.tertiary} size={48} />
        <Text style={styles.emptyTitle}>No shoot days scheduled</Text>
        <Text style={styles.emptySubtitle}>Add shoot days in the Schedule tab first</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Stack.Screen options={{ title: 'Call Sheets' }} />

      {schedule.map(day => {
        const dateObj = new Date(day.date + 'T00:00:00');
        const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

        return (
          <View key={day.id} style={styles.callSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{activeProject.title}</Text>
              <Text style={styles.sheetSubtitle}>CALL SHEET - DAY {day.dayNumber}</Text>
            </View>

            <View style={styles.sheetSection}>
              <Text style={styles.sheetDate}>{dateStr}</Text>
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoCell}>
                <Clock color={Colors.status.active} size={14} />
                <Text style={styles.infoLabel}>CALL</Text>
                <Text style={styles.infoValue}>{day.callTime}</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoCell}>
                <Clock color={Colors.status.error} size={14} />
                <Text style={styles.infoLabel}>WRAP</Text>
                <Text style={styles.infoValue}>{day.wrapTime}</Text>
              </View>
            </View>

            <View style={styles.detailSection}>
              <View style={styles.detailRow}>
                <MapPin color={Colors.accent.gold} size={14} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>LOCATION</Text>
                  <Text style={styles.detailValue}>{day.location}</Text>
                </View>
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>SCENES</Text>
              <Text style={styles.scenesText}>{day.scenes}</Text>
            </View>

            {day.notes ? (
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>NOTES</Text>
                <Text style={styles.notesText}>{day.notes}</Text>
              </View>
            ) : null}

            <View style={styles.crewSection}>
              <View style={styles.crewHeader}>
                <Users color={Colors.accent.gold} size={14} />
                <Text style={styles.crewTitle}>CREW ({crew.length})</Text>
              </View>
              {crew.map(member => (
                <View key={member.id} style={styles.crewRow}>
                  <Text style={styles.crewName}>{member.name}</Text>
                  <Text style={styles.crewRole}>{member.role}</Text>
                  <Text style={styles.crewCall}>{day.callTime}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { padding: 16, paddingBottom: 40 },
  callSheet: { backgroundColor: Colors.bg.card, borderRadius: 16, marginBottom: 20, borderWidth: 0.5, borderColor: Colors.border.subtle, overflow: 'hidden' },
  sheetHeader: { backgroundColor: Colors.bg.elevated, padding: 16, borderBottomWidth: 0.5, borderBottomColor: Colors.border.subtle, alignItems: 'center' },
  sheetTitle: { fontSize: 18, fontWeight: '800' as const, color: Colors.text.primary, textTransform: 'uppercase' as const, letterSpacing: 1 },
  sheetSubtitle: { fontSize: 11, fontWeight: '700' as const, color: Colors.accent.gold, letterSpacing: 2, marginTop: 4 },
  sheetSection: { padding: 14, alignItems: 'center', borderBottomWidth: 0.5, borderBottomColor: Colors.border.subtle },
  sheetDate: { fontSize: 14, fontWeight: '600' as const, color: Colors.text.primary },
  infoGrid: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: Colors.border.subtle },
  infoCell: { flex: 1, alignItems: 'center', padding: 14, gap: 4 },
  infoDivider: { width: 0.5, backgroundColor: Colors.border.subtle },
  infoLabel: { fontSize: 9, fontWeight: '700' as const, color: Colors.text.tertiary, letterSpacing: 1 },
  infoValue: { fontSize: 16, fontWeight: '700' as const, color: Colors.text.primary },
  detailSection: { padding: 14, borderBottomWidth: 0.5, borderBottomColor: Colors.border.subtle },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  detailContent: { flex: 1 },
  detailLabel: { fontSize: 9, fontWeight: '700' as const, color: Colors.text.tertiary, letterSpacing: 1, marginBottom: 4 },
  detailValue: { fontSize: 14, color: Colors.text.primary, fontWeight: '500' as const },
  scenesText: { fontSize: 15, fontWeight: '600' as const, color: Colors.accent.goldLight },
  notesText: { fontSize: 13, color: Colors.text.secondary, lineHeight: 19 },
  crewSection: { padding: 14 },
  crewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  crewTitle: { fontSize: 9, fontWeight: '700' as const, color: Colors.text.tertiary, letterSpacing: 1 },
  crewRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: Colors.border.subtle },
  crewName: { flex: 2, fontSize: 13, fontWeight: '600' as const, color: Colors.text.primary },
  crewRole: { flex: 2, fontSize: 12, color: Colors.text.secondary },
  crewCall: { fontSize: 12, fontWeight: '600' as const, color: Colors.accent.gold, fontVariant: ['tabular-nums'] },
  emptyContainer: { flex: 1, backgroundColor: Colors.bg.primary, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '600' as const, color: Colors.text.primary, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: Colors.text.secondary, marginTop: 4, textAlign: 'center' },
});
