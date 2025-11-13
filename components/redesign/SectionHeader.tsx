import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';

interface SectionHeaderProps {
  title: string;
  actionText?: string;
  onActionPress?: () => void;
}

export function SectionHeader({ title, actionText, onActionPress }: SectionHeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {actionText && onActionPress && (
        <TouchableOpacity onPress={onActionPress}>
          <Text style={[styles.actionText, { color: colors.primary }]}>{actionText}</Text>
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
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.base,
  },
  title: {
    fontSize: Theme.fonts.sizes.lg,
    fontWeight: Theme.fonts.weights.semibold,
  },
  actionText: {
    fontSize: Theme.fonts.sizes.base,
    fontWeight: Theme.fonts.weights.semibold,
  },
});
