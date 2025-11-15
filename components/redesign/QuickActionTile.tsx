import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Theme } from '@/constants/Theme';

interface QuickActionTileProps {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
}

export function QuickActionTile({ icon, label, color, onPress }: QuickActionTileProps) {
  return (
    <TouchableOpacity
      style={styles.tile}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <IconSymbol name={icon as any} size={28} color="#FFFFFF" />
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: '31%',
    aspectRatio: 1.1,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.md,
    justifyContent: 'space-between',
    backgroundColor: Theme.colors.white,
    ...Theme.shadows.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.sm,
  },
  label: {
    fontSize: Theme.fonts.sizes.base,
    fontWeight: Theme.fonts.weights.semibold,
    color: Theme.colors.gray1,
    marginTop: Theme.spacing.sm,
  },
});