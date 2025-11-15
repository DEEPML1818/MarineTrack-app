import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Platform, TouchableOpacity, TextInput, Alert, ScrollView, Keyboard } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';
import { BottomSheet } from '@/components/redesign/BottomSheet';
import { MapBottomDrawer } from '@/components/redesign/MapBottomDrawer';
import { FloatingControlsStack } from '@/components/redesign/FloatingControlsStack';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { StatChip } from '@/components/redesign/StatChip';
import { QuickActionTile } from '@/components/redesign/QuickActionTile';
import { WeatherWidget } from '@/components/redesign/WeatherWidget';
import { Card } from '@/components/redesign/Card';
import { SectionHeader } from '@/components/redesign/SectionHeader';
import { getNearbyTrackedVessels } from '@/utils/trackingService';
import { getCurrentWeather } from '@/utils/maritimeIntelligence';
import { getNearbyHazards } from '@/utils/maritimeIntelligence';
import { useRouter } from 'expo-router';
import { Text } from 'react-native';

// Port database
const PORTS_DATABASE = [
  { id: '1', name: 'Port of Singapore', lat: 1.2644, lng: 103.8221, country: 'Singapore' },
  { id: '2', name: 'Port of Shanghai', lat: 31.2304, lng: 121.4737, country: 'China' },
  { id: '3', name: 'Port of Rotterdam', lat: 51.9244, lng: 4.4777, country: 'Netherlands' },
  { id: '4', name: 'Port of Hong Kong', lat: 22.3193, lng: 114.1694, country: 'Hong Kong' },
  { id: '5', name: 'Port of Chennai', lat: 13.0827, lng: 80.2707, country: 'India' },
  { id: '6', name: 'Port of New York', lat: 40.6643, lng: -74.0395, country: 'USA' },
  { id: '7', name: 'Port of Los Angeles', lat: 33.7405, lng: -118.2719, country: 'USA' },
  { id: '8', name: 'Port of Dubai', lat: 25.2854, lng: 55.3607, country: 'UAE' },
];

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function MapScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [vessels, setVessels] = useState<any[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [hazards, setHazards] = useState<any[]>([]);
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [speedLimit, setSpeedLimit] = useState<number>(20); // Default maritime speed limit in knots
  const [showHazardReport, setShowHazardReport] = useState(false);
  const [hazardType, setHazardType] = useState<string>('');
  const [hazardDescription, setHazardDescription] = useState<string>('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchMode, setSearchMode] = useState<'port' | 'coords'>('port');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [destination, setDestination] = useState<{ lat: number; lng: number } | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; time: number; eta: string } | null>(null);
  const [directions, setDirections] = useState<any[]>([]);
  const [currentDirectionIndex, setCurrentDirectionIndex] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [alternateRoutes, setAlternateRoutes] = useState<any[]>([]);
  const [showRouteOptions, setShowRouteOptions] = useState(false);
  const [portActivity, setPortActivity] = useState<any[]>([]);
  const webViewRef = useRef<WebView>(null);
  const mapRef = useRef<any>(null); // Ref for the map component if it were a native map
  const [drawerOpen, setDrawerOpen] = useState(false); // State to control bottom drawer
  const [selectedVessel, setSelectedVessel] = useState<any>(null); // State for selected vessel

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (currentLocation) {
      loadData();
      
      // Auto-refresh nearby vessels every 5 seconds
      const vesselInterval = setInterval(() => {
        loadData();
      }, 5000);
      
      // Update ETA if navigating
      if (destination) {
        calculateRoute(destination);
      }
      
      return () => clearInterval(vesselInterval);
    }
  }, [currentLocation]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        // Watch position for continuous speed updates
        await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000,
            distanceInterval: 1,
          },
          (location) => {
            setCurrentLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });
            // Speed in m/s, convert to knots (1 m/s = 1.94384 knots)
            const speedInKnots = (location.coords.speed || 0) * 1.94384;
            setCurrentSpeed(speedInKnots);
            
            // Update speed limit based on zone (placeholder - you can enhance with real zone data)
            if (speedInKnots > speedLimit) {
              console.warn('Speed limit exceeded!');
            }
          }
        );
      } else {
        // Default location if permission denied
        setCurrentLocation({
          latitude: 13.05,
          longitude: 80.25,
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setCurrentLocation({
        latitude: 13.05,
        longitude: 80.25,
      });
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (searchMode === 'port' && text.length > 1) {
      const filtered = PORTS_DATABASE.filter(port =>
        port.name.toLowerCase().includes(text.toLowerCase()) ||
        port.country.toLowerCase().includes(text.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const selectPort = (port: any) => {
    setDestination({ lat: port.lat, lng: port.lng });
    setSearchQuery(port.name);
    setSearchResults([]);
    Keyboard.dismiss();
    calculateRoute({ lat: port.lat, lng: port.lng });
  };

  const handleCoordinatesGo = () => {
    const coords = searchQuery.split(',').map(c => parseFloat(c.trim()));
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      const dest = { lat: coords[0], lng: coords[1] };
      setDestination(dest);
      Keyboard.dismiss();
      calculateRoute(dest);
    } else {
      Alert.alert('Invalid Coordinates', 'Please enter valid latitude, longitude (e.g., 13.08, 80.27)');
    }
  };

  const calculateRoute = async (dest: { lat: number; lng: number }) => {
    if (!currentLocation) return;

    const R = 6371; // Earth's radius in km
    const dLat = (dest.lat - currentLocation.latitude) * Math.PI / 180;
    const dLng = (dest.lng - currentLocation.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(currentLocation.latitude * Math.PI / 180) * Math.cos(dest.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    const speed = currentSpeed > 0 ? currentSpeed : 20; // Use current speed or default 20 knots
    const time = (distance / (speed * 1.852)) * 60; // Convert knots to km/h and calculate time
    
    const eta = new Date(Date.now() + time * 60 * 1000).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    setRouteInfo({ distance, time, eta });
    
    // Generate directions
    const { generateNauticalDirections } = await import('@/utils/nauticalDirections');
    const nauticalDirections = generateNauticalDirections(
      { lat: currentLocation.latitude, lng: currentLocation.longitude },
      dest
    );
    setDirections(nauticalDirections);
    setCurrentDirectionIndex(0);
    
    // Announce first direction
    if (voiceEnabled && nauticalDirections.length > 0) {
      speakDirection(nauticalDirections[0].instruction);
    }
  };

  const speakDirection = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const cancelNavigation = () => {
    setDestination(null);
    setRouteInfo(null);
    setSearchQuery('');
    setShowSearch(false);
  };

  const submitHazardReport = async () => {
    if (!currentLocation || !hazardType || !hazardDescription) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';
      await fetch(`${BACKEND_URL}/api/hazards/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: hazardType,
          description: hazardDescription,
          lat: currentLocation.latitude,
          lng: currentLocation.longitude,
          severity: 'medium',
          timestamp: new Date().toISOString(),
        }),
      });

      Alert.alert('Success', 'Hazard reported successfully');
      setShowHazardReport(false);
      setHazardType('');
      setHazardDescription('');
      loadData();
    } catch (error) {
      console.error('Error reporting hazard:', error);
      Alert.alert('Error', 'Failed to report hazard');
    }
  };

  const loadData = async () => {
    if (!currentLocation) return;

    try {
      const [nearbyVessels, weatherData, hazardData] = await Promise.all([
        getNearbyTrackedVessels(currentLocation.latitude, currentLocation.longitude, 10),
        getCurrentWeather(currentLocation.latitude, currentLocation.longitude),
        getNearbyHazards(currentLocation.latitude, currentLocation.longitude, 50),
      ]);

      setVessels(nearbyVessels);
      setWeather(weatherData);
      setHazards(hazardData);
      
      // Load port activity
      try {
        const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';
        const portResponse = await fetch(`${BACKEND_URL}/api/ports/search?query=`);
        if (portResponse.ok) {
          const ports = await portResponse.json();
          setPortActivity(ports.slice(0, 5));
        }
      } catch (error) {
        console.log('Port activity not available');
      }
      
      // Generate alternate routes if destination is set
      if (destination) {
        const { generateAlternateRoutes } = await import('@/utils/routeAlternatives');
        const routes = await generateAlternateRoutes(
          { lat: currentLocation.latitude, lng: currentLocation.longitude },
          destination,
          hazardData
        );
        setAlternateRoutes(routes);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const quickActions = [
    { id: '1', icon: 'cloud.fill', label: 'Weather', color: Theme.colors.iosOrange, route: '/weather' },
    { id: '2', icon: 'exclamationmark.triangle.fill', label: 'SOS', color: Theme.colors.iosRed, route: '/sos' },
    { id: '3', icon: 'anchor.fill', label: 'Ports', color: Theme.colors.iosPurple, route: '/ports' },
    { id: '4', icon: 'bell.fill', label: 'Alerts', color: Theme.colors.iosTeal, route: '/notifications' },
  ];

  const defaultLat = currentLocation?.latitude || 13.05;
  const defaultLng = currentLocation?.longitude || 80.25;

  const escapeHtml = (text: string): string => {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };

  const vesselsMarkersHTML = vessels.map(v => {
    const heading = v.location?.heading || 0;
    const speedColor = v.location?.speed && v.location.speed > 10 ? '#ef4444' : '#22c55e';
    const name = escapeHtml(v.vesselInfo?.vesselName || 'Unknown');
    return `
      L.marker([${v.location?.lat || 0}, ${v.location?.lng || 0}], {
        icon: L.divIcon({
          html: '<div style="transform: rotate(${heading}deg); font-size: 24px;">⛵</div>',
          className: 'vessel-marker',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        })
      }).addTo(map).bindPopup('<b>${name}</b><br>Speed: ${v.location?.speed?.toFixed(1) || 0} kn');
    `;
  }).join('\n');

  const userMarkerHTML = currentLocation ? `
    L.marker([${currentLocation.latitude}, ${currentLocation.longitude}], {
      icon: L.divIcon({
        html: '<div style="width: 20px; height: 20px; background: #3da9fc; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(61, 169, 252, 0.6);"></div>',
        className: 'user-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      })
    }).addTo(map);
  ` : '';

  const routeHTML = destination && currentLocation ? `
    L.polyline([
      [${currentLocation.latitude}, ${currentLocation.longitude}],
      [${destination.lat}, ${destination.lng}]
    ], {
      color: '#007AFF',
      weight: 4,
      opacity: 0.7,
      dashArray: '10, 5'
    }).addTo(map);

    L.marker([${destination.lat}, ${destination.lng}], {
      icon: L.divIcon({
        html: '<div style="background: #34C759; color: white; padding: 8px 12px; border-radius: 8px; font-weight: bold; box-shadow: 0 2px 8px rgba(52, 199, 89, 0.6);">🎯 Destination</div>',
        className: 'destination-marker',
        iconSize: [null, null]
      })
    }).addTo(map);

    map.fitBounds([
      [${currentLocation.latitude}, ${currentLocation.longitude}],
      [${destination.lat}, ${destination.lng}]
    ], { padding: [50, 50] });
  ` : '';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; background: #1a1a2e; }
        #map { width: 100%; height: 100vh; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', {
          zoomControl: true,
          attributionControl: false
        }).setView([${defaultLat}, ${defaultLng}], 12);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 20,
          minZoom: 3
        }).addTo(map);

        ${userMarkerHTML}
        ${vesselsMarkersHTML}
        ${routeHTML}
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <View style={[styles.webMapPlaceholder, { backgroundColor: colors.background }]}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🗺️</Text>
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>
            Interactive Map
          </Text>
          <Text style={{ fontSize: 14, color: colors.secondaryText, marginTop: 8 }}>
            Pull up the drawer to access features
          </Text>
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ html: htmlContent }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      )}

      {/* Route Options Modal */}
      {showRouteOptions && (
        <View style={[styles.hazardModal, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[styles.hazardModalContent, { backgroundColor: colors.background }]}>
            <View style={styles.hazardModalHeader}>
              <Text style={[styles.hazardModalTitle, { color: colors.text }]}>Route Options</Text>
              <TouchableOpacity onPress={() => setShowRouteOptions(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.secondaryText} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.routeList}>
              {alternateRoutes.map((route) => (
                <TouchableOpacity
                  key={route.id}
                  style={[styles.routeOption, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setShowRouteOptions(false);
                    // Apply selected route
                  }}
                >
                  <View style={styles.routeHeader}>
                    <Text style={[styles.routeName, { color: colors.text }]}>{route.name}</Text>
                    <View style={[styles.safetyBadge, { 
                      backgroundColor: route.safetyScore > 80 ? '#34C75920' : route.safetyScore > 60 ? '#FF950020' : '#FF3B3020' 
                    }]}>
                      <Text style={[styles.safetyScore, { 
                        color: route.safetyScore > 80 ? '#34C759' : route.safetyScore > 60 ? '#FF9500' : '#FF3B30' 
                      }]}>
                        {route.safetyScore}%
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.routeDescription, { color: colors.secondaryText }]}>{route.description}</Text>
                  <View style={styles.routeMetrics}>
                    <Text style={[styles.routeMetric, { color: colors.secondaryText }]}>
                      {route.distance.toFixed(1)} nm • {route.duration.toFixed(0)} min • ETA {route.eta}
                    </Text>
                    {route.hazardCount > 0 && (
                      <Text style={[styles.hazardWarning, { color: Theme.colors.iosOrange }]}>
                        ⚠️ {route.hazardCount} hazard{route.hazardCount > 1 ? 's' : ''}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 16 }]}>Nearby Port Activity</Text>
            <ScrollView style={styles.portActivityList}>
              {portActivity.map((port, idx) => (
                <View key={idx} style={[styles.portItem, { borderBottomColor: colors.border }]}>
                  <IconSymbol name="anchor.fill" size={20} color={Theme.colors.iosBlue} />
                  <View style={styles.portInfo}>
                    <Text style={[styles.portName, { color: colors.text }]}>{port.name}</Text>
                    <Text style={[styles.portCountry, { color: colors.secondaryText }]}>{port.country}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Hazard Report Modal */}
      {showHazardReport && (
        <View style={[styles.hazardModal, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[styles.hazardModalContent, { backgroundColor: colors.background }]}>
            <View style={styles.hazardModalHeader}>
              <Text style={[styles.hazardModalTitle, { color: colors.text }]}>Report Hazard</Text>
              <TouchableOpacity onPress={() => setShowHazardReport(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.secondaryText} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.hazardLabel, { color: colors.text }]}>Hazard Type</Text>
            <View style={styles.hazardTypeGrid}>
              {['debris', 'weather', 'wildlife', 'other'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.hazardTypeButton,
                    { 
                      backgroundColor: hazardType === type ? Theme.colors.iosBlue : (isDark ? '#2C2C2E' : '#F2F2F7'),
                      borderColor: hazardType === type ? Theme.colors.iosBlue : 'transparent',
                    }
                  ]}
                  onPress={() => setHazardType(type)}
                >
                  <Text style={[
                    styles.hazardTypeText,
                    { color: hazardType === type ? '#FFFFFF' : colors.text }
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.hazardLabel, { color: colors.text }]}>Description</Text>
            <TextInput
              style={[styles.hazardInput, { 
                backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                color: colors.text,
              }]}
              placeholder="Describe the hazard..."
              placeholderTextColor={colors.secondaryText}
              multiline
              numberOfLines={4}
              value={hazardDescription}
              onChangeText={setHazardDescription}
            />

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: Theme.colors.iosBlue }]}
              onPress={submitHazardReport}
            >
              <Text style={styles.submitButtonText}>Submit Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FloatingControlsStack 
        onLocationPress={getCurrentLocation}
      />

      {/* Bottom Sheet for drawer content */}
      <BottomSheet 
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        snapPoints={[SCREEN_HEIGHT * 0.25, SCREEN_HEIGHT * 0.75]} // Example snap points
      >
        <View style={styles.sheetContent}>
          <View style={styles.drawerTopControls}>
            <View style={[styles.searchBar, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
              <IconSymbol name="magnifyingglass" size={20} color={colors.secondaryText} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder={searchMode === 'port' ? 'Search ports...' : 'Lat, Lng (e.g., 13.08, 80.27)'}
                placeholderTextColor={colors.secondaryText}
                value={searchQuery}
                onChangeText={handleSearch}
              />
              {searchMode === 'coords' && searchQuery.length > 0 && (
                <TouchableOpacity onPress={handleCoordinatesGo} style={styles.goButton}>
                  <Text style={styles.goButtonText}>Go</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.controlsRow}>
              <TouchableOpacity
                style={[styles.modeButton, searchMode === 'port' && { backgroundColor: Theme.colors.iosBlue }]}
                onPress={() => { setSearchMode('port'); setSearchQuery(''); setSearchResults([]); }}
              >
                <Text style={[styles.modeText, searchMode === 'port' && { color: '#FFFFFF' }]}>Port</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, searchMode === 'coords' && { backgroundColor: Theme.colors.iosBlue }]}
                onPress={() => { setSearchMode('coords'); setSearchQuery(''); setSearchResults([]); }}
              >
                <Text style={[styles.modeText, searchMode === 'coords' && { color: '#FFFFFF' }]}>Coordinates</Text>
              </TouchableOpacity>

              {/* Hazard Report Button */}
              <TouchableOpacity
                style={[styles.hazardButton, { backgroundColor: Theme.colors.iosRed }]}
                onPress={() => setShowHazardReport(true)}
              >
                <IconSymbol name="exclamationmark.triangle.fill" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Speed HUD */}
          <View style={[styles.speedContainer, { backgroundColor: currentSpeed > speedLimit ? Theme.colors.iosRed : Theme.colors.iosBlue }]}>
            <Text style={styles.speedValue}>{currentSpeed.toFixed(1)}</Text>
            <Text style={styles.speedUnit}>kn</Text>
            <Text style={styles.speedLimit}>Limit: {speedLimit} kn</Text>
          </View>

          {/* Enhanced Navigation Info Bar */}
            {destination && routeInfo && (
              <View style={[styles.navBar, { backgroundColor: Theme.colors.iosBlue }]}>
                <View style={styles.navInfo}>
                  <Text style={styles.navLabel}>Distance</Text>
                  <Text style={styles.navValue}>{routeInfo.distance.toFixed(1)} nm</Text>
                </View>
                <View style={styles.navInfo}>
                  <Text style={styles.navLabel}>ETA</Text>
                  <Text style={styles.navValue}>{routeInfo.eta}</Text>
                </View>
                <View style={styles.navInfo}>
                  <Text style={styles.navLabel}>Time</Text>
                  <Text style={styles.navValue}>{routeInfo.time.toFixed(0)} min</Text>
                </View>
                <TouchableOpacity onPress={() => setShowRouteOptions(true)} style={styles.routeOptionsBtn}>
                  <IconSymbol name="map.fill" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={cancelNavigation} style={styles.cancelNav}>
                  <IconSymbol name="xmark.circle.fill" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}

            {/* Current Direction Card */}
            {directions.length > 0 && currentDirectionIndex < directions.length && (
              <View style={[styles.directionCard, { backgroundColor: colors.card }]}>
                <View style={styles.directionHeader}>
                  <IconSymbol 
                    name={directions[currentDirectionIndex].maneuver === 'port' ? 'arrow.left' : directions[currentDirectionIndex].maneuver === 'starboard' ? 'arrow.right' : 'arrow.up'} 
                    size={32} 
                    color={Theme.colors.iosBlue} 
                  />
                  <View style={styles.directionInfo}>
                    <Text style={[styles.directionDistance, { color: colors.text }]}>
                      {directions[currentDirectionIndex].distance.toFixed(1)} nm
                    </Text>
                    <Text style={[styles.directionInstruction, { color: colors.text }]}>
                      {directions[currentDirectionIndex].instruction}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setVoiceEnabled(!voiceEnabled)}>
                    <IconSymbol name={voiceEnabled ? 'speaker.wave.2.fill' : 'speaker.slash.fill'} size={24} color={colors.icon} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {searchResults.length > 0 && (
            <ScrollView style={styles.searchResults} keyboardShouldPersistTaps="handled">
              {searchResults.map((port) => (
                <TouchableOpacity
                  key={port.id}
                  style={[styles.resultItem, { borderBottomColor: colors.border }]}
                  onPress={() => selectPort(port)}
                >
                  <IconSymbol name="location.fill" size={20} color={Theme.colors.iosBlue} />
                  <View style={styles.resultInfo}>
                    <Text style={[styles.resultName, { color: colors.text }]}>{port.name}</Text>
                    <Text style={[styles.resultCountry, { color: colors.secondaryText }]}>{port.country}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <Text style={[styles.welcomeTitle, { color: colors.text }]}>
            Welcome back, Captain
          </Text>
          <Text style={[styles.welcomeDate, { color: colors.secondaryText }]}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>

          {weather && (
            <View style={styles.weatherContainer}>
              <WeatherWidget
                temperature={`${weather.temperature}°F`}
                condition="Sunny"
                emoji="☀️"
                subtitle="Perfect for sailing!"
              />
            </View>
          )}

          <View style={styles.statsRow}>
            <StatChip value={vessels.length.toString()} label={`Nearby\nVessels`} color="#007AFF" />
            <StatChip value={hazards.length.toString()} label={`Active\nHazards`} color="#FF9500" />
            <StatChip value={weather ? `${weather.windSpeed}kn` : '--'} label={`Wind\nSpeed`} color="#34C759" />
          </View>

          <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>
            Quick Actions
          </Text>

          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <QuickActionTile
                key={action.id}
                icon={action.icon}
                label={action.label}
                color={action.color}
                onPress={() => action.route && router.push(action.route as any)}
              />
            ))}
          </View>

          {vessels.length > 0 && (
            <View style={styles.section}>
              <SectionHeader
                title="Nearby Vessels"
                actionText="View All"
                onActionPress={() => router.push('/tracker')}
              />
              {vessels.slice(0, 3).map((vessel, index) => (
                <Card key={index} style={styles.vesselCard}>
                  <View style={styles.vesselHeader}>
                    <Text style={[styles.vesselName, { color: colors.text }]}>
                      {vessel.vesselInfo?.vesselName || 'Unknown Vessel'}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: '#34C75920' }]}>
                      <Text style={[styles.statusBadgeText, { color: '#34C759' }]}>Live</Text>
                    </View>
                  </View>
                  <Text style={[styles.vesselType, { color: colors.secondaryText }]}>
                    {vessel.vesselInfo?.vesselType || 'Vessel'}
                  </Text>
                  <View style={styles.vesselMeta}>
                    <View style={styles.vesselMetaItem}>
                      <IconSymbol name="location.fill" size={14} color={colors.primary} />
                      <Text style={[styles.vesselMetaText, { color: colors.secondaryText }]}>
                        {vessel.distance ? `${vessel.distance.toFixed(1)} km` : 'Nearby'}
                      </Text>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}

          <View style={styles.bottomSpacing} />
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  webMapPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  // Styles for FloatingControlsStack
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end', // Align map content to the bottom by default
  },
  // Search and Navigation controls moved into BottomSheet
  searchContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    borderRadius: 16,
    padding: 16,
    ...Theme.shadows.lg,
    zIndex: 100,
  },
  searchModeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 4,
    marginBottom: 12,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  modeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  goButton: {
    backgroundColor: Theme.colors.iosBlue,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  goButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  searchResults: {
    marginTop: 12,
    maxHeight: 200,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultCountry: {
    fontSize: 14,
    marginTop: 2,
  },
  navBar: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    ...Theme.shadows.lg,
    zIndex: 100,
  },
  navInfo: {
    flex: 1,
    alignItems: 'center',
  },
  navLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
  },
  navValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  cancelNav: {
    marginLeft: 12,
  },
  speedHUD: {
    position: 'absolute',
    bottom: 140,
    left: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    ...Theme.shadows.lg,
    zIndex: 10,
  },
  speedValue: {
    fontSize: 32,
    fontWeight: Theme.fonts.weights.bold,
  },
  speedUnit: {
    fontSize: 14,
    fontWeight: Theme.fonts.weights.medium,
    marginTop: -4,
  },
  hazardButton: {
    position: 'absolute',
    bottom: 140,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.lg,
    zIndex: 10,
  },
  hazardModal: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  hazardModalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    ...Theme.shadows.xl,
  },
  hazardModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  hazardModalTitle: {
    fontSize: 24,
    fontWeight: Theme.fonts.weights.bold,
  },
  hazardLabel: {
    fontSize: 16,
    fontWeight: Theme.fonts.weights.semibold,
    marginBottom: 12,
    marginTop: 16,
  },
  hazardTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  hazardTypeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  hazardTypeText: {
    fontSize: 14,
    fontWeight: Theme.fonts.weights.semibold,
  },
  hazardInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  submitButton: {
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: Theme.fonts.weights.bold,
  },
  // Styles for controls within the BottomSheet
  sheetContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
  },
  drawerTopControls: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
    ...Theme.shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  speedHUD: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    ...Theme.shadows.lg,
  },
  speedValue: {
    fontSize: 32,
    fontWeight: Theme.fonts.weights.bold,
  },
  speedUnit: {
    fontSize: 14,
    fontWeight: Theme.fonts.weights.medium,
    marginTop: -4,
  },
  hazardButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.lg,
  },
  welcomeTitle: {
    fontSize: Theme.fonts.sizes.xxl,
    fontWeight: Theme.fonts.weights.bold,
    marginBottom: Theme.spacing.xs,
  },
  welcomeDate: {
    fontSize: Theme.fonts.sizes.base,
    marginBottom: Theme.spacing.lg,
  },
  weatherContainer: {
    marginBottom: Theme.spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: Theme.fonts.sizes.base,
    marginBottom: Theme.spacing.base,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  section: {
    marginBottom: Theme.spacing.xl,
  },
  vesselCard: {
    marginBottom: Theme.spacing.md,
  },
  vesselHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  vesselName: {
    fontSize: Theme.fonts.sizes.base,
    fontWeight: Theme.fonts.weights.semibold,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.radius.sm,
  },
  statusBadgeText: {
    fontSize: Theme.fonts.sizes.sm,
    fontWeight: Theme.fonts.weights.semibold,
  },
  vesselType: {
    fontSize: Theme.fonts.sizes.md,
    marginBottom: Theme.spacing.md,
  },
  vesselMeta: {
    flexDirection: 'row',
    gap: Theme.spacing.lg,
  },
  vesselMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  vesselMetaText: {
    fontSize: Theme.fonts.sizes.md,
  },
  bottomSpacing: {
    height: 100,
  },
  speedContainer: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    ...Theme.shadows.md,
  },
  speedValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  speedUnit: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: -8,
  },
  speedLimit: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  directionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...Theme.shadows.md,
  },
  directionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  directionInfo: {
    flex: 1,
  },
  directionDistance: {
    fontSize: 24,
    fontWeight: '700',
  },
  directionInstruction: {
    fontSize: 14,
    marginTop: 4,
  },
  routeOptionsBtn: {
    marginLeft: 8,
  },
  routeList: {
    maxHeight: 300,
  },
  routeOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  routeName: {
    fontSize: 18,
    fontWeight: '600',
  },
  safetyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  safetyScore: {
    fontSize: 14,
    fontWeight: '600',
  },
  routeDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  routeMetrics: {
    gap: 4,
  },
  routeMetric: {
    fontSize: 12,
  },
  hazardWarning: {
    fontSize: 12,
    fontWeight: '600',
  },
  portActivityList: {
    maxHeight: 150,
  },
  portItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  portInfo: {
    flex: 1,
  },
  portName: {
    fontSize: 14,
    fontWeight: '600',
  },
  portCountry: {
    fontSize: 12,
    marginTop: 2,
  },
});