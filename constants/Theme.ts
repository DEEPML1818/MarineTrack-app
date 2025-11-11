
// MarineTrack Theme - ZUS Coffee-Inspired Maritime Aesthetic
// Warm, modern design with coffee-inspired colors and clean interfaces

export const Theme = {
  // Primary Colors - Zus Coffee-Inspired Palette
  colors: {
    espresso: '#4A2C2A',    // Rich espresso - primary headers and emphasis
    coffeeBrown: '#6B4423', // Coffee brown - secondary headers
    latte: '#F5E6D3',       // Latte cream - warm backgrounds
    cream: '#E8D5C4',       // Cream beige - subtle highlights
    burntOrange: '#D97757', // Burnt orange - CTAs and accents
    foam: '#FAF7F2',        // Soft foam - main backgrounds
    mutedGray: '#8B7E74',   // Warm gray - secondary text
    white: '#FFFFFF',
    black: '#2C1810',       // Warm black
    
    // Legacy aliases for compatibility
    teal: '#D97757',        // Maps to burntOrange for actions
    navy: '#4A2C2A',        // Maps to espresso
    coral: '#D97757',       // Maps to burntOrange for alerts
    sand: '#E8D5C4',        // Maps to cream
    offWhite: '#FAF7F2',    // Maps to foam
    caramel: '#D97757',     // Alias for burntOrange
    crema: '#E8D5C4',       // Alias for cream
    
    // Semantic Colors
    success: '#7A6F4F',     // Warm olive success
    warning: '#D9953C',     // Amber warning
    danger: '#B85A3D',      // Warm terracotta danger
    info: '#8B7355',        // Warm brown info
    
    // Status Colors
    statusLive: '#7A6F4F',      // Olive for live/active
    statusDocked: '#8B7E74',    // Muted for docked
    statusDelayed: '#D9953C',   // Amber for delayed
    statusAttention: '#D97757', // Burnt orange for attention
  },
  
  // Typography - Zus Coffee Style
  fonts: {
    base: 'Inter',          // Body and general text
    heading: 'Poppins',     // Headers and emphasis (bold, modern)
    sizes: {
      xs: 10,      // Helper text, labels
      sm: 12,      // Secondary text, timestamps
      md: 14,      // Body text
      base: 16,    // Primary body, inputs
      lg: 22,      // Section headers (H2)
      xl: 24,      // Screen titles
      xxl: 28,     // Hero headings (H1)
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
  
  // Border Radius - Larger, softer curves for modern feel
  radius: {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    full: 999,
  },
  
  // Shadows - Soft, elevated (Zus Coffee style)
  shadows: {
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      elevation: 12,
    },
  },
  
  // Web-compatible shadows (CSS box-shadow)
  webShadows: {
    sm: {
      boxShadow: '0 2px 4px rgba(75, 46, 27, 0.06)',
    },
    md: {
      boxShadow: '0 4px 8px rgba(75, 46, 27, 0.08)',
    },
    lg: {
      boxShadow: '0 8px 16px rgba(75, 46, 27, 0.1)',
    },
    xl: {
      boxShadow: '0 12px 24px rgba(75, 46, 27, 0.12)',
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
