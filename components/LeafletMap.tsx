import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';

interface Vessel {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  distance: number;
  status: string;
}

interface LeafletMapProps {
  userLocation: { latitude: number; longitude: number } | null;
  vessels: Vessel[];
  onVesselPress: (vessel: Vessel) => void;
  currentUserName?: string;
}

export default function LeafletMap({ userLocation, vessels, onVesselPress, currentUserName }: LeafletMapProps) {
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !userLocation) return;

    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default;
        await import('leaflet/dist/leaflet.css');

        // Fix for default marker icons in Leaflet
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        if (!mapRef.current) {
          const map = L.map('leaflet-map', {
            center: [userLocation.latitude, userLocation.longitude],
            zoom: 12,
            zoomControl: true,
          });

          // Add OpenStreetMap tiles
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
            minZoom: 3,
          }).addTo(map);

          mapRef.current = map;

          // Create custom icon for user location
          const userIcon = L.divIcon({
            className: 'custom-user-marker',
            html: `<div style="width: 50px; height: 50px; position: relative;">
                    <div style="width: 50px; height: 50px; border-radius: 50%; background-color: #FF3B30; display: flex; align-items: center; justify-content: center; border: 4px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.4); position: relative; z-index: 1000;">
                      <span style="font-size: 24px;">📍</span>
                    </div>
                  </div>`,
            iconSize: [50, 50],
            iconAnchor: [25, 25],
          });

          // Add user marker
          userMarkerRef.current = L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon })
            .addTo(map)
            .bindPopup(`<div style="text-align: center; padding: 5px;">
                          <strong style="font-size: 14px;">My Vessel</strong><br/>
                          <span style="font-size: 12px; color: #666;">${currentUserName || 'You'}</span>
                        </div>`);
        }
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [userLocation, currentUserName]);

  // Update vessel markers
  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined') return;

    const updateMarkers = async () => {
      try {
        const L = (await import('leaflet')).default;

        // Remove existing vessel markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Create vessel icon
        const vesselIcon = L.divIcon({
          className: 'custom-vessel-marker',
          html: `<div style="width: 45px; height: 45px; position: relative;">
                  <div style="width: 45px; height: 45px; border-radius: 50%; background-color: #007AFF; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.3); cursor: pointer; transition: transform 0.2s;">
                    <span style="font-size: 22px;">🚢</span>
                  </div>
                </div>`,
          iconSize: [45, 45],
          iconAnchor: [22.5, 22.5],
        });

        // Add markers for each vessel
        vessels.forEach((vessel) => {
          const marker = L.marker([vessel.latitude, vessel.longitude], { icon: vesselIcon })
            .addTo(mapRef.current)
            .bindPopup(`<div style="text-align: center; padding: 8px; min-width: 150px;">
                          <strong style="font-size: 14px; color: #007AFF;">🚢 ${vessel.name}</strong><br/>
                          <span style="font-size: 12px; color: #666;">${vessel.type}</span><br/>
                          <span style="font-size: 12px; color: #666;">${vessel.distance.toFixed(1)} km away</span><br/>
                          <span style="font-size: 11px; color: #999;">Speed: ${vessel.speed.toFixed(1)} kn</span><br/>
                          <button style="margin-top: 8px; padding: 6px 12px; background-color: #007AFF; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">💬 Open Chat</button>
                        </div>`)
            .on('click', () => onVesselPress(vessel));

          // Add hover effect
          marker.on('mouseover', function() {
            const element = this.getElement();
            if (element) {
              const div = element.querySelector('div > div');
              if (div) {
                (div as HTMLElement).style.transform = 'scale(1.1)';
              }
            }
          });

          marker.on('mouseout', function() {
            const element = this.getElement();
            if (element) {
              const div = element.querySelector('div > div');
              if (div) {
                (div as HTMLElement).style.transform = 'scale(1)';
              }
            }
          });

          markersRef.current.push(marker);
        });

        // Fit bounds to show all vessels if there are any
        if (vessels.length > 0 && userLocation) {
          const bounds = L.latLngBounds([
            [userLocation.latitude, userLocation.longitude],
            ...vessels.map(v => [v.latitude, v.longitude] as [number, number])
          ]);
          mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
        }
      } catch (error) {
        console.error('Error updating markers:', error);
      }
    };

    updateMarkers();
  }, [vessels, onVesselPress]);

  // Update user location marker
  useEffect(() => {
    if (!mapRef.current || !userLocation || !userMarkerRef.current) return;

    const updateUserLocation = async () => {
      try {
        const L = (await import('leaflet')).default;

        // Update user marker position
        userMarkerRef.current.setLatLng([userLocation.latitude, userLocation.longitude]);

        // Center map on user location if no vessels nearby
        if (vessels.length === 0) {
          mapRef.current.setView([userLocation.latitude, userLocation.longitude], mapRef.current.getZoom());
        }
      } catch (error) {
        console.error('Error updating user location:', error);
      }
    };

    updateUserLocation();
  }, [userLocation, vessels.length]);

  return (
    <View style={styles.container}>
      <div id="leaflet-map" style={{ width: '100%', height: '100%', borderRadius: '8px' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
});