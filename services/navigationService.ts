import { Position, calculateDistance, formatDistance } from './gpsService';

export interface Waypoint {
  latitude: number;
  longitude: number;
  name?: string;
  instruction?: string;
}

export interface Route {
  waypoints: Waypoint[];
  name?: string;
}

export interface NavigationInstruction {
  waypoint: Waypoint;
  distance: number;
  instruction: string;
}

export function calculateETA(
  currentPos: Position,
  destination: Position,
  currentSpeed: number
): number | null {
  if (currentSpeed <= 0) return null;

  const distanceNM = calculateDistance(currentPos, destination);
  const hoursRemaining = distanceNM / currentSpeed;
  const millisecondsRemaining = hoursRemaining * 60 * 60 * 1000;

  return Date.now() + millisecondsRemaining;
}

export function formatETA(etaTimestamp: number | null): string {
  if (!etaTimestamp) return 'N/A';

  const date = new Date(etaTimestamp);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;

  return `${hours}:${minutesStr} ${ampm}`;
}

export function getDistanceRemaining(
  currentPos: Position,
  destination: Position
): number {
  return calculateDistance(currentPos, destination);
}

export function getNextWaypoint(
  currentPos: Position,
  route: Route
): NavigationInstruction | null {
  if (!route.waypoints || route.waypoints.length === 0) return null;

  let closestWaypoint: Waypoint | null = null;
  let minDistance = Infinity;
  let waypointIndex = -1;

  for (let i = 0; i < route.waypoints.length; i++) {
    const waypoint = route.waypoints[i];
    const distance = calculateDistance(currentPos, waypointToPosition(waypoint));

    if (distance < minDistance) {
      minDistance = distance;
      closestWaypoint = waypoint;
      waypointIndex = i;
    }
  }

  if (!closestWaypoint) return null;

  let nextWaypoint: Waypoint;
  if (minDistance < 0.1 && waypointIndex < route.waypoints.length - 1) {
    nextWaypoint = route.waypoints[waypointIndex + 1];
    minDistance = calculateDistance(currentPos, waypointToPosition(nextWaypoint));
  } else {
    nextWaypoint = closestWaypoint;
  }

  const instruction = generateTurnInstruction(nextWaypoint, minDistance);

  return {
    waypoint: nextWaypoint,
    distance: minDistance,
    instruction,
  };
}

export function generateTurnInstruction(
  waypoint: Waypoint,
  distance: number
): string {
  const distanceStr = formatDistance(distance);

  if (waypoint.instruction) {
    return `In ${distanceStr}, ${waypoint.instruction}`;
  }

  if (waypoint.name) {
    return `In ${distanceStr}, proceed to ${waypoint.name}`;
  }

  return `In ${distanceStr}, proceed to waypoint`;
}

export function isOffRoute(
  currentPos: Position,
  route: Route,
  threshold: number = 0.5
): boolean {
  if (!route.waypoints || route.waypoints.length < 2) return false;

  let minDistanceToRoute = Infinity;

  for (let i = 0; i < route.waypoints.length - 1; i++) {
    const start = route.waypoints[i];
    const end = route.waypoints[i + 1];

    const distanceToSegment = calculateDistanceToLineSegment(
      currentPos,
      start,
      end
    );

    if (distanceToSegment < minDistanceToRoute) {
      minDistanceToRoute = distanceToSegment;
    }
  }

  return minDistanceToRoute > threshold;
}

function waypointToPosition(waypoint: Waypoint): Position {
  return {
    latitude: waypoint.latitude,
    longitude: waypoint.longitude,
    timestamp: Date.now(),
  };
}

function calculateDistanceToLineSegment(
  point: Position,
  lineStart: Waypoint,
  lineEnd: Waypoint
): number {
  const A = point.latitude - lineStart.latitude;
  const B = point.longitude - lineStart.longitude;
  const C = lineEnd.latitude - lineStart.latitude;
  const D = lineEnd.longitude - lineStart.longitude;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let closestPoint: Position;

  if (param < 0) {
    closestPoint = waypointToPosition(lineStart);
  } else if (param > 1) {
    closestPoint = waypointToPosition(lineEnd);
  } else {
    closestPoint = {
      latitude: lineStart.latitude + param * C,
      longitude: lineStart.longitude + param * D,
      timestamp: Date.now(),
    };
  }

  return calculateDistance(point, closestPoint);
}
