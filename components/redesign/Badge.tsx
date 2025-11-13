import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';

interface BadgeProps {
  count: number | string;
  color?: string;
}

export function Badge({ count, color = '#007AFF' }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.text}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    borderRadius: Theme.radius.full,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xs,
  },
  text: {
    color: '#FFFFFF',
    fontSize: Theme.fonts.sizes.sm,
    fontWeight: Theme.fonts.weights.semibold,
  },
});
