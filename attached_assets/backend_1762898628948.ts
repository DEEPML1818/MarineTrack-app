
// 🌐 Backend Configuration
// Update this with your local machine's IP address
// Example for LAN testing: 'http://192.168.1.100:3000'
// ⚠️ Make sure this IP is reachable from your mobile device if using Expo!

// IMPORTANT: Replace this with your actual local IP address
// Find it by running: ipconfig (Windows) or ifconfig (Mac/Linux)
const LOCAL_IP = '192.168.0.194'; // <<< CHANGE THIS TO YOUR ACTUAL IP

export const BACKEND_CONFIG = {
  // Local machine IP
  URL: `http://${LOCAL_IP}:3000`,

  // WebSocket URL (automatically derived from the HTTP URL)
  get WS_URL() {
    return this.URL.replace(/^http/, "ws");
  },
};

// ✅ Helper: Check if backend server is reachable
export const checkBackendConnection = async (): Promise<boolean> => {
  const healthUrl = `${BACKEND_CONFIG.URL}/api/health`;

  try {
    console.log("🔍 Checking backend connectivity at:", healthUrl);

    const response = await fetch(healthUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.warn(
        "⚠️ Backend health check failed with status:",
        response.status,
      );
      return false;
    }

    const data = await response.text();
    console.log("✅ Backend reachable. Response:", data || "OK");
    return true;
  } catch (error) {
    console.error("🚨 Backend connection failed:", error);
    return false;
  }
};
