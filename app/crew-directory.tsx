import React from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, Linking, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { Phone, Mail, Users } from 'lucide-react-native';
import { useProjects } from '@/contexts/ProjectContext';
import Colors from '@/constants/colors';
import { CrewMember, Department } from '@/types';

const DEPT_LABELS: Record<Department, string> = {
  direction: 'Direction', camera: 'Camera', sound: 'Sound', art: 'Art',
  lighting: 'Lighting', production: 'Production', talent: 'Talent', postProduction: 'Post-Production',
};

function CrewCard({ member }: { member: CrewMember }) {
  const deptColor = Colors.department[member.department];
  const initials = member.name.split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <View style={styles.crewCard}>
      <View style={[styles.avatar, { backgroundColor: deptColor + '22', borderColor: deptColor + '44' }]}>
        <Text style={[styles.avatarText, { color: deptColor }]}>{initials}</Text>
      </View>
      <View style={styles.crewInfo}>
        <Text style={styles.crewName}>{member.name}</Text>
        <Text style={styles.crewRole}>{member.role}</Text>
      </View>
      <View style={styles.crewActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => { if (Platform.OS !== 'web') Linking.openURL(`tel:${member.phone}`); }} activeOpacity={0.7}>
          <Phone color={Colors.text.tertiary} size={16} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => Linking.openURL(`mailto:${member.email}`)} activeOpacity={0.7}>
          <Mail color={Colors.text.tertiary} size={16} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function CrewDirectoryScreen() {
  const { crew } = useProjects();

  const sections = React.useMemo(() => {
    const grouped: Record<string, CrewMember[]> = {};
    crew.forEach(member => {
      const dept = member.department;
      if (!grouped[dept]) grouped[dept] = [];
      grouped[dept].push(member);
    });
    return Object.entries(grouped).map(([dept, data]) => ({
      title: DEPT_LABELS[dept as Department] ?? dept,
      department: dept as Department,
      data,
    }));
  }, [crew]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Crew Directory' }} />
      <View style={styles.statsBar}>
        <Users color={Colors.accent.gold} size={16} />
        <Text style={styles.statsText}>{crew.length} member{crew.length !== 1 ? 's' : ''}</Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <CrewCard member={item} />}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: Colors.department[section.department] }]} />
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionCount}>{section.data.length}</Text>
          </View>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Users color={Colors.text.tertiary} size={48} />
            <Text style={styles.emptyTitle}>No crew members</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  statsBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: Colors.bg.secondary, borderBottomWidth: 0.5, borderBottomColor: Colors.border.subtle, gap: 8 },
  statsText: { flex: 1, fontSize: 14, fontWeight: '600' as const, color: Colors.text.primary },
  list: { padding: 16, paddingBottom: 40 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, marginTop: 8, gap: 8 },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { flex: 1, fontSize: 14, fontWeight: '700' as const, color: Colors.text.primary, textTransform: 'uppercase' as const, letterSpacing: 1 },
  sectionCount: { fontSize: 12, color: Colors.text.tertiary, fontWeight: '600' as const },
  crewCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg.card, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 0.5, borderColor: Colors.border.subtle },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, marginRight: 12 },
  avatarText: { fontSize: 15, fontWeight: '700' as const },
  crewInfo: { flex: 1 },
  crewName: { fontSize: 15, fontWeight: '600' as const, color: Colors.text.primary },
  crewRole: { fontSize: 12, color: Colors.text.secondary, marginTop: 2 },
  crewActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.bg.elevated, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600' as const, color: Colors.text.primary, marginTop: 16 },
});
