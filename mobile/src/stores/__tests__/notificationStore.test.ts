import { useNotificationStore } from '../notificationStore';

describe('notificationStore', () => {
  beforeEach(() => {
    useNotificationStore.setState({ notifications: [], unreadCount: 0 });
  });

  it('initializes with empty notifications and 0 unread count', () => {
    const state = useNotificationStore.getState();
    expect(state.notifications).toEqual([]);
    expect(state.unreadCount).toBe(0);
  });

  it('adds notification and increments unread count', () => {
    useNotificationStore.getState().addNotification({
      id: 'notif-1',
      type: 'REPAIR_STATUS',
      title: 'Diagnostics Complete',
      body: 'Your device has been diagnosed.',
      data: { repairId: '123' },
      createdAt: '2026-10-13T10:00:00Z',
    });

    const state = useNotificationStore.getState();
    expect(state.notifications).toHaveLength(1);
    expect(state.notifications[0].id).toBe('notif-1');
    expect(state.notifications[0].isRead).toBe(false);
    expect(state.unreadCount).toBe(1);
  });

  it('does not add duplicate notifications with the same id', () => {
    const payload = {
      id: 'notif-dup',
      type: 'INFO',
      title: 'Title',
      body: 'Body',
      data: {},
      createdAt: '2026-10-13T10:00:00Z',
    };

    useNotificationStore.getState().addNotification(payload);
    useNotificationStore.getState().addNotification(payload);

    const state = useNotificationStore.getState();
    expect(state.notifications).toHaveLength(1);
    expect(state.unreadCount).toBe(1);
  });

  it('marks a single notification as read and updates unread count', () => {
    useNotificationStore.getState().addNotification({
      id: 'notif-1',
      type: 'INFO',
      title: 'One',
      body: 'One body',
      data: {},
      createdAt: '2026-10-13T10:00:00Z',
    });
    useNotificationStore.getState().addNotification({
      id: 'notif-2',
      type: 'INFO',
      title: 'Two',
      body: 'Two body',
      data: {},
      createdAt: '2026-10-13T10:01:00Z',
    });

    expect(useNotificationStore.getState().unreadCount).toBe(2);

    useNotificationStore.getState().markAsRead('notif-1');

    const state = useNotificationStore.getState();
    expect(state.notifications.find((n) => n.id === 'notif-1')?.isRead).toBe(true);
    expect(state.notifications.find((n) => n.id === 'notif-2')?.isRead).toBe(false);
    expect(state.unreadCount).toBe(1);
  });

  it('marks all notifications as read and resets unread count to 0', () => {
    useNotificationStore.getState().addNotification({
      id: 'notif-1',
      type: 'INFO',
      title: 'One',
      body: 'One body',
      data: {},
      createdAt: '2026-10-13T10:00:00Z',
    });
    useNotificationStore.getState().addNotification({
      id: 'notif-2',
      type: 'INFO',
      title: 'Two',
      body: 'Two body',
      data: {},
      createdAt: '2026-10-13T10:01:00Z',
    });

    useNotificationStore.getState().markAllAsRead();

    const state = useNotificationStore.getState();
    expect(state.notifications.every((n) => n.isRead)).toBe(true);
    expect(state.unreadCount).toBe(0);
  });

  it('sets notifications array and computes unread count', () => {
    useNotificationStore.getState().setNotifications([
      {
        id: 'n-1',
        type: 'A',
        title: 'T1',
        body: 'B1',
        data: {},
        createdAt: '2026-10-13T10:00:00Z',
        isRead: false,
      },
      {
        id: 'n-2',
        type: 'B',
        title: 'T2',
        body: 'B2',
        data: {},
        createdAt: '2026-10-13T10:01:00Z',
        isRead: true,
      },
    ]);

    const state = useNotificationStore.getState();
    expect(state.notifications).toHaveLength(2);
    expect(state.unreadCount).toBe(1);
  });

  it('sets unread count directly', () => {
    useNotificationStore.getState().setUnreadCount(5);
    expect(useNotificationStore.getState().unreadCount).toBe(5);
  });
});
