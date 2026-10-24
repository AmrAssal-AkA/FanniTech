import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { RepairRequestManagmentService } from './repair-request-managment.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import {
  NotificationType,
  Prisma,
  RepairRequestStatus,
  RepairTicketPriority,
  RepairTicketStatus,
} from '../prisma/generated/client.js';

describe('RepairRequestManagmentService', () => {
  let service: RepairRequestManagmentService;
  let prisma: {
    repairRequest: {
      findUnique: any;
      findUniqueOrThrow: any;
      updateMany: any;
    };
    repairTicket: {
      findUnique: any;
      create: any;
      update: any;
    };
    repairStatusHistory: {
      create: any;
    };
    technician: {
      findUnique: any;
    };
    $transaction: any;
  };
  let notificationsService: {
    createAndSend: any;
  };

  beforeEach(async () => {
    prisma = {
      repairRequest: {
        findUnique: vi.fn(),
        findUniqueOrThrow: vi.fn(),
        updateMany: vi.fn(),
      },
      repairTicket: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      repairStatusHistory: {
        create: vi.fn(),
      },
      technician: {
        findUnique: vi.fn(),
      },
      $transaction: vi.fn((cb) => cb(prisma)),
    };

    notificationsService = {
      createAndSend: vi.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RepairRequestManagmentService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: notificationsService },
      ],
    }).compile();

    service = module.get<RepairRequestManagmentService>(RepairRequestManagmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('acceptRequest', () => {
    const mockRequest = {
      id: 'req-1',
      status: RepairRequestStatus.PENDING,
      repairTicket: null,
      device: {
        customerId: 'cust-1',
      },
    };

    const mockCreatedTicket = {
      id: 'ticket-1',
      ticketNumber: 'TK-1001',
      requestId: 'req-1',
      status: RepairTicketStatus.ACCEPTED,
      technicianId: null,
      request: {
        device: {
          customerId: 'cust-1',
        },
      },
    };

    it('successfully accepts request and creates ticket', async () => {
      prisma.repairRequest.findUnique.mockResolvedValue(mockRequest);
      prisma.repairRequest.updateMany.mockResolvedValue({ count: 1 });
      prisma.repairTicket.create.mockResolvedValue(mockCreatedTicket);
      prisma.repairRequest.findUniqueOrThrow.mockResolvedValue({
        ...mockRequest,
        status: RepairRequestStatus.ACCEPTED,
      });

      const result = await service.acceptRequest('req-1', {
        priority: RepairTicketPriority.HIGH,
      });

      expect(prisma.repairRequest.updateMany).toHaveBeenCalledWith({
        where: { id: 'req-1', status: RepairRequestStatus.PENDING },
        data: { status: RepairRequestStatus.ACCEPTED },
      });
      expect(prisma.repairTicket.create).toHaveBeenCalledWith({
        data: {
          requestId: 'req-1',
          technicianId: undefined,
          priority: RepairTicketPriority.HIGH,
          statusHistory: { create: { status: RepairTicketStatus.ACCEPTED } },
        },
        include: expect.any(Object),
      });
      expect(result.ticket).toEqual(mockCreatedTicket);
      expect(notificationsService.createAndSend).toHaveBeenCalledWith({
        userId: 'cust-1',
        type: NotificationType.REPAIR_REQUEST_ACCEPTED,
        title: 'Repair Request Accepted',
        body: 'Your repair request was accepted. Ticket TK-1001 was created.',
        data: {
          repairRequestId: 'req-1',
          ticketId: 'ticket-1',
          ticketNumber: 'TK-1001',
          status: RepairTicketStatus.ACCEPTED,
        },
      });
    });

    it('throws ConflictException if request already has a repairTicket', async () => {
      prisma.repairRequest.findUnique.mockResolvedValue({
        ...mockRequest,
        repairTicket: { id: 'ticket-existing' },
      });

      await expect(
        service.acceptRequest('req-1', { priority: RepairTicketPriority.MEDIUM }),
      ).rejects.toThrow(ConflictException);

      expect(prisma.repairRequest.updateMany).not.toHaveBeenCalled();
      expect(prisma.repairTicket.create).not.toHaveBeenCalled();
    });

    it('throws ConflictException if request status is not PENDING', async () => {
      prisma.repairRequest.findUnique.mockResolvedValue({
        ...mockRequest,
        status: RepairRequestStatus.ACCEPTED,
      });

      await expect(
        service.acceptRequest('req-1', { priority: RepairTicketPriority.MEDIUM }),
      ).rejects.toThrow(ConflictException);

      expect(prisma.repairRequest.updateMany).not.toHaveBeenCalled();
      expect(prisma.repairTicket.create).not.toHaveBeenCalled();
    });

    it('throws ConflictException if atomic updateMany returns count 0 (concurrent accept)', async () => {
      prisma.repairRequest.findUnique.mockResolvedValue(mockRequest);
      prisma.repairRequest.updateMany.mockResolvedValue({ count: 0 });

      await expect(
        service.acceptRequest('req-1', { priority: RepairTicketPriority.MEDIUM }),
      ).rejects.toThrow(
        new ConflictException(
          'Repair request has already been processed or is no longer pending',
        ),
      );

      expect(prisma.repairTicket.create).not.toHaveBeenCalled();
    });

    it('catches Prisma P2002 unique constraint error and throws ConflictException', async () => {
      prisma.repairRequest.findUnique.mockResolvedValue(mockRequest);
      prisma.repairRequest.updateMany.mockResolvedValue({ count: 1 });
      const p2002Error = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed on the constraint: `RepairTicket_requestId_key`',
        {
          code: 'P2002',
          clientVersion: '7.10.0',
        },
      );
      prisma.repairTicket.create.mockRejectedValue(p2002Error);

      await expect(
        service.acceptRequest('req-1', { priority: RepairTicketPriority.MEDIUM }),
      ).rejects.toThrow(
        new ConflictException(
          'A repair ticket already exists for this repair request',
        ),
      );
    });
  });

  describe('rejectRequest', () => {
    const mockRequest = {
      id: 'req-1',
      status: RepairRequestStatus.PENDING,
      repairTicket: null,
      device: {
        customerId: 'cust-1',
      },
    };

    it('successfully rejects request', async () => {
      prisma.repairRequest.findUnique.mockResolvedValue(mockRequest);
      prisma.repairRequest.updateMany.mockResolvedValue({ count: 1 });
      prisma.repairRequest.findUniqueOrThrow.mockResolvedValue({
        ...mockRequest,
        status: RepairRequestStatus.REJECTED,
      });

      const result = await service.rejectRequest('req-1', {
        reason: 'Cannot source parts',
      });

      expect(prisma.repairRequest.updateMany).toHaveBeenCalledWith({
        where: { id: 'req-1', status: RepairRequestStatus.PENDING },
        data: { status: RepairRequestStatus.REJECTED },
      });
      expect(result.status).toBe(RepairRequestStatus.REJECTED);
      expect(notificationsService.createAndSend).toHaveBeenCalledWith({
        userId: 'cust-1',
        type: NotificationType.REPAIR_REQUEST_REJECTED,
        title: 'Repair Request Rejected',
        body: 'Cannot source parts',
        data: {
          repairRequestId: 'req-1',
          reason: 'Cannot source parts',
        },
      });
    });

    it('throws ConflictException if request already has a repairTicket', async () => {
      prisma.repairRequest.findUnique.mockResolvedValue({
        ...mockRequest,
        repairTicket: { id: 'ticket-1' },
      });

      await expect(
        service.rejectRequest('req-1', { reason: 'Cannot fix' }),
      ).rejects.toThrow(ConflictException);

      expect(prisma.repairRequest.updateMany).not.toHaveBeenCalled();
    });

    it('throws ConflictException if updateMany returns count 0', async () => {
      prisma.repairRequest.findUnique.mockResolvedValue(mockRequest);
      prisma.repairRequest.updateMany.mockResolvedValue({ count: 0 });

      await expect(
        service.rejectRequest('req-1', { reason: 'Cannot fix' }),
      ).rejects.toThrow(
        new ConflictException(
          'Repair request has already been processed or is no longer pending',
        ),
      );
    });
  });

  it('emits real-time notification with ticket metadata when startDiagnosis is called', async () => {
    const mockTicket = {
      id: 'ticket-1',
      ticketNumber: 'TK-1001',
      requestId: 'req-1',
      status: RepairTicketStatus.ACCEPTED,
      technicianId: 'tech-1',
      request: {
        device: {
          customerId: 'cust-1',
        },
      },
    };

    prisma.repairTicket.findUnique.mockResolvedValue(mockTicket);
    const updatedTicket = {
      ...mockTicket,
      status: RepairTicketStatus.DIAGNOSING,
    };
    prisma.repairTicket.update.mockResolvedValue(updatedTicket);

    const result = await service.startDiagnosis(
      'ticket-1',
      { sub: 'tech-1', role: 'TECHNICIAN' },
      { notes: 'Starting bench test' },
    );

    expect(result.status).toBe(RepairTicketStatus.DIAGNOSING);
    expect(notificationsService.createAndSend).toHaveBeenCalledWith({
      userId: 'cust-1',
      type: NotificationType.REPAIR_STATUS_UPDATED,
      title: 'Diagnosis Started',
      body: 'Our technician has started diagnosing your device.',
      data: {
        ticketId: 'ticket-1',
        ticketNumber: 'TK-1001',
        repairRequestId: 'req-1',
        status: RepairTicketStatus.DIAGNOSING,
      },
    });
  });

  it('emits real-time notification with ticket metadata when cancelTicket is called', async () => {
    const mockTicket = {
      id: 'ticket-1',
      ticketNumber: 'TK-1001',
      requestId: 'req-1',
      status: RepairTicketStatus.ACCEPTED,
      technicianId: null,
      request: {
        device: {
          customerId: 'cust-1',
        },
      },
    };

    prisma.repairTicket.findUnique.mockResolvedValue(mockTicket);
    const updatedTicket = {
      ...mockTicket,
      status: RepairTicketStatus.CANCELLED,
    };
    prisma.repairTicket.update.mockResolvedValue(updatedTicket);

    const result = await service.cancelTicket('ticket-1', {
      notes: 'Customer requested cancellation',
    });

    expect(result.status).toBe(RepairTicketStatus.CANCELLED);
    expect(notificationsService.createAndSend).toHaveBeenCalledWith({
      userId: 'cust-1',
      type: NotificationType.REPAIR_STATUS_UPDATED,
      title: 'Repair Ticket Cancelled',
      body: 'Customer requested cancellation',
      data: {
        ticketId: 'ticket-1',
        ticketNumber: 'TK-1001',
        repairRequestId: 'req-1',
        status: RepairTicketStatus.CANCELLED,
      },
    });
  });
});
