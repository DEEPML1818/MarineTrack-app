import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const task = {
    id: id,
    title: 'Hull Inspection',
    boat: 'Ocean Blunt',
    status: 'Progress',
    category: 'Maintenance',
    description: 'Need to inspect the hull for any damage or wear. This is a routine inspection that should be done every 6 months to ensure the boat is in good condition.',
    dueDate: 'June 25, 2024',
    images: [
      'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&h=600&fit=crop',
    ],
    offers: [
      { id: 1, name: 'Michael Thompson', amount: '$500', rating: 4.8 },
      { id: 2, name: 'Sarah Johnson', amount: '$450', rating: 4.9 },
    ],
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
      <View style={[styles.header, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
        <Text style={[styles.title, { color: isDark ? '#FFF' : '#000' }]}>
          {task.title}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: '#FF9500' + '20' }]}>
          <Text style={[styles.statusText, { color: '#FF9500' }]}>
            {task.status}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>
          BOAT
        </Text>
        <View style={[styles.card, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
          <Image 
            source={{ uri: task.images[0] }} 
            style={styles.boatImage}
          />
          <Text style={[styles.boatName, { color: isDark ? '#FFF' : '#000' }]}>
            {task.boat}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>
          DESCRIPTION
        </Text>
        <View style={[styles.card, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
          <Text style={[styles.description, { color: isDark ? '#FFF' : '#000' }]}>
            {task.description}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>
          CATEGORY
        </Text>
        <View style={[styles.card, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
          <View style={styles.categoryRow}>
            <IconSymbol name="tag.fill" size={20} color="#007AFF" />
            <Text style={[styles.categoryText, { color: isDark ? '#FFF' : '#000' }]}>
              {task.category}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>
          DUE DATE
        </Text>
        <View style={[styles.card, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
          <View style={styles.categoryRow}>
            <IconSymbol name="calendar" size={20} color="#007AFF" />
            <Text style={[styles.categoryText, { color: isDark ? '#FFF' : '#000' }]}>
              {task.dueDate}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>
          OFFERS ({task.offers.length})
        </Text>
        {task.offers.map((offer) => (
          <View key={offer.id} style={[styles.offerCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
            <View style={styles.offerHeader}>
              <View style={styles.offerAvatar}>
                <IconSymbol name="person.fill" size={24} color="#007AFF" />
              </View>
              <View style={styles.offerInfo}>
                <Text style={[styles.offerName, { color: isDark ? '#FFF' : '#000' }]}>
                  {offer.name}
                </Text>
                <View style={styles.ratingRow}>
                  <IconSymbol name="star.fill" size={14} color="#FF9500" />
                  <Text style={[styles.rating, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>
                    {offer.rating}
                  </Text>
                </View>
              </View>
              <Text style={[styles.offerAmount, { color: '#34C759' }]}>
                {offer.amount}
              </Text>
            </View>
          </View>
        ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    padding: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 2,
  },
  boatImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  boatName: {
    fontSize: 18,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '500',
  },
  offerCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 2,
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  offerInfo: {
    flex: 1,
  },
  offerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
  },
  offerAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
