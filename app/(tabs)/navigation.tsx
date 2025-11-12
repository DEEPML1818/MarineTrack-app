
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import aisService from '@/services/aisService';
import navigationService from '@/services/navigationService';
import weatherService from '@/services/weatherService';
import hazardService from '@/services/hazardService';
import sosService from '@/services/sosService';
import { Vessel, WeatherData, Hazard, Route } from '@/types/maritime';

export default function NavigationScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [currentVessel, setCurrentVessel] = useState<Vessel>({
    id: '1',
    name: 'Sea Breeze',
    mmsi: '533000001',
    type: 'Yacht',
    latitude: 5.4164,
    longitude: 100.3327,
    speed: 12.5,
    heading: 45,
    lastUpdate: Date.now()
  });
  
  const [nearbyVessels, setNearbyVessels] = useState<Vessel[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [hazards, setHazards] = useState<Hazard[]>([]);

  useEffect(() => {
    aisService.startTracking(currentVessel);
    const unsubscribeVessels = aisService.subscribe(setNearbyVessels);
    const unsubscribeHazards = hazardService.subscribe(setHazards);
    fetchWeather();
    
    return () => {
      aisService.stopTracking();
      unsubscribeVessels();
      unsubscribeHazards();
    };
  }, []);

  const fetchWeather = async () => {
    const weatherData = await weatherService.getCurrentWeather(
      currentVessel.latitude,
      currentVessel.longitude
    );
    setWeather(weatherData);
  };

  const handleSOS = () => {
    Alert.alert(
      'Emergency SOS',
      'Send emergency alert to coast guard and nearby vessels?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send SOS',
          style: 'destructive',
          onPress: async () => {
            const success = await sosService.sendSOS(
              currentVessel.id,
              currentVessel.name,
              currentVessel.latitude,
              currentVessel.longitude
            );
            if (success) {
              Alert.alert('SOS Sent', 'Emergency services have been notified');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={isDark ? '#FFF' : '#000'} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <IconSymbol name="paperplane.fill" size={22} color={isDark ? '#007AFF' : '#007AFF'} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.sosButton]} onPress={handleSOS}>
            <Text style={styles.sosText}>SOS</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <Text style={[styles.greeting, { color: isDark ? '#FFF' : '#000' }]}>
          Navigate Safely
        </Text>
        <Text style={[styles.date, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </Text>

        {/* Weather Card */}
        {weather && (
          <View style={[styles.weatherCard, { backgroundColor: isDark ? '#1C1C1E' : '#E3F2FD' }]}>
            <View style={styles.weatherContent}>
              <View>
                <Text style={[styles.weatherLabel, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>
                  Today's Weather
                </Text>
                <Text style={[styles.weatherMain, { color: isDark ? '#FFF' : '#000' }]}>
                  {weather.seaState}, {weather.temperature}°C
                </Text>
                <Text style={[styles.weatherSub, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>
                  Perfect for Sailing!
                </Text>
              </View>
              <Text style={styles.weatherIcon}>☀️</Text>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={[styles.actionCard, styles.actionCardPrimary]}
            onPress={() => Alert.alert('Navigation', 'Route planning')}
          >
            <IconSymbol name="map.fill" size={32} color="#FFF" />
            <Text style={styles.actionCardText}>Plan Route</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionCard, styles.actionCardSecondary]}
            onPress={() => Alert.alert('Hazard', 'Report hazard')}
          >
            <IconSymbol name="paperplane.fill" size={32} color="#007AFF" />
            <Text style={styles.actionCardTextAlt}>Report</Text>
          </TouchableOpacity>
        </View>

        {/* Info Cards */}
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#000' }]}>
              Active Status
            </Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {/* Vessels Card */}
          <TouchableOpacity style={[styles.infoCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
            <View style={styles.infoCardHeader}>
              <View style={[styles.badge, { backgroundColor: '#E3F2FD' }]}>
                <Text style={styles.badgeNumber}>{nearbyVessels.length}</Text>
              </View>
              <View style={styles.infoCardContent}>
                <Text style={[styles.infoCardLabel, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>
                  Nearby Vessels
                </Text>
                <Text style={[styles.infoCardValue, { color: isDark ? '#FFF' : '#000' }]}>
                  {nearbyVessels.length} vessel{nearbyVessels.length !== 1 ? 's' : ''} detected
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Position Card */}
          <TouchableOpacity style={[styles.infoCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
            <View style={styles.infoCardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}>
                <IconSymbol name="house.fill" size={20} color="#FF9500" />
              </View>
              <View style={styles.infoCardContent}>
                <Text style={[styles.infoCardLabel, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>
                  Current Position
                </Text>
                <Text style={[styles.infoCardValue, { color: isDark ? '#FFF' : '#000' }]}>
                  {currentVessel.latitude.toFixed(4)}°N, {currentVessel.longitude.toFixed(4)}°E
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Speed Card */}
          <TouchableOpacity style={[styles.infoCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
            <View style={styles.infoCardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
                <IconSymbol name="chevron.right" size={20} color="#34C759" />
              </View>
              <View style={styles.infoCardContent}>
                <Text style={[styles.infoCardLabel, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>
                  Speed & Heading
                </Text>
                <Text style={[styles.infoCardValue, { color: isDark ? '#FFF' : '#000' }]}>
                  {currentVessel.speed} kts • {currentVessel.heading}°
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Hazards */}
          {hazards.length > 0 && (
            <TouchableOpacity style={[styles.infoCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
              <View style={styles.infoCardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: '#FFEBEE' }]}>
                  <IconSymbol name="paperplane.fill" size={20} color="#FF3B30" />
                </View>
                <View style={styles.infoCardContent}>
                  <Text style={[styles.infoCardLabel, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>
                    Hazard Warnings
                  </Text>
                  <Text style={[styles.infoCardValue, { color: isDark ? '#FFF' : '#000' }]}>
                    {hazards.length} warning{hazards.length !== 1 ? 's' : ''} detected
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerIcons: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  iconButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  sosButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sosText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  content: { flex: 1, paddingHorizontal: 20 },
  greeting: { fontSize: 32, fontWeight: '700', marginTop: 10 },
  date: { fontSize: 16, marginTop: 4, marginBottom: 20 },
  weatherCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  weatherContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  weatherLabel: { fontSize: 14, marginBottom: 4 },
  weatherMain: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  weatherSub: { fontSize: 14 },
  weatherIcon: { fontSize: 48 },
  quickActions: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  actionCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 100,
  },
  actionCardPrimary: { backgroundColor: '#007AFF' },
  actionCardSecondary: { backgroundColor: '#FFF', borderWidth: 2, borderColor: '#007AFF' },
  actionCardText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  actionCardTextAlt: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
  infoSection: { marginBottom: 30 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700' },
  viewAll: { color: '#007AFF', fontSize: 14, fontWeight: '600' },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeNumber: { fontSize: 20, fontWeight: '700', color: '#007AFF' },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCardContent: { flex: 1 },
  infoCardLabel: { fontSize: 13, marginBottom: 2 },
  infoCardValue: { fontSize: 15, fontWeight: '600' },
});
