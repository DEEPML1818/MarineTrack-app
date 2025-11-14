
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';
import { FloatingControl } from './FloatingControl';

interface FloatingControlsStackProps {
  onMenuPress?: () => void;
  onLocationPress?: () => void;
  onReportPress?: () => void;
}

export function FloatingControlsStack({
  onMenuPress,
  onLocationPress,
  onReportPress,
}: FloatingControlsStackProps) {
  return (
    <View style={styles.container}>
      {/* Menu Button */}
      {onMenuPress && (
        <FloatingControl 
          icon="line.3.horizontal" 
          onPress={onMenuPress}
          size={48}
        />
      )}
      
      {/* Location Button */}
      {onLocationPress && (
        <FloatingControl 
          icon="location.fill" 
          onPress={onLocationPress}
          size={48}
          color={Theme.colors.iosBlue}
        />
      )}
      
      {/* Report/Alert Button */}
      {onReportPress && (
        <FloatingControl 
          icon="exclamationmark.triangle.fill" 
          onPress={onReportPress}
          size={48}
          color={Theme.colors.iosOrange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: Theme.spacing.base,
    bottom: 200,
    gap: Theme.spacing.sm,
    zIndex: 10,
  },
});
