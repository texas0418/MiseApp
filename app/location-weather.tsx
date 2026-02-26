import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { Sun, Cloud, CloudRain, CloudLightning, CloudSnow, CloudFog, Wind, Droplets, Sunrise, Sunset, AlertCircle, RefreshCw, MapPin } from 'lucide-react-native';
import { useProjects } from '@/contexts/ProjectContext';
import Colors from '@/constants/colors';

interface DayForecast {
  date: string;
  tempHigh: number;
  tempLow: number;
  conditionCode: number;
  windSpeed: number;
  humidity: number;
  precipChance: number;
  sunrise: string;
  sunset: string;
  goldenHourAM: string;
  goldenHourPM: string;
  uvIndex: number;
}

function getConditionConfig(code: number): { icon: React.ElementType; color: string; label: string } {
  if (code === 0) return { icon: Sun, color: '#FBBF24', label: 'Clear Sky' };
  if (code <= 3) return { icon: Cloud, color: '#94A3B8', label: code === 1 ? 'Mainly Clear' : code === 2 ? 'Partly Cloudy' : 'Overcast' };
  if (code <= 49) return { icon: CloudFog, color: '#9CA3AF', label: 'Fog' };
  if (code <= 59) return { icon: CloudRain, color: '#60A5FA', label: 'Drizzle' };
  if (code <= 69) return { icon: CloudRain, color: '#3B82F6', label: 'Rain' };
  if (code <= 79) return { icon: CloudSnow, color: '#E0E7FF', label: 'Snow' };
  if (code <= 84) return { icon: CloudRain, color: '#2563EB', label: 'Rain Showers' };
  if (code <= 86) return { icon: CloudSnow, color: '#C7D2FE', label: 'Snow Showers' };
  if (code <= 99) return { icon: CloudLightning, color: '#F87171', label: 'Thunderstorm' };
  return { icon: Cloud, color: '#6B7280', label: 'Unknown' };
}

function calcGoldenHour(sunriseISO: string, sunsetISO: string): { am: string; pm: string } {
  try {
    const rise = new Date(sunriseISO);
    const set = new Date(sunsetISO);
    const riseEnd = new Date(rise.getTime() + 30 * 60 * 1000);
    const setStart = new Date(set.getTime() - 30 * 60 * 1000);
    const fmt = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return { am: `${fmt(rise)}–${fmt(riseEnd)}`, pm: `${fmt(setStart)}–${fmt(set)}` };
  } catch {
    return { am: 'N/A', pm: 'N/A' };
  }
}

// Known coordinates for sample locations — used as fallback when location data
// lacks lat/long and the geocoding API can't resolve film-specific location names
const KNOWN_COORDINATES: Record<string, { lat: number; lon: number }> = {
  'point reyes lighthouse': { lat: 37.9963, lon: -123.0247 },
  'point reyes': { lat: 37.9963, lon: -123.0247 },
  'point reyes national seashore': { lat: 37.9963, lon: -123.0247 },
  'stage b - lighthouse interior': { lat: 37.9735, lon: -122.5311 },
  'stage b': { lat: 37.9735, lon: -122.5311 },
  'san rafael': { lat: 37.9735, lon: -122.5311 },
};

function lookupKnownCoordinates(name: string, address: string): { lat: number; lon: number } | null {
  const nameKey = name.toLowerCase().trim();
  if (KNOWN_COORDINATES[nameKey]) return KNOWN_COORDINATES[nameKey];

  const addrKey = address.toLowerCase().trim();
  if (KNOWN_COORDINATES[addrKey]) return KNOWN_COORDINATES[addrKey];

  // Partial match — check if any known key is contained in name or address
  for (const [key, coords] of Object.entries(KNOWN_COORDINATES)) {
    if (nameKey.includes(key) || addrKey.includes(key)) return coords;
  }
  return null;
}

