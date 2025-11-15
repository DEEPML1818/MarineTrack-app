
export interface AlternateRoute {
  id: string;
  name: string;
  distance: number;
  duration: number;
  eta: string;
  safetyScore: number;
  hazardCount: number;
  coordinates: Array<{ lat: number; lng: number }>;
  description: string;
}

export async function generateAlternateRoutes(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  hazards: any[]
): Promise<AlternateRoute[]> {
  const routes: AlternateRoute[] = [];
  
  // Main direct route
  const directDistance = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);
  const directDuration = (directDistance / 20) * 60; // 20 knots
  const directHazards = hazards.filter(h => isNearRoute([origin, destination], h));
  
  routes.push({
    id: 'direct',
    name: 'Direct Route',
    distance: directDistance,
    duration: directDuration,
    eta: new Date(Date.now() + directDuration * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    safetyScore: 100 - (directHazards.length * 10),
    hazardCount: directHazards.length,
    coordinates: [origin, destination],
    description: 'Fastest route',
  });
  
  // Safer route (avoids hazards)
  if (directHazards.length > 0) {
    const safeWaypoint = {
      lat: (origin.lat + destination.lat) / 2 + 0.05,
      lng: (origin.lng + destination.lng) / 2 + 0.05,
    };
    const safeDistance = calculateDistance(origin.lat, origin.lng, safeWaypoint.lat, safeWaypoint.lng) +
                         calculateDistance(safeWaypoint.lat, safeWaypoint.lng, destination.lat, destination.lng);
    const safeDuration = (safeDistance / 20) * 60;
    const safeHazards = hazards.filter(h => isNearRoute([origin, safeWaypoint, destination], h));
    
    routes.push({
      id: 'safe',
      name: 'Safer Route',
      distance: safeDistance,
      duration: safeDuration,
      eta: new Date(Date.now() + safeDuration * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      safetyScore: 100 - (safeHazards.length * 10),
      hazardCount: safeHazards.length,
      coordinates: [origin, safeWaypoint, destination],
      description: 'Avoids hazards',
    });
  }
  
  // Coastal route (follows coastline)
  const coastalWaypoint = {
    lat: (origin.lat + destination.lat) / 2,
    lng: origin.lng + (destination.lng - origin.lng) * 0.3,
  };
  const coastalDistance = calculateDistance(origin.lat, origin.lng, coastalWaypoint.lat, coastalWaypoint.lng) +
                          calculateDistance(coastalWaypoint.lat, coastalWaypoint.lng, destination.lat, destination.lng);
  const coastalDuration = (coastalDistance / 18) * 60; // Slower coastal speed
  const coastalHazards = hazards.filter(h => isNearRoute([origin, coastalWaypoint, destination], h));
  
  routes.push({
    id: 'coastal',
    name: 'Coastal Route',
    distance: coastalDistance,
    duration: coastalDuration,
    eta: new Date(Date.now() + coastalDuration * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    safetyScore: 95 - (coastalHazards.length * 10),
    hazardCount: coastalHazards.length,
    coordinates: [origin, coastalWaypoint, destination],
    description: 'Follows coastline',
  });
  
  return routes.sort((a, b) => b.safetyScore - a.safetyScore);
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function isNearRoute(route: Array<{ lat: number; lng: number }>, hazard: any): boolean {
  const threshold = 5; // 5km threshold
  for (let i = 0; i < route.length - 1; i++) {
    const dist = pointToLineDistance(
      { lat: hazard.lat, lng: hazard.lng },
      route[i],
      route[i + 1]
    );
    if (dist < threshold) return true;
  }
  return false;
}

function pointToLineDistance(
  point: { lat: number; lng: number },
  lineStart: { lat: number; lng: number },
  lineEnd: { lat: number; lng: number }
): number {
  const A = point.lat - lineStart.lat;
  const B = point.lng - lineStart.lng;
  const C = lineEnd.lat - lineStart.lat;
  const D = lineEnd.lng - lineStart.lng;
  
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  
  if (lenSq !== 0) param = dot / lenSq;
  
  let xx, yy;
  
  if (param < 0) {
    xx = lineStart.lat;
    yy = lineStart.lng;
  } else if (param > 1) {
    xx = lineEnd.lat;
    yy = lineEnd.lng;
  } else {
    xx = lineStart.lat + param * C;
    yy = lineStart.lng + param * D;
  }
  
  return calculateDistance(point.lat, point.lng, xx, yy);
}
