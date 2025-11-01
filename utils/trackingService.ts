interface VesselTrackingData {
  userId: string;
  vesselInfo: {
    vesselName: string;
    vesselId: string;
    vesselType: string;
    mmsi?: string;
    imo?: string;
  };
  location: {
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
    timestamp: string;
  };
  status: 'Active' | 'Idle' | 'Anchored';
}

interface TrackedVessel extends VesselTrackingData {
  id: string;
  lastUpdate: string;
}

// Store tracking data locally (in production, replace with actual backend API)
const TRACKING_STORAGE_KEY = '@marinetrack_vessel_tracking';
const TRACKED_VESSELS_KEY = '@marinetrack_tracked_vessels';

// Send tracking data to backend
export const sendTrackingData = async (data: VesselTrackingData): Promise<boolean> => {
  try {
    // Store locally in AsyncStorage
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    await AsyncStorage.setItem(TRACKING_STORAGE_KEY, JSON.stringify(data));

    // Also store in database for persistence
    const { saveTrackingData } = await import('./database');
    await saveTrackingData({
      userId: data.userId,
      vesselName: data.vesselInfo.vesselName,
      location: {
        latitude: data.location.latitude,
        longitude: data.location.longitude,
        speed: data.location.speed || 0,
        heading: data.location.heading || 0,
        timestamp: data.location.timestamp,
      },
      status: data.status,
    });

    // In production, replace with actual API call:
    // const response = await fetch('https://your-backend-api.com/api/tracking', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // });
    // return response.ok;

    console.log('AIS Broadcasting:', data.vesselInfo.vesselName, 'at', data.location.latitude.toFixed(4), data.location.longitude.toFixed(4));
    return true;
  } catch (error) {
    console.error('Error sending tracking data:', error);
    return false;
  }
};

// Get current tracking data
export const getTrackingData = async (): Promise<VesselTrackingData | null> => {
  try {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    const data = await AsyncStorage.getItem(TRACKING_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting tracking data:', error);
    return null;
  }
};

// Get nearby tracked vessels (simulated - in production, fetch from backend)
export const getNearbyTrackedVessels = async (
  userLat: number,
  userLng: number,
  radiusKm: number = 100 // Increased default radius to 100km for better detection
): Promise<TrackedVessel[]> => {
  try {
    const { getAllTrackingData } = await import('./database');
    const allVessels = await getAllTrackingData();

    const nearby = allVessels.filter(vessel => {
      const distance = calculateDistance(
        userLat,
        userLng,
        vessel.location.latitude,
        vessel.location.longitude
      );
      return distance <= radiusKm;
    });

    // Convert TrackingData to TrackedVessel format
    return nearby.map(vessel => ({
      id: vessel.userId,
      userId: vessel.userId,
      vesselInfo: {
        vesselName: vessel.vesselName,
        vesselId: vessel.userId,
        vesselType: 'Vessel',
      },
      location: vessel.location,
      status: vessel.status,
      lastUpdate: vessel.location.timestamp,
    }));
  } catch (error) {
    // Silently return empty array on error
    return [];
  }
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Start continuous tracking
export const startTracking = (
  onLocationUpdate: (location: { latitude: number; longitude: number }) => void
) => {
  const Location = require('expo-location');

  return Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000, // Update every 5 seconds
      distanceInterval: 10, // Or when moved 10 meters
    },
    (location: any) => {
      onLocationUpdate({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    }
  );
};