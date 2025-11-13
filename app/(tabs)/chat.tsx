
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
import { IconSymbol } from '@/components/ui/IconSymbol';
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
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
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

    const interval = setInterval(loadNearbyContacts, 10000);
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
      {selectedContact ? (
        <View style={styles.chatView}>
          <View style={[styles.chatHeader, { backgroundColor: isDark ? colors.card : '#FFFFFF', borderBottomColor: isDark ? colors.border : 'rgba(0,0,0,0.05)' }]}>
            <TouchableOpacity onPress={() => setSelectedContact(null)} style={styles.backButton}>
              <IconSymbol name="chevron.left" size={24} color={colors.primary} />
            </TouchableOpacity>
            <View style={styles.chatHeaderInfo}>
              <View style={styles.contactAvatar}>
                <Text style={styles.avatarText}>🚢</Text>
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={[styles.chatHeaderName, { color: colors.text }]}>
                  {selectedContact.name}
                </Text>
                <Text style={[styles.chatHeaderStatus, { color: colors.secondaryText }]}>
                  {selectedContact.distance.toFixed(1)} km away
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.moreButton}>
              <IconSymbol name="ellipsis.circle" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
            {messages.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>💬</Text>
                <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                  No messages yet
                </Text>
                <Text style={[styles.emptySubtext, { color: colors.tertiaryText }]}>
                  Start a conversation!
                </Text>
              </View>
            ) : (
              messages.map((msg) => (
                <View
                  key={msg.id}
                  style={[
                    styles.messageBubble,
                    msg.senderId === currentUser?.id ? styles.myMessage : styles.theirMessage,
                  ]}
                >
                  <View style={[
                    styles.bubbleContainer,
                    {
                      backgroundColor: msg.senderId === currentUser?.id 
                        ? colors.primary 
                        : (isDark ? colors.card : '#F0F0F0'),
                    },
                  ]}>
                    <Text
                      style={[
                        styles.messageText,
                        { color: msg.senderId === currentUser?.id ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {msg.text}
                    </Text>
                    <Text
                      style={[
                        styles.messageTime,
                        { color: msg.senderId === currentUser?.id ? '#FFFFFF' : colors.secondaryText },
                      ]}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.card : '#FFFFFF', borderTopColor: isDark ? colors.border : 'rgba(0,0,0,0.05)' }]}>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? colors.background : '#F0F0F0', color: colors.text }]}
              placeholder="Message..."
              placeholderTextColor={colors.secondaryText}
              value={message}
              onChangeText={setMessage}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, { opacity: message.trim() ? 1 : 0.4 }]}
              onPress={handleSendMessage}
              disabled={!message.trim()}
            >
              <IconSymbol name="paperplane.fill" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.contactsView}>
          <View style={[styles.header, { backgroundColor: isDark ? colors.card : '#FFFFFF', borderBottomColor: isDark ? colors.border : 'rgba(0,0,0,0.05)' }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Messages</Text>
            <TouchableOpacity style={styles.composeButton}>
              <IconSymbol name="square.and.pencil" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.contactsList}>
            {contacts.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🌊</Text>
                <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                  No vessels nearby
                </Text>
                <Text style={[styles.emptySubtext, { color: colors.tertiaryText }]}>
                  Enable tracking to connect with others
                </Text>
              </View>
            ) : (
              contacts.map((contact) => (
                <TouchableOpacity
                  key={contact.id}
                  style={[styles.contactItem, { borderBottomColor: isDark ? colors.border : 'rgba(0,0,0,0.05)' }]}
                  onPress={() => setSelectedContact(contact)}
                >
                  <View style={styles.contactAvatar}>
                    <Text style={styles.avatarText}>🚢</Text>
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={[styles.contactName, { color: colors.text }]}>
                      {contact.name}
                    </Text>
                    <Text style={[styles.contactMessage, { color: colors.secondaryText }]}>
                      {contact.vessel} • {contact.distance.toFixed(1)} km away
                    </Text>
                  </View>
                  <IconSymbol name="chevron.right" size={20} color={colors.tertiaryText} />
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contactsView: {
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
  composeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactsList: {
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  contactAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF20',
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
    marginBottom: 4,
  },
  contactMessage: {
    fontSize: 14,
  },
  chatView: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  chatHeaderStatus: {
    fontSize: 13,
  },
  moreButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageBubble: {
    marginBottom: 12,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  theirMessage: {
    alignItems: 'flex-start',
  },
  bubbleContainer: {
    maxWidth: '75%',
    borderRadius: 18,
    padding: 12,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
