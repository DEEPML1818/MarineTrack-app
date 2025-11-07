import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { 
  reportHazard, 
  getNearbyHazards, 
  voteHazard,
  reportTraffic,
  calculateIntelligentRoute,
  getHazardIcon,
  getSeverityColor,
  type MaritimeHazard 
} from '@/utils/maritimeIntelligence';

interface WazeVesselMapProps {
  userLocation: { lat: number; lng: number } | null;
  vessels?: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
  }>;
  height?: number;
}

interface RouteSegment {
  lat: number;
  lng: number;
  instruction?: string;
  maneuver?: string;
  distance?: number;
  heading?: number;
}

interface NavigationState {
  currentSegmentIndex: number;
  distanceToNext: number;
  timeToNext: number;
  heading: number;
  speed: number;
}

export default function WazeVesselMap({ userLocation, vessels = [], height = 500 }: WazeVesselMapProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [destination, setDestination] = useState<{ lat: number; lng: number } | null>(null);
  const [destinationInput, setDestinationInput] = useState('');
  const [currentRoute, setCurrentRoute] = useState<RouteSegment[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentSegmentIndex: 0,
    distanceToNext: 0,
    timeToNext: 0,
    heading: 0,
    speed: 0
  });

  const [hazards, setHazards] = useState<MaritimeHazard[]>([]);
  const [showHazardReport, setShowHazardReport] = useState(false);
  const [showRouteOptions, setShowRouteOptions] = useState(false);
  const [alternativeRoutes, setAlternativeRoutes] = useState<any[]>([]);
  const [routeMetrics, setRouteMetrics] = useState({
    distance: 0,
    duration: 0,
    fuel: 0,
    safetyScore: 100,
    trafficDensity: 'low' as 'low' | 'medium' | 'high' | 'critical'
  });

  const [inputMode, setInputMode] = useState<'port' | 'coords'>('port');
  const [portSearchResults, setPortSearchResults] = useState<any[]>([]);
  const [showPortSuggestions, setShowPortSuggestions] = useState(false);
  const [selectedPort, setSelectedPort] = useState<any>(null);

  const webViewRef = useRef<WebView>(null);

  // Load hazards
  useEffect(() => {
    const loadHazards = async () => {
      if (!userLocation) return;
      const nearbyHazards = await getNearbyHazards(userLocation.lat, userLocation.lng, 100);
      setHazards(nearbyHazards);
    };

    loadHazards();
    const interval = setInterval(loadHazards, 120000);
    return () => clearInterval(interval);
  }, [userLocation]);

  // Search ports when user types
  useEffect(() => {
    const searchPorts = async () => {
      if (inputMode !== 'port' || destinationInput.length < 2) {
        setPortSearchResults([]);
        setShowPortSuggestions(false);
        return;
      }

      try {
        const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';
        const response = await fetch(`${BACKEND_URL}/api/ports/search?query=${encodeURIComponent(destinationInput)}`);
        const results = await response.json();
        setPortSearchResults(results);
        setShowPortSuggestions(results.length > 0);
      } catch (error) {
        console.error('Port search error:', error);
        setPortSearchResults([]);
      }
    };

    const debounce = setTimeout(searchPorts, 300);
    return () => clearTimeout(debounce);
  }, [destinationInput, inputMode]);

  // Update navigation state
  useEffect(() => {
    if (isNavigating && userLocation && currentRoute.length > 0) {
      updateNavigationState();
    }
  }, [userLocation, isNavigating, currentRoute]);

  const updateNavigationState = () => {
    if (!userLocation || currentRoute.length === 0) return;

    let closestIndex = 0;
    let minDist = Infinity;

    // Find current position on route
    for (let i = 0; i < currentRoute.length; i++) {
      const dist = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        currentRoute[i].lat,
        currentRoute[i].lng
      );
      if (dist < minDist) {
        minDist = dist;
        closestIndex = i;
      }
    }

    // If off route by more than 200m, suggest reroute
    if (minDist > 0.2) {
      Alert.alert('Off Route', 'You appear to be off the planned route. Would you like to recalculate?', [
        { text: 'Continue', style: 'cancel' },
        { text: 'Recalculate', onPress: () => calculateRoute() }
      ]);
      return;
    }

    const nextIndex = Math.min(closestIndex + 1, currentRoute.length - 1);
    const nextPoint = currentRoute[nextIndex];

    const distToNext = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      nextPoint.lat,
      nextPoint.lng
    );

    const heading = calculateBearing(
      userLocation.lat,
      userLocation.lng,
      nextPoint.lat,
      nextPoint.lng
    );

    const speed = 15; // knots - would come from GPS in production
    const timeToNext = (distToNext / (speed * 1.852)) * 60; // minutes

    setNavigationState({
      currentSegmentIndex: closestIndex,
      distanceToNext: distToNext,
      timeToNext: timeToNext,
      heading: heading,
      speed: speed
    });

    // Check if arrived
    if (destination && distToNext < 0.1 && nextIndex === currentRoute.length - 1) {
      Alert.alert('🎯 Destination Reached!', 'You have arrived at your destination.', [
        { text: 'OK', onPress: cancelNavigation }
      ]);
    }
  };

  const parseCoordinates = (input: string): { lat: number; lng: number } | null => {
    const coords = input.split(',').map(s => parseFloat(s.trim()));
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      return { lat: coords[0], lng: coords[1] };
    }
    return null;
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
              Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
  };

  const getDirectionText = (bearing: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
  };

  const selectPort = (port: any) => {
    setSelectedPort(port);
    setDestinationInput(port.name);
    setShowPortSuggestions(false);
  };

  const calculateRoute = async () => {
    if (!userLocation || !destinationInput) {
      Alert.alert('Error', 'Please enter a destination');
      return;
    }

    let dest: { lat: number; lng: number } | null = null;

    if (inputMode === 'port') {
      if (selectedPort) {
        dest = { lat: selectedPort.lat, lng: selectedPort.lng };
      } else if (portSearchResults.length > 0) {
        dest = { lat: portSearchResults[0].lat, lng: portSearchResults[0].lng };
        setSelectedPort(portSearchResults[0]);
      } else {
        Alert.alert('Error', 'Port not found. Please select a port from the suggestions or switch to coordinates mode.');
        return;
      }
    } else {
      dest = parseCoordinates(destinationInput);
      if (!dest) {
        Alert.alert('Error', 'Invalid coordinates format. Use: latitude, longitude');
        return;
      }
    }

    setDestination(dest);

    try {
      // Use the maritime routing API which uses searoute for proper sea paths
      const intelligentRoute = await calculateIntelligentRoute(
        { lat: userLocation.lat, lng: userLocation.lng },
        { lat: dest.lat, lng: dest.lng },
        { speed: 15, showAlternatives: true }
      );

      if (!intelligentRoute) {
        throw new Error('Failed to calculate maritime route. Ensure origin and destination are accessible by sea.');
      }

      // The backend already provides properly calculated sea routes
      // Convert to route segments with maneuver instructions
      const segments: RouteSegment[] = intelligentRoute.coordinates.map((coord, idx, arr) => {
        let instruction = '';
        let maneuver = '';
        let distance = 0;
        let heading = 0;

        if (idx === 0) {
          instruction = 'Begin navigation';
          maneuver = 'depart';
        } else if (idx === arr.length - 1) {
          instruction = 'Arrive at destination';
          maneuver = 'arrive';
        } else {
          const prevCoord = arr[idx - 1];
          const nextCoord = arr[idx + 1] || coord;

          heading = calculateBearing(prevCoord.lat, prevCoord.lng, coord.lat, coord.lng);
          const nextHeading = calculateBearing(coord.lat, coord.lng, nextCoord.lat, nextCoord.lng);
          const turnAngle = (nextHeading - heading + 360) % 360;

          distance = calculateDistance(coord.lat, coord.lng, nextCoord.lat, nextCoord.lng);
          const distanceNm = distance * 0.539957;

          if (Math.abs(turnAngle) < 15) {
            maneuver = 'continue';
            instruction = `Continue on course ${Math.round(heading)}° for ${distanceNm.toFixed(1)} nm`;
          } else if (turnAngle > 15 && turnAngle < 90) {
            maneuver = 'turn-slight-right';
            instruction = `Bear to starboard, new course ${Math.round(nextHeading)}° for ${distanceNm.toFixed(1)} nm`;
          } else if (turnAngle >= 90 && turnAngle < 180) {
            maneuver = 'turn-right';
            instruction = `Turn starboard to ${Math.round(nextHeading)}° for ${distanceNm.toFixed(1)} nm`;
          } else if (turnAngle > 180 && turnAngle < 270) {
            maneuver = 'turn-left';
            instruction = `Turn port to ${Math.round(nextHeading)}° for ${distanceNm.toFixed(1)} nm`;
          } else if (turnAngle >= 270) {
            maneuver = 'turn-slight-left';
            instruction = `Bear to port, new course ${Math.round(nextHeading)}° for ${distanceNm.toFixed(1)} nm`;
          }
        }

        return {
          lat: coord.lat,
          lng: coord.lng,
          instruction,
          maneuver,
          distance,
          heading
        };
      });

      setCurrentRoute(segments);
      setRouteMetrics({
        distance: intelligentRoute.distance,
        duration: intelligentRoute.duration,
        fuel: intelligentRoute.prediction.fuelEfficiency,
        safetyScore: intelligentRoute.safetyScore,
        trafficDensity: intelligentRoute.trafficDensity
      });

      setAlternativeRoutes(intelligentRoute.alternativeRoutes || []);

      if (intelligentRoute.recommendations.length > 0) {
        Alert.alert(
          '🧭 Route Calculated',
          `Safety Score: ${intelligentRoute.safetyScore}/100\n\n` +
          intelligentRoute.recommendations.slice(0, 2).join('\n'),
          [{ text: 'Start Navigation', onPress: () => setIsNavigating(true) }]
        );
      } else {
        setIsNavigating(true);
      }

    } catch (error) {
      console.error('Route calculation error:', error);
      Alert.alert(
        '⚓ Route Error', 
        'Unable to calculate maritime route. Please ensure:\n\n' +
        '• Origin and destination are accessible by sea\n' +
        '• Coordinates are valid ocean/water locations\n' +
        '• There is a navigable water path between points\n\n' +
        'The system uses real maritime routing that follows waterways, not land.'
      );
    }
  };

  const cancelNavigation = () => {
    setIsNavigating(false);
    setDestination(null);
    setCurrentRoute([]);
    setDestinationInput('');
    setAlternativeRoutes([]);
  };

  const reportHazardToSystem = async (
    type: MaritimeHazard['type'],
    severity: MaritimeHazard['severity'],
    description: string
  ) => {
    if (!userLocation) return;

    const hazard = await reportHazard(
      type,
      severity,
      userLocation.lat,
      userLocation.lng,
      description,
      'You',
      'vessel_id'
    );

    if (hazard) {
      setHazards(prev => [...prev, hazard]);
      Alert.alert('✅ Hazard Reported', 'Thank you! Other vessels in the area have been notified.');
      setShowHazardReport(false);
    }
  };

  const escapeHtml = (text: string): string => {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };

  const defaultLat = userLocation?.lat || 3.0;
  const defaultLng = userLocation?.lng || 101.0;

  // Generate map HTML with maritime styling
  const vesselsMarkersHTML = vessels.map(v => {
    const heading = v.heading || 0;
    const speedColor = v.speed && v.speed > 10 ? '#ef4444' : '#10b981';
    return `
      L.marker([${v.latitude}, ${v.longitude}], {
        icon: L.divIcon({
          html: '<div style="display: flex; flex-direction: column; align-items: center;"><div style="transform: rotate(${heading}deg); font-size: 24px;">⛵</div><div style="background: ${speedColor}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; margin-top: 2px;">${v.speed?.toFixed(1) || 0} kn</div></div>',
          className: 'vessel-marker',
          iconSize: [40, 50],
          iconAnchor: [20, 25]
        })
      }).addTo(map).bindPopup('<b>${escapeHtml(v.name)}</b><br>Speed: ${v.speed || 0} kn<br>Heading: ${heading}°');
    `;
  }).join('\n');

  const userMarkerHTML = userLocation ? `
    L.marker([${userLocation.lat}, ${userLocation.lng}], {
      icon: L.divIcon({
        html: '<div style="position: relative;"><div style="width: 20px; height: 20px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);"></div><div style="position: absolute; top: -8px; left: -8px; width: 36px; height: 36px; border: 2px solid #3b82f6; border-radius: 50%; opacity: 0.3; animation: pulse 2s infinite;"></div></div>',
        className: 'user-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      })
    }).addTo(map);
  ` : '';

  const hazardsHTML = hazards.map(h => {
    const color = getSeverityColor(h.severity);
    const icon = getHazardIcon(h.type);
    return `
      L.circleMarker([${h.lat}, ${h.lng}], {
        radius: h.severity === 'critical' ? 20 : h.severity === 'high' ? 15 : 10,
        fillColor: '${color}',
        color: 'white',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.6
      }).addTo(map).bindPopup(\`
        <div style="min-width: 150px;">
          <div style="font-size: 16px; margin-bottom: 8px;">${icon} ${h.type.toUpperCase()}</div>
          <div style="font-size: 12px; margin-bottom: 4px;">${escapeHtml(h.description)}</div>
          <div style="font-size: 11px; color: #666;">Severity: ${h.severity}</div>
          <div style="font-size: 10px; color: #999;">Reported: ${new Date(h.timestamp).toLocaleTimeString()}</div>
        </div>
      \`);
    `;
  }).join('\n');

  const routeHTML = currentRoute.length > 1 ? `
    var routeCoords = [${currentRoute.map(p => `[${p.lat}, ${p.lng}]`).join(',')}];

    // Main route line - thick maritime blue to show sea path clearly
    var routeLine = L.polyline(routeCoords, {
      color: '#0ea5e9',
      weight: 8,
      opacity: 0.9,
      lineJoin: 'round',
      lineCap: 'round'
    }).addTo(map);

    // White border to make route stand out over water
    L.polyline(routeCoords, {
      color: '#ffffff',
      weight: 10,
      opacity: 0.4,
      lineJoin: 'round',
      lineCap: 'round'
    }).addTo(map);

    // Animated overlay showing direction of travel
    L.polyline(routeCoords, {
      color: '#38bdf8',
      weight: 4,
      opacity: 0.7,
      dashArray: '15, 20',
      className: 'route-animation'
    }).addTo(map);

    // Waypoint markers with maneuver icons
    ${currentRoute.slice(1, -1).map((point, idx) => {
      let maneuverIcon = '●';
      if (point.maneuver === 'turn-right') maneuverIcon = '↱';
      else if (point.maneuver === 'turn-left') maneuverIcon = '↰';
      else if (point.maneuver === 'turn-slight-right') maneuverIcon = '↗';
      else if (point.maneuver === 'turn-slight-left') maneuverIcon = '↖';

      return `
        L.marker([${point.lat}, ${point.lng}], {
          icon: L.divIcon({
            html: '<div style="background: #0ea5e9; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; font-size: 14px;">${maneuverIcon}</div>',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          })
        }).addTo(map).bindPopup(\`
          <div style="min-width: 200px;">
            <div style="font-weight: bold; margin-bottom: 4px;">Waypoint ${idx + 1}</div>
            <div style="font-size: 12px;">${escapeHtml(point.instruction || '')}</div>
          </div>
        \`);
      `;
    }).join('\n')}

    // Destination marker
    L.marker([${destination?.lat}, ${destination?.lng}], {
      icon: L.divIcon({
        html: '<div style="display: flex; flex-direction: column; align-items: center;"><div style="width: 40px; height: 40px; background: #10b981; border: 3px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">🎯</div><div style="background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; margin-top: 4px; font-size: 12px; font-weight: bold;">Destination</div></div>',
        iconSize: [40, 60],
        iconAnchor: [20, 30]
      })
    }).addTo(map);

    map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
  ` : '';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { width: 100%; height: 100vh; }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.5); opacity: 0; }
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map').setView([${defaultLat}, ${defaultLng}], 10);

        // Use OpenStreetMap which clearly shows land vs water
        // This helps visualize that routes stay in water
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19
        }).addTo(map);
        
        // Add water overlay to highlight navigable areas
        L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
          attribution: 'Map data: &copy; <a href="http://www.openseamap.org">OpenSeaMap</a>',
          transparent: true,
          opacity: 0.6
        }).addTo(map);

        ${userMarkerHTML}
        ${vesselsMarkersHTML}
        ${hazardsHTML}
        ${routeHTML}
      </script>
    </body>
    </html>
  `;

  const getCurrentInstruction = () => {
    if (!currentRoute.length || navigationState.currentSegmentIndex >= currentRoute.length) {
      return { instruction: 'Calculating route...', distance: 0, heading: 0 };
    }

    const current = currentRoute[navigationState.currentSegmentIndex];
    return {
      instruction: current.instruction || 'Continue on course',
      distance: navigationState.distanceToNext,
      heading: navigationState.heading
    };
  };

  return (
    <View style={[styles.container, { height }]}>
      {!isNavigating ? (
        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <View style={styles.searchHeader}>
            <Text style={styles.searchIcon}>🧭</Text>
            <Text style={[styles.searchTitle, { color: colors.text }]}>Where to?</Text>
          </View>

          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleBtn, inputMode === 'port' && styles.toggleBtnActive]}
              onPress={() => {
                setInputMode('port');
                setDestinationInput('');
                setSelectedPort(null);
              }}
            >
              <Text style={[styles.toggleText, inputMode === 'port' && styles.toggleTextActive]}>
                🏝️ Port Name
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, inputMode === 'coords' && styles.toggleBtnActive]}
              onPress={() => {
                setInputMode('coords');
                setDestinationInput('');
                setShowPortSuggestions(false);
              }}
            >
              <Text style={[styles.toggleText, inputMode === 'coords' && styles.toggleTextActive]}>
                📍 Coordinates
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ position: 'relative' }}>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              placeholder={
                inputMode === 'port' 
                  ? "Search for a port (e.g., Singapore, New York, Rotterdam)" 
                  : "Enter coordinates (lat, lng)"
              }
              placeholderTextColor={colors.icon}
              value={destinationInput}
              onChangeText={(text) => {
                setDestinationInput(text);
                if (inputMode === 'port' && selectedPort) {
                  setSelectedPort(null);
                }
              }}
            />

            {showPortSuggestions && portSearchResults.length > 0 && (
              <View style={[styles.suggestionsContainer, { backgroundColor: colors.card }]}>
                <ScrollView style={styles.suggestionsList} keyboardShouldPersistTaps="handled">
                  {portSearchResults.map((port) => (
                    <TouchableOpacity
                      key={port.id}
                      style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                      onPress={() => selectPort(port)}
                    >
                      <Text style={styles.suggestionIcon}>⚓</Text>
                      <View style={styles.suggestionInfo}>
                        <Text style={[styles.suggestionName, { color: colors.text }]}>
                          {port.name}
                        </Text>
                        <Text style={[styles.suggestionDetails, { color: colors.icon }]}>
                          {port.city}, {port.country}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.goButton, { backgroundColor: '#0ea5e9' }]}
            onPress={calculateRoute}
          >
            <Text style={styles.goButtonText}>🚀 Calculate Route</Text>
          </TouchableOpacity>

          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickActionBtn, { backgroundColor: colors.background }]}
              onPress={() => setShowHazardReport(true)}
            >
              <Text style={styles.quickActionIcon}>⚠️</Text>
              <Text style={[styles.quickActionText, { color: colors.text }]}>Report</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionBtn, { backgroundColor: colors.background }]}
              onPress={() => Alert.alert('Traffic', `${hazards.length} hazards in area`)}
            >
              <Text style={styles.quickActionIcon}>🚦</Text>
              <Text style={[styles.quickActionText, { color: colors.text }]}>Traffic</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionBtn, { backgroundColor: colors.background }]}
              onPress={() => setShowRouteOptions(true)}
            >
              <Text style={styles.quickActionIcon}>🛣️</Text>
              <Text style={[styles.quickActionText, { color: colors.text }]}>Routes</Text>
            </TouchableOpacity>
          </View>

          {showHazardReport && (
            <Modal visible={showHazardReport} animationType="slide" transparent>
              <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Report Hazard</Text>
                  <ScrollView style={styles.hazardOptions}>
                    {[
                      { type: 'debris' as const, icon: '🪵', label: 'Debris' },
                      { type: 'shallow' as const, icon: '⚓', label: 'Shallow Water' },
                      { type: 'weather' as const, icon: '🌧️', label: 'Bad Weather' },
                      { type: 'congestion' as const, icon: '🚦', label: 'Heavy Traffic' }
                    ].map(item => (
                      <TouchableOpacity
                        key={item.type}
                        style={[styles.hazardOption, { backgroundColor: colors.background }]}
                        onPress={() => reportHazardToSystem(item.type, 'medium', `${item.label} reported`)}
                      >
                        <Text style={styles.hazardOptionIcon}>{item.icon}</Text>
                        <Text style={[styles.hazardOptionText, { color: colors.text }]}>{item.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <TouchableOpacity
                    style={[styles.closeButton, { backgroundColor: colors.icon }]}
                    onPress={() => setShowHazardReport(false)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}
        </View>
      ) : (
        <View style={[styles.navBar, { backgroundColor: '#0ea5e9' }]}>
          <View style={styles.navContent}>
            <View style={styles.navTop}>
              <Text style={styles.navDistance}>
                {getCurrentInstruction().distance.toFixed(1)} km
              </Text>
              <Text style={styles.navEta}>
                {Math.floor(routeMetrics.duration / 60)}h {Math.round(routeMetrics.duration % 60)}m
              </Text>
            </View>

            <View style={styles.navInstruction}>
              <Text style={styles.navHeading}>
                {getDirectionText(getCurrentInstruction().heading)} {Math.round(getCurrentInstruction().heading)}°
              </Text>
              <Text style={styles.navText} numberOfLines={2}>
                {getCurrentInstruction().instruction}
              </Text>
            </View>

            <View style={styles.navMetrics}>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Safety</Text>
                <Text style={styles.metricValue}>{routeMetrics.safetyScore}</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Traffic</Text>
                <Text style={styles.metricValue}>{routeMetrics.trafficDensity.toUpperCase()}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity onPress={cancelNavigation} style={styles.navClose}>
            <Text style={styles.navCloseText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />

      {isNavigating && hazards.length > 0 && (
        <View style={[styles.alertsBanner, { backgroundColor: '#fef3c7' }]}>
          <Text style={styles.alertsText}>⚠️ {hazards.length} hazards on route</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
  },
  searchContainer: {
    position: 'absolute',
    top: 20,
    left: 16,
    right: 16,
    zIndex: 1000,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  searchIcon: {
    fontSize: 32,
  },
  searchTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
  },
  toggleBtnActive: {
    backgroundColor: '#0ea5e9',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  toggleTextActive: {
    color: '#ffffff',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    maxHeight: 200,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 2000,
  },
  suggestionsList: {
    borderRadius: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  suggestionIcon: {
    fontSize: 24,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  suggestionDetails: {
    fontSize: 12,
  },
  goButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  quickActionBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  quickActionIcon: {
    fontSize: 28,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  navBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  navContent: {
    gap: 12,
  },
  navTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  navDistance: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  navEta: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
  },
  navInstruction: {
    gap: 4,
  },
  navHeading: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    fontWeight: '600',
  },
  navText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  navMetrics: {
    flexDirection: 'row',
    gap: 16,
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: '#fff',
    opacity: 0.7,
  },
  metricValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  navClose: {
    position: 'absolute',
    top: 50,
    right: 16,
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navCloseText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  map: {
    flex: 1,
  },
  alertsBanner: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  alertsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  hazardOptions: {
    marginBottom: 16,
  },
  hazardOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  hazardOptionIcon: {
    fontSize: 24,
  },
  hazardOptionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});