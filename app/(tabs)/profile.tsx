import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import { useRouter } from 'expo-router';
import { getCurrentUser, signOut } from '@/utils/auth';
import { getUserFromDatabase } from '@/utils/database';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ProfileAvatar } from '@/components/redesign/ProfileAvatar';
import { StatChip } from '@/components/redesign/StatChip';

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

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
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
        </View>
      </View>
    );
  }

  const vesselInfo = userData?.vesselInfo;
  const contactInfo = userData?.contactInfo;

  const stats = [
    { label: 'Vessels\nTracked', value: '156', color: '#34C759' },
    { label: 'Nautical\nMiles', value: '12.5k', color: '#007AFF' },
    { label: 'Voyages', value: '5 yrs', color: '#FF9500' },
  ];

  const categories = [
    { id: 1, label: 'Navigation', active: true },
    { id: 2, label: 'Safety', active: false },
    { id: 3, label: 'Weather', active: false },
  ];


  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Elegant Header */}
      <View style={[styles.header, { backgroundColor: Theme.colors.iosBlue }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Profile & Settings</Text>
          <Text style={styles.headerSubtitle}>Manage your maritime account</Text>
        </View>
      </View>

      {/* Profile Card */}
      <View style={[styles.profileSection, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
        <View style={styles.profileAvatar}>
          <Text style={styles.avatarIcon}>⚓</Text>
        </View>
        <Text style={[styles.profileName, { color: colors.text }]}>
          {userData?.name || 'Captain'}
        </Text>
        <Text style={[styles.profileEmail, { color: colors.secondaryText }]}>
          {userData?.email || 'No email provided'}
        </Text>
        {vesselInfo && (
          <View style={[styles.vesselBadge, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
            <Text style={[styles.vesselBadgeText, { color: colors.text }]}>
              🚢 {vesselInfo.vesselName}
            </Text>
          </View>
        )}
      </View>

      {/* Vessel Information Section */}
      {vesselInfo && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Vessel Information</Text>

          <View style={[styles.infoCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <View style={styles.infoRow}>
              <IconSymbol name="location.fill" size={20} color={Theme.colors.iosBlue} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>Home Port</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{vesselInfo.homePort}</Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <IconSymbol name="ruler.fill" size={20} color={Theme.colors.iosBlue} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>Dimensions</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {vesselInfo.vesselLength}m × {vesselInfo.vesselBeam}m
                </Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <IconSymbol name="number.circle.fill" size={20} color={Theme.colors.iosBlue} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>Registration</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {vesselInfo.registrationNumber || 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>

        <View style={[styles.infoCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <IconSymbol name="bell.fill" size={20} color={Theme.colors.iosBlue} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#E5E5EA', true: Theme.colors.iosBlue }}
            />
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <IconSymbol name="location.fill" size={20} color={Theme.colors.iosBlue} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Location Services</Text>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{ false: '#E5E5EA', true: Theme.colors.iosBlue }}
            />
          </View>
        </View>
      </View>

      {/* Sustainability Tips */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Sustainable Fishing</Text>

        <View style={[styles.tipsCard, { backgroundColor: Theme.colors.iosTeal + '20' }]}>
          <Text style={[styles.tipsTitle, { color: Theme.colors.iosTeal }]}>
            🌊 Protect Our Oceans
          </Text>
          <Text style={[styles.tipsText, { color: colors.text }]}>
            • Respect minimum size limits{'\n'}
            • Avoid breeding seasons{'\n'}
            • Use eco-friendly gear{'\n'}
            • Report illegal fishing{'\n'}
            • Reduce plastic waste
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}
          onPress={() => Alert.alert('Help', 'Contact support: support@marinetrack.com')}
        >
          <IconSymbol name="questionmark.circle.fill" size={24} color={Theme.colors.iosBlue} />
          <Text style={[styles.actionText, { color: colors.text }]}>Help & Support</Text>
          <IconSymbol name="chevron.right" size={20} color={colors.secondaryText} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}
          onPress={() => Alert.alert('About', 'MarineTrack v1.0 • Built for fishermen')}
        >
          <IconSymbol name="info.circle.fill" size={24} color={Theme.colors.iosBlue} />
          <Text style={[styles.actionText, { color: colors.text }]}>About MarineTrack</Text>
          <IconSymbol name="chevron.right" size={20} color={colors.secondaryText} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: Theme.colors.iosRed }]}
          onPress={handleLogout}
        >
          <IconSymbol name="arrow.right.square.fill" size={24} color="#FFFFFF" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerContent: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: Theme.fonts.weights.bold,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: Theme.fonts.weights.medium,
  },
  profileSection: {
    marginHorizontal: 20,
    marginTop: -40,
    marginBottom: 24,
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    ...Theme.shadows.xl,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Theme.colors.iosBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...Theme.shadows.md,
  },
  avatarIcon: {
    fontSize: 48,
  },
  profileName: {
    fontSize: 24,
    fontWeight: Theme.fonts.weights.bold,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    marginBottom: 12,
  },
  vesselBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  vesselBadgeText: {
    fontSize: 14,
    fontWeight: Theme.fonts.weights.semibold,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: Theme.fonts.weights.bold,
    marginBottom: 12,
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    ...Theme.shadows.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: Theme.fonts.weights.semibold,
  },
  infoDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: Theme.fonts.weights.medium,
  },
  tipsCard: {
    padding: 20,
    borderRadius: 16,
    ...Theme.shadows.sm,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: Theme.fonts.weights.bold,
    marginBottom: 12,
  },
  tipsText: {
    fontSize: 15,
    lineHeight: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    ...Theme.shadows.sm,
    gap: 16,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: Theme.fonts.weights.semibold,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    marginTop: 12,
    gap: 12,
    ...Theme.shadows.md,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: Theme.fonts.weights.bold,
  },
  bottomSpacing: {
    height: 40,
  },
});