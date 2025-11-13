import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, StatusBar, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { QuickActionTile } from '@/components/redesign/QuickActionTile';
import { WeatherWidget } from '@/components/redesign/WeatherWidget';
import { StatChip } from '@/components/redesign/StatChip';
import { Card } from '@/components/redesign/Card';
import { SectionHeader } from '@/components/redesign/SectionHeader';
import { Badge } from '@/components/redesign/Badge';
import { getNearbyTrackedVessels } from '@/utils/trackingService';
import { getCurrentWeather } from '@/utils/weatherApi';
import { getNearbyHazards } from '@/utils/maritimeIntelligence';
import * as Location from 'expo-location';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const [vessels, setVessels] = useState<any[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [hazards, setHazards] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    requestLocationAndLoadData();

    let locationSubscription: any;
    const watchLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 30000,
            distanceInterval: 100,
          },
          (location) => {
            const coords = {
              lat: location.coords.latitude,
              lng: location.coords.longitude,
            };
            setUserLocation(coords);
            loadData(coords);
          }
        );
      }
    };

    watchLocation();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  const requestLocationAndLoadData = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        Alert.alert(
          'Location Permission Required',
          'Please enable location services to see real-time weather and maritime data for your area.'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };

      setUserLocation(coords);
      await loadData(coords);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Location Error', 'Could not get your current location. Please try again.');
    }
  };

  const loadData = async (coords: { lat: number; lng: number }) => {
    try {
      const [nearbyVessels, weatherData, hazardData] = await Promise.all([
        getNearbyTrackedVessels(coords.lat, coords.lng, 10),
        getCurrentWeather(coords.lat, coords.lng),
        getNearbyHazards(coords.lat, coords.lng, 50),
      ]);

      setVessels(nearbyVessels);
      setWeather(weatherData);
      setHazards(hazardData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (userLocation) {
      await loadData(userLocation);
    }
    setRefreshing(false);
  };

  const quickActions = [
    { id: '1', icon: 'cloud.fill', label: 'Weather', color: Theme.colors.iosOrange, route: '/weather' },
    { id: '2', icon: 'exclamationmark.triangle.fill', label: 'SOS Alert', color: Theme.colors.iosRed, route: '/sos' },
    { id: '3', icon: 'anchor.fill', label: 'Ports', color: Theme.colors.iosPurple, route: '/ports' },
    { id: '4', icon: 'bell.fill', label: 'Alerts', color: Theme.colors.iosTeal, route: '/notifications' },
    { id: '5', icon: 'gear', label: 'Settings', color: Theme.colors.gray5, route: '/settings' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View>
          <Text style={[styles.appName, { color: colors.text }]}>MarineTrack</Text>
          <Text style={[styles.appSubtitle, { color: colors.secondaryText }]}>Professional Maritime Suite</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            style={[styles.headerIconButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} 
            onPress={() => router.push('/notifications')}
          >
            <IconSymbol name="bell.fill" size={20} color={colors.text} />
            {hazards.length > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{hazards.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>
            Welcome back, Captain
          </Text>
          <Text style={[styles.welcomeDate, { color: colors.secondaryText }]}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </Text>
        </View>

        {weather && (
          <View style={styles.weatherContainer}>
            <WeatherWidget
              temperature={`${weather.temperature}°F`}
              condition="Sunny"
              emoji="☀️"
              subtitle="Perfect for sailing!"
            />
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>
          What would you like to do today?
        </Text>

        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <QuickActionTile
              key={action.id}
              icon={action.icon}
              label={action.label}
              color={action.color}
              onPress={() => action.route && router.push(action.route as any)}
            />
          ))}
        </View>

        <View style={styles.statsRow}>
          <StatChip value={vessels.length.toString()} label={`Nearby\nVessels`} color="#007AFF" />
          <StatChip value={hazards.length.toString()} label={`Active\nHazards`} color="#FF9500" />
          <StatChip value={weather ? `${weather.windSpeed}kn` : '--'} label={`Wind\nSpeed`} color="#34C759" />
        </View>

        {vessels.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Nearby Vessels"
              actionText="View All"
              onActionPress={() => router.push('/tracker')}
            />
            {vessels.slice(0, 3).map((vessel, index) => (
              <Card key={index} style={styles.vesselCard}>
                <View style={styles.vesselHeader}>
                  <Text style={[styles.vesselName, { color: colors.text }]}>
                    {vessel.vesselInfo?.vesselName || 'Unknown Vessel'}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: '#34C75920' }]}>
                    <Text style={[styles.statusBadgeText, { color: '#34C759' }]}>Live</Text>
                  </View>
                </View>
                <Text style={[styles.vesselType, { color: colors.secondaryText }]}>
                  {vessel.vesselInfo?.vesselType || 'Vessel'}
                </Text>
                <View style={styles.vesselMeta}>
                  <View style={styles.vesselMetaItem}>
                    <IconSymbol name="location.fill" size={14} color={colors.primary} />
                    <Text style={[styles.vesselMetaText, { color: colors.secondaryText }]}>
                      {vessel.distance ? `${vessel.distance.toFixed(1)} km` : 'Nearby'}
                    </Text>
                  </View>
                  <View style={styles.vesselMetaItem}>
                    <IconSymbol name="speedometer" size={14} color={colors.primary} />
                    <Text style={[styles.vesselMetaText, { color: colors.secondaryText }]}>
                      {vessel.location?.speed?.toFixed(1) || '0'} kn
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: 60,
    paddingBottom: Theme.spacing.lg,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: Theme.fonts.sizes.sm,
    marginTop: 2,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Theme.colors.iosRed,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  welcomeSection: {
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  welcomeTitle: {
    fontSize: Theme.fonts.sizes.xxxl,
    fontWeight: Theme.fonts.weights.bold,
    marginBottom: Theme.spacing.xs,
  },
  welcomeDate: {
    fontSize: Theme.fonts.sizes.base,
  },
  weatherContainer: {
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: Theme.fonts.sizes.lg,
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.base,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Theme.spacing.lg,
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xxl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.xxl,
  },
  section: {
    marginBottom: Theme.spacing.xl,
  },
  vesselCard: {
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  vesselHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  vesselName: {
    fontSize: Theme.fonts.sizes.base,
    fontWeight: Theme.fonts.weights.semibold,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.radius.sm,
  },
  statusBadgeText: {
    fontSize: Theme.fonts.sizes.sm,
    fontWeight: Theme.fonts.weights.semibold,
  },
  vesselType: {
    fontSize: Theme.fonts.sizes.md,
    marginBottom: Theme.spacing.md,
  },
  vesselMeta: {
    flexDirection: 'row',
    gap: Theme.spacing.lg,
  },
  vesselMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  vesselMetaText: {
    fontSize: Theme.fonts.sizes.md,
  },
  bottomSpacing: {
    height: 100,
  },
});