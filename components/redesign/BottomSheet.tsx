import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 70;
const SNAP_POINTS = {
  collapsed: SCREEN_HEIGHT * 0.15,
  middle: SCREEN_HEIGHT * 0.50,
  expanded: SCREEN_HEIGHT - TAB_BAR_HEIGHT - 10,
};

interface BottomSheetProps {
  children: React.ReactNode;
  onPositionChange?: (position: 'collapsed' | 'middle' | 'expanded') => void;
}

export function BottomSheet({ children, onPositionChange }: BottomSheetProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  
  const pan = useRef(new Animated.Value(SCREEN_HEIGHT - SNAP_POINTS.middle)).current;
  const [currentPosition, setCurrentPosition] = useState<'collapsed' | 'middle' | 'expanded'>('middle');
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  const animateToPosition = (position: 'collapsed' | 'middle' | 'expanded') => {
    const toValue = SCREEN_HEIGHT - SNAP_POINTS[position];

    Animated.spring(pan, {
      toValue,
      useNativeDriver: false,
      damping: 20,
      stiffness: 90,
    }).start();
    setCurrentPosition(position);
    onPositionChange?.(position);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        const newValue = (SCREEN_HEIGHT - SNAP_POINTS.middle) + gestureState.dy;
        const minY = SCREEN_HEIGHT - SNAP_POINTS.expanded;
        const maxY = SCREEN_HEIGHT - SNAP_POINTS.collapsed;
        
        if (newValue >= minY && newValue <= maxY) {
          pan.setValue(newValue);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const velocity = gestureState.vy;
        const currentY = (SCREEN_HEIGHT - SNAP_POINTS[currentPosition]) + gestureState.dy;

        if (velocity > 0.5) {
          if (currentPosition === 'expanded') {
            animateToPosition('middle');
          } else if (currentPosition === 'middle') {
            animateToPosition('collapsed');
          }
        } else if (velocity < -0.5) {
          if (currentPosition === 'collapsed') {
            animateToPosition('middle');
          } else if (currentPosition === 'middle') {
            animateToPosition('expanded');
          }
        } else {
          const expandedThreshold = SCREEN_HEIGHT - SNAP_POINTS.expanded + 50;
          const middleThreshold = SCREEN_HEIGHT - SNAP_POINTS.middle + 50;
          
          if (currentY < expandedThreshold) {
            animateToPosition('expanded');
          } else if (currentY < middleThreshold) {
            animateToPosition('middle');
          } else {
            animateToPosition('collapsed');
          }
        }
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          top: pan,
        },
      ]}
    >
      <View 
        {...panResponder.panHandlers}
        style={[styles.handle, { backgroundColor: colors.background }]}
      >
        <View style={[styles.handleBar, { backgroundColor: isDark ? '#666' : '#CCC' }]} />
      </View>
      
      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEnabled={currentPosition === 'expanded'}
        bounces={false}
        scrollEventThrottle={16}
        accessibilityRole="adjustable"
        accessibilityLabel={`Bottom sheet ${currentPosition}`}
      >
        {children}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SCREEN_HEIGHT,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 16,
  },
  handle: {
    height: 32,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
  },
  handleBar: {
    width: 48,
    height: 5,
    borderRadius: 3,
  },
  content: {
    flex: 1,
  },
});
