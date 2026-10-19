import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import {
  NotificationType,
  RepairTicketPriority,
  RepairTicketStatus,
} from '../prisma/generated/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import type { UpdateTechnicianNotesDtoType } from './dto/technician-dashboard.dto.js';

@Injectable()
export class TechnicianDashboardService {
  private readonly logger = new Logger(TechnicianDashboardService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly notificationsService?: NotificationsService,
  ) {}

  private readonly ticketInclude = {
    request: {
      include: {
        images: true,
        device: {
          include: {
            customer: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, phone: true },
                },
              },
            },
          },
        },
      },
    },
    technician: {
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    },
    statusHistory: { orderBy: { changedAt: 'asc' as const } },
  } as const;

  async workBench(technicianId: string) {
    const technician = await this.prisma.technician.findUnique({
      where: { id: technicianId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!technician) {
      throw new ForbiddenException('Technician profile not found.');
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [activeTickets, completedTodayCount, recentHistory] =
      await Promise.all([
        this.prisma.repairTicket.findMany({
          where: {
            technicianId,
            status: {
              in: [
                RepairTicketStatus.ACCEPTED,
                RepairTicketStatus.DIAGNOSING,
                RepairTicketStatus.IN_REPAIR,
                RepairTicketStatus.READY_FOR_PICKUP,
              ],
            },
          },
          orderBy: [{ priority: 'desc' }, { updatedAt: 'desc' }],
          include: this.ticketInclude,
        }),
        this.prisma.repairTicket.count({
          where: {
            technicianId,
            status: RepairTicketStatus.COMPLETED,
            completedAt: { gte: startOfDay },
          },
        }),
        this.prisma.repairStatusHistory.findMany({
          where: {
            ticket: { technicianId },
          },
          orderBy: { changedAt: 'desc' },
          take: 10,
          include: {
            ticket: {
              select: {
                id: true,
                ticketNumber: true,
              },
            },
          },
        }),
      ]);

    const metrics = {
      activeQueueCount: activeTickets.length,
      criticalUrgentCount: activeTickets.filter(
        (t) => t.priority === RepairTicketPriority.HIGH,
      ).length,
      underDiagnosisCount: activeTickets.filter(
        (t) => t.status === RepairTicketStatus.DIAGNOSING,
      ).length,
      inRepairCount: activeTickets.filter(
        (t) => t.status === RepairTicketStatus.IN_REPAIR,
      ).length,
      readyForQACount: activeTickets.filter(
        (t) => t.status === RepairTicketStatus.READY_FOR_PICKUP,
      ).length,
      completedTodayCount,
    };

    const activeTicket =
      activeTickets.find((t) => t.status === RepairTicketStatus.IN_REPAIR) ||
      activeTickets.find((t) => t.status === RepairTicketStatus.DIAGNOSING) ||
      activeTickets[0] ||
      null;

    return {
      technician: {
        id: technician.id,
        employeeId: technician.employeeId,
        name: technician.user.name,
        email: technician.user.email,
        phone: technician.user.phone,
        createdAt: technician.createdAt,
        updatedAt: technician.updatedAt,
      },
      metrics,
      activeTicket,
      assignedTickets: activeTickets,
      recentActivities: recentHistory,
    };
  }

  async updateTicketNotes(
    ticketId: string,
    technicianId: string,
    dto: UpdateTechnicianNotesDtoType,
  ) {
    const ticket = await this.prisma.repairTicket.findUnique({
      where: { id: ticketId },
      include: this.ticketInclude,
    });

    if (!ticket) {
      throw new NotFoundException('Repair ticket not found.');
    }

    if (ticket.technicianId !== technicianId) {
      throw new ForbiddenException('This ticket is not assigned to you.');
    }

    const dataToUpdate: Record<string, unknown> = {};
    if (dto.diagnosis !== undefined) {
      dataToUpdate.diagnosis = dto.diagnosis;
    }
    if (dto.repairNotes !== undefined) {
      dataToUpdate.repairNotes = dto.repairNotes;
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const db = tx as unknown as PrismaService;

      const updatedTicket = await db.repairTicket.update({
        where: { id: ticketId },
        data: dataToUpdate,
        include: this.ticketInclude,
      });

      if (dto.notes) {
        await db.repairStatusHistory.create({
          data: {
            ticketId,
            status: ticket.status,
            notes: dto.notes,
          },
        });
      }

      return updatedTicket;
    });

    if (this.notificationsService && updated.request?.device?.customerId) {
      const customerId = updated.request.device.customerId;
      const isDiagnosisUpdate = dto.diagnosis !== undefined;
      const title = isDiagnosisUpdate
        ? 'Diagnostic Notes Updated'
        : 'Repair Notes Updated';
      const body = `Technician updated notes on ticket ${updated.ticketNumber}.`;

      void this.notificationsService
        .createAndSend({
          userId: customerId,
          type: NotificationType.REPAIR_STATUS_UPDATED,
          title,
          body,
          data: {
            ticketId: updated.id,
            ticketNumber: updated.ticketNumber,
            repairRequestId: updated.requestId,
            status: updated.status,
          },
        })
        .catch((err) => {
          this.logger.warn(`Failed to send real-time notification: ${err}`);
        });
    }

    return updated;
  }
}
