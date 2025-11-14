import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Theme } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Theme.colors.iosBlue,
        tabBarInactiveTintColor: isDark ? Theme.colors.gray6 : Theme.colors.gray7,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: isDark ? Theme.colors.darkCard : Theme.colors.white,
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          ...Theme.shadows.sm,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ 
              alignItems: 'center', 
              justifyContent: 'center',
              transform: [{ scale: focused ? 1.1 : 1 }],
            }}>
              <IconSymbol size={26} name="map.fill" color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ 
              alignItems: 'center', 
              justifyContent: 'center',
              transform: [{ scale: focused ? 1.1 : 1 }],
            }}>
              <IconSymbol size={26} name="house.fill" color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="tracker"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: focused ? Theme.colors.iosBlue : Theme.colors.iosBlue,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
              ...Theme.shadows.md,
            }}>
              <IconSymbol size={28} name="location.fill" color="#FFFFFF" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ 
              alignItems: 'center', 
              justifyContent: 'center',
              transform: [{ scale: focused ? 1.1 : 1 }],
            }}>
              <IconSymbol size={26} name="bubble.left.and.bubble.right.fill" color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ 
              alignItems: 'center', 
              justifyContent: 'center',
              transform: [{ scale: focused ? 1.1 : 1 }],
            }}>
              <IconSymbol size={26} name="person.fill" color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="weather"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="sos"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="ports"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="map_old"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}