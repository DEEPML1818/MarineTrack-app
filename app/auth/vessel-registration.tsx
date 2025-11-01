import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { storeUser } from '@/utils/auth';
import { saveUserToDatabase } from '@/utils/database';

export default function VesselRegistrationScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    vesselName: '',
    vesselType: '',
    registrationNumber: '',
    imoNumber: '',
    callSign: '',
    captainName: '',
    phoneNumber: '',
    email: '',
    homePort: '',
    vesselLength: '',
    vesselBeam: '',
    grossTonnage: '',
    emergencyContact: '',
    emergencyPhone: '',
  });

  const vesselTypes = [
    'Fishing Vessel',
    'Cargo Ship',
    'Tanker',
    'Passenger Ship',
    'Tug Boat',
    'Yacht',
    'Ferry',
    'Other',
  ];

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.vesselName.trim()) {
      Alert.alert('Required Field', 'Please enter vessel name');
      return false;
    }
    if (!formData.vesselType) {
      Alert.alert('Required Field', 'Please select vessel type');
      return false;
    }
    if (!formData.registrationNumber.trim()) {
      Alert.alert('Required Field', 'Please enter vessel registration number');
      return false;
    }
    if (!formData.callSign.trim()) {
      Alert.alert('Required Field', 'Please enter radio call sign');
      return false;
    }
    if (!formData.captainName.trim()) {
      Alert.alert('Required Field', 'Please enter captain/operator name');
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      Alert.alert('Required Field', 'Please enter contact phone number');
      return false;
    }
    if (!formData.homePort.trim()) {
      Alert.alert('Required Field', 'Please enter home port');
      return false;
    }
    if (!formData.vesselLength.trim()) {
      Alert.alert('Required Field', 'Please enter vessel length');
      return false;
    }
    if (!formData.vesselBeam.trim()) {
      Alert.alert('Required Field', 'Please enter vessel beam (width)');
      return false;
    }
    if (!formData.grossTonnage.trim()) {
      Alert.alert('Required Field', 'Please enter gross tonnage');
      return false;
    }
    if (!formData.emergencyContact.trim()) {
      Alert.alert('Required Field', 'Please enter emergency contact name');
      return false;
    }
    if (!formData.emergencyPhone.trim()) {
      Alert.alert('Required Field', 'Please enter emergency contact phone');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userId = `vessel_${Date.now()}`;
      
      const user = {
        id: userId,
        name: formData.captainName,
        email: formData.email || `${userId}@guest.marine`,
        isGuest: true,
        createdAt: new Date().toISOString(),
      };

      await storeUser(user);

      await saveUserToDatabase({
        id: userId,
        email: user.email,
        name: formData.captainName,
        isGuest: true,
        createdAt: user.createdAt,
        lastLogin: new Date().toISOString(),
        vesselInfo: {
          vesselName: formData.vesselName,
          vesselType: formData.vesselType,
          registrationNumber: formData.registrationNumber,
          imoNumber: formData.imoNumber,
          callSign: formData.callSign,
          homePort: formData.homePort,
          vesselLength: formData.vesselLength,
          vesselBeam: formData.vesselBeam,
          grossTonnage: formData.grossTonnage,
        },
        contactInfo: {
          phone: formData.phoneNumber,
          email: formData.email,
          emergencyContact: formData.emergencyContact,
          emergencyPhone: formData.emergencyPhone,
        },
      });

      setLoading(false);
      router.replace('/(tabs)');
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to register vessel. Please try again.');
      console.error('Registration error:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerIcon}>⚓</Text>
          <Text style={[styles.title, { color: colors.primary }]}>Vessel Registration</Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>
            Register your vessel to access MarineTrack services
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Vessel Information</Text>
          
          <Text style={[styles.label, { color: colors.text }]}>Vessel Name *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Enter vessel name"
            placeholderTextColor={colors.icon}
            value={formData.vesselName}
            onChangeText={(text) => updateField('vesselName', text)}
          />

          <Text style={[styles.label, { color: colors.text }]}>Vessel Type *</Text>
          <View style={styles.typeGrid}>
            {vesselTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  { borderColor: colors.border },
                  formData.vesselType === type && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => updateField('vesselType', type)}
              >
                <Text style={[
                  styles.typeButtonText,
                  { color: formData.vesselType === type ? '#fff' : colors.text }
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { color: colors.text }]}>Registration Number</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="e.g., MY-12345"
            placeholderTextColor={colors.icon}
            value={formData.registrationNumber}
            onChangeText={(text) => updateField('registrationNumber', text)}
          />

          <Text style={[styles.label, { color: colors.text }]}>IMO Number (if applicable)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="International Maritime Organization number"
            placeholderTextColor={colors.icon}
            value={formData.imoNumber}
            onChangeText={(text) => updateField('imoNumber', text)}
            keyboardType="numeric"
          />

          <Text style={[styles.label, { color: colors.text }]}>Call Sign</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Radio call sign"
            placeholderTextColor={colors.icon}
            value={formData.callSign}
            onChangeText={(text) => updateField('callSign', text.toUpperCase())}
            autoCapitalize="characters"
          />

          <Text style={[styles.label, { color: colors.text }]}>Home Port *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="e.g., Port Klang, Malaysia"
            placeholderTextColor={colors.icon}
            value={formData.homePort}
            onChangeText={(text) => updateField('homePort', text)}
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={[styles.label, { color: colors.text }]}>Length (m)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                placeholder="0.0"
                placeholderTextColor={colors.icon}
                value={formData.vesselLength}
                onChangeText={(text) => updateField('vesselLength', text)}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={[styles.label, { color: colors.text }]}>Beam (m)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                placeholder="0.0"
                placeholderTextColor={colors.icon}
                value={formData.vesselBeam}
                onChangeText={(text) => updateField('vesselBeam', text)}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <Text style={[styles.label, { color: colors.text }]}>Gross Tonnage (GT)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Tonnage"
            placeholderTextColor={colors.icon}
            value={formData.grossTonnage}
            onChangeText={(text) => updateField('grossTonnage', text)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Captain/Operator Information</Text>
          
          <Text style={[styles.label, { color: colors.text }]}>Full Name *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Captain or operator name"
            placeholderTextColor={colors.icon}
            value={formData.captainName}
            onChangeText={(text) => updateField('captainName', text)}
          />

          <Text style={[styles.label, { color: colors.text }]}>Phone Number *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="+60 12-345 6789"
            placeholderTextColor={colors.icon}
            value={formData.phoneNumber}
            onChangeText={(text) => updateField('phoneNumber', text)}
            keyboardType="phone-pad"
          />

          <Text style={[styles.label, { color: colors.text }]}>Email (optional)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="your.email@example.com"
            placeholderTextColor={colors.icon}
            value={formData.email}
            onChangeText={(text) => updateField('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Emergency Contact</Text>
          
          <Text style={[styles.label, { color: colors.text }]}>Emergency Contact Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Shore contact name"
            placeholderTextColor={colors.icon}
            value={formData.emergencyContact}
            onChangeText={(text) => updateField('emergencyContact', text)}
          />

          <Text style={[styles.label, { color: colors.text }]}>Emergency Contact Phone</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="+60 12-345 6789"
            placeholderTextColor={colors.icon}
            value={formData.emergencyPhone}
            onChangeText={(text) => updateField('emergencyPhone', text)}
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Registering...' : 'Complete Registration'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  submitButton: {
    marginHorizontal: 20,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
