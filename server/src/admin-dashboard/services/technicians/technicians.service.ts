import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ZodError } from 'zod';
import { Prisma } from '../../../prisma/generated/client.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { hashPassword } from '../../../utils/password-hash.js';
import {
  createTechnicianAccountSchema,
  type CreateTechnicianAccountDto,
} from '../../dto/create-Technician-account.dto.js';
import {
  TechnicianListQueryDto,
  TechnicianListQuerySchema,
  type TechnicianListResponse,
} from '../../dto/technician-list-query.dto.js';
import {
  UpdateTechnicianDto,
  updateTechnicianSchema,
} from '../../dto/update-technician.dto.js';

const ACTIVE_TICKET_STATUSES = [
  'ACCEPTED',
  'DIAGNOSING',
  'IN_REPAIR',
  'READY_FOR_PICKUP',
] as const;

@Injectable()
export class TechniciansService {
  constructor(private readonly prisma: PrismaService) {}

  async createTechnicianAccount(data: CreateTechnicianAccountDto) {
    try {
      const { name, email, password, phone, role } =
        createTechnicianAccountSchema.parse(data);

      if (!name || !email || !password) {
        throw new HttpException('Name, email, and password are required', 400);
      }
      if (role !== 'TECHNICIAN') {
        throw new ForbiddenException('Invalid role. Only technicians can be created');
      }
      if (phone && !/^\+?\d{8,15}$/.test(phone)) {
        throw new HttpException('Invalid phone number', 400);
      }

      const existingTechnician = await this.prisma.user.findUnique({
        where: { email, role: 'TECHNICIAN' },
      });
      if (existingTechnician) {
        throw new ConflictException('Technician with this email already exists');
      }

      const hashedPassword = await hashPassword(password);
      const addTechnician = await this.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
          role,
          EmailVerifyAt: new Date(),
          technician: { create: {} },
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          technician: true,
        },
      });

      return addTechnician;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating the technician account',
      );
    }
  }

  async getAllTechnicians() {
    try {
      const getTechnicians = await this.prisma.technician.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
            },
          },
          repairTickets: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      });
      if (getTechnicians.length === 0) {
        throw new NotFoundException('No technicians found');
      }
      return getTechnicians;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while retrieving technicians',
      );
    }
  }

  async listTechnicians(query: TechnicianListQueryDto): Promise<TechnicianListResponse> {
    try {
      const parsed = TechnicianListQuerySchema.parse(query || {});
      const page = parsed.page || 1;
      const limit = parsed.limit || 10;
      const skip = (page - 1) * limit;

      const where: Prisma.TechnicianWhereInput = {};
      if (parsed.search) {
        const search = parsed.search.trim();
        where.OR = [
          { employeeId: { contains: search, mode: 'insensitive' } },
          { user: { name: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { user: { phone: { contains: search, mode: 'insensitive' } } },
        ];
      }

      const [data, total] = await Promise.all([
        this.prisma.technician.findMany({
          where,
          skip,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
              },
            },
            repairTickets: {
              select: {
                id: true,
                status: true,
              },
            },
          },
        }),
        this.prisma.technician.count({ where }),
      ]);

      return {
        data,
        total,
        page,
        limit,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error instanceof ZodError) {
        throw new BadRequestException(error.issues);
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while listing technicians',
      );
    }
  }

  async getTechnicianById(id: string) {
    try {
      const technician = await this.prisma.technician.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          repairTickets: {
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              ticketNumber: true,
              priority: true,
              status: true,
              diagnosis: true,
              repairNotes: true,
              createdAt: true,
              completedAt: true,
              request: {
                select: {
                  id: true,
                  problem: true,
                  description: true,
                  device: {
                    select: {
                      id: true,
                      deviceType: true,
                      brand: true,
                      model: true,
                      serialNumber: true,
                      customer: {
                        select: {
                          userId: true,
                          user: {
                            select: {
                              id: true,
                              name: true,
                              email: true,
                              phone: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!technician) {
        throw new NotFoundException('Technician not found');
      }

      const activeTickets = technician.repairTickets.filter((ticket) =>
        ACTIVE_TICKET_STATUSES.includes(ticket.status as (typeof ACTIVE_TICKET_STATUSES)[number]),
      );
      const completedTickets = technician.repairTickets.filter(
        (ticket) => ticket.status === 'COMPLETED',
      );

      return {
        ...technician,
        stats: {
          totalTickets: technician.repairTickets.length,
          activeTicketsCount: activeTickets.length,
          completedTicketsCount: completedTickets.length,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while retrieving the technician',
      );
    }
  }

  async updateTechnician(id: string, data: UpdateTechnicianDto) {
    try {
      const validated = updateTechnicianSchema.parse(data);

      const technician = await this.prisma.technician.findUnique({
        where: { id },
        include: { user: true },
      });
      if (!technician) {
        throw new NotFoundException('Technician not found');
      }

      if (validated.email && validated.email !== technician.user.email) {
        const existing = await this.prisma.user.findUnique({
          where: { email: validated.email },
        });
        if (existing && existing.id !== id) {
          throw new ConflictException('Email already in use by another account');
        }
      }

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          ...(validated.name !== undefined ? { name: validated.name } : {}),
          ...(validated.email !== undefined ? { email: validated.email } : {}),
          ...(validated.phone !== undefined ? { phone: validated.phone } : {}),
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          technician: true,
        },
      });

      return updatedUser;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error instanceof ZodError) {
        throw new BadRequestException(error.issues);
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while updating the technician',
      );
    }
  }

  async resetTechnicianPassword(id: string, newPassword: string) {
    try {
      const technician = await this.prisma.technician.findUnique({ where: { id } });
      if (!technician) {
        throw new NotFoundException('Technician not found');
      }

      const hashedPassword = await hashPassword(newPassword);

      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id },
          data: { password: hashedPassword },
        }),
        this.prisma.refreshToken.updateMany({
          where: { userId: id },
          data: { revoke: true },
        }),
      ]);

      return { message: 'Technician password reset successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while resetting the technician password',
      );
    }
  }

  async deleteTechnician(id: string) {
    try {
      const technician = await this.prisma.technician.findUnique({
        where: { id },
        include: {
          repairTickets: {
            select: { id: true, status: true },
          },
        },
      });

      if (!technician) {
        throw new NotFoundException('Technician not found');
      }

      const activeTickets = technician.repairTickets.filter((ticket) =>
        ACTIVE_TICKET_STATUSES.includes(ticket.status as (typeof ACTIVE_TICKET_STATUSES)[number]),
      );

      if (activeTickets.length > 0) {
        throw new BadRequestException(
          `Cannot delete technician with ${activeTickets.length} active repair ticket(s). Please reassign or unassign their tickets first.`,
        );
      }

      await this.prisma.user.delete({
        where: { id },
      });

      return { message: 'Technician deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while deleting the technician',
      );
    }
  }

  async transferTickets(fromTechnicianId: string, toTechnicianId: string) {
    try {
      if (fromTechnicianId === toTechnicianId) {
        throw new BadRequestException('Source and target technicians cannot be the same');
      }

      const [fromTech, toTech] = await Promise.all([
        this.prisma.technician.findUnique({
          where: { id: fromTechnicianId },
          include: { user: { select: { name: true } } },
        }),
        this.prisma.technician.findUnique({
          where: { id: toTechnicianId },
          include: { user: { select: { name: true } } },
        }),
      ]);

      if (!fromTech) {
        throw new NotFoundException('Source technician not found');
      }
      if (!toTech) {
        throw new NotFoundException('Target technician not found');
      }

      const activeTickets = await this.prisma.repairTicket.findMany({
        where: {
          technicianId: fromTechnicianId,
          status: { in: [...ACTIVE_TICKET_STATUSES] },
        },
        select: { id: true, status: true },
      });

      if (activeTickets.length === 0) {
        return {
          transferredCount: 0,
          message: 'No active tickets to transfer',
        };
      }

      await this.prisma.$transaction(async (tx) => {
        await tx.repairTicket.updateMany({
          where: {
            technicianId: fromTechnicianId,
            status: { in: [...ACTIVE_TICKET_STATUSES] },
          },
          data: { technicianId: toTechnicianId },
        });

        for (const ticket of activeTickets) {
          await tx.repairStatusHistory.create({
            data: {
              ticketId: ticket.id,
              status: ticket.status,
              notes: `Ticket transferred from technician ${fromTech.user.name} to ${toTech.user.name} by Admin`,
            },
          });
        }
      });

      return {
        transferredCount: activeTickets.length,
        message: `Successfully transferred ${activeTickets.length} ticket(s) to ${toTech.user.name}`,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while transferring tickets',
      );
    }
  }
}
