// Backend API Configuration
// Update this with your actual backend server URL when running
export const API_CONFIG = {
  // For local development on physical device, use your computer's local IP address
  // Example: 'http://192.168.1.100:3000'
  // For Android emulator, use: 'http://10.0.2.2:3000'
  // For iOS simulator, use: 'http://localhost:3000'
  BACKEND_URL: process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000',
  
  // Socket.IO URL (usually same as backend URL)
  SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3000',
};

// Helper function to get the correct backend URL
export function getBackendUrl(): string {
  return API_CONFIG.BACKEND_URL;
}

export function getSocketUrl(): string {
  return API_CONFIG.SOCKET_URL;
}
