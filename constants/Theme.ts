
// MarineTrack Theme - iOS-Inspired Elegant Design System
// Modern, posh, and stylishly luxurious maritime interface

export const Theme = {
  // Primary Colors - iOS-Inspired Palette
  colors: {
    // iOS System Colors
    iosBlue: '#007AFF',      // Primary blue - actions, links, highlights
    iosGreen: '#34C759',     // Success green
    iosOrange: '#FF9500',    // Warning orange
    iosRed: '#FF3B30',       // Danger red
    iosPurple: '#AF52DE',    // Accent purple
    iosTeal: '#5AC8FA',      // Info teal
    
    // Neutral Grays - Light Mode
    black: '#000000',
    gray1: '#1C1C1E',        // Dark elements
    gray2: '#2C2C2E',        // Elevated dark
    gray3: '#3A3A3C',        // Tertiary dark
    gray4: '#48484A',        // Secondary dark
    gray5: '#636366',        // Mid gray
    gray6: '#8E8E93',        // Secondary text
    gray7: '#AEAEB2',        // Tertiary text
    gray8: '#C7C7CC',        // Separator light
    gray9: '#D1D1D6',        // Border light
    gray10: '#E5E5EA',       // Fill light
    gray11: '#F2F2F7',       // Background light
    white: '#FFFFFF',
    
    // Light Mode Specific
    lightBackground: '#F2F2F7',
    lightCard: '#FFFFFF',
    lightText: '#000000',
    lightSecondary: '#6C6C70',
    lightTertiary: '#8E8E93',
    lightBorder: '#E5E5EA',
    
    // Dark Mode Specific
    darkBackground: '#000000',
    darkCard: '#1C1C1E',
    darkText: '#FFFFFF',
    darkSecondary: '#8E8E93',
    darkTertiary: '#6C6C70',
    darkBorder: '#38383A',
    
    // Semantic Colors (iOS-style)
    success: '#34C759',
    warning: '#FF9500',
    danger: '#FF3B30',
    info: '#007AFF',
    
    // Status Colors (Maritime-specific)
    statusLive: '#34C759',
    statusDocked: '#8E8E93',
    statusDelayed: '#FF9500',
    statusAttention: '#FF3B30',
    
    // Legacy compatibility
    espresso: '#1C1C1E',
    teal: '#007AFF',
    navy: '#1C1C1E',
    coral: '#FF3B30',
  },
  
  // Typography - iOS San Francisco Pro Style
  fonts: {
    base: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    sizes: {
      xs: 10,      // Tiny labels, captions
      sm: 12,      // Secondary text, badges, timestamps
      md: 14,      // Body text, labels
      base: 16,    // Primary body, inputs
      lg: 18,      // Section titles
      xl: 20,      // Screen headers
      xxl: 24,     // Large titles
      xxxl: 28,    // Hero headings
      huge: 34,    // Large display
    },
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
      heavy: '800' as const,
    },
    lineHeights: {
      tight: 1.2,     // Headings, titles
      normal: 1.5,    // Body text, comfortable reading
      relaxed: 1.75,  // Long-form content
    },
  },
  
  // Spacing (iOS-style 8px baseline grid)
  spacing: {
    xxs: 2,      // Micro spacing
    xs: 4,       // Extra small gaps
    sm: 8,       // Small spacing
    md: 12,      // Medium spacing
    base: 16,    // Base unit (iOS standard)
    lg: 20,      // Large spacing
    xl: 24,      // Extra large
    xxl: 32,     // Double extra large
    xxxl: 40,    // Hero spacing
    huge: 48,    // Section spacing
    card: 16,    // Card padding
    drawer: 20,  // Drawer horizontal padding
  },
  
  // Border Radius - iOS-style rounded corners
  radius: {
    xs: 8,       // Small elements
    sm: 12,      // Cards, buttons
    md: 16,      // Standard cards
    lg: 20,      // Large cards
    xl: 24,      // Hero elements
    xxl: 28,     // Extra large cards
    full: 999,   // Circular/pill shape
    pill: 999,   // Pill shape
    search: 999, // Search bars
  },
  
  // Shadows - iOS-style subtle elevations
  shadows: {
    none: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 12,
    },
  },
  
  // Web-compatible shadows (CSS box-shadow)
  webShadows: {
    none: {
      boxShadow: 'none',
    },
    sm: {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    },
    md: {
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
    lg: {
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
    },
    xl: {
      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2)',
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
