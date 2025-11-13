import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { QuickActionTile } from '@/components/redesign/QuickActionTile';
import { WeatherWidget } from '@/components/redesign/WeatherWidget';
import { StatChip } from '@/components/redesign/StatChip';
import { Card } from '@/components/redesign/Card';
import { SectionHeader } from '@/components/redesign/SectionHeader';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(width * 0.85, 400);

interface LuxuryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  vessels: any[];
  weather: any;
  hazards: any[];
  onRefresh: () => void;
}

export function LuxuryDrawer({
  isOpen,
  onClose,
  vessels,
  weather,
  hazards,
  onRefresh,
}: LuxuryDrawerProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const [slideAnim] = useState(new Animated.Value(-DRAWER_WIDTH));
  const [overlayAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: isOpen ? 0 : -DRAWER_WIDTH,
        useNativeDriver: true,
        damping: 20,
        stiffness: 90,
      }),
      Animated.timing(overlayAnim, {
        toValue: isOpen ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isOpen]);

  const quickActions = [
    { id: '1', icon: 'cloud.fill', label: 'Weather', color: Theme.colors.iosOrange, route: '/weather' },
    { id: '2', icon: 'exclamationmark.triangle.fill', label: 'SOS Alert', color: Theme.colors.iosRed, route: '/sos' },
    { id: '3', icon: 'anchor.fill', label: 'Ports', color: Theme.colors.iosPurple, route: '/ports' },
    { id: '4', icon: 'bell.fill', label: 'Alerts', color: Theme.colors.iosTeal, route: '/notifications' },
    { id: '5', icon: 'gear', label: 'Settings', color: Theme.colors.gray5, route: '/settings' },
  ];

  return (
    <>
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: overlayAnim,
          },
        ]}
        pointerEvents={isOpen ? 'auto' : 'none'}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.drawer,
          {
            width: DRAWER_WIDTH,
            backgroundColor: colors.background,
            transform: [{ translateX: slideAnim }],
          },
        ]}
        pointerEvents={isOpen ? 'auto' : 'none'}
      >
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <View>
            <Text style={[styles.appName, { color: colors.text }]}>MarineTrack</Text>
            <Text style={[styles.appSubtitle, { color: colors.secondaryText }]}>
              Professional Maritime Suite
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
            onPress={onClose}
          >
            <IconSymbol name="xmark" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.welcomeSection}>
            <Text style={[styles.welcomeTitle, { color: colors.text }]}>
              Welcome back, Captain
            </Text>
            <Text style={[styles.welcomeDate, { color: colors.secondaryText }]}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>

          {weather && (
            <View style={styles.weatherContainer}>
              <WeatherWidget
                temperature={`${weather.temperature}°F`}
                condition="Sunny"
                emoji="☀️"
                subtitle="Perfect for sailing!"
              />
            </View>
          )}

          <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>
            Quick Actions
          </Text>

          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <QuickActionTile
                key={action.id}
                icon={action.icon}
                label={action.label}
                color={action.color}
                onPress={() => {
                  onClose();
                  action.route && router.push(action.route as any);
                }}
              />
            ))}
          </View>

          <View style={styles.statsRow}>
            <StatChip value={vessels.length.toString()} label={`Nearby\nVessels`} color="#007AFF" />
            <StatChip value={hazards.length.toString()} label={`Active\nHazards`} color="#FF9500" />
            <StatChip value={weather ? `${weather.windSpeed}kn` : '--'} label={`Wind\nSpeed`} color="#34C759" />
          </View>

          {vessels.length > 0 && (
            <View style={styles.section}>
              <SectionHeader
                title="Nearby Vessels"
                actionText="View All"
                onActionPress={() => {
                  onClose();
                  router.push('/tracker');
                }}
              />
              {vessels.slice(0, 3).map((vessel, index) => (
                <Card key={index} style={styles.vesselCard}>
                  <View style={styles.vesselHeader}>
                    <Text style={[styles.vesselName, { color: colors.text }]}>
                      {vessel.vesselInfo?.vesselName || 'Unknown Vessel'}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: '#34C75920' }]}>
                      <Text style={[styles.statusBadgeText, { color: '#34C759' }]}>Live</Text>
                    </View>
                  </View>
                  <Text style={[styles.vesselType, { color: colors.secondaryText }]}>
                    {vessel.vesselInfo?.vesselType || 'Vessel'}
                  </Text>
                  <View style={styles.vesselMeta}>
                    <View style={styles.vesselMetaItem}>
                      <IconSymbol name="location.fill" size={14} color={colors.primary} />
                      <Text style={[styles.vesselMetaText, { color: colors.secondaryText }]}>
                        {vessel.distance ? `${vessel.distance.toFixed(1)} km` : 'Nearby'}
                      </Text>
                    </View>
                    <View style={styles.vesselMetaItem}>
                      <IconSymbol name="speedometer" size={14} color={colors.primary} />
                      <Text style={[styles.vesselMetaText, { color: colors.secondaryText }]}>
                        {vessel.location?.speed?.toFixed(1) || '0'} kn
                      </Text>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}

          {hazards.length > 0 && (
            <View style={styles.section}>
              <SectionHeader
                title="Active Hazards"
                actionText="View All"
                onActionPress={() => {
                  onClose();
                  router.push('/notifications');
                }}
              />
              {hazards.slice(0, 3).map((hazard, index) => (
                <Card key={index} style={styles.vesselCard}>
                  <View style={styles.vesselHeader}>
                    <View style={styles.hazardIcon}>
                      <Text style={styles.hazardIconText}>⚠️</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: Theme.spacing.md }}>
                      <Text style={[styles.vesselName, { color: colors.text }]}>
                        {hazard.type || 'Maritime Hazard'}
                      </Text>
                      <Text style={[styles.vesselType, { color: colors.secondaryText }]}>
                        {hazard.description || 'Unknown hazard in the area'}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: '#FF950020' }]}>
                      <Text style={[styles.statusBadgeText, { color: '#FF9500' }]}>
                        {hazard.severity || 'Alert'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.vesselMeta}>
                    <View style={styles.vesselMetaItem}>
                      <IconSymbol name="location.fill" size={14} color={Theme.colors.iosOrange} />
                      <Text style={[styles.vesselMetaText, { color: colors.secondaryText }]}>
                        {hazard.distance ? `${hazard.distance.toFixed(1)} km away` : 'Nearby'}
                      </Text>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: 60,
    paddingBottom: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: Theme.fonts.sizes.sm,
    marginTop: 2,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  welcomeSection: {
    paddingHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  welcomeTitle: {
    fontSize: Theme.fonts.sizes.xxl,
    fontWeight: Theme.fonts.weights.bold,
    marginBottom: Theme.spacing.xs,
  },
  welcomeDate: {
    fontSize: Theme.fonts.sizes.base,
  },
  weatherContainer: {
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: Theme.fonts.sizes.base,
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.base,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Theme.spacing.lg,
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  section: {
    marginBottom: Theme.spacing.xl,
  },
  vesselCard: {
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  vesselHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  vesselName: {
    fontSize: Theme.fonts.sizes.base,
    fontWeight: Theme.fonts.weights.semibold,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.radius.sm,
  },
  statusBadgeText: {
    fontSize: Theme.fonts.sizes.sm,
    fontWeight: Theme.fonts.weights.semibold,
  },
  vesselType: {
    fontSize: Theme.fonts.sizes.md,
    marginBottom: Theme.spacing.md,
  },
  vesselMeta: {
    flexDirection: 'row',
    gap: Theme.spacing.lg,
  },
  vesselMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  vesselMetaText: {
    fontSize: Theme.fonts.sizes.md,
  },
  hazardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF95001A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hazardIconText: {
    fontSize: 20,
  },
  bottomSpacing: {
    height: 100,
  },
});
