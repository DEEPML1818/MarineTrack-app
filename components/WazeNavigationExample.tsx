import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { SpeedHUD } from './SpeedHUD';
import { NavigationCard } from './NavigationCard';
import { FloatingActionButton } from './FloatingActionButton';
import { VesselTrail } from './VesselTrail';
import { Theme } from '@/constants/Theme';

export function WazeNavigationExample() {
  const [speed] = useState(12.5);
  const [trailPositions] = useState([
    { latitude: 1.2921, longitude: 103.8518, timestamp: Date.now() - 300000 },
    { latitude: 1.2925, longitude: 103.8520, timestamp: Date.now() - 240000 },
    { latitude: 1.2930, longitude: 103.8525, timestamp: Date.now() - 180000 },
    { latitude: 1.2935, longitude: 103.8530, timestamp: Date.now() - 120000 },
    { latitude: 1.2940, longitude: 103.8535, timestamp: Date.now() - 60000 },
    { latitude: 1.2945, longitude: 103.8540, timestamp: Date.now() },
  ]);

  const handleMenuPress = () => {
    console.log('Menu button pressed');
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: 1.2945,
          longitude: 103.8540,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <VesselTrail 
          positions={trailPositions}
          color={Theme.colors.wazeTurquoise}
          width={5}
          fadeEffect={true}
        />
      </MapView>

      <NavigationCard
        instruction="Head northeast towards Marina Bay"
        distance={2.3}
        distanceUnit="nm"
        eta="10:45 AM"
        maneuverType="straight"
      />

      <SpeedHUD speed={speed} maxSpeed={30} />

      <FloatingActionButton
        icon="☰"
        onPress={handleMenuPress}
        backgroundColor={Theme.colors.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
