import React from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface ModalSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  height?: number;
}

export function ModalSheet({ visible, onClose, title, children, height }: ModalSheetProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View
          style={[
            styles.content,
            { backgroundColor: colors.card },
            height ? { height } : { minHeight: '80%' },
          ]}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <IconSymbol name="chevron.down" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: Theme.radius.lg,
    borderTopRightRadius: Theme.radius.lg,
    paddingBottom: Theme.spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.base,
  },
  title: {
    fontSize: Theme.fonts.sizes.xl,
    fontWeight: Theme.fonts.weights.semibold,
  },
  scrollView: {
    flex: 1,
  },
});
