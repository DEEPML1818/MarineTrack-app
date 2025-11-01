import AsyncStorage from '@react-native-async-storage/async-storage';

// Database keys
const DB_USERS_KEY = 'marinetrack_users';
const DB_BOATS_KEY = 'marinetrack_boats';
const DB_TRACKING_KEY = 'marinetrack_tracking';

export interface UserData {
  id: string;
  email: string | null;
  name: string;
  photoUrl?: string;
  phoneNumber?: string;
  isGuest: boolean;
  createdAt: string;
  lastLogin: string;
  vesselInfo?: {
    vesselName: string;
    vesselType: string;
    registrationNumber?: string;
    imoNumber?: string;
    callSign: string;
    homePort: string;
    vesselLength: string;
    vesselBeam: string;
    grossTonnage: string;
  };
  contactInfo?: {
    phone: string;
    email?: string;
    emergencyContact: string;
    emergencyPhone: string;
  };
}

export interface BoatData {
  userId: string;
  vesselName: string;
  vesselId: string;
  vesselType: string;
  mmsi?: string;
  imo?: string;
  length?: number;
  beam?: number;
  draft?: number;
  registrationNumber?: string;
  homePort?: string;
  updatedAt: string;
}

export interface TrackingData {
  userId: string;
  vesselName: string;
  location: {
    latitude: number;
    longitude: number;
    speed: number;
    heading: number;
    timestamp: string;
  };
  status: 'Active' | 'Idle' | 'Anchored';
}

// User operations
export const saveUserToDatabase = async (user: UserData): Promise<void> => {
  try {
    const usersData = await getAllUsers();
    const existingIndex = usersData.findIndex(u => u.id === user.id);

    if (existingIndex >= 0) {
      usersData[existingIndex] = { ...user, lastLogin: new Date().toISOString() };
    } else {
      usersData.push(user);
    }

    await AsyncStorage.setItem(DB_USERS_KEY, JSON.stringify(usersData));
  } catch (error) {
    console.error('Error saving user to database:', error);
  }
};

export const getUserFromDatabase = async (userId: string): Promise<UserData | null> => {
  try {
    const users = await getAllUsers();
    return users.find(u => u.id === userId) || null;
  } catch (error) {
    console.error('Error getting user from database:', error);
    return null;
  }
};

export const getAllUsers = async (): Promise<UserData[]> => {
  try {
    const data = await AsyncStorage.getItem(DB_USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
};

// Boat operations
export const saveBoatData = async (boat: BoatData): Promise<void> => {
  try {
    const boatsData = await getAllBoats();
    const existingIndex = boatsData.findIndex(b => b.userId === boat.userId);

    const updatedBoat = { ...boat, updatedAt: new Date().toISOString() };

    if (existingIndex >= 0) {
      boatsData[existingIndex] = updatedBoat;
    } else {
      boatsData.push(updatedBoat);
    }

    await AsyncStorage.setItem(DB_BOATS_KEY, JSON.stringify(boatsData));
  } catch (error) {
    console.error('Error saving boat data:', error);
  }
};

export const getBoatData = async (userId: string): Promise<BoatData | null> => {
  try {
    const boats = await getAllBoats();
    return boats.find(b => b.userId === userId) || null;
  } catch (error) {
    console.error('Error getting boat data:', error);
    return null;
  }
};

export const getAllBoats = async (): Promise<BoatData[]> => {
  try {
    const data = await AsyncStorage.getItem(DB_BOATS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting all boats:', error);
    return [];
  }
};

// Tracking operations
export const saveTrackingData = async (data: TrackingData): Promise<void> => {
  try {
    const trackingData = await getAllTrackingData();
    const existingIndex = trackingData.findIndex(t => t.userId === data.userId);

    if (existingIndex >= 0) {
      trackingData[existingIndex] = data;
    } else {
      trackingData.push(data);
    }

    await AsyncStorage.setItem(DB_TRACKING_KEY, JSON.stringify(trackingData));
  } catch (error) {
    console.error('Error saving tracking data:', error);
  }
};

export const getAllTrackingData = async (): Promise<TrackingData[]> => {
  try {
    const data = await AsyncStorage.getItem(DB_TRACKING_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting tracking data:', error);
    return [];
  }
};

export const getNearbyBoats = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 50
): Promise<TrackingData[]> => {
  try {
    const allTracking = await getAllTrackingData();

    return allTracking.filter(tracking => {
      const distance = calculateDistance(
        latitude,
        longitude,
        tracking.location.latitude,
        tracking.location.longitude
      );
      return distance <= radiusKm;
    });
  } catch (error) {
    console.error('Error getting nearby boats:', error);
    return [];
  }
};

// Helper function to calculate distance
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Delete operations (for user account deletion)
export const deleteUserData = async (userId: string): Promise<void> => {
  try {
    // Delete user
    const users = await getAllUsers();
    const filteredUsers = users.filter(u => u.id !== userId);
    await AsyncStorage.setItem(DB_USERS_KEY, JSON.stringify(filteredUsers));

    // Delete boat
    const boats = await getAllBoats();
    const filteredBoats = boats.filter(b => b.userId !== userId);
    await AsyncStorage.setItem(DB_BOATS_KEY, JSON.stringify(filteredBoats));

    // Delete tracking
    const tracking = await getAllTrackingData();
    const filteredTracking = tracking.filter(t => t.userId !== userId);
    await AsyncStorage.setItem(DB_TRACKING_KEY, JSON.stringify(filteredTracking));
  } catch (error) {
    console.error('Error deleting user data:', error);
  }
};