import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Theme } from '@/constants/Theme';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface FloatingControlProps {
  icon: string;
  onPress?: () => void;
  size?: number;
  color?: string;
  backgroundColor?: string;
}

export function FloatingControl({ 
  icon, 
  onPress, 
  size = 44,
  color = Theme.colors.gray1,
  backgroundColor = Theme.colors.white,
}: FloatingControlProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { 
          width: size, 
          height: size, 
          borderRadius: size / 2,
          backgroundColor 
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <IconSymbol name={icon} size={20} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.md,
    borderWidth: 0.5,
    borderColor: Theme.colors.gray9,
  },
});