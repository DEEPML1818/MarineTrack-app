import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '@/constants/Theme';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  subtitle?: string;
}

export function SectionHeader({ title, actionLabel, onActionPress, subtitle }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {actionLabel && onActionPress && (
        <TouchableOpacity onPress={onActionPress}>
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: Theme.spacing.base,
    marginTop: Theme.spacing.xl,
    marginBottom: Theme.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: Theme.fonts.sizes.lg,
    fontWeight: Theme.fonts.weights.bold,
    color: Theme.colors.navy,
  },
  subtitle: {
    fontSize: Theme.fonts.sizes.sm,
    color: Theme.colors.mutedGray,
    marginTop: Theme.spacing.xs,
  },
  action: {
    fontSize: Theme.fonts.sizes.md,
    fontWeight: Theme.fonts.weights.semibold,
    color: Theme.colors.teal,
  },
});
