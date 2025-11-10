import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '@/constants/Theme';

interface VesselDetailHeaderProps {
  vesselName: string;
  vesselType?: string;
  status?: string;
  timestamp?: string;
  onClose?: () => void;
}

export function VesselDetailHeader({
  vesselName,
  vesselType,
  status,
  timestamp,
  onClose,
}: VesselDetailHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.vesselName}>{vesselName}</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeIcon}>×</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {vesselType && <Text style={styles.vesselType}>{vesselType}</Text>}
      
      {(status || timestamp) && (
        <View style={styles.metadata}>
          {status && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusDot}>●</Text>
              <Text style={styles.statusText}>{status}</Text>
            </View>
          )}
          {timestamp && (
            <View style={styles.timestamp}>
              <Text style={styles.timestampIcon}>⏱️</Text>
              <Text style={styles.timestampText}>{timestamp}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Theme.spacing.base,
    backgroundColor: Theme.colors.white,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.xs,
  },
  vesselName: {
    fontSize: Theme.fonts.sizes.xl,
    fontWeight: Theme.fonts.weights.bold,
    color: Theme.colors.navy,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 32,
    color: Theme.colors.mutedGray,
    lineHeight: 32,
  },
  vesselType: {
    fontSize: Theme.fonts.sizes.md,
    color: Theme.colors.mutedGray,
    marginBottom: Theme.spacing.sm,
  },
  metadata: {
    flexDirection: 'row',
    gap: Theme.spacing.base,
    marginTop: Theme.spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  statusDot: {
    color: Theme.colors.statusLive,
    fontSize: Theme.fonts.sizes.sm,
  },
  statusText: {
    fontSize: Theme.fonts.sizes.sm,
    color: Theme.colors.navy,
    textTransform: 'uppercase',
    fontWeight: Theme.fonts.weights.semibold,
  },
  timestamp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  timestampIcon: {
    fontSize: Theme.fonts.sizes.sm,
  },
  timestampText: {
    fontSize: Theme.fonts.sizes.sm,
    color: Theme.colors.mutedGray,
  },
});
