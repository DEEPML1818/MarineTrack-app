
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import * as Location from 'expo-location';
import { fetchWeatherAPIData, getMockWeatherData } from '@/utils/weatherApi';

export default function WeatherScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const [weatherData, setWeatherData] = useState(getMockWeatherData());
  const [locationName, setLocationName] = useState('Loading...');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadWeather();
  }, []);

  const loadWeather = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const lat = location.coords.latitude;
      const lng = location.coords.longitude;

      try {
        const geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (geocode && geocode.length > 0) {
          const place = geocode[0];
          setLocationName(place.city || place.region || place.country || 'Current Location');
        }
      } catch (geoError) {
        setLocationName('Current Location');
      }

      const data = await fetchWeatherAPIData(lat, lng);
      if (data && data.current) {
        setWeatherData({
          temperature: Math.round(data.current.temp_c),
          windSpeed: Math.round(data.current.wind_kph),
          waveHeight: 1.2,
          visibility: Math.round(data.current.vis_km),
          condition: data.current.condition.text,
          icon: '⛅'
        });
      }
    } catch (error) {
      console.error('Error loading weather:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWeather();
    setRefreshing(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: isDark ? colors.card : '#FFFFFF' }]}>
          <View style={styles.headerContent}>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Weather</Text>
              <View style={styles.locationRow}>
                <IconSymbol name="location.fill" size={14} color={colors.primary} />
                <Text style={[styles.locationText, { color: colors.secondaryText }]}>{locationName}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.settingsButton}>
              <IconSymbol name="ellipsis.circle" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Weather Card */}
        <View style={[styles.heroCard, { backgroundColor: isDark ? colors.card : '#FFFFFF' }]}>
          <View style={styles.heroContent}>
            <Text style={styles.weatherIcon}>{weatherData.icon}</Text>
            <Text style={[styles.temperature, { color: colors.text }]}>{weatherData.temperature}°</Text>
            <Text style={[styles.condition, { color: colors.secondaryText }]}>{weatherData.condition}</Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <IconSymbol name="wind" size={20} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.text }]}>{weatherData.windSpeed}</Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>kts</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <IconSymbol name="eye" size={20} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.text }]}>{weatherData.visibility}</Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>km</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.waveIcon}>🌊</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{weatherData.waveHeight}</Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>m</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Featured Port */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Port</Text>
          
          <TouchableOpacity style={[styles.portCard, { backgroundColor: isDark ? colors.card : '#FFFFFF' }]}>
            <View style={styles.portHeader}>
              <View style={styles.portIcon}>
                <Text style={styles.portIconText}>⚓</Text>
              </View>
              <View style={styles.portInfo}>
                <Text style={[styles.portName, { color: colors.text }]}>Charleston Port</Text>
                <Text style={[styles.portLocation, { color: colors.secondaryText }]}>Norfolk Terminal</Text>
                <Text style={[styles.portETA, { color: colors.primary }]}>ETA: 2/17 4:00pm</Text>
              </View>
              <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]}>
                <IconSymbol name="plus" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>

        {/* Marine Conditions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Marine Conditions</Text>
          
          <View style={styles.conditionsGrid}>
            <View style={[styles.conditionCard, { backgroundColor: isDark ? colors.card : '#FFFFFF' }]}>
              <View style={[styles.conditionIcon, { backgroundColor: '#34C75920' }]}>
                <Text style={styles.conditionEmoji}>🌊</Text>
              </View>
              <Text style={[styles.conditionValue, { color: colors.text }]}>{weatherData.waveHeight}m</Text>
              <Text style={[styles.conditionLabel, { color: colors.secondaryText }]}>Wave Height</Text>
            </View>

            <View style={[styles.conditionCard, { backgroundColor: isDark ? colors.card : '#FFFFFF' }]}>
              <View style={[styles.conditionIcon, { backgroundColor: '#007AFF20' }]}>
                <Text style={styles.conditionEmoji}>👁️</Text>
              </View>
              <Text style={[styles.conditionValue, { color: colors.text }]}>{weatherData.visibility}km</Text>
              <Text style={[styles.conditionLabel, { color: colors.secondaryText }]}>Visibility</Text>
            </View>

            <View style={[styles.conditionCard, { backgroundColor: isDark ? colors.card : '#FFFFFF' }]}>
              <View style={[styles.conditionIcon, { backgroundColor: '#FF950020' }]}>
                <Text style={styles.conditionEmoji}>💨</Text>
              </View>
              <Text style={[styles.conditionValue, { color: colors.text }]}>{weatherData.windSpeed}kts</Text>
              <Text style={[styles.conditionLabel, { color: colors.secondaryText }]}>Wind Speed</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCard: {
    margin: 16,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  heroContent: {
    alignItems: 'center',
  },
  weatherIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  temperature: {
    fontSize: 64,
    fontWeight: '200',
    marginBottom: 8,
  },
  condition: {
    fontSize: 18,
    marginBottom: 32,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 12,
  },
  waveIcon: {
    fontSize: 20,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  portCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  portHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  portIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  portIconText: {
    fontSize: 28,
  },
  portInfo: {
    flex: 1,
  },
  portName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  portLocation: {
    fontSize: 14,
    marginBottom: 4,
  },
  portETA: {
    fontSize: 13,
    fontWeight: '500',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conditionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  conditionCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  conditionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  conditionEmoji: {
    fontSize: 24,
  },
  conditionValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  conditionLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
});
