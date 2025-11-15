
export interface NauticalDirection {
  instruction: string;
  distance: number; // in nautical miles
  bearing: number; // in degrees
  maneuver: 'straight' | 'port' | 'starboard' | 'hard-port' | 'hard-starboard';
  waypoint: { lat: number; lng: number };
}

export function calculateBearing(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
  const lat1 = from.lat * Math.PI / 180;
  const lat2 = to.lat * Math.PI / 180;
  const dLon = (to.lng - from.lng) * Math.PI / 180;

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const bearing = Math.atan2(y, x) * 180 / Math.PI;
  
  return (bearing + 360) % 360;
}

export function getManeuverType(currentBearing: number, nextBearing: number): NauticalDirection['maneuver'] {
  let turnAngle = nextBearing - currentBearing;
  if (turnAngle > 180) turnAngle -= 360;
  if (turnAngle < -180) turnAngle += 360;

  if (Math.abs(turnAngle) < 15) return 'straight';
  if (turnAngle > 45) return 'hard-starboard';
  if (turnAngle > 0) return 'starboard';
  if (turnAngle < -45) return 'hard-port';
  return 'port';
}

export function generateNauticalDirections(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  waypoints: Array<{ lat: number; lng: number }> = []
): NauticalDirection[] {
  const directions: NauticalDirection[] = [];
  const allPoints = [origin, ...waypoints, destination];

  for (let i = 0; i < allPoints.length - 1; i++) {
    const from = allPoints[i];
    const to = allPoints[i + 1];
    const bearing = calculateBearing(from, to);
    const distance = calculateDistance(from.lat, from.lng, to.lat, to.lng) * 0.539957; // km to nautical miles

    const maneuver = i === 0 ? 'straight' : getManeuverType(
      calculateBearing(allPoints[i - 1], from),
      bearing
    );

    const instruction = generateInstruction(maneuver, bearing, distance, i === allPoints.length - 2);
    
    directions.push({
      instruction,
      distance,
      bearing,
      maneuver,
      waypoint: to,
    });
  }

  return directions;
}

function generateInstruction(
  maneuver: NauticalDirection['maneuver'],
  bearing: number,
  distance: number,
  isFinal: boolean
): string {
  if (isFinal) {
    return `Arrive at destination in ${distance.toFixed(1)} nautical miles`;
  }

  const cardinalDirection = getCardinalDirection(bearing);
  
  switch (maneuver) {
    case 'straight':
      return `Continue ${cardinalDirection} for ${distance.toFixed(1)} nm`;
    case 'port':
      return `Turn to port (left) ${bearing.toFixed(0)}°, proceed ${distance.toFixed(1)} nm`;
    case 'starboard':
      return `Turn to starboard (right) ${bearing.toFixed(0)}°, proceed ${distance.toFixed(1)} nm`;
    case 'hard-port':
      return `Hard turn to port ${bearing.toFixed(0)}°, proceed ${distance.toFixed(1)} nm`;
    case 'hard-starboard':
      return `Hard turn to starboard ${bearing.toFixed(0)}°, proceed ${distance.toFixed(1)} nm`;
    default:
      return `Proceed ${cardinalDirection} for ${distance.toFixed(1)} nm`;
  }
}

function getCardinalDirection(bearing: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(bearing / 22.5) % 16;
  return directions[index];
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
