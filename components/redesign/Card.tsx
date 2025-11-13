import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'primary' | 'secondary';
  elevation?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, style, variant = 'primary', elevation = 'sm' }: CardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const backgroundColor = variant === 'primary' ? colors.card : colors.cardSecondary;
  const shadow = Theme.shadows[elevation];

  return (
    <View
      style={[
        styles.card,
        { backgroundColor },
        shadow,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.base,
  },
});
