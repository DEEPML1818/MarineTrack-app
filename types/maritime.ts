
export interface Vessel {
  id: string;
  name: string;
  mmsi: string;
  imo?: string;
  type: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  lastUpdate: number;
  distance?: number;
}

export interface Hazard {
  id: string;
  type: 'debris' | 'shallow_water' | 'weather' | 'congestion' | 'restricted_zone';
  latitude: number;
  longitude: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  reportedBy: string;
  upvotes: number;
  downvotes: number;
  timestamp: number;
  verified: boolean;
}

export interface Route {
  id: string;
  waypoints: Array<{latitude: number; longitude: number}>;
  distance: number;
  estimatedTime: number;
  safetyScore: number;
  hazards: Hazard[];
}

export interface WeatherData {
  temperature: number;
  windSpeed: number;
  windDirection: number;
  waveHeight: number;
  visibility: number;
  seaState: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  vesselId: string;
  vesselName: string;
  message: string;
  timestamp: number;
  distance: number;
}

export interface SOSAlert {
  id: string;
  vesselId: string;
  vesselName: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  status: 'active' | 'responded' | 'resolved';
}
