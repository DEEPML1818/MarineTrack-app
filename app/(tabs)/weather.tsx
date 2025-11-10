import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, RefreshControl } from 'react-native';
import { Theme } from '@/constants/Theme';
import { WeatherWidget, SectionHeader } from '@/components/ui/redesign';
import { fetchWeatherAPIData, getMockWeatherData } from '@/utils/weatherApi';

export default function WeatherScreen() {
  const [weatherData, setWeatherData] = useState(getMockWeatherData());
  const [refreshing, setRefreshing] = useState(false);

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

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.locationBadge}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>Coastal City</Text>
          </View>
          <Text style={styles.menuIcon}>⚙️</Text>
        </View>
      </View>

      <ScrollView
        style={styles.screen}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.teal} />
        }
      >
        <WeatherWidget
          temperature={weatherData.temperature}
          condition={weatherData.condition}
          windSpeed={weatherData.windSpeed}
          windDirection="N"
          humidity={65}
          location="Marine Zone"
        />

        <SectionHeader title="Port nefo" />

        <View style={styles.portCard}>
          <View style={styles.portHeader}>
            <View>
              <View style={styles.conditionRow}>
                <Text style={styles.conditionIcon}>☀️</Text>
                <Text style={styles.conditionText}>Sunny</Text>
                <Text style={styles.temperatureText}>{weatherData.temperature}°C</Text>
              </View>
              <Text style={styles.portName}>Charleston Port</Text>
              <Text style={styles.portLocation}>Norfolk Terminail</Text>
            </View>
            <Text style={styles.addIcon}>+</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.portDetails}>
            <Text style={styles.etaLabel}>ETA: 2/172 40gpm</Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Marine Conditions</Text>
          
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>🌊</Text>
              <Text style={styles.detailValue}>{weatherData.waveHeight} m</Text>
              <Text style={styles.detailLabel}>Wave Height</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>👁️</Text>
              <Text style={styles.detailValue}>{weatherData.visibility} km</Text>
              <Text style={styles.detailLabel}>Visibility</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>💨</Text>
              <Text style={styles.detailValue}>{weatherData.windSpeed} kts</Text>
              <Text style={styles.detailLabel}>Wind Speed</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Theme.colors.offWhite,
  },
  header: {
    backgroundColor: Theme.colors.navy,
    paddingTop: 50,
    paddingBottom: Theme.spacing.base,
    paddingHorizontal: Theme.spacing.base,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.radius.full,
    opacity: 0.15,
  },
  locationIcon: {
    fontSize: Theme.fonts.sizes.base,
    marginRight: Theme.spacing.xs,
  },
  locationText: {
    color: Theme.colors.white,
    fontSize: Theme.fonts.sizes.md,
    fontWeight: Theme.fonts.weights.medium,
  },
  menuIcon: {
    fontSize: Theme.fonts.sizes.lg,
  },
  portCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.xl,
    marginHorizontal: Theme.spacing.base,
    marginBottom: Theme.spacing.xl,
    ...Theme.shadows.md,
  },
  portHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  conditionIcon: {
    fontSize: Theme.fonts.sizes.lg,
  },
  conditionText: {
    fontSize: Theme.fonts.sizes.md,
    color: Theme.colors.mutedGray,
  },
  temperatureText: {
    fontSize: Theme.fonts.sizes.lg,
    fontWeight: Theme.fonts.weights.bold,
    color: Theme.colors.navy,
  },
  portName: {
    fontSize: Theme.fonts.sizes.xl,
    fontWeight: Theme.fonts.weights.bold,
    color: Theme.colors.navy,
    marginBottom: Theme.spacing.xs,
  },
  portLocation: {
    fontSize: Theme.fonts.sizes.md,
    color: Theme.colors.mutedGray,
  },
  addIcon: {
    fontSize: Theme.fonts.sizes.xxl,
    color: Theme.colors.mutedGray,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.mutedGray,
    marginVertical: Theme.spacing.base,
    opacity: 0.2,
  },
  portDetails: {
    paddingTop: Theme.spacing.sm,
  },
  etaLabel: {
    fontSize: Theme.fonts.sizes.md,
    color: Theme.colors.mutedGray,
  },
  detailsCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.xl,
    marginHorizontal: Theme.spacing.base,
    ...Theme.shadows.md,
  },
  detailsTitle: {
    fontSize: Theme.fonts.sizes.lg,
    fontWeight: Theme.fonts.weights.bold,
    color: Theme.colors.navy,
    marginBottom: Theme.spacing.base,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: Theme.fonts.sizes.xxl,
    marginBottom: Theme.spacing.sm,
  },
  detailValue: {
    fontSize: Theme.fonts.sizes.lg,
    fontWeight: Theme.fonts.weights.bold,
    color: Theme.colors.navy,
    marginBottom: Theme.spacing.xs,
  },
  detailLabel: {
    fontSize: Theme.fonts.sizes.sm,
    color: Theme.colors.mutedGray,
  },
  bottomSpacing: {
    height: 100,
  },
});
