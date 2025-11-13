import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import { ProfileAvatar } from '@/components/redesign/ProfileAvatar';
import { StatChip } from '@/components/redesign/StatChip';

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const stats = [
    { label: 'Vessels\nTracked', value: '156', color: '#34C759' },
    { label: 'Nautical\nMiles', value: '12.5k', color: '#007AFF' },
    { label: 'Voyages', value: '5 yrs', color: '#FF9500' },
  ];

  const categories = [
    { id: 1, label: 'Navigation', active: true },
    { id: 2, label: 'Safety', active: false },
    { id: 3, label: 'Weather', active: false },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <ProfileAvatar size={100} />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>Captain Anderson</Text>
            <Text style={[styles.profileRole, { color: colors.secondaryText }]}>
              Explorer of the Seas
            </Text>
            <TouchableOpacity style={styles.contactButton}>
              <Text style={styles.contactButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.categoriesRow}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                {
                  backgroundColor: category.active
                    ? isDark
                      ? colors.card
                      : '#E8F4FF'
                    : colors.card,
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  {
                    color: category.active
                      ? colors.primary
                      : colors.secondaryText,
                  },
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.statsRow}>
          {stats.map((stat, index) => (
            <StatChip
              key={index}
              value={stat.value}
              label={stat.label}
              color={stat.color}
            />
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
        <Text style={[styles.aboutText, { color: colors.secondaryText }]}>
          A passionate maritime enthusiast with a love for the open seas. I enjoy tracking vessels,
          monitoring weather conditions, and exploring new waterways. With years of experience in
          maritime navigation and safety, I'm always ready for the next adventure on the water.
        </Text>

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: 60,
    paddingBottom: Theme.spacing.base,
  },
  headerTitle: {
    fontSize: Theme.fonts.sizes.xl,
    fontWeight: Theme.fonts.weights.semibold,
  },
  content: {
    flex: 1,
    paddingHorizontal: Theme.spacing.lg,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: Theme.spacing.base,
  },
  profileName: {
    fontSize: Theme.fonts.sizes.xxl,
    fontWeight: Theme.fonts.weights.bold,
    marginBottom: Theme.spacing.xs,
  },
  profileRole: {
    fontSize: Theme.fonts.sizes.md,
    marginBottom: Theme.spacing.base,
  },
  contactButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: Theme.spacing.xxl,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.radius.full,
  },
  contactButtonText: {
    color: '#FFF',
    fontSize: Theme.fonts.sizes.md,
    fontWeight: Theme.fonts.weights.semibold,
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.xl,
  },
  categoryButton: {
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.radius.full,
  },
  categoryText: {
    fontSize: Theme.fonts.sizes.sm,
    fontWeight: Theme.fonts.weights.medium,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: Theme.fonts.sizes.lg,
    fontWeight: Theme.fonts.weights.semibold,
    marginBottom: Theme.spacing.md,
  },
  aboutText: {
    fontSize: Theme.fonts.sizes.md,
    lineHeight: 20,
    marginBottom: Theme.spacing.xl,
  },
  bottomSpacing: {
    height: 100,
  },
});
