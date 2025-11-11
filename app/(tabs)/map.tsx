import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
} from 'react-native';
import { Theme } from '@/constants/Theme';
import * as Location from 'expo-location';
import WazeVesselMap from '@/components/WazeVesselMap';

export default function MapScreen() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    setupLocation();
  }, []);

  const setupLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.foam} />
      
      {/* Full Screen Map */}
      <View style={styles.mapContainer}>
        <WazeVesselMap userLocation={userLocation} height={1000} />
      </View>

      {/* My Location Button */}
      <TouchableOpacity 
        style={styles.myLocationButton}
        onPress={setupLocation}
      >
        <Text style={styles.myLocationIcon}>📍</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.foam,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  searchOverlay: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    paddingHorizontal: Theme.spacing.base,
  },
  searchButton: {
    backgroundColor: Theme.colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.base,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.radius.xl,
    ...Theme.shadows.lg,
    gap: Theme.spacing.md,
  },
  searchIcon: {
    fontSize: 20,
  },
  searchButtonText: {
    fontSize: Theme.fonts.sizes.base,
    fontWeight: Theme.fonts.weights.semibold,
    color: Theme.colors.espresso,
    flex: 1,
  },
  myLocationButton: {
    position: 'absolute',
    bottom: 360,
    right: Theme.spacing.base,
    width: 48,
    height: 48,
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.lg,
  },
  myLocationIcon: {
    fontSize: 24,
  },
});
