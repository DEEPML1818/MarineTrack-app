
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';

interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export function CustomTabBar({ state, descriptors, navigation }: TabBarProps) {
  return (
    <View style={styles.tabBar}>
      <View style={styles.separator} />
      <View style={styles.tabContainer}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? options.title ?? route.name;
          const icon = options.tabBarIcon;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tab}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, isFocused && styles.iconContainerActive]}>
                {icon && icon({ 
                  focused: isFocused, 
                  color: isFocused ? Theme.colors.burntOrange : Theme.colors.mutedGray,
                  size: 24 
                })}
              </View>
              <Text style={[styles.label, isFocused && styles.labelActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Theme.colors.white,
    paddingBottom: 20,
    paddingTop: 8,
    ...Theme.shadows.lg,
  },
  separator: {
    height: 1,
    backgroundColor: Theme.colors.cream,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    backgroundColor: Theme.colors.latte,
  },
  label: {
    fontSize: Theme.fonts.sizes.xs,
    color: Theme.colors.mutedGray,
    fontWeight: Theme.fonts.weights.medium,
  },
  labelActive: {
    color: Theme.colors.burntOrange,
    fontWeight: Theme.fonts.weights.bold,
  },
});
