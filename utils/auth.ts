
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email: string | null;
  name: string;
  photoUrl?: string;
  isGuest: boolean;
  vesselInfo?: {
    vesselName: string;
    vesselId: string;
    vesselType: string;
  };
  createdAt: string;
}

interface StoredCredentials {
  email: string;
  password: string;
  userId: string;
}

const STORAGE_KEY = '@marinetrack_user';
const GUEST_USER_KEY = '@marinetrack_guest_id';
const CREDENTIALS_KEY = '@marinetrack_credentials';

// Store user credentials
export const storeCredentials = async (email: string, password: string, userId: string): Promise<void> => {
  try {
    const credentials: StoredCredentials = { email, password, userId };
    await AsyncStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
  } catch (error) {
    console.error('Error storing credentials:', error);
  }
};

// Get stored credentials
export const getStoredCredentials = async (): Promise<StoredCredentials[]> => {
  try {
    const stored = await AsyncStorage.getItem(CREDENTIALS_KEY);
    return stored ? [JSON.parse(stored)] : [];
  } catch (error) {
    console.error('Error getting credentials:', error);
    return [];
  }
};

// Login with email and password
export const loginWithEmailPassword = async (email: string, password: string): Promise<boolean> => {
  try {
    const credentials = await getStoredCredentials();
    const match = credentials.find(c => c.email === email && c.password === password);
    
    if (match) {
      const user: User = {
        id: match.userId,
        email,
        name: email.split('@')[0],
        isGuest: false,
        createdAt: new Date().toISOString()
      };
      await storeUser(user);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error logging in:', error);
    return false;
  }
};

// Register new user
export const registerUser = async (email: string, password: string, name: string): Promise<boolean> => {
  try {
    const userId = `user_${Date.now()}`;
    await storeCredentials(email, password, userId);
    
    const user: User = {
      id: userId,
      email,
      name,
      isGuest: false,
      createdAt: new Date().toISOString()
    };
    await storeUser(user);
    return true;
  } catch (error) {
    console.error('Error registering user:', error);
    return false;
  }
};

// Store user data
export const storeUser = async (user: User): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error storing user:', error);
  }
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const userData = await AsyncStorage.getItem(STORAGE_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

// Create guest user
export const createGuestUser = async (): Promise<User> => {
  let guestId = await AsyncStorage.getItem(GUEST_USER_KEY);
  
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await AsyncStorage.setItem(GUEST_USER_KEY, guestId);
  }

  const guestUser: User = {
    id: guestId,
    email: null,
    name: 'Guest User',
    isGuest: true,
    createdAt: new Date().toISOString()
  };

  await storeUser(guestUser);
  return guestUser;
};

// Sign out
export const signOut = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error signing out:', error);
  }
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return user !== null;
};

// Update vessel info
export const updateVesselInfo = async (vesselInfo: User['vesselInfo']): Promise<void> => {
  try {
    const user = await getCurrentUser();
    if (user) {
      user.vesselInfo = vesselInfo;
      await storeUser(user);
    }
  } catch (error) {
    console.error('Error updating vessel info:', error);
  }
};
