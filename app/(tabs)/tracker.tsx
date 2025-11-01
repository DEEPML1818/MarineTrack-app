import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, TextInput, ScrollView, Alert } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import * as Location from 'expo-location';
import { getCurrentUser, updateVesselInfo } from '@/utils/auth';
import { sendTrackingData, startTracking, getNearbyTrackedVessels } from '@/utils/trackingService';
import { saveBoatData } from '@/utils/database';

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

  useEffect(() => {
    loadUserVesselInfo();
    return () => {
      if (trackingSubscription) {
        trackingSubscription.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (isTracking && currentLocation) {
      sendLocationUpdate();
      loadNearbyVessels();
    }
  }, [currentLocation, isTracking]);

  const loadUserVesselInfo = async () => {
    const user = await getCurrentUser();
    if (user?.vesselInfo) {
      setVesselInfo({
        vesselName: user.vesselInfo.vesselName,
        vesselId: user.vesselInfo.vesselId,
        vesselType: user.vesselInfo.vesselType,
        mmsi: '', // These might need to be fetched from the new database service as well
        imo: '',
      });
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

    await sendTrackingData(trackingData);
  };

  const loadNearbyVessels = async () => {
    if (!currentLocation) return;

    const vessels = await getNearbyTrackedVessels(
      currentLocation.latitude,
      currentLocation.longitude,
      10
    );
    setNearbyVessels(vessels);
  };

  const toggleTracking = async () => {
    if (!vesselInfo.vesselName || !vesselInfo.vesselId) {
      Alert.alert('Missing Info', 'Please fill in vessel name and ID before starting tracking');
      return;
    }

    if (!isTracking) {
      // Start tracking
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for tracking');
        return;
      }

      // Save vessel info
      await updateVesselInfo(vesselInfo); // This might need to be updated to use saveBoatData if it's the primary source

      // Get initial location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setHeading(location.coords.heading || 0);
      setSpeed(location.coords.speed ? location.coords.speed * 1.94384 : 0); // Convert m/s to knots

      // Start continuous tracking
      const subscription = await startTracking((loc) => {
        setCurrentLocation(loc);
      });

      setTrackingSubscription(subscription);
      setIsTracking(true);
      setStatus('Active');

      Alert.alert('Tracking Started', 'Your vessel is now broadcasting as an AIS beacon');
    } else {
      // Stop tracking
      if (trackingSubscription) {
        trackingSubscription.remove();
      }
      setIsTracking(false);
      setStatus('Idle');
      Alert.alert('Tracking Stopped', 'AIS beacon disabled');
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>🛰️ AIS Location Tracker</Text>
        <Text style={styles.headerSubtitle}>Broadcast your position to nearby vessels</Text>
      </View>

      <ScrollView style={styles.content}>
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
              thumbColor={isTracking ? colors.primary : '#f4f3f4'}
            />
          </View>

          {currentLocation && (
            <View style={styles.locationInfo}>
              <Text style={[styles.coordinates, { color: colors.text }]}>
                📍 {currentLocation.latitude.toFixed(6)}°N, {currentLocation.longitude.toFixed(6)}°E
              </Text>
              <View style={styles.navigationInfo}>
                <Text style={[styles.navText, { color: colors.icon }]}>
                  ⬆️ {heading.toFixed(0)}° | 💨 {speed.toFixed(1)} kn
                </Text>
              </View>
            </View>
          )}
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
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.secondary }]}
            onPress={handleSaveVesselInfo}
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

        {/* Information */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>ℹ️ How It Works</Text>
          <Text style={[styles.infoText, { color: colors.icon }]}>
            • Your phone acts as an AIS beacon when tracking is enabled{'\n'}
            • Location is updated every 5 seconds or when you move 10 meters{'\n'}
            • Other MarineTrack users can see your vessel within 10km radius{'\n'}
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
  content: {
    flex: 1,
    padding: 16,
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
});