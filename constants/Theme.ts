
// MarineTrack Theme - Modern Social Media Design System
// Instagram/TikTok/Waze-Inspired Elegant & Luxurious Interface

export const Theme = {
  // Primary Colors - Social Media Inspired Vibrant Palette
  colors: {
    // Brand Colors - Modern & Vibrant
    primary: '#0095F6',        // Instagram blue - primary actions
    primaryDark: '#0074CC',    // Darker blue for pressed states
    secondary: '#FE2C55',      // TikTok pink/red - accents
    accent: '#00D9FF',         // Cyan accent - highlights
    accentGreen: '#00E676',    // Success/live green
    accentPurple: '#B75CFF',   // Premium purple
    accentOrange: '#FF6B35',   // Warning orange
    
    // Navigation Colors (Waze-inspired)
    wazeBlue: '#00AAFF',       // Primary navigation
    wazeTurquoise: '#1CE5BA',  // Route line
    wazeYellow: '#FFC107',     // Alerts
    wazeOrange: '#FF9500',     // Caution
    wazeRed: '#FF3B30',        // Danger/hazards
    
    // Neutral Grays - Clean & Modern
    black: '#000000',
    gray1: '#0A0A0A',          // Almost black
    gray2: '#1A1A1A',          // Dark card background
    gray3: '#262626',          // Elevated dark
    gray4: '#3F3F3F',          // Border dark
    gray5: '#737373',          // Mid gray
    gray6: '#A3A3A3',          // Secondary text
    gray7: '#D4D4D4',          // Tertiary text
    gray8: '#E5E5E5',          // Separator
    gray9: '#F5F5F5',          // Background light
    gray10: '#FAFAFA',         // Card light
    white: '#FFFFFF',
    
    // Light Mode - Instagram/TikTok Style
    lightBackground: '#FFFFFF',     // Pure white like Instagram
    lightCard: '#FFFFFF',
    lightBorder: '#DBDBDB',         // Instagram border
    lightText: '#262626',           // Instagram text
    lightSecondary: '#8E8E8E',      // Secondary text
    lightTertiary: '#C7C7C7',
    lightHover: '#FAFAFA',          // Hover states
    
    // Dark Mode - TikTok/Instagram Dark Style
    darkBackground: '#000000',      // Pure black
    darkCard: '#121212',            // Card background
    darkElevated: '#1A1A1A',        // Elevated cards
    darkBorder: '#262626',          // Dark borders
    darkText: '#FFFFFF',
    darkSecondary: '#A8A8A8',
    darkTertiary: '#737373',
    
    // Semantic Colors
    success: '#00E676',        // Bright success green
    warning: '#FFC107',        // Amber warning
    danger: '#FF3B30',         // Red danger
    info: '#00AAFF',          // Blue info
    
    // Status Colors
    statusLive: '#00E676',     // Live/online - bright green
    statusActive: '#00AAFF',   // Active - blue
    statusDocked: '#8E8E8E',   // Inactive - gray
    statusDelayed: '#FFC107',  // Delayed - amber
    statusWarning: '#FF9500',  // Warning - orange
    statusDanger: '#FF3B30',   // Danger - red
    
    // Overlay & Glassmorphism
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
    overlayDark: 'rgba(0, 0, 0, 0.7)',
    glass: 'rgba(255, 255, 255, 0.1)',
    glassDark: 'rgba(0, 0, 0, 0.3)',
    
    // Legacy compatibility
    espresso: '#1C1C1E',
    teal: '#00AAFF',
    navy: '#000000',
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
  
  // Spacing - Social Media Tight & Clean Grid (4px base)
  spacing: {
    xxs: 2,      // Micro spacing
    xs: 4,       // Extra small gaps
    sm: 8,       // Small spacing (Instagram style)
    md: 12,      // Medium spacing
    base: 16,    // Base unit
    lg: 20,      // Large spacing
    xl: 24,      // Extra large
    xxl: 32,     // Section spacing
    xxxl: 48,    // Hero spacing
    huge: 64,    // Large section spacing
    card: 12,    // Card padding (tighter like Instagram)
    drawer: 16,  // Drawer horizontal padding
    screen: 16,  // Screen horizontal padding
  },
  
  // Border Radius - Modern Social Media Rounded Corners
  radius: {
    none: 0,     // Sharp edges
    xs: 4,       // Tiny elements
    sm: 8,       // Small buttons, chips
    md: 12,      // Standard cards (Instagram style)
    lg: 16,      // Large cards
    xl: 20,      // Hero elements
    xxl: 24,     // Extra large cards
    full: 9999,  // Circular/pill shape
    pill: 9999,  // Pill shape
    round: 9999, // Round buttons
    search: 8,   // Search bars (Instagram uses less rounded)
    button: 8,   // Standard button radius
    card: 12,    // Card radius
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
