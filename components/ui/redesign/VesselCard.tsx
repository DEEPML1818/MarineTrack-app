
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '@/constants/Theme';

interface VesselCardProps {
  vesselName: string;
  vesselType?: string;
  route?: string;
  imageSource?: ImageSourcePropType;
  status?: 'live' | 'docked' | 'delayed' | 'attention';
  speed?: number;
  eta?: string;
  distance?: number;
  lastUpdate?: string;
  onPress?: () => void;
  onActionPress?: () => void;
  actionLabel?: string;
  showDetails?: boolean;
}

export function VesselCard({
  vesselName,
  vesselType,
  route,
  imageSource,
  status = 'live',
  speed,
  eta,
  distance,
  lastUpdate,
  onPress,
  onActionPress,
  actionLabel = 'Track Now',
  showDetails = true,
}: VesselCardProps) {
  const statusConfig = {
    live: {
      color: Theme.colors.statusLive,
      label: 'LIVE',
      pulse: true,
    },
    docked: {
      color: Theme.colors.statusDocked,
      label: 'DOCKED',
      pulse: false,
    },
    delayed: {
      color: Theme.colors.statusDelayed,
      label: 'DELAYED',
      pulse: false,
    },
    attention: {
      color: Theme.colors.statusAttention,
      label: 'ATTENTION',
      pulse: true,
    },
  };

  const config = statusConfig[status];

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress} 
      activeOpacity={0.96}
    >
      {/* Image with gradient overlay */}
      {imageSource && (
        <View style={styles.imageContainer}>
          <Image source={imageSource} style={styles.image} />
          <LinearGradient
            colors={['transparent', 'rgba(44, 24, 16, 0.4)']}
            style={styles.imageGradient}
          />
          
          {/* Status badge */}
          <View style={[styles.statusBadge, { backgroundColor: config.color }]}>
            {config.pulse && <View style={styles.pulseDot} />}
            <Text style={styles.statusText}>{config.label}</Text>
          </View>
        </View>
      )}
      
      <View style={styles.cardContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.vesselName} numberOfLines={1}>{vesselName}</Text>
            {vesselType && (
              <Text style={styles.vesselType}>{vesselType}</Text>
            )}
          </View>
          
          {eta && (
            <View style={styles.etaContainer}>
              <Text style={styles.etaLabel}>ETA</Text>
              <Text style={styles.etaValue}>{eta}</Text>
            </View>
          )}
        </View>

        {/* Route */}
        {route && (
          <View style={styles.routeContainer}>
            <Text style={styles.routeIcon}>📍</Text>
            <Text style={styles.route} numberOfLines={1}>{route}</Text>
          </View>
        )}

        {/* Telemetry chips */}
        {showDetails && (speed !== undefined || distance !== undefined) && (
          <View style={styles.telemetryRow}>
            {speed !== undefined && (
              <View style={styles.telemetryChip}>
                <Text style={styles.telemetryIcon}>💨</Text>
                <Text style={styles.telemetryValue}>{speed.toFixed(1)}</Text>
                <Text style={styles.telemetryUnit}>kn</Text>
              </View>
            )}
            {distance !== undefined && (
              <View style={styles.telemetryChip}>
                <Text style={styles.telemetryIcon}>📏</Text>
                <Text style={styles.telemetryValue}>{distance.toFixed(1)}</Text>
                <Text style={styles.telemetryUnit}>km</Text>
              </View>
            )}
          </View>
        )}

        {/* Action button */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onActionPress}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: Theme.spacing.base,
    ...Theme.shadows.md,
  },
  imageContainer: {
    position: 'relative',
    height: 160,
    backgroundColor: Theme.colors.cream,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  statusBadge: {
    position: 'absolute',
    top: Theme.spacing.md,
    right: Theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 6,
    borderRadius: Theme.radius.full,
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.white,
  },
  statusText: {
    color: Theme.colors.white,
    fontSize: Theme.fonts.sizes.xs,
    fontWeight: Theme.fonts.weights.bold,
    letterSpacing: 0.5,
  },
  cardContent: {
    padding: Theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.sm,
  },
  headerLeft: {
    flex: 1,
    marginRight: Theme.spacing.md,
  },
  vesselName: {
    fontSize: Theme.fonts.sizes.lg,
    fontWeight: Theme.fonts.weights.bold,
    color: Theme.colors.espresso,
    fontFamily: Theme.fonts.heading,
    marginBottom: 4,
  },
  vesselType: {
    fontSize: Theme.fonts.sizes.sm,
    color: Theme.colors.mutedGray,
  },
  etaContainer: {
    alignItems: 'flex-end',
  },
  etaLabel: {
    fontSize: Theme.fonts.sizes.xs,
    color: Theme.colors.mutedGray,
    marginBottom: 2,
  },
  etaValue: {
    fontSize: Theme.fonts.sizes.base,
    fontWeight: Theme.fonts.weights.bold,
    color: Theme.colors.burntOrange,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
    gap: Theme.spacing.xs,
  },
  routeIcon: {
    fontSize: 14,
  },
  route: {
    flex: 1,
    fontSize: Theme.fonts.sizes.md,
    color: Theme.colors.mutedGray,
  },
  telemetryRow: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.base,
  },
  telemetryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.latte,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  telemetryIcon: {
    fontSize: 14,
  },
  telemetryValue: {
    fontSize: Theme.fonts.sizes.md,
    fontWeight: Theme.fonts.weights.bold,
    color: Theme.colors.coffeeBrown,
  },
  telemetryUnit: {
    fontSize: Theme.fonts.sizes.xs,
    color: Theme.colors.mutedGray,
  },
  actionButton: {
    backgroundColor: Theme.colors.burntOrange,
    paddingVertical: Theme.spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: Theme.colors.white,
    fontSize: Theme.fonts.sizes.base,
    fontWeight: Theme.fonts.weights.bold,
    letterSpacing: 0.5,
  },
});
