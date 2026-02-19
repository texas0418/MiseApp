import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Plus, DollarSign, AlertCircle, Check, Clock } from 'lucide-react-native';
import { useProjects, useProjectBudget } from '@/contexts/ProjectContext';
import Colors from '@/constants/colors';
import { BudgetItem, BudgetCategory } from '@/types';

const CATEGORY_COLORS: Record<BudgetCategory, string> = {
  'talent': '#FB923C', 'crew': '#60A5FA', 'equipment': '#A78BFA', 'locations': '#4ADE80',
  'production-design': '#F472B6', 'post-production': '#34D399', 'music': '#E879F9',
  'marketing': '#FBBF24', 'legal': '#94A3B8', 'insurance': '#64748B',
  'catering': '#FB7185', 'transport': '#38BDF8', 'contingency': '#CBD5E1', 'other': '#6B7280',
};

const CATEGORY_LABELS: Record<BudgetCategory, string> = {
  'talent': 'Talent', 'crew': 'Crew', 'equipment': 'Equipment', 'locations': 'Locations',
  'production-design': 'Prod Design', 'post-production': 'Post', 'music': 'Music',
  'marketing': 'Marketing', 'legal': 'Legal', 'insurance': 'Insurance',
  'catering': 'Catering', 'transport': 'Transport', 'contingency': 'Contingency', 'other': 'Other',
};

function formatCurrency(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function BudgetCard({ item }: { item: BudgetItem }) {
  const catColor = CATEGORY_COLORS[item.category] ?? Colors.text.tertiary;
  const variance = item.estimated - item.actual;

  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={[styles.catDot, { backgroundColor: catColor }]} />
      </View>
      <View style={styles.cardCenter}>
        <Text style={styles.desc}>{item.description}</Text>
        <View style={styles.metaRow}>
          <Text style={[styles.catLabel, { color: catColor }]}>{CATEGORY_LABELS[item.category]}</Text>
          {item.paid && (
            <View style={styles.paidBadge}>
              <Check color={Colors.status.active} size={9} />
              <Text style={styles.paidText}>Paid</Text>
            </View>
          )}
          {!item.paid && item.actual === 0 && (
            <View style={styles.pendingBadge}>
              <Clock color={Colors.text.tertiary} size={9} />
              <Text style={styles.pendingText}>Pending</Text>
            </View>
          )}
        </View>
        {item.notes ? <Text style={styles.notes} numberOfLines={1}>{item.notes}</Text> : null}
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.estimated}>{formatCurrency(item.estimated)}</Text>
        {item.actual > 0 && (
          <Text style={[styles.actual, { color: variance >= 0 ? Colors.status.active : Colors.status.error }]}>
            {formatCurrency(item.actual)}
          </Text>
        )}
      </View>
    </View>
  );
}

export default function BudgetScreen() {
  const { activeProject, activeProjectId } = useProjects();
  const budget = useProjectBudget(activeProjectId);
  const router = useRouter();

  const stats = useMemo(() => {
    const totalEstimated = budget.reduce((s, b) => s + b.estimated, 0);
    const totalActual = budget.reduce((s, b) => s + b.actual, 0);
    const totalPaid = budget.filter(b => b.paid).reduce((s, b) => s + b.actual, 0);
    return { totalEstimated, totalActual, totalPaid, remaining: totalEstimated - totalActual };
  }, [budget]);

  if (!activeProject) {
    return (
      <View style={styles.emptyContainer}>
        <Stack.Screen options={{ title: 'Budget' }} />
        <AlertCircle color={Colors.text.tertiary} size={48} />
        <Text style={styles.emptyTitle}>No project selected</Text>
      </View>
    );
  }

  const spentPercent = stats.totalEstimated > 0 ? Math.min(100, (stats.totalActual / stats.totalEstimated) * 100) : 0;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Budget' }} />

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Budget</Text>
            <Text style={styles.summaryValue}>{formatCurrency(stats.totalEstimated)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Spent</Text>
            <Text style={[styles.summaryValue, { color: Colors.status.warning }]}>{formatCurrency(stats.totalActual)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Remaining</Text>
            <Text style={[styles.summaryValue, { color: stats.remaining >= 0 ? Colors.status.active : Colors.status.error }]}>{formatCurrency(stats.remaining)}</Text>
          </View>
        </View>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${spentPercent}%` as unknown as number, backgroundColor: spentPercent > 90 ? Colors.status.error : spentPercent > 70 ? Colors.status.warning : Colors.accent.gold }]} />
        </View>
        <Text style={styles.progressText}>{spentPercent.toFixed(0)}% of budget used</Text>
      </View>

      <FlatList
        data={budget}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <BudgetCard item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyInner}>
            <DollarSign color={Colors.text.tertiary} size={48} />
            <Text style={styles.emptyTitle}>No budget items</Text>
            <Text style={styles.emptySubtitle}>Track your production spending</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/new-budget-item' as never)} activeOpacity={0.8}>
        <Plus color={Colors.text.inverse} size={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  summaryCard: { margin: 16, backgroundColor: Colors.bg.card, borderRadius: 14, padding: 16, borderWidth: 0.5, borderColor: Colors.border.subtle },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 10, color: Colors.text.tertiary, fontWeight: '600' as const, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  summaryValue: { fontSize: 18, fontWeight: '700' as const, color: Colors.text.primary, marginTop: 4 },
  summaryDivider: { width: 1, height: 32, backgroundColor: Colors.border.subtle },
  progressBg: { height: 4, backgroundColor: Colors.bg.elevated, borderRadius: 2, marginTop: 14, overflow: 'hidden' },
  progressFill: { height: 4, borderRadius: 2 },
  progressText: { fontSize: 11, color: Colors.text.tertiary, textAlign: 'center', marginTop: 6 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  card: { flexDirection: 'row', backgroundColor: Colors.bg.card, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 0.5, borderColor: Colors.border.subtle, alignItems: 'center' },
  cardLeft: { marginRight: 12 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  cardCenter: { flex: 1 },
  desc: { fontSize: 14, fontWeight: '500' as const, color: Colors.text.primary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 },
  catLabel: { fontSize: 11, fontWeight: '600' as const },
  paidBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  paidText: { fontSize: 10, color: Colors.status.active, fontWeight: '600' as const },
  pendingBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  pendingText: { fontSize: 10, color: Colors.text.tertiary, fontWeight: '500' as const },
  notes: { fontSize: 11, color: Colors.text.tertiary, marginTop: 2 },
  cardRight: { alignItems: 'flex-end', marginLeft: 8 },
  estimated: { fontSize: 14, fontWeight: '700' as const, color: Colors.text.primary },
  actual: { fontSize: 11, fontWeight: '600' as const, marginTop: 2 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.accent.gold, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.accent.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  emptyContainer: { flex: 1, backgroundColor: Colors.bg.primary, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyInner: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600' as const, color: Colors.text.primary, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: Colors.text.secondary, marginTop: 4, textAlign: 'center' },
});
