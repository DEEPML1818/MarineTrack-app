
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, TextInput, Modal, Alert } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { router } from 'expo-router';

interface Boat {
  id: string;
  name: string;
  length: string;
  year: string;
  image?: string;
}

export default function BoatsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [boats, setBoats] = useState<Boat[]>([
    { id: '1', name: 'Sea Breeze', length: '40', year: '2015' },
    { id: '2', name: 'Sea Breeze', length: '40', year: '2015' },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBoat, setSelectedBoat] = useState<Boat | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    boatType: '',
    length: '',
    year: '',
  });

  const handleAddBoat = () => {
    setShowAddModal(true);
    setFormData({ name: '', boatType: '', length: '', year: '' });
  };

  const handleEditBoat = (boat: Boat) => {
    setSelectedBoat(boat);
    setFormData({ name: boat.name, boatType: '', length: boat.length, year: boat.year });
    setShowEditModal(true);
  };

  const handleDeleteBoat = (boat: Boat) => {
    setSelectedBoat(boat);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedBoat) {
      setBoats(boats.filter(b => b.id !== selectedBoat.id));
      setShowDeleteModal(false);
      setSelectedBoat(null);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
      <View style={[styles.header, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={isDark ? '#FFF' : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#000' }]}>My Boats</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.subtitle, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>
          Manage your boat collections
        </Text>

        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddBoat}
        >
          <Text style={styles.addButtonText}>Add New Boat</Text>
        </TouchableOpacity>

        {boats.map((boat) => (
          <View key={boat.id} style={[styles.boatCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
            <Image 
              source={require('@/assets/images/partial-react-logo.png')} 
              style={styles.boatImage}
            />
            <View style={styles.boatInfo}>
              <Text style={[styles.boatName, { color: isDark ? '#FFF' : '#000' }]}>{boat.name}</Text>
              <View style={styles.boatDetails}>
                <View style={styles.detailItem}>
                  <IconSymbol name="house.fill" size={16} color="#007AFF" />
                  <Text style={[styles.detailText, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>
                    {boat.length} ft
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <IconSymbol name="house.fill" size={16} color="#007AFF" />
                  <Text style={[styles.detailText, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>
                    {boat.year}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.boatActions}>
              <TouchableOpacity onPress={() => handleEditBoat(boat)}>
                <IconSymbol name="paperplane.fill" size={20} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteBoat(boat)}>
                <IconSymbol name="paperplane.fill" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add Boat Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={isDark ? '#FFF' : '#000'} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: isDark ? '#FFF' : '#000' }]}>Add Boat</Text>
              <View style={{ width: 24 }} />
            </View>

            <Text style={[styles.label, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>Enter your boat details</Text>

            <Text style={[styles.inputLabel, { color: isDark ? '#FFF' : '#000' }]}>Boat Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7', color: isDark ? '#FFF' : '#000' }]}
              placeholder="Sea Breeze"
              placeholderTextColor={isDark ? '#8E8E93' : '#6C6C70'}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />

            <Text style={[styles.inputLabel, { color: isDark ? '#FFF' : '#000' }]}>Boat Type</Text>
            <TouchableOpacity style={[styles.input, styles.selectInput, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
              <Text style={{ color: isDark ? '#8E8E93' : '#6C6C70' }}>Select Boat Type</Text>
              <IconSymbol name="chevron.right" size={20} color={isDark ? '#8E8E93' : '#6C6C70'} />
            </TouchableOpacity>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={[styles.inputLabel, { color: isDark ? '#FFF' : '#000' }]}>Boat Length (feet)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7', color: isDark ? '#FFF' : '#000' }]}
                  placeholder="40"
                  placeholderTextColor={isDark ? '#8E8E93' : '#6C6C70'}
                  keyboardType="numeric"
                  value={formData.length}
                  onChangeText={(text) => setFormData({ ...formData, length: text })}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={[styles.inputLabel, { color: isDark ? '#FFF' : '#000' }]}>Year Build</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7', color: isDark ? '#FFF' : '#000' }]}
                  placeholder="2015"
                  placeholderTextColor={isDark ? '#8E8E93' : '#6C6C70'}
                  keyboardType="numeric"
                  value={formData.year}
                  onChangeText={(text) => setFormData({ ...formData, year: text })}
                />
              </View>
            </View>

            <Text style={[styles.inputLabel, { color: isDark ? '#FFF' : '#000' }]}>Upload Images</Text>
            <TouchableOpacity style={[styles.uploadBox, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
              <IconSymbol name="house.fill" size={40} color="#007AFF" />
              <Text style={[styles.uploadText, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>
                Click to upload or drag image here
              </Text>
              <Text style={[styles.uploadSubtext, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>
                (Upload as PNG or JPEG)
              </Text>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={showDeleteModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.deleteModal, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
                <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={isDark ? '#FFF' : '#000'} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: isDark ? '#FFF' : '#000' }]}>Delete confirm</Text>
              <View style={{ width: 24 }} />
            </View>

            <Text style={[styles.deleteTitle, { color: isDark ? '#FFF' : '#000' }]}>Delete Boat</Text>
            <Text style={[styles.deleteMessage, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>
              Are you sure you want to delete this boat?
            </Text>

            <TouchableOpacity style={styles.deleteImageBox}>
              <IconSymbol name="house.fill" size={40} color="#007AFF" />
              <Text style={[styles.uploadText, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>
                Click to upload or drag image here
              </Text>
              <Text style={[styles.uploadSubtext, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>
                (Upload as PNG or JPEG)
              </Text>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteButton]}
                onPress={confirmDelete}
              >
                <Text style={styles.saveButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  boatCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  boatImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  boatInfo: {
    flex: 1,
  },
  boatName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  boatDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
  },
  boatActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    minHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 20,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  selectInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
  halfInput: {
    flex: 1,
  },
  uploadBox: {
    marginHorizontal: 20,
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  uploadText: {
    fontSize: 14,
    marginTop: 8,
  },
  uploadSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
  },
  cancelButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    minHeight: '50%',
  },
  deleteTitle: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  deleteMessage: {
    fontSize: 14,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  deleteImageBox: {
    marginHorizontal: 20,
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
});
