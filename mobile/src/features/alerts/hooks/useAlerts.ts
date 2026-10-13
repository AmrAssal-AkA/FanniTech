import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertItem, AlertCategory } from '../types';
import { useNotificationStore } from '../../../stores/notificationStore';
import { NotificationsService } from '../services/NotificationsService';
import { mapNotificationToAlert } from '../utils/mapNotificationToAlert';

export function useAlerts() {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<AlertCategory>('all');
  const {
    notifications,
    markAsRead: markStoreRead,
    markAllAsRead: markAllStoreRead,
  } = useNotificationStore();

  const { data, isRefetching, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => NotificationsService.list({ page: 1, limit: 50 }),
    staleTime: 30_000,
  });

  const alerts = useMemo<AlertItem[]>(() => {
    const serverAlerts = (data?.items ?? []).map(mapNotificationToAlert);
    const realtimeIds = new Set(serverAlerts.map((a) => a.id));
    const realtimeOnly = notifications
      .filter((n) => !realtimeIds.has(n.id))
      .map(mapNotificationToAlert);
    return [...realtimeOnly, ...serverAlerts];
  }, [data, notifications]);

  const unreadCount = useMemo(
    () => alerts.filter((alert) => alert.isUnread).length,
    [alerts]
  );

  const counts = useMemo(
    () => ({
      all: alerts.length,
      repairs: alerts.filter((a) => a.category === 'repairs').length,
      devices: alerts.filter((a) => a.category === 'devices').length,
    }),
    [alerts]
  );

  const filteredAlerts = useMemo(() => {
    if (activeFilter === 'all') return alerts;
    return alerts.filter((alert) => alert.category === activeFilter);
  }, [alerts, activeFilter]);

  const todayAlerts = useMemo(
    () => filteredAlerts.filter((alert) => alert.section === 'today'),
    [filteredAlerts]
  );

  const earlierAlerts = useMemo(
    () => filteredAlerts.filter((alert) => alert.section === 'earlier'),
    [filteredAlerts]
  );

  const markAllReadMutation = useMutation({
    mutationFn: NotificationsService.markAllAsRead,
    onSuccess: () => {
      markAllStoreRead();
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => NotificationsService.markAsRead(id),
    onSuccess: (_, id) => {
      markStoreRead(id);
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsRead = useCallback(() => {
    markAllReadMutation.mutate();
  }, [markAllReadMutation]);

  const markAsRead = useCallback(
    (alertId: string) => {
      markAsReadMutation.mutate(alertId);
    },
    [markAsReadMutation]
  );

  const refreshAlerts = useCallback(() => {
    void refetch();
  }, [refetch]);

  return {
    alerts,
    filteredAlerts,
    todayAlerts,
    earlierAlerts,
    unreadCount,
    counts,
    activeFilter,
    setActiveFilter,
    isRefreshing: isRefetching,
    refreshAlerts,
    markAllAsRead,
    markAsRead,
  };
}
