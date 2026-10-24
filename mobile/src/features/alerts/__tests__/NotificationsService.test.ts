import { NotificationsService } from '../services/NotificationsService';
import { serverClient } from '../../../utils/serverClient';

jest.mock('../../../utils/serverClient', () => ({
  serverClient: {
    get: jest.fn(),
    patch: jest.fn(),
  },
}));

const mockedClient = serverClient as jest.Mocked<typeof serverClient>;

describe('NotificationsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists notifications with pagination parameters', async () => {
    const mockResponse = {
      data: {
        items: [
          {
            id: 'n-1',
            type: 'REPAIR_STATUS',
            title: 'Diagnostic update',
            body: 'Details here',
            data: {},
            createdAt: '2026-10-13T10:00:00Z',
            readAt: null,
          },
        ],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      },
    };
    mockedClient.get.mockResolvedValue(mockResponse);

    const result = await NotificationsService.list({ page: 1, limit: 20 });

    expect(mockedClient.get).toHaveBeenCalledWith('/api/v1/notifications', {
      params: { page: 1, limit: 20 },
    });
    expect(result).toEqual(mockResponse.data);
  });

  it('marks a single notification as read', async () => {
    mockedClient.patch.mockResolvedValue({ data: {} });

    await NotificationsService.markAsRead('n-123');

    expect(mockedClient.patch).toHaveBeenCalledWith('/api/v1/notifications/n-123/read');
  });

  it('marks all notifications as read', async () => {
    mockedClient.patch.mockResolvedValue({ data: {} });

    await NotificationsService.markAllAsRead();

    expect(mockedClient.patch).toHaveBeenCalledWith('/api/v1/notifications/read-all');
  });

  it('fetches unread notification count', async () => {
    mockedClient.get.mockResolvedValue({ data: { data: { count: 3 } } });

    const count = await NotificationsService.getUnreadCount();

    expect(mockedClient.get).toHaveBeenCalledWith('/api/v1/notifications/unread-count');
    expect(count).toBe(3);
  });
});
