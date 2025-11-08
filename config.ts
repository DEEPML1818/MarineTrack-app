// Backend API Configuration
// Automatically detects the correct backend URL for Replit environment
function getDefaultBackendUrl(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('replit.dev') || hostname.includes('repl.co')) {
      const protocol = window.location.protocol;
      const parts = hostname.split('-');
      if (parts.length > 0) {
        const replitDomain = hostname;
        return `${protocol}//${replitDomain}:3000`;
      }
    }
  }
  

  return 'http://192.168.0.194:3000';
}

export const API_CONFIG = {
  BACKEND_URL: process.env.EXPO_PUBLIC_BACKEND_URL || getDefaultBackendUrl(),
  SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL || getDefaultBackendUrl(),
};

// Helper function to get the correct backend URL
export function getBackendUrl(): string {
  const url = API_CONFIG.BACKEND_URL;
  console.log('Backend URL configured:', url);
  return url;
}

export function getSocketUrl(): string {
  const url = API_CONFIG.SOCKET_URL;
  console.log('Socket URL configured:', url);
  return url;
}
