import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Theme } from '@/constants/Theme';
import { LivePropertyChip, VesselDetailHeader, ActionButton } from '@/components/ui/redesign';
import * as Location from 'expo-location';
import WazeVesselMap from '@/components/WazeVesselMap';

export default function MapScreen() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showDetails, setShowDetails] = useState(true);

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
      <StatusBar barStyle="light-content" />
      
      <View style={styles.mapContainer}>
        <WazeVesselMap />
        
        <View style={styles.headerOverlay}>
          <View style={styles.locationBadge}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>Coastal City</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showDetails && (
        <View style={styles.detailsPanel}>
          <VesselDetailHeader
            vesselName="MT Golden Frigga"
            vesselType="OIL/CHEM (IMO 9315085)"
            status="COLLECTING.LEAD"
            timestamp="15 miles ago • 15 minutes ago"
            onClose={() => setShowDetails(false)}
          />

          <ScrollView style={styles.detailsScroll}>
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Live properties</Text>
              
              <View style={styles.propertiesGrid}>
                <LivePropertyChip
                  icon="⛵"
                  value="4.3 knots"
                  label="Save or skip"
                />
                <LivePropertyChip
                  icon="🌊"
                  value="4 m"
                  label="Very rough"
                />
              </View>
              
              <ActionButton
                label="Avoid choppy waters"
                onPress={() => {}}
                variant="danger"
                fullWidth
                icon={<Text>⚠️</Text>}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.detailsSection}>
              <ActionButton
                label="Update port information"
                onPress={() => {}}
                variant="primary"
                fullWidth
              />
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.navy,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  headerOverlay: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.base,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.radius.full,
    opacity: 0.95,
    ...Theme.shadows.md,
  },
  locationIcon: {
    fontSize: Theme.fonts.sizes.base,
    marginRight: Theme.spacing.xs,
  },
  locationText: {
    color: Theme.colors.navy,
    fontSize: Theme.fonts.sizes.md,
    fontWeight: Theme.fonts.weights.medium,
  },
  settingsButton: {
    width: 40,
    height: 40,
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.95,
    ...Theme.shadows.md,
  },
  settingsIcon: {
    fontSize: Theme.fonts.sizes.lg,
  },
  detailsPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '60%',
    backgroundColor: Theme.colors.white,
    borderTopLeftRadius: Theme.radius.xl,
    borderTopRightRadius: Theme.radius.xl,
    ...Theme.shadows.xl,
  },
  detailsScroll: {
    maxHeight: 400,
  },
  detailsSection: {
    padding: Theme.spacing.base,
  },
  sectionTitle: {
    fontSize: Theme.fonts.sizes.lg,
    fontWeight: Theme.fonts.weights.bold,
    color: Theme.colors.navy,
    marginBottom: Theme.spacing.md,
  },
  propertiesGrid: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.base,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.mutedGray,
    marginHorizontal: Theme.spacing.base,
    opacity: 0.1,
  },
});
