import React from 'react';
import { View, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface ProfileAvatarProps {
  source?: ImageSourcePropType;
  size?: number;
}

export function ProfileAvatar({ source, size = 100 }: ProfileAvatarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
        Theme.shadows.md,
      ]}
    >
      {source ? (
        <Image source={source} style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]} />
      ) : (
        <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primary }]}>
          <IconSymbol name="person.fill" size={size * 0.5} color={colors.card} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
