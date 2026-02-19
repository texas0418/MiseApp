import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Plus, MapPin, Star, Zap, Phone, AlertCircle, Shield } from 'lucide-react-native';
import { useProjects, useProjectLocations } from '@/contexts/ProjectContext';
import Colors from '@/constants/colors';
import { LocationScout } from '@/types';

function LocationCard({ item }: { item: LocationScout }) {
  const stars = Array.from({ length: 5 }, (_, i) => i < item.rating);

  return (
    <View style={styles.card} testID={`location-${item.id}`}>
      <View style={styles.cardHeader}>
        <View style={styles.iconWrap}>
          <MapPin color={Colors.status.active} size={20} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.locationName}>{item.name}</Text>
          <Text style={styles.address} numberOfLines={1}>{item.address}</Text>
        </View>
        <View style={styles.starsRow}>
          {stars.map((filled, i) => (
            <Star key={i} color={filled ? '#FBBF24' : Colors.text.tertiary} size={12} fill={filled ? '#FBBF24' : 'transparent'} />
          ))}
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.badgeRow}>
          {item.permitRequired && (
            <View style={[styles.badge, { backgroundColor: item.permitStatus === 'Approved' ? Colors.status.active + '15' : Colors.status.warning + '15' }]}>
              <Shield color={item.permitStatus === 'Approved' ? Colors.status.active : Colors.status.warning} size={10} />
              <Text style={[styles.badgeText, { color: item.permitStatus === 'Approved' ? Colors.status.active : Colors.status.warning }]}>
                Permit: {item.permitStatus}
              </Text>
            </View>
          )}
          {item.powerAvailable && (
            <View style={[styles.badge, { backgroundColor: Colors.status.info + '15' }]}>
              <Zap color={Colors.status.info} size={10} />
              <Text style={[styles.badgeText, { color: Colors.status.info }]}>Power</Text>
            </View>
          )}
        </View>

        {item.scenes.length > 0 && (
          <Text style={styles.scenesText}>Scenes: {item.scenes.join(', ')}</Text>
        )}

        {item.contactName ? (
          <View style={styles.contactRow}>
            <Phone color={Colors.text.tertiary} size={11} />
            <Text style={styles.contactText}>{item.contactName} - {item.contactPhone}</Text>
          </View>
        ) : null}

        {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
      </View>
    </View>
  );
}

export default function LocationsScreen() {
  const { activeProject, activeProjectId } = useProjects();
  const locations = useProjectLocations(activeProjectId);
  const router = useRouter();

  if (!activeProject) {
    return (
      <View style={styles.emptyContainer}>
        <Stack.Screen options={{ title: 'Locations' }} />
        <AlertCircle color={Colors.text.tertiary} size={48} />
        <Text style={styles.emptyTitle}>No project selected</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Locations' }} />
      <View style={styles.statsBar}>
        <MapPin color={Colors.accent.gold} size={16} />
        <Text style={styles.statsText}>{locations.length} location{locations.length !== 1 ? 's' : ''}</Text>
      </View>

      <FlatList
        data={locations}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <LocationCard item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyInner}>
            <MapPin color={Colors.text.tertiary} size={48} />
            <Text style={styles.emptyTitle}>No locations scouted</Text>
            <Text style={styles.emptySubtitle}>Add filming locations</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/new-location' as never)} activeOpacity={0.8}>
        <Plus color={Colors.text.inverse} size={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  statsBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: Colors.bg.secondary, borderBottomWidth: 0.5, borderBottomColor: Colors.border.subtle, gap: 8 },
  statsText: { flex: 1, fontSize: 14, fontWeight: '600' as const, color: Colors.text.primary },
  list: { padding: 16, paddingBottom: 100 },
  card: { backgroundColor: Colors.bg.card, borderRadius: 14, marginBottom: 12, borderWidth: 0.5, borderColor: Colors.border.subtle, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 10, backgroundColor: Colors.status.active + '15', justifyContent: 'center', alignItems: 'center' },
  headerText: { flex: 1 },
  locationName: { fontSize: 15, fontWeight: '600' as const, color: Colors.text.primary },
  address: { fontSize: 12, color: Colors.text.secondary, marginTop: 2 },
  starsRow: { flexDirection: 'row', gap: 2 },
  cardBody: { paddingHorizontal: 14, paddingBottom: 14, gap: 6 },
  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, gap: 4 },
  badgeText: { fontSize: 10, fontWeight: '600' as const },
  scenesText: { fontSize: 12, color: Colors.accent.goldLight, fontWeight: '500' as const },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  contactText: { fontSize: 11, color: Colors.text.secondary },
  notes: { fontSize: 11, color: Colors.text.tertiary, fontStyle: 'italic' as const },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.accent.gold, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.accent.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  emptyContainer: { flex: 1, backgroundColor: Colors.bg.primary, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyInner: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600' as const, color: Colors.text.primary, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: Colors.text.secondary, marginTop: 4, textAlign: 'center' },
});
