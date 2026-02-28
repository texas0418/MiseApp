/**
 * components/AIImportButton.tsx
 * 
 * Reusable AI Import Button for Mise App
 * Phase 3, Item 12
 * 
 * A sparkle-icon button ("AI Import") that navigates to the AI import
 * screen with the target entity type. Sits alongside the ImportButton.
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface AIImportButtonProps {
  /** The entity key matching importRegistry (e.g. 'crew', 'budget', 'shots') */
  entityKey: string;
  /** Optional: 'compact' shows just the icon, 'full' shows icon + label. Default: 'full' */
  variant?: 'compact' | 'full';
  /** Optional: custom label text. Default: 'AI Import' */
  label?: string;
}

export default function AIImportButton({ entityKey, variant = 'full', label = 'AI Import' }: AIImportButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/ai-import?entity=${entityKey}` as never);
  };

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={styles.compactBtn}
        onPress={handlePress}
        activeOpacity={0.7}
        testID={`ai-import-btn-${entityKey}`}
      >
        <Sparkles color={Colors.accent.gold} size={16} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.fullBtn}
      onPress={handlePress}
      activeOpacity={0.7}
      testID={`ai-import-btn-${entityKey}`}
    >
      <Sparkles color={Colors.accent.gold} size={14} />
      <Text style={styles.fullBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  compactBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.accent.goldBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: Colors.accent.gold + '33',
  },
  fullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: Colors.accent.goldBg,
    borderWidth: 0.5,
    borderColor: Colors.accent.gold + '33',
  },
  fullBtnText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.accent.gold,
  },
});
