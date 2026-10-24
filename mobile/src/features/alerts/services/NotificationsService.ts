import { serverClient } from '../../../utils/serverClient';

export interface ApiNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  createdAt: string;
  readAt: string | null;
}

export interface PaginatedNotifications {
  items: ApiNotification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const NotificationsService = {
  list: (query: { page?: number; limit?: number; unreadOnly?: boolean } = {}) =>
    serverClient
      .get<PaginatedNotifications>('/api/v1/notifications', { params: query })
      .then((r) => r.data),

  markAsRead: (id: string) =>
    serverClient.patch(`/api/v1/notifications/${id}/read`).then((r) => r.data),

  markAllAsRead: () =>
    serverClient.patch('/api/v1/notifications/read-all').then((r) => r.data),

  getUnreadCount: () =>
    serverClient
      .get<{ data: { count: number } }>('/api/v1/notifications/unread-count')
      .then((r) => r.data.data.count),
};
