# MarineTrack Mobile Application

**Last Updated:** November 6, 2025

## Overview
MarineTrack is a cross-platform mobile application designed for fishermen, seafarers, and small vessel operators to enhance safety, communication, and sustainable fishing at sea. Built with React Native and Expo for web, iOS, and Android platforms.

## Project Purpose
This is a **functional prototype** demonstrating the complete UI/UX flow and core features of the MarineTrack application. The app uses mock data for demonstration purposes and is ready for backend integration.

## Current State
✅ **Completed Features:**
- Ocean-themed UI design (deep navy, ocean blue, seafoam colors)
- Complete onboarding flow (3 slides)
- Authentication screens (login/register)
- Main dashboard with map placeholder and vessel tracking UI
- Weather & Navigation screen with forecast display
- SOS Emergency screen with alert functionality
- Communication/Chat screen for vessel contacts
- Settings & Profile screen with sustainable fishing tips
- Tab-based navigation with 9 main sections
- Responsive design optimized for mobile and web
- **NEW:** Comprehensive notification system with all activity types
- **NEW:** Enhanced map with safe fishing zones, restricted zones, and maritime borders
- **NEW:** Waze-like navigation features with route planning and hazard warnings
- **NEW:** Backend support for notifications, likes, comments, and nearby vessel alerts

## Architecture

### Screen Flow
```
app/
├── index.tsx                    # Entry point (redirects to onboarding)
├── onboarding.tsx              # 3-slide onboarding
├── auth/
│   ├── login.tsx               # Login screen
│   ├── register.tsx            # Registration with vessel info
│   └── _layout.tsx             # Auth navigation
└── (tabs)/
    ├── index.tsx               # Dashboard (map, vessels, weather)
    ├── weather.tsx             # Weather forecasts & alerts
    ├── sos.tsx                 # Emergency SOS
    ├── chat.tsx                # Vessel communication
    ├── settings.tsx            # Profile & settings
    └── _layout.tsx             # Tab navigation
```

### Tech Stack
- **Frontend:** React Native + Expo
- **Navigation:** Expo Router (file-based routing)
- **Styling:** StyleSheet with themed colors
- **State:** React Hooks (useState)
- **Platform:** Web (port 5000), iOS, Android

## Features

### 1. Dashboard
- Live GPS coordinates display
- Nearby vessels list with distance and status
- Weather summary (temperature, wind, waves)
- Quick action buttons (SOS, Weather, Fishing zones)

### 2. Weather & Navigation
- Current weather conditions
- Hourly forecast
- Weather alerts
- Safety tips for maritime navigation

### 3. SOS Emergency
- Large emergency button
- GPS location sharing
- Emergency contact list
- Step-by-step emergency instructions

### 4. Communication
- Vessel-to-vessel chat
- Contact list with location tracking
- Message history
- "Last seen" status

### 5. Live Vessel Map (Enhanced)
- **Safe Fishing Zones:** Green overlay showing prime fishing areas with abundant fish
- **Good Fishing Zones:** Light green areas with moderate fishing potential
- **Restricted Zones:** Red overlay marking naval areas and marine protected zones (NO ENTRY)
- **Maritime Borders:** Yellow overlay showing international boundaries
- **Interactive Zone Info:** Tap zones to see details, descriptions, and fishing potential
- **Real-time Vessel Tracking:** See all nearby vessels on the map
- **Waze-like Navigation:** Route planning with hazard detection
  - Calculates optimal routes between points
  - Detects route crossings through restricted zones
  - Shows distance, estimated time, and hazard warnings
  - Alerts if route crosses naval areas or protected zones
- **Zone Alerts:** Automatic notifications when entering restricted areas

### 6. Comprehensive Notification System
- **Push Notifications:** Full local notification support with Expo Notifications
- **Notification Types:**
  - 💬 Chat messages from other vessels
  - 🚢 Nearby vessel alerts (within 2km)
  - ❤️ Boat likes from other users
  - 💭 Comments on your boat
  - 🆘 SOS emergency alerts
  - ⛔ Restricted zone warnings
  - ✅ Safe fishing zone notifications
  - ⛈️ Weather warnings
  - ⛽ Low fuel alerts
- **Notification Features:**
  - Notification history with read/unread status
  - Time-based throttling (5-minute cooldown to prevent spam)
  - Clear all notifications
  - Tap to mark as read
  - Color-coded by type
  - Pull to refresh
- **Smart Throttling:** Prevents notification spam while still keeping you informed

### 7. Backend API Features
- Real-time vessel tracking with Socket.IO
- Chat message broadcasting
- Boat likes and comments system
- Automatic nearby vessel detection (2km radius)
- Notification broadcasting for all activities
- JSON-based data persistence
- Multi-user support

### 5. Settings & Profile
- User and vessel information
- Notification preferences
- Emergency contacts management
- Sustainable fishing tips and best practices

## Recent Changes
**November 6, 2025:**
- ✅ Added comprehensive notification system with 9 notification types
- ✅ Created EnhancedVesselMap component with maritime zone overlays
- ✅ Implemented safe fishing zones, restricted zones, and border markings
- ✅ Added Waze-like navigation with route planning and hazard detection
- ✅ Updated backend to support likes, comments, and notification broadcasting
- ✅ Added notification throttling to prevent spam (5-minute cooldown)
- ✅ Improved route calculation with 20-point sampling for accurate zone detection
- ✅ Created notifications tab with full notification history
- ✅ Added zone legend to map for easy identification

**October 30, 2025:**
- Created complete app structure with 13 screens
- Implemented ocean-themed color scheme
- Built navigation flow: onboarding → auth → main app
- Added mock data for vessels, weather, contacts
- Configured Expo web workflow on port 5000
- Fixed deprecated shadow style props

## Next Steps for Production

### Backend Integration
1. **Authentication:** Integrate Firebase Authentication or Supabase Auth
   - Implement sign-up/sign-in flows
   - Add session persistence
   - Gate tab navigation behind auth state

2. **Real-time Data:**
   - Add MapView component (react-native-maps)
   - Integrate OpenWeatherMap or StormGlass API for weather
   - Set up vessel tracking with GPS
   - Implement real-time chat with Firebase/Supabase

3. **Emergency Features:**
   - Connect SOS to Twilio for SMS alerts
   - Integrate push notifications (FCM)
   - Add offline data persistence

### Additional Features
- Fishing zone map overlays
- Route planning and navigation
- Vessel history tracking
- Multi-language support
- Offline-first data sync

## User Preferences
- Focus on maritime safety and sustainability
- Ocean-themed visual design
- Simple, intuitive interface for use at sea
- Prototype with mock data for demonstration

## Development Commands
```bash
npm start -- --web --port 5000   # Start web development server
npm run android                   # Run on Android
npm run ios                       # Run on iOS
```

## Notes
- This is a prototype with mock data - backend integration required for production
- All API integrations are placeholder UI flows
- Map component is a visual placeholder (ready for MapView integration)
- Colors defined in `constants/Colors.ts` for easy theming
