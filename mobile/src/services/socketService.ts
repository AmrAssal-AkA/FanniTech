import { io, Socket } from 'socket.io-client';
import { tokenStorage } from '../features/auth/services/tokenStorage';

const BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080').replace(/\/$/, '');

export interface NotificationPayload {
  id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  createdAt: string;
}

export interface SocketServiceEvents {
  'notification:new': (payload: NotificationPayload) => void;
}

class SocketService {
  private socket: Socket<SocketServiceEvents> | null = null;

  async connect(): Promise<void> {
    if (this.socket?.connected) return;
    const token = await tokenStorage.getAccess();
    if (!token) return;

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.socket = io(`${BASE_URL}/notifications`, {
      transports: ['websocket'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on<K extends keyof SocketServiceEvents>(event: K, listener: SocketServiceEvents[K]): void {
    if (this.socket) {
      this.socket.on(
        event as 'notification:new',
        listener as (payload: NotificationPayload) => void
      );
    }
  }

  off<K extends keyof SocketServiceEvents>(event: K, listener: SocketServiceEvents[K]): void {
    if (this.socket) {
      this.socket.off(
        event as 'notification:new',
        listener as (payload: NotificationPayload) => void
      );
    }
  }

  emit(event: string, data?: unknown): void {
    if (this.socket) {
      (this.socket as unknown as { emit: (ev: string, d?: unknown) => void }).emit(event, data);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  getSocket(): Socket<SocketServiceEvents> | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
