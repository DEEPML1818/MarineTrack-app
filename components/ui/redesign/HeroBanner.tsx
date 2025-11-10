
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '@/constants/Theme';

interface HeroBannerProps {
  title: string;
  subtitle?: string;
  badge?: string;
  buttonText?: string;
  onPress?: () => void;
  variant?: 'promo' | 'alert' | 'weather' | 'info';
  imageSource?: ImageSourcePropType;
  icon?: React.ReactNode;
}

export function HeroBanner({ 
  title, 
  subtitle, 
  badge,
  buttonText, 
  onPress, 
  variant = 'promo',
  imageSource,
  icon 
}: HeroBannerProps) {
  const gradientColors = {
    promo: [Theme.colors.teal, Theme.colors.navy],
    alert: [Theme.colors.coral, '#D94A3D'],
    weather: [Theme.colors.navy, '#0A1929'],
    info: [Theme.colors.teal, '#0D8895'],
  };

  return (
    <View style={styles.container}>
      {imageSource ? (
        <ImageBackground 
          source={imageSource} 
          style={styles.imageBackground}
          imageStyle={styles.image}
        >
          <LinearGradient
            colors={['rgba(8, 40, 55, 0.7)', 'rgba(8, 40, 55, 0.9)']}
            style={styles.overlay}
          >
            {renderContent()}
          </LinearGradient>
        </ImageBackground>
      ) : (
        <LinearGradient
          colors={gradientColors[variant]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {renderContent()}
        </LinearGradient>
      )}
    </View>
  );

  function renderContent() {
    return (
      <View style={styles.content}>
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge.toUpperCase()}</Text>
          </View>
        )}
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        {buttonText && onPress && (
          <TouchableOpacity 
            style={styles.button} 
            onPress={onPress}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Theme.spacing.base,
    marginVertical: Theme.spacing.md,
    borderRadius: Theme.cards.borderRadius,
    overflow: 'hidden',
    ...Theme.shadows.lg,
  },
  imageBackground: {
    width: '100%',
    minHeight: 200,
  },
  image: {
    borderRadius: Theme.cards.borderRadius,
  },
  overlay: {
    width: '100%',
    minHeight: 200,
    padding: Theme.spacing.xl,
  },
  gradient: {
    padding: Theme.spacing.xl,
    minHeight: 200,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.chips.borderRadius,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  badgeText: {
    color: Theme.colors.white,
    fontSize: Theme.fonts.sizes.xs,
    fontWeight: Theme.fonts.weights.bold,
    letterSpacing: 1,
  },
  iconContainer: {
    marginBottom: Theme.spacing.md,
  },
  title: {
    fontSize: Theme.fonts.sizes.xxl,
    fontWeight: Theme.fonts.weights.bold,
    color: Theme.colors.white,
    fontFamily: Theme.fonts.heading,
    marginBottom: Theme.spacing.xs,
    lineHeight: Theme.fonts.lineHeights.tight * Theme.fonts.sizes.xxl,
  },
  subtitle: {
    fontSize: Theme.fonts.sizes.base,
    color: Theme.colors.white,
    opacity: 0.95,
    marginBottom: Theme.spacing.lg,
    lineHeight: Theme.fonts.lineHeights.normal * Theme.fonts.sizes.base,
  },
  button: {
    backgroundColor: Theme.colors.white,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xl,
    borderRadius: Theme.buttons.borderRadius,
    alignSelf: 'flex-start',
    marginTop: Theme.spacing.sm,
    minHeight: Theme.touchTarget.min,
    justifyContent: 'center',
    ...Theme.shadows.sm,
  },
  buttonText: {
    color: Theme.colors.navy,
    fontSize: Theme.fonts.sizes.base,
    fontWeight: Theme.fonts.weights.bold,
    letterSpacing: 0.5,
  },
});
