
// Backend API Configuration
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://192.168.0.194:3000';
const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://192.168.0.194:3000';

export const API_CONFIG = {
  BACKEND_URL,
  SOCKET_URL,
};

export function getBackendUrl(): string {
  console.log('Backend URL configured:', API_CONFIG.BACKEND_URL);
  return API_CONFIG.BACKEND_URL;
}

export function getSocketUrl(): string {
  console.log('Socket URL configured:', API_CONFIG.SOCKET_URL);
  return API_CONFIG.SOCKET_URL;
}
