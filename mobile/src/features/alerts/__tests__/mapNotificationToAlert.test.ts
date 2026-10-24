import { mapNotificationToAlert } from '../utils/mapNotificationToAlert';
import { ApiNotification } from '../services/NotificationsService';
import { NotificationItem } from '../../../stores/notificationStore';

describe('mapNotificationToAlert', () => {
  it('maps an ApiNotification correctly into an AlertItem', () => {
    const apiNotif: ApiNotification = {
      id: 'notif-1',
      type: 'DIAGNOSTIC_COMPLETED',
      title: 'Diagnostics in Progress',
      body: 'VRM voltage drop detected on Lenovo ThinkPad.',
      data: {
        referenceId: 'SR-1001',
        tag: 'Diagnostics',
        technician: 'Tech Tariq M.',
        action: {
          label: 'View Ticket',
          type: 'ticket',
          target: 'SR-1001',
        },
      },
      createdAt: new Date().toISOString(),
      readAt: null,
    };

    const alert = mapNotificationToAlert(apiNotif);

    expect(alert.id).toBe('notif-1');
    expect(alert.category).toBe('repairs');
    expect(alert.type).toBe('diagnostic');
    expect(alert.referenceId).toBe('SR-1001');
    expect(alert.tag).toBe('Diagnostics');
    expect(alert.title).toBe('Diagnostics in Progress');
    expect(alert.description).toBe('VRM voltage drop detected on Lenovo ThinkPad.');
    expect(alert.isUnread).toBe(true);
    expect(alert.section).toBe('today');
    expect(alert.technician).toBe('Tech Tariq M.');
    expect(alert.action).toEqual({
      label: 'View Ticket',
      type: 'ticket',
      target: 'SR-1001',
    });
  });

  it('marks read correctly when readAt is present in ApiNotification', () => {
    const apiNotif: ApiNotification = {
      id: 'notif-2',
      type: 'STATUS_UPDATE',
      title: 'Status Updated',
      body: 'Repair completed.',
      data: {},
      createdAt: new Date().toISOString(),
      readAt: '2026-10-13T09:00:00Z',
    };

    const alert = mapNotificationToAlert(apiNotif);
    expect(alert.isUnread).toBe(false);
  });

  it('maps a real-time NotificationItem correctly', () => {
    const item: NotificationItem = {
      id: 'notif-rt-1',
      type: 'DEVICE_REGISTERED',
      title: 'Device Added',
      body: 'ThinkPad T14 added to lab registry.',
      data: {
        referenceId: 'ThinkPad T14',
        location: 'Central Lab',
      },
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    const alert = mapNotificationToAlert(item);

    expect(alert.id).toBe('notif-rt-1');
    expect(alert.category).toBe('devices');
    expect(alert.type).toBe('status');
    expect(alert.referenceId).toBe('ThinkPad T14');
    expect(alert.location).toBe('Central Lab');
    expect(alert.isUnread).toBe(true);
  });

  it('identifies alert types based on type string', () => {
    const base = {
      id: 'test',
      title: 'T',
      body: 'B',
      data: {},
      createdAt: new Date().toISOString(),
      readAt: null,
    };

    expect(mapNotificationToAlert({ ...base, type: 'INTAKE_VERIFIED' }).type).toBe('intake');
    expect(mapNotificationToAlert({ ...base, type: 'SECURITY_ALERT' }).type).toBe('security');
    expect(mapNotificationToAlert({ ...base, type: 'THERMAL_INSPECTION' }).type).toBe('thermal');
    expect(mapNotificationToAlert({ ...base, type: 'OTHER' }).type).toBe('status');
  });

  it('categorizes older notifications into "earlier" section', () => {
    const pastDate = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const alert = mapNotificationToAlert({
      id: 'old-notif',
      type: 'STATUS_UPDATE',
      title: 'Past Alert',
      body: 'Old notification',
      data: {},
      createdAt: pastDate,
      readAt: null,
    });

    expect(alert.section).toBe('earlier');
  });
});
