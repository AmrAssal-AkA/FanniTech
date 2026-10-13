import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAlerts } from '../hooks/useAlerts';
import { NotificationsService } from '../services/NotificationsService';
import { useNotificationStore } from '../../../stores/notificationStore';

jest.mock('../services/NotificationsService', () => ({
  NotificationsService: {
    list: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    getUnreadCount: jest.fn(),
  },
}));

let queryClient: QueryClient;

function createWrapper() {
  queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe('useAlerts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useNotificationStore.setState({ notifications: [], unreadCount: 0 });
  });

  afterEach(() => {
    queryClient?.clear();
  });

  it('fetches notifications from NotificationsService and calculates counts', async () => {
    (NotificationsService.list as jest.Mock).mockResolvedValue({
      items: [
        {
          id: 'server-1',
          type: 'REPAIR_STATUS',
          title: 'Intake Processed',
          body: 'Chassis scanned',
          data: { referenceId: 'SR-1001' },
          createdAt: new Date().toISOString(),
          readAt: null,
        },
      ],
      pagination: { page: 1, limit: 50, total: 1, totalPages: 1 },
    });

    const { result } = await renderHook(() => useAlerts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.alerts).toHaveLength(1);
    });

    expect(result.current.alerts[0].id).toBe('server-1');
    expect(result.current.unreadCount).toBe(1);
    expect(result.current.counts.repairs).toBe(1);
  });

  it('merges real-time notifications from Zustand store without duplicating', async () => {
    (NotificationsService.list as jest.Mock).mockResolvedValue({
      items: [
        {
          id: 'existing-1',
          type: 'REPAIR_STATUS',
          title: 'Existing',
          body: 'Desc',
          data: {},
          createdAt: new Date().toISOString(),
          readAt: null,
        },
      ],
      pagination: { page: 1, limit: 50, total: 1, totalPages: 1 },
    });

    useNotificationStore.setState({
      notifications: [
        {
          id: 'realtime-2',
          type: 'DEVICE_ALERT',
          title: 'Live Alert',
          body: 'Realtime update',
          data: {},
          createdAt: new Date().toISOString(),
          isRead: false,
        },
        // Duplicate that is also on server:
        {
          id: 'existing-1',
          type: 'REPAIR_STATUS',
          title: 'Existing',
          body: 'Desc',
          data: {},
          createdAt: new Date().toISOString(),
          isRead: false,
        },
      ],
      unreadCount: 2,
    });

    const { result } = await renderHook(() => useAlerts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.alerts).toHaveLength(2);
    });

    const ids = result.current.alerts.map((a) => a.id);
    expect(ids).toContain('existing-1');
    expect(ids).toContain('realtime-2');
  });

  it('triggers markAsRead and calls service and store', async () => {
    (NotificationsService.list as jest.Mock).mockResolvedValue({
      items: [
        {
          id: 'server-1',
          type: 'REPAIR_STATUS',
          title: 'Unread Alert',
          body: 'Body',
          data: {},
          createdAt: new Date().toISOString(),
          readAt: null,
        },
      ],
      pagination: { page: 1, limit: 50, total: 1, totalPages: 1 },
    });
    (NotificationsService.markAsRead as jest.Mock).mockResolvedValue({});

    const { result } = await renderHook(() => useAlerts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.alerts).toHaveLength(1);
    });

    await act(async () => {
      result.current.markAsRead('server-1');
    });

    expect(NotificationsService.markAsRead).toHaveBeenCalledWith('server-1');
  });

  it('triggers markAllAsRead and calls service', async () => {
    (NotificationsService.list as jest.Mock).mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
    });
    (NotificationsService.markAllAsRead as jest.Mock).mockResolvedValue({});

    const { result } = await renderHook(() => useAlerts(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.markAllAsRead();
    });

    expect(NotificationsService.markAllAsRead).toHaveBeenCalled();
  });
});
