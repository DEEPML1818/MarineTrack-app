import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, StatusBar, TouchableOpacity, ImageBackground, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../constants/Theme';
import { getNearbyTrackedVessels } from '../../utils/trackingService';
import { getCurrentWeather } from '../../utils/weatherApi';
import { getNearbyHazards } from '../../utils/maritimeIntelligence';
import * as Location from 'expo-location';
import MaritimeDashboard from '../../components/MaritimeDashboard';

export default function HomeScreen() {
  const router = useRouter();
  const [vessels, setVessels] = useState<any[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [hazards, setHazards] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    requestLocationAndLoadData();
    
    // Set up location watching for real-time updates
    let locationSubscription: any;
    const watchLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 30000, // Update every 30 seconds
            distanceInterval: 100, // Or when moved 100 meters
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

      console.log('Current location:', coords.lat.toFixed(4), coords.lng.toFixed(4));
      setUserLocation(coords);
      await loadData(coords);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Location Error', 'Could not get your current location. Please try again.');
    }
  };

  const loadData = async (coords: { lat: number; lng: number }) => {
    try {
      // Load real nearby vessels
      const nearbyVessels = await getNearbyTrackedVessels(coords.lat, coords.lng, 10);
      setVessels(nearbyVessels);

      // Load real weather data
      const weatherData = await getCurrentWeather(coords.lat, coords.lng);
      setWeather(weatherData);

      // Load real maritime hazards
      const hazardData = await getNearbyHazards(coords.lat, coords.lng, 50);
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.navy} />

      {/* Header with gradient */}
      <LinearGradient
        colors={[Theme.colors.espresso, Theme.colors.coffeeBrown]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.headerTitle}>⚓ MarineTrack</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push('/notifications')}
          >
            <Text style={styles.notificationIcon}>🔔</Text>
            {hazards.length > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{hazards.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.screen}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.teal} />
        }
      >
        {/* Hero Alert Banner - ZUS style */}
        {hazards.length > 0 && (
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800' }}
            style={styles.heroBanner}
            imageStyle={styles.heroBannerImage}
          >
            <LinearGradient
              colors={['rgba(217, 151, 87, 0.95)', 'rgba(217, 151, 87, 0.75)']}
              style={styles.heroBannerGradient}
            >
              <View style={styles.heroBannerContent}>
                <Text style={styles.heroBannerTitle}>⚠️ Maritime Advisory</Text>
                <Text style={styles.heroBannerSubtitle}>
                  {hazards.length} active {hazards.length === 1 ? 'hazard' : 'hazards'} in your area
                </Text>
                <TouchableOpacity style={styles.heroBannerButton}>
                  <Text style={styles.heroBannerButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </ImageBackground>
        )}

        {/* Quick Stats - Elevated cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>🚢</Text>
            </View>
            <Text style={styles.statValue}>{vessels.length}</Text>
            <Text style={styles.statLabel}>Nearby Vessels</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(192, 90, 43, 0.1)' }]}>
              <Text style={styles.statIcon}>⚠️</Text>
            </View>
            <Text style={[styles.statValue, { color: Theme.colors.caramel }]}>{hazards.length}</Text>
            <Text style={styles.statLabel}>Hazards</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(232, 211, 184, 0.5)' }]}>
              <Text style={styles.statIcon}>🌡️</Text>
            </View>
            <Text style={styles.statValue}>{weather?.temperature || '--'}°</Text>
            <Text style={styles.statLabel}>Temperature</Text>
          </View>
        </View>

        {/* Weather Card - ZUS rounded elevated card */}
        {weather && (
          <View style={styles.weatherCard}>
            <View style={styles.weatherHeader}>
              <View style={styles.weatherHeaderLeft}>
                <Text style={styles.weatherIcon}>⛅</Text>
                <Text style={styles.weatherTitle}>Current Weather</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/weather')}>
                <Text style={styles.weatherAction}>Details →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.weatherContent}>
              <View style={styles.weatherTempContainer}>
                <Text style={styles.weatherTemp}>{weather.temperature}</Text>
                <Text style={styles.weatherTempUnit}>°C</Text>
              </View>
              <View style={styles.weatherDetails}>
                <View style={styles.weatherDetailItem}>
                  <Text style={styles.weatherDetailIcon}>💨</Text>
                  <Text style={styles.weatherDetail}>Wind {weather.windSpeed} kn</Text>
                </View>
                <View style={styles.weatherDetailItem}>
                  <Text style={styles.weatherDetailIcon}>🌊</Text>
                  <Text style={styles.weatherDetail}>Waves {weather.waveHeight}m</Text>
                </View>
                <View style={styles.weatherDetailItem}>
                  <Text style={styles.weatherDetailIcon}>☁️</Text>
                  <Text style={styles.weatherDetail}>{weather.description}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Quick Actions - Horizontal chips style */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/tracker')}>
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>📍</Text>
              </View>
              <Text style={styles.actionLabel}>Start Tracking</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/map')}>
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>🗺️</Text>
              </View>
              <Text style={styles.actionLabel}>View Map</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/sos')}>
              <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(192, 90, 43, 0.1)' }]}>
                <Text style={styles.actionIcon}>🆘</Text>
              </View>
              <Text style={styles.actionLabel}>Emergency</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/chat')}>
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>💬</Text>
              </View>
              <Text style={styles.actionLabel}>Messages</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Nearby Vessels - Elevated cards with imagery */}
        {vessels.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Nearby Vessels</Text>
              <TouchableOpacity onPress={() => router.push('/tracker')}>
                <Text style={styles.sectionAction}>View All →</Text>
              </TouchableOpacity>
            </View>
            {vessels.slice(0, 5).map((vessel, index) => (
              <View key={index} style={styles.vesselCard}>
                <View style={styles.vesselBadge}>
                  <Text style={styles.vesselBadgeText}>{vessel.status || 'LIVE'}</Text>
                </View>
                <View style={styles.vesselHeader}>
                  <Text style={styles.vesselName}>{vessel.vesselInfo?.vesselName || 'Unknown Vessel'}</Text>
                </View>
                <Text style={styles.vesselType}>{vessel.vesselInfo?.vesselType || 'Vessel'}</Text>
                <View style={styles.vesselMeta}>
                  <View style={styles.vesselMetaItem}>
                    <Text style={styles.vesselMetaIcon}>📍</Text>
                    <Text style={styles.vesselMetaText}>
                      {vessel.distance ? `${vessel.distance.toFixed(1)} km` : 'Nearby'}
                    </Text>
                  </View>
                  <View style={styles.vesselMetaItem}>
                    <Text style={styles.vesselMetaIcon}>💨</Text>
                    <Text style={styles.vesselMetaText}>
                      {vessel.location?.speed?.toFixed(1) || '0'} kn
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.vesselTrackButton}>
                  <Text style={styles.vesselTrackButtonText}>Track Now</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Maritime Intelligence Dashboard */}
        <MaritimeDashboard userLocation={userLocation} />

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Theme.colors.foam,
  },
  header: {
    paddingTop: 50,
    paddingBottom: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.base,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: Theme.fonts.sizes.sm,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: Theme.colors.white,
    fontSize: Theme.fonts.sizes.xxl,
    fontWeight: Theme.fonts.weights.bold,
    fontFamily: Theme.fonts.heading,
  },
  notificationButton: {
    width: Theme.touchTarget.min,
    height: Theme.touchTarget.min,
    borderRadius: Theme.radius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationIcon: {
    fontSize: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Theme.colors.coral,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Theme.colors.white,
  },
  notificationBadgeText: {
    color: Theme.colors.white,
    fontSize: 10,
    fontWeight: Theme.fonts.weights.bold,
  },
  // Hero Banner
  heroBanner: {
    marginHorizontal: Theme.spacing.base,
    marginTop: -Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
    height: 140,
  },
  heroBannerImage: {
    borderRadius: Theme.radius.lg,
  },
  heroBannerGradient: {
    flex: 1,
    padding: Theme.spacing.lg,
    justifyContent: 'center',
  },
  heroBannerContent: {
    gap: Theme.spacing.xs,
  },
  heroBannerTitle: {
    fontSize: Theme.fonts.sizes.xl,
    fontWeight: Theme.fonts.weights.bold,
    color: Theme.colors.white,
    fontFamily: Theme.fonts.heading,
  },
  heroBannerSubtitle: {
    fontSize: Theme.fonts.sizes.md,
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: Theme.spacing.sm,
  },
  heroBannerButton: {
    alignSelf: 'flex-start',
    backgroundColor: Theme.colors.white,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.radius.full,
  },
  heroBannerButtonText: {
    color: Theme.colors.coral,
    fontSize: Theme.fonts.sizes.md,
    fontWeight: Theme.fonts.weights.bold,
  },
  // Stats Cards
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Theme.spacing.base,
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Theme.colors.white,
    padding: Theme.spacing.base,
    borderRadius: Theme.radius.lg,
    alignItems: 'center',
    ...Theme.shadows.md,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: Theme.radius.md,
    backgroundColor: 'rgba(122, 111, 79, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.sm,
  },
  statIcon: {
    fontSize: 24,
  },
  statValue: {
    fontSize: Theme.fonts.sizes.xxl,
    fontWeight: Theme.fonts.weights.bold,
    color: Theme.colors.teal,
    fontFamily: Theme.fonts.heading,
  },
  statLabel: {
    fontSize: Theme.fonts.sizes.xs,
    color: Theme.colors.mutedGray,
    marginTop: 4,
    textAlign: 'center',
  },
  // Weather Card
  weatherCard: {
    backgroundColor: Theme.colors.white,
    marginHorizontal: Theme.spacing.base,
    marginBottom: Theme.spacing.lg,
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.lg,
    ...Theme.shadows.md,
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  weatherHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  weatherIcon: {
    fontSize: 28,
  },
  weatherTitle: {
    fontSize: Theme.fonts.sizes.lg,
    fontWeight: Theme.fonts.weights.bold,
    color: Theme.colors.navy,
    fontFamily: Theme.fonts.heading,
  },
  weatherAction: {
    fontSize: Theme.fonts.sizes.md,
    fontWeight: Theme.fonts.weights.semibold,
    color: Theme.colors.teal,
  },
  weatherContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xl,
  },
  weatherTempContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  weatherTemp: {
    fontSize: 56,
    fontWeight: Theme.fonts.weights.bold,
    color: Theme.colors.teal,
    fontFamily: Theme.fonts.heading,
    lineHeight: 56,
  },
  weatherTempUnit: {
    fontSize: Theme.fonts.sizes.xl,
    color: Theme.colors.teal,
    fontWeight: Theme.fonts.weights.semibold,
    marginTop: 8,
  },
  weatherDetails: {
    flex: 1,
    gap: Theme.spacing.sm,
  },
  weatherDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  weatherDetailIcon: {
    fontSize: 16,
  },
  weatherDetail: {
    fontSize: Theme.fonts.sizes.md,
    color: Theme.colors.mutedGray,
  },
  // Actions
  actionsContainer: {
    paddingHorizontal: Theme.spacing.base,
    marginBottom: Theme.spacing.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.md,
    marginTop: Theme.spacing.md,
  },
  actionCard: {
    width: '47%',
    backgroundColor: Theme.colors.white,
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.lg,
    alignItems: 'center',
    ...Theme.shadows.sm,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: Theme.radius.md,
    backgroundColor: 'rgba(232, 211, 184, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.md,
  },
  actionIcon: {
    fontSize: 28,
  },
  actionLabel: {
    fontSize: Theme.fonts.sizes.md,
    fontWeight: Theme.fonts.weights.semibold,
    color: Theme.colors.navy,
    textAlign: 'center',
  },
  // Section
  section: {
    paddingHorizontal: Theme.spacing.base,
    marginBottom: Theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.base,
  },
  sectionTitle: {
    fontSize: Theme.fonts.sizes.lg,
    fontWeight: Theme.fonts.weights.bold,
    color: Theme.colors.navy,
    fontFamily: Theme.fonts.heading,
  },
  sectionAction: {
    fontSize: Theme.fonts.sizes.md,
    fontWeight: Theme.fonts.weights.semibold,
    color: Theme.colors.teal,
  },
  // Vessel Cards
  vesselCard: {
    backgroundColor: Theme.colors.white,
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.lg,
    marginBottom: Theme.spacing.md,
    ...Theme.shadows.md,
    position: 'relative',
  },
  vesselBadge: {
    position: 'absolute',
    top: Theme.spacing.base,
    right: Theme.spacing.base,
    backgroundColor: Theme.colors.teal,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: Theme.radius.full,
  },
  vesselBadgeText: {
    color: Theme.colors.white,
    fontSize: 10,
    fontWeight: Theme.fonts.weights.bold,
    letterSpacing: 0.5,
  },
  vesselHeader: {
    marginBottom: Theme.spacing.xs,
  },
  vesselName: {
    fontSize: Theme.fonts.sizes.lg,
    fontWeight: Theme.fonts.weights.bold,
    color: Theme.colors.navy,
    fontFamily: Theme.fonts.heading,
    paddingRight: 60,
  },
  vesselType: {
    fontSize: Theme.fonts.sizes.sm,
    color: Theme.colors.mutedGray,
    marginBottom: Theme.spacing.md,
  },
  vesselMeta: {
    flexDirection: 'row',
    gap: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  vesselMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  vesselMetaIcon: {
    fontSize: 14,
  },
  vesselMetaText: {
    fontSize: Theme.fonts.sizes.sm,
    color: Theme.colors.mutedGray,
    fontWeight: Theme.fonts.weights.medium,
  },
  vesselTrackButton: {
    backgroundColor: Theme.colors.teal,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.radius.md,
    alignItems: 'center',
  },
  vesselTrackButtonText: {
    color: Theme.colors.white,
    fontSize: Theme.fonts.sizes.base,
    fontWeight: Theme.fonts.weights.bold,
  },
  bottomSpacing: {
    height: 100,
  },
});