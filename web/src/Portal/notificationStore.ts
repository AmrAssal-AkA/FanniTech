import { create } from "zustand";
import type {
  NotificationItem,
  SocketNotificationPayload,
} from "@/types/notifications";

interface NotificationStoreState {
  realtimeNotifications: NotificationItem[];
  activeToast: NotificationItem | null;
  isConnected: boolean;
  isOpen: boolean;
  addRealtimeNotification: (payload: SocketNotificationPayload) => NotificationItem;
  markLocalAsRead: (id: string) => void;
  markAllLocalAsRead: () => void;
  dismissToast: () => void;
  setConnected: (status: boolean) => void;
  setOpen: (isOpen: boolean) => void;
  toggleOpen: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStoreState>((set) => ({
  realtimeNotifications: [],
  activeToast: null,
  isConnected: false,
  isOpen: false,

  addRealtimeNotification: (payload: SocketNotificationPayload) => {
    const isPersisted = Boolean(payload.id);
    const id = payload.id || `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const newItem: NotificationItem = {
      id,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      data: payload.data ?? {},
      createdAt: payload.createdAt || new Date().toISOString(),
      isRead: false,
      isPersisted,
    };

    set((state) => {
      const exists = state.realtimeNotifications.some((n) => n.id === newItem.id);
      if (exists) return state;

      return {
        realtimeNotifications: [newItem, ...state.realtimeNotifications],
        activeToast: newItem,
      };
    });

    return newItem;
  },

  markLocalAsRead: (id: string) => {
    set((state) => ({
      realtimeNotifications: state.realtimeNotifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
      activeToast: state.activeToast?.id === id ? null : state.activeToast,
    }));
  },

  markAllLocalAsRead: () => {
    set((state) => ({
      realtimeNotifications: state.realtimeNotifications.map((n) => ({
        ...n,
        isRead: true,
      })),
      activeToast: null,
    }));
  },

  dismissToast: () => set({ activeToast: null }),

  setConnected: (isConnected: boolean) => set({ isConnected }),

  setOpen: (isOpen: boolean) => set({ isOpen }),

  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),

  clearAll: () =>
    set({
      realtimeNotifications: [],
      activeToast: null,
      isConnected: false,
      isOpen: false,
    }),
}));

