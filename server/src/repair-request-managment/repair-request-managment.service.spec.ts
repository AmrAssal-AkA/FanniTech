import { Test, TestingModule } from '@nestjs/testing';
import { RepairRequestManagmentService } from './repair-request-managment.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { NotificationType, RepairTicketStatus } from '../prisma/generated/client.js';

describe('RepairRequestManagmentService', () => {
  let service: RepairRequestManagmentService;
  let prisma: {
    repairTicket: {
      findUnique: any;
      update: any;
    };
    repairStatusHistory: {
      create: any;
    };
    $transaction: any;
  };
  let notificationsService: {
    createAndSend: any;
  };

  beforeEach(async () => {
    prisma = {
      repairTicket: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      repairStatusHistory: {
        create: vi.fn(),
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
