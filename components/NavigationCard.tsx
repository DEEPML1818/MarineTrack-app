import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';
import { BlurView } from 'expo-blur';

interface NavigationCardProps {
  instruction: string;
  distance: number;
  distanceUnit?: 'nm' | 'km' | 'm';
  eta?: string;
  maneuverType?: 'straight' | 'left' | 'right' | 'port' | 'starboard';
}

export function NavigationCard({ 
  instruction, 
  distance, 
  distanceUnit = 'nm',
  eta,
  maneuverType = 'straight'
}: NavigationCardProps) {
  const getManeuverIcon = () => {
    switch (maneuverType) {
      case 'left':
      case 'port':
        return '←';
      case 'right':
      case 'starboard':
        return '→';
      default:
        return '↑';
    }
  };

  const formatDistance = (dist: number) => {
    if (distanceUnit === 'm' && dist >= 1000) {
      return `${(dist / 1000).toFixed(1)} km`;
    }
    return `${dist.toFixed(1)} ${distanceUnit}`;
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="light" style={styles.blurContainer}>
        <View style={styles.content}>
          <View style={styles.topRow}>
            <View style={styles.maneuverContainer}>
              <Text style={styles.maneuverIcon}>{getManeuverIcon()}</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.distanceText}>{formatDistance(distance)}</Text>
              <Text style={styles.instructionText} numberOfLines={2}>
                {instruction}
              </Text>
            </View>
          </View>
          {eta && (
            <View style={styles.etaContainer}>
              <View style={styles.etaDot} />
              <Text style={styles.etaText}>ETA: {eta}</Text>
            </View>
          )}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Theme.spacing.huge,
    left: Theme.spacing.base,
    right: Theme.spacing.base,
    zIndex: 100,
  },
  blurContainer: {
    borderRadius: Theme.radius.md,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    ...Theme.shadows.xl,
  },
  content: {
    padding: Theme.spacing.base,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  maneuverContainer: {
    width: 56,
    height: 56,
    borderRadius: Theme.radius.md,
    backgroundColor: Theme.colors.wazeBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  maneuverIcon: {
    fontSize: 32,
    color: Theme.colors.white,
    fontWeight: Theme.fonts.weights.bold,
  },
  textContainer: {
    flex: 1,
  },
  distanceText: {
    fontSize: Theme.fonts.sizes.xxl,
    fontWeight: Theme.fonts.weights.bold,
    color: Theme.colors.gray1,
    marginBottom: Theme.spacing.xs,
  },
  instructionText: {
    fontSize: Theme.fonts.sizes.base,
    fontWeight: Theme.fonts.weights.medium,
    color: Theme.colors.gray5,
    lineHeight: Theme.fonts.sizes.base * 1.4,
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.gray8,
  },
  etaDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.accentGreen,
    marginRight: Theme.spacing.sm,
  },
  etaText: {
    fontSize: Theme.fonts.sizes.md,
    fontWeight: Theme.fonts.weights.semibold,
    color: Theme.colors.gray3,
  },
});
