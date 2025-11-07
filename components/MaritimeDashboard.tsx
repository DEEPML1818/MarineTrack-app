
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { 
  getNearbyHazards, 
  getTrafficHeatmap,
  getHazardIcon,
  getSeverityColor,
  getTrafficColor,
  type MaritimeHazard,
  type TrafficReport
} from '@/utils/maritimeIntelligence';

interface MaritimeDashboardProps {
  userLocation: { lat: number; lng: number } | null;
}

export default function MaritimeDashboard({ userLocation }: MaritimeDashboardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [hazards, setHazards] = useState<MaritimeHazard[]>([]);
  const [traffic, setTraffic] = useState<TrafficReport[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalHazards: 0,
    criticalHazards: 0,
    avgTrafficDensity: 'low' as 'low' | 'medium' | 'high' | 'critical',
    activeVessels: 0
  });

  useEffect(() => {
    loadData();
  }, [userLocation]);

  const loadData = async () => {
    if (!userLocation) return;
    
    const [hazardsData, trafficData] = await Promise.all([
      getNearbyHazards(userLocation.lat, userLocation.lng, 200),
      getTrafficHeatmap()
    ]);
    
    setHazards(hazardsData);
    setTraffic(trafficData);
    
    // Calculate stats
    const criticalCount = hazardsData.filter(h => h.severity === 'critical' || h.severity === 'high').length;
    const avgDensity = trafficData.length > 0 
      ? trafficData.reduce((acc, t) => {
          const val = { low: 1, medium: 2, high: 3, critical: 4 }[t.density];
          return acc + val;
        }, 0) / trafficData.length
      : 1;
    
    const densityLabel = avgDensity <= 1.5 ? 'low' : avgDensity <= 2.5 ? 'medium' : avgDensity <= 3.5 ? 'high' : 'critical';
    
    setStats({
      totalHazards: hazardsData.length,
      criticalHazards: criticalCount,
      avgTrafficDensity: densityLabel,
      activeVessels: trafficData.reduce((sum, t) => sum + t.vesselCount, 0)
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>🌊 Maritime Intelligence</Text>
        <Text style={styles.headerSubtitle}>Crowdsourced maritime safety network</Text>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={styles.statValue}>{stats.totalHazards}</Text>
          <Text style={[styles.statLabel, { color: colors.icon }]}>Active Hazards</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statValue, { color: '#ef4444' }]}>{stats.criticalHazards}</Text>
          <Text style={[styles.statLabel, { color: colors.icon }]}>Critical</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statValue, { color: getTrafficColor(stats.avgTrafficDensity) }]}>
            {stats.avgTrafficDensity.toUpperCase()}
          </Text>
          <Text style={[styles.statLabel, { color: colors.icon }]}>Traffic</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={styles.statValue}>{stats.activeVessels}</Text>
          <Text style={[styles.statLabel, { color: colors.icon }]}>Vessels</Text>
        </View>
      </View>

      {/* Active Hazards */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>⚠️ Active Hazards</Text>
        {hazards.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.icon }]}>
            No hazards reported in your area
          </Text>
        ) : (
          hazards.slice(0, 10).map((hazard) => (
            <View key={hazard.id} style={[styles.hazardCard, { borderLeftColor: getSeverityColor(hazard.severity) }]}>
              <View style={styles.hazardHeader}>
                <Text style={styles.hazardIcon}>{getHazardIcon(hazard.type)}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.hazardType, { color: colors.text }]}>
                    {hazard.type.toUpperCase()}
                  </Text>
                  <Text style={[styles.hazardDescription, { color: colors.icon }]}>
                    {hazard.description}
                  </Text>
                </View>
                <View style={styles.hazardMeta}>
                  <Text style={[styles.hazardDistance, { color: colors.primary }]}>
                    {hazard.distance?.toFixed(1)} km
                  </Text>
                  <Text style={[styles.hazardSeverity, { color: getSeverityColor(hazard.severity) }]}>
                    {hazard.severity}
                  </Text>
                </View>
              </View>
              <View style={styles.hazardFooter}>
                <Text style={[styles.hazardReporter, { color: colors.icon }]}>
                  👤 {hazard.reportedBy} • {hazard.verified ? '✓ Verified' : '🕐 Pending'}
                </Text>
                <Text style={[styles.hazardVotes, { color: colors.icon }]}>
                  👍 {hazard.upvotes} 👎 {hazard.downvotes}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Traffic Density */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>🚦 Traffic Density (24h)</Text>
        {traffic.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.icon }]}>
            No traffic data available
          </Text>
        ) : (
          <View style={styles.trafficGrid}>
            {traffic.slice(0, 6).map((report) => (
              <View key={report.id} style={[styles.trafficCard, { backgroundColor: colors.background }]}>
                <View style={[styles.trafficIndicator, { backgroundColor: getTrafficColor(report.density) }]} />
                <Text style={[styles.trafficDensity, { color: colors.text }]}>
                  {report.density.toUpperCase()}
                </Text>
                <Text style={[styles.trafficCount, { color: colors.icon }]}>
                  {report.vesselCount} vessels
                </Text>
                {report.portCode && (
                  <Text style={[styles.trafficPort, { color: colors.icon }]}>
                    📍 {report.portCode}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Info Footer */}
      <View style={[styles.footer, { backgroundColor: colors.card }]}>
        <Text style={[styles.footerText, { color: colors.icon }]}>
          🤝 Powered by crowdsourced maritime intelligence
        </Text>
        <Text style={[styles.footerText, { color: colors.icon }]}>
          Data updates every 2 minutes
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  hazardCard: {
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  hazardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hazardIcon: {
    fontSize: 24,
  },
  hazardType: {
    fontSize: 13,
    fontWeight: '600',
  },
  hazardDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  hazardMeta: {
    alignItems: 'flex-end',
  },
  hazardDistance: {
    fontSize: 13,
    fontWeight: '600',
  },
  hazardSeverity: {
    fontSize: 11,
    marginTop: 2,
  },
  hazardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  hazardReporter: {
    fontSize: 11,
  },
  hazardVotes: {
    fontSize: 11,
  },
  trafficGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  trafficCard: {
    width: '47%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  trafficIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginBottom: 8,
  },
  trafficDensity: {
    fontSize: 13,
    fontWeight: '600',
  },
  trafficCount: {
    fontSize: 11,
    marginTop: 4,
  },
  trafficPort: {
    fontSize: 10,
    marginTop: 4,
  },
  footer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    marginVertical: 2,
  },
});
