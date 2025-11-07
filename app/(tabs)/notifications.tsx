import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import {
  getNotificationHistory,
  markNotificationAsRead,
  clearAllNotifications,
  NotificationData,
  NotificationType,
  requestNotificationPermissions,
} from '@/utils/notificationService';

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  useEffect(() => {
    loadNotifications();
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const granted = await requestNotificationPermissions();
    setPermissionsGranted(granted);
  };

  const loadNotifications = async () => {
    const history = await getNotificationHistory();
    setNotifications(history);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: NotificationData) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
      loadNotifications();
    }
  };

  const handleClearAll = async () => {
    await clearAllNotifications();
    setNotifications([]);
  };

  const getNotificationIcon = (type: NotificationType): string => {
    switch (type) {
      case NotificationType.CHAT_MESSAGE:
        return '💬';
      case NotificationType.VESSEL_NEARBY:
        return '🚢';
      case NotificationType.BOAT_LIKED:
        return '❤️';
      case NotificationType.BOAT_COMMENTED:
        return '💭';
      case NotificationType.SOS_ALERT:
        return '🆘';
      case NotificationType.RESTRICTED_ZONE:
        return '⛔';
      case NotificationType.SAFE_ZONE:
        return '✅';
      case NotificationType.WEATHER_WARNING:
        return '⛈️';
      case NotificationType.LOW_FUEL:
        return '⛽';
      default:
        return '🔔';
    }
  };

  const getTypeColor = (type: NotificationType): string => {
    switch (type) {
      case NotificationType.SOS_ALERT:
      case NotificationType.RESTRICTED_ZONE:
        return '#ef4444';
      case NotificationType.WEATHER_WARNING:
        return '#f59e0b';
      case NotificationType.SAFE_ZONE:
      case NotificationType.BOAT_LIKED:
        return '#22c55e';
      default:
        return colors.primary;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerStats}>
          <Text style={styles.headerSubtitle}>
            {unreadCount} unread • {notifications.length} total
          </Text>
        </View>
      </View>

      {!permissionsGranted && (
        <View style={[styles.permissionBanner, { backgroundColor: '#f59e0b' }]}>
          <Text style={styles.permissionText}>
            📌 Enable notifications to receive alerts about nearby vessels, restricted zones, and more!
          </Text>
        </View>
      )}

      <View style={styles.actionBar}>
        <TouchableOpacity
          style={[styles.clearButton, { backgroundColor: colors.card }]}
          onPress={handleClearAll}
          disabled={notifications.length === 0}
        >
          <Text style={[styles.clearButtonText, { color: colors.text }]}>
            🗑️ Clear All
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No Notifications Yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.icon }]}>
              You'll see updates about messages, nearby vessels, and zone alerts here
            </Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                {
                  backgroundColor: notification.read ? colors.card : colors.primary + '15',
                  borderLeftColor: getTypeColor(notification.type),
                },
              ]}
              onPress={() => handleNotificationPress(notification)}
            >
              <View style={styles.notificationIcon}>
                <Text style={styles.iconText}>
                  {getNotificationIcon(notification.type)}
                </Text>
              </View>
              <View style={styles.notificationContent}>
                <Text style={[styles.notificationTitle, { color: colors.text }]}>
                  {notification.title}
                </Text>
                <Text
                  style={[styles.notificationMessage, { color: colors.icon }]}
                  numberOfLines={2}
                >
                  {notification.message}
                </Text>
                <Text style={[styles.notificationTime, { color: colors.icon }]}>
                  {getTimeAgo(notification.timestamp)}
                </Text>
              </View>
              {!notification.read && (
                <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
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
  headerStats: {
    marginTop: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  permissionBanner: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  permissionText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  actionBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  clearButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    padding: 16,
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
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  notificationIcon: {
    marginRight: 12,
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 28,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 12,
  },
  unreadBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    alignSelf: 'center',
  },
});
