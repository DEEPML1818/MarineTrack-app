
import { getBackendUrl, getRoutingUrl } from '../config';

export interface MaritimeHazard {
  id: string;
  type: 'debris' | 'shallow' | 'weather' | 'congestion' | 'regulatory' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  lat: number;
  lng: number;
  description: string;
  reportedBy: string;
  vesselId?: string;
  timestamp: string;
  expiresAt: string;
  verified: boolean;
  upvotes: number;
  downvotes: number;
  distance?: number;
}

export interface TrafficReport {
  id: string;
  lat: number;
  lng: number;
  density: 'low' | 'medium' | 'high' | 'critical';
  vesselCount: number;
  portCode?: string;
  timestamp: string;
  reportedBy: string;
}

export interface RoutePrediction {
  estimatedDelay: number;
  weatherRisk: 'low' | 'medium' | 'high';
  collisionRisk: 'low' | 'medium' | 'high';
  fuelEfficiency: number;
  recommendedSpeed: number;
}

export interface EnhancedRoute {
  coordinates: Array<{ lat: number; lng: number }>;
  distance: number;
  duration: number;
  directions: Array<any>;
  origin: any;
  destination: any;
  safetyScore: number;
  trafficDensity: 'low' | 'medium' | 'high' | 'critical';
  hazards: MaritimeHazard[];
  prediction: RoutePrediction;
  recommendations: string[];
  alternativeRoutes: Array<any>;
}

// Dynamic routing API that works in both development and production
function getRoutingAPI(): string {
  return `${getRoutingUrl()}/api`;
}

// Report a maritime hazard (crowdsourced)
export const reportHazard = async (
  type: MaritimeHazard['type'],
  severity: MaritimeHazard['severity'],
  lat: number,
  lng: number,
  description: string,
  reportedBy: string,
  vesselId?: string,
  expiryHours: number = 24
): Promise<MaritimeHazard | null> => {
  try {
    const response = await fetch(`${getRoutingAPI()}/hazards/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        severity,
        lat,
        lng,
        description,
        reportedBy,
        vesselId,
        expiryHours
      })
    });

    if (!response.ok) throw new Error('Failed to report hazard');
    
    const data = await response.json();
    return data.hazard;
  } catch (error) {
    console.error('Error reporting hazard:', error);
    return null;
  }
};

// Get nearby hazards
export const getNearbyHazards = async (
  lat: number,
  lng: number,
  radius: number = 50
): Promise<MaritimeHazard[]> => {
  try {
    const response = await fetch(
      `${getRoutingAPI()}/hazards/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
    );

    if (!response.ok) throw new Error('Failed to fetch hazards');
    
    const data = await response.json();
    return data.hazards;
  } catch (error) {
    console.error('Error fetching hazards:', error);
    return [];
  }
};

// Vote on hazard credibility
export const voteHazard = async (
  hazardId: string,
  vote: 'up' | 'down'
): Promise<boolean> => {
  try {
    const response = await fetch(`${getRoutingAPI()}/hazards/${hazardId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vote })
    });

    return response.ok;
  } catch (error) {
    console.error('Error voting on hazard:', error);
    return false;
  }
};

// Report traffic/congestion
export const reportTraffic = async (
  lat: number,
  lng: number,
  density: TrafficReport['density'],
  vesselCount: number,
  vesselId: string,
  portCode?: string
): Promise<TrafficReport | null> => {
  try {
    const response = await fetch(`${getRoutingAPI()}/traffic/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lat,
        lng,
        density,
        vesselCount,
        vesselId,
        portCode
      })
    });

    if (!response.ok) throw new Error('Failed to report traffic');
    
    const data = await response.json();
    return data.report;
  } catch (error) {
    console.error('Error reporting traffic:', error);
    return null;
  }
};

// Get traffic heatmap data
export const getTrafficHeatmap = async (): Promise<TrafficReport[]> => {
  try {
    const response = await fetch(`${getRoutingAPI()}/traffic/heatmap`);

    if (!response.ok) throw new Error('Failed to fetch traffic data');
    
    const data = await response.json();
    return data.traffic;
  } catch (error) {
    console.error('Error fetching traffic heatmap:', error);
    return [];
  }
};

// Calculate AI-optimized route
export const calculateIntelligentRoute = async (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  preferences?: {
    speed?: number;
    showAlternatives?: boolean;
  }
): Promise<EnhancedRoute | null> => {
  try {
    const response = await fetch(`${getRoutingAPI()}/route/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin,
        destination,
        preferences
      })
    });

    if (!response.ok) throw new Error('Failed to calculate route');
    
    const data = await response.json();
    return data.route;
  } catch (error) {
    console.error('Error calculating intelligent route:', error);
    return null;
  }
};

// Get hazard icon
export const getHazardIcon = (type: MaritimeHazard['type']): string => {
  const icons = {
    debris: '🪵',
    shallow: '⚓',
    weather: '🌧️',
    congestion: '🚦',
    regulatory: '⚠️',
    other: '📍'
  };
  return icons[type] || '⚠️';
};

// Get severity color
export const getSeverityColor = (severity: MaritimeHazard['severity']): string => {
  const colors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
    critical: '#991b1b'
  };
  return colors[severity] || '#6b7280';
};

// Get traffic density color
export const getTrafficColor = (density: TrafficReport['density']): string => {
  const colors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
    critical: '#991b1b'
  };
  return colors[density] || '#6b7280';
};
