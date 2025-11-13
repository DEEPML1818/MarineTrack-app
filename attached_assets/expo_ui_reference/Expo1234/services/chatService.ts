
import { io, Socket } from 'socket.io-client';
import { ChatMessage } from '@/types/maritime';
import { getSocketUrl } from '@/config/api';

class ChatService {
  private socket: Socket | null = null;
  private listeners: Set<(message: ChatMessage) => void> = new Set();

  connect(vesselId: string, vesselName: string) {
    const socketUrl = getSocketUrl();
    console.log('Connecting to chat server:', socketUrl);
    
    this.socket = io(socketUrl, {
      query: { vesselId, vesselName },
      transports: ['websocket', 'polling']
    });

    this.socket.on('new_message', (message: ChatMessage) => {
      this.listeners.forEach(listener => listener(message));
    });

    this.socket.on('connect', () => {
      console.log('Chat connected to backend');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Chat connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendMessage(message: string, location: { latitude: number; longitude: number }) {
    if (this.socket) {
      this.socket.emit('send_message', {
        message,
        location,
        timestamp: Date.now()
      });
    }
  }

  subscribe(listener: (message: ChatMessage) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getNearbyVessels(radiusKm: number = 50) {
    if (this.socket) {
      this.socket.emit('get_nearby_vessels', { radiusKm });
    }
  }
}

export default new ChatService();
