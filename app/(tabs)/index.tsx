import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, RefreshControl, Platform } from 'react-native';
import { Link } from 'expo-router';
import { Theme } from '../../constants/Theme';

interface Vessel {
  id: string;
  name: string;
  type: string;
  speed: number;
  status: 'live' | 'docked' | 'delayed' | 'attention';
  operator?: string;
  distance?: number;
}

export default function HomeScreen() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    activeVessels: 0,
    alerts: 0,
    avgSpeed: 0,
  });

  const fetchData = async () => {
    try {
      // Simulated data - replace with actual API calls
      const mockVessels: Vessel[] = [
        { id: '1', name: 'Ocean Explorer', type: 'Fishing Boat', speed: 12.5, status: 'live', operator: 'Marine Co.', distance: 2.3 },
        { id: '2', name: 'Sea Hawk', type: 'Cargo Ship', speed: 0, status: 'docked', operator: 'Shipping Ltd.', distance: 0.5 },
        { id: '3', name: 'Wave Runner', type: 'Fishing Boat', speed: 8.2, status: 'live', operator: 'Fisher Co.', distance: 5.1 },
      ];
      setVessels(mockVessels);
      setStats({
        activeVessels: mockVessels.filter(v => v.status === 'live').length,
        alerts: mockVessels.filter(v => v.status === 'attention').length,
        avgSpeed: 8.5,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return Theme.colors.statusLive;
      case 'docked': return Theme.colors.statusDocked;
      case 'delayed': return Theme.colors.statusDelayed;
      case 'attention': return Theme.colors.statusAttention;
      default: return Theme.colors.mutedGray;
    }
  };

  return (
    <ScrollView 
      style={styles.screen}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.teal} />
      }
    >
      {/* Hero Banner */}
      <View style={styles.heroBanner}>
        <View style={styles.heroContent}>
          <View style={styles.heroTag}>
            <Text style={styles.heroTagText}>⚓ LIVE TRACKING</Text>
          </View>
          <Text style={styles.heroTitle}>Marine Traffic</Text>
          <Text style={styles.heroSubtitle}>Real-time vessel monitoring and navigation</Text>
          <Link href="/map" asChild>
            <TouchableOpacity style={styles.heroCta}>
              <Text style={styles.heroCtaText}>View Full Map</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.activeVessels}</Text>
          <Text style={styles.statLabel}>ACTIVE</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.alerts}</Text>
          <Text style={styles.statLabel}>ALERTS</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.avgSpeed.toFixed(1)}</Text>
          <Text style={styles.statLabel}>AVG SPEED</Text>
        </View>
      </View>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Nearby Vessels</Text>
        <Link href="/tracker" asChild>
          <TouchableOpacity>
            <Text style={styles.sectionAction}>View All →</Text>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Vessel Feed */}
      <View style={styles.vesselFeed}>
        {vessels.map((vessel) => (
          <View key={vessel.id} style={styles.vesselCard}>
            <View style={styles.vesselCardMedia}>
              <View style={[styles.vesselBadge, { backgroundColor: getStatusColor(vessel.status) }]}>
                <Text style={styles.vesselBadgeText}>{vessel.status.toUpperCase()}</Text>
              </View>
              {vessel.status === 'live' && (
                <View style={styles.vesselSpeed}>
                  <Text style={styles.vesselSpeedText}>{vessel.speed} kn</Text>
                </View>
              )}
            </View>
            <View style={styles.vesselCardContent}>
              <Text style={styles.vesselName}>{vessel.name}</Text>
              <Text style={styles.vesselRoute}>{vessel.operator || 'Unknown Operator'}</Text>
              <View style={styles.vesselMeta}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaText}>🚢 {vessel.type}</Text>
                </View>
                {vessel.distance && (
                  <View style={styles.metaItem}>
                    <Text style={styles.metaText}>📍 {vessel.distance} km</Text>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.vesselCardActions}>
              <TouchableOpacity style={styles.btnSecondary}>
                <Text style={styles.btnSecondaryText}>Track</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnIcon}>
                <Text>ℹ️</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Quick Access */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick Access</Text>
      </View>
      <View style={styles.quickAccess}>
        <Link href="/weather" asChild>
          <TouchableOpacity style={styles.quickAccessCard}>
            <Text style={styles.quickAccessIcon}>🌊</Text>
            <Text style={styles.quickAccessLabel}>Weather</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/ports" asChild>
          <TouchableOpacity style={styles.quickAccessCard}>
            <Text style={styles.quickAccessIcon}>⚓</Text>
            <Text style={styles.quickAccessLabel}>Ports</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/chat" asChild>
          <TouchableOpacity style={styles.quickAccessCard}>
            <Text style={styles.quickAccessIcon}>💬</Text>
            <Text style={styles.quickAccessLabel}>Chat</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/sos" asChild>
          <TouchableOpacity style={[styles.quickAccessCard, styles.quickAccessCardDanger]}>
            <Text style={styles.quickAccessIcon}>🚨</Text>
            <Text style={styles.quickAccessLabel}>SOS</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: Theme.colors.offWhite,
    flex: 1,
  },
  heroBanner: {
    height: 200,
    backgroundColor: Theme.colors.teal,
    marginBottom: Theme.spacing.base,
  },
  heroContent: {
    height: '100%',
    justifyContent: 'flex-end',
    padding: Theme.spacing.xl,
  },
  heroTag: {
    alignSelf: 'flex-start',
    backgroundColor: Theme.colors.coral,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.radius.full,
    marginBottom: Theme.spacing.md,
  },
  heroTagText: {
    color: Theme.colors.white,
    fontSize: Theme.fonts.sizes.sm,
    fontWeight: Theme.fonts.weights.semibold,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: Theme.fonts.sizes.xl,
    fontWeight: Theme.fonts.weights.bold,
    color: Theme.colors.white,
    marginBottom: Theme.spacing.sm,
  },
  heroSubtitle: {
    fontSize: Theme.fonts.sizes.md,
    color: Theme.colors.white,
    opacity: 0.9,
    marginBottom: Theme.spacing.base,
  },
  heroCta: {
    alignSelf: 'flex-start',
    backgroundColor: Theme.colors.white,
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.radius.md,
  },
  heroCtaText: {
    color: Theme.colors.teal,
    fontSize: Theme.fonts.sizes.base,
    fontWeight: Theme.fonts.weights.semibold,
  },
  quickStats: {
    flexDirection: 'row',
    gap: Theme.spacing.base,
    paddingHorizontal: Theme.spacing.base,
    marginBottom: Theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.base,
    alignItems: 'center',
    ...(Platform.OS === 'web' ? Theme.webShadows.sm : Theme.shadows.sm),
  },
  statValue: {
    fontSize: Theme.fonts.sizes.xl,
    fontWeight: Theme.fonts.weights.bold,
    color: Theme.colors.teal,
  },
  statLabel: {
    fontSize: Theme.fonts.sizes.xs,
    color: Theme.colors.mutedGray,
    marginTop: Theme.spacing.xs,
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.base,
    marginBottom: Theme.spacing.base,
  },
  sectionTitle: {
    fontSize: Theme.fonts.sizes.lg,
    fontWeight: Theme.fonts.weights.bold,
    color: Theme.colors.navy,
  },
  sectionAction: {
    fontSize: Theme.fonts.sizes.md,
    color: Theme.colors.teal,
    fontWeight: Theme.fonts.weights.semibold,
  },
  vesselFeed: {
    gap: Theme.spacing.base,
    paddingHorizontal: Theme.spacing.base,
    marginBottom: Theme.spacing.xl,
  },
  vesselCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? Theme.webShadows.md : Theme.shadows.md),
  },
  vesselCardMedia: {
    height: 120,
    backgroundColor: Theme.colors.navy,
    justifyContent: 'space-between',
    padding: Theme.spacing.md,
  },
  vesselBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.radius.full,
  },
  vesselBadgeText: {
    color: Theme.colors.white,
    fontSize: Theme.fonts.sizes.sm,
    fontWeight: Theme.fonts.weights.semibold,
    letterSpacing: 0.5,
  },
  vesselSpeed: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(8, 40, 55, 0.8)',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.radius.full,
  },
  vesselSpeedText: {
    color: Theme.colors.white,
    fontSize: Theme.fonts.sizes.sm,
    fontWeight: Theme.fonts.weights.bold,
  },
  vesselCardContent: {
    padding: Theme.spacing.base,
  },
  vesselName: {
    fontSize: Theme.fonts.sizes.lg,
    fontWeight: Theme.fonts.weights.bold,
    color: Theme.colors.navy,
    marginBottom: Theme.spacing.xs,
  },
  vesselRoute: {
    fontSize: Theme.fonts.sizes.md,
    color: Theme.colors.mutedGray,
    marginBottom: Theme.spacing.md,
  },
  vesselMeta: {
    flexDirection: 'row',
    gap: Theme.spacing.base,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: Theme.fonts.sizes.sm,
    color: Theme.colors.mutedGray,
  },
  vesselCardActions: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    padding: Theme.spacing.base,
    borderTopWidth: 1,
    borderTopColor: 'rgba(107, 119, 133, 0.1)',
  },
  btnSecondary: {
    flex: 1,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xl,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Theme.colors.teal,
    borderRadius: Theme.radius.md,
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: Theme.colors.teal,
    fontSize: Theme.fonts.sizes.base,
    fontWeight: Theme.fonts.weights.semibold,
  },
  btnIcon: {
    width: Theme.touchTarget.min,
    height: Theme.touchTarget.min,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(107, 119, 133, 0.2)',
    borderRadius: Theme.radius.md,
  },
  quickAccess: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.base,
    marginBottom: Theme.spacing.xxxl,
  },
  quickAccessCard: {
    flex: 1,
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.base,
    alignItems: 'center',
    ...(Platform.OS === 'web' ? Theme.webShadows.sm : Theme.shadows.sm),
  },
  quickAccessCardDanger: {
    backgroundColor: Theme.colors.coral,
  },
  quickAccessIcon: {
    fontSize: 32,
    marginBottom: Theme.spacing.sm,
  },
  quickAccessLabel: {
    fontSize: Theme.fonts.sizes.sm,
    fontWeight: Theme.fonts.weights.semibold,
    color: Theme.colors.navy,
  },
});