import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, MapPin, Clock, FileText, CalendarDays, AlertCircle } from 'lucide-react-native';
import { useProjects, useProjectSchedule } from '@/contexts/ProjectContext';
import Colors from '@/constants/colors';
import { ScheduleDay } from '@/types';

function ScheduleCard({ day }: { day: ScheduleDay }) {
  const dateObj = new Date(day.date + 'T00:00:00');
  const monthShort = dateObj.toLocaleDateString('en-US', { month: 'short' });
  const dayNum = dateObj.getDate();
  const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

  return (
    <View style={styles.scheduleCard} testID={`schedule-card-${day.id}`}>
      <View style={styles.dateBlock}>
        <Text style={styles.dateMonth}>{monthShort.toUpperCase()}</Text>
        <Text style={styles.dateDay}>{dayNum}</Text>
        <Text style={styles.dateWeekday}>{weekday}</Text>
      </View>
      <View style={styles.cardDivider} />
      <View style={styles.cardContent}>
        <View style={styles.dayHeader}>
          <Text style={styles.dayLabel}>Day {day.dayNumber}</Text>
          <Text style={styles.scenes}>{day.scenes}</Text>
        </View>

        <View style={styles.detailRow}>
          <MapPin color={Colors.accent.goldDim} size={13} />
          <Text style={styles.detailText}>{day.location}</Text>
        </View>

        <View style={styles.timeRow}>
          <View style={styles.detailRow}>
            <Clock color={Colors.status.active} size={13} />
            <Text style={[styles.detailText, { color: Colors.status.active }]}>{day.callTime}</Text>
          </View>
          <Text style={styles.timeSeparator}>to</Text>
          <View style={styles.detailRow}>
            <Clock color={Colors.status.error} size={13} />
            <Text style={[styles.detailText, { color: Colors.status.error }]}>{day.wrapTime}</Text>
          </View>
        </View>

        {day.notes ? (
          <View style={styles.notesRow}>
            <FileText color={Colors.text.tertiary} size={12} />
            <Text style={styles.notesText} numberOfLines={2}>{day.notes}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export default function ScheduleScreen() {
  const { activeProject, activeProjectId } = useProjects();
  const schedule = useProjectSchedule(activeProjectId);
  const router = useRouter();

  if (!activeProject) {
    return (
      <View style={styles.emptyContainer}>
        <AlertCircle color={Colors.text.tertiary} size={48} />
        <Text style={styles.emptyTitle}>No project selected</Text>
        <Text style={styles.emptySubtitle}>Select a project from the Projects tab</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.projectBanner}>
        <CalendarDays color={Colors.accent.gold} size={16} />
        <Text style={styles.projectBannerText}>{activeProject.title}</Text>
        <Text style={styles.projectBannerCount}>{schedule.length} day{schedule.length !== 1 ? 's' : ''}</Text>
      </View>

      <FlatList
        data={schedule}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ScheduleCard day={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyInner}>
            <CalendarDays color={Colors.text.tertiary} size={48} />
            <Text style={styles.emptyTitle}>No shoot days scheduled</Text>
            <Text style={styles.emptySubtitle}>Plan your shooting schedule</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/new-schedule-day' as never)}
        activeOpacity={0.8}
        testID="add-schedule-button"
      >
        <Plus color={Colors.text.inverse} size={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  projectBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.bg.secondary,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border.subtle,
    gap: 8,
  },
  projectBannerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  projectBannerCount: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  list: {
    padding: 20,
    paddingBottom: 100,
  },
  scheduleCard: {
    flexDirection: 'row',
    backgroundColor: Colors.bg.card,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: Colors.border.subtle,
  },
  dateBlock: {
    width: 64,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg.elevated,
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.accent.gold,
    letterSpacing: 1,
  },
  dateDay: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: Colors.text.primary,
    lineHeight: 30,
  },
  dateWeekday: {
    fontSize: 10,
    color: Colors.text.tertiary,
    fontWeight: '500' as const,
  },
  cardDivider: {
    width: 1,
    backgroundColor: Colors.border.subtle,
  },
  cardContent: {
    flex: 1,
    padding: 14,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  scenes: {
    fontSize: 12,
    color: Colors.accent.goldLight,
    fontWeight: '600' as const,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  timeSeparator: {
    fontSize: 10,
    color: Colors.text.tertiary,
    marginBottom: 4,
  },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border.subtle,
  },
  notesText: {
    fontSize: 11,
    color: Colors.text.tertiary,
    flex: 1,
    lineHeight: 16,
    fontStyle: 'italic' as const,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyInner: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent.gold,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.accent.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
