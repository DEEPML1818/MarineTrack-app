
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function PortsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'All', icon: 'square.grid.2x2' },
    { id: 'live', label: 'Live', icon: 'record.circle' },
    { id: 'docked', label: 'Docked', icon: 'anchor' },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? colors.card : '#FFFFFF', borderBottomColor: isDark ? colors.border : 'rgba(0,0,0,0.05)' }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Fleet</Text>
            <View style={styles.locationRow}>
              <IconSymbol name="location.fill" size={14} color={colors.primary} />
              <Text style={[styles.locationText, { color: colors.secondaryText }]}>Coastal City</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <IconSymbol name="ellipsis.circle" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && [styles.tabActive, { backgroundColor: colors.primary }]
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <IconSymbol 
                name={tab.icon as any} 
                size={18} 
                color={activeTab === tab.id ? '#FFFFFF' : colors.text} 
              />
              <Text style={[
                styles.tabText,
                { color: activeTab === tab.id ? '#FFFFFF' : colors.text }
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Alert Banner */}
        <View style={styles.alertBanner}>
          <View style={styles.alertContent}>
            <View style={styles.alertIcon}>
              <IconSymbol name="exclamationmark.triangle.fill" size={24} color="#FF9500" />
            </View>
            <View style={styles.alertTextContainer}>
              <Text style={styles.alertTitle}>Wave Alert</Text>
              <Text style={styles.alertMessage}>Waves exceeding 6m into the bay</Text>
            </View>
          </View>
        </View>

        {/* Vessel Cards */}
        <View style={styles.vesselsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Fleet</Text>

          <TouchableOpacity 
            style={[styles.vesselCard, { backgroundColor: isDark ? colors.card : '#FFFFFF' }]}
            onPress={() => router.push('/map')}
          >
            <View style={styles.vesselHeader}>
              <View style={styles.vesselAvatar}>
                <Text style={styles.vesselAvatarText}>🚢</Text>
              </View>
              <View style={styles.vesselInfo}>
                <Text style={[styles.vesselName, { color: colors.text }]}>MT Golden Frigga</Text>
                <Text style={[styles.vesselType, { color: colors.secondaryText }]}>Nayarit</Text>
                <View style={styles.vesselStats}>
                  <IconSymbol name="speedometer" size={14} color={colors.secondaryText} />
                  <Text style={[styles.statText, { color: colors.secondaryText }]}>12.4 kts</Text>
                </View>
              </View>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.vesselCard, { backgroundColor: isDark ? colors.card : '#FFFFFF' }]}
            onPress={() => router.push('/map')}
          >
            <View style={styles.vesselHeader}>
              <View style={styles.vesselAvatar}>
                <Text style={styles.vesselAvatarText}>⚓</Text>
              </View>
              <View style={styles.vesselInfo}>
                <Text style={[styles.vesselName, { color: colors.text }]}>Cargo Express</Text>
                <Text style={[styles.vesselType, { color: colors.secondaryText }]}>Container Ship</Text>
                <View style={styles.vesselStats}>
                  <IconSymbol name="speedometer" size={14} color={colors.secondaryText} />
                  <Text style={[styles.statText, { color: colors.secondaryText }]}>0 kts</Text>
                </View>
              </View>
              <View style={[styles.dockedBadge, { backgroundColor: colors.secondaryText }]}>
                <Text style={styles.badgeText}>DOCKED</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Forecast Section */}
        <View style={styles.forecastSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Forecast</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.forecastRow}>
              <View style={[styles.forecastCard, { backgroundColor: isDark ? colors.card : '#FFFFFF' }]}>
                <Text style={[styles.forecastVessel, { color: colors.text }]}>MT Golden Frigga</Text>
                <Text style={[styles.forecastPeriod, { color: colors.secondaryText }]}>Today</Text>
                <View style={styles.forecastStats}>
                  <View style={styles.forecastItem}>
                    <Text style={styles.forecastIcon}>🌡️</Text>
                    <Text style={[styles.forecastValue, { color: colors.text }]}>26°C</Text>
                  </View>
                  <View style={styles.forecastItem}>
                    <Text style={styles.forecastIcon}>💨</Text>
                    <Text style={[styles.forecastValue, { color: colors.text }]}>4 kts</Text>
                  </View>
                  <View style={styles.forecastItem}>
                    <Text style={styles.forecastIcon}>🌊</Text>
                    <Text style={[styles.forecastValue, { color: colors.text }]}>4 m</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.forecastCard, { backgroundColor: isDark ? colors.card : '#FFFFFF' }]}>
                <Text style={[styles.forecastVessel, { color: colors.text }]}>Cargo Express</Text>
                <Text style={[styles.forecastPeriod, { color: colors.secondaryText }]}>Tomorrow</Text>
                <View style={styles.forecastStats}>
                  <View style={styles.forecastItem}>
                    <Text style={styles.forecastIcon}>🌡️</Text>
                    <Text style={[styles.forecastValue, { color: colors.text }]}>24°C</Text>
                  </View>
                  <View style={styles.forecastItem}>
                    <Text style={styles.forecastIcon}>💨</Text>
                    <Text style={[styles.forecastValue, { color: colors.text }]}>3 kts</Text>
                  </View>
                  <View style={styles.forecastItem}>
                    <Text style={styles.forecastIcon}>🌊</Text>
                    <Text style={[styles.forecastValue, { color: colors.text }]}>3 m</Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 0,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tabsContent: {
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  tabActive: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  alertBanner: {
    margin: 16,
    borderRadius: 16,
    backgroundColor: '#FFF3CD',
    padding: 16,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF950020',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#856404',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 14,
    color: '#856404',
  },
  vesselsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  vesselCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  vesselHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vesselAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vesselAvatarText: {
    fontSize: 28,
  },
  vesselInfo: {
    flex: 1,
  },
  vesselName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  vesselType: {
    fontSize: 14,
    marginBottom: 4,
  },
  vesselStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#34C75920',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34C759',
  },
  dockedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  forecastSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  forecastRow: {
    flexDirection: 'row',
    gap: 12,
  },
  forecastCard: {
    width: 180,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  forecastVessel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  forecastPeriod: {
    fontSize: 13,
    marginBottom: 12,
  },
  forecastStats: {
    gap: 8,
  },
  forecastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  forecastIcon: {
    fontSize: 16,
  },
  forecastValue: {
    fontSize: 14,
    fontWeight: '500',
  },
});
