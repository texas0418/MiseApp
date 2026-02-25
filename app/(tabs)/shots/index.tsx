import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SectionList } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Camera, Check, Clock, Eye, AlertCircle } from 'lucide-react-native';
import { useProjects, useProjectShots } from '@/contexts/ProjectContext';
import { useLayout } from '@/utils/useLayout';
import Colors from '@/constants/colors';
import { Shot, ShotStatus } from '@/types';

const STATUS_CONFIG: Record<ShotStatus, { icon: React.ElementType; color: string; label: string }> = {
  planned: { icon: Clock, color: Colors.text.tertiary, label: 'Planned' },
  ready: { icon: Eye, color: Colors.status.info, label: 'Ready' },
  shot: { icon: Camera, color: Colors.status.warning, label: 'Shot' },
  approved: { icon: Check, color: Colors.status.active, label: 'Approved' },
};

function ShotCard({ shot }: { shot: Shot }) {
  const config = STATUS_CONFIG[shot.status];
  const StatusIcon = config.icon;

  return (
    <View style={styles.shotCard} testID={`shot-card-${shot.id}`}>
      <View style={styles.shotLeft}>
        <View style={[styles.shotNumberBadge, { borderColor: config.color + '55' }]}>
          <Text style={styles.shotNumber}>{shot.shotNumber}</Text>
        </View>
      </View>
      <View style={styles.shotCenter}>
        <Text style={styles.shotDescription} numberOfLines={2}>{shot.description}</Text>
        <View style={styles.shotMeta}>
          <View style={styles.shotTag}>
            <Text style={styles.shotTagText}>{shot.type}</Text>
          </View>
          <View style={styles.shotTag}>
            <Text style={styles.shotTagText}>{shot.movement}</Text>
          </View>
          <View style={styles.shotTag}>
            <Text style={styles.shotTagText}>{shot.lens}</Text>
          </View>
        </View>
        {shot.notes ? (
          <Text style={styles.shotNotes} numberOfLines={1}>{shot.notes}</Text>
        ) : null}
      </View>
      <View style={styles.shotRight}>
        <View style={[styles.statusIcon, { backgroundColor: config.color + '18' }]}>
          <StatusIcon color={config.color} size={14} />
        </View>
      </View>
    </View>
  );
}

export default function ShotsScreen() {
  const { activeProject, activeProjectId } = useProjects();
  const shots = useProjectShots(activeProjectId);
  const router = useRouter();
  const { isTablet, contentPadding } = useLayout();

  const sections = useMemo(() => {
    const grouped: Record<number, Shot[]> = {};
    shots.forEach(shot => {
      if (!grouped[shot.sceneNumber]) grouped[shot.sceneNumber] = [];
      grouped[shot.sceneNumber].push(shot);
    });
    return Object.entries(grouped)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([scene, data]) => ({
        title: `Scene ${scene}`,
        data,
      }));
  }, [shots]);

  const stats = useMemo(() => ({
    total: shots.length,
    approved: shots.filter(s => s.status === 'approved').length,
    shot: shots.filter(s => s.status === 'shot').length,
    planned: shots.filter(s => s.status === 'planned' || s.status === 'ready').length,
  }), [shots]);

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
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.status.active }]}>{stats.approved}</Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.status.warning }]}>{stats.shot}</Text>
          <Text style={styles.statLabel}>Shot</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.text.tertiary }]}>{stats.planned}</Text>
          <Text style={styles.statLabel}>Remaining</Text>
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ShotCard shot={item} />}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionCount}>{section.data.length} shot{section.data.length !== 1 ? 's' : ''}</Text>
          </View>
        )}
        contentContainerStyle={[styles.list, { paddingHorizontal: contentPadding, maxWidth: isTablet ? 800 : undefined, alignSelf: isTablet ? 'center' as const : undefined, width: isTablet ? '100%' : undefined }]}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyInner}>
            <Camera color={Colors.text.tertiary} size={48} />
            <Text style={styles.emptyTitle}>No shots yet</Text>
            <Text style={styles.emptySubtitle}>Build your shot list for {activeProject.title}</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/new-shot' as never)}
        activeOpacity={0.8}
        testID="add-shot-button"
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
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.bg.secondary,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border.subtle,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.text.tertiary,
    marginTop: 2,
    fontWeight: '500' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border.subtle,
  },
  list: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.accent.gold,
    letterSpacing: 0.3,
  },
  sectionCount: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  shotCard: {
    flexDirection: 'row',
    backgroundColor: Colors.bg.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: Colors.border.subtle,
  },
  shotLeft: {
    marginRight: 12,
  },
  shotNumberBadge: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.bg.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  shotNumber: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  shotCenter: {
    flex: 1,
  },
  shotDescription: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
    marginBottom: 8,
  },
  shotMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  shotTag: {
    backgroundColor: Colors.bg.elevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  shotTagText: {
    fontSize: 10,
    color: Colors.text.secondary,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  shotNotes: {
    fontSize: 11,
    color: Colors.text.tertiary,
    fontStyle: 'italic' as const,
    marginTop: 6,
  },
  shotRight: {
    justifyContent: 'center',
    marginLeft: 8,
  },
  statusIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
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
