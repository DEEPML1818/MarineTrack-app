# MarineTrack - Marine Safety & Tracking App 🚢

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## 🛰️ AIS Location Tracking Feature

MarineTrack now includes a powerful AIS (Automatic Identification System) tracker that turns your phone into a marine beacon:

### Features:
- **Real-time GPS Tracking**: Broadcasts your vessel's position every 5 seconds
- **AIS Beacon**: Your phone acts as an AIS transmitter for nearby vessels
- **Vessel Information**: Store complete vessel details (Name, ID, Type, MMSI, IMO)
- **Backend Integration**: All tracking data is sent to backend for storage and retrieval
- **Nearby Vessels**: See other MarineTrack users within 10km radius
- **Status Updates**: Set your vessel status (Active, Idle, Anchored)

### How to Use:
1. Go to the **Tracker** tab
2. Fill in your vessel information (Name and ID are required)
3. Enable the tracking switch
4. Your location will be broadcast to nearby vessels
5. View other tracked vessels in the dashboard

### Backend Integration:
The app uses `utils/trackingService.ts` which stores data locally. To connect to your backend:

1. Replace the mock API call in `sendTrackingData()` with your actual endpoint:
```typescript
const response = await fetch('https://your-backend-api.com/api/tracking', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

2. Update `getNearbyTrackedVessels()` to fetch from your backend API

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
