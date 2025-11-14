
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Theme } from '@/constants/Theme';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface QuickAccessButtonProps {
  icon: string;
  label: string;
  color?: string;
  onPress?: () => void;
}

export function QuickAccessButton({ icon, label, color = Theme.colors.iosBlue, onPress }: QuickAccessButtonProps) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <IconSymbol name={icon} size={18} color={color} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: 10,
    borderRadius: Theme.radius.pill,
    borderWidth: 1,
    borderColor: Theme.colors.gray9,
    gap: 8,
    minWidth: 110,
    ...Theme.shadows.sm,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: Theme.fonts.sizes.base,
    fontWeight: Theme.fonts.weights.semibold,
    color: Theme.colors.gray1,
  },
});
