
// MarineTrack Theme - Based on design-system/tokens.css
// ZUS Coffee-Inspired Maritime Aesthetic

export const Theme = {
  // Primary Colors
  colors: {
    teal: '#0F9AA7',
    navy: '#082837',
    coral: '#FF6B61',
    sand: '#F6EBD9',
    offWhite: '#FBFAF8',
    mutedGray: '#6B7785',
    white: '#FFFFFF',
    black: '#0A0E12',
    
    // Semantic Colors
    success: '#00C896',
    warning: '#FFA726',
    danger: '#FF5252',
    info: '#0F9AA7',
    
    // Status Colors
    statusLive: '#00E676',
    statusDocked: '#6B7785',
    statusDelayed: '#FFA726',
    statusAttention: '#FF6B61',
  },
  
  // Typography
  fonts: {
    base: 'Inter',
    heading: 'Poppins',
    sizes: {
      xs: 10,
      sm: 12,
      md: 14,
      base: 16,
      lg: 20,
      xl: 24,
      xxl: 28,
    },
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  // Spacing (4px baseline)
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40,
  },
  
  // Border Radius
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 999,
  },
  
  // Shadows
  shadows: {
    sm: {
      shadowColor: '#082837',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowColor: '#082837',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    },
    lg: {
      shadowColor: '#082837',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 15,
      elevation: 8,
    },
    xl: {
      shadowColor: '#082837',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.2,
      shadowRadius: 25,
      elevation: 12,
    },
  },
  
  // Web-compatible shadows (CSS box-shadow)
  webShadows: {
    sm: {
      boxShadow: '0 1px 3px rgba(8, 40, 55, 0.08)',
    },
    md: {
      boxShadow: '0 4px 6px rgba(8, 40, 55, 0.1)',
    },
    lg: {
      boxShadow: '0 10px 15px rgba(8, 40, 55, 0.15)',
    },
    xl: {
      boxShadow: '0 20px 25px rgba(8, 40, 55, 0.2)',
    },
  },
  
  // Touch Targets
  touchTarget: {
    min: 44,
  },
};

export type ThemeType = typeof Theme;
