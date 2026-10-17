import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../prisma/generated/client.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import {
  CustomerListQueryDto,
  type CustomerListResponse,
} from '../../dto/customer-list-query.dto.js';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllCustomers(
    query: CustomerListQueryDto,
  ): Promise<CustomerListResponse> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 10;
      const skip = (page - 1) * limit;

      const where: Prisma.CustomerWhereInput = {};
      if (query.search) {
        const search = query.search.trim();
        where.OR = [
          { user: { name: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { user: { phone: { contains: search, mode: 'insensitive' } } },
          { notes: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [customers, total] = await Promise.all([
        this.prisma.customer.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            _count: {
              select: {
                devices: true,
              },
            },
          },
        }),
        this.prisma.customer.count({ where }),
      ]);

      const items = customers.map((c) => ({
        userId: c.userId,
        name: c.user?.name ?? '',
        email: c.user?.email ?? '',
        phone: c.user?.phone ?? null,
        notes: c.notes,
        devicesCount: c._count?.devices ?? 0,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }));

      return {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching customers.',
      );
    }
  }

  async getCustomerById(id: string) {
    try {
      const customer = await this.prisma.customer.findUnique({
        where: { userId: id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          devices: {
            orderBy: { createdAt: 'desc' },
            include: {
              repairRequests: {
                orderBy: { createdAt: 'desc' },
                include: {
                  repairTicket: {
                    include: {
                      technician: {
                        include: {
                          user: {
                            select: {
                              id: true,
                              name: true,
                              email: true,
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

      if (!customer) {
        throw new NotFoundException(`Customer with ID ${id} not found.`);
      }

      let totalRequests = 0;
      let totalTickets = 0;
      let activeTickets = 0;
      let completedTickets = 0;

      const activeStatuses = new Set([
        'ACCEPTED',
        'DIAGNOSING',
        'IN_REPAIR',
        'READY_FOR_PICKUP',
      ]);

      for (const device of customer.devices) {
        totalRequests += device.repairRequests.length;
        for (const req of device.repairRequests) {
          if (req.repairTicket) {
            totalTickets++;
            if (activeStatuses.has(req.repairTicket.status)) {
              activeTickets++;
            } else if (req.repairTicket.status === 'COMPLETED') {
              completedTickets++;
            }
          }
        }
      }

      return {
        userId: customer.userId,
        name: customer.user?.name ?? '',
        email: customer.user?.email ?? '',
        phone: customer.user?.phone ?? null,
        notes: customer.notes,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
        stats: {
          totalDevices: customer.devices.length,
          totalRequests,
          totalTickets,
          activeTickets,
          completedTickets,
        },
        devices: customer.devices.map((device) => ({
          id: device.id,
          deviceType: device.deviceType,
          brand: device.brand,
          model: device.model,
          serialNumber: device.serialNumber,
          createdAt: device.createdAt,
          updatedAt: device.updatedAt,
          repairRequests: device.repairRequests.map((req) => ({
            id: req.id,
            problem: req.problem,
            description: req.description,
            status: req.status,
            createdAt: req.createdAt,
            updatedAt: req.updatedAt,
            ticket: req.repairTicket
              ? {
                  id: req.repairTicket.id,
                  ticketNumber: req.repairTicket.ticketNumber,
                  priority: req.repairTicket.priority,
                  status: req.repairTicket.status,
                  diagnosis: req.repairTicket.diagnosis,
                  repairNotes: req.repairTicket.repairNotes,
                  technician: req.repairTicket.technician
                    ? {
                        id: req.repairTicket.technician.id,
                        name:
                          req.repairTicket.technician.user?.name ?? 'Unknown',
                        email: req.repairTicket.technician.user?.email ?? '',
                      }
                    : null,
                  createdAt: req.repairTicket.createdAt,
                  completedAt: req.repairTicket.completedAt,
                }
              : null,
          })),
        })),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching the customer.',
      );
    }
  }
}
