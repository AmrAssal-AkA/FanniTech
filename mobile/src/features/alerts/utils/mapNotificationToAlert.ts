import { AlertItem, AlertType, AlertAction } from '../types';
import { ApiNotification } from '../services/NotificationsService';
import { NotificationItem } from '../../../stores/notificationStore';

type NotificationSource = ApiNotification | NotificationItem;

export function mapNotificationToAlert(n: NotificationSource): AlertItem {
  const typeStr = n.type.toLowerCase();
  const createdAt = new Date(n.createdAt);
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - createdAt.getTime());
  const isToday = diffMs < 24 * 60 * 60 * 1000;

  const timeAgo = isToday
    ? diffMs < 3600_000
      ? `${Math.max(1, Math.round(diffMs / 60_000))}m ago`
      : `${Math.round(diffMs / 3600_000)}h ago`
    : createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const isRead = 'isRead' in n ? n.isRead : n.readAt !== null;

  const category: 'repairs' | 'devices' = typeStr.includes('device')
    ? 'devices'
    : 'repairs';

  let alertType: AlertType = 'status';
  if (typeStr.includes('diagnostic')) {
    alertType = 'diagnostic';
  } else if (typeStr.includes('intake')) {
    alertType = 'intake';
  } else if (typeStr.includes('security')) {
    alertType = 'security';
  } else if (typeStr.includes('thermal')) {
    alertType = 'thermal';
  }

  const data = (n.data ?? {}) as Record<string, unknown>;
  const referenceId = typeof data.referenceId === 'string' ? data.referenceId : '';
  const tag = typeof data.tag === 'string' ? data.tag : n.type;
  const technician = typeof data.technician === 'string' ? data.technician : undefined;
  const location = typeof data.location === 'string' ? data.location : undefined;

  let action: AlertAction | undefined;
  if (data.action && typeof data.action === 'object') {
    const act = data.action as Record<string, unknown>;
    if (typeof act.label === 'string' && (act.type === 'ticket' || act.type === 'info')) {
      action = {
        label: act.label,
        type: act.type,
        target: typeof act.target === 'string' ? act.target : undefined,
        infoDetails: typeof act.infoDetails === 'string' ? act.infoDetails : undefined,
      };
    }
  }

  return {
    id: n.id,
    category,
    type: alertType,
    referenceId,
    tag,
    timeAgo,
    title: n.title,
    description: n.body,
    isUnread: !isRead,
    section: isToday ? 'today' : 'earlier',
    technician,
    location,
    action,
  };
}
