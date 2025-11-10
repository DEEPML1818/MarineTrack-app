import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';

interface WeatherWidgetProps {
  temperature: number;
  condition: string;
  windSpeed?: number;
  windDirection?: string;
  humidity?: number;
  location?: string;
}

export function WeatherWidget({
  temperature,
  condition,
  windSpeed,
  windDirection,
  humidity,
  location,
}: WeatherWidgetProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {location && <Text style={styles.location}>{location}</Text>}
        <Text style={styles.condition}>{condition}</Text>
      </View>
      
      <View style={styles.tempContainer}>
        <Text style={styles.temperature}>{temperature}°C</Text>
        <Text style={styles.tempIcon}>☀️</Text>
      </View>
      
      {(windSpeed !== undefined || humidity !== undefined) && (
        <View style={styles.details}>
          {windSpeed !== undefined && (
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>💨</Text>
              <Text style={styles.detailText}>{windSpeed} kts</Text>
              {windDirection && <Text style={styles.detailText}>{windDirection}</Text>}
            </View>
          )}
          {humidity !== undefined && (
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>💧</Text>
              <Text style={styles.detailText}>{humidity}%</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.warning,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.xl,
    marginHorizontal: Theme.spacing.base,
    marginVertical: Theme.spacing.md,
    ...Theme.shadows.md,
  },
  header: {
    marginBottom: Theme.spacing.md,
  },
  location: {
    fontSize: Theme.fonts.sizes.md,
    color: Theme.colors.white,
    opacity: 0.9,
    marginBottom: Theme.spacing.xs,
  },
  condition: {
    fontSize: Theme.fonts.sizes.base,
    fontWeight: Theme.fonts.weights.semibold,
    color: Theme.colors.white,
  },
  tempContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.base,
  },
  temperature: {
    fontSize: 48,
    fontWeight: Theme.fonts.weights.bold,
    color: Theme.colors.white,
  },
  tempIcon: {
    fontSize: 64,
  },
  details: {
    flexDirection: 'row',
    gap: Theme.spacing.xl,
    marginTop: Theme.spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    backgroundColor: Theme.colors.white,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.radius.md,
    opacity: 0.2,
  },
  detailIcon: {
    fontSize: Theme.fonts.sizes.lg,
  },
  detailText: {
    fontSize: Theme.fonts.sizes.md,
    fontWeight: Theme.fonts.weights.semibold,
    color: Theme.colors.white,
  },
});
