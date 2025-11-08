const seaRoute = require('searoute-js');
const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const HAZARDS_FILE = path.join(DATA_DIR, 'maritime_hazards.json');
const TRAFFIC_FILE = path.join(DATA_DIR, 'vessel_traffic.json');

// Helper: Read JSON file
async function readJsonFile(filePath, defaultValue = []) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return defaultValue;
  }
}

// Helper: Write JSON file
async function writeJsonFile(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
}

// Calculate distance between two points in nautical miles
function calculateDistanceNM(point1, point2) {
  const R = 3440.065; // Earth radius in nautical miles
  const lat1 = point1.lat * Math.PI / 180;
  const lat2 = point2.lat * Math.PI / 180;
  const deltaLat = (point2.lat - point1.lat) * Math.PI / 180;
  const deltaLng = (point2.lng - point1.lng) * Math.PI / 180;

  const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
           Math.cos(lat1) * Math.cos(lat2) *
           Math.sin(deltaLng/2) * Math.sin(deltaLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

// Calculate bearing between two points
function calculateBearing(lat1, lng1, lat2, lng2) {
  const dLon = (lng2 - lng1) * Math.PI / 180;
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;

  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
           Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
  const bearing = Math.atan2(y, x) * 180 / Math.PI;

  return (bearing + 360) % 360;
}

// Get cardinal direction from bearing
function getCardinalDirection(bearing) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
}

// Calculate maritime route
async function calculateRoute(origin, destination, preferences = {}) {
  try {
    // Create GeoJSON Point features for searoute-ts
    const originPoint = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [parseFloat(origin.lng), parseFloat(origin.lat)]
      }
    };

    const destinationPoint = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [parseFloat(destination.lng), parseFloat(destination.lat)]
      }
    };

    // Calculate route using searoute-ts (returns GeoJSON LineString)
    const routeResult = seaRoute(originPoint, destinationPoint, 'nm');

    // Extract waypoints from GeoJSON
    const waypoints = routeResult.geometry.coordinates;
    const distanceNM = routeResult.properties.length || 0;
    
    // Calculate duration based on speed
    const speedKnots = preferences.speed || 15;
    const durationHours = distanceNM / speedKnots;

    // Convert waypoints to lat/lng format
    const formattedWaypoints = waypoints.map(coord => ({
      lat: coord[1],
      lng: coord[0]
    }));

    // Load hazards and traffic data
    const hazards = await readJsonFile(HAZARDS_FILE, []);
    const now = new Date();
    const activeHazards = hazards.filter(h => new Date(h.expiresAt) > now);
    
    const trafficData = await readJsonFile(TRAFFIC_FILE, []);
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
    const recentTraffic = trafficData.filter(t => new Date(t.timestamp) > sixHoursAgo);

    // Analyze route for hazards and traffic
    const routeHazards = [];
    let trafficDensity = 'low';
    let safetyScore = 100;

    for (const waypoint of formattedWaypoints) {
      // Check for nearby hazards
      for (const hazard of activeHazards) {
        const dist = calculateDistanceNM(waypoint, { lat: hazard.lat, lng: hazard.lng });
        if (dist < 5) { // Within 5nm
          routeHazards.push({
            type: hazard.type,
            severity: hazard.severity,
            distance: Math.round(dist * 100) / 100,
            description: hazard.description,
            waypoint
          });

          // Decrease safety score based on severity
          const severityImpact = { low: 5, medium: 10, high: 20, critical: 40 };
          safetyScore -= severityImpact[hazard.severity] || 10;
        }
      }

      // Check traffic density
      const nearbyTraffic = recentTraffic.filter(t => 
        calculateDistanceNM(waypoint, { lat: t.lat, lng: t.lng }) < 10
      );
      
      if (nearbyTraffic.length > 5) {
        trafficDensity = 'high';
        safetyScore -= 15;
      } else if (nearbyTraffic.length > 2 && trafficDensity !== 'high') {
        trafficDensity = 'medium';
        safetyScore -= 5;
      }
    }

    safetyScore = Math.max(0, Math.min(100, safetyScore));

    // Create turn-by-turn directions
    const directions = [];
    for (let i = 0; i < formattedWaypoints.length - 1; i++) {
      const wp1 = formattedWaypoints[i];
      const wp2 = formattedWaypoints[i + 1];

      const bearing = calculateBearing(wp1.lat, wp1.lng, wp2.lat, wp2.lng);
      const distance = calculateDistanceNM(wp1, wp2);
      const direction = getCardinalDirection(bearing);

      directions.push({
        step: i + 1,
        instruction: `Proceed ${direction} for ${Math.round(distance * 10) / 10} NM`,
        bearing: Math.round(bearing),
        distance: Math.round(distance * 10) / 10,
        waypoint: wp2
      });
    }

    // Generate AI prediction
    const prediction = {
      estimatedDelay: Math.round(routeHazards.length * 0.5), // 0.5 hours per hazard
      weatherRisk: routeHazards.some(h => h.type === 'weather') ? 'high' : 'low',
      collisionRisk: trafficDensity === 'high' ? 'high' : trafficDensity === 'medium' ? 'medium' : 'low',
      fuelEfficiency: 85 - (trafficDensity === 'high' ? 15 : trafficDensity === 'medium' ? 8 : 0),
      recommendedSpeed: speedKnots
    };

    // Generate recommendations
    const recommendations = [];
    if (routeHazards.length > 0) {
      recommendations.push(`Warning: ${routeHazards.length} hazard(s) detected along route`);
    }
    if (trafficDensity === 'high') {
      recommendations.push('High traffic density - reduce speed and maintain vigilance');
    }
    if (safetyScore < 70) {
      recommendations.push('Route safety score below optimal - consider alternative route');
    }

    return {
      success: true,
      route: {
        waypoints: formattedWaypoints,
        distance: Math.round(distanceNM * 10) / 10,
        duration: Math.round(durationHours * 10) / 10,
        directions,
        safetyScore,
        trafficDensity,
        hazards: routeHazards,
        prediction,
        recommendations
      }
    };
  } catch (error) {
    console.error('Error calculating route:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Report a hazard
async function reportHazard(hazardData) {
  try {
    const hazards = await readJsonFile(HAZARDS_FILE, []);
    
    const newHazard = {
      id: `hazard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: hazardData.type,
      severity: hazardData.severity,
      lat: parseFloat(hazardData.lat),
      lng: parseFloat(hazardData.lng),
      description: hazardData.description,
      reportedBy: hazardData.reportedBy,
      vesselId: hazardData.vesselId,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + (hazardData.expiryHours || 24) * 60 * 60 * 1000).toISOString(),
      verified: false,
      upvotes: 0,
      downvotes: 0
    };

    hazards.push(newHazard);
    await writeJsonFile(HAZARDS_FILE, hazards);

    return { success: true, hazard: newHazard };
  } catch (error) {
    console.error('Error reporting hazard:', error);
    return { success: false, error: error.message };
  }
}

// Get nearby hazards
async function getNearbyHazards(lat, lng, radius = 50) {
  try {
    const hazards = await readJsonFile(HAZARDS_FILE, []);
    const now = new Date();
    const activeHazards = hazards.filter(h => new Date(h.expiresAt) > now);

    const nearbyHazards = activeHazards
      .map(hazard => ({
        ...hazard,
        distance: calculateDistanceNM({ lat, lng }, { lat: hazard.lat, lng: hazard.lng })
      }))
      .filter(hazard => hazard.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    return { success: true, hazards: nearbyHazards };
  } catch (error) {
    console.error('Error getting nearby hazards:', error);
    return { success: false, error: error.message };
  }
}

// Report traffic
async function reportTraffic(trafficData) {
  try {
    const traffic = await readJsonFile(TRAFFIC_FILE, []);
    
    const newTraffic = {
      id: `traffic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lat: parseFloat(trafficData.lat),
      lng: parseFloat(trafficData.lng),
      density: trafficData.density,
      vesselCount: trafficData.vesselCount || 1,
      timestamp: new Date().toISOString(),
      reportedBy: trafficData.reportedBy
    };

    traffic.push(newTraffic);
    await writeJsonFile(TRAFFIC_FILE, traffic);

    return { success: true, report: newTraffic };
  } catch (error) {
    console.error('Error reporting traffic:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  calculateRoute,
  reportHazard,
  getNearbyHazards,
  reportTraffic
};
