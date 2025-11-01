import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { getAllTrackingData } from '@/utils/database';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

interface MarkerData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: string;
  status: string;
  isCurrentUser?: boolean;
}

export default function LiveMap() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [region, setRegion] = useState({
    latitude: 3.1390,
    longitude: 101.6869,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  });

  useEffect(() => {
    getCurrentLocation();
    const interval = setInterval(() => {
      loadTrackedVessels();
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [userLocation]);

  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({});
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setUserLocation(newLocation);
      setRegion({
        ...newLocation,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      });
    }
  };

  const loadTrackedVessels = async () => {
    if (!userLocation) return;

    const trackingData = await getAllTrackingData();
    const newMarkers: MarkerData[] = trackingData.map(t => ({
      id: t.userId,
      name: t.vesselName,
      latitude: t.location.latitude,
      longitude: t.location.longitude,
      type: 'Tracked Vessel',
      status: t.status,
    }));

    // Add user's location
    if (userLocation) {
      newMarkers.unshift({
        id: 'me',
        name: 'My Vessel',
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        type: 'Current Location',
        status: 'Active',
        isCurrentUser: true,
      });
    }

    setMarkers(newMarkers);
  };

  return (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        onRegionChangeComplete={setRegion}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.name}
            description={`${marker.type} - ${marker.status}`}
            pinColor={marker.isCurrentUser ? '#FF3B30' : '#007AFF'}
          >
            <View style={[
              styles.markerContainer,
              { backgroundColor: marker.isCurrentUser ? colors.danger : colors.primary }
            ]}>
              <Text style={styles.markerIcon}>
                {marker.isCurrentUser ? '📍' : '🚢'}
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Legend */}
      <View style={[styles.legend, { backgroundColor: colors.card }]}>
        <Text style={[styles.legendTitle, { color: colors.text }]}>
          Live Vessels: {markers.length}
        </Text>
        <Text style={[styles.legendItem, { color: colors.icon }]}>
          📍 You • 🚢 Others
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  markerIcon: {
    fontSize: 18,
  },
  legend: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  legendItem: {
    fontSize: 10,
  },
});