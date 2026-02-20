import React from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { Sun, Cloud, CloudRain, CloudLightning, CloudSnow, CloudFog, Wind, Droplets, Sunrise, Sunset, AlertCircle } from 'lucide-react-native';
import { useProjects, useLocationWeatherData } from '@/contexts/ProjectContext';
import Colors from '@/constants/colors';
import { LocationWeather } from '@/types';

const CONDITION_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  'sunny': { icon: Sun, color: '#FBBF24', label: 'Sunny' },
  'partly-cloudy': { icon: Cloud, color: '#94A3B8', label: 'Partly Cloudy' },
  'cloudy': { icon: Cloud, color: '#6B7280', label: 'Overcast' },
  'rain': { icon: CloudRain, color: '#60A5FA', label: 'Rain' },
  'storm': { icon: CloudLightning, color: '#F87171', label: 'Storm' },
  'snow': { icon: CloudSnow, color: '#E0E7FF', label: 'Snow' },
  'fog': { icon: CloudFog, color: '#9CA3AF', label: 'Fog' },
  'wind': { icon: Wind, color: '#6EE7B7', label: 'Windy' },
};

function WeatherCard({ item }: { item: LocationWeather }) {
  const config = CONDITION_CONFIG[item.condition] ?? CONDITION_CONFIG['sunny'];
  const Icon = config.icon;
  const date = new Date(item.date + 'T12:00:00');
  const dayStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.dayText}>{dayStr}</Text>
        <View style={[styles.condBadge, { backgroundColor: config.color + '20' }]}>
          <Icon color={config.color} size={16} />
          <Text style={[styles.condText, { color: config.color }]}>{config.label}</Text>
        </View>
      </View>
      <View style={styles.tempRow}>
        <Text style={styles.tempHigh}>{item.tempHigh}°</Text>
        <Text style={styles.tempLow}>{item.tempLow}°</Text>
      </View>
      <View style={styles.detailGrid}>
        <View style={styles.detailItem}><Wind color={Colors.text.tertiary} size={14} /><Text style={styles.detailText}>{item.windSpeed} mph</Text></View>
        <View style={styles.detailItem}><Droplets color={Colors.text.tertiary} size={14} /><Text style={styles.detailText}>{item.humidity}%</Text></View>
        <View style={styles.detailItem}><CloudRain color={Colors.text.tertiary} size={14} /><Text style={styles.detailText}>{item.precipChance}%</Text></View>
      </View>
      <View style={styles.sunRow}>
        <View style={styles.sunItem}><Sunrise color={Colors.accent.gold} size={14} /><Text style={styles.sunText}>{item.sunrise}</Text></View>
        <View style={styles.sunItem}><Sunset color={Colors.accent.goldDim} size={14} /><Text style={styles.sunText}>{item.sunset}</Text></View>
      </View>
      <View style={styles.goldenRow}>
        <Text style={styles.goldenLabel}>🌅 Golden Hour</Text>
        <Text style={styles.goldenText}>AM: {item.goldenHourAM}  •  PM: {item.goldenHourPM}</Text>
      </View>
      {item.notes ? <Text style={styles.notesText}>{item.notes}</Text> : null}
    </View>
  );
}

export default function LocationWeatherScreen() {
  const { activeProject, locations } = useProjects();
  const projectLocations = locations.filter(l => l.projectId === activeProject?.id);

  if (!activeProject) {
    return <View style={styles.empty}><AlertCircle color={Colors.text.tertiary} size={48} /><Text style={styles.emptyTitle}>No project selected</Text></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Stack.Screen options={{ title: 'Location Weather' }} />
      {projectLocations.map(loc => (
        <LocationWeatherSection key={loc.id} locationId={loc.id} locationName={loc.name} />
      ))}
      {projectLocations.length === 0 && (
        <View style={styles.emptyInner}><Sun color={Colors.text.tertiary} size={48} /><Text style={styles.emptyTitle}>No locations yet</Text><Text style={styles.emptySub}>Add locations to see weather forecasts</Text></View>
      )}
    </ScrollView>
  );
}

function LocationWeatherSection({ locationId, locationName }: { locationId: string; locationName: string }) {
  const weather = useLocationWeatherData(locationId);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{locationName}</Text>
      {weather.map(w => <WeatherCard key={w.id} item={w} />)}
      {weather.length === 0 && <Text style={styles.noDataText}>No weather data available</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { padding: 16, paddingBottom: 40 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.accent.gold, marginBottom: 10, letterSpacing: 0.3 },
  card: { backgroundColor: Colors.bg.card, borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 0.5, borderColor: Colors.border.subtle },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  dayText: { fontSize: 14, fontWeight: '700', color: Colors.text.primary },
  condBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  condText: { fontSize: 12, fontWeight: '600' },
  tempRow: { flexDirection: 'row', gap: 8, marginBottom: 12, alignItems: 'baseline' },
  tempHigh: { fontSize: 32, fontWeight: '800', color: Colors.text.primary },
  tempLow: { fontSize: 20, color: Colors.text.tertiary },
  detailGrid: { flexDirection: 'row', gap: 20, marginBottom: 12 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontSize: 12, color: Colors.text.secondary },
  sunRow: { flexDirection: 'row', gap: 20, marginBottom: 10 },
  sunItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sunText: { fontSize: 12, color: Colors.text.secondary },
  goldenRow: { backgroundColor: Colors.accent.goldBg, borderRadius: 8, padding: 10, marginBottom: 8 },
  goldenLabel: { fontSize: 11, fontWeight: '700', color: Colors.accent.gold, marginBottom: 4 },
  goldenText: { fontSize: 12, color: Colors.accent.goldLight },
  notesText: { fontSize: 11, color: Colors.text.tertiary, fontStyle: 'italic', marginTop: 4 },
  noDataText: { fontSize: 13, color: Colors.text.tertiary, fontStyle: 'italic', padding: 20, textAlign: 'center' },
  empty: { flex: 1, backgroundColor: Colors.bg.primary, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyInner: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text.primary, marginTop: 16 },
  emptySub: { fontSize: 14, color: Colors.text.secondary, marginTop: 4, textAlign: 'center' },
});
