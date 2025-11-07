import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface Port {
  id: number;
  name: string;
  code: string;
  country: string;
  lat: number;
  lng: number;
}

interface Location {
  lat: number;
  lng: number;
  name?: string;
}

interface RouteData {
  coordinates: Array<{ lat: number; lng: number }>;
  distance: number;
  duration: number;
  directions: Array<{
    instruction: string;
    distance: string;
    waypoint: { lat: number; lng: number };
  }>;
  origin: Location;
  destination: Location;
}

interface WazeNavigationProps {
  userLocation?: { lat: number; lng: number } | null;
  onRouteCalculated?: (route: RouteData) => void;
  onClearRoute?: () => void;
}

export default function WazeNavigation({ userLocation, onRouteCalculated, onClearRoute }: WazeNavigationProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Port[]>([]);
  const [searching, setSearching] = useState(false);
  const [calculating, setCalculating] = useState(false);
  
  const [destinationType, setDestinationType] = useState<'port' | 'coords'>('port');
  const [coordsInput, setCoordsInput] = useState({ lat: '', lng: '' });
  
  const [currentRoute, setCurrentRoute] = useState<RouteData | null>(null);
  const [showDirections, setShowDirections] = useState(false);

  // Search ports
  const searchPorts = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setSearching(true);
    try {
      const response = await fetch(`http://localhost:3001/api/ports/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data.ports || []);
    } catch (error) {
      console.error('Port search error:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (destinationType === 'port') {
        searchPorts(searchQuery);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, destinationType]);

  // Calculate route
  const calculateRoute = async (destination: Location) => {
    if (!userLocation) {
      alert('Current location not available');
      return;
    }
    
    setCalculating(true);
    try {
      const response = await fetch('http://localhost:3001/api/route/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: {
            lat: userLocation.lat,
            lng: userLocation.lng,
            name: 'Current Location'
          },
          destination
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        alert(`Error: ${data.error}`);
        return;
      }
      
      setCurrentRoute(data.route);
      setShowDirections(true);
      onRouteCalculated?.(data.route);
    } catch (error) {
      console.error('Route calculation error:', error);
      alert('Failed to calculate route');
    } finally {
      setCalculating(false);
    }
  };

  // Select port
  const selectPort = (port: Port) => {
    calculateRoute({
      lat: port.lat,
      lng: port.lng,
      name: port.name
    });
    setSearchQuery(port.name);
    setSearchResults([]);
  };

  // Use coordinates
  const useCoordinates = () => {
    const lat = parseFloat(coordsInput.lat);
    const lng = parseFloat(coordsInput.lng);
    
    if (isNaN(lat) || isNaN(lng)) {
      alert('Please enter valid coordinates');
      return;
    }
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert('Coordinates out of range');
      return;
    }
    
    calculateRoute({
      lat,
      lng,
      name: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    });
  };

  // Clear route
  const clearRoute = () => {
    setCurrentRoute(null);
    setShowDirections(false);
    setSearchQuery('');
    setCoordsInput({ lat: '', lng: '' });
    onClearRoute?.();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.tint, borderBottomColor: colors.tint }]}>
        <Ionicons name="navigate" size={24} color="#FFFFFF" style={styles.headerIcon} />
        <Text style={styles.headerTitle}>Maritime Navigation</Text>
      </View>

      {!currentRoute ? (
        <View style={styles.searchContainer}>
          {/* Destination Type Selector */}
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                destinationType === 'port' && { backgroundColor: colors.tint }
              ]}
              onPress={() => setDestinationType('port')}
            >
              <Text style={[
                styles.typeButtonText,
                destinationType === 'port' && styles.typeButtonTextActive
              ]}>
                Port Name
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.typeButton,
                destinationType === 'coords' && { backgroundColor: colors.tint }
              ]}
              onPress={() => setDestinationType('coords')}
            >
              <Text style={[
                styles.typeButtonText,
                destinationType === 'coords' && styles.typeButtonTextActive
              ]}>
                Coordinates
              </Text>
            </TouchableOpacity>
          </View>

          {destinationType === 'port' ? (
            <>
              {/* Port Name Search */}
              <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="search" size={20} color={colors.icon} />
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder="Search port (e.g., Mumbai, Singapore, Dubai)"
                  placeholderTextColor={colors.tabIconDefault}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searching && <ActivityIndicator size="small" color={colors.tint} />}
              </View>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <ScrollView style={styles.results}>
                  {searchResults.map((port) => (
                    <TouchableOpacity
                      key={port.id}
                      style={[styles.resultItem, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
                      onPress={() => selectPort(port)}
                    >
                      <Ionicons name="location" size={20} color={colors.tint} />
                      <View style={styles.resultInfo}>
                        <Text style={[styles.resultName, { color: colors.text }]}>{port.name}</Text>
                        <Text style={[styles.resultDetails, { color: colors.tabIconDefault }]}>
                          {port.country} • {port.code}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </>
          ) : (
            <>
              {/* Coordinates Input */}
              <View style={styles.coordsContainer}>
                <Text style={[styles.coordsLabel, { color: colors.text }]}>Latitude:</Text>
                <TextInput
                  style={[styles.coordsInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                  placeholder="e.g., 13.0827"
                  placeholderTextColor={colors.tabIconDefault}
                  value={coordsInput.lat}
                  onChangeText={(text) => setCoordsInput({ ...coordsInput, lat: text })}
                  keyboardType="numeric"
                />
                
                <Text style={[styles.coordsLabel, { color: colors.text }]}>Longitude:</Text>
                <TextInput
                  style={[styles.coordsInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                  placeholder="e.g., 80.2707"
                  placeholderTextColor={colors.tabIconDefault}
                  value={coordsInput.lng}
                  onChangeText={(text) => setCoordsInput({ ...coordsInput, lng: text })}
                  keyboardType="numeric"
                />
                
                <TouchableOpacity
                  style={[styles.goButton, { backgroundColor: colors.tint }]}
                  onPress={useCoordinates}
                  disabled={calculating}
                >
                  {calculating ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="navigate" size={20} color="#FFFFFF" />
                      <Text style={styles.goButtonText}>Calculate Route</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}

          {calculating && (
            <View style={styles.calculatingContainer}>
              <ActivityIndicator size="large" color={colors.tint} />
              <Text style={[styles.calculatingText, { color: colors.text }]}>
                Calculating maritime route...
              </Text>
            </View>
          )}
        </View>
      ) : (
        <>
          {/* Route Summary */}
          <View style={[styles.routeSummary, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <View style={styles.routeInfo}>
              <Text style={[styles.routeDistance, { color: colors.tint }]}>
                {currentRoute.distance.toFixed(1)} nm
              </Text>
              <Text style={[styles.routeDuration, { color: colors.text }]}>
                {Math.floor(currentRoute.duration / 60)}h {Math.round(currentRoute.duration % 60)}m
              </Text>
            </View>
            
            <TouchableOpacity
              style={[styles.directionsButton, { backgroundColor: colors.tint }]}
              onPress={() => setShowDirections(!showDirections)}
            >
              <Ionicons name={showDirections ? "chevron-up" : "list"} size={20} color="#FFFFFF" />
              <Text style={styles.directionsButtonText}>
                {showDirections ? 'Hide' : 'Show'} Directions
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={clearRoute}>
              <Ionicons name="close-circle" size={28} color={colors.notification} />
            </TouchableOpacity>
          </View>

          {/* Turn-by-Turn Directions */}
          {showDirections && (
            <ScrollView style={styles.directionsContainer}>
              {currentRoute.directions.map((step, index) => (
                <View
                  key={index}
                  style={[styles.directionStep, { backgroundColor: colors.card, borderLeftColor: colors.tint }]}
                >
                  <View style={styles.stepNumber}>
                    <Text style={[styles.stepNumberText, { color: colors.tint }]}>
                      {index + 1}
                    </Text>
                  </View>
                  <View style={styles.stepInfo}>
                    <Text style={[styles.stepInstruction, { color: colors.text }]}>
                      {step.instruction}
                    </Text>
                    {step.distance && (
                      <Text style={[styles.stepDistance, { color: colors.tabIconDefault }]}>
                        {step.distance}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  searchContainer: {
    padding: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  results: {
    marginTop: 8,
    maxHeight: 300,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
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
  resultDetails: {
    fontSize: 12,
    marginTop: 2,
  },
  coordsContainer: {
    gap: 12,
  },
  coordsLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  coordsInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  goButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  goButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  calculatingContainer: {
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  calculatingText: {
    fontSize: 14,
  },
  routeSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  routeInfo: {
    flex: 1,
  },
  routeDistance: {
    fontSize: 24,
    fontWeight: '700',
  },
  routeDuration: {
    fontSize: 14,
    marginTop: 4,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 6,
    gap: 6,
  },
  directionsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  directionsContainer: {
    flex: 1,
    padding: 16,
  },
  directionStep: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700',
  },
  stepInfo: {
    flex: 1,
  },
  stepInstruction: {
    fontSize: 15,
    fontWeight: '600',
  },
  stepDistance: {
    fontSize: 12,
    marginTop: 4,
  },
});
