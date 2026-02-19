import React, { useMemo, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, CircleDot, CircleCheck, CircleX, AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useProjects, useProjectTakes } from '@/contexts/ProjectContext';
import Colors from '@/constants/colors';
import { Take } from '@/types';

function TakeCard({ take, onToggleCircle }: { take: Take; onToggleCircle: (take: Take) => void }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleCircle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    onToggleCircle(take);
  }, [take, onToggleCircle]);

  const time = new Date(take.timestamp);
  const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <View
        style={[
          styles.takeCard,
          take.isCircled && styles.takeCardCircled,
          take.isNG && styles.takeCardNG,
        ]}
        testID={`take-card-${take.id}`}
      >
        <TouchableOpacity style={styles.circleBtn} onPress={handleCircle} activeOpacity={0.7}>
          {take.isCircled ? (
            <CircleCheck color={Colors.status.active} size={28} />
          ) : take.isNG ? (
            <CircleX color={Colors.status.error} size={28} />
          ) : (
            <CircleDot color={Colors.text.tertiary} size={28} />
          )}
        </TouchableOpacity>
        <View style={styles.takeInfo}>
          <View style={styles.takeHeader}>
            <Text style={styles.takeLabel}>
              Sc.{take.sceneNumber} / {take.shotNumber}
            </Text>
            <View style={styles.takeBadge}>
              <Text style={styles.takeBadgeText}>T{take.takeNumber}</Text>
            </View>
          </View>
          {take.notes ? (
            <Text style={styles.takeNotes} numberOfLines={2}>{take.notes}</Text>
          ) : null}
        </View>
        <Text style={styles.takeTime}>{timeStr}</Text>
      </View>
    </Animated.View>
  );
}

export default function OnSetScreen() {
  const { activeProject, activeProjectId, updateTake } = useProjects();
  const takes = useProjectTakes(activeProjectId);
  const router = useRouter();

  const sortedTakes = useMemo(() => {
    return [...takes].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [takes]);

  const stats = useMemo(() => ({
    total: takes.length,
    circled: takes.filter(t => t.isCircled).length,
    ng: takes.filter(t => t.isNG).length,
  }), [takes]);

  const handleToggleCircle = useCallback((take: Take) => {
    updateTake({ ...take, isCircled: !take.isCircled });
  }, [updateTake]);

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
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.liveDot} />
          <Text style={styles.headerTitle}>Take Logger</Text>
        </View>
        <Text style={styles.headerProject}>{activeProject.title}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Takes</Text>
        </View>
        <View style={[styles.statBox, styles.statBoxHighlight]}>
          <Text style={[styles.statValue, { color: Colors.status.active }]}>{stats.circled}</Text>
          <Text style={styles.statLabel}>Circled</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: Colors.status.error }]}>{stats.ng}</Text>
          <Text style={styles.statLabel}>NG</Text>
        </View>
      </View>

      <FlatList
        data={sortedTakes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TakeCard take={item} onToggleCircle={handleToggleCircle} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyInner}>
            <CircleDot color={Colors.text.tertiary} size={48} />
            <Text style={styles.emptyTitle}>No takes logged</Text>
            <Text style={styles.emptySubtitle}>Start logging takes on set</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/log-take' as never)}
        activeOpacity={0.8}
        testID="log-take-button"
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.bg.secondary,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border.subtle,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.status.error,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  headerProject: {
    fontSize: 12,
    color: Colors.accent.gold,
    fontWeight: '600' as const,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.bg.card,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: Colors.border.subtle,
  },
  statBoxHighlight: {
    borderColor: Colors.status.active + '33',
    backgroundColor: Colors.status.active + '08',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.text.tertiary,
    marginTop: 2,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  list: {
    padding: 20,
    paddingBottom: 100,
  },
  takeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: Colors.border.subtle,
  },
  takeCardCircled: {
    borderColor: Colors.status.active + '44',
    backgroundColor: Colors.status.active + '08',
  },
  takeCardNG: {
    borderColor: Colors.status.error + '33',
    backgroundColor: Colors.status.error + '06',
  },
  circleBtn: {
    marginRight: 12,
    padding: 2,
  },
  takeInfo: {
    flex: 1,
  },
  takeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  takeLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  takeBadge: {
    backgroundColor: Colors.accent.goldBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  takeBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.accent.gold,
  },
  takeNotes: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
    lineHeight: 17,
  },
  takeTime: {
    fontSize: 11,
    color: Colors.text.tertiary,
    fontVariant: ['tabular-nums'],
    marginLeft: 8,
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
