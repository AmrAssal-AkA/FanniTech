import { io, Socket } from "socket.io-client";
import type { SocketNotificationPayload } from "@/types/notifications";

export interface SocketServiceEvents {
  "notification:new": (payload: SocketNotificationPayload) => void;
  "notification:markRead:ack": (data: { notificationId: string }) => void;
}

type StatusChangeListener = (connected: boolean) => void;

class SocketService {
  private socket: Socket | null = null;
  private currentToken: string | null = null;
  private statusListeners: Set<StatusChangeListener> = new Set();

  connect(token: string): void {
    if (!token) return;

    // If already connected with the same token, do nothing
    if (this.socket?.connected && this.currentToken === token) {
      return;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.currentToken = token;
    const baseUrl = (
      process.env.NEXT_PUBLIC_BACKEND_API_URL ||
      process.env.BACKEND_API_URL ||
      "http://localhost:8080"
    ).replace(/\/$/, "");

    this.socket = io(`${baseUrl}/notifications`, {
      transports: ["websocket"],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    this.socket.on("connect", () => {
      this.notifyStatus(true);
    });

    this.socket.on("disconnect", () => {
      this.notifyStatus(false);
    });

    this.socket.on("connect_error", () => {
      this.notifyStatus(false);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.currentToken = null;
    this.notifyStatus(false);
  }

  on(
    event: "notification:new",
    listener: (payload: SocketNotificationPayload) => void
  ): void {
    this.socket?.on(event, listener);
  }

  off(
    event: "notification:new",
    listener: (payload: SocketNotificationPayload) => void
  ): void {
    this.socket?.off(event, listener);
  }

  emit(event: string, data?: unknown): void {
    this.socket?.emit(event, data);
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  onStatusChange(listener: StatusChangeListener): () => void {
    this.statusListeners.add(listener);
    listener(this.isConnected());
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  private notifyStatus(connected: boolean): void {
    this.statusListeners.forEach((listener) => {
      try {
        listener(connected);
      } catch (err) {
        console.error("Error in status listener", err);
      }
    });
  }
}

export const socketService = new SocketService();

