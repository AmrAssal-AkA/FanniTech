import { useState, useMemo, useCallback } from 'react';
import { AlertItem, AlertCategory } from '../types';

export const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'alert-1',
    category: 'repairs',
    type: 'diagnostic',
    referenceId: 'SR-1001',
    tag: 'Diagnostics',
    timeAgo: '15m ago',
    title: 'Diagnostics in Progress: VRM voltage drop detected',
    description:
      'VRM voltage drop isolated on Lenovo ThinkPad T14 mother-rail. Assigned to Tech Tariq at Central Bench 04.',
    isUnread: true,
    section: 'today',
    technician: 'Tech Tariq M.',
    action: {
      label: 'View Ticket',
      type: 'ticket',
      target: 'SR-1001',
    },
  },
  {
    id: 'alert-2',
    category: 'repairs',
    type: 'status',
    referenceId: 'REQ-8840',
    tag: 'Approved',
    timeAgo: '2h ago',
    title: 'Repair Request Accepted: Custom Rig',
    description:
      'Your intake form for Custom Gaming Desktop was reviewed and accepted. Please drop off the device at Central Hub.',
    isUnread: true,
    section: 'today',
    location: 'FanniTech Central Lab (Gate 2)',
    action: {
      label: 'Drop-off Info',
      type: 'info',
      infoDetails:
        'Lab Intake Address:\nCentral Hub, Bldg 4B, King Fahd Way.\nHours: 08:00 - 20:00',
    },
  },
  {
    id: 'alert-3',
    category: 'repairs',
    type: 'intake',
    referenceId: 'SR-1001',
    tag: 'Intake',
    timeAgo: 'Oct 25, 09:15 AM',
    title: 'Device Checked-In at Central Lab',
    description:
      'Intake barcode verified. Outer chassis scanned for surface blemishes. Tamper-evident seals applied.',
    isUnread: false,
    section: 'earlier',
  },
  {
    id: 'alert-4',
    category: 'devices',
    type: 'thermal',
    referenceId: 'ThinkPad T14',
    tag: 'Report',
    timeAgo: 'Oct 24',
    title: 'Thermal Inspection Completed',
    description:
      'Lenovo ThinkPad T14 thermal pad degraded by 38%. Review diagnostic report to approve repasting.',
    isUnread: false,
    section: 'earlier',
  },
  {
    id: 'alert-5',
    category: 'devices',
    type: 'security',
    referenceId: 'Auth Audit',
    tag: 'Security',
    timeAgo: 'Oct 22',
    title: 'New Sign-in Recognized',
    description:
      'Intake portal accessed from iPhone 15 Pro via Safari, Riyadh Region (IP: 178.80.**.**).',
    isUnread: false,
    section: 'earlier',
  },
];

export function useAlerts() {
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [activeFilter, setActiveFilter] = useState<AlertCategory>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const markAllAsRead = useCallback(() => {
    setAlerts((prevAlerts) =>
      prevAlerts.map((alert) =>
        alert.isUnread ? { ...alert, isUnread: false } : alert
      )
    );
  }, []);

  const markAsRead = useCallback((alertId: string) => {
    setAlerts((prevAlerts) =>
      prevAlerts.map((alert) =>
        alert.id === alertId ? { ...alert, isUnread: false } : alert
      )
    );
  }, []);

  const refreshAlerts = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  }, []);

  return {
    alerts,
    filteredAlerts,
    todayAlerts,
    earlierAlerts,
    unreadCount,
    counts,
    activeFilter,
    setActiveFilter,
    isRefreshing,
    refreshAlerts,
    markAllAsRead,
    markAsRead,
  };
}
