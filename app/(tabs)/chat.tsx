import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { getNearbyTrackedVessels } from '@/utils/trackingService';
import { getCurrentUser } from '@/utils/auth';
import { sendMessage, getChatMessages, getChatRoom, subscribeToMessages } from '@/utils/realtimeChat';
import * as Location from 'expo-location';

interface Contact {
  id: string;
  name: string;
  vessel: string;
  distance: number;
  lastMessage?: string;
  unread?: number;
}

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [message, setMessage] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [chatId, setChatId] = useState<string>('');

  const chatUnsubscribeRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    loadCurrentUser();
    loadNearbyContacts();

    const interval = setInterval(loadNearbyContacts, 10000); // Refresh every 10s
    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    const setupChatAsync = async () => {
      if (!selectedContact || !currentUser) return;

      const roomId = await getChatRoom(currentUser.id, selectedContact.id);
      if (!isActive) return;

      setChatId(roomId);

      const chatMessages = await getChatMessages(roomId);
      if (!isActive) return;

      setMessages(chatMessages);

      const subscription = subscribeToMessages(roomId, (newMessage) => {
        if (isActive && newMessage.senderId !== currentUser.id) {
          setMessages(prev => [...prev, newMessage]);
        }
      });

      const unsubscribe = () => subscription?.unsubscribe();

      if (isActive) {
        chatUnsubscribeRef.current = unsubscribe;
      } else {
        unsubscribe();
      }
    };

    setupChatAsync();

    return () => {
      isActive = false;
      if (chatUnsubscribeRef.current) {
        chatUnsubscribeRef.current();
        chatUnsubscribeRef.current = null;
      }
    };
  }, [selectedContact, currentUser]);

  const loadCurrentUser = async () => {
    const user = await getCurrentUser();
    if (isMountedRef.current) {
      setCurrentUser(user);
    }
  };

  const loadNearbyContacts = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    const location = await Location.getCurrentPositionAsync({});

    if (!isMountedRef.current) return;

    try {
      const vessels = await getNearbyTrackedVessels(location.coords.latitude, location.coords.longitude, 100);

      if (!isMountedRef.current) return;

      const contactList: Contact[] = vessels.map(v => ({
        id: v.userId,
        name: v.vesselInfo.vesselName,
        vessel: v.vesselInfo.vesselType,
        distance: calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          v.location.latitude,
          v.location.longitude
        ),
      }));

      setContacts(contactList);
    } catch (error) {
      // Silently fail - no console errors
      setContacts([]);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const setupChat = async () => {
    if (!selectedContact || !currentUser) return;

    const roomId = await getChatRoom(currentUser.id, selectedContact.id);
    setChatId(roomId);

    const chatMessages = await getChatMessages(roomId);
    setMessages(chatMessages);

    // Subscribe to new messages
    const subscription = subscribeToMessages(roomId, (newMessage) => {
      if (newMessage.senderId !== currentUser.id) {
        setMessages(prev => [...prev, newMessage]);
      }
    });

    return () => subscription?.unsubscribe();
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !currentUser || !chatId) return;

    const newMessage = await sendMessage(
      chatId,
      currentUser.id,
      currentUser.name,
      message.trim()
    );

    if (!isMountedRef.current) return;

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Communication</Text>
        <Text style={styles.headerSubtitle}>Connect with nearby vessels (50km radius)</Text>
      </View>

      {selectedContact ? (
        <View style={styles.chatView}>
          <View style={[styles.chatHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setSelectedContact(null)}>
              <Text style={[styles.backButton, { color: colors.primary }]}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.chatHeaderInfo}>
              <Text style={[styles.chatHeaderName, { color: colors.text }]}>
                🚢 {selectedContact.name}
              </Text>
              <Text style={[styles.chatHeaderStatus, { color: colors.icon }]}>
                {selectedContact.distance.toFixed(1)} km away • {selectedContact.vessel}
              </Text>
            </View>
          </View>

          <ScrollView style={styles.messagesContainer}>
            {messages.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: colors.icon }]}>
                  No messages yet. Start a conversation!
                </Text>
              </View>
            ) : (
              messages.map((msg) => (
                <View
                  key={msg.id}
                  style={[
                    styles.messageBubble,
                    {
                      backgroundColor: msg.senderId === currentUser?.id ? colors.primary : colors.card,
                      alignSelf: msg.senderId === currentUser?.id ? 'flex-end' : 'flex-start',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.messageSender,
                      { color: msg.senderId === currentUser?.id ? '#fff' : colors.icon },
                    ]}
                  >
                    {msg.senderName}
                  </Text>
                  <Text
                    style={[
                      styles.messageText,
                      { color: msg.senderId === currentUser?.id ? '#fff' : colors.text },
                    ]}
                  >
                    {msg.text}
                  </Text>
                  <Text
                    style={[
                      styles.messageTime,
                      { color: msg.senderId === currentUser?.id ? '#fff' : colors.icon },
                    ]}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>

          <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              placeholder="Type a message..."
              placeholderTextColor={colors.icon}
              value={message}
              onChangeText={setMessage}
            />
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: colors.primary }]}
              onPress={handleSendMessage}
            >
              <Text style={styles.sendButtonText}>📤</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView style={styles.contactsList}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Nearby Vessels ({contacts.length})
          </Text>
          {contacts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.icon }]}>
                No vessels within 50km radius
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.icon }]}>
                Enable tracking to be visible to others
              </Text>
            </View>
          ) : (
            contacts.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setSelectedContact(contact)}
              >
                <View style={styles.contactAvatar}>
                  <Text style={styles.avatarText}>🚢</Text>
                </View>
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactName, { color: colors.text }]}>
                    {contact.name}
                  </Text>
                  <Text style={[styles.vesselName, { color: colors.icon }]}>
                    {contact.vessel}
                  </Text>
                  <Text style={[styles.location, { color: colors.primary }]}>
                    📍 {contact.distance.toFixed(1)} km away
                  </Text>
                </View>
                <View style={styles.chatBadge}>
                  <Text style={styles.chatIcon}>💬</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </KeyboardAvoidingView>
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
  contactsList: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
  },
  contactCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: 'center',
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 28,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
  },
  vesselName: {
    fontSize: 12,
    marginTop: 2,
  },
  location: {
    fontSize: 12,
    marginTop: 6,
  },
  chatBadge: {
    padding: 8,
  },
  chatIcon: {
    fontSize: 24,
  },
  chatView: {
    flex: 1,
  },
  chatHeader: {
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  chatHeaderInfo: {
    alignItems: 'center',
  },
  chatHeaderName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatHeaderStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  messageSender: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    opacity: 0.8,
  },
  messageText: {
    fontSize: 15,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 20,
  },
});