import { RepairTicketsService } from '../services/RepairTicketsService';
import { serverClient } from '../../../utils/serverClient';

jest.mock('../../../utils/serverClient', () => ({
  serverClient: {
    get: jest.fn(),
  },
}));

describe('RepairTicketsService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches ticket details by ticket number', async () => {
    const mockData = {
      id: 'ticket-1',
      ticketNumber: 'SR-1001',
      status: 'DIAGNOSING',
      priority: 'HIGH',
      createdAt: '2026-10-25T00:00:00.000Z',
      updatedAt: '2026-10-25T00:00:00.000Z',
    };

    (serverClient.get as jest.Mock).mockResolvedValueOnce({
      data: { data: mockData },
    });

    const result = await RepairTicketsService.getTicketByIdOrNumber('SR-1001');

    expect(serverClient.get).toHaveBeenCalledWith(
      '/api/v1/repair-requests/tickets/SR-1001'
    );
    expect(result).toEqual(mockData);
  });

  it('fetches ticket details by request id', async () => {
    const mockTicket = {
      id: 'ticket-1',
      ticketNumber: 'SR-1001',
      status: 'DIAGNOSING',
    };

    (serverClient.get as jest.Mock).mockResolvedValueOnce({
      data: { data: { repairTicket: mockTicket } },
    });

    const result = await RepairTicketsService.getTicketByRequestId('req-123');

    expect(serverClient.get).toHaveBeenCalledWith(
      '/api/v1/repair-requests/req-123'
    );
    expect(result).toEqual(mockTicket);
  });
});

