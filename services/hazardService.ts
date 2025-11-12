
import { Hazard } from '@/types/maritime';

class HazardService {
  private hazards: Map<string, Hazard> = new Map();
  private listeners: Set<(hazards: Hazard[]) => void> = new Set();

  reportHazard(
    type: Hazard['type'],
    latitude: number,
    longitude: number,
    severity: Hazard['severity'],
    description: string,
    reportedBy: string
  ): Hazard {
    const hazard: Hazard = {
      id: Date.now().toString(),
      type,
      latitude,
      longitude,
      severity,
      description,
      reportedBy,
      upvotes: 0,
      downvotes: 0,
      timestamp: Date.now(),
      verified: false
    };

    this.hazards.set(hazard.id, hazard);
    this.notifyListeners();
    
    return hazard;
  }

  upvoteHazard(hazardId: string) {
    const hazard = this.hazards.get(hazardId);
    if (hazard) {
      hazard.upvotes++;
      if (hazard.upvotes >= 3) {
        hazard.verified = true;
      }
      this.notifyListeners();
    }
  }

  downvoteHazard(hazardId: string) {
    const hazard = this.hazards.get(hazardId);
    if (hazard) {
      hazard.downvotes++;
      if (hazard.downvotes >= 5) {
        this.hazards.delete(hazardId);
      }
      this.notifyListeners();
    }
  }

  getNearbyHazards(latitude: number, longitude: number, radiusKm: number = 50): Hazard[] {
    const nearby: Hazard[] = [];
    
    this.hazards.forEach(hazard => {
      const distance = this.calculateDistance(
        latitude, longitude,
        hazard.latitude, hazard.longitude
      );
      
      if (distance <= radiusKm) {
        nearby.push(hazard);
      }
    });
    
    return nearby;
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

  subscribe(listener: (hazards: Hazard[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    const hazardArray = Array.from(this.hazards.values());
    this.listeners.forEach(listener => listener(hazardArray));
  }
}

export default new HazardService();
