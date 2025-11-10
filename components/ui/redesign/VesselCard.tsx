
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
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
  actionLabel = 'View Details',
  showDetails = false,
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
      style={[
        styles.card,
        status === 'attention' && styles.cardAttention,
      ]} 
      onPress={onPress} 
      activeOpacity={0.8}
    >
      {/* Status Indicator Bar */}
      <View style={[styles.statusBar, { backgroundColor: config.color }]} />
      
      <View style={styles.cardContent}>
        {/* Header Row */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.vesselName}>{vesselName}</Text>
            <View style={[styles.statusBadge, { backgroundColor: config.color }]}>
              {config.pulse && <View style={styles.pulseDot} />}
              <Text style={styles.statusText}>{config.label}</Text>
            </View>
          </View>
          
          {eta && (
            <View style={styles.etaContainer}>
              <Text style={styles.etaLabel}>ETA</Text>
              <Text style={[styles.etaValue, status === 'attention' && { color: Theme.colors.coral }]}>
                {eta}
              </Text>
            </View>
          )}
        </View>

        {/* Route */}
        {route && (
          <Text style={styles.route}>{route}</Text>
        )}

        {/* Telemetry Chips */}
        {showDetails && (
          <View style={styles.telemetryRow}>
            {speed !== undefined && (
              <View style={styles.telemetryChip}>
                <Text style={styles.telemetryValue}>{speed.toFixed(1)}</Text>
                <Text style={styles.telemetryUnit}>kn</Text>
              </View>
            )}
            {distance !== undefined && (
              <View style={styles.telemetryChip}>
                <Text style={styles.telemetryValue}>{distance.toFixed(1)}</Text>
                <Text style={styles.telemetryUnit}>nm</Text>
              </View>
            )}
            {lastUpdate && (
              <View style={styles.telemetryChip}>
                <Text style={styles.telemetryLabel}>{lastUpdate}</Text>
              </View>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[
              styles.actionButton,
              status === 'attention' ? styles.actionButtonAttention : styles.actionButtonPrimary,
            ]}
            onPress={onActionPress}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>{actionLabel}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <Text style={styles.iconButtonText}>💬</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <Text style={styles.iconButtonText}>⋯</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.cards.borderRadius,
    overflow: 'hidden',
    ...Theme.shadows.md,
    position: 'relative',
  },
  cardAttention: {
    borderWidth: 2,
    borderColor: Theme.colors.coral,
  },
  statusBar: {
    height: 4,
    width: '100%',
  },
  cardContent: {
    padding: Theme.spacing.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.sm,
  },
  headerLeft: {
    flex: 1,
    gap: Theme.spacing.xs,
  },
  vesselName: {
    fontSize: Theme.fonts.sizes.lg,
    fontWeight: Theme.fonts.weights.bold,
    color: Theme.colors.navy,
    fontFamily: Theme.fonts.heading,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 4,
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
  etaContainer: {
    alignItems: 'flex-end',
  },
  etaLabel: {
    fontSize: Theme.fonts.sizes.xs,
    color: Theme.colors.mutedGray,
    marginBottom: 2,
  },
  etaValue: {
    fontSize: Theme.fonts.sizes.lg,
    fontWeight: Theme.fonts.weights.bold,
    color: Theme.colors.teal,
    fontFamily: Theme.fonts.heading,
  },
  route: {
    fontSize: Theme.fonts.sizes.md,
    color: Theme.colors.mutedGray,
    marginBottom: Theme.spacing.md,
  },
  telemetryRow: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
    flexWrap: 'wrap',
  },
  telemetryChip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: Theme.colors.sand,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: Theme.radius.sm,
    gap: 4,
  },
  telemetryValue: {
    fontSize: Theme.fonts.sizes.md,
    fontWeight: Theme.fonts.weights.bold,
    color: Theme.colors.navy,
  },
  telemetryUnit: {
    fontSize: Theme.fonts.sizes.xs,
    color: Theme.colors.mutedGray,
  },
  telemetryLabel: {
    fontSize: Theme.fonts.sizes.xs,
    color: Theme.colors.mutedGray,
  },
  actions: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.buttons.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Theme.touchTarget.min,
  },
  actionButtonPrimary: {
    backgroundColor: Theme.colors.teal,
  },
  actionButtonAttention: {
    backgroundColor: Theme.colors.coral,
  },
  actionButtonText: {
    color: Theme.colors.white,
    fontSize: Theme.fonts.sizes.base,
    fontWeight: Theme.fonts.weights.bold,
    letterSpacing: 0.5,
  },
  iconButton: {
    width: Theme.touchTarget.min,
    height: Theme.touchTarget.min,
    borderRadius: Theme.buttons.borderRadius,
    borderWidth: 2,
    borderColor: 'rgba(107, 119, 133, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonText: {
    fontSize: 18,
  },
});
