import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '@/constants/Theme';

interface AlertBannerProps {
  title: string;
  message: string;
  onPress?: () => void;
  variant?: 'warning' | 'danger' | 'info';
}

export function AlertBanner({ title, message, onPress, variant = 'warning' }: AlertBannerProps) {
  const backgroundColor = variant === 'danger' ? Theme.colors.coral : variant === 'info' ? Theme.colors.teal : Theme.colors.warning;
  
  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor }]} 
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      disabled={!onPress}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
      {onPress && (
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>›</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.base,
    marginHorizontal: Theme.spacing.base,
    marginVertical: Theme.spacing.md,
    ...Theme.shadows.sm,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: Theme.fonts.sizes.base,
    fontWeight: Theme.fonts.weights.bold,
    color: Theme.colors.white,
    marginBottom: Theme.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  message: {
    fontSize: Theme.fonts.sizes.sm,
    color: Theme.colors.white,
    opacity: 0.9,
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: Theme.fonts.sizes.xl,
    color: Theme.colors.white,
    fontWeight: Theme.fonts.weights.bold,
  },
});
