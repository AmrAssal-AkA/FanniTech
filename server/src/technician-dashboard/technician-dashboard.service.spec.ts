import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  NotificationType,
  RepairTicketPriority,
  RepairTicketStatus,
} from '../prisma/generated/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { TechnicianDashboardService } from './technician-dashboard.service.js';

describe('TechnicianDashboardService', () => {
  let service: TechnicianDashboardService;
  let notificationsService: { createAndSend: any };
  let prisma: {
    technician: { findUnique: any };
    repairTicket: { findMany: any; count: any; findUnique: any; update: any };
    repairStatusHistory: { findMany: any; create: any };
    $transaction: any;
  };

  const mockTechnicianId = 'tech-uuid-1';

  beforeEach(async () => {
    prisma = {
      technician: { findUnique: vi.fn() },
      repairTicket: {
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      repairStatusHistory: {
        findMany: vi.fn(),
        create: vi.fn(),
      },
      $transaction: vi.fn((cb) => cb(prisma)),
    };

    notificationsService = {
      createAndSend: vi.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TechnicianDashboardService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: notificationsService },
      ],
    }).compile();

    service = module.get<TechnicianDashboardService>(TechnicianDashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('workBench', () => {
    it('should throw ForbiddenException if technician is not found', async () => {
      prisma.technician.findUnique.mockResolvedValue(null);

      await expect(service.workBench('unknown-tech')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should return workbench metrics and active ticket directly from DB for an active technician', async () => {
      prisma.technician.findUnique.mockResolvedValue({
        id: mockTechnicianId,
        employeeId: 'EMP-001',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: mockTechnicianId,
          name: 'Ahmed Zaki',
          email: 'ahmed@fannitech.com',
          phone: '+966501234567',
        },
      });

      const mockTicket = {
        id: 'ticket-1',
        ticketNumber: 'TK-2026-0001',
        priority: RepairTicketPriority.HIGH,
        status: RepairTicketStatus.DIAGNOSING,
        diagnosis: 'Defective capacitor',
        repairNotes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        request: {
          problem: 'No power',
          description: 'Shuts down immediately',
          device: {
            brand: 'Lenovo',
            model: 'ThinkPad T14',
            deviceType: 'Laptop',
            serialNumber: 'SN123456',
            customer: {
              user: {
                id: 'cust-1',
                name: 'Customer One',
                email: 'customer@test.com',
                phone: '+966555555555',
              },
              notes: 'VIP Client',
            },
          },
        },
      };

      prisma.repairTicket.findMany.mockResolvedValue([mockTicket]);
      prisma.repairTicket.count.mockResolvedValue(2);
      prisma.repairStatusHistory.findMany.mockResolvedValue([
        {
          id: 'hist-1',
          changedAt: new Date(),
          status: RepairTicketStatus.DIAGNOSING,
          notes: 'Started diagnosis',
          ticket: { id: 'ticket-1', ticketNumber: 'TK-2026-0001' },
        },
      ]);

      const result = await service.workBench(mockTechnicianId);

      expect(result).toBeDefined();
      expect(result.technician.name).toBe('Ahmed Zaki');
      expect(result.technician.employeeId).toBe('EMP-001');
      expect(result.metrics.activeQueueCount).toBe(1);
      expect(result.metrics.criticalUrgentCount).toBe(1);
      expect(result.metrics.underDiagnosisCount).toBe(1);
      expect(result.metrics.completedTodayCount).toBe(2);
      expect(result.activeTicket).toBeDefined();
      expect(result.activeTicket?.ticketNumber).toBe('TK-2026-0001');
      expect(result.recentActivities).toHaveLength(1);
    });

    it('should handle empty assigned tickets gracefully', async () => {
      prisma.technician.findUnique.mockResolvedValue({
        id: mockTechnicianId,
        employeeId: 'EMP-001',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: mockTechnicianId,
          name: 'Ahmed Zaki',
          email: 'ahmed@fannitech.com',
          phone: null,
        },
      });

      prisma.repairTicket.findMany.mockResolvedValue([]);
      prisma.repairTicket.count.mockResolvedValue(0);
      prisma.repairStatusHistory.findMany.mockResolvedValue([]);

      const result = await service.workBench(mockTechnicianId);

      expect(result.metrics.activeQueueCount).toBe(0);
      expect(result.activeTicket).toBeNull();
      expect(result.recentActivities).toEqual([]);
    });
  });

  describe('updateTicketNotes', () => {
    it('should throw NotFoundException if ticket is not found', async () => {
      prisma.repairTicket.findUnique.mockResolvedValue(null);

      await expect(
        service.updateTicketNotes('missing-id', mockTechnicianId, {
          diagnosis: 'Updated diagnosis',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if ticket belongs to another technician', async () => {
      prisma.repairTicket.findUnique.mockResolvedValue({
        id: 'ticket-1',
        technicianId: 'other-technician',
      });

      await expect(
        service.updateTicketNotes('ticket-1', mockTechnicianId, {
          diagnosis: 'Updated diagnosis',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should update diagnosis and record history entry when notes are provided', async () => {
      prisma.repairTicket.findUnique.mockResolvedValue({
        id: 'ticket-1',
        technicianId: mockTechnicianId,
        status: RepairTicketStatus.DIAGNOSING,
      });

      prisma.repairTicket.update.mockResolvedValue({
        id: 'ticket-1',
        ticketNumber: 'TK-1001',
        requestId: 'req-1',
        technicianId: mockTechnicianId,
        status: RepairTicketStatus.DIAGNOSING,
        diagnosis: 'New findings on capacitor',
        request: {
          device: {
            customerId: 'cust-1',
          },
        },
      });

      const result = await service.updateTicketNotes('ticket-1', mockTechnicianId, {
        diagnosis: 'New findings on capacitor',
        notes: 'Thermal camera check completed',
      });

      expect(prisma.repairTicket.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ticket-1' },
          data: { diagnosis: 'New findings on capacitor' },
        }),
      );

      expect(prisma.repairStatusHistory.create).toHaveBeenCalledWith({
        data: {
          ticketId: 'ticket-1',
          status: RepairTicketStatus.DIAGNOSING,
          notes: 'Thermal camera check completed',
        },
      });

      expect(notificationsService.createAndSend).toHaveBeenCalledWith({
        userId: 'cust-1',
        type: NotificationType.REPAIR_STATUS_UPDATED,
        title: 'Diagnostic Notes Updated',
        body: 'Technician updated notes on ticket TK-1001.',
        data: {
          ticketId: 'ticket-1',
          ticketNumber: 'TK-1001',
          repairRequestId: 'req-1',
          status: RepairTicketStatus.DIAGNOSING,
        },
      });

      expect(result).toBeDefined();
    });

    it('should update repairNotes and catch notification errors gracefully', async () => {
      prisma.repairTicket.findUnique.mockResolvedValue({
        id: 'ticket-1',
        technicianId: mockTechnicianId,
        status: RepairTicketStatus.IN_REPAIR,
      });

      prisma.repairTicket.update.mockResolvedValue({
        id: 'ticket-1',
        ticketNumber: 'TK-1001',
        requestId: 'req-1',
        technicianId: mockTechnicianId,
        status: RepairTicketStatus.IN_REPAIR,
        repairNotes: 'Replaced thermal pad',
        request: {
          device: {
            customerId: 'cust-1',
          },
        },
      });

      notificationsService.createAndSend.mockRejectedValue(new Error('Gateway down'));

      const result = await service.updateTicketNotes('ticket-1', mockTechnicianId, {
        repairNotes: 'Replaced thermal pad',
      });

      expect(prisma.repairTicket.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ticket-1' },
          data: { repairNotes: 'Replaced thermal pad' },
        }),
      );
      expect(result).toBeDefined();
    });
  });
});
