import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import {
  FileText, MapPin, DollarSign, Clapperboard, BookOpen,
  Aperture, Sparkles, Trophy, Palette, StickyNote,
  ClipboardList, User, Users, Layers, Image, CloudSun,
  Share2, Move, Paintbrush, Clock
} from 'lucide-react-native';
import { useProjects } from '@/contexts/ProjectContext';
import { useLayout } from '@/utils/useLayout';
import Colors from '@/constants/colors';

interface ToolItem {
  icon: React.ElementType;
  label: string;
  subtitle: string;
  route: string;
  color: string;
  badge?: string;
}

const PRE_PROD_TOOLS: ToolItem[] = [
  { icon: FileText, label: 'Script Breakdown', subtitle: 'Tag scenes & elements', route: '/script-breakdown', color: '#60A5FA' },
  { icon: MapPin, label: 'Locations', subtitle: 'Scout & manage sites', route: '/locations', color: '#4ADE80' },
  { icon: DollarSign, label: 'Budget', subtitle: 'Track spending', route: '/budget', color: '#FBBF24' },
  { icon: ClipboardList, label: 'Call Sheets', subtitle: 'Daily crew sheets', route: '/call-sheets', color: '#FB923C' },
  { icon: Palette, label: 'Mood Boards', subtitle: 'Visual references', route: '/mood-boards', color: '#F472B6' },
  { icon: Users, label: 'Crew', subtitle: 'Cast & crew directory', route: '/crew-directory', color: '#A78BFA' },
  { icon: Image, label: 'Shot References', subtitle: 'Visual shot library', route: '/shot-references', color: '#38BDF8' },
  { icon: Move, label: 'Blocking', subtitle: 'Rehearsal & staging', route: '/blocking-notes', color: '#34D399' },
  { icon: Paintbrush, label: 'Color / LUTs', subtitle: 'Look & grade references', route: '/color-references', color: '#E879F9' },
  { icon: CloudSun, label: 'Weather', subtitle: 'Location forecasts', route: '/location-weather', color: '#06B6D4' },
];

const ON_SET_TOOLS: ToolItem[] = [
  { icon: Clapperboard, label: 'Digital Slate', subtitle: 'Clapperboard', route: '/digital-slate', color: '#F87171' },
  { icon: BookOpen, label: 'Continuity', subtitle: 'Script supervisor notes', route: '/continuity', color: '#34D399' },
  { icon: StickyNote, label: 'Notes', subtitle: 'Production notes', route: '/production-notes', color: '#FCD34D' },
  { icon: Clock, label: 'Time Tracker', subtitle: 'Hours & overtime', route: '/time-tracker', color: '#FB923C' },
];

const POST_TOOLS: ToolItem[] = [
  { icon: Sparkles, label: 'VFX Tracker', subtitle: 'Visual effects shots', route: '/vfx-tracker', color: '#818CF8' },
  { icon: Trophy, label: 'Festivals', subtitle: 'Submissions & deadlines', route: '/festival-tracker', color: '#F59E0B' },
  { icon: FileText, label: 'Wrap Reports', subtitle: 'Daily wrap summaries', route: '/wrap-reports', color: '#A78BFA' },
];

const REFERENCE_TOOLS: ToolItem[] = [
  { icon: Aperture, label: 'Lens Calculator', subtitle: 'FOV & focal lengths', route: '/lens-calculator', color: '#06B6D4' },
  { icon: User, label: 'Portfolio', subtitle: 'Your credits & reel', route: '/portfolio', color: Colors.accent.gold },
  { icon: Layers, label: 'Frame Guides', subtitle: 'Aspect ratio previews', route: '/frame-guides', color: '#E879F9' },
  { icon: Share2, label: 'Export & Share', subtitle: 'Share project data', route: '/export-share', color: '#94A3B8' },
];

function ToolCard({ tool, index }: { tool: ToolItem; index: number }) {
  const router = useRouter();
  const { isTablet, gridColumns } = useLayout();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, delay: index * 40, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, delay: index * 40, useNativeDriver: true, tension: 100, friction: 8 }),
    ]).start();
  }, []);

  const Icon = tool.icon;
  const cardBasis = isTablet ? `${100 / Math.min(gridColumns, 3) - 2}%` : '48%';

  return (
    <Animated.View style={[styles.toolCardWrapper, { opacity: fadeAnim, transform: [{ scale: scaleAnim }], flexBasis: cardBasis as unknown as number }]}>
      <TouchableOpacity
        style={styles.toolCard}
        onPress={() => router.push(tool.route as never)}
        activeOpacity={0.7}
      >
        <View style={[styles.toolIconWrap, { backgroundColor: tool.color + '18' }]}>
          <Icon color={tool.color} size={22} />
        </View>
        <View style={styles.toolText}>
          <Text style={styles.toolLabel}>{tool.label}</Text>
          <Text style={styles.toolSubtitle}>{tool.subtitle}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function ToolSection({ title, tools }: { title: string; tools: ToolItem[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.toolGrid}>
        {tools.map((tool, i) => (
          <ToolCard key={tool.label} tool={tool} index={i} />
        ))}
      </View>
    </View>
  );
}

export default function MoreScreen() {
  const { activeProject } = useProjects();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {activeProject && (
        <View style={styles.projectContext}>
          <View style={styles.contextDot} />
          <Text style={styles.contextText}>{activeProject.title}</Text>
        </View>
      )}

      <ToolSection title="Pre-Production" tools={PRE_PROD_TOOLS} />
      <ToolSection title="On Set" tools={ON_SET_TOOLS} />
      <ToolSection title="Post-Production" tools={POST_TOOLS} />
      <ToolSection title="Reference & Profile" tools={REFERENCE_TOOLS} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  content: {
    paddingBottom: 40,
  },
  projectContext: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.accent.goldBg,
    gap: 8,
  },
  contextDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent.gold,
  },
  contextText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.accent.gold,
    letterSpacing: 0.3,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.text.tertiary,
    textTransform: 'uppercase' as const,
    letterSpacing: 1.2,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  toolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  toolCardWrapper: {
    width: '48.5%' as unknown as number,
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: '48%',
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 0.5,
    borderColor: Colors.border.subtle,
    gap: 10,
  },
  toolIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolText: {
    flex: 1,
  },
  toolLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  toolSubtitle: {
    fontSize: 10,
    color: Colors.text.tertiary,
    marginTop: 1,
  },
});
