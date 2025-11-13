import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import * as Location from 'expo-location';
import { WazeVesselMap } from '@/components/WazeVesselMap';
import { getRestrictedZones, getSafeZones } from '@/utils/zoneData';
import { LuxuryDrawer } from '@/components/redesign/LuxuryDrawer';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { getNearbyTrackedVessels } from '@/utils/trackingService';
import { getCurrentWeather } from '@/utils/weatherApi';
import { getNearbyHazards } from '@/utils/maritimeIntelligence';

export default function MapScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedVessel, setSelectedVessel] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [vessels, setVessels] = useState<any[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [hazards, setHazards] = useState<any[]>([]);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (currentLocation) {
      loadDrawerData();
    }
  }, [currentLocation]);

  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setCurrentLocation(coords);
    }
  };

  const loadDrawerData = async () => {
    if (!currentLocation) return;
    
    try {
      const [nearbyVessels, weatherData, hazardData] = await Promise.all([
        getNearbyTrackedVessels(currentLocation.latitude, currentLocation.longitude, 10),
        getCurrentWeather(currentLocation.latitude, currentLocation.longitude),
        getNearbyHazards(currentLocation.latitude, currentLocation.longitude, 50),
      ]);

      setVessels(nearbyVessels);
      setWeather(weatherData);
      setHazards(hazardData);
    } catch (error) {
      console.error('Error loading drawer data:', error);
    }
  };

  const restrictedZones = getRestrictedZones();
  const safeZones = getSafeZones();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Full Screen Map */}
      <View style={styles.mapContainer}>
        {currentLocation && (
          <WazeVesselMap
            currentLocation={currentLocation}
            onVesselSelect={(vessel) => setSelectedVessel(vessel)}
          />
        )}
      </View>

      {/* Luxury Floating Menu Button - Waze Style */}
      <TouchableOpacity
        style={[styles.menuButton, {
          backgroundColor: isDark ? Theme.colors.darkCard : '#FFFFFF',
        }]}
        onPress={() => setDrawerOpen(true)}
        activeOpacity={0.9}
      >
        <IconSymbol name="line.3.horizontal" size={24} color={colors.text} />
        {hazards.length > 0 && (
          <View style={styles.menuBadge}>
            <Text style={styles.menuBadgeText}>{hazards.length}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Luxury Drawer */}
      <LuxuryDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        vessels={vessels}
        weather={weather}
        hazards={hazards}
        onRefresh={loadDrawerData}
      />

      {/* Vessel Details Card - Instagram Story Style */}
      {selectedVessel && (
        <View style={[styles.vesselCard, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeader}>
            <View style={styles.vesselAvatar}>
              <Text style={styles.avatarIcon}>🚢</Text>
            </View>
            <View style={styles.vesselInfo}>
              <Text style={[styles.vesselName, { color: colors.text }]}>
                {selectedVessel.vesselInfo?.vesselName || 'Unknown Vessel'}
              </Text>
              <Text style={[styles.vesselType, { color: colors.secondaryText }]}>
                {selectedVessel.vesselInfo?.vesselType || 'N/A'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedVessel(null)}>
              <Text style={[styles.closeIcon, { color: colors.icon }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {selectedVessel.status || 'Unknown'}
              </Text>
              <Text style={[styles.statLabel, { color: colors.tertiaryText }]}>Status</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {selectedVessel.distance ? `${selectedVessel.distance.toFixed(1)}km` : 'N/A'}
              </Text>
              <Text style={[styles.statLabel, { color: colors.tertiaryText }]}>Distance</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>Live</Text>
              <Text style={[styles.statLabel, { color: colors.tertiaryText }]}>Tracking</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary }]}>
              <Text style={styles.buttonText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.secondaryButton, { borderColor: colors.border }]}>
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Track</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Legend Pills - Twitter/X Style */}
      <View style={styles.legendWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.legendScroll}
        >
          <View style={[styles.legendPill, { backgroundColor: colors.card }]}>
            <View style={[styles.legendDot, { backgroundColor: '#34C759' }]} />
            <Text style={[styles.legendLabel, { color: colors.text }]}>Safe Zones</Text>
          </View>
          <View style={[styles.legendPill, { backgroundColor: colors.card }]}>
            <View style={[styles.legendDot, { backgroundColor: '#FF3B30' }]} />
            <Text style={[styles.legendLabel, { color: colors.text }]}>Restricted</Text>
          </View>
          <View style={[styles.legendPill, { backgroundColor: colors.card }]}>
            <View style={[styles.legendDot, { backgroundColor: '#007AFF' }]} />
            <Text style={[styles.legendLabel, { color: colors.text }]}>You</Text>
          </View>
          <View style={[styles.legendPill, { backgroundColor: colors.card }]}>
            <View style={[styles.legendDot, { backgroundColor: '#FF9500' }]} />
            <Text style={[styles.legendLabel, { color: colors.text }]}>Nearby</Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
  menuButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 10,
  },
  menuBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Theme.colors.iosRed,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  menuBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  vesselCard: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  vesselAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarIcon: {
    fontSize: 24,
  },
  vesselInfo: {
    flex: 1,
  },
  vesselName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  vesselType: {
    fontSize: 14,
  },
  closeIcon: {
    fontSize: 24,
    fontWeight: '300',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: '100%',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  legendWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
  legendScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  legendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
});