
import { SOSAlert } from '@/types/maritime';

class SOSService {
  private activeAlert: SOSAlert | null = null;

  async sendSOS(
    vesselId: string,
    vesselName: string,
    latitude: number,
    longitude: number
  ): Promise<boolean> {
    const alert: SOSAlert = {
      id: Date.now().toString(),
      vesselId,
      vesselName,
      latitude,
      longitude,
      timestamp: Date.now(),
      status: 'active'
    };

    this.activeAlert = alert;

    // Send to authorities
    await this.notifyAuthorities(alert);
    
    // Broadcast to nearby vessels
    await this.broadcastToNearbyVessels(alert);
    
    // Trigger emergency call interface
    this.triggerEmergencyCall();

    return true;
  }

  private async notifyAuthorities(alert: SOSAlert) {
    // In production, integrate with:
    // - Malaysian Maritime Enforcement Agency (MMEA)
    // - Marine Police
    // - Coast Guard
    
    const authorities = [
      { name: 'MMEA', phone: '+60-3-8888-2222' },
      { name: 'Marine Police', phone: '+60-3-2266-2222' }
    ];

    console.log('Notifying authorities:', authorities);
    
    // API calls would go here
  }

  private async broadcastToNearbyVessels(alert: SOSAlert) {
    // Broadcast via AIS and chat service
    console.log('Broadcasting SOS to nearby vessels');
  }

  private triggerEmergencyCall() {
    // In production, integrate with phone dialer
    console.log('Emergency call interface triggered');
  }

  cancelSOS() {
    if (this.activeAlert) {
      this.activeAlert.status = 'resolved';
      this.activeAlert = null;
    }
  }

  getActiveAlert(): SOSAlert | null {
    return this.activeAlert;
  }
}

export default new SOSService();
