
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface FormField {
  key: string;
  label: string;
  placeholder: string;
  type?: 'text' | 'number' | 'picker';
  options?: string[];
  required?: boolean;
}

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  title: string;
  fields: FormField[];
  submitText?: string;
}

export function AddItemModal({
  visible,
  onClose,
  onSubmit,
  title,
  fields,
  submitText = 'Add',
}: AddItemModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const [formData, setFormData] = useState<{ [key: string]: string }>({});

  const handleSubmit = () => {
    // Validate required fields
    const missingFields = fields
      .filter(f => f.required && !formData[f.key])
      .map(f => f.label);

    if (missingFields.length > 0) {
      alert(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    onSubmit(formData);
    setFormData({});
    onClose();
  };

  const handleClose = () => {
    setFormData({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.backdropTouchable}
            activeOpacity={1}
            onPress={handleClose}
          />
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            {/* Handle Bar */}
            <View style={styles.handleBar}>
              <View style={[styles.handle, { backgroundColor: colors.border }]} />
            </View>

            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Text style={[styles.closeText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
              <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
                <Text style={[styles.submitText, { color: colors.primary }]}>{submitText}</Text>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              {fields.map((field) => (
                <View key={field.key} style={styles.fieldContainer}>
                  <Text style={[styles.fieldLabel, { color: colors.secondaryText }]}>
                    {field.label}
                    {field.required && <Text style={styles.requiredStar}> *</Text>}
                  </Text>
                  {field.type === 'picker' ? (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.pickerContainer}
                    >
                      {field.options?.map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={[
                            styles.pickerOption,
                            {
                              backgroundColor:
                                formData[field.key] === option
                                  ? colors.primary
                                  : isDark
                                  ? colors.background
                                  : '#F0F0F0',
                              borderColor: colors.border,
                            },
                          ]}
                          onPress={() =>
                            setFormData({ ...formData, [field.key]: option })
                          }
                        >
                          <Text
                            style={[
                              styles.pickerOptionText,
                              {
                                color:
                                  formData[field.key] === option
                                    ? '#FFFFFF'
                                    : colors.text,
                              },
                            ]}
                          >
                            {option}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  ) : (
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: isDark ? colors.background : '#F0F0F0',
                          color: colors.text,
                          borderColor: colors.border,
                        },
                      ]}
                      placeholder={field.placeholder}
                      placeholderTextColor={colors.tertiaryText}
                      value={formData[field.key] || ''}
                      onChangeText={(text) =>
                        setFormData({ ...formData, [field.key]: text })
                      }
                      keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                    />
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  backdropTouchable: {
    flex: 1,
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  handleBar: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  submitButton: {
    padding: 8,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  requiredStar: {
    color: '#FF3B30',
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    borderWidth: 1,
  },
  pickerContainer: {
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  pickerOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
