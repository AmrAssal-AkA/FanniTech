export type NotificationType =
  | "REPAIR_REQUEST_RECEIVED"
  | "REPAIR_REQUEST_ACCEPTED"
  | "REPAIR_REQUEST_REJECTED"
  | "REPAIR_REQUEST_CANCELLED"
  | "TECHNICIAN_ASSIGNED"
  | "DIAGNOSTICS_COMPLETED"
  | "REPAIR_STATUS_UPDATED"
  | "REPAIR_READY_FOR_PICKUP"
  | "REPAIR_COMPLETED"
  | "NEW_REPAIR_REQUEST";

export interface NotificationDataPayload {
  repairRequestId?: string;
  ticketId?: string;
  technicianId?: string;
  reason?: string;
  [key: string]: unknown;
}

export interface ApiNotification {
  id: string;
  userId?: string;
  type: NotificationType;
  title: string;
  body: string;
  data: NotificationDataPayload | null;
  readAt: string | null;
  createdAt: string;
}

export interface SocketNotificationPayload {
  id?: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: NotificationDataPayload;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: NotificationDataPayload;
  createdAt: string;
  isRead: boolean;
  isPersisted: boolean;
}

export interface PaginatedNotificationsResponse {
  items: ApiNotification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FetchNotificationsParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

