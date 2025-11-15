import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { Theme } from '@/constants/Theme';
import { BlurView } from 'expo-blur';

interface FloatingActionButtonProps {
  icon?: string;
  onPress: () => void;
  size?: number;
  backgroundColor?: string;
  iconColor?: string;
}

export function FloatingActionButton({ 
  icon = '☰',
  onPress,
  size = 56,
  backgroundColor = Theme.colors.primary,
  iconColor = Theme.colors.white,
}: FloatingActionButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      tension: 150,
      friction: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 150,
      friction: 4,
    }).start();
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={[styles.button, { width: size, height: size, borderRadius: size / 2 }]}
      >
        {Platform.OS === 'ios' || Platform.OS === 'android' ? (
          <BlurView 
            intensity={60} 
            tint="light" 
            style={[styles.blurButton, { width: size, height: size, borderRadius: size / 2 }]}
          >
            <View style={[styles.iconContainer, { backgroundColor }]}>
              <Text style={[styles.icon, { color: iconColor }]}>{icon}</Text>
            </View>
          </BlurView>
        ) : (
          <View style={[styles.webButton, { backgroundColor, width: size, height: size, borderRadius: size / 2 }]}>
            <Text style={[styles.icon, { color: iconColor }]}>{icon}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Theme.spacing.huge,
    right: Theme.spacing.base,
    zIndex: 100,
    ...Theme.shadows.xl,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurButton: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  webButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 9999,
  },
  icon: {
    fontSize: 24,
    fontWeight: Theme.fonts.weights.bold,
  },
});
