
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Conditional import - only load notifications when needed
let Notifications: any = null;

// Check if notifications are available
const isNotificationsAvailable = () => {
  try {
    if (!Notifications) {
      Notifications = require('expo-notifications');
    }
    return true;
  } catch (error) {
    console.log('Notifications not available in this environment');
    return false;
  }
};

export enum NotificationType {
  CHAT_MESSAGE = 'chat_message',
  VESSEL_NEARBY = 'vessel_nearby',
  BOAT_LIKED = 'boat_liked',
  BOAT_COMMENTED = 'boat_commented',
  SOS_ALERT = 'sos_alert',
  RESTRICTED_ZONE = 'restricted_zone',
  SAFE_ZONE = 'safe_zone',
  WEATHER_WARNING = 'weather_warning',
  LOW_FUEL = 'low_fuel',
}

export interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  timestamp: number;
  read: boolean;
}

// Configure notification handler only if available
const configureNotificationHandler = () => {
  if (isNotificationsAvailable() && Notifications) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }
};

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.log('Notifications only work on physical devices');
    return false;
  }

  if (!isNotificationsAvailable()) {
    return false;
  }

  configureNotificationHandler();

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push notification permissions');
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0ea5e9',
    });
  }

  return true;
}

export async function getPushToken(): Promise<string | null> {
  if (!isNotificationsAvailable()) {
    return null;
  }

  try {
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Push token:', token);
    return token;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

export async function scheduleLocalNotification(
  type: NotificationType,
  title: string,
  body: string,
  data?: any
): Promise<string> {
  if (!isNotificationsAvailable()) {
    const mockId = `mock-${Date.now()}`;
    await saveNotificationToHistory({
      id: mockId,
      type,
      title,
      message: body,
      data,
      timestamp: Date.now(),
      read: false,
    });
    return mockId;
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { type, ...data },
      sound: true,
    },
    trigger: null,
  });

  await saveNotificationToHistory({
    id: notificationId,
    type,
    title,
    message: body,
    data,
    timestamp: Date.now(),
    read: false,
  });

  return notificationId;
}

export async function sendNotification(
  type: NotificationType,
  title: string,
  message: string,
  data?: any
): Promise<void> {
  try {
    await scheduleLocalNotification(type, title, message, data);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

export async function saveNotificationToHistory(notification: NotificationData): Promise<void> {
  try {
    const historyJson = await AsyncStorage.getItem('notification_history');
    const history: NotificationData[] = historyJson ? JSON.parse(historyJson) : [];
    history.unshift(notification);

    const maxHistory = 100;
    if (history.length > maxHistory) {
      history.splice(maxHistory);
    }

    await AsyncStorage.setItem('notification_history', JSON.stringify(history));
  } catch (error) {
    console.error('Error saving notification to history:', error);
  }
}

export async function getNotificationHistory(): Promise<NotificationData[]> {
  try {
    const historyJson = await AsyncStorage.getItem('notification_history');
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error('Error getting notification history:', error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const historyJson = await AsyncStorage.getItem('notification_history');
    const history: NotificationData[] = historyJson ? JSON.parse(historyJson) : [];

    const notification = history.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      await AsyncStorage.setItem('notification_history', JSON.stringify(history));
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const history = await getNotificationHistory();
    return history.filter(n => !n.read).length;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
}

export async function clearAllNotifications(): Promise<void> {
  if (isNotificationsAvailable()) {
    await Notifications.dismissAllNotificationsAsync();
  }
  await AsyncStorage.removeItem('notification_history');
}

export async function cancelNotification(notificationId: string): Promise<void> {
  if (isNotificationsAvailable()) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }
}

export function subscribeToNotificationReceived(
  callback: (notification: any) => void
): any {
  if (!isNotificationsAvailable()) {
    return { remove: () => {} };
  }
  return Notifications.addNotificationReceivedListener(callback);
}

export function subscribeToNotificationResponse(
  callback: (response: any) => void
): any {
  if (!isNotificationsAvailable()) {
    return { remove: () => {} };
  }
  return Notifications.addNotificationResponseReceivedListener(callback);
}
