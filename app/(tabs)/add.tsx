import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { router } from 'expo-router';

export default function AddScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const options = [
    {
      id: 1,
      title: 'Add Boat',
      description: 'Register a new boat to your collection',
      icon: 'sailboat.fill',
      color: '#007AFF',
      action: () => Alert.alert('Add Boat', 'Boat registration form would open here'),
    },
    {
      id: 2,
      title: 'Post Task',
      description: 'Create a new maintenance task',
      icon: 'doc.text.fill',
      color: '#34C759',
      action: () => Alert.alert('Post Task', 'Task creation form would open here'),
    },
    {
      id: 3,
      title: 'Schedule Service',
      description: 'Book a professional service',
      icon: 'calendar',
      color: '#FF9500',
      action: () => Alert.alert('Schedule Service', 'Service booking form would open here'),
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
      <View style={[styles.header, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#000' }]}>
          Quick Actions
        </Text>
        <Text style={[styles.headerSubtitle, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>
          What would you like to do?
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[styles.optionCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}
            onPress={option.action}
          >
            <View style={[styles.iconContainer, { backgroundColor: option.color + '20' }]}>
              <IconSymbol name={option.icon as any} size={32} color={option.color} />
            </View>
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, { color: isDark ? '#FFF' : '#000' }]}>
                {option.title}
              </Text>
              <Text style={[styles.optionDescription, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>
                {option.description}
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={isDark ? '#8E8E93' : '#C7C7CC'} />
          </TouchableOpacity>
        ))}
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
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
  },
});
