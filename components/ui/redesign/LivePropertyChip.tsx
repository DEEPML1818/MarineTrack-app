import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';

interface LivePropertyChipProps {
  icon: string;
  value: string;
  label: string;
}

export function LivePropertyChip({ icon, value, label }: LivePropertyChipProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.textContainer}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    backgroundColor: Theme.colors.white,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.radius.md,
    ...Theme.shadows.sm,
  },
  icon: {
    fontSize: Theme.fonts.sizes.lg,
  },
  textContainer: {
    gap: 2,
  },
  value: {
    fontSize: Theme.fonts.sizes.base,
    fontWeight: Theme.fonts.weights.bold,
    color: Theme.colors.navy,
  },
  label: {
    fontSize: Theme.fonts.sizes.xs,
    color: Theme.colors.mutedGray,
  },
});
