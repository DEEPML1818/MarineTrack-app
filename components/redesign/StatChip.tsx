import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';

interface StatChipProps {
  value: string;
  label: string;
  color?: string;
}

export function StatChip({ value, label, color }: StatChipProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.card }, Theme.shadows.sm]}>
      <Text style={[styles.value, { color: color || colors.primary }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.secondaryText }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Theme.spacing.base,
    borderRadius: Theme.radius.sm,
    alignItems: 'center',
  },
  value: {
    fontSize: Theme.fonts.sizes.xxl,
    fontWeight: Theme.fonts.weights.bold,
    marginBottom: Theme.spacing.xs,
  },
  label: {
    fontSize: Theme.fonts.sizes.sm,
    textAlign: 'center',
  },
});
