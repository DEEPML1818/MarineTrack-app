import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, RefreshControl } from 'react-native';
import { Theme } from '@/constants/Theme';
import { AlertBanner, TabBar, VesselCard, SectionHeader, ForecastCard } from '@/components/ui/redesign';
import { useRouter } from 'expo-router';

const tabs = [
  { id: 'route', label: 'Route' },
  { id: 'vessel-models', label: 'Vessel models' },
  { id: 'fisher', label: 'Fisher' },
];

export default function PortsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('route');

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.locationBadge}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>Coastal City</Text>
          </View>
          <Text style={styles.menuIcon}>⚙️</Text>
        </View>
      </View>

      <ScrollView
        style={styles.screen}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.teal} />
        }
      >
        <AlertBanner
          title="WAVE ALERT!"
          message="Waves exceeding 6 meters into the bay"
          variant="warning"
          onPress={() => {}}
        />

        <TabBar tabs={tabs} onTabChange={setActiveTab} initialTab="route" />

        <SectionHeader title="Tracking your fleet" />

        <View style={styles.vesselGrid}>
          <VesselCard
            vesselName="MT Golden Frigga"
            vesselType="Nayarit"
            status="live"
            speed={12.4}
            onPress={() => router.push('/map')}
            showDetails={false}
          />
          <VesselCard
            vesselName="Cargo Express"
            vesselType="Container Ship"
            status="docked"
            speed={0}
            onPress={() => router.push('/map')}
            showDetails={false}
          />
        </View>

        <SectionHeader title="Today's forecast" />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.forecastScroll}>
          <View style={styles.forecastContainer}>
            <ForecastCard
              vesselName="MT Golden Frigga"
              temperature={26}
              windSpeed={4}
              waveHeight={4}
              period="Today flags"
            />
            <ForecastCard
              vesselName="Cargo Express"
              temperature={24}
              windSpeed={3}
              waveHeight={3}
              period="Tomorrow"
            />
          </View>
        </ScrollView>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Theme.colors.offWhite,
  },
  header: {
    backgroundColor: Theme.colors.navy,
    paddingTop: 50,
    paddingBottom: Theme.spacing.base,
    paddingHorizontal: Theme.spacing.base,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.radius.full,
    opacity: 0.15,
  },
  locationIcon: {
    fontSize: Theme.fonts.sizes.base,
    marginRight: Theme.spacing.xs,
  },
  locationText: {
    color: Theme.colors.white,
    fontSize: Theme.fonts.sizes.md,
    fontWeight: Theme.fonts.weights.medium,
  },
  menuIcon: {
    fontSize: Theme.fonts.sizes.lg,
  },
  vesselGrid: {
    paddingHorizontal: Theme.spacing.base,
    gap: Theme.spacing.base,
    marginBottom: Theme.spacing.xl,
  },
  forecastScroll: {
    paddingLeft: Theme.spacing.base,
  },
  forecastContainer: {
    flexDirection: 'row',
    gap: Theme.spacing.base,
    paddingRight: Theme.spacing.base,
  },
  bottomSpacing: {
    height: 100,
  },
});
