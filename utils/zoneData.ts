export interface Zone {
  id: string;
  name: string;
  type: 'safe' | 'restricted' | 'border' | 'fishing';
  coordinates: Array<{ lat: number; lng: number }>;
  description: string;
  color: string;
  opacity: number;
}

export interface Route {
  id: string;
  name: string;
  coordinates: Array<{ lat: number; lng: number }>;
  distance: number;
  estimatedTime: number;
  hazards: string[];
  vesselDensity: 'low' | 'medium' | 'high';
}

export const maritimeZones: Zone[] = [
  {
    id: 'safe_zone_1',
    name: 'Prime Fishing Zone - Bay Area',
    type: 'safe',
    coordinates: [
      { lat: 13.0, lng: 80.2 },
      { lat: 13.1, lng: 80.2 },
      { lat: 13.1, lng: 80.35 },
      { lat: 13.0, lng: 80.35 },
    ],
    description: 'Excellent fishing conditions, abundant fish population, calm waters',
    color: '#22c55e',
    opacity: 0.3,
  },
  {
    id: 'safe_zone_2',
    name: 'Good Fishing Zone - Coastal Waters',
    type: 'fishing',
    coordinates: [
      { lat: 12.9, lng: 80.15 },
      { lat: 12.95, lng: 80.15 },
      { lat: 12.95, lng: 80.25 },
      { lat: 12.9, lng: 80.25 },
    ],
    description: 'Good fish population, moderate conditions',
    color: '#84cc16',
    opacity: 0.25,
  },
  {
    id: 'restricted_zone_1',
    name: 'Naval Restricted Area',
    type: 'restricted',
    coordinates: [
      { lat: 13.05, lng: 80.4 },
      { lat: 13.15, lng: 80.4 },
      { lat: 13.15, lng: 80.5 },
      { lat: 13.05, lng: 80.5 },
    ],
    description: 'Military operations area - STRICTLY NO ENTRY',
    color: '#ef4444',
    opacity: 0.4,
  },
  {
    id: 'restricted_zone_2',
    name: 'Marine Protected Area',
    type: 'restricted',
    coordinates: [
      { lat: 12.85, lng: 80.3 },
      { lat: 12.9, lng: 80.3 },
      { lat: 12.9, lng: 80.4 },
      { lat: 12.85, lng: 80.4 },
    ],
    description: 'Protected marine ecosystem - Fishing prohibited',
    color: '#f59e0b',
    opacity: 0.35,
  },
  {
    id: 'border_zone_1',
    name: 'International Maritime Boundary',
    type: 'border',
    coordinates: [
      { lat: 13.2, lng: 80.0 },
      { lat: 13.2, lng: 80.6 },
      { lat: 13.22, lng: 80.6 },
      { lat: 13.22, lng: 80.0 },
    ],
    description: 'International waters boundary - Permits required beyond this line',
    color: '#facc15',
    opacity: 0.4,
  },
  {
    id: 'safe_zone_3',
    name: 'Offshore Fishing Zone',
    type: 'fishing',
    coordinates: [
      { lat: 13.15, lng: 80.25 },
      { lat: 13.2, lng: 80.25 },
      { lat: 13.2, lng: 80.35 },
      { lat: 13.15, lng: 80.35 },
    ],
    description: 'Deep sea fishing area, good catch potential',
    color: '#10b981',
    opacity: 0.25,
  },
];

export function calculateOptimalRoute(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  avoidZones: Zone[] = []
): Route {
  const numSamples = 20;
  const routePoints: Array<{ lat: number; lng: number }> = [];
  
  for (let i = 0; i <= numSamples; i++) {
    const fraction = i / numSamples;
    routePoints.push({
      lat: start.lat + (end.lat - start.lat) * fraction,
      lng: start.lng + (end.lng - start.lng) * fraction,
    });
  }

  const directRoute: Route = {
    id: 'route_' + Date.now(),
    name: 'Direct Route',
    coordinates: routePoints,
    distance: calculateDistance(start.lat, start.lng, end.lat, end.lng),
    estimatedTime: 0,
    hazards: [],
    vesselDensity: 'low',
  };

  directRoute.estimatedTime = (directRoute.distance / 15) * 60;

  const hazards: string[] = [];
  const crossedZones = new Set<string>();
  
  avoidZones.forEach(zone => {
    for (const point of routePoints) {
      if (isPointInPolygon(point, zone.coordinates)) {
        if (!crossedZones.has(zone.id)) {
          crossedZones.add(zone.id);
          if (zone.type === 'restricted') {
            hazards.push(`⚠️ Route crosses ${zone.name}`);
          } else if (zone.type === 'border') {
            hazards.push(`🚧 Route crosses ${zone.name}`);
          }
        }
        break;
      }
    }
  });

  directRoute.hazards = hazards;

  return directRoute;
}

function isPointInPolygon(
  point: { lat: number; lng: number },
  polygon: Array<{ lat: number; lng: number }>
): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng, yi = polygon[i].lat;
    const xj = polygon[j].lng, yj = polygon[j].lat;

    const intersect = ((yi > point.lat) !== (yj > point.lat))
      && (point.lng < (xj - xi) * (point.lat - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function isInRestrictedZone(
  location: { lat: number; lng: number },
  zones: Zone[] = maritimeZones
): Zone | null {
  for (const zone of zones) {
    if (zone.type === 'restricted' && isPointInPolygon(location, zone.coordinates)) {
      return zone;
    }
  }
  return null;
}

export function getNearestSafeZone(
  location: { lat: number; lng: number },
  zones: Zone[] = maritimeZones
): Zone | null {
  const safeZones = zones.filter(z => z.type === 'safe' || z.type === 'fishing');
  
  if (safeZones.length === 0) return null;

  let nearest = safeZones[0];
  let minDistance = Infinity;

  safeZones.forEach(zone => {
    const centerLat = zone.coordinates.reduce((sum, c) => sum + c.lat, 0) / zone.coordinates.length;
    const centerLng = zone.coordinates.reduce((sum, c) => sum + c.lng, 0) / zone.coordinates.length;
    const distance = calculateDistance(location.lat, location.lng, centerLat, centerLng);
    
    if (distance < minDistance) {
      minDistance = distance;
      nearest = zone;
    }
  });

  return nearest;
}

export function getRestrictedZones(zones: Zone[] = maritimeZones): Zone[] {
  return zones.filter(zone => zone.type === 'restricted');
}

export function getSafeZones(zones: Zone[] = maritimeZones): Zone[] {
  return zones.filter(zone => zone.type === 'safe' || zone.type === 'fishing');
}

export function getBorderZones(zones: Zone[] = maritimeZones): Zone[] {
  return zones.filter(zone => zone.type === 'border');
}

export function checkZoneWarnings(
  location: { lat: number; lng: number }
): { warning: boolean; message: string; zone?: Zone } {
  const restrictedZone = isInRestrictedZone(location);
  
  if (restrictedZone) {
    return {
      warning: true,
      message: `WARNING: You are in ${restrictedZone.name}! ${restrictedZone.description}`,
      zone: restrictedZone,
    };
  }

  const nearestSafeZone = getNearestSafeZone(location);
  const distanceToSafe = nearestSafeZone
    ? calculateDistance(
        location.lat,
        location.lng,
        nearestSafeZone.coordinates[0].lat,
        nearestSafeZone.coordinates[0].lng
      )
    : Infinity;

  if (distanceToSafe > 10) {
    return {
      warning: true,
      message: `You are ${distanceToSafe.toFixed(1)} km from the nearest fishing zone`,
    };
  }

  return { warning: false, message: 'All clear' };
}
