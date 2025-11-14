
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { QuickAccessButton } from './QuickAccessButton';

interface MapBottomDrawerProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  searchResults: any[];
  onSelectPort: (port: any) => void;
  vessels: any[];
  onVesselPress?: (vessel: any) => void;
  isDark?: boolean;
}

export function MapBottomDrawer({
  searchQuery,
  onSearchChange,
  searchResults,
  onSelectPort,
  vessels,
  onVesselPress,
  isDark = false,
}: MapBottomDrawerProps) {
  return (
    <View style={styles.container}>
      {/* Elegant Search Bar with Voice - Waze Style */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <View style={styles.searchIconContainer}>
            <IconSymbol name="magnifyingglass" size={18} color={Theme.colors.gray5} />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Where to?"
            placeholderTextColor={Theme.colors.gray6}
            value={searchQuery}
            onChangeText={onSearchChange}
          />
          <TouchableOpacity style={styles.voiceButton} activeOpacity={0.6}>
            <IconSymbol name="mic.fill" size={18} color={Theme.colors.iosBlue} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Access Buttons - Waze Style */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickAccessContainer}
      >
        <QuickAccessButton
          icon="house.fill"
          label="Home"
          color="#FF6B35"
          onPress={() => {}}
        />
        <QuickAccessButton
          icon="briefcase.fill"
          label="Work"
          color="#4A90E2"
          onPress={() => {}}
        />
        <QuickAccessButton
          icon="plus.circle.fill"
          label="New"
          color={Theme.colors.iosBlue}
          onPress={() => {}}
        />
      </ScrollView>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <ScrollView style={styles.resultsContainer} keyboardShouldPersistTaps="handled">
          {searchResults.map((port) => (
            <TouchableOpacity
              key={port.id}
              style={styles.resultItem}
              onPress={() => onSelectPort(port)}
              activeOpacity={0.7}
            >
              <View style={styles.resultIconWrapper}>
                <IconSymbol name="location.fill" size={18} color={Theme.colors.iosBlue} />
              </View>
              <View style={styles.resultContent}>
                <Text style={styles.resultTitle}>{port.name}</Text>
                <Text style={styles.resultSubtitle}>{port.country}</Text>
              </View>
              <IconSymbol name="chevron.right" size={16} color={Theme.colors.gray7} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Recent Section - Elegant List */}
      {searchQuery.length === 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.sectionLabel}>Recent</Text>
          
          {vessels.slice(0, 5).map((vessel, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.recentItem,
                index === vessels.slice(0, 5).length - 1 && styles.recentItemLast
              ]}
              onPress={() => onVesselPress?.(vessel)}
              activeOpacity={0.7}
            >
              <View style={styles.recentIconWrapper}>
                <IconSymbol name="location.fill" size={18} color={Theme.colors.gray5} />
              </View>
              <View style={styles.recentContent}>
                <Text style={styles.recentTitle}>
                  {vessel.vesselInfo?.vesselName || 'Unknown Vessel'}
                </Text>
                <Text style={styles.recentSubtitle}>
                  {vessel.vesselInfo?.vesselType || 'Vessel'} • {vessel.distance?.toFixed(1) || '0'} km
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.white,
    borderTopLeftRadius: Theme.radius.lg,
    borderTopRightRadius: Theme.radius.lg,
    paddingTop: Theme.spacing.base,
    paddingBottom: Theme.spacing.xl,
  },
  searchContainer: {
    paddingHorizontal: Theme.spacing.drawer,
    marginBottom: Theme.spacing.base,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.gray11,
    borderRadius: Theme.radius.search,
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: 14,
    gap: 12,
  },
  searchIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: Theme.fonts.sizes.base,
    color: Theme.colors.gray1,
    fontWeight: Theme.fonts.weights.regular,
    padding: 0,
  },
  voiceButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  quickAccessContainer: {
    paddingHorizontal: Theme.spacing.drawer,
    gap: 12,
    marginBottom: Theme.spacing.lg,
  },
  resultsContainer: {
    maxHeight: 350,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.drawer,
    paddingVertical: Theme.spacing.md,
    gap: Theme.spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Theme.colors.gray9,
  },
  resultIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.colors.gray11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: Theme.fonts.sizes.base,
    fontWeight: Theme.fonts.weights.semibold,
    color: Theme.colors.gray1,
    marginBottom: 2,
  },
  resultSubtitle: {
    fontSize: Theme.fonts.sizes.sm,
    color: Theme.colors.gray6,
  },
  recentSection: {
    paddingTop: Theme.spacing.xs,
  },
  sectionLabel: {
    fontSize: Theme.fonts.sizes.sm,
    fontWeight: Theme.fonts.weights.semibold,
    color: Theme.colors.gray5,
    marginBottom: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.drawer,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.drawer,
    paddingVertical: Theme.spacing.md,
    gap: Theme.spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Theme.colors.gray9,
  },
  recentItemLast: {
    borderBottomWidth: 0,
  },
  recentIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.colors.gray11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentContent: {
    flex: 1,
  },
  recentTitle: {
    fontSize: Theme.fonts.sizes.base,
    fontWeight: Theme.fonts.weights.semibold,
    color: Theme.colors.gray1,
    marginBottom: 2,
  },
  recentSubtitle: {
    fontSize: Theme.fonts.sizes.sm,
    color: Theme.colors.gray6,
  },
});
