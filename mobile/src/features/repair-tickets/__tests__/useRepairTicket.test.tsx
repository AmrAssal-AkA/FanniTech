import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRepairTicket } from '../hooks/useRepairTicket';
import { RepairTicketsService } from '../services/RepairTicketsService';
import { RepairRequestsService } from '../../repair-requests/services/RepairRequestsService';
import { ApiRepairTicketResponse } from '../types';

jest.mock('../services/RepairTicketsService', () => ({
  RepairTicketsService: {
    getTicketByIdOrNumber: jest.fn(),
  },
}));

jest.mock('../../repair-requests/services/RepairRequestsService', () => ({
  RepairRequestsService: {
    getRequestById: jest.fn(),
  },
}));

const mockApiTicket: ApiRepairTicketResponse = {
  id: 'ticket-real-99',
  ticketNumber: 'SR-9999',
  requestId: 'req-real-88',
  status: 'IN_REPAIR',
  priority: 'HIGH',
  diagnosis: 'Verified power supply capacitor failure.',
  repairNotes: 'Soldered replacement caps.',
  createdAt: '2026-10-18T10:00:00.000Z',
  updatedAt: '2026-10-18T12:00:00.000Z',
  request: {
    id: 'req-real-88',
    deviceId: 'dev-1',
    problem: 'No power on boot',
    description: 'Blinked once then turned off.',
    status: 'IN_PROGRESS',
    createdAt: '2026-10-18T09:00:00.000Z',
    device: {
      id: 'dev-1',
      brand: 'Dell',
      model: 'XPS 15',
      deviceType: 'Laptop',
      serialNumber: 'SN-DELL-1234',
    },
    images: [{ id: 'img-1', url: 'https://example.com/dell-board.jpg', fileName: 'dell-board.jpg' }],
  },
  technician: {
    id: 'tech-1',
    employeeId: 'EMP-01',
    user: {
      id: 'user-tech-1',
      name: 'Salim Al-Harbi',
      email: 'salim@fannitech.com',
      phone: '+966551122334',
    },
  },
  statusHistory: [
    {
      id: 'hist-1',
      ticketId: 'ticket-real-99',
      status: 'ACCEPTED',
      changedAt: '2026-10-18T10:15:00.000Z',
      notes: 'Intake verified',
    },
    {
      id: 'hist-2',
      ticketId: 'ticket-real-99',
      status: 'DIAGNOSING',
      changedAt: '2026-10-18T11:00:00.000Z',
      notes: 'Diagnostic completed',
    },
    {
      id: 'hist-3',
      ticketId: 'ticket-real-99',
      status: 'IN_REPAIR',
      changedAt: '2026-10-18T12:00:00.000Z',
      notes: 'Replacing capacitors',
    },
  ],
};

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
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useRepairTicket Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient?.clear();
  });

  it('fetches and maps real repair ticket data by ticketNumber', async () => {
    (RepairTicketsService.getTicketByIdOrNumber as jest.Mock).mockResolvedValueOnce(
      mockApiTicket
    );

    const { result } = await renderHook(
      () => useRepairTicket({ ticketNumber: 'SR-9999' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(RepairTicketsService.getTicketByIdOrNumber).toHaveBeenCalledWith('SR-9999');
    expect(result.current.ticket).toBeDefined();
    expect(result.current.ticket?.ticketNumber).toBe('SR-9999');
    expect(result.current.ticket?.status).toBe('IN_REPAIR');
    expect(result.current.ticket?.currentStage).toBe(3);
    expect(result.current.ticket?.progressPercent).toBe(60);
    expect(result.current.ticket?.device.brand).toBe('Dell');
    expect(result.current.ticket?.device.model).toBe('XPS 15');
    expect(result.current.ticket?.device.serialNumber).toBe('SN-DELL-1234');
    expect(result.current.ticket?.technician?.name).toBe('Salim Al-Harbi');
    expect(result.current.ticket?.diagnosticFeed?.imageUrl).toBe(
      'https://example.com/dell-board.jpg'
    );
    expect(result.current.isError).toBe(false);
  });

  it('fetches and maps repair ticket when given requestId', async () => {
    (RepairRequestsService.getRequestById as jest.Mock).mockResolvedValueOnce({
      id: 'req-real-88',
      deviceId: 'dev-1',
      problem: 'Screen glitching',
      description: 'Horizontal lines appearing on boot.',
      status: 'PENDING',
      createdAt: '2026-10-18T08:00:00.000Z',
      updatedAt: '2026-10-18T08:00:00.000Z',
      device: {
        id: 'dev-1',
        brand: 'Apple',
        model: 'MacBook Pro 16',
        deviceType: 'Laptop',
        serialNumber: 'C02ABCDEF',
      },
      images: [],
    });

    const { result } = await renderHook(
      () => useRepairTicket({ requestId: 'req-real-88' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(RepairRequestsService.getRequestById).toHaveBeenCalledWith('req-real-88');
    expect(result.current.ticket).toBeDefined();
    expect(result.current.ticket?.device.brand).toBe('Apple');
    expect(result.current.ticket?.device.model).toBe('MacBook Pro 16');
    expect(result.current.ticket?.status).toBe('ACCEPTED');
    expect(result.current.ticket?.currentStage).toBe(1);
    expect(result.current.ticket?.progressPercent).toBe(20);
    expect(result.current.ticket?.diagnosticFeed).toBeUndefined();
    expect(result.current.isError).toBe(false);
  });

  it('exposes isLiveConnected status from socketService', async () => {
    (RepairTicketsService.getTicketByIdOrNumber as jest.Mock).mockResolvedValueOnce(
      mockApiTicket
    );

    const { result } = await renderHook(
      () => useRepairTicket({ ticketNumber: 'SR-9999' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.isLiveConnected).toBe('boolean');
  });

  it('does NOT fallback to dummy data on error, returns isError=true', async () => {
    (RepairTicketsService.getTicketByIdOrNumber as jest.Mock).mockRejectedValueOnce(
      new Error('Ticket not found')
    );

    const { result } = await renderHook(
      () => useRepairTicket({ ticketNumber: 'SR-NONEXISTENT' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.ticket).toBeUndefined();
    expect(result.current.error?.message).toBe('Ticket not found');
  });
});

