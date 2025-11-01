import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { NEARBY_VESSELS, MAJOR_PORTS, getVesselIcon } from '@/utils/marineData';
import { fetchStormGlassWeather, getMockWeatherData } from '@/utils/weatherApi';
import { getNearbyTrackedVessels } from '@/utils/trackingService';
import * as Location from 'expo-location';
import LiveMap from '@/components/LiveMap';

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState(false);
  const [weatherData, setWeatherData] = useState(getMockWeatherData());
  const [nearbyPorts, setNearbyPorts] = useState(MAJOR_PORTS.slice(0, 3));
  const [trackedVessels, setTrackedVessels] = useState<any[]>([]);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (userLocation) {
      loadWeatherForLocation();
      updateNearbyPorts();
      loadTrackedVessels();

      // Auto-refresh every 10 seconds
      const interval = setInterval(() => {
        loadWeatherForLocation();
        loadTrackedVessels();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [userLocation]);

  const loadTrackedVessels = async () => {
    if (!userLocation) return;
    try {
      const vessels = await getNearbyTrackedVessels(userLocation.lat, userLocation.lng, 10);
      setTrackedVessels(vessels);
    } catch (error) {
      console.error('Error fetching tracked vessels:', error);
      // Potentially show a user-friendly message here
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        getCurrentLocation();
        // Watch position for continuous updates
        Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 10000,
            distanceInterval: 50,
          },
          (location) => {
            setUserLocation({
              lat: location.coords.latitude,
              lng: location.coords.longitude,
            });
          }
        );
      } else {
        Alert.alert(
          'Location Permission Required',
          'This app needs location access to show nearby vessels and weather data.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setUserLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      // Handle cases where location can't be fetched even with permission
      Alert.alert(
        'Location Error',
        'Could not fetch your current location. Please try again or check your device settings.',
        [{ text: 'OK' }]
      );
    }
  };

  const loadWeatherForLocation = async () => {
    if (!userLocation) return;

    try {
      const data = await fetchStormGlassWeather(userLocation.lat, userLocation.lng);
      if (data) {
        setWeatherData(data);
      }
      // Silently fail if no data - no alerts or console warnings
    } catch (error) {
      // Silently fail - no alerts or console errors
    }
  };

  const updateNearbyPorts = () => {
    if (!userLocation) return;
    // Calculate distance to each port and sort by proximity
    const portsWithDistance = MAJOR_PORTS.map(port => ({
      ...port,
      distance: calculateDistance(userLocation.lat, userLocation.lng, port.lat, port.lng)
    }));
    const nearby = portsWithDistance.sort((a, b) => a.distance - b.distance).slice(0, 3);
    setNearbyPorts(nearby);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Combine static vessels with real tracked vessels
  const nearbyVessels = [
    ...NEARBY_VESSELS,
    ...trackedVessels.map(tv => ({
      id: tv.userId, // Assuming userId is unique for each tracked vessel
      name: tv.vesselInfo.vesselName,
      type: tv.vesselInfo.vesselType,
      distance: `${calculateDistance(userLocation?.lat || 0, userLocation?.lng || 0, tv.location.latitude, tv.location.longitude).toFixed(1)} km`,
      status: tv.status,
      speed: `${tv.location.speed?.toFixed(1) || '0'} kn`,
      heading: `${tv.location.heading?.toFixed(0) || 'N/A'}°`,
      lastUpdate: new Date(tv.location.timestamp).toLocaleTimeString(),
    }))
  ];

  if (!locationPermission) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <Text style={styles.headerTitle}>⚓ MarineTrack</Text>
          <Text style={styles.headerSubtitle}>Your Maritime Command Center</Text>
        </View>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionIcon}>📍</Text>
          <Text style={[styles.permissionTitle, { color: colors.text }]}>
            Location Permission Required
          </Text>
          <Text style={[styles.permissionText, { color: colors.icon }]}>
            Please enable location access to use MarineTrack features like nearby vessels and weather data.
          </Text>
          <TouchableOpacity
            style={[styles.permissionButton, { backgroundColor: colors.primary }]}
            onPress={requestLocationPermission}
          >
            <Text style={styles.permissionButtonText}>Enable Location</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!userLocation) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <Text style={styles.headerTitle}>⚓ MarineTrack</Text>
          <Text style={styles.headerSubtitle}>Getting your location...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingIcon}>🌍</Text>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Fetching GPS coordinates...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>⚓ MarineTrack</Text>
        <Text style={styles.headerSubtitle}>Your Maritime Command Center</Text>
        {userLocation && (
          <View style={styles.locationBadge}>
            <Text style={styles.locationText}>
              📍 {userLocation.lat.toFixed(4)}°N, {userLocation.lng.toFixed(4)}°E
            </Text>
          </View>
        )}
      </View>

      {/* Map Section with improved styling */}
      <View style={[styles.weatherCard, { backgroundColor: colors.card }]}>
        {/* LiveMap component should be configured to accept props like userLocation for centering */}
        {/* Ensure LiveMap is correctly implemented to handle map display on mobile */}
        <LiveMap userLocation={userLocation} /> 
      </View>

      {/* Weather Bar with improved styling */}
      <View style={[styles.weatherBar, { backgroundColor: colors.card }]}>
        <View style={styles.weatherItem}>
          <Text style={styles.weatherIcon}>🌡️</Text>
          <Text style={[styles.weatherValue, { color: colors.text }]}>{weatherData.temperature !== undefined ? weatherData.temperature.toFixed(1) : 'N/A'}°C</Text>
          <Text style={[styles.weatherLabel, { color: colors.icon }]}>Temp</Text>
        </View>
        <View style={styles.weatherItem}>
          <Text style={styles.weatherIcon}>💨</Text>
          <Text style={[styles.weatherValue, { color: colors.text }]}>{weatherData.windSpeed !== undefined ? weatherData.windSpeed.toFixed(1) : 'N/A'} km/h</Text>
          <Text style={[styles.weatherLabel, { color: colors.icon }]}>Wind</Text>
        </View>
        <View style={styles.weatherItem}>
          <Text style={styles.weatherIcon}>🌊</Text>
          <Text style={[styles.weatherValue, { color: colors.text }]}>{weatherData.waveHeight !== undefined ? weatherData.waveHeight.toFixed(1) : 'N/A'} m</Text>
          <Text style={[styles.weatherLabel, { color: colors.icon }]}>Waves</Text>
        </View>
        <View style={styles.weatherItem}>
          <Text style={styles.weatherIcon}>👁️</Text>
          <Text style={[styles.weatherValue, { color: colors.text }]}>{weatherData.visibility !== undefined ? weatherData.visibility.toFixed(1) : 'N/A'} km</Text>
          <Text style={[styles.weatherLabel, { color: colors.icon }]}>Visibility</Text>
        </View>
      </View>

      <ScrollView style={styles.vesselsContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Nearby Vessels ({nearbyVessels.length})</Text>
        {nearbyVessels.map((vessel) => (
          <View
            key={vessel.id}
            style={[styles.vesselCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.vesselInfo}>
              <Text style={[styles.vesselName, { color: colors.text }]}>
                {getVesselIcon(vessel.type)} {vessel.name}
              </Text>
              <Text style={[styles.vesselId, { color: colors.icon }]}>{vessel.id} • {vessel.type}</Text>
              <Text style={[styles.vesselDetail, { color: colors.icon }]}>
                Speed: {vessel.speed} • Heading: {vessel.heading}
              </Text>
            </View>
            <View style={styles.vesselStats}>
              <Text style={[styles.vesselDistance, { color: colors.primary }]}>
                {vessel.distance}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      vessel.status === 'Active' ? colors.accent : 
                      vessel.status === 'Anchored' ? colors.secondary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.statusText, { color: colors.text }]}>
                  {vessel.status}
                </Text>
              </View>
              <Text style={[styles.lastUpdate, { color: colors.icon }]}>
                {vessel.lastUpdate}
              </Text>
            </View>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>Nearby Ports</Text>
        {nearbyPorts.map((port: any) => (
          <View
            key={port.id}
            style={[styles.portCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.portName, { color: colors.text }]}>⚓ {port.name}</Text>
            <Text style={[styles.portDetails, { color: colors.icon }]}>
              {port.country} • {port.type}
            </Text>
            <View style={styles.portStats}>
              <Text style={[styles.portVessels, { color: colors.primary }]}>
                {port.vessels} vessels
              </Text>
              <Text style={[styles.portCoords, { color: colors.icon }]}>
                {port.distance ? `${port.distance.toFixed(1)} km away` : `${port.lat.toFixed(4)}°N, ${port.lng.toFixed(4)}°E`}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.danger }]}
        >
          <Text style={styles.actionIcon}>🚨</Text>
          <Text style={styles.actionText}>SOS</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.actionIcon}>⚠️</Text>
          <Text style={styles.actionText}>Weather</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.secondary }]}
        >
          <Text style={styles.actionIcon}>🎣</Text>
          <Text style={styles.actionText}>Fishing</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    borderBottomLeftRadius: 20, // Rounded bottom corners for the header
    borderBottomRightRadius: 20,
    // Consider adding a subtle gradient here if desired and feasible with Colors object
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    // Adding icon to title
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  locationBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent white background
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginTop: 10,
    alignSelf: 'flex-start', // Align to the start of the header
  },
  locationText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  permissionButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
  },
  // Updated Map Section Styling
  mapSection: {
    margin: 16,
    // Additional styling for the map container if needed
    borderRadius: 12,
    overflow: 'hidden', // To ensure map respects border radius
    // Consider adding shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  coordinates: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  // Enhanced Weather Bar Styling
  weatherBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    // Consider gradient or shadow for better visual appeal
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  weatherItem: {
    alignItems: 'center',
    paddingHorizontal: 8, // Added padding for better spacing
  },
  weatherIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  weatherValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  weatherLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  vesselsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  // Enhanced Vessel Card Styling
  vesselCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  vesselInfo: {
    flex: 1,
  },
  vesselName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  vesselId: {
    fontSize: 12,
    marginTop: 2,
  },
  vesselDetail: {
    fontSize: 11,
    marginTop: 4,
  },
  vesselStats: {
    alignItems: 'flex-end',
  },
  vesselDistance: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  lastUpdate: {
    fontSize: 10,
  },
  // Enhanced Port Card Styling
  portCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  portName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  portDetails: {
    fontSize: 12,
    marginBottom: 8,
  },
  portStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  portVessels: {
    fontSize: 13,
    fontWeight: '600',
  },
  portCoords: {
    fontSize: 11,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Updated Weather Card Style
  weatherCard: {
    margin: 16,
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
});