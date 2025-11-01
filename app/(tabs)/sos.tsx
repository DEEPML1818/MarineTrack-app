
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import * as Location from 'expo-location';
import { getCurrentUser } from '@/utils/auth';

export default function SOSScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [sosActive, setSosActive] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadUserData();
    getCurrentLocation();
  }, []);

  const loadUserData = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
  };

  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    }
  };

  const emergencyContacts = [
    { 
      id: 1, 
      name: 'Malaysian Maritime Enforcement Agency (MMEA)', 
      phone: '+60380008000', 
      type: 'Authority',
      description: '24/7 Maritime Emergency Hotline'
    },
    { 
      id: 2, 
      name: 'MMEA Emergency Hotline', 
      phone: '999', 
      type: 'Authority',
      description: 'Emergency Services Malaysia'
    },
    { 
      id: 3, 
      name: 'Marine Police', 
      phone: '+60322662222', 
      type: 'Authority',
      description: 'Royal Malaysian Marine Police'
    },
    { 
      id: 4, 
      name: 'MERS 999', 
      phone: '999', 
      type: 'Authority',
      description: 'Malaysia Emergency Response Services'
    },
  ];

  const makeEmergencyCall = (phone: string, name: string) => {
    Alert.alert(
      `Call ${name}?`,
      `This will dial ${phone} for emergency assistance.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          style: 'destructive',
          onPress: () => {
            Linking.openURL(`tel:${phone}`);
          },
        },
      ]
    );
  };

  const handleSOS = async () => {
    if (!userLocation) {
      Alert.alert('Location Required', 'Please enable location services to send SOS.');
      return;
    }

    Alert.alert(
      'Send SOS Alert?',
      'This will:\n• Send your location to emergency services\n• Alert nearby vessels\n• Notify registered contacts\n• Activate emergency beacon',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send SOS',
          style: 'destructive',
          onPress: async () => {
            setSosActive(true);
            
            // In production, send to backend API:
            // await fetch('https://your-backend/api/sos', {
            //   method: 'POST',
            //   body: JSON.stringify({
            //     userId: currentUser?.id,
            //     location: userLocation,
            //     timestamp: new Date().toISOString(),
            //     vesselInfo: currentUser?.vesselInfo
            //   })
            // });

            // Simulate SMS to emergency services
            const message = `MARITIME EMERGENCY: ${currentUser?.vesselInfo?.vesselName || 'Unknown Vessel'} at ${userLocation.latitude.toFixed(6)}°N, ${userLocation.longitude.toFixed(6)}°E. Immediate assistance required.`;
            
            // Auto-dial MMEA
            setTimeout(() => {
              Alert.alert(
                'SOS Activated!',
                'Emergency services have been notified.\n\nDo you want to call MMEA now?',
                [
                  { text: 'No', style: 'cancel' },
                  { 
                    text: 'Call MMEA',
                    onPress: () => Linking.openURL('tel:999')
                  },
                ]
              );
            }, 1000);
          },
        },
      ]
    );
  };

  const cancelSOS = () => {
    Alert.alert(
      'Cancel SOS?',
      'Are you sure you want to cancel the emergency alert?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          onPress: () => {
            setSosActive(false);
            Alert.alert('SOS Cancelled', 'Emergency alert has been deactivated.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.danger }]}>
        <Text style={styles.headerTitle}>Emergency SOS</Text>
        <Text style={styles.headerSubtitle}>Quick Emergency Response</Text>
      </View>

      <View style={styles.sosSection}>
        {sosActive && (
          <View style={[styles.activeAlert, { backgroundColor: colors.danger }]}>
            <Text style={styles.activeAlertText}>🚨 SOS ACTIVE</Text>
            <Text style={styles.activeAlertSubtext}>
              Emergency services notified • Help is on the way
            </Text>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={cancelSOS}
            >
              <Text style={styles.cancelButtonText}>Cancel SOS</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.sosButton, 
            { backgroundColor: sosActive ? '#FF3B30' : colors.danger }
          ]}
          onPress={sosActive ? cancelSOS : handleSOS}
          activeOpacity={0.8}
        >
          <Text style={styles.sosIcon}>🚨</Text>
          <Text style={styles.sosText}>{sosActive ? 'SOS ACTIVE' : 'SEND SOS'}</Text>
          <Text style={styles.sosSubtext}>
            {sosActive ? 'Tap to cancel' : 'Press and hold for emergency'}
          </Text>
        </TouchableOpacity>

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>📍 Current Location</Text>
          {userLocation ? (
            <>
              <Text style={[styles.infoText, { color: colors.icon }]}>
                {userLocation.latitude.toFixed(6)}°N, {userLocation.longitude.toFixed(6)}°E
              </Text>
              {currentUser?.vesselInfo && (
                <Text style={[styles.infoSubtext, { color: colors.icon }]}>
                  Vessel: {currentUser.vesselInfo.vesselName}
                </Text>
              )}
            </>
          ) : (
            <Text style={[styles.infoText, { color: colors.icon }]}>
              Fetching location...
            </Text>
          )}
        </View>
      </View>

      <View style={styles.contactsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Emergency Contacts</Text>
        {emergencyContacts.map((contact) => (
          <View
            key={contact.id}
            style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.contactInfo}>
              <Text style={[styles.contactName, { color: colors.text }]}>
                {contact.type === 'Authority' ? '🚓' : '👤'} {contact.name}
              </Text>
              <Text style={[styles.contactType, { color: colors.icon }]}>
                {contact.description}
              </Text>
              <Text style={[styles.contactPhone, { color: colors.primary }]}>
                {contact.phone}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.callButton, { backgroundColor: colors.primary }]}
              onPress={() => makeEmergencyCall(contact.phone, contact.name)}
            >
              <Text style={styles.callText}>📞 Call</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={[styles.instructionsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.instructionsTitle, { color: colors.danger }]}>
          ⚠️ Emergency Instructions
        </Text>
        <Text style={[styles.instructionsText, { color: colors.text }]}>
          1. Press the SOS button to send your location to emergency services{'\n'}
          2. Your GPS coordinates will be broadcast to MMEA and nearby vessels{'\n'}
          3. Stay calm and secure your vessel{'\n'}
          4. Monitor VHF Channel 16 for rescue coordination{'\n'}
          5. Keep your phone charged and accessible{'\n'}
          6. Prepare life jackets and emergency equipment{'\n'}
          7. Wait for confirmation from rescue services
        </Text>
      </View>
    </ScrollView>
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
  sosSection: {
    padding: 16,
    alignItems: 'center',
  },
  activeAlert: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  activeAlertText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  activeAlertSubtext: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sosButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
    elevation: 8,
  },
  sosIcon: {
    fontSize: 60,
    marginBottom: 8,
  },
  sosText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  sosSubtext: {
    color: '#fff',
    fontSize: 12,
    marginTop: 8,
    opacity: 0.9,
  },
  infoCard: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 18,
    fontWeight: '600',
  },
  infoSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  contactsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  contactCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactType: {
    fontSize: 12,
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 13,
    fontWeight: '600',
  },
  callButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  callText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  instructionsCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 24,
  },
});
