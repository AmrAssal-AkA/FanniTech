"use client";

import { useEffect, useMemo, useCallback, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { useAuth } from "@/Hooks/useAuth";
import { socketService } from "@/services/socket.service";
import { notificationsService } from "@/services/notifications.service";
import { useNotificationStore } from "@/Portal/notificationStore";
import type {
  NotificationItem,
  SocketNotificationPayload,
  PaginatedNotificationsResponse,
} from "@/types/notifications";

const NOTIFICATIONS_CACHE_KEY = "/api/notifications";

export function useNotifications() {
  const { user, isAuthenticated } = useAuth();
  const { mutate } = useSWRConfig();
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>("default");

  const {
    realtimeNotifications,
    activeToast,
    isConnected,
    isOpen,
    addRealtimeNotification,
    markLocalAsRead,
    markAllLocalAsRead,
    dismissToast,
    setConnected,
    setOpen,
    toggleOpen,
    clearAll,
  } = useNotificationStore();

  // Check initial browser notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setBrowserPermission(window.Notification.permission);
    }
  }, []);

  // Request browser notification permission
  const requestBrowserPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "denied";
    }

    try {
      const permission = await window.Notification.requestPermission();
      setBrowserPermission(permission);
      return permission;
    } catch (err) {
      console.error("Failed to request notification permission", err);
      return "denied";
    }
  }, []);

  // Auto-request permission once authenticated if permission is default
  useEffect(() => {
    if (
      isAuthenticated &&
      typeof window !== "undefined" &&
      "Notification" in window &&
      window.Notification.permission === "default"
    ) {
      void requestBrowserPermission();
    }
  }, [isAuthenticated, requestBrowserPermission]);

  // SWR fetch for persisted notifications from server
  const {
    data: persistedData,
    isLoading,
    mutate: mutateNotifications,
  } = useSWR<PaginatedNotificationsResponse>(
    isAuthenticated ? NOTIFICATIONS_CACHE_KEY : null,
    () => notificationsService.fetchNotifications({ page: 1, limit: 30 }),
    {
      revalidateOnFocus: true,
      keepPreviousData: true,
    }
  );

  // Auto-dismiss in-app toast after 6 seconds
  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      dismissToast();
    }, 6000);
    return () => clearTimeout(timer);
  }, [activeToast, dismissToast]);

  // Connect socket and register listeners
  useEffect(() => {
    if (!isAuthenticated || !user?.token) {
      socketService.disconnect();
      clearAll();
      return;
    }

    // Connect socket using user's access token
    socketService.connect(user.token);

    const unsubscribeStatus = socketService.onStatusChange((connected) => {
      setConnected(connected);
    });

    const handleNewNotification = (payload: SocketNotificationPayload) => {
      // 1. Add to Zustand store (sets activeToast)
      const newItem = addRealtimeNotification(payload);

      // 2. Dispatch native browser notification if granted
      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        window.Notification.permission === "granted"
      ) {
        try {
          const browserNotif = new window.Notification(payload.title, {
            body: payload.body,
            icon: "/Logo.png",
            tag: newItem.id,
          });

          browserNotif.onclick = () => {
            window.focus();
            browserNotif.close();
          };
        } catch (err) {
          console.error("Error displaying native browser notification", err);
        }
      }

      // 3. Automatically revalidate relevant SWR caches based on notification events
      void mutate("/api/admin/dashboard");
      void mutate((key) => typeof key === "string" && key.startsWith("/api/admin/requests"));
      void mutate((key) => typeof key === "string" && key.startsWith("/api/tickets"));
      void mutate("/api/technician/workbench");
      void mutate(NOTIFICATIONS_CACHE_KEY);
    };

    socketService.on("notification:new", handleNewNotification);

    return () => {
      socketService.off("notification:new", handleNewNotification);
      unsubscribeStatus();
    };
  }, [
    isAuthenticated,
    user?.token,
    addRealtimeNotification,
    clearAll,
    mutate,
    setConnected,
  ]);

  // Merge SWR server notifications + real-time notifications
  const notifications = useMemo<NotificationItem[]>(() => {
    const serverItems: NotificationItem[] = (persistedData?.items ?? []).map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      body: item.body,
      data: (item.data ?? {}) as Record<string, unknown>,
      createdAt: item.createdAt,
      isRead: item.readAt !== null,
      isPersisted: true,
    }));

    // Deduplicate: Real-time items take precedence if matching ID exists
    const serverIds = new Set(serverItems.map((n) => n.id));
    const realtimeUnique = realtimeNotifications.filter((n) => !serverIds.has(n.id));

    // Also sync read state if an item exists in both
    const mergedServerItems = serverItems.map((item) => {
      const realtimeMatch = realtimeNotifications.find((r) => r.id === item.id);
      if (realtimeMatch) {
        return {
          ...item,
          isRead: item.isRead || realtimeMatch.isRead,
        };
      }
      return item;
    });

    const combined = [...realtimeUnique, ...mergedServerItems];

    // Sort newest first
    return combined.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [persistedData?.items, realtimeNotifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  // Mark single notification as read
  const markAsRead = useCallback(
    async (id: string) => {
      markLocalAsRead(id);
      const target = notifications.find((n) => n.id === id);

      if (target?.isPersisted) {
        try {
          await notificationsService.markAsRead(id);
          void mutateNotifications();
        } catch (err) {
          console.error("Failed to mark notification as read on server", err);
        }
      }
    },
    [markLocalAsRead, notifications, mutateNotifications]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    markAllLocalAsRead();
    try {
      await notificationsService.markAllAsRead();
      void mutateNotifications();
    } catch (err) {
      console.error("Failed to mark all notifications as read on server", err);
    }
  }, [markAllLocalAsRead, mutateNotifications]);

  return {
    notifications,
    unreadCount,
    activeToast,
    isConnected,
    isLoading,
    isOpen,
    browserPermission,
    requestBrowserPermission,
    setOpen,
    toggleOpen,
    dismissToast,
    markAsRead,
    markAllAsRead,
  };
}

