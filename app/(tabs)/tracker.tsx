import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, TextInput, ScrollView, Alert, Platform } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Theme } from '@/constants/Theme';
import { Colors } from '@/constants/Colors';
import { AddItemModal } from '@/components/redesign/AddItemModal';
import * as Location from 'expo-location';
import { getCurrentUser, updateVesselInfo } from '@/utils/auth';
import { sendTrackingData, startTracking, getNearbyTrackedVessels } from '@/utils/trackingService';
import { saveBoatData } from '@/utils/database';

// Constants for StormGlass API interaction
const STORMGLASS_API_URL = 'https://api.stormglass.io/v2/weather/point';
const STORMGLASS_API_KEY = 'YOUR_STORMGLASS_API_KEY'; // Replace with your actual API key
const CACHE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

let lastStormGlassFetchTime = 0;
let cachedWeatherData: any = null;

export default function TrackerScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(0);
  const [vesselInfo, setVesselInfo] = useState({
    vesselName: '',
    vesselId: '',
    vesselType: 'Fishing Vessel',
    mmsi: '',
    imo: '',
  });
  const [status, setStatus] = useState<'Active' | 'Idle' | 'Anchored'>('Idle');
  const [nearbyVessels, setNearbyVessels] = useState<any[]>([]);
  const [trackingSubscription, setTrackingSubscription] = useState<any>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [showAddVesselModal, setShowAddVesselModal] = useState(false);

  // Effect to load initial user data and set up location tracking
  useEffect(() => {
    loadUserVesselInfo();
    loadUserBoatData();

    const requestLocationPermissions = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for tracking and map display.');
        return;
      }

      // Get initial location
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setCurrentLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });
      } catch (error) {
        console.error("Error getting initial location:", error);
        Alert.alert('Location Error', 'Could not retrieve your current location. Please try again.');
      }
    };

    requestLocationPermissions();

    return () => {
      if (trackingSubscription) {
        trackingSubscription.remove();
      }
      // Clear any active intervals if the component unmounts
      if ((trackingSubscription as any)?.updateInterval) {
        clearInterval((trackingSubscription as any).updateInterval);
      }
    };
  }, []);

  // Effect to handle location updates and sending data when tracking is active
  useEffect(() => {
    if (isTracking && currentLocation) {
      sendLocationUpdate();
      loadNearbyVessels();
      fetchWeatherData(currentLocation.latitude, currentLocation.longitude);
    }
  }, [currentLocation, isTracking]);

  

  const loadUserVesselInfo = async () => {
    const user = await getCurrentUser();
    if (user?.vesselInfo) {
      setVesselInfo({
        vesselName: user.vesselInfo.vesselName,
        vesselId: user.vesselInfo.vesselId,
        vesselType: user.vesselInfo.vesselType,
        mmsi: user.vesselInfo.mmsi || '',
        imo: user.vesselInfo.imo || '',
      });
    }
  };

  const loadUserBoatData = async () => {
    const user = await getCurrentUser();
    if (user) {
      const { getBoatData, getUserFromDatabase } = await import('@/utils/database');
      const boat = await getBoatData(user.id);
      const userData = await getUserFromDatabase(user.id);

      if (boat) {
        setVesselInfo({
          vesselName: boat.vesselName || vesselInfo.vesselName,
          vesselId: boat.vesselId || vesselInfo.vesselId,
          vesselType: boat.vesselType || vesselInfo.vesselType,
          mmsi: boat.mmsi || '',
          imo: boat.imo || '',
        });
      } else if (userData?.vesselInfo) {
        setVesselInfo({
          vesselName: userData.vesselInfo.vesselName || vesselInfo.vesselName,
          vesselId: userData.vesselInfo.registrationNumber || vesselInfo.vesselId,
          vesselType: userData.vesselInfo.vesselType || vesselInfo.vesselType,
          mmsi: userData.vesselInfo.imoNumber || '',
          imo: userData.vesselInfo.imoNumber || '',
        });
      }
    }
  };

  const sendLocationUpdate = async () => {
    if (!currentLocation) return;

    const user = await getCurrentUser();
    if (!user) return;

    const trackingData = {
      userId: user.id,
      vesselInfo,
      location: {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        heading,
        speed,
        timestamp: new Date().toISOString(),
      },
      status,
    };

    try {
      await sendTrackingData(trackingData);
    } catch (error) {
      console.error("Error sending location update:", error);
      // Potentially show an error to the user if sending fails repeatedly
    }
  };

  const loadNearbyVessels = async () => {
    if (!currentLocation) return;

    try {
      const vessels = await getNearbyTrackedVessels(
        currentLocation.latitude,
        currentLocation.longitude,
        10 // Search radius in km
      );
      setNearbyVessels(vessels);
    } catch (error) {
      console.error("Error loading nearby vessels:", error);
      // Handle error, perhaps inform the user
    }
  };

  const fetchWeatherData = async (latitude: number, longitude: number) => {
    const now = Date.now();
    // Check if cached data is still valid (within 10 minutes)
    if (cachedWeatherData && (now - lastStormGlassFetchTime < CACHE_EXPIRY_MS)) {
      setWeatherData(cachedWeatherData);
      return;
    }

    // Prevent fetching too frequently
    if (now - lastStormGlassFetchTime < CACHE_EXPIRY_MS) {
      return;
    }

    lastStormGlassFetchTime = now;

    try {
      const response = await fetch(
        `${STORMGLASS_API_URL}?lat=${latitude}&lng=${longitude}&params=waveHeight,windSpeed,airTemperature`,
        {
          headers: {
            'Authorization': STORMGLASS_API_KEY,
          },
        }
      );

      if (!response.ok) {
        // Handle specific error codes, e.g., 402 for invalid API key or exceeding limits
        if (response.status === 402) {
          console.error("StormGlass API error: Payment Required or Quota Exceeded. Please check your API key and usage limits.");
          Alert.alert('Weather API Error', 'Could not fetch weather data. Please check your API key and usage limits.');
          cachedWeatherData = null; // Clear cache if there's an API error
          lastStormGlassFetchTime = 0; // Reset timer to allow retry after 10 mins
        } else {
          console.error(`StormGlass API error: ${response.status} ${response.statusText}`);
          Alert.alert('Weather API Error', `Failed to fetch weather data: ${response.statusText}`);
          cachedWeatherData = null;
          lastStormGlassFetchTime = 0;
        }
        return;
      }

      const data = await response.json();
      cachedWeatherData = data; // Cache the fetched data
      setWeatherData(data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      Alert.alert('Network Error', 'Could not fetch weather data. Please check your internet connection.');
      cachedWeatherData = null;
      lastStormGlassFetchTime = 0; // Reset timer on network error
    }
  };


  const toggleTracking = async () => {
    if (!vesselInfo.vesselName || !vesselInfo.vesselId) {
      Alert.alert('Missing Info', 'Please fill in vessel name and ID before starting tracking');
      return;
    }

    if (!isTracking) {
      // Request permissions if not already granted
      const { status: permissionStatus } = await Location.requestForegroundPermissionsAsync();
      if (permissionStatus !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for tracking');
        return;
      }

      // Save vessel info to both auth and database
      await updateVesselInfo({
        vesselName: vesselInfo.vesselName,
        vesselId: vesselInfo.vesselId,
        vesselType: vesselInfo.vesselType,
        mmsi: vesselInfo.mmsi,
        imo: vesselInfo.imo,
      });

      const user = await getCurrentUser();
      if (user) {
        await saveBoatData({
          userId: user.id,
          vesselName: vesselInfo.vesselName,
          vesselId: vesselInfo.vesselId,
          vesselType: vesselInfo.vesselType,
          mmsi: vesselInfo.mmsi,
          imo: vesselInfo.imo,
          updatedAt: new Date().toISOString(),
        });
      }

      // Get initial location
      let location;
      try {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
      } catch (error) {
        console.error("Error getting current position:", error);
        Alert.alert('Location Error', 'Could not get your current location to start tracking.');
        return;
      }

      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setCurrentLocation(newLocation);
      setHeading(location.coords.heading || 0);
      setSpeed(location.coords.speed ? location.coords.speed * 1.94384 : 0); // Convert m/s to knots

      // Start continuous tracking with location updates
      let subscription;
      try {
        subscription = await startTracking((loc) => {
          setCurrentLocation({
            latitude: loc.latitude,
            longitude: loc.longitude,
          });

          // Update heading and speed more accurately if possible
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.BestForNavigation, // Use BestForNavigation for more frequent/accurate updates
          }).then((currentLoc) => {
            setHeading(currentLoc.coords.heading || 0);
            setSpeed(currentLoc.coords.speed ? currentLoc.coords.speed * 1.94384 : 0);
          }).catch(error => {
            console.error("Error getting current position for heading/speed:", error);
          });
        });
        setTrackingSubscription(subscription);
      } catch (error) {
        console.error("Error starting tracking service:", error);
        Alert.alert('Tracking Error', 'Could not start location tracking service. Please try again.');
        return;
      }

      setIsTracking(true);
      setStatus('Active');

      // Start periodic updates to send tracking data and fetch nearby vessels
      const updateInterval = setInterval(async () => {
        await sendLocationUpdate();
        await loadNearbyVessels();
      }, 5000); // Update every 5 seconds for better real-time tracking

      // Store interval for cleanup
      (subscription as any).updateInterval = updateInterval;

      Alert.alert(
        'AIS Broadcasting Started',
        `Your vessel "${vesselInfo.vesselName}" is now broadcasting. Your location is being shared with nearby MarineTrack users.`,
        [{ text: 'OK' }]
      );
    } else {
      // Stop tracking
      if (trackingSubscription) {
        // Clear update interval
        if ((trackingSubscription as any).updateInterval) {
          clearInterval((trackingSubscription as any).updateInterval);
        }
        trackingSubscription.remove();
        setTrackingSubscription(null); // Clear the subscription reference
      }
      setIsTracking(false);
      setStatus('Idle');
      setNearbyVessels([]);
      setWeatherData(null); // Clear weather data when tracking stops
      cachedWeatherData = null; // Clear cached weather data
      lastStormGlassFetchTime = 0; // Reset fetch timer
      Alert.alert('AIS Broadcasting Stopped', 'Your vessel is no longer broadcasting its position.');
    }
  };

  const handleSaveVesselInfo = async () => {
    if (!vesselInfo.vesselName || !vesselInfo.vesselId) {
      Alert.alert('Error', 'Please fill in vessel name and ID');
      return;
    }

    const user = await getCurrentUser();
    if (user) {
      await updateVesselInfo({
        vesselName: vesselInfo.vesselName,
        vesselId: vesselInfo.vesselId,
        vesselType: vesselInfo.vesselType,
        mmsi: vesselInfo.mmsi,
        imo: vesselInfo.imo,
      });

      await saveBoatData({
        userId: user.id,
        vesselName: vesselInfo.vesselName,
        vesselId: vesselInfo.vesselId,
        vesselType: vesselInfo.vesselType,
        mmsi: vesselInfo.mmsi,
        imo: vesselInfo.imo,
        updatedAt: new Date().toISOString(),
      });

      Alert.alert('Success', 'Vessel information saved to database');
    }
  };

  const getWindSpeedUnit = () => {
    // StormGlass API provides windSpeed in meters per second (m/s)
    // Convert to knots for display
    return 'kn';
  };

  const formatWindSpeed = (speedMs: number) => {
    if (speedMs === undefined || speedMs === null) return 'N/A';
    return (speedMs * 1.94384).toFixed(1); // m/s to knots
  };

  const formatWaveHeight = (heightMeters: number) => {
    if (heightMeters === undefined || heightMeters === null) return 'N/A';
    return `${(heightMeters * 3.28084).toFixed(1)} ft`; // meters to feet
  };

  const handleQuickAddVessel = async (data: any) => {
    setVesselInfo({
      vesselName: data.vesselName,
      vesselId: data.vesselId,
      vesselType: data.vesselType,
      mmsi: data.mmsi || '',
      imo: data.imo || '',
    });
    await handleSaveVesselInfo();
  };

  const vesselFormFields = [
    { key: 'vesselName', label: 'Vessel Name', placeholder: 'e.g., Nelayan Jaya', required: true },
    { key: 'vesselId', label: 'Vessel ID', placeholder: 'e.g., MYS-12345', required: true },
    { 
      key: 'vesselType', 
      label: 'Vessel Type', 
      placeholder: 'Select type',
      type: 'picker' as const,
      options: ['Fishing Vessel', 'Cargo Ship', 'Yacht', 'Ferry', 'Tugboat'],
      required: true 
    },
    { key: 'mmsi', label: 'MMSI', placeholder: '9-digit MMSI number', type: 'number' as const },
    { key: 'imo', label: 'IMO', placeholder: '7-digit IMO number', type: 'number' as const },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>🛰️ AIS Location Tracker</Text>
            <Text style={styles.headerSubtitle}>Broadcast your position to nearby vessels</Text>
          </View>
          <TouchableOpacity
            style={styles.quickAddButton}
            onPress={() => setShowAddVesselModal(true)}
          >
            <Text style={styles.quickAddIcon}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <AddItemModal
        visible={showAddVesselModal}
        onClose={() => setShowAddVesselModal(false)}
        onSubmit={handleQuickAddVessel}
        title="Add Vessel"
        fields={vesselFormFields}
        submitText="Save Vessel"
      />

      <ScrollView style={styles.content}>
        {/* Location Display */}
        {currentLocation && (
          <View style={[styles.mapContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>📍 Your Location</Text>
            <View style={styles.locationInfo}>
              <Text style={[styles.coordinates, { color: colors.text }]}>
                {currentLocation.latitude.toFixed(6)}°N, {currentLocation.longitude.toFixed(6)}°E
              </Text>
              <View style={styles.navigationInfo}>
                <Text style={[styles.navText, { color: colors.icon }]}>
                  ⬆️ Heading: {heading.toFixed(0)}° | 💨 Speed: {speed.toFixed(1)} kn
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Tracking Status */}
        <View style={[styles.statusCard, { backgroundColor: colors.card }]}>
          <View style={styles.statusHeader}>
            <View>
              <Text style={[styles.statusTitle, { color: colors.text }]}>
                {isTracking ? '🟢 Broadcasting' : '🔴 Offline'}
              </Text>
              <Text style={[styles.statusSubtitle, { color: colors.icon }]}>
                {isTracking ? 'Your position is being shared' : 'Enable to broadcast your location'}
              </Text>
            </View>
            <Switch
              value={isTracking}
              onValueChange={toggleTracking}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor={isTracking ? colors.primary : '#f4f4f4'}
            />
          </View>
        </View>

        {/* Vessel Information */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>⚓ Vessel Information</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.icon }]}>Vessel Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={vesselInfo.vesselName}
              onChangeText={(text) => setVesselInfo({ ...vesselInfo, vesselName: text })}
              placeholder="e.g., Nelayan Jaya"
              placeholderTextColor={colors.icon}
              editable={!isTracking} // Make inputs not editable while tracking
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.icon }]}>Vessel ID *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={vesselInfo.vesselId}
              onChangeText={(text) => setVesselInfo({ ...vesselInfo, vesselId: text })}
              placeholder="e.g., MYS-12345"
              placeholderTextColor={colors.icon}
              editable={!isTracking}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.icon }]}>Vessel Type</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={vesselInfo.vesselType}
              onChangeText={(text) => setVesselInfo({ ...vesselInfo, vesselType: text })}
              placeholder="e.g., Fishing Vessel"
              placeholderTextColor={colors.icon}
              editable={!isTracking}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.icon }]}>MMSI (Optional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={vesselInfo.mmsi}
              onChangeText={(text) => setVesselInfo({ ...vesselInfo, mmsi: text })}
              placeholder="9-digit MMSI number"
              placeholderTextColor={colors.icon}
              keyboardType="numeric"
              editable={!isTracking}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.icon }]}>IMO (Optional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={vesselInfo.imo}
              onChangeText={(text) => setVesselInfo({ ...vesselInfo, imo: text })}
              placeholder="7-digit IMO number"
              placeholderTextColor={colors.icon}
              keyboardType="numeric"
              editable={!isTracking}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.secondary }]}
            onPress={handleSaveVesselInfo}
            disabled={isTracking} // Disable save button while tracking
          >
            <Text style={styles.saveButtonText}>💾 Save Vessel Info</Text>
          </TouchableOpacity>
        </View>

        {/* Status Selection */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📊 Vessel Status</Text>
          <View style={styles.statusButtons}>
            {(['Active', 'Idle', 'Anchored'] as const).map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.statusButton,
                  { borderColor: colors.border },
                  status === s && { backgroundColor: colors.primary }
                ]}
                onPress={() => setStatus(s)}
                disabled={!isTracking} // Only allow status change when tracking
              >
                <Text style={[styles.statusButtonText, { color: status === s ? '#fff' : colors.text }]}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Nearby Vessels */}
        {isTracking && nearbyVessels.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              🚢 Nearby Tracked Vessels ({nearbyVessels.length})
            </Text>
            {nearbyVessels.map((vessel, index) => (
              <View key={index} style={[styles.vesselItem, { borderColor: colors.border }]}>
                <Text style={[styles.vesselName, { color: colors.text }]}>
                  {vessel.vesselInfo.vesselName}
                </Text>
                <Text style={[styles.vesselDetails, { color: colors.icon }]}>
                  {vessel.vesselInfo.vesselType} • {vessel.status}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Weather Information */}
        {weatherData && (
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>☀️ Weather Conditions</Text>
            <View style={styles.weatherInfo}>
              <Text style={[styles.weatherDetail, { color: colors.icon }]}>
                Wind: {formatWindSpeed(weatherData.windSpeed?.value)} {getWindSpeedUnit()}
              </Text>
              <Text style={[styles.weatherDetail, { color: colors.icon }]}>
                Wave Height: {formatWaveHeight(weatherData.waveHeight?.value)}
              </Text>
              <Text style={[styles.weatherDetail, { color: colors.icon }]}>
                Air Temp: {weatherData.airTemperature?.value}°C
              </Text>
            </View>
          </View>
        )}


        {/* Information */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>ℹ️ How It Works</Text>
          <Text style={[styles.infoText, { color: colors.icon }]}>
            • Your phone acts as an AIS beacon when tracking is enabled{'\n'}
            • Location is updated frequently for real-time tracking{'\n'}
            • Other MarineTrack users can see your vessel within a 10km radius{'\n'}
            • All data is sent securely to the backend for real-time tracking{'\n'}
            • Tracking stops automatically when you close the app
          </Text>
        </View>
      </ScrollView>
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
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  quickAddButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickAddIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '300',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  mapContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  locationInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  coordinates: {
    fontSize: 14,
    fontWeight: '600',
  },
  navigationInfo: {
    marginTop: 8,
  },
  navText: {
    fontSize: 12,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  vesselItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  vesselName: {
    fontSize: 14,
    fontWeight: '600',
  },
  vesselDetails: {
    fontSize: 12,
    marginTop: 4,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
  },
  weatherInfo: {
    marginTop: 8,
  },
  weatherDetail: {
    fontSize: 12,
    marginBottom: 4,
  },
});