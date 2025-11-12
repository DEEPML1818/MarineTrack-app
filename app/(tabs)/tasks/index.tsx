import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TasksScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Open', 'Progress', 'Done'];

  const tasks = [
    {
      id: 1,
      title: 'Hull Inspection',
      boat: 'Ocean Blunt',
      status: 'Progress',
      dueDate: 'Posted 2h ago',
      priority: 'High',
    },
    {
      id: 2,
      title: 'Hull Inspection',
      boat: 'Google Blunt',
      status: 'Progress',
      dueDate: 'Posted 2h ago',
      priority: 'Medium',
    },
    {
      id: 3,
      title: 'Hull Inspection',
      boat: 'Ocean Blunt',
      status: 'Open',
      dueDate: 'Posted 2h ago',
      priority: 'Low',
    },
    {
      id: 4,
      title: 'Hull Inspection',
      boat: 'Google Blunt',
      status: 'Done',
      dueDate: 'Posted 2h ago',
      priority: 'High',
    },
  ];

  const filteredTasks = activeFilter === 'All' 
    ? tasks 
    : tasks.filter(task => task.status === activeFilter);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Progress': return '#FF9500';
      case 'Open': return '#FF3B30';
      case 'Done': return '#34C759';
      default: return '#999';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
      <View style={[styles.header, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#000' }]}>
          Boat Helpers
        </Text>
        <View style={styles.filterContainer}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={[
                styles.filterButton,
                activeFilter === filter && styles.filterButtonActive,
                { backgroundColor: activeFilter === filter ? '#007AFF' : (isDark ? '#2C2C2E' : '#E5E5EA') }
              ]}
            >
              <Text style={[
                styles.filterText,
                { color: activeFilter === filter ? '#FFF' : (isDark ? '#FFF' : '#000') }
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {filteredTasks.map((task) => (
          <TouchableOpacity 
            key={task.id} 
            style={[styles.taskCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}
            onPress={() => router.push(`/(tabs)/tasks/${task.id}`)}
          >
            <View style={styles.taskHeader}>
              <Text style={[styles.taskTitle, { color: isDark ? '#FFF' : '#000' }]}>
                {task.title}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(task.status) }]}>
                  {task.status}
                </Text>
              </View>
            </View>
            <View style={styles.taskDetails}>
              <View style={styles.taskRow}>
                <Text style={[styles.taskLabel, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>
                  Boat:
                </Text>
                <Text style={[styles.taskValue, { color: isDark ? '#FFF' : '#000' }]}>
                  {task.boat}
                </Text>
              </View>
              <View style={styles.taskRow}>
                <Text style={[styles.taskLabel, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>
                  Inspector:
                </Text>
                <Text style={[styles.taskValue, { color: isDark ? '#FFF' : '#000' }]}>
                  {task.dueDate}
                </Text>
              </View>
            </View>
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
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  taskCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  taskDetails: {
    gap: 8,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskLabel: {
    fontSize: 14,
    width: 80,
  },
  taskValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});
