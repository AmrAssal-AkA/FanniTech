import { appClient } from "@/lib/appClient";
import type {
  FetchNotificationsParams,
  PaginatedNotificationsResponse,
} from "@/types/notifications";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  items?: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const notificationsService = {
  async fetchNotifications(
    params: FetchNotificationsParams = {}
  ): Promise<PaginatedNotificationsResponse> {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.unreadOnly) query.set("unreadOnly", "true");

    const endpoint = `/api/notifications${query.toString() ? `?${query.toString()}` : ""}`;
    const { data } = await appClient.get<ApiResponse<unknown>>(endpoint);

    return {
      items: (data.items as PaginatedNotificationsResponse["items"]) ?? [],
      pagination: data.pagination ?? {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1,
      },
    };
  },

  async markAsRead(id: string): Promise<void> {
    await appClient.patch(`/api/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await appClient.patch("/api/notifications/read-all");
  },
};

