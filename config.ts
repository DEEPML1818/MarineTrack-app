// Backend API Configuration
// Configured for local network development

// IMPORTANT: Replace this with your actual local IP address
// Find it by running: ipconfig (Windows) or ifconfig (Mac/Linux)
const LOCAL_IP = '192.168.0.194'; // <<< CHANGE THIS TO YOUR ACTUAL IP

function getDefaultBackendUrl(): string {
  // For local development, use local IP
  return `http://${LOCAL_IP}:3000`;
}

function getDefaultRoutingUrl(): string {
  // For local development, use local IP
  return `http://${LOCAL_IP}:3001`;
}

function getDefaultSocketUrl(): string {
  // For local development, use local IP
  return `ws://${LOCAL_IP}:3000`;
}