async function geocodeAddress(address: string): Promise<{ lat: number; lon: number; name: string } | null> {
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(address)}&count=1&language=en&format=json`);
    const data = await res.json();
    if (data.results?.length > 0) {
      const r = data.results[0];
      return { lat: r.latitude, lon: r.longitude, name: r.name };
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchForecast(lat: number, lon: number): Promise<DayForecast[]> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,uv_index_max,sunrise,sunset&hourly=relative_humidity_2m&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto&forecast_days=7`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.daily) return [];
  const days: DayForecast[] = [];
  for (let i = 0; i < data.daily.time.length; i++) {
    const sunriseISO = data.daily.sunrise[i];
    const sunsetISO = data.daily.sunset[i];
    const golden = calcGoldenHour(sunriseISO, sunsetISO);
    const hourlyHumidity = data.hourly?.relative_humidity_2m?.slice(i * 24, (i + 1) * 24) ?? [];
    const avgHumidity = hourlyHumidity.length > 0
      ? Math.round(hourlyHumidity.reduce((s: number, v: number) => s + v, 0) / hourlyHumidity.length)
      : 0;
    const fmtSun = (iso: string) => {
      try { return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }); }
      catch { return iso; }
    };
    days.push({
      date: data.daily.time[i],
      tempHigh: Math.round(data.daily.temperature_2m_max[i]),
      tempLow: Math.round(data.daily.temperature_2m_min[i]),
      conditionCode: data.daily.weather_code[i],
      windSpeed: Math.round(data.daily.wind_speed_10m_max[i]),
      humidity: avgHumidity,
      precipChance: data.daily.precipitation_probability_max[i] ?? 0,
      sunrise: fmtSun(sunriseISO),
      sunset: fmtSun(sunsetISO),
      goldenHourAM: golden.am,
      goldenHourPM: golden.pm,
      uvIndex: Math.round(data.daily.uv_index_max[i] ?? 0),
    });
  }
  return days;
}

function ForecastCard({ day }: { day: DayForecast }) {
  const config = getConditionConfig(day.conditionCode);
  const Icon = config.icon;
  const dateObj = new Date(day.date + 'T12:00:00');
  const dayStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const isToday = new Date().toISOString().split('T')[0] === day.date;

  return (
    <View style={[styles.card, isToday && styles.cardToday]}>
      <View style={styles.cardHeader}>
        <Text style={styles.dayText}>{isToday ? '📍 Today' : dayStr}</Text>
        <View style={[styles.condBadge, { backgroundColor: config.color + '20' }]}>
          <Icon color={config.color} size={16} />
          <Text style={[styles.condText, { color: config.color }]}>{config.label}</Text>
        </View>
      </View>
      <View style={styles.tempRow}>
        <Text style={styles.tempHigh}>{day.tempHigh}°F</Text>
        <Text style={styles.tempLow}>{day.tempLow}°F</Text>
      </View>
      <View style={styles.detailGrid}>
        <View style={styles.detailItem}><Wind color={Colors.text.tertiary} size={14} /><Text style={styles.detailText}>{day.windSpeed} mph</Text></View>
        <View style={styles.detailItem}><Droplets color={Colors.text.tertiary} size={14} /><Text style={styles.detailText}>{day.humidity}%</Text></View>
        <View style={styles.detailItem}><CloudRain color={Colors.text.tertiary} size={14} /><Text style={styles.detailText}>{day.precipChance}% rain</Text></View>
        <View style={styles.detailItem}><Sun color={Colors.text.tertiary} size={14} /><Text style={styles.detailText}>UV {day.uvIndex}</Text></View>
      </View>
      <View style={styles.sunRow}>
        <View style={styles.sunItem}><Sunrise color={Colors.accent.gold} size={14} /><Text style={styles.sunText}>{day.sunrise}</Text></View>
        <View style={styles.sunItem}><Sunset color={Colors.accent.goldDim} size={14} /><Text style={styles.sunText}>{day.sunset}</Text></View>
      </View>
      <View style={styles.goldenRow}>
        <Text style={styles.goldenLabel}>🌅 Golden Hour</Text>
        <Text style={styles.goldenText}>AM: {day.goldenHourAM}</Text>
        <Text style={styles.goldenText}>PM: {day.goldenHourPM}</Text>
      </View>
      {day.precipChance >= 40 && (
        <View style={styles.alertRow}>
          <AlertCircle color={Colors.status.warning} size={14} />
          <Text style={styles.alertText}>{day.precipChance}% precipitation — consider weather contingency</Text>
        </View>
      )}
      {day.windSpeed >= 20 && (
        <View style={styles.alertRow}>
          <Wind color={Colors.status.warning} size={14} />
          <Text style={styles.alertText}>High wind ({day.windSpeed} mph) — may affect sound & rigging</Text>
        </View>
      )}
    </View>
  );
}

interface ForecastState {
  loading: boolean;
  error: string | null;
  forecast: DayForecast[];
  geocodedName: string | null;
}

