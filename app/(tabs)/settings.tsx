import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [locationEnabled, setLocationEnabled] = React.useState(true);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Settings & Profile</Text>
        <Text style={styles.headerSubtitle}>Manage your account</Text>
      </View>

      <View style={[styles.profileSection, { backgroundColor: colors.card }]}>
        <View style={styles.profileAvatar}>
          <Text style={styles.avatarIcon}>👤</Text>
        </View>
        <Text style={[styles.profileName, { color: colors.text }]}>Captain John Doe</Text>
        <Text style={[styles.profileEmail, { color: colors.icon }]}>john.doe@email.com</Text>
        <Text style={[styles.vesselInfo, { color: colors.icon }]}>
          🚢 Sea Explorer • ID: V12345
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Vessel Information</Text>
        <TouchableOpacity
          style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Text style={[styles.settingLabel, { color: colors.text }]}>Vessel Name</Text>
          <View style={styles.settingRight}>
            <Text style={[styles.settingValue, { color: colors.icon }]}>Sea Explorer</Text>
            <Text style={[styles.chevron, { color: colors.icon }]}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Text style={[styles.settingLabel, { color: colors.text }]}>Vessel ID</Text>
          <View style={styles.settingRight}>
            <Text style={[styles.settingValue, { color: colors.icon }]}>V12345</Text>
            <Text style={[styles.chevron, { color: colors.icon }]}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Text style={[styles.settingLabel, { color: colors.text }]}>Role</Text>
          <View style={styles.settingRight}>
            <Text style={[styles.settingValue, { color: colors.icon }]}>Fisherman</Text>
            <Text style={[styles.chevron, { color: colors.icon }]}>›</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>
        <View
          style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Text style={[styles.settingLabel, { color: colors.text }]}>
            Push Notifications
          </Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        <View
          style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Text style={[styles.settingLabel, { color: colors.text }]}>
            Location Services
          </Text>
          <Switch
            value={locationEnabled}
            onValueChange={setLocationEnabled}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Emergency Contacts</Text>
        <TouchableOpacity
          style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Text style={[styles.settingLabel, { color: colors.text }]}>
            Manage Contacts
          </Text>
          <Text style={[styles.chevron, { color: colors.icon }]}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Sustainable Fishing Tips
        </Text>
        <View style={[styles.tipsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.tipsTitle, { color: colors.primary }]}>
            🌊 Protect Our Oceans
          </Text>
          <Text style={[styles.tipsText, { color: colors.text }]}>
            • Respect minimum size limits for fish{'\n'}
            • Avoid overfishing in breeding seasons{'\n'}
            • Use eco-friendly fishing gear{'\n'}
            • Report illegal fishing activities{'\n'}
            • Reduce plastic waste at sea
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: colors.danger }]}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  profileSection: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0077BE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarIcon: {
    fontSize: 40,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  vesselInfo: {
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 15,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 15,
  },
  chevron: {
    fontSize: 20,
  },
  tipsCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tipsText: {
    fontSize: 14,
    lineHeight: 24,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
