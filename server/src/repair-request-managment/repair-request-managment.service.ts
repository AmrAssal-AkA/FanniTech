import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  NotificationType,
  RepairRequestStatus,
  RepairTicketPriority,
  RepairTicketStatus,
} from '../prisma/generated/client.js';
import type {
  AcceptRepairRequestDtoType,
  AssignTechnicianDtoType,
  ListRepairRequestsQueryDtoType,
  ListTicketsQueryDtoType,
  MarkReadyForPickupDtoType,
  MarkUnrepairableDtoType,
  RejectRepairRequestDtoType,
  StartDiagnosisDtoType,
  StartRepairDtoType,
  UpdateTicketStatusDtoType,
} from './dto/repair-request-management.dto.js';

type Actor = { sub: string; role: string };

@Injectable()
export class RepairRequestManagmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async listRequests(query: ListRepairRequestsQueryDtoType) {
    const { page = 1, limit = 10, status } = query;
    const where = status ? { status } : {};
    const [total, items] = await Promise.all([
      this.prisma.repairRequest.count({ where }),
      this.prisma.repairRequest.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: this.requestInclude,
      }),
    ]);
    return { items, pagination: this.pagination(page, limit, total) };
  }

  async getRequestById(id: string) {
    const request = await this.prisma.repairRequest.findUnique({
      where: { id },
      include: this.requestInclude,
    });
    if (!request) throw new NotFoundException('Repair request not found');
    return request;
  }


  async acceptRequest(id: string, dto: AcceptRepairRequestDtoType) {
    const request = await this.getRequestById(id);
    this.assertRequestStatus(request.status, RepairRequestStatus.PENDING);
    if (dto.technicianId) await this.getTechnician(dto.technicianId);
    const result = await this.prisma.$transaction(async (tx) => {
      const db = tx as unknown as PrismaService;
      const updatedRequest = await db.repairRequest.update({
        where: { id },
        data: { status: RepairRequestStatus.ACCEPTED },
      });
      const ticket = await db.repairTicket.create({
        data: {
          requestId: id,
          technicianId: dto.technicianId,
          priority: dto.priority ?? RepairTicketPriority.MEDIUM,
          statusHistory: { create: { status: RepairTicketStatus.ACCEPTED } },
        },
        include: this.ticketInclude,
      });
      return { request: updatedRequest, ticket };
    });
    await this.notifyCustomer(result.ticket.request.device.customerId, {
      type: NotificationType.REPAIR_REQUEST_ACCEPTED,
      title: 'Repair Request Accepted',
      body: `Your repair request was accepted. Ticket ${result.ticket.ticketNumber} was created.`,
      data: { repairRequestId: id, ticketId: result.ticket.id },
    });
    if (dto.technicianId) await this.notifyTechnicianAssigned(result.ticket);
    return result;
  }

  async rejectRequest(id: string, dto: RejectRepairRequestDtoType) {
    const request = await this.getRequestById(id);
    this.assertRequestStatus(request.status, RepairRequestStatus.PENDING);
    const updated = await this.prisma.repairRequest.update({
      where: { id },
      data: { status: RepairRequestStatus.REJECTED },
      include: this.requestInclude,
    });
    await this.notifyCustomer(updated.device.customerId, {
      type: NotificationType.REPAIR_REQUEST_REJECTED,
      title: 'Repair Request Rejected',
      body: dto.reason,
      data: { repairRequestId: id, reason: dto.reason },
    });
    return updated;
  }

  async listTickets(query: ListTicketsQueryDtoType, user: Actor) {
    const { page = 1, limit = 10, status, priority, technicianId } = query;
    const assignedFilter =
      user.role.toUpperCase() === 'TECHNICIAN' &&
      (query.assignedToMe !== false || !technicianId);
    const where = {
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
      ...(assignedFilter
        ? { technicianId: user.sub }
        : technicianId
          ? { technicianId }
          : {}),
    };
    const [total, items] = await Promise.all([
      this.prisma.repairTicket.count({ where }),
      this.prisma.repairTicket.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: this.ticketInclude,
      }),
    ]);
    return { items, pagination: this.pagination(page, limit, total) };
  }

  async getTicketById(ticketId: string, user?: Actor) {
    const ticket = await this.findTicket(ticketId);
    this.assertTicketAccess(ticket, user);
    return ticket;
  }

  async getTicketHistory(ticketId: string, user?: Actor) {
    const ticket = await this.findTicket(ticketId);
    this.assertTicketAccess(ticket, user);
    return this.prisma.repairStatusHistory.findMany({
      where: { ticketId },
      orderBy: { changedAt: 'asc' },
    });
  }

  async assignTechnician(ticketId: string, dto: AssignTechnicianDtoType) {
    await this.findTicket(ticketId);
    await this.getTechnician(dto.technicianId);
    const updated = await this.prisma.repairTicket.update({
      where: { id: ticketId },
      data: { technicianId: dto.technicianId },
      include: this.ticketInclude,
    });
    await this.notifyTechnicianAssigned(updated);
    return updated;
  }

  async unassignTechnician(ticketId: string, notes?: string) {
    const ticket = await this.findTicket(ticketId);
    if (!ticket.technicianId) {
      throw new BadRequestException('Ticket is not assigned to any technician');
    }
    const previousTechnician = ticket.technician;
    const updated = await this.prisma.repairTicket.update({
      where: { id: ticketId },
      data: { technicianId: null },
      include: this.ticketInclude,
    });
    await this.prisma.repairStatusHistory.create({
      data: {
        ticketId,
        status: ticket.status,
        notes: notes ?? `Technician ${previousTechnician?.user?.name ?? ''} unassigned by Admin`,
      },
    });
    return updated;
  }

  async startDiagnosis(
    ticketId: string,
    user: Actor,
    dto: StartDiagnosisDtoType,
  ) {
    const ticket = await this.findTicket(ticketId);
    this.assertTicketAccess(ticket, user, true);
    this.assertTicketStatus(ticket.status, RepairTicketStatus.ACCEPTED);
    return this.prisma.$transaction(async (tx) => {
      const db = tx as unknown as PrismaService;
      const updated = await db.repairTicket.update({
        where: { id: ticketId },
        data: {
          status: RepairTicketStatus.DIAGNOSING,
          ...(user.role.toUpperCase() === 'TECHNICIAN' && !ticket.technicianId
            ? { technicianId: user.sub }
            : {}),
        },
        include: this.ticketInclude,
      });
      await db.repairStatusHistory.create({
        data: {
          ticketId,
          status: RepairTicketStatus.DIAGNOSING,
          notes: dto.notes,
        },
      });
      return updated;
    });
  }

  async startRepair(ticketId: string, user: Actor, dto: StartRepairDtoType) {
    const ticket = await this.findTicket(ticketId);
    this.assertTicketAccess(ticket, user);
    this.assertTicketStatus(ticket.status, RepairTicketStatus.DIAGNOSING);
    const updated = await this.transition(
      ticketId,
      RepairTicketStatus.IN_REPAIR,
      { diagnosis: dto.diagnosis },
      dto.notes,
    );
    await this.notifyStatus(
      updated,
      'Repair In Progress',
      'Your repair is now in progress.',
      NotificationType.REPAIR_STATUS_UPDATED,
    );
    return updated;
  }

  async markReadyForPickup(
    ticketId: string,
    user: Actor,
    dto: MarkReadyForPickupDtoType,
  ) {
    const ticket = await this.findTicket(ticketId);
    this.assertTicketAccess(ticket, user);
    this.assertTicketStatus(ticket.status, RepairTicketStatus.IN_REPAIR);
    const updated = await this.transition(
      ticketId,
      RepairTicketStatus.READY_FOR_PICKUP,
      { repairNotes: dto.repairNotes },
      dto.notes,
    );
    await this.notifyStatus(
      updated,
      'Repair Ready for Pickup',
      'Your repaired device is ready for pickup.',
      NotificationType.REPAIR_READY_FOR_PICKUP,
    );
    return updated;
  }

  async completeTicket(
    ticketId: string,
    user: Actor,
    dto: UpdateTicketStatusDtoType,
  ) {
    const ticket = await this.findTicket(ticketId);
    this.assertTicketAccess(ticket, user);
    this.assertTicketStatus(ticket.status, RepairTicketStatus.READY_FOR_PICKUP);
    const updated = await this.transition(
      ticketId,
      RepairTicketStatus.COMPLETED,
      { completedAt: new Date() },
      dto.notes,
    );
    await this.notifyStatus(
      updated,
      'Repair Completed',
      'Your repair has been completed.',
      NotificationType.REPAIR_COMPLETED,
    );
    return updated;
  }

  async markUnrepairable(
    ticketId: string,
    user: Actor,
    dto: MarkUnrepairableDtoType,
  ) {
    const ticket = await this.findTicket(ticketId);
    this.assertTicketAccess(ticket, user);
    const activeStatuses: RepairTicketStatus[] = [
      RepairTicketStatus.ACCEPTED,
      RepairTicketStatus.DIAGNOSING,
      RepairTicketStatus.IN_REPAIR,
    ];
    if (!activeStatuses.includes(ticket.status))
      throw new ConflictException('Ticket is not active');
    const updated = await this.transition(
      ticketId,
      RepairTicketStatus.UNREPAIRABLE,
      { repairNotes: dto.reason },
      dto.notes,
    );
    await this.notifyStatus(
      updated,
      'Repair Cannot Be Completed',
      dto.reason,
      NotificationType.REPAIR_STATUS_UPDATED,
    );
    return updated;
  }

  async cancelTicket(ticketId: string, dto: UpdateTicketStatusDtoType) {
    const ticket = await this.findTicket(ticketId);
    const closedStatuses: RepairTicketStatus[] = [
      RepairTicketStatus.COMPLETED,
      RepairTicketStatus.UNREPAIRABLE,
      RepairTicketStatus.CANCELLED,
    ];
    if (closedStatuses.includes(ticket.status))
      throw new ConflictException('Ticket is already closed');
    return this.transition(
      ticketId,
      RepairTicketStatus.CANCELLED,
      { completedAt: new Date() },
      dto.notes,
    );
  }

  private async transition(
    ticketId: string,
    status: RepairTicketStatus,
    data: Record<string, unknown>,
    notes?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const db = tx as unknown as PrismaService;
      const updated = await db.repairTicket.update({
        where: { id: ticketId },
        data: { status, ...data },
        include: this.ticketInclude,
      });
      await db.repairStatusHistory.create({
        data: { ticketId, status, notes },
      });
      return updated;
    });
  }
  private async findTicket(id: string) {
    const ticket = await this.prisma.repairTicket.findUnique({
      where: { id },
      include: this.ticketInclude,
    });
    if (!ticket) throw new NotFoundException('Repair ticket not found');
    return ticket;
  }
  private async getTechnician(id: string) {
    const technician = await this.prisma.technician.findUnique({
      where: { id },
    });
    if (!technician) throw new NotFoundException('Technician not found');
    return technician;
  }
  private assertTicketAccess(
    ticket: { technicianId: string | null },
    user?: Actor,
    allowUnassigned = false,
  ) {
    if (
      user?.role.toUpperCase() === 'TECHNICIAN' &&
      ticket.technicianId !== user.sub &&
      !(allowUnassigned && !ticket.technicianId)
    )
      throw new ForbiddenException('This ticket is not assigned to you');
  }
  private assertRequestStatus(
    actual: RepairRequestStatus,
    expected: RepairRequestStatus,
  ) {
    if (actual !== expected)
      throw new ConflictException(`Request must be ${expected}`);
  }
  private assertTicketStatus(
    actual: RepairTicketStatus,
    expected: RepairTicketStatus,
  ) {
    if (actual !== expected)
      throw new ConflictException(`Ticket must be ${expected}`);
  }
  private pagination(page: number, limit: number, total: number) {
    return { page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
  }
  private async notifyCustomer(
    userId: string,
    payload: {
      type: NotificationType;
      title: string;
      body: string;
      data: Record<string, unknown>;
    },
  ) {
    await this.notificationsService.createAndSend({ userId, ...payload });
  }
  private async notifyTechnicianAssigned(ticket: {
    technicianId: string | null;
    id: string;
    ticketNumber: string;
    request: { device: { customerId: string } };
  }) {
    if (!ticket.technicianId) return;
    await this.notifyCustomer(ticket.request.device.customerId, {
      type: NotificationType.TECHNICIAN_ASSIGNED,
      title: 'Technician Assigned',
      body: `A technician has been assigned to ticket ${ticket.ticketNumber}.`,
      data: { ticketId: ticket.id, technicianId: ticket.technicianId },
    });
  }
  private async notifyStatus(
    ticket: { request: { device: { customerId: string } }; id: string },
    title: string,
    body: string,
    type: NotificationType,
  ) {
    await this.notifyCustomer(ticket.request.device.customerId, {
      type,
      title,
      body,
      data: { ticketId: ticket.id },
    });
  }
  private readonly requestInclude = {
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
    repairTicket: true,
  } as const;
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
}
