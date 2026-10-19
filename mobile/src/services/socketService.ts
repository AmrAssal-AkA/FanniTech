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
  private listeners = new Map<keyof SocketServiceEvents, Set<Function>>();
  private connectionListeners = new Set<(connected: boolean) => void>();
  private connected = false;

  async connect(): Promise<void> {
    if (this.socket?.connected) return;
    const token = await tokenStorage.getAccess();
    if (!token) return;

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    const socketInstance = io(`${BASE_URL}/notifications`, {
      transports: ['websocket'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket = socketInstance;
    this.connected = Boolean(socketInstance.connected);

    socketInstance.on('connect' as any, () => {
      this.connected = true;
      this.notifyConnectionState(true);
    });

    socketInstance.on('disconnect' as any, () => {
      this.connected = false;
      this.notifyConnectionState(false);
    });

    socketInstance.on('connect_error' as any, () => {
      this.connected = false;
      this.notifyConnectionState(false);
    });

    // Reattach all registered event listeners
    this.listeners.forEach((listenerSet, event) => {
      listenerSet.forEach((listener) => {
        socketInstance.on(event as any, listener as any);
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connected = false;
    this.notifyConnectionState(false);
  }

  on<K extends keyof SocketServiceEvents>(
    event: K,
    listener: SocketServiceEvents[K]
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    if (this.socket) {
      this.socket.on(
        event as 'notification:new',
        listener as (payload: NotificationPayload) => void
      );
    }
  }

  off<K extends keyof SocketServiceEvents>(
    event: K,
    listener: SocketServiceEvents[K]
  ): void {
    const listenerSet = this.listeners.get(event);
    if (listenerSet) {
      listenerSet.delete(listener);
      if (listenerSet.size === 0) {
        this.listeners.delete(event);
      }
    }

    if (this.socket) {
      this.socket.off(
        event as 'notification:new',
        listener as (payload: NotificationPayload) => void
      );
    }
  }

  onConnectionChange(listener: (connected: boolean) => void): () => void {
    this.connectionListeners.add(listener);
    listener(this.isConnected());
    return () => {
      this.connectionListeners.delete(listener);
    };
  }

  private notifyConnectionState(connected: boolean): void {
    this.connectionListeners.forEach((listener) => {
      try {
        listener(connected);
      } catch {
        // Safe guard against listener errors
      }
    });
  }

  emit(event: string, data?: unknown): void {
    if (this.socket) {
      (this.socket as unknown as { emit: (ev: string, d?: unknown) => void }).emit(
        event,
        data
      );
    }
  }

  isConnected(): boolean {
    return this.connected || (this.socket?.connected ?? false);
  }

  getSocket(): Socket<SocketServiceEvents> | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
