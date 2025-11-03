import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { getNearbyTrackedVessels } from '@/utils/trackingService';
import { getCurrentUser } from '@/utils/auth';
import { sendMessage, getChatMessages, getChatRoom, subscribeToMessages } from '@/utils/realtimeChat';
import * as Location from 'expo-location';
import OpenStreetMap from '@/components/OpenStreetMap';

interface Vessel {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  distance: number;
  status: string;
}

export default function MapScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [chatId, setChatId] = useState<string>('');

  const chatUnsubscribeRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    loadCurrentUser();
    setupLocation();

    return () => {
      isMountedRef.current = false;
      if (chatUnsubscribeRef.current) {
        chatUnsubscribeRef.current();
      }
    };
  }, []);

  useEffect(() => {
    if (userLocation) {
      loadVessels();
      const interval = setInterval(loadVessels, 5000);
      return () => clearInterval(interval);
    }
  }, [userLocation]);

  useEffect(() => {
    if (!selectedVessel || !currentUser) return;

    let isActive = true;

    const setupChat = async () => {
      const roomId = await getChatRoom(currentUser.id, selectedVessel.id);
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

      chatUnsubscribeRef.current = () => subscription.unsubscribe();
    };

    setupChat();

    return () => {
      isActive = false;
      if (chatUnsubscribeRef.current) {
        chatUnsubscribeRef.current();
        chatUnsubscribeRef.current = null;
      }
    };
  }, [selectedVessel, currentUser]);

  const loadCurrentUser = async () => {
    const user = await getCurrentUser();
    if (isMountedRef.current) {
      setCurrentUser(user);
    }
  };

  const setupLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (isMountedRef.current) {
        setUserLocation({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });
      }

      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 50,
        },
        (location) => {
          if (isMountedRef.current) {
            setUserLocation({
              lat: location.coords.latitude,
              lng: location.coords.longitude,
            });
          }
        }
      );
    } catch (error) {
      console.error('Error setting up location:', error);
    }
  };

  const loadVessels = async () => {
    if (!userLocation) return;

    try {
      const trackedVessels = await getNearbyTrackedVessels(userLocation.lat, userLocation.lng, 50);
      
      if (!isMountedRef.current) return;

      const vesselsWithDistance = trackedVessels.map(v => ({
        id: v.userId,
        name: v.vesselInfo.vesselName,
        type: v.vesselInfo.vesselType,
        latitude: v.location.latitude,
        longitude: v.location.longitude,
        speed: v.location.speed || 0,
        heading: v.location.heading || 0,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          v.location.latitude,
          v.location.longitude
        ),
        status: v.status,
      }));

      setVessels(vesselsWithDistance);
    } catch (error) {
      console.error('Error loading vessels:', error);
      setVessels([]);
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

  const handleVesselPress = (vessel: Vessel) => {
    setSelectedVessel(vessel);
    setShowChatModal(true);
  };

  const closeChat = () => {
    setShowChatModal(false);
    setSelectedVessel(null);
    setMessages([]);
    if (chatUnsubscribeRef.current) {
      chatUnsubscribeRef.current();
      chatUnsubscribeRef.current = null;
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !currentUser || !chatId) return;

    const newMessage = await sendMessage(
      chatId,
      currentUser.id,
      currentUser.name,
      message.trim()
    );

    if (isMountedRef.current) {
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Live Vessel Map</Text>
        <Text style={styles.headerSubtitle}>Tap vessels to communicate • {vessels.length} vessels online</Text>
      </View>

      <View style={styles.mapContainer}>
        <OpenStreetMap
          userLocation={userLocation}
          vessels={vessels.map(v => ({
            id: v.id,
            name: v.name,
            latitude: v.latitude,
            longitude: v.longitude
          }))}
          height={500}
        />

        {/* Legend */}
        <View style={[styles.legend, { backgroundColor: colors.card }]}>
          <Text style={[styles.legendTitle, { color: colors.text }]}>
            Active Vessels: {vessels.length + 1}
          </Text>
          <Text style={[styles.legendItem, { color: colors.icon }]}>
            📍 You • 🚢 Others (Tap to chat)
          </Text>
        </View>
      </View>

      {/* Vessels List */}
      <ScrollView style={styles.vesselsList}>
        {vessels.map((vessel) => (
          <TouchableOpacity
            key={vessel.id}
            style={[styles.vesselCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => handleVesselPress(vessel)}
          >
            <Text style={styles.vesselIcon}>🚢</Text>
            <View style={styles.vesselInfo}>
              <Text style={[styles.vesselName, { color: colors.text }]}>{vessel.name}</Text>
              <Text style={[styles.vesselDetails, { color: colors.icon }]}>
                {vessel.type} • {vessel.distance.toFixed(1)} km • {vessel.speed.toFixed(1)} kn
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Chat Modal */}
      <Modal
        visible={showChatModal}
        animationType="slide"
        onRequestClose={closeChat}
      >
        <KeyboardAvoidingView 
          style={[styles.modalContainer, { backgroundColor: colors.background }]}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.chatHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={closeChat}>
              <Text style={[styles.backButton, { color: colors.primary }]}>← Back to Map</Text>
            </TouchableOpacity>
            {selectedVessel && (
              <View style={styles.chatHeaderInfo}>
                <Text style={[styles.chatHeaderName, { color: colors.text }]}>
                  🚢 {selectedVessel.name}
                </Text>
                <Text style={[styles.chatHeaderStatus, { color: colors.icon }]}>
                  {selectedVessel.type} • {selectedVessel.distance.toFixed(1)} km away
                </Text>
              </View>
            )}
          </View>

          <ScrollView style={styles.messagesContainer}>
            {messages.length === 0 ? (
              <View style={styles.emptyChat}>
                <Text style={[styles.emptyChatText, { color: colors.icon }]}>
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
        </KeyboardAvoidingView>
      </Modal>
    </View>
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
  mapContainer: {
    height: 500,
    position: 'relative',
  },
  legend: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  legendItem: {
    fontSize: 12,
  },
  vesselsList: {
    flex: 1,
    padding: 16,
  },
  vesselCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: 'center',
  },
  vesselIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  vesselInfo: {
    flex: 1,
  },
  vesselName: {
    fontSize: 16,
    fontWeight: '600',
  },
  vesselDetails: {
    fontSize: 12,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
  },
  chatHeader: {
    padding: 16,
    borderBottomWidth: 1,
    paddingTop: 50,
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
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyChatText: {
    fontSize: 16,
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
