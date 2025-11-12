
import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Image } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { router } from 'expo-router';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const quickActions = [
    { id: '1', icon: 'map.fill', label: 'Navigation', color: '#007AFF', route: '/navigation' },
    { id: '2', icon: 'sailboat.fill', label: 'My Boats', color: '#34C759', route: '/boats' },
    { id: '3', icon: 'cloud.sun.fill', label: 'Weather', color: '#FF9500', route: null },
    { id: '4', icon: 'exclamationmark.triangle.fill', label: 'Hazards', color: '#FF3B30', route: null },
  ];

  const weatherImages = [
    require('@/assets/images/partial-react-logo.png'),
    require('@/assets/images/partial-react-logo.png'),
    require('@/assets/images/partial-react-logo.png'),
  ];

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
        <Text style={styles.appName}>Boat Helper</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIcon}>
            <IconSymbol name="bell.fill" size={24} color={isDark ? '#FFF' : '#000'} />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>12</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon} onPress={() => router.push('/chat')}>
            <IconSymbol name="message.fill" size={24} color={isDark ? '#FFF' : '#000'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/profile')}>
            <IconSymbol name="person.fill" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeTitle, { color: isDark ? '#FFF' : '#000' }]}>
            Welcome back, Andrison
          </Text>
          <Text style={[styles.welcomeDate, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </Text>
        </View>

        {/* Image Carousel */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.carouselContainer}
        >
          {weatherImages.map((img, index) => (
            <View key={index} style={styles.carouselCard}>
              <Image source={img} style={styles.carouselImage} />
            </View>
          ))}
        </ScrollView>

        {/* Weather Card */}
        <View style={[styles.weatherCard, { backgroundColor: isDark ? '#1C1C1E' : '#E8F4FF' }]}>
          <View>
            <Text style={[styles.weatherLabel, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>
              Today's Weather
            </Text>
            <Text style={[styles.weatherValue, { color: isDark ? '#FFF' : '#000' }]}>
              Sunny, 44°F
            </Text>
            <Text style={[styles.weatherSubtext, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>
              Perfect for Boating !
            </Text>
          </View>
          <Text style={styles.weatherIcon}>☀️</Text>
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>
          What would you like to do today ?
        </Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity 
              key={action.id}
              style={[styles.quickActionCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}
              onPress={() => action.route && router.push(action.route)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}20` }]}>
                <IconSymbol name={action.icon} size={28} color={action.color} />
              </View>
              <Text style={[styles.quickActionLabel, { color: isDark ? '#FFF' : '#000' }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Active Tasks Preview */}
        <View style={styles.tasksPreview}>
          <View style={styles.tasksHeader}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#000', marginBottom: 0 }]}>
              Active Tasks
            </Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={[styles.tasksSummaryCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
            <View style={styles.tasksCountBadge}>
              <Text style={styles.tasksCountText}>3</Text>
            </View>
            <View style={styles.tasksSummaryContent}>
              <Text style={[styles.tasksSummaryLabel, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>
                You have tasks waiting for service
              </Text>
              <Text style={[styles.tasksSummaryValue, { color: isDark ? '#FFF' : '#000' }]}>
                3 Tasks in progress
              </Text>
            </View>
          </View>

          <View style={[styles.taskPreviewCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
            <View style={styles.taskPreviewHeader}>
              <Text style={[styles.taskPreviewTitle, { color: isDark ? '#FFF' : '#000' }]}>
                Engine Maintenance
              </Text>
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>Pending</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontFamily: 'serif',
    fontStyle: 'italic',
    fontWeight: '400',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIcon: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  welcomeDate: {
    fontSize: 16,
  },
  carouselContainer: {
    paddingLeft: 20,
    marginBottom: 20,
  },
  carouselCard: {
    width: 120,
    height: 100,
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
    backgroundColor: '#E8F4FF',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  weatherCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  weatherLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  weatherValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  weatherSubtext: {
    fontSize: 14,
  },
  weatherIcon: {
    fontSize: 48,
  },
  sectionTitle: {
    fontSize: 18,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 32,
  },
  quickActionCard: {
    width: '48%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  tasksPreview: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tasksSummaryCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tasksCountBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  tasksCountText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  tasksSummaryContent: {
    flex: 1,
    justifyContent: 'center',
  },
  tasksSummaryLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  tasksSummaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  taskPreviewCard: {
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  taskPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskPreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  pendingBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadgeText: {
    color: '#FF9500',
    fontSize: 12,
    fontWeight: '600',
  },
});
