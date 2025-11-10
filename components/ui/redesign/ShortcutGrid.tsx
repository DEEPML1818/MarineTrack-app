import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '@/constants/Theme';

interface Shortcut {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onPress: () => void;
}

interface ShortcutGridProps {
  shortcuts: Shortcut[];
}

export function ShortcutGrid({ shortcuts }: ShortcutGridProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shortcuts</Text>
      <View style={styles.grid}>
        {shortcuts.map((shortcut) => (
          <TouchableOpacity
            key={shortcut.id}
            style={styles.shortcut}
            onPress={shortcut.onPress}
          >
            {shortcut.icon && <View style={styles.iconContainer}>{shortcut.icon}</View>}
            <Text style={styles.label}>{shortcut.label}</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Theme.spacing.base,
    marginVertical: Theme.spacing.md,
  },
  title: {
    fontSize: Theme.fonts.sizes.lg,
    fontWeight: Theme.fonts.weights.bold,
    color: Theme.colors.navy,
    marginBottom: Theme.spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.md,
  },
  shortcut: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Theme.colors.warning,
    paddingVertical: Theme.spacing.base,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...Theme.shadows.sm,
  },
  iconContainer: {
    marginRight: Theme.spacing.sm,
  },
  label: {
    flex: 1,
    fontSize: Theme.fonts.sizes.md,
    fontWeight: Theme.fonts.weights.semibold,
    color: Theme.colors.navy,
  },
  arrow: {
    fontSize: Theme.fonts.sizes.xl,
    color: Theme.colors.navy,
    fontWeight: Theme.fonts.weights.bold,
  },
});
