import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Dimensions,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { getNearbyTrackedVessels } from '@/utils/trackingService';
import { getCurrentUser } from '@/utils/auth';
import { sendMessage, getChatMessages, getChatRoom, subscribeToMessages } from '@/utils/realtimeChat';
import * as Location from 'expo-location';

let MapView: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = null;

const { width, height } = Dimensions.get('window');

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
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [chatId, setChatId] = useState<string>('');
  const [region, setRegion] = useState({
    latitude: 3.1390,
    longitude: 101.6869,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  });

  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const chatUnsubscribeRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    loadCurrentUser();

    // Dynamically load react-native-maps only on native platforms
    if (Platform.OS !== 'web') {
      import('react-native-maps').then((MapModule) => {
        MapView = MapModule.default;
        Marker = MapModule.Marker;
        PROVIDER_GOOGLE = MapModule.PROVIDER_GOOGLE;
        console.log('react-native-maps loaded successfully');
      }).catch((error) => {
        console.error('Failed to load react-native-maps:', error);
        console.log('Map will use fallback list view');
      });
    } else {
      console.log('Running on web - using fallback map view');
    }

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    const setupLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Location permission denied');
          return;
        }
        
        if (!isActive) return;

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        if (!isActive) return;

        const newLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        
        setUserLocation(newLocation);
        setRegion({
          ...newLocation,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        });

        console.log('Map centered at:', newLocation.latitude.toFixed(4), newLocation.longitude.toFixed(4));

        const subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 10000,
            distanceInterval: 50,
          },
          (location) => {
            if (isActive) {
              setUserLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              });
            }
          }
        );

        if (isActive) {
          locationSubscriptionRef.current = subscription;
        } else {
          subscription.remove();
        }
      } catch (error) {
        console.log('Error getting location');
      }
    };

    setupLocation();

    return () => {
      isActive = false;
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
        locationSubscriptionRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!userLocation) return;

    loadVessels();
    const interval = setInterval(() => {
      loadVessels();
    }, 5000);

    return () => clearInterval(interval);
  }, [userLocation]);

  useEffect(() => {
    let isActive = true;

    const setupChatAsync = async () => {
      if (!selectedVessel || !currentUser || !showChatModal) return;

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
  }, [selectedVessel, currentUser, showChatModal]);

  const loadCurrentUser = async () => {
    const user = await getCurrentUser();
    if (isMountedRef.current) {
      setCurrentUser(user);
    }
  };

  const loadVessels = async () => {
    if (!userLocation) return;

    try {
      // Get nearby tracked vessels from the tracking service (which now uses database)
      const trackedVessels = await getNearbyTrackedVessels(
        userLocation.latitude,
        userLocation.longitude,
        100 // 100km radius for better detection
      );

      if (!isMountedRef.current) return;

      // Convert tracked vessels to the format expected by the map
      const formattedVessels = trackedVessels.map((vessel, index) => ({
        id: vessel.id || `vessel-${index}`,
        name: vessel.vesselInfo?.vesselName || 'Unknown Vessel',
        type: vessel.vesselInfo?.vesselType || 'Vessel',
        latitude: vessel.location.latitude,
        longitude: vessel.location.longitude,
        speed: vessel.location.speed || 0,
        heading: vessel.location.heading || 0,
        status: vessel.status || 'Active',
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          vessel.location.latitude,
          vessel.location.longitude
        ),
      }));

      setVessels(formattedVessels);
      if (formattedVessels.length > 0) {
        console.log(`Map displaying ${formattedVessels.length} active vessels`);
      }
    } catch (error) {
      // Silently fail - no console errors
      if (isMountedRef.current) {
        setVessels([]);
      }
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

  const setupChat = async () => {
    if (!selectedVessel || !currentUser) return;

    const roomId = await getChatRoom(currentUser.id, selectedVessel.id);
    setChatId(roomId);

    const chatMessages = await getChatMessages(roomId);
    setMessages(chatMessages);

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

  const closeChat = () => {
    setShowChatModal(false);
    setSelectedVessel(null);
    setMessages([]);
  };

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <Text style={styles.headerTitle}>Live Vessel Map</Text>
          <Text style={styles.headerSubtitle}>Real-time tracking of all vessels</Text>
        </View>
        <View style={[styles.webMapPlaceholder, { backgroundColor: colors.card }]}>
          <Text style={[styles.webMapText, { color: colors.text }]}>
            🗺️ Real-Time Vessel Map
          </Text>
          <Text style={[styles.webMapSubtext, { color: colors.icon }]}>
            Interactive map with live vessel tracking and communication is available on mobile devices.
          </Text>
          <View style={styles.vesselListContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Nearby Vessels ({vessels.length})</Text>
            <ScrollView>
              {vessels.map((vessel) => (
                <View
                  key={vessel.id}
                  style={[styles.vesselCard, { backgroundColor: colors.background, borderColor: colors.border }]}
                >
                  <Text style={[styles.vesselName, { color: colors.text }]}>
                    🚢 {vessel.name}
                  </Text>
                  <Text style={[styles.vesselDetails, { color: colors.icon }]}>
                    {vessel.type} • {vessel.distance.toFixed(1)} km away
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Live Vessel Map</Text>
        <Text style={styles.headerSubtitle}>Tap vessels to communicate • {vessels.length} vessels online</Text>
      </View>

      <View style={styles.mapContainer}>
        {userLocation && MapView && Marker ? (
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            region={region}
            showsUserLocation={true}
            showsMyLocationButton={true}
            showsCompass={true}
            onRegionChangeComplete={setRegion}
          >
            {/* User's vessel */}
            {userLocation && (
              <Marker
                coordinate={userLocation}
                title="My Vessel"
                description={currentUser?.name || 'You'}
                pinColor="#FF3B30"
              >
                <View style={[styles.markerContainer, { backgroundColor: colors.danger }]}>
                  <Text style={styles.markerIcon}>📍</Text>
                </View>
              </Marker>
            )}

            {/* Other vessels */}
            {vessels.map((vessel) => (
              <Marker
                key={vessel.id}
                coordinate={{
                  latitude: vessel.latitude,
                  longitude: vessel.longitude,
                }}
                title={vessel.name}
                description={`${vessel.type} • ${vessel.distance.toFixed(1)} km`}
                onPress={() => handleVesselPress(vessel)}
              >
                <View style={[styles.markerContainer, { backgroundColor: colors.primary }]}>
                  <Text style={styles.markerIcon}>🚢</Text>
                </View>
              </Marker>
            ))}
          </MapView>
        ) : (
          <View style={[styles.webMapView, { backgroundColor: colors.card }]}>
            <Text style={[styles.webMapTitle, { color: colors.text }]}>🗺️ Live Map</Text>
            <Text style={[styles.webMapCoords, { color: colors.icon }]}>
              {userLocation ? `📍 ${userLocation.latitude.toFixed(4)}°N, ${userLocation.longitude.toFixed(4)}°E` : 'Getting location...'}
            </Text>
            <ScrollView style={styles.vesselListWeb}>
              {vessels.map((vessel) => (
                <TouchableOpacity
                  key={vessel.id}
                  style={[styles.vesselCardWeb, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={() => handleVesselPress(vessel)}
                >
                  <Text style={styles.vesselIconWeb}>🚢</Text>
                  <View style={styles.vesselInfoWeb}>
                    <Text style={[styles.vesselNameWeb, { color: colors.text }]}>{vessel.name}</Text>
                    <Text style={[styles.vesselDetailsWeb, { color: colors.icon }]}>
                      {vessel.type} • {vessel.distance.toFixed(1)} km • {vessel.speed.toFixed(1)} kn
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

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
                  {selectedVessel.type} • {selectedVessel.distance.toFixed(1)} km away • {selectedVessel.speed.toFixed(1)} kn
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
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  markerIcon: {
    fontSize: 20,
  },
  legend: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  legendItem: {
    fontSize: 10,
  },
  webMapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  webMapText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  webMapSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  vesselListContainer: {
    width: '100%',
    maxWidth: 400,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  vesselCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  vesselName: {
    fontSize: 14,
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
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  backButton: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
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
    marginTop: 4,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  emptyChat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyChatText: {
    fontSize: 14,
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
  webMapView: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  webMapTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  webMapCoords: {
    fontSize: 13,
    marginBottom: 16,
  },
  vesselListWeb: {
    width: '100%',
  },
  vesselCardWeb: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    alignItems: 'center',
  },
  vesselIconWeb: {
    fontSize: 28,
    marginRight: 12,
  },
  vesselInfoWeb: {
    flex: 1,
  },
  vesselNameWeb: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  vesselDetailsWeb: {
    fontSize: 12,
  },
});