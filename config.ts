// Backend API Configuration
// Automatically detects the correct backend URL based on environment

function getDefaultBackendUrl(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    if (hostname.includes('replit.dev') || hostname.includes('repl.co')) {
      const protocol = window.location.protocol;
      return `${protocol}//${hostname}:3000`;
    }
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000';
    }
  }
  
  return 'http://localhost:3000';
}

export const API_CONFIG = {
  BACKEND_URL: process.env.EXPO_PUBLIC_BACKEND_URL || getDefaultBackendUrl(),
  SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL || getDefaultBackendUrl(),
};

// Helper function to get the correct backend URL
export function getBackendUrl(): string {
  return API_CONFIG.BACKEND_URL;
}

export function getSocketUrl(): string {
  return API_CONFIG.SOCKET_URL;
}
