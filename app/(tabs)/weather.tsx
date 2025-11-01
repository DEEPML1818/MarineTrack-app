import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { fetchWeatherAPIData, getMockHourlyForecast, getMockWeatherData } from '@/utils/weatherApi';

export default function WeatherScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [weatherData, setWeatherData] = useState(getMockWeatherData());
  const [hourlyForecast, setHourlyForecast] = useState(getMockHourlyForecast());

  useEffect(() => {
    const loadWeather = async () => {
      const data = await fetchWeatherAPIData(14.5995, 120.9842);
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
    };
    loadWeather();
  }, []);

  const alerts = [
    { id: 1, type: 'warning', message: 'Strong winds expected after 2 PM - up to 25 km/h', severity: 'medium' },
    { id: 2, type: 'info', message: 'Good fishing conditions in the morning hours', severity: 'low' },
    { id: 3, type: 'warning', message: 'Wave height increasing to 1.5m in the afternoon', severity: 'medium' },
    { id: 4, type: 'info', message: 'Visibility excellent for navigation (8+ km)', severity: 'low' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Weather & Navigation</Text>
        <Text style={styles.headerSubtitle}>Marine Weather Forecast</Text>
      </View>

      <View style={[styles.currentWeather, { backgroundColor: colors.card }]}>
        <Text style={styles.currentIcon}>{weatherData.icon}</Text>
        <Text style={[styles.currentTemp, { color: colors.text }]}>{weatherData.temperature}°C</Text>
        <Text style={[styles.currentCondition, { color: colors.icon }]}>{weatherData.condition}</Text>
        <View style={styles.currentDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>💨</Text>
            <Text style={[styles.detailText, { color: colors.text }]}>{weatherData.windSpeed} km/h</Text>
            <Text style={[styles.detailLabel, { color: colors.icon }]}>Wind</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>🌊</Text>
            <Text style={[styles.detailText, { color: colors.text }]}>{weatherData.waveHeight} m</Text>
            <Text style={[styles.detailLabel, { color: colors.icon }]}>Waves</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>👁️</Text>
            <Text style={[styles.detailText, { color: colors.text }]}>{weatherData.visibility} km</Text>
            <Text style={[styles.detailLabel, { color: colors.icon }]}>Visibility</Text>
          </View>
        </View>
      </View>

      {alerts.length > 0 && (
        <View style={styles.alertsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>⚠️ Alerts</Text>
          {alerts.map((alert) => (
            <View
              key={alert.id}
              style={[
                styles.alertCard,
                {
                  backgroundColor: alert.severity === 'medium' ? colors.danger : colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.alertText,
                  { color: alert.severity === 'medium' ? '#fff' : colors.text },
                ]}
              >
                {alert.message}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.forecastSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Hourly Forecast</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hourlyScroll}>
          {hourlyForecast.map((hour, index) => (
            <View
              key={index}
              style={[styles.hourCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Text style={[styles.hourTime, { color: colors.icon }]}>{hour.time}</Text>
              <Text style={styles.hourIcon}>{hour.icon}</Text>
              <Text style={[styles.hourTemp, { color: colors.text }]}>{hour.temp}</Text>
              <Text style={[styles.hourCondition, { color: colors.icon }]}>{hour.condition}</Text>
              <Text style={[styles.hourWind, { color: colors.icon }]}>💨 {hour.wind}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={[styles.safetyTips, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.tipsTitle, { color: colors.primary }]}>🧭 Safety Tips</Text>
        <Text style={[styles.tipText, { color: colors.text }]}>
          • Check weather updates every 2 hours{'\n'}
          • Avoid sailing in winds above 25 km/h{'\n'}
          • Monitor wave heights for safe navigation{'\n'}
          • Keep emergency contacts ready
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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  currentWeather: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  currentIcon: {
    fontSize: 80,
    marginBottom: 12,
  },
  currentTemp: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  currentCondition: {
    fontSize: 18,
    marginTop: 8,
  },
  currentDetails: {
    flexDirection: 'row',
    gap: 32,
    marginTop: 24,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  alertsSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  alertCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  alertText: {
    fontSize: 14,
    lineHeight: 20,
  },
  forecastSection: {
    paddingLeft: 16,
    marginBottom: 16,
  },
  hourlyScroll: {
    marginRight: 16,
  },
  hourCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 12,
    alignItems: 'center',
    width: 100,
  },
  hourTime: {
    fontSize: 12,
    marginBottom: 8,
  },
  hourIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  hourTemp: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  hourCondition: {
    fontSize: 10,
    marginBottom: 4,
    textAlign: 'center',
  },
  hourWind: {
    fontSize: 11,
  },
  safetyTips: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 24,
  },
});
