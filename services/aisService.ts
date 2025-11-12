
import { Vessel } from '@/types/maritime';

class AISService {
  private vessels: Map<string, Vessel> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;
  private listeners: Set<(vessels: Vessel[]) => void> = new Set();

  startTracking(currentVessel: Vessel) {
    // Simulate AIS tracking - in production, connect to real AIS data source
    this.updateInterval = setInterval(() => {
      this.updateVesselPosition(currentVessel);
      this.broadcastPosition(currentVessel);
      this.notifyListeners();
    }, 5000); // Every 5 seconds
  }

  stopTracking() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  private updateVesselPosition(vessel: Vessel) {
    // Update local vessel position
    vessel.lastUpdate = Date.now();
  }

  private broadcastPosition(vessel: Vessel) {
    // In production, broadcast to AIS network
    console.log('Broadcasting position:', vessel);
  }

  getNearbyVessels(latitude: number, longitude: number, radiusKm: number = 100): Vessel[] {
    const nearby: Vessel[] = [];
    
    this.vessels.forEach(vessel => {
      const distance = this.calculateDistance(
        latitude, longitude,
        vessel.latitude, vessel.longitude
      );
      
      if (distance <= radiusKm) {
        nearby.push({
          ...vessel,
          distance
        });
      }
    });
    
    return nearby.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
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

  addVessel(vessel: Vessel) {
    this.vessels.set(vessel.id, vessel);
    this.notifyListeners();
  }

  removeVessel(vesselId: string) {
    this.vessels.delete(vesselId);
    this.notifyListeners();
  }

  subscribe(listener: (vessels: Vessel[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    const vesselArray = Array.from(this.vessels.values());
    this.listeners.forEach(listener => listener(vesselArray));
  }
}

export default new AISService();
