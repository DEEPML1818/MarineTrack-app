import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { calculateSpeed, calculateHeading } from '../services/gpsService';

interface GPSLocation {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number | null;
  timestamp: number;
}

interface PositionTrail {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface UseGPSTrackingReturn {
  location: GPSLocation | null;
  speed: number;
  heading: number;
  trail: PositionTrail[];
  accuracy: number | null;
  isTracking: boolean;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  error: string | null;
}

const MAX_TRAIL_LENGTH = 100;
const UPDATE_INTERVAL = 1000;

export function useGPSTracking(): UseGPSTrackingReturn {
  const [location, setLocation] = useState<GPSLocation | null>(null);
  const [speed, setSpeed] = useState<number>(0);
  const [heading, setHeading] = useState<number>(0);
  const [trail, setTrail] = useState<PositionTrail[]>([]);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const previousPosition = useRef<GPSLocation | null>(null);

  const startTracking = async () => {
    try {
      setError(null);

      const { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus !== 'granted') {
        setError('Foreground location permission not granted');
        return;
      }

      const { status: backgroundStatus } =
        await Location.requestBackgroundPermissionsAsync();

      if (backgroundStatus !== 'granted') {
        console.warn('Background location permission not granted');
      }

      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: UPDATE_INTERVAL,
          distanceInterval: 0,
        },
        (position) => {
          const newLocation: GPSLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };

          setLocation(newLocation);
          setAccuracy(position.coords.accuracy);

          if (previousPosition.current) {
            const timeDelta = newLocation.timestamp - previousPosition.current.timestamp;

            if (timeDelta > 0) {
              const calculatedSpeed = calculateSpeed(
                previousPosition.current,
                newLocation,
                timeDelta
              );
              setSpeed(calculatedSpeed);

              const calculatedHeading = calculateHeading(
                previousPosition.current,
                newLocation
              );
              setHeading(calculatedHeading);
            }
          }

          setTrail((prevTrail) => {
            const newTrail = [
              ...prevTrail,
              {
                latitude: newLocation.latitude,
                longitude: newLocation.longitude,
                timestamp: newLocation.timestamp,
              },
            ];

            if (newTrail.length > MAX_TRAIL_LENGTH) {
              return newTrail.slice(-MAX_TRAIL_LENGTH);
            }

            return newTrail;
          });

          previousPosition.current = newLocation;
        }
      );

      setIsTracking(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to start GPS tracking: ${errorMessage}`);
      setIsTracking(false);
    }
  };

  const stopTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    setIsTracking(false);
    previousPosition.current = null;
  };

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  return {
    location,
    speed,
    heading,
    trail,
    accuracy,
    isTracking,
    startTracking,
    stopTracking,
    error,
  };
}
