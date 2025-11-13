
import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: isDark ? '#8E8E93' : '#C7C7CC',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          elevation: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <IconSymbol size={28} name="house.fill" color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: focused ? '#007AFF' : '#007AFF',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 25,
              shadowColor: '#007AFF',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}>
              <IconSymbol size={32} name="plus" color="#FFFFFF" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <IconSymbol size={28} name="checklist" color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="navigation"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="boats"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
