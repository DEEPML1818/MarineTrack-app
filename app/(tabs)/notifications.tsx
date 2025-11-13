
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { getNotifications, markNotificationAsRead } from '@/utils/notificationService';
import { getCurrentUser } from '@/utils/auth';

interface Notification {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: any;
}

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        const notifs = await getNotifications(user.id);
        setNotifications(notifs);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
      setNotifications(prev =>
        prev.map(n => (n.id === notification.id ? { ...n, read: true } : n))
      );
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      weather_alert: '⚠️',
      sos_nearby: '🚨',
      vessel_nearby: '🚢',
      message: '💬',
      zone_warning: '⛔',
      safe_zone: '✅',
      like: '❤️',
      comment: '💬',
      mention: '📢',
    };
    return icons[type] || '🔔';
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffMs = now.getTime() - notifTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return new Date(timestamp).toLocaleDateString();
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? colors.card : '#FFFFFF', borderBottomColor: isDark ? colors.border : 'rgba(0,0,0,0.05)' }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <IconSymbol name="ellipsis.circle" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Filter Pills */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity
            style={[
              styles.filterPill,
              { backgroundColor: filter === 'all' ? colors.primary : (isDark ? colors.card : '#F0F0F0') }
            ]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, { color: filter === 'all' ? '#FFFFFF' : colors.text }]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterPill,
              { backgroundColor: filter === 'unread' ? colors.primary : (isDark ? colors.card : '#F0F0F0') }
            ]}
            onPress={() => setFilter('unread')}
          >
            <Text style={[styles.filterText, { color: filter === 'unread' ? '#FFFFFF' : colors.text }]}>
              Unread
            </Text>
            {notifications.filter(n => !n.read).length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {notifications.filter(n => !n.read).length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Notifications List */}
      <ScrollView
        style={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
              {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.tertiaryText }]}>
              {filter === 'unread' ? 'You have no unread notifications' : 'Stay tuned for updates'}
            </Text>
          </View>
        ) : (
          filteredNotifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationItem,
                {
                  backgroundColor: !notification.read ? (isDark ? colors.card : '#F0F7FF') : 'transparent',
                  borderBottomColor: isDark ? colors.border : 'rgba(0,0,0,0.05)',
                }
              ]}
              onPress={() => handleNotificationPress(notification)}
            >
              <View style={[styles.iconContainer, { backgroundColor: isDark ? colors.background : '#FFFFFF' }]}>
                <Text style={styles.notificationIcon}>{getNotificationIcon(notification.type)}</Text>
              </View>
              <View style={styles.notificationContent}>
                <Text style={[styles.notificationMessage, { color: colors.text }]}>
                  {notification.message}
                </Text>
                <Text style={[styles.notificationTime, { color: colors.tertiaryText }]}>
                  {getTimeAgo(notification.timestamp)}
                </Text>
              </View>
              {!notification.read && (
                <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>
          ))
        )}
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
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    paddingVertical: 12,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: '#007AFF',
    fontSize: 11,
    fontWeight: '700',
  },
  listContainer: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationIcon: {
    fontSize: 22,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
  },
});
