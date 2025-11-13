import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';

interface WeatherWidgetProps {
  temperature: string;
  condition: string;
  emoji: string;
  subtitle?: string;
}

export function WeatherWidget({ temperature, condition, emoji, subtitle }: WeatherWidgetProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? colors.card : '#E8F4FF' },
        Theme.shadows.sm,
      ]}
    >
      <View>
        <Text style={[styles.label, { color: colors.secondaryText }]}>Today's Weather</Text>
        <Text style={[styles.temperature, { color: colors.text }]}>{condition}, {temperature}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>{subtitle}</Text>
        )}
      </View>
      <Text style={styles.emoji}>{emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.md,
  },
  label: {
    fontSize: Theme.fonts.sizes.md,
    marginBottom: Theme.spacing.xs,
  },
  temperature: {
    fontSize: Theme.fonts.sizes.xxl,
    fontWeight: Theme.fonts.weights.bold,
    marginBottom: Theme.spacing.xs,
  },
  subtitle: {
    fontSize: Theme.fonts.sizes.md,
  },
  emoji: {
    fontSize: 48,
  },
});
