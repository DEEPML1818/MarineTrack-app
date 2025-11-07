import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { maritimeZones, Zone, calculateOptimalRoute, checkZoneWarnings } from '@/utils/zoneData';
import { sendNotification, NotificationType } from '@/utils/notificationService';
import { shouldSendNotification, createNotificationKey } from '@/utils/notificationThrottle';

interface EnhancedVesselMapProps {
  userLocation?: { lat: number; lng: number } | null;
  vessels?: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
  }>;
  height?: number;
  showZones?: boolean;
  showRoute?: boolean;
  destination?: { lat: number; lng: number } | null;
}

export default function EnhancedVesselMap({ 
  userLocation, 
  vessels = [], 
  height = 400,
  showZones = true,
  showRoute = false,
  destination = null
}: EnhancedVesselMapProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  useEffect(() => {
    if (userLocation) {
      const warning = checkZoneWarnings(userLocation);
      if (warning.warning && warning.zone?.type === 'restricted') {
        const notificationKey = createNotificationKey('restricted_zone', { zoneId: warning.zone.id });
        if (shouldSendNotification(notificationKey)) {
          sendNotification(
            NotificationType.RESTRICTED_ZONE,
            'Restricted Zone Alert',
            warning.message
          );
        }
      }
    }
  }, [userLocation]);

  const defaultLat = userLocation?.lat || 13.0;
  const defaultLng = userLocation?.lng || 80.2;
  const zoom = 10;

  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const vesselsMarkersHTML = vessels.map(vessel => {
    const escapedName = escapeHtml(vessel.name);
    return `
    L.marker([${vessel.latitude}, ${vessel.longitude}], {
      icon: L.divIcon({
        html: '<div style="background: #0ea5e9; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">🚢 ${escapedName}</div>',
        className: 'vessel-marker',
        iconSize: [null, null]
      })
    }).addTo(map);
  `}).join('\n');

  const userMarkerHTML = userLocation ? `
    L.marker([${userLocation.lat}, ${userLocation.lng}], {
      icon: L.divIcon({
        html: '<div style="background: #ef4444; color: white; padding: 8px 12px; border-radius: 50%; font-size: 18px; font-weight: bold; box-shadow: 0 3px 6px rgba(0,0,0,0.4);">📍</div>',
        className: 'user-marker',
        iconSize: [null, null]
      })
    }).addTo(map);
  ` : '';

  const zonesHTML = showZones ? maritimeZones.map(zone => {
    const coords = zone.coordinates.map(c => `[${c.lat}, ${c.lng}]`).join(',');
    const escapedName = escapeHtml(zone.name);
    const escapedDesc = escapeHtml(zone.description);
    
    let icon = '🟢';
    if (zone.type === 'restricted') icon = '🔴';
    else if (zone.type === 'border') icon = '⚠️';
    else if (zone.type === 'fishing') icon = '🐟';

    return `
      var zone_${zone.id} = L.polygon([${coords}], {
        color: '${zone.color}',
        fillColor: '${zone.color}',
        fillOpacity: ${zone.opacity},
        weight: 2
      }).addTo(map);
      
      zone_${zone.id}.bindPopup(\`
        <div style="padding: 8px; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${icon} ${escapedName}</h3>
          <p style="margin: 0; font-size: 12px; color: #666;">${escapedDesc}</p>
        </div>
      \`);
    `;
  }).join('\n') : '';

  const routeHTML = showRoute && userLocation && destination ? (() => {
    const route = calculateOptimalRoute(userLocation, destination, maritimeZones);
    const routeCoords = route.coordinates.map(c => `[${c.lat}, ${c.lng}]`).join(',');
    return `
      L.polyline([${routeCoords}], {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.7,
        dashArray: '10, 5'
      }).addTo(map);
      
      L.marker([${destination.lat}, ${destination.lng}], {
        icon: L.divIcon({
          html: '<div style="background: #10b981; color: white; padding: 6px 10px; border-radius: 4px; font-size: 14px; font-weight: bold;">🎯 Destination</div>',
          className: 'destination-marker',
          iconSize: [null, null]
        })
      }).addTo(map).bindPopup(\`
        <div style="padding: 8px;">
          <h3 style="margin: 0 0 8px 0;">Route Info</h3>
          <p style="margin: 4px 0; font-size: 12px;">Distance: ${route.distance.toFixed(1)} km</p>
          <p style="margin: 4px 0; font-size: 12px;">Est. Time: ${route.estimatedTime.toFixed(0)} min</p>
          ${route.hazards.length > 0 ? '<p style="margin: 4px 0; font-size: 12px; color: #ef4444;">⚠️ ' + route.hazards.join(', ') + '</p>' : ''}
        </div>
      \`);
    `;
  })() : '';

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
        .vessel-marker, .user-marker, .destination-marker {
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', {
          center: [${defaultLat}, ${defaultLng}],
          zoom: ${zoom},
          zoomControl: true
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
          minZoom: 3
        }).addTo(map);

        ${zonesHTML}
        ${vesselsMarkersHTML}
        ${userMarkerHTML}
        ${routeHTML}
      </script>
    </body>
    </html>
  `;

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        source={{ html: htmlContent }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scrollEnabled={false}
      />
      
      {showZones && (
        <View style={[styles.legend, { backgroundColor: colors.card }]}>
          <Text style={[styles.legendTitle, { color: colors.text }]}>Map Legend</Text>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#22c55e' }]} />
            <Text style={[styles.legendText, { color: colors.icon }]}>Prime Fishing</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#84cc16' }]} />
            <Text style={[styles.legendText, { color: colors.icon }]}>Good Fishing</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#ef4444' }]} />
            <Text style={[styles.legendText, { color: colors.icon }]}>Restricted</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#facc15' }]} />
            <Text style={[styles.legendText, { color: colors.icon }]}>Border</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  legend: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 140,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
  },
});
