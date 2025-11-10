
// MarineTrack Theme - ZUS Coffee-Inspired Maritime Aesthetic
// Delivery-first design with warm, purposeful interactions

export const Theme = {
  // Primary Colors
  colors: {
    teal: '#0F9AA7',        // Primary action color
    navy: '#082837',        // Deep navy for headers and emphasis
    coral: '#FF6B61',       // Alert and attention states
    sand: '#F6EBD9',        // Warm backgrounds and highlights
    offWhite: '#FBFAF8',    // Main background
    mutedGray: '#6B7785',   // Secondary text and borders
    white: '#FFFFFF',
    black: '#0A0E12',
    
    // Semantic Colors
    success: '#0F9AA7',     // Use teal for success
    warning: '#FFA726',
    danger: '#FF6B61',      // Use coral for danger
    info: '#0F9AA7',
    
    // Status Colors (high contrast for glanceability)
    statusLive: '#0F9AA7',      // Teal for live/active
    statusDocked: '#6B7785',    // Muted for docked
    statusDelayed: '#FFA726',   // Warning orange
    statusAttention: '#FF6B61', // Coral for attention
  },
  
  // Typography - Geometric sans with clear hierarchy
  fonts: {
    base: 'Inter',          // Body and general text
    heading: 'Poppins',     // Headers and emphasis
    sizes: {
      xs: 10,      // Helper text, labels
      sm: 12,      // Secondary text, timestamps
      md: 14,      // Body text
      base: 16,    // Primary body, inputs
      lg: 20,      // Section headers
      xl: 24,      // Screen titles
      xxl: 28,     // Hero headings
      xxxl: 32,    // Large hero text
    },
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
    lineHeights: {
      tight: 1.2,     // Headings
      normal: 1.5,    // Body text
      relaxed: 1.75,  // Long-form content
    },
  },
  
  // Spacing (4px baseline grid)
  spacing: {
    xs: 4,       // Tight spacing
    sm: 8,       // Small gaps
    md: 12,      // Medium spacing
    base: 16,    // Base unit
    lg: 20,      // Large spacing
    xl: 24,      // Extra large
    xxl: 32,     // Double extra large
    xxxl: 40,    // Hero spacing
    huge: 48,    // Section spacing
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
  
  // Touch Targets (44x44 minimum for maritime use)
  touchTarget: {
    min: 44,
    comfortable: 48,
  },
  
  // Motion - Fast and purposeful
  motion: {
    duration: {
      fast: 120,      // Quick transitions
      base: 180,      // Standard transitions
      slow: 220,      // Deliberate animations
      slower: 300,    // Complex transitions
    },
    easing: {
      natural: 'cubic-bezier(0.4, 0, 0.2, 1)',     // Natural motion
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',       // Exit animations
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',        // Enter animations
      spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Bouncy
    },
  },
  
  // Component-specific tokens
  cards: {
    borderRadius: 16,
    elevation: 4,
  },
  
  chips: {
    borderRadius: 999,  // Full pill shape
    height: 44,
  },
  
  buttons: {
    borderRadius: 12,
    heightSmall: 36,
    heightMedium: 44,
    heightLarge: 52,
  },
};

export type ThemeType = typeof Theme;
