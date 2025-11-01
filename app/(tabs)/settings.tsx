
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { getCurrentUser, signOut } from '@/utils/auth';
import { getUserFromDatabase } from '@/utils/database';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        const dbUser = await getUserFromDatabase(currentUser.id);
        setUserData(dbUser);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading user data:', error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
      </View>
    );
  }

  const vesselInfo = userData?.vesselInfo;
  const contactInfo = userData?.contactInfo;

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
        <Text style={[styles.profileName, { color: colors.text }]}>
          {userData?.name || 'User'}
        </Text>
        <Text style={[styles.profileEmail, { color: colors.icon }]}>
          {userData?.email || 'No email provided'}
        </Text>
        {vesselInfo && (
          <Text style={[styles.vesselInfo, { color: colors.icon }]}>
            🚢 {vesselInfo.vesselName} • {vesselInfo.registrationNumber || 'No ID'}
          </Text>
        )}
      </View>

      {vesselInfo && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Vessel Information</Text>
          <View
            style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.settingLabel, { color: colors.text }]}>Vessel Name</Text>
            <Text style={[styles.settingValue, { color: colors.icon }]}>
              {vesselInfo.vesselName}
            </Text>
          </View>

          <View
            style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.settingLabel, { color: colors.text }]}>Registration Number</Text>
            <Text style={[styles.settingValue, { color: colors.icon }]}>
              {vesselInfo.registrationNumber || 'N/A'}
            </Text>
          </View>

          <View
            style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.settingLabel, { color: colors.text }]}>Vessel Type</Text>
            <Text style={[styles.settingValue, { color: colors.icon }]}>
              {vesselInfo.vesselType}
            </Text>
          </View>

          {vesselInfo.imoNumber && (
            <View
              style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Text style={[styles.settingLabel, { color: colors.text }]}>IMO Number</Text>
              <Text style={[styles.settingValue, { color: colors.icon }]}>
                {vesselInfo.imoNumber}
              </Text>
            </View>
          )}

          <View
            style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.settingLabel, { color: colors.text }]}>Call Sign</Text>
            <Text style={[styles.settingValue, { color: colors.icon }]}>
              {vesselInfo.callSign}
            </Text>
          </View>

          <View
            style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.settingLabel, { color: colors.text }]}>Home Port</Text>
            <Text style={[styles.settingValue, { color: colors.icon }]}>
              {vesselInfo.homePort}
            </Text>
          </View>

          <View
            style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.settingLabel, { color: colors.text }]}>Dimensions</Text>
            <Text style={[styles.settingValue, { color: colors.icon }]}>
              L: {vesselInfo.vesselLength}m × B: {vesselInfo.vesselBeam}m
            </Text>
          </View>

          <View
            style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.settingLabel, { color: colors.text }]}>Gross Tonnage</Text>
            <Text style={[styles.settingValue, { color: colors.icon }]}>
              {vesselInfo.grossTonnage} GT
            </Text>
          </View>
        </View>
      )}

      {contactInfo && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Information</Text>
          <View
            style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.settingLabel, { color: colors.text }]}>Phone Number</Text>
            <Text style={[styles.settingValue, { color: colors.icon }]}>
              {contactInfo.phone}
            </Text>
          </View>

          {contactInfo.email && (
            <View
              style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Text style={[styles.settingLabel, { color: colors.text }]}>Email</Text>
              <Text style={[styles.settingValue, { color: colors.icon }]}>
                {contactInfo.email}
              </Text>
            </View>
          )}

          <View
            style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.settingLabel, { color: colors.text }]}>Emergency Contact</Text>
            <Text style={[styles.settingValue, { color: colors.icon }]}>
              {contactInfo.emergencyContact}
            </Text>
          </View>

          <View
            style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.settingLabel, { color: colors.text }]}>Emergency Phone</Text>
            <Text style={[styles.settingValue, { color: colors.icon }]}>
              {contactInfo.emergencyPhone}
            </Text>
          </View>
        </View>
      )}

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
        onPress={handleLogout}
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
  loadingText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
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
    flex: 1,
  },
  settingValue: {
    fontSize: 15,
    flex: 1,
    textAlign: 'right',
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
