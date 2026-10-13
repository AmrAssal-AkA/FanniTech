import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { socketService, NotificationPayload } from '../services/socketService';
import { useNotificationStore } from '../stores/notificationStore';
import { NotificationsService } from '../features/alerts/services/NotificationsService';

export function useNotifications() {
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

    const handleNew = (payload: NotificationPayload) => {
      addNotification(payload);
    };

    socketService.on('notification:new', handleNew);

    const foregroundSub = Notifications.addNotificationReceivedListener((notification) => {
      const content = notification.request.content;
      addNotification({
        id: notification.request.identifier,
        type: typeof content.data?.type === 'string' ? content.data.type : 'INFO',
        title: content.title ?? '',
        body: content.body ?? '',
        data: (content.data ?? {}) as Record<string, unknown>,
        createdAt: new Date().toISOString(),
      });
    });

    return () => {
      socketService.off('notification:new', handleNew);
      foregroundSub.remove();
    };
  }, [addNotification, setUnreadCount]);

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}
