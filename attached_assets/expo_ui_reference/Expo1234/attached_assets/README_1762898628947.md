# MarineTrack Backend Server

This is the backend server for the MarineTrack application. It stores vessel tracking data in JSON files and provides real-time updates via Socket.IO.

## Features

- **JSON File Storage**: All data is stored in local JSON files (not in Replit database)
- **RESTful API**: Endpoints for saving and retrieving vessel data
- **Socket.IO**: Real-time vessel location and chat updates
- **Cross-Device Support**: Multiple devices can connect and share vessel data

## Data Storage

All data is stored in the `backend/data/` directory:
- `vessels.json` - Vessel tracking data
- `users.json` - User account data
- `messages.json` - Chat messages

## API Endpoints

### Health Check
```
GET /api/health
```

### Get All Vessels
```
GET /api/vessels
```

### Get Nearby Vessels
```
GET /api/vessels/nearby?lat={latitude}&lng={longitude}&radius={radiusKm}
```

### Save Vessel Tracking Data
```
POST /api/tracking
Body: {
  userId: string,
  vesselInfo: { vesselName, vesselId, vesselType },
  location: { latitude, longitude, heading, speed, timestamp },
  status: 'Active' | 'Idle' | 'Anchored'
}
```

### Save User Data
```
POST /api/users
Body: { id, email, name, ... }
```

### Get Messages
```
GET /api/messages
```

### Save Message
```
POST /api/messages
Body: { userId, userName, message, ... }
```

## Socket.IO Events

### Client to Server
- `vessel_location` - Send vessel location update
- `chat_message` - Send chat message

### Server to Client
- `vessel_update` - Receive vessel location update
- `new_message` - Receive new chat message

## Running Locally

1. **Start the backend server**:
   ```bash
   cd backend
   npm start
   ```
   The server will run on port 3000 by default.

2. **Find your local IP address**:
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig` or `ip addr show`
   Look for your local IP (e.g., 192.168.1.100)

3. **Update the frontend configuration**:
   Edit `config.ts` in the root directory and set:
   ```typescript
   BACKEND_URL: 'http://YOUR_LOCAL_IP:3000',
   SOCKET_URL: 'http://YOUR_LOCAL_IP:3000',
   ```
   For example:
   ```typescript
   BACKEND_URL: 'http://192.168.1.100:3000',
   SOCKET_URL: 'http://192.168.1.100:3000',
   ```

4. **Connect your devices**:
   - Make sure your PC and mobile devices are on the same WiFi network
   - Start the backend server on your PC
   - Run the Expo app on your mobile devices
   - The devices will now share vessel data through the backend server

## Environment Variables

You can configure the backend using environment variables:
- `PORT` - Server port (default: 3000)
- `EXPO_PUBLIC_BACKEND_URL` - Frontend backend URL
- `EXPO_PUBLIC_SOCKET_URL` - Frontend socket URL

## Testing

To test if the backend is working:

1. Open your browser and go to: `http://localhost:3000/api/health`
   You should see: `{"status":"ok","message":"MarineTrack backend server running"}`

2. Check the data files in `backend/data/` directory after using the app

## Troubleshooting

### "Network request failed" error
- Make sure the backend server is running
- Verify your local IP address is correct in `config.ts`
- Ensure your firewall allows connections on port 3000
- Check that all devices are on the same WiFi network

### No vessels appearing
- Check if vessel data is being saved in `backend/data/vessels.json`
- Verify the backend server logs for any errors
- Make sure location permissions are granted on mobile devices

### Chat not working
- Check `backend/data/messages.json` for saved messages
- Verify Socket.IO connection in browser console
- Ensure the socket URL matches your backend URL
