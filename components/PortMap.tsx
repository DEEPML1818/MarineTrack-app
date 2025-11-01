
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { MAJOR_PORTS } from '@/utils/marineData';
import { fetchPortVesselData, getTotalVesselsCount, PortVesselData } from '@/utils/vesselScraper';

export default function PortMap() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [selectedPort, setSelectedPort] = useState<string | null>(null);
  const [portData, setPortData] = useState<PortVesselData | null>(null);
  const [loading, setLoading] = useState(false);

  const loadPortData = async (portCode: string) => {
    setLoading(true);
    const data = await fetchPortVesselData(portCode);
    setPortData(data);
    setLoading(false);
  };

  const handlePortPress = (portId: string) => {
    if (selectedPort === portId) {
      setSelectedPort(null);
      setPortData(null);
    } else {
      setSelectedPort(portId);
      loadPortData(portId);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Malaysian Ports</Text>
      <Text style={[styles.subtitle, { color: colors.icon }]}>Real-time vessel tracking from VesselFinder</Text>
      
      <ScrollView style={styles.portsList}>
        {MAJOR_PORTS.map((port) => (
          <View key={port.id}>
            <TouchableOpacity
              style={[
                styles.portItem, 
                { 
                  backgroundColor: colors.card, 
                  borderColor: selectedPort === port.id ? colors.primary : colors.border,
                  borderWidth: selectedPort === port.id ? 2 : 1
                }
              ]}
              onPress={() => handlePortPress(port.id)}
            >
              <View style={styles.portHeader}>
                <Text style={[styles.portName, { color: colors.text }]}>⚓ {port.name}</Text>
                <View style={[styles.vesselCount, { backgroundColor: colors.primary }]}>
                  <Text style={styles.vesselCountText}>{port.vessels}</Text>
                </View>
              </View>
              
              <View style={styles.portInfo}>
                <Text style={[styles.portDetail, { color: colors.icon }]}>
                  📍 {port.lat.toFixed(4)}°N, {port.lng.toFixed(4)}°E
                </Text>
                <Text style={[styles.portDetail, { color: colors.icon }]}>
                  🏢 {port.type}
                </Text>
                <Text style={[styles.portDetail, { color: colors.icon }]}>
                  🌍 {port.country}
                </Text>
              </View>
              
              <View style={styles.portFooter}>
                <Text style={[styles.footerText, { color: colors.accent }]}>
                  {selectedPort === port.id ? 'Hide Details ▲' : 'View Details →'}
                </Text>
              </View>
            </TouchableOpacity>

            {selectedPort === port.id && portData && (
              <View style={[styles.vesselDetails, { backgroundColor: colors.background }]}>
                <View style={styles.vesselSection}>
                  <Text style={[styles.vesselSectionTitle, { color: colors.primary }]}>
                    🟢 In Port ({portData.inPort.length})
                  </Text>
                  {portData.inPort.map((vessel, idx) => (
                    <View key={idx} style={[styles.vesselItem, { backgroundColor: colors.card }]}>
                      <Text style={[styles.vesselName, { color: colors.text }]}>{vessel.name}</Text>
                      <Text style={[styles.vesselInfo, { color: colors.icon }]}>
                        {vessel.type} • {vessel.flag} • IMO: {vessel.imo}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.vesselSection}>
                  <Text style={[styles.vesselSectionTitle, { color: colors.accent }]}>
                    📥 Expected ({portData.expected.length})
                  </Text>
                  {portData.expected.map((vessel, idx) => (
                    <View key={idx} style={[styles.vesselItem, { backgroundColor: colors.card }]}>
                      <Text style={[styles.vesselName, { color: colors.text }]}>{vessel.name}</Text>
                      <Text style={[styles.vesselInfo, { color: colors.icon }]}>
                        ETA: {new Date(vessel.eta).toLocaleDateString('en-MY')}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.vesselSection}>
                  <Text style={[styles.vesselSectionTitle, { color: colors.secondary }]}>
                    🚢 Arrivals ({portData.arrivals.length}) • Departures ({portData.departures.length})
                  </Text>
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  portsList: {
    flex: 1,
  },
  portItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  portHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  portName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  vesselCount: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  vesselCountText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  portInfo: {
    gap: 6,
    marginBottom: 12,
  },
  portDetail: {
    fontSize: 13,
    lineHeight: 20,
  },
  portFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
    marginTop: 4,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600',
  },
  vesselDetails: {
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  vesselSection: {
    marginBottom: 16,
  },
  vesselSectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  vesselItem: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  vesselName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  vesselInfo: {
    fontSize: 12,
  },
});
