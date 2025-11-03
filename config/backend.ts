// 🌐 Backend Configuration
// Update this with your backend server's IP or domain.
// Example for LAN testing: 'http://192.168.1.100:3000'
// ⚠️ Make sure this IP is reachable from your mobile device if using Expo!

export const BACKEND_CONFIG = {
  // Local LAN IP (adjust this for your environment)
  URL: "http://192.168.0.194:3000",

  // Alternate localhost option (for same-device web testing)
  // URL: 'http://localhost:3000',

  // WebSocket URL (automatically derived from the HTTP URL)
  get WS_URL() {
    return this.URL.replace(/^http/, "ws");
  },
};

// ✅ Helper: Check if backend server is reachable
export const checkBackendConnection = async (): Promise<boolean> => {
  const healthUrl = `${BACKEND_CONFIG.URL}/health`;

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
