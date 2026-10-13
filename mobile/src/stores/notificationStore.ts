import { create } from 'zustand';

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  createdAt: string;
  isRead: boolean;
}

export interface NotificationStore {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (notification: Omit<NotificationItem, 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  setNotifications: (notifications: NotificationItem[]) => void;
  setUnreadCount: (count: number) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (notification) => {
    const item: NotificationItem = { ...notification, isRead: false };
    set((state) => {
      const exists = state.notifications.some((n) => n.id === notification.id);
      if (exists) return state;
      return {
        notifications: [item, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    });
  },
  markAsRead: (id) => {
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n,
      );
      return {
        notifications: updated,
        unreadCount: Math.max(0, updated.filter((n) => !n.isRead).length),
      };
    });
  },
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },
  setNotifications: (notifications) => {
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    });
  },
  setUnreadCount: (count) => {
    set({ unreadCount: Math.max(0, count) });
  },
}));
