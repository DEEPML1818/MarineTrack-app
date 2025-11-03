import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface OpenStreetMapProps {
  userLocation?: { lat: number; lng: number } | null;
  vessels?: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
  }>;
  height?: number;
}

export default function OpenStreetMap({ userLocation, vessels = [], height = 400 }: OpenStreetMapProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Default location (center of ocean)
  const defaultLat = userLocation?.lat || 0;
  const defaultLng = userLocation?.lng || 0;
  const zoom = 10;

  // Helper function to escape HTML and prevent script injection
  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // Generate markers HTML for vessels with proper escaping
  const vesselsMarkersHTML = vessels.map(vessel => {
    const escapedName = escapeHtml(vessel.name);
    return `
    L.marker([${vessel.latitude}, ${vessel.longitude}], {
      icon: L.divIcon({
        html: '<div style="background: #0ea5e9; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; white-space: nowrap;">🚢 ${escapedName}</div>',
        className: 'vessel-marker',
        iconSize: [null, null]
      })
    }).addTo(map);
  `}).join('\n');

  // User location marker (safe, no user input)
  const userMarkerHTML = userLocation ? `
    L.marker([${userLocation.lat}, ${userLocation.lng}], {
      icon: L.divIcon({
        html: '<div style="background: #ef4444; color: white; padding: 6px 10px; border-radius: 4px; font-size: 14px; font-weight: bold;">📍 You</div>',
        className: 'user-marker',
        iconSize: [null, null]
      })
    }).addTo(map);
  ` : '';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body {
          margin: 0;
          padding: 0;
        }
        #map {
          width: 100%;
          height: 100vh;
        }
        .vessel-marker, .user-marker {
          border: none;
          background: transparent;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map').setView([${defaultLat}, ${defaultLng}], ${zoom});
        
        // Use OpenStreetMap tiles (free and open-source)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        // Add user location marker
        ${userMarkerHTML}

        // Add vessel markers
        ${vesselsMarkersHTML}

        // Auto-fit bounds if we have vessels
        ${vessels.length > 0 ? `
          var bounds = L.latLngBounds([
            ${userLocation ? `[${userLocation.lat}, ${userLocation.lng}],` : ''}
            ${vessels.map(v => `[${v.latitude}, ${v.longitude}]`).join(',\n')}
          ]);
          map.fitBounds(bounds, { padding: [50, 50] });
        ` : ''}
      </script>
    </body>
    </html>
  `;

  if (!userLocation && vessels.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.card, height }]}>
        <Text style={[styles.emptyText, { color: colors.icon }]}>
          📍 Enable location to see map
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
  },
  emptyContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
  },
});
