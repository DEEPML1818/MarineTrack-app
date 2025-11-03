# MarineTrack Setup Instructions for Local Network

## Quick Start Guide

Your MarineTrack app is now configured with a backend server that stores vessel data in JSON files. Follow these steps to run the app on multiple devices connected to the same WiFi network.

## Step 1: Find Your Computer's Local IP Address

### On Windows:
1. Open Command Prompt
2. Type: `ipconfig`
3. Look for "IPv4 Address" under your WiFi adapter (usually looks like `192.168.1.100`)

### On Mac:
1. Open Terminal
2. Type: `ifconfig` or `ip addr show`
3. Look for your local IP address (usually starts with `192.168.` or `10.0.`)

### On Linux:
1. Open Terminal
2. Type: `hostname -I` or `ip addr show`
3. Look for your local IP address

**Example IP:** `192.168.1.100` (your actual IP will be different)

## Step 2: Update the Backend Configuration

1. Open the file `config.ts` in the root directory of this project
2. Replace `localhost` with your actual local IP address:

```typescript
export const API_CONFIG = {
  BACKEND_URL: 'http://YOUR_LOCAL_IP:3000',  // Replace YOUR_LOCAL_IP
  SOCKET_URL: 'http://YOUR_LOCAL_IP:3000',   // Replace YOUR_LOCAL_IP
};
```

**Example:**
```typescript
export const API_CONFIG = {
  BACKEND_URL: 'http://192.168.1.100:3000',
  SOCKET_URL: 'http://192.168.1.100:3000',
};
```

## Step 3: Start the Backend Server

The backend server should already be running in Replit. If not, start it manually:

```bash
cd backend
npm start
```

You should see:
```
MarineTrack backend server running on port 3000
```

## Step 4: Run the App on Your Devices

### For Android Devices:
1. Make sure your device is connected to the same WiFi network as your computer
2. Open Expo Go app on your device
3. Scan the QR code from the Expo development server
4. The app will load and connect to the backend server

### For iOS Devices:
1. Make sure your device is connected to the same WiFi network as your computer
2. Open the Camera app
3. Scan the QR code from the Expo development server
4. The app will load and connect to the backend server

## Step 5: Test Vessel Tracking

1. **On Device 1:**
   - Sign in or continue as guest
   - Complete the onboarding
   - Enter vessel information
   - Allow location permissions
   - Start tracking your vessel

2. **On Device 2:**
   - Sign in or continue as guest
   - Complete the onboarding
   - Enter a different vessel name
   - Allow location permissions
   - Start tracking

3. **Check if vessels appear:**
   - Both devices should now see each other's vessels on the map
   - The vessels should appear in the "Nearby Vessels" list
   - Real-time location updates should be reflected on both devices

## Data Storage Location

All vessel data is stored in JSON files at:
```
backend/data/vessels.json    - Vessel tracking data
backend/data/users.json      - User information
backend/data/messages.json   - Chat messages
```

You can view these files to see the stored data.

## Troubleshooting

### Issue: "Network request failed" error

**Solutions:**
1. ✅ Verify the backend server is running (check Replit console)
2. ✅ Confirm your IP address in `config.ts` is correct
3. ✅ Make sure all devices are on the same WiFi network
4. ✅ Check your firewall allows connections on port 3000
5. ✅ Try pinging your computer from your mobile device

### Issue: No vessels appearing on the map

**Solutions:**
1. ✅ Check `backend/data/vessels.json` to see if data is being saved
2. ✅ Verify location permissions are granted on your device
3. ✅ Make sure you've started tracking on at least one device
4. ✅ Check the console logs for any errors
5. ✅ Ensure the backend URL in `config.ts` is correct

### Issue: Devices can't connect to backend

**Solutions:**
1. ✅ Make sure you're using your local IP, not `localhost`
2. ✅ Verify your WiFi network allows device-to-device communication
3. ✅ Try accessing `http://YOUR_IP:3000/api/health` from your phone's browser
4. ✅ Disable any VPN or network isolation features on your router

### Issue: Chat messages not appearing

**Solutions:**
1. ✅ Check `backend/data/messages.json` to see if messages are being saved
2. ✅ Verify Socket.IO is connecting properly (check console logs)
3. ✅ Ensure the socket URL in `config.ts` matches your backend URL

## Testing the Backend

You can test the backend API directly:

1. **Health Check** (from any browser):
   ```
   http://YOUR_LOCAL_IP:3000/api/health
   ```
   Should return: `{"status":"ok","message":"MarineTrack backend server running"}`

2. **View All Vessels**:
   ```
   http://YOUR_LOCAL_IP:3000/api/vessels
   ```

3. **View Nearby Vessels**:
   ```
   http://YOUR_LOCAL_IP:3000/api/vessels/nearby?lat=40.7128&lng=-74.0060&radius=100
   ```

## Recording Video

When recording your demo video:
1. Start the backend server on your PC
2. Connect at least 2 devices to the same WiFi
3. Show vessel tracking working between devices
4. Demonstrate the real-time chat feature
5. Show the vessels appearing on the map

## Port Configuration

- **Backend Server:** Port 3000
- **Expo Dev Server:** Port 5000 (for web preview)
- **Metro Bundler:** Automatically assigned

## Next Steps

Once everything is working:
1. The vessel data is automatically saved to JSON files
2. Multiple devices can see each other's locations
3. Chat messages are shared between all connected devices
4. All data persists even after restarting the backend server

Good luck with your video recording! 🚢
