import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Theme } from '@/constants/Theme';

interface SpeedHUDProps {
  speed: number;
  maxSpeed?: number;
}

export function SpeedHUD({ speed, maxSpeed = 30 }: SpeedHUDProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.05,
        useNativeDriver: true,
        tension: 100,
        friction: 3,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 3,
      }),
    ]).start();
  }, [speed]);

  const speedPercentage = Math.min((speed / maxSpeed) * 100, 100);
  const speedColor = 
    speed > maxSpeed * 0.8 ? Theme.colors.wazeRed :
    speed > maxSpeed * 0.5 ? Theme.colors.wazeYellow :
    Theme.colors.wazeBlue;

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <View style={[styles.circle, { borderColor: speedColor }]}>
        <View style={styles.innerCircle}>
          <Text style={styles.speedText}>{Math.round(speed)}</Text>
          <Text style={styles.unitText}>kn</Text>
        </View>
      </View>
      <View style={[styles.progressRing, { 
        borderTopColor: speedColor,
        transform: [{ rotate: `${(speedPercentage * 3.6) - 90}deg` }]
      }]} />
    </Animated.View>
  );
}

const HUD_SIZE = 90;
const BORDER_WIDTH = 4;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Theme.spacing.xxl + 80,
    left: Theme.spacing.base,
    width: HUD_SIZE,
    height: HUD_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.lg,
  },
  circle: {
    width: HUD_SIZE,
    height: HUD_SIZE,
    borderRadius: HUD_SIZE / 2,
    backgroundColor: Theme.colors.white,
    borderWidth: BORDER_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.md,
  },
  innerCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedText: {
    fontSize: 32,
    fontWeight: Theme.fonts.weights.bold,
    color: Theme.colors.gray1,
    lineHeight: 36,
  },
  unitText: {
    fontSize: Theme.fonts.sizes.sm,
    fontWeight: Theme.fonts.weights.semibold,
    color: Theme.colors.gray5,
    marginTop: -4,
  },
  progressRing: {
    position: 'absolute',
    width: HUD_SIZE,
    height: HUD_SIZE,
    borderRadius: HUD_SIZE / 2,
    borderWidth: BORDER_WIDTH,
    borderColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
});
