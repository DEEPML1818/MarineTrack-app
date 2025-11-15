export interface Position {
  latitude: number;
  longitude: number;
  timestamp: number;
}

const METERS_PER_SECOND_TO_KNOTS = 1.94384;
const METERS_TO_NAUTICAL_MILES = 0.000539957;
const EARTH_RADIUS_METERS = 6371000;

export function calculateSpeed(
  oldPos: Position,
  newPos: Position,
  timeDelta: number
): number {
  if (timeDelta <= 0) return 0;

  const distance = calculateDistanceMeters(oldPos, newPos);
  const timeInSeconds = timeDelta / 1000;
  const metersPerSecond = distance / timeInSeconds;

  return convertToKnots(metersPerSecond);
}

export function calculateHeading(oldPos: Position, newPos: Position): number {
  const lat1 = toRadians(oldPos.latitude);
  const lat2 = toRadians(newPos.latitude);
  const dLon = toRadians(newPos.longitude - oldPos.longitude);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  let bearing = Math.atan2(y, x);
  bearing = toDegrees(bearing);
  bearing = (bearing + 360) % 360;

  return bearing;
}

export function calculateDistance(pos1: Position, pos2: Position): number {
  const distanceMeters = calculateDistanceMeters(pos1, pos2);
  return distanceMeters * METERS_TO_NAUTICAL_MILES;
}

function calculateDistanceMeters(pos1: Position, pos2: Position): number {
  const lat1 = toRadians(pos1.latitude);
  const lat2 = toRadians(pos2.latitude);
  const dLat = toRadians(pos2.latitude - pos1.latitude);
  const dLon = toRadians(pos2.longitude - pos1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

export function formatSpeed(knots: number): string {
  return `${knots.toFixed(1)} kts`;
}

export function formatDistance(nm: number): string {
  if (nm < 0.1) {
    return `${(nm * 1852).toFixed(0)} m`;
  }
  return `${nm.toFixed(2)} NM`;
}

export function convertToKnots(metersPerSecond: number): number {
  return metersPerSecond * METERS_PER_SECOND_TO_KNOTS;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}