function LocationWeatherSection({ locationName, address, latitude, longitude }: {
  locationName: string;
  address: string;
  latitude?: number;
  longitude?: number;
}) {
  const [state, setState] = useState<ForecastState>({ loading: true, error: null, forecast: [], geocodedName: null });

  const load = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      let lat: number | undefined = latitude;
      let lon: number | undefined = longitude;
      let resolvedName: string | null = null;

      // PRIORITY 1: Use coordinates directly from location data
      if (lat != null && lon != null && !isNaN(lat) && !isNaN(lon)) {
        resolvedName = locationName;
      } else {
        // PRIORITY 2: Check known coordinates lookup table
        const known = lookupKnownCoordinates(locationName, address);
        if (known) {
          lat = known.lat;
          lon = known.lon;
          resolvedName = locationName;
        } else {
          // PRIORITY 3: Try geocoding the address
          let geo = await geocodeAddress(address);
          // PRIORITY 4: Try geocoding just the location name
          if (!geo) geo = await geocodeAddress(locationName);
          if (!geo) {
            setState({ loading: false, error: 'Could not find coordinates for this location', forecast: [], geocodedName: null });
            return;
          }
          lat = geo.lat;
          lon = geo.lon;
          resolvedName = geo.name;
        }
      }

      const forecast = await fetchForecast(lat!, lon!);
      setState({ loading: false, error: null, forecast, geocodedName: resolvedName });
    } catch {
      setState({ loading: false, error: 'Failed to fetch weather data', forecast: [], geocodedName: null });
    }
  }, [address, locationName, latitude, longitude]);

  useEffect(() => { load(); }, [load]);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>{locationName}</Text>
          {state.geocodedName && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <MapPin color={Colors.text.tertiary} size={10} />
              <Text style={styles.sectionSub}>{state.geocodedName}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={load} style={styles.refreshBtn}><RefreshCw color={Colors.accent.gold} size={16} /></TouchableOpacity>
      </View>
      {state.loading && (
        <View style={styles.loadingBox}><ActivityIndicator color={Colors.accent.gold} /><Text style={styles.loadingText}>Fetching forecast...</Text></View>
      )}
      {state.error && (
        <View style={styles.errorBox}><AlertCircle color={Colors.status.error} size={16} /><Text style={styles.errorText}>{state.error}</Text></View>
      )}
      {state.forecast.map(day => <ForecastCard key={day.date} day={day} />)}
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
      <View style={styles.poweredBy}><Text style={styles.poweredByText}>Live 7-day forecast • Powered by Open-Meteo.com</Text></View>
      {projectLocations.map(loc => (
        <LocationWeatherSection
          key={loc.id}
          locationName={loc.name}
          address={loc.address}
          latitude={(loc as any).latitude}
          longitude={(loc as any).longitude}
        />
      ))}
      {projectLocations.length === 0 && (
        <View style={styles.emptyInner}><Sun color={Colors.text.tertiary} size={48} /><Text style={styles.emptyTitle}>No locations yet</Text><Text style={styles.emptySub}>Add locations in the Locations tool to see weather forecasts</Text></View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { padding: 16, paddingBottom: 40 },
  poweredBy: { alignItems: 'center', paddingVertical: 8, marginBottom: 8 },
  poweredByText: { fontSize: 11, color: Colors.text.tertiary },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.accent.gold, letterSpacing: 0.3 },
  sectionSub: { fontSize: 11, color: Colors.text.tertiary },
  refreshBtn: { padding: 8 },
  card: { backgroundColor: Colors.bg.card, borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 0.5, borderColor: Colors.border.subtle },
  cardToday: { borderColor: Colors.accent.gold + '60', borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  dayText: { fontSize: 14, fontWeight: '700', color: Colors.text.primary },
  condBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  condText: { fontSize: 12, fontWeight: '600' },
  tempRow: { flexDirection: 'row', gap: 8, marginBottom: 12, alignItems: 'baseline' },
  tempHigh: { fontSize: 32, fontWeight: '800', color: Colors.text.primary },
  tempLow: { fontSize: 20, color: Colors.text.tertiary },
  detailGrid: { flexDirection: 'row', gap: 16, flexWrap: 'wrap', marginBottom: 12 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontSize: 12, color: Colors.text.secondary },
  sunRow: { flexDirection: 'row', gap: 20, marginBottom: 10 },
  sunItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sunText: { fontSize: 12, color: Colors.text.secondary },
  goldenRow: { backgroundColor: Colors.accent.goldBg, borderRadius: 8, padding: 10, marginBottom: 8 },
  goldenLabel: { fontSize: 11, fontWeight: '700', color: Colors.accent.gold, marginBottom: 4 },
  goldenText: { fontSize: 12, color: Colors.accent.goldLight, marginBottom: 1 },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.status.warning + '12', borderRadius: 6, padding: 8, marginTop: 4 },
  alertText: { fontSize: 11, color: Colors.status.warning, flex: 1 },
  loadingBox: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 20, justifyContent: 'center' },
  loadingText: { fontSize: 13, color: Colors.text.tertiary },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.status.error + '12', borderRadius: 8, padding: 12, marginBottom: 10 },
  errorText: { fontSize: 13, color: Colors.status.error, flex: 1 },
  empty: { flex: 1, backgroundColor: Colors.bg.primary, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyInner: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text.primary, marginTop: 16 },
  emptySub: { fontSize: 14, color: Colors.text.secondary, marginTop: 4, textAlign: 'center' },
});
