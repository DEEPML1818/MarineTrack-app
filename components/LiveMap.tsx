import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import * as Location from 'expo-location';

interface LiveMapProps {
  userLocation?: { lat: number; lng: number } | null;
}

export default function LiveMap({ userLocation: propLocation }: LiveMapProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(propLocation || null);

  useEffect(() => {
    if (propLocation) {
      setLocation(propLocation);
    } else {
      getCurrentLocation();
    }
  }, [propLocation]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.mapView, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>📍 Your Location</Text>
        </View>

        {location ? (
          <View style={styles.locationContainer}>
            <View style={[styles.marker, { backgroundColor: colors.primary }]}>
              <Text style={styles.markerIcon}>📍</Text>
            </View>

            <View style={styles.coordsContainer}>
              <Text style={[styles.coordsLabel, { color: colors.icon }]}>Latitude</Text>
              <Text style={[styles.coordsValue, { color: colors.text }]}>
                {location.lat.toFixed(6)}°N
              </Text>
            </View>

            <View style={styles.coordsContainer}>
              <Text style={[styles.coordsLabel, { color: colors.icon }]}>Longitude</Text>
              <Text style={[styles.coordsValue, { color: colors.text }]}>
                {location.lng.toFixed(6)}°E
              </Text>
            </View>

            <View style={[styles.infoBox, { backgroundColor: colors.card }]}>
              <Text style={[styles.infoText, { color: colors.icon }]}>
                ℹ️ Full interactive map available on mobile app
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.icon }]}>
              Getting your location...
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
  },
  mapView: {
    flex: 1,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  locationContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  marker: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  markerIcon: {
    fontSize: 30,
  },
  coordsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  coordsLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  coordsValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoBox: {
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    width: '100%',
  },
  infoText: {
    fontSize: 12,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
  },
});