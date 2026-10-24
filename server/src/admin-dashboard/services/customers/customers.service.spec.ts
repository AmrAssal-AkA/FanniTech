import { Test, TestingModule } from '@nestjs/testing';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CustomersService } from './customers.service.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import type { CustomerListQueryDto } from '../../dto/customer-list-query.dto.js';

describe('CustomersService', () => {
  let service: CustomersService;

  const mockPrismaService = {
    customer: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllCustomers', () => {
    const rawDbCustomers = [
      {
        userId: 'cust-1',
        notes: 'VIP customer',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        user: {
          id: 'cust-1',
          name: 'Ahmed Ali',
          email: 'ahmed@example.com',
          phone: '+201011111111',
        },
        _count: {
          devices: 2,
        },
      },
      {
        userId: 'cust-2',
        notes: null,
        createdAt: new Date('2026-01-02T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
        user: {
          id: 'cust-2',
          name: 'Sara Omar',
          email: 'sara@example.com',
          phone: null,
        },
        _count: {
          devices: 0,
        },
      },
    ];

    it('should return mapped customers with default pagination when page and limit are not provided', async () => {
      mockPrismaService.customer.findMany.mockResolvedValue(rawDbCustomers);
      mockPrismaService.customer.count.mockResolvedValue(2);

      const query: CustomerListQueryDto = {} as CustomerListQueryDto;
      const result = await service.getAllCustomers(query);

      expect(mockPrismaService.customer.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
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
      });
      expect(mockPrismaService.customer.count).toHaveBeenCalledWith({ where: {} });
      expect(result).toEqual({
        items: [
          {
            userId: 'cust-1',
            name: 'Ahmed Ali',
            email: 'ahmed@example.com',
            phone: '+201011111111',
            notes: 'VIP customer',
            devicesCount: 2,
            createdAt: rawDbCustomers[0].createdAt,
            updatedAt: rawDbCustomers[0].updatedAt,
          },
          {
            userId: 'cust-2',
            name: 'Sara Omar',
            email: 'sara@example.com',
            phone: null,
            notes: null,
            devicesCount: 0,
            createdAt: rawDbCustomers[1].createdAt,
            updatedAt: rawDbCustomers[1].updatedAt,
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      });
    });

    it('should apply search filter across name, email, phone, and notes', async () => {
      mockPrismaService.customer.findMany.mockResolvedValue([rawDbCustomers[0]]);
      mockPrismaService.customer.count.mockResolvedValue(1);

      const query: CustomerListQueryDto = { page: 1, limit: 10, search: 'ahmed' };
      const result = await service.getAllCustomers(query);

      const expectedWhere = {
        OR: [
          { user: { name: { contains: 'ahmed', mode: 'insensitive' } } },
          { user: { email: { contains: 'ahmed', mode: 'insensitive' } } },
          { user: { phone: { contains: 'ahmed', mode: 'insensitive' } } },
          { notes: { contains: 'ahmed', mode: 'insensitive' } },
        ],
      };

      expect(mockPrismaService.customer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expectedWhere }),
      );
      expect(mockPrismaService.customer.count).toHaveBeenCalledWith({ where: expectedWhere });
      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('Ahmed Ali');
    });

    it('should calculate skip and totalPages correctly with custom page and limit', async () => {
      mockPrismaService.customer.findMany.mockResolvedValue([rawDbCustomers[0]]);
      mockPrismaService.customer.count.mockResolvedValue(15);

      const query: CustomerListQueryDto = { page: 2, limit: 5 };
      const result = await service.getAllCustomers(query);

      expect(mockPrismaService.customer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5 }),
      );
      expect(result.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 15,
        totalPages: 3,
      });
    });

    it('should throw InternalServerErrorException with error message when prisma findMany throws an Error', async () => {
      mockPrismaService.customer.findMany.mockRejectedValue(new Error('Database query failed'));
      mockPrismaService.customer.count.mockResolvedValue(10);

      const query: CustomerListQueryDto = { page: 1, limit: 10 };

      await expect(service.getAllCustomers(query)).rejects.toThrow(InternalServerErrorException);
      await expect(service.getAllCustomers(query)).rejects.toThrow('Database query failed');
    });
  });

  describe('getCustomerById', () => {
    const rawCustomerDetail = {
      userId: '00000000-0000-0000-0000-000000000001',
      notes: 'Special handling',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      user: {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Mahmoud Hassan',
        email: 'mahmoud@example.com',
        phone: '+201022222222',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      },
      devices: [
        {
          id: 'dev-1',
          deviceType: 'Laptop',
          brand: 'Dell',
          model: 'XPS 15',
          serialNumber: 'SN-12345',
          createdAt: new Date('2026-01-03T00:00:00.000Z'),
          updatedAt: new Date('2026-01-03T00:00:00.000Z'),
          repairRequests: [
            {
              id: 'req-1',
              problem: 'Overheating',
              description: 'Fan makes noise',
              status: 'ACCEPTED',
              createdAt: new Date('2026-01-04T00:00:00.000Z'),
              updatedAt: new Date('2026-01-04T00:00:00.000Z'),
              repairTicket: {
                id: 'tick-1',
                ticketNumber: 'TK-2026-0001',
                priority: 'HIGH',
                status: 'IN_REPAIR',
                diagnosis: 'Thermal paste dried out',
                repairNotes: 'Cleaning heatsink',
                createdAt: new Date('2026-01-04T01:00:00.000Z'),
                completedAt: null,
                technician: {
                  id: 'tech-1',
                  user: {
                    name: 'Alex Tech',
                    email: 'alex@fannitech.com',
                  },
                },
              },
            },
          ],
        },
      ],
    };

    it('should return customer details with calculated stats and nested devices/tickets', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(rawCustomerDetail);

      const result = await service.getCustomerById('00000000-0000-0000-0000-000000000001');

      expect(mockPrismaService.customer.findUnique).toHaveBeenCalledWith({
        where: { userId: '00000000-0000-0000-0000-000000000001' },
        include: expect.any(Object),
      });

      expect(result.userId).toBe('00000000-0000-0000-0000-000000000001');
      expect(result.name).toBe('Mahmoud Hassan');
      expect(result.email).toBe('mahmoud@example.com');
      expect(result.phone).toBe('+201022222222');
      expect(result.stats).toEqual({
        totalDevices: 1,
        totalRequests: 1,
        totalTickets: 1,
        activeTickets: 1,
        completedTickets: 0,
      });
      expect(result.devices[0].repairRequests[0].ticket?.ticketNumber).toBe('TK-2026-0001');
      expect(result.devices[0].repairRequests[0].ticket?.technician?.name).toBe('Alex Tech');
    });

    it('should throw NotFoundException when customer does not exist', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(null);

      await expect(
        service.getCustomerById('00000000-0000-0000-0000-000000000099'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException when findUnique throws a database error', async () => {
      mockPrismaService.customer.findUnique.mockRejectedValue(new Error('Connection dropped'));

      await expect(
        service.getCustomerById('00000000-0000-0000-0000-000000000001'),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should count completed tickets in stats', async () => {
      const customerWithCompletedTicket = {
        ...rawCustomerDetail,
        devices: [
          {
            ...rawCustomerDetail.devices[0],
            repairRequests: [
              {
                ...rawCustomerDetail.devices[0].repairRequests[0],
                repairTicket: {
                  ...rawCustomerDetail.devices[0].repairRequests[0].repairTicket,
                  status: 'COMPLETED',
                },
              },
            ],
          },
        ],
      };
      mockPrismaService.customer.findUnique.mockResolvedValue(customerWithCompletedTicket);

      const result = await service.getCustomerById('00000000-0000-0000-0000-000000000001');
      expect(result.stats.completedTickets).toBe(1);
    });

    it('should handle non-Error throw in getCustomerById', async () => {
      mockPrismaService.customer.findUnique.mockRejectedValue('String DB crash');

      await expect(
        service.getCustomerById('00000000-0000-0000-0000-000000000001'),
      ).rejects.toThrow('An unexpected error occurred while fetching the customer.');
    });

    it('should rethrow HttpException in getAllCustomers and handle non-Error throw', async () => {
      mockPrismaService.customer.findMany.mockRejectedValue('string error');

      await expect(
        service.getAllCustomers({} as CustomerListQueryDto),
      ).rejects.toThrow('An unexpected error occurred while fetching customers.');
    });
  });
});

