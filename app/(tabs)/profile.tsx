import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const stats = [
    { label: 'Tasks\nCompleted', value: '156', color: '#34C759' },
    { label: 'Service\nExpenses', value: '5 yrs', color: '#007AFF' },
    { label: 'Expenses', value: '$12.5k', color: '#FF9500' },
  ];

  const menuItems = [
    { icon: 'house.fill', title: 'Hull Maintenance', color: '#FF3B30', badge: '' },
    { icon: 'house.fill', title: 'Engine Fluids', color: '#007AFF', badge: '' },
    { icon: 'house.fill', title: 'Electrical Systems', color: '#34C759', badge: '' },
    { icon: 'house.fill', title: 'Aesthetics', color: '#FF9500', badge: '' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
      <View style={[styles.header, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={isDark ? '#FFF' : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#000' }]}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <Image 
            source={require('@/assets/images/partial-react-logo.png')}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: isDark ? '#FFF' : '#000' }]}>Andrison Holland</Text>
            <Text style={[styles.profileRole, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>Explorer of the Waves</Text>
            <TouchableOpacity style={styles.contactButton}>
              <Text style={styles.contactButtonText}>Contact</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.categoriesRow}>
          <TouchableOpacity style={[styles.categoryButton, { backgroundColor: isDark ? '#1C1C1E' : '#E8F4FF' }]}>
            <Text style={[styles.categoryText, { color: '#007AFF' }]}>Hull Maintenance</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.categoryButton, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
            <Text style={[styles.categoryText, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>Engine Fluids</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.categoryButton, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
            <Text style={[styles.categoryText, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>Aesthetics</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          {stats.map((stat, index) => (
            <View key={index} style={[styles.statCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#000' }]}>About</Text>
        <Text style={[styles.aboutText, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>
          A passionate boat enthusiast with a love for the open sea. I enjoy maintaining my vessels and exploring new waterways. With years of experience in boat maintenance and navigation, I'm always ready for the next adventure on the water.
        </Text>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    marginBottom: 16,
  },
  contactButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 20,
  },
  contactButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
});