import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Polyline } from 'react-native-maps';
import { Theme } from '@/constants/Theme';

interface Position {
  latitude: number;
  longitude: number;
  timestamp?: number;
}

interface VesselTrailProps {
  positions: Position[];
  color?: string;
  width?: number;
  maxPoints?: number;
  fadeEffect?: boolean;
}

export function VesselTrail({ 
  positions, 
  color = Theme.colors.wazeTurquoise,
  width = 4,
  maxPoints = 50,
  fadeEffect = true,
}: VesselTrailProps) {
  if (!positions || positions.length < 2) {
    return null;
  }

  const limitedPositions = positions.slice(-maxPoints);

  if (!fadeEffect) {
    return (
      <Polyline
        coordinates={limitedPositions}
        strokeColor={color}
        strokeWidth={width}
        lineCap="round"
        lineJoin="round"
      />
    );
  }

  const segmentCount = Math.min(limitedPositions.length - 1, 10);
  const positionsPerSegment = Math.floor(limitedPositions.length / segmentCount);

  return (
    <View style={styles.container}>
      {Array.from({ length: segmentCount }).map((_, index) => {
        const startIdx = index * positionsPerSegment;
        const endIdx = index === segmentCount - 1 
          ? limitedPositions.length 
          : (index + 1) * positionsPerSegment + 1;
        
        const segmentPositions = limitedPositions.slice(startIdx, endIdx);
        
        if (segmentPositions.length < 2) return null;

        const opacity = (index + 1) / segmentCount;
        const segmentWidth = width * (0.5 + (opacity * 0.5));

        const hexToRgba = (hex: string, alpha: number) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        return (
          <Polyline
            key={`trail-segment-${index}`}
            coordinates={segmentPositions}
            strokeColor={hexToRgba(color, opacity)}
            strokeWidth={segmentWidth}
            lineCap="round"
            lineJoin="round"
          />
        );
      })}
      <View style={[styles.trailHead, {
        backgroundColor: color,
        ...Theme.shadows.md,
      }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  trailHead: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: Theme.colors.white,
  },
});
