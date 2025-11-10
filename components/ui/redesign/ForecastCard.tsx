import React from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType, TouchableOpacity } from 'react-native';
import { Theme } from '@/constants/Theme';

interface ForecastCardProps {
  vesselName: string;
  imageSource?: ImageSourcePropType;
  temperature: number;
  windSpeed: number;
  waveHeight: number;
  period?: string;
}

export function ForecastCard({
  vesselName,
  imageSource,
  temperature,
  windSpeed,
  waveHeight,
  period = 'Today',
}: ForecastCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.period}>{period}</Text>
      
      {imageSource && (
        <Image source={imageSource} style={styles.image} resizeMode="cover" />
      )}
      
      <View style={styles.content}>
        <Text style={styles.vesselName}>{vesselName}</Text>
        
        <View style={styles.forecast}>
          <View style={styles.forecastItem}>
            <Text style={styles.forecastIcon}>🌡️</Text>
            <Text style={styles.forecastValue}>{temperature}°C</Text>
            <Text style={styles.forecastLabel}>AK</Text>
          </View>
          <View style={styles.forecastItem}>
            <Text style={styles.forecastIcon}>💨</Text>
            <Text style={styles.forecastValue}>{windSpeed}G</Text>
          </View>
          <View style={styles.forecastItem}>
            <Text style={styles.forecastIcon}>🌊</Text>
            <Text style={styles.forecastValue}>{waveHeight}m</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>See forecast</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
    ...Theme.shadows.md,
  },
  period: {
    position: 'absolute',
    top: Theme.spacing.md,
    left: Theme.spacing.md,
    fontSize: Theme.fonts.sizes.sm,
    fontWeight: Theme.fonts.weights.semibold,
    color: Theme.colors.white,
    backgroundColor: Theme.colors.navy,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.radius.full,
    zIndex: 1,
    opacity: 0.7,
  },
  image: {
    width: '100%',
    height: 140,
  },
  content: {
    padding: Theme.spacing.base,
  },
  vesselName: {
    fontSize: Theme.fonts.sizes.base,
    fontWeight: Theme.fonts.weights.bold,
    color: Theme.colors.navy,
    marginBottom: Theme.spacing.md,
  },
  forecast: {
    flexDirection: 'row',
    gap: Theme.spacing.base,
    marginBottom: Theme.spacing.md,
  },
  forecastItem: {
    alignItems: 'center',
  },
  forecastIcon: {
    fontSize: Theme.fonts.sizes.lg,
    marginBottom: Theme.spacing.xs,
  },
  forecastValue: {
    fontSize: Theme.fonts.sizes.base,
    fontWeight: Theme.fonts.weights.bold,
    color: Theme.colors.navy,
  },
  forecastLabel: {
    fontSize: Theme.fonts.sizes.xs,
    color: Theme.colors.mutedGray,
  },
  button: {
    backgroundColor: Theme.colors.navy,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.radius.md,
    alignItems: 'center',
  },
  buttonText: {
    color: Theme.colors.white,
    fontSize: Theme.fonts.sizes.md,
    fontWeight: Theme.fonts.weights.semibold,
  },
});
