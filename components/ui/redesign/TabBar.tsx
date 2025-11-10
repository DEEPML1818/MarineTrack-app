import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Theme } from '@/constants/Theme';

interface Tab {
  id: string;
  label: string;
}

interface TabBarProps {
  tabs: Tab[];
  onTabChange?: (tabId: string) => void;
  initialTab?: string;
}

export function TabBar({ tabs, onTabChange, initialTab }: TabBarProps) {
  const [activeTab, setActiveTab] = useState(initialTab || tabs[0]?.id);

  const handleTabPress = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, activeTab === tab.id && styles.tabActive]}
          onPress={() => handleTabPress(tab.id)}
        >
          <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Theme.spacing.base,
    marginVertical: Theme.spacing.md,
  },
  contentContainer: {
    gap: Theme.spacing.md,
  },
  tab: {
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.base,
    borderRadius: Theme.radius.full,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Theme.colors.navy,
  },
  tabActive: {
    backgroundColor: Theme.colors.navy,
  },
  tabText: {
    fontSize: Theme.fonts.sizes.md,
    fontWeight: Theme.fonts.weights.semibold,
    color: Theme.colors.navy,
  },
  tabTextActive: {
    color: Theme.colors.white,
  },
});
