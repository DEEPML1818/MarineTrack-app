
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('clear') || lowerCondition.includes('sunny')) return '☀️';
    if (lowerCondition.includes('cloud')) return '☁️';
    if (lowerCondition.includes('rain')) return '🌧️';
    if (lowerCondition.includes('storm')) return '⛈️';
    return '🌤️';
  };

  return (
    <LinearGradient
      colors={[Theme.colors.burntOrange, '#E89A6F']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Glassmorphism overlay */}
      <View style={styles.glassOverlay} />
      
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          {location && <Text style={styles.location}>{location}</Text>}
          <Text style={styles.condition}>{condition}</Text>
        </View>
        
        {/* Temperature display */}
        <View style={styles.tempContainer}>
          <Text style={styles.temperature}>{temperature}°</Text>
          <Text style={styles.tempIcon}>{getWeatherIcon(condition)}</Text>
        </View>
        
        {/* Details */}
        {(windSpeed !== undefined || humidity !== undefined) && (
          <View style={styles.details}>
            {windSpeed !== undefined && (
              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <Text style={styles.detailIcon}>💨</Text>
                </View>
                <View>
                  <Text style={styles.detailValue}>{windSpeed} kn</Text>
                  {windDirection && <Text style={styles.detailLabel}>{windDirection}</Text>}
                </View>
              </View>
            )}
            {humidity !== undefined && (
              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <Text style={styles.detailIcon}>💧</Text>
                </View>
                <View>
                  <Text style={styles.detailValue}>{humidity}%</Text>
                  <Text style={styles.detailLabel}>Humidity</Text>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: Theme.spacing.xl,
    marginHorizontal: Theme.spacing.base,
    marginVertical: Theme.spacing.md,
    overflow: 'hidden',
    ...Theme.shadows.md,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
  header: {
    marginBottom: Theme.spacing.md,
  },
  location: {
    fontSize: Theme.fonts.sizes.md,
    color: Theme.colors.white,
    opacity: 0.95,
    marginBottom: Theme.spacing.xs,
    fontWeight: Theme.fonts.weights.medium,
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
    marginBottom: Theme.spacing.lg,
  },
  temperature: {
    fontSize: 64,
    fontWeight: Theme.fonts.weights.bold,
    color: Theme.colors.white,
    fontFamily: Theme.fonts.heading,
    lineHeight: 64,
  },
  tempIcon: {
    fontSize: 72,
  },
  details: {
    flexDirection: 'row',
    gap: Theme.spacing.lg,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    borderRadius: 12,
    backdropFilter: 'blur(10px)',
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailIcon: {
    fontSize: 18,
  },
  detailValue: {
    fontSize: Theme.fonts.sizes.base,
    fontWeight: Theme.fonts.weights.bold,
    color: Theme.colors.white,
  },
  detailLabel: {
    fontSize: Theme.fonts.sizes.xs,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
});
