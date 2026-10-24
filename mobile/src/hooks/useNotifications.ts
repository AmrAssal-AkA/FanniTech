import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useQueryClient } from '@tanstack/react-query';
import { socketService, NotificationPayload } from '../services/socketService';
import { useNotificationStore } from '../stores/notificationStore';
import { NotificationsService } from '../features/alerts/services/NotificationsService';

export function useNotifications() {
  const queryClient = useQueryClient();
  const {
    addNotification,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    setUnreadCount,
  } = useNotificationStore();

  useEffect(() => {
    void NotificationsService.getUnreadCount()
      .then((count) => {
        setUnreadCount(count);
      })
      .catch(() => {
        // Ignored when unauthenticated or offline
      });

    const isRepairLifecycleEvent = (type: string, data?: Record<string, unknown>) => {
      if (!type) return false;
      const upper = type.toUpperCase();
      return (
        upper.startsWith('REPAIR_') ||
        upper.includes('TECHNICIAN') ||
        upper.includes('DIAGNOSTIC') ||
        Boolean(data?.ticketId || data?.repairRequestId)
      );
    };

    const invalidateRepairCaches = (type: string, data?: Record<string, unknown>) => {
      if (isRepairLifecycleEvent(type, data)) {
        void queryClient.invalidateQueries({ queryKey: ['repairTicket'] });
        void queryClient.invalidateQueries({ queryKey: ['repair-requests'] });
        void queryClient.invalidateQueries({ queryKey: ['devices'] });
      }
    };

    const handleNew = (payload: NotificationPayload) => {
      addNotification(payload);
      invalidateRepairCaches(payload.type, payload.data);
    };

    socketService.on('notification:new', handleNew);

    const foregroundSub = Notifications.addNotificationReceivedListener((notification) => {
      const content = notification.request.content;
      const data = (content.data ?? {}) as Record<string, unknown>;
      const type = typeof data?.type === 'string' ? data.type : 'INFO';
      addNotification({
        id: notification.request.identifier,
        type,
        title: content.title ?? '',
        body: content.body ?? '',
        data,
        createdAt: new Date().toISOString(),
      });
      invalidateRepairCaches(type, data);
    });

    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const content = response.notification.request.content;
      const data = (content.data ?? {}) as Record<string, unknown>;
      const type = typeof data?.type === 'string' ? data.type : 'INFO';
      addNotification({
        id: response.notification.request.identifier,
        type,
        title: content.title ?? '',
        body: content.body ?? '',
        data,
        createdAt: new Date().toISOString(),
      });
      invalidateRepairCaches(type, data);
    });

    return () => {
      socketService.off('notification:new', handleNew);
      foregroundSub.remove();
      responseSub.remove();
    };
  }, [addNotification, queryClient, setUnreadCount]);

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}
