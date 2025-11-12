
import { Route, Hazard } from '@/types/maritime';

class NavigationService {
  async calculateRoute(
    startLat: number,
    startLon: number,
    endLat: number,
    endLon: number,
    avoidHazards: boolean = true
  ): Promise<Route[]> {
    // In production, use searoute algorithm
    // For now, return simulated routes
    
    const mainRoute: Route = {
      id: '1',
      waypoints: [
        { latitude: startLat, longitude: startLon },
        { latitude: endLat, longitude: endLon }
      ],
      distance: this.calculateDistance(startLat, startLon, endLat, endLon),
      estimatedTime: 0,
      safetyScore: 85,
      hazards: []
    };

    mainRoute.estimatedTime = (mainRoute.distance / 20) * 3600; // Assuming 20 knots

    return [mainRoute];
  }

  getNavigationInstruction(
    currentHeading: number,
    targetHeading: number
  ): string {
    const diff = (targetHeading - currentHeading + 360) % 360;
    
    if (diff < 10 || diff > 350) {
      return 'Continue straight ahead';
    } else if (diff > 0 && diff < 180) {
      return diff < 45 ? 'Turn slightly to starboard' : 'Turn to starboard';
    } else {
      return diff > 315 ? 'Turn slightly to port' : 'Turn to port';
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  calculateSafetyScore(route: Route, hazards: Hazard[]): number {
    let score = 100;
    
    hazards.forEach(hazard => {
      const severity = hazard.severity === 'critical' ? 30 : 
                      hazard.severity === 'high' ? 20 :
                      hazard.severity === 'medium' ? 10 : 5;
      score -= severity;
    });
    
    return Math.max(0, score);
  }
}

export default new NavigationService();
