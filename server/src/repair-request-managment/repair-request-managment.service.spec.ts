import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
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
      findMany: any;
      count: any;
      updateMany: any;
    };
    repairTicket: {
      findUnique: any;
      findMany: any;
      count: any;
      create: any;
      update: any;
    };
    repairStatusHistory: {
      create: any;
      findMany: any;
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
        findMany: vi.fn(),
        count: vi.fn(),
        updateMany: vi.fn(),
      },
      repairTicket: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      repairStatusHistory: {
        create: vi.fn(),
        findMany: vi.fn(),
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

  describe('listRequests & getRequestById', () => {
    it('lists requests with pagination', async () => {
      prisma.repairRequest.count.mockResolvedValue(1);
      prisma.repairRequest.findMany.mockResolvedValue([{ id: 'r1' }]);

      const result = await service.listRequests({ page: 1, limit: 10, status: RepairRequestStatus.PENDING });
      expect(result.items).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it('returns a request by ID if found', async () => {
      prisma.repairRequest.findUnique.mockResolvedValue({ id: 'r1' });
      const result = await service.getRequestById('r1');
      expect(result).toEqual({ id: 'r1' });
    });

    it('throws NotFoundException if request not found', async () => {
      prisma.repairRequest.findUnique.mockResolvedValue(null);
      await expect(service.getRequestById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('listTickets, getTicketById & getTicketHistory', () => {
    it('lists tickets for admin', async () => {
      prisma.repairTicket.count.mockResolvedValue(1);
      prisma.repairTicket.findMany.mockResolvedValue([{ id: 't1' }]);

      const result = await service.listTickets(
        { page: 1, limit: 10, status: RepairTicketStatus.ACCEPTED, priority: RepairTicketPriority.HIGH, technicianId: 'tech-1' },
        { sub: 'admin-1', role: 'ADMIN' },
      );
      expect(result.items).toHaveLength(1);
    });

    it('lists tickets for technician defaults to assigned to me', async () => {
      prisma.repairTicket.count.mockResolvedValue(1);
      prisma.repairTicket.findMany.mockResolvedValue([{ id: 't1' }]);

      const result = await service.listTickets(
        { page: 1, limit: 10 },
        { sub: 'tech-1', role: 'TECHNICIAN' },
      );
      expect(result.items).toHaveLength(1);
    });

    it('throws NotFoundException if ticket not found', async () => {
      prisma.repairTicket.findUnique.mockResolvedValue(null);
      await expect(service.getTicketById('t1', { sub: 'tech-1', role: 'TECHNICIAN' })).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException if technician tries to access ticket of another technician', async () => {
      prisma.repairTicket.findUnique.mockResolvedValue({
        id: 't1',
        technicianId: 'other-tech',
      });
      await expect(service.getTicketById('t1', { sub: 'tech-1', role: 'TECHNICIAN' })).rejects.toThrow(ForbiddenException);
    });

    it('returns ticket history if technician has access', async () => {
      prisma.repairTicket.findUnique.mockResolvedValue({
        id: 't1',
        technicianId: 'tech-1',
      });
      prisma.repairStatusHistory.findMany.mockResolvedValue([{ id: 'h1' }]);
      const history = await service.getTicketHistory('t1', { sub: 'tech-1', role: 'TECHNICIAN' });
      expect(history).toHaveLength(1);
    });
  });

  describe('assignTechnician and unassignTechnician', () => {
    it('throws NotFoundException if technician does not exist', async () => {
      prisma.repairTicket.findUnique.mockResolvedValue({ id: 't1' });
      prisma.technician.findUnique.mockResolvedValue(null);

      await expect(service.assignTechnician('t1', { technicianId: 'tech-1' })).rejects.toThrow(NotFoundException);
    });

    it('assigns technician and sends notification', async () => {
      prisma.repairTicket.findUnique.mockResolvedValue({ id: 't1' });
      prisma.technician.findUnique.mockResolvedValue({ id: 'tech-1' });
      const updatedTicket = {
        id: 't1',
        ticketNumber: 'TK-1',
        requestId: 'req-1',
        status: RepairTicketStatus.ACCEPTED,
        technicianId: 'tech-1',
        request: { device: { customerId: 'cust-1' } },
      };
      prisma.repairTicket.update.mockResolvedValue(updatedTicket);

      const res = await service.assignTechnician('t1', { technicianId: 'tech-1' });
      expect(res).toEqual(updatedTicket);
      expect(notificationsService.createAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          type: NotificationType.TECHNICIAN_ASSIGNED,
        }),
      );
    });

    it('unassignTechnician throws BadRequestException if ticket is not assigned', async () => {
      prisma.repairTicket.findUnique.mockResolvedValue({ id: 't1', technicianId: null });
      await expect(service.unassignTechnician('t1')).rejects.toThrow(BadRequestException);
    });

    it('unassignTechnician clears technician and creates history record', async () => {
      prisma.repairTicket.findUnique.mockResolvedValue({
        id: 't1',
        technicianId: 'tech-1',
        status: RepairTicketStatus.ACCEPTED,
        technician: { user: { name: 'Bob' } },
      });
      prisma.repairTicket.update.mockResolvedValue({ id: 't1', technicianId: null });

      const res = await service.unassignTechnician('t1');
      expect(res.technicianId).toBeNull();
      expect(prisma.repairStatusHistory.create).toHaveBeenCalled();
    });
  });

  describe('startRepair, markReadyForPickup, completeTicket, markUnrepairable, cancelTicket', () => {
    const baseTicket = {
      id: 't1',
      ticketNumber: 'TK-1',
      requestId: 'req-1',
      technicianId: 'tech-1',
      request: { device: { customerId: 'cust-1' } },
    };

    it('startRepair throws ConflictException if ticket is not DIAGNOSING', async () => {
      prisma.repairTicket.findUnique.mockResolvedValue({ ...baseTicket, status: RepairTicketStatus.ACCEPTED });
      await expect(service.startRepair('t1', { sub: 'tech-1', role: 'TECHNICIAN' }, { diagnosis: 'fixed' }))
        .rejects.toThrow(ConflictException);
    });

    it('startRepair succeeds and notifies customer', async () => {
      prisma.repairTicket.findUnique.mockResolvedValue({ ...baseTicket, status: RepairTicketStatus.DIAGNOSING });
      prisma.repairTicket.update.mockResolvedValue({ ...baseTicket, status: RepairTicketStatus.IN_REPAIR });

      const res = await service.startRepair('t1', { sub: 'tech-1', role: 'TECHNICIAN' }, { diagnosis: 'Fixed part' });
      expect(res.status).toBe(RepairTicketStatus.IN_REPAIR);
      expect(notificationsService.createAndSend).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Repair In Progress' }),
      );
    });

    it('markReadyForPickup throws ConflictException if not IN_REPAIR', async () => {
      prisma.repairTicket.findUnique.mockResolvedValue({ ...baseTicket, status: RepairTicketStatus.ACCEPTED });
      await expect(service.markReadyForPickup('t1', { sub: 'tech-1', role: 'TECHNICIAN' }, { repairNotes: 'Done' }))
        .rejects.toThrow(ConflictException);
    });

    it('markReadyForPickup succeeds and notifies customer', async () => {
      prisma.repairTicket.findUnique.mockResolvedValue({ ...baseTicket, status: RepairTicketStatus.IN_REPAIR });
      prisma.repairTicket.update.mockResolvedValue({ ...baseTicket, status: RepairTicketStatus.READY_FOR_PICKUP });

      const res = await service.markReadyForPickup('t1', { sub: 'tech-1', role: 'TECHNICIAN' }, { repairNotes: 'Done' });
      expect(res.status).toBe(RepairTicketStatus.READY_FOR_PICKUP);
      expect(notificationsService.createAndSend).toHaveBeenCalledWith(
        expect.objectContaining({ type: NotificationType.REPAIR_READY_FOR_PICKUP }),
      );
    });

    it('completeTicket throws ConflictException if not READY_FOR_PICKUP', async () => {
      prisma.repairTicket.findUnique.mockResolvedValue({ ...baseTicket, status: RepairTicketStatus.IN_REPAIR });
      await expect(service.completeTicket('t1', { sub: 'tech-1', role: 'TECHNICIAN' }, {}))
        .rejects.toThrow(ConflictException);
    });

    it('completeTicket succeeds and notifies customer', async () => {
      prisma.repairTicket.findUnique.mockResolvedValue({ ...baseTicket, status: RepairTicketStatus.READY_FOR_PICKUP });
      prisma.repairTicket.update.mockResolvedValue({ ...baseTicket, status: RepairTicketStatus.COMPLETED });

      const res = await service.completeTicket('t1', { sub: 'tech-1', role: 'TECHNICIAN' }, {});
      expect(res.status).toBe(RepairTicketStatus.COMPLETED);
      expect(notificationsService.createAndSend).toHaveBeenCalledWith(
        expect.objectContaining({ type: NotificationType.REPAIR_COMPLETED }),
      );
    });

    it('markUnrepairable throws ConflictException if ticket is already completed or closed', async () => {
      prisma.repairTicket.findUnique.mockResolvedValue({ ...baseTicket, status: RepairTicketStatus.COMPLETED });
      await expect(service.markUnrepairable('t1', { sub: 'tech-1', role: 'TECHNICIAN' }, { reason: 'Cannot fix' }))
        .rejects.toThrow(ConflictException);
    });

    it('markUnrepairable succeeds from active status', async () => {
      prisma.repairTicket.findUnique.mockResolvedValue({ ...baseTicket, status: RepairTicketStatus.DIAGNOSING });
      prisma.repairTicket.update.mockResolvedValue({ ...baseTicket, status: RepairTicketStatus.UNREPAIRABLE });

      const res = await service.markUnrepairable('t1', { sub: 'tech-1', role: 'TECHNICIAN' }, { reason: 'Water damage' });
      expect(res.status).toBe(RepairTicketStatus.UNREPAIRABLE);
      expect(notificationsService.createAndSend).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Repair Cannot Be Completed' }),
      );
    });

    it('cancelTicket throws ConflictException if ticket is already closed', async () => {
      prisma.repairTicket.findUnique.mockResolvedValue({ ...baseTicket, status: RepairTicketStatus.CANCELLED });
      await expect(service.cancelTicket('t1', {})).rejects.toThrow(ConflictException);
    });
  });
});
