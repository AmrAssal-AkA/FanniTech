import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TechniciansService } from './technicians.service.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import * as passwordHash from '../../../utils/password-hash.js';
import { createTechnicianAccountSchema } from '../../dto/create-Technician-account.dto.js';

describe('TechniciansService', () => {
  let service: TechniciansService;
  let hashPasswordSpy: ReturnType<typeof vi.spyOn>;
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    technician: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
    repairTicket: {
      count: vi.fn(),
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
    repairStatusHistory: {
      create: vi.fn(),
    },
    refreshToken: {
      updateMany: vi.fn(),
    },
    $transaction: vi.fn((input) => {
      if (typeof input === 'function') {
        return input(mockPrisma);
      }
      return Promise.all(input);
    }),
  };

  const technicianData = {
    name: 'Alex Technician',
    email: 'alex.technician@example.com',
    password: 'SecurePassword1',
    phone: '+201012345678',
    role: 'TECHNICIAN' as const,
  };

  const createdTechnician = {
    id: 'user-id-1',
    name: technicianData.name,
    email: technicianData.email,
    phone: technicianData.phone,
    role: technicianData.role,
    technician: {
      id: 'user-id-1',
      employeeId: 'TECH-001',
    },
  };

  beforeEach(async () => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    hashPasswordSpy = vi.spyOn(passwordHash, 'hashPassword');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TechniciansService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TechniciansService>(TechniciansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTechnicianAccount', () => {
    it('should create a technician with a hashed password and nested technician record', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(createdTechnician);
      vi.spyOn(passwordHash, 'hashPassword').mockResolvedValue('hashed-password');

      const result = await service.createTechnicianAccount(technicianData);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: technicianData.email,
          role: 'TECHNICIAN',
        },
      });
      expect(passwordHash.hashPassword).toHaveBeenCalledWith(technicianData.password);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          name: technicianData.name,
          email: technicianData.email,
          password: 'hashed-password',
          phone: technicianData.phone,
          role: 'TECHNICIAN',
          EmailVerifyAt: expect.any(Date),
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
      expect(result).toEqual(createdTechnician);
    });

    it('should reject duplicate technician email addresses', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing-user-id' });

      await expect(service.createTechnicianAccount(technicianData)).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
      expect(hashPasswordSpy).not.toHaveBeenCalled();
    });

    it('should reject invalid phone numbers', async () => {
      const data = { ...technicianData, phone: 'invalid-phone' };

      await expect(service.createTechnicianAccount(data)).rejects.toThrow();
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('should convert database errors into an internal server error', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database unavailable'));

      await expect(service.createTechnicianAccount(technicianData)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should preserve HTTP exceptions thrown during creation', async () => {
      const httpError = new HttpException('Database rejected request', 400);
      mockPrisma.user.findUnique.mockRejectedValue(httpError);

      await expect(service.createTechnicianAccount(technicianData)).rejects.toBe(httpError);
    });

    it('should throw HttpException 400 when required fields are missing after parse', async () => {
      vi.spyOn(createTechnicianAccountSchema, 'parse').mockReturnValueOnce({
        name: '',
        email: '',
        password: '',
        role: 'TECHNICIAN',
      } as any);

      await expect(service.createTechnicianAccount(technicianData)).rejects.toThrow(
        new HttpException('Name, email, and password are required', 400),
      );
    });

    it('should throw ForbiddenException if role is not TECHNICIAN', async () => {
      vi.spyOn(createTechnicianAccountSchema, 'parse').mockReturnValueOnce({
        name: 'A',
        email: 'a@a.com',
        password: 'pass',
        role: 'ADMIN' as any,
      });

      await expect(service.createTechnicianAccount(technicianData)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw HttpException 400 if phone format is invalid after parse', async () => {
      vi.spyOn(createTechnicianAccountSchema, 'parse').mockReturnValueOnce({
        name: 'A',
        email: 'a@a.com',
        password: 'pass',
        role: 'TECHNICIAN',
        phone: '123',
      });

      await expect(service.createTechnicianAccount(technicianData)).rejects.toThrow(
        new HttpException('Invalid phone number', 400),
      );
    });
  });

  describe('getAllTechnicians', () => {
    const technicians = [
      {
        id: 'technician-id-1',
        employeeId: 'TECH-001',
        user: {
          id: 'user-id-1',
          name: 'Alex Technician',
          email: technicianData.email,
          phone: technicianData.phone,
          role: 'TECHNICIAN',
        },
        repairTickets: [],
      },
    ];

    it('should return all technicians with their users and tickets', async () => {
      mockPrisma.technician.findMany.mockResolvedValue(technicians);

      const result = await service.getAllTechnicians();

      expect(mockPrisma.technician.findMany).toHaveBeenCalledWith({
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
      expect(result).toEqual(technicians);
    });

    it('should throw NotFoundException when no technicians exist', async () => {
      mockPrisma.technician.findMany.mockResolvedValue([]);

      await expect(service.getAllTechnicians()).rejects.toThrow(NotFoundException);
    });

    it('should convert retrieval errors into an internal server error', async () => {
      mockPrisma.technician.findMany.mockRejectedValue(new Error('Database unavailable'));

      await expect(service.getAllTechnicians()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('listTechnicians', () => {
    it('should return paginated technicians and total count', async () => {
      const technicians = [{ id: 'technician-id-1', repairTickets: [] }];
      mockPrisma.technician.findMany.mockResolvedValue(technicians);
      mockPrisma.technician.count.mockResolvedValue(1);

      const result = await service.listTechnicians({ page: 2, limit: 10 });

      expect(mockPrisma.technician.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
          skip: 10,
          take: 10,
        }),
      );
      expect(mockPrisma.technician.count).toHaveBeenCalledWith({ where: {} });
      expect(result).toEqual({
        data: technicians,
        total: 1,
        page: 2,
        limit: 10,
      });
    });

    it('should apply default pagination values', async () => {
      mockPrisma.technician.findMany.mockResolvedValue([]);
      mockPrisma.technician.count.mockResolvedValue(0);

      await service.listTechnicians({} as never);

      expect(mockPrisma.technician.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10 }),
      );
    });

    it('should reject invalid pagination values', async () => {
      await expect(
        service.listTechnicians({ page: 0, limit: 100 }),
      ).rejects.toThrow();
      expect(mockPrisma.technician.findMany).not.toHaveBeenCalled();
      expect(mockPrisma.technician.count).not.toHaveBeenCalled();
    });

    it('should convert listing errors into an internal server error', async () => {
      mockPrisma.technician.findMany.mockRejectedValue(new Error('Database unavailable'));

      await expect(service.listTechnicians({ page: 1, limit: 10 })).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should filter technicians by search query', async () => {
      mockPrisma.technician.findMany.mockResolvedValue([]);
      mockPrisma.technician.count.mockResolvedValue(0);

      await service.listTechnicians({ search: 'Alex' });

      expect(mockPrisma.technician.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: expect.arrayContaining([
              { employeeId: { contains: 'Alex', mode: 'insensitive' } },
            ]),
          },
        }),
      );
    });

    it('should rethrow HttpException in listTechnicians', async () => {
      mockPrisma.technician.findMany.mockRejectedValue(new NotFoundException('Not found'));

      await expect(service.listTechnicians({ page: 1, limit: 10 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getTechnicianById', () => {
    it('should return technician details with computed statistics', async () => {
      const technicianDetail = {
        id: 'tech-uuid-1',
        employeeId: 'TECH-001',
        user: {
          id: 'tech-uuid-1',
          name: 'Alex Technician',
          email: 'alex@example.com',
          phone: '+201012345678',
          role: 'TECHNICIAN',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        repairTickets: [
          { id: 'ticket-1', status: 'IN_REPAIR' },
          { id: 'ticket-2', status: 'COMPLETED' },
        ],
      };
      mockPrisma.technician.findUnique.mockResolvedValue(technicianDetail);

      const result = await service.getTechnicianById('tech-uuid-1');

      expect(mockPrisma.technician.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'tech-uuid-1' } }),
      );
      expect(result.stats).toEqual({
        totalTickets: 2,
        activeTicketsCount: 1,
        completedTicketsCount: 1,
      });
    });

    it('should throw NotFoundException if technician does not exist', async () => {
      mockPrisma.technician.findUnique.mockResolvedValue(null);

      await expect(service.getTechnicianById('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should convert DB errors into InternalServerErrorException', async () => {
      mockPrisma.technician.findUnique.mockRejectedValue(new Error('DB failure'));

      await expect(service.getTechnicianById('tech-1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('updateTechnician', () => {
    it('should update technician user fields', async () => {
      mockPrisma.technician.findUnique.mockResolvedValue({
        id: 'tech-uuid-1',
        user: { email: 'old@example.com' },
      });
      mockPrisma.user.update.mockResolvedValue({
        id: 'tech-uuid-1',
        name: 'New Name',
        email: 'old@example.com',
        phone: '+201099999999',
      });

      const result = await service.updateTechnician('tech-uuid-1', {
        name: 'New Name',
        phone: '+201099999999',
      });

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'tech-uuid-1' },
          data: { name: 'New Name', phone: '+201099999999' },
        }),
      );
      expect(result.name).toBe('New Name');
    });

    it('should reject email collision if updated email is already taken', async () => {
      mockPrisma.technician.findUnique.mockResolvedValue({
        id: 'tech-uuid-1',
        user: { email: 'old@example.com' },
      });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'other-user-uuid' });

      await expect(
        service.updateTechnician('tech-uuid-1', { email: 'taken@example.com' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if technician to update does not exist', async () => {
      mockPrisma.technician.findUnique.mockResolvedValue(null);

      await expect(
        service.updateTechnician('non-existent', { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on invalid update data (ZodError)', async () => {
      await expect(
        service.updateTechnician('tech-uuid-1', { email: 'not-an-email' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('resetTechnicianPassword', () => {
    it('should hash new password, update user, and revoke tokens', async () => {
      mockPrisma.technician.findUnique.mockResolvedValue({ id: 'tech-uuid-1' });
      vi.spyOn(passwordHash, 'hashPassword').mockResolvedValue('hashed-new-password');

      const result = await service.resetTechnicianPassword('tech-uuid-1', 'NewSecurePass1');

      expect(passwordHash.hashPassword).toHaveBeenCalledWith('NewSecurePass1');
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Technician password reset successfully' });
    });

    it('should throw NotFoundException if technician does not exist', async () => {
      mockPrisma.technician.findUnique.mockResolvedValue(null);

      await expect(
        service.resetTechnicianPassword('non-existent-id', 'NewPass123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on unexpected DB error', async () => {
      mockPrisma.technician.findUnique.mockRejectedValue(new Error('DB failure'));

      await expect(
        service.resetTechnicianPassword('tech-uuid-1', 'NewPass123'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('deleteTechnician', () => {
    it('should throw NotFoundException if technician does not exist', async () => {
      mockPrisma.technician.findUnique.mockResolvedValue(null);

      await expect(service.deleteTechnician('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should convert unexpected DB errors to InternalServerErrorException', async () => {
      mockPrisma.technician.findUnique.mockRejectedValue(new Error('DB failure'));

      await expect(service.deleteTechnician('tech-1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should prevent deletion if technician has active repair tickets', async () => {
      mockPrisma.technician.findUnique.mockResolvedValue({
        id: 'tech-uuid-1',
        repairTickets: [{ id: 'ticket-1', status: 'IN_REPAIR' }],
      });

      await expect(service.deleteTechnician('tech-uuid-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrisma.user.delete).not.toHaveBeenCalled();
    });

    it('should delete user if technician has no active repair tickets', async () => {
      mockPrisma.technician.findUnique.mockResolvedValue({
        id: 'tech-uuid-1',
        repairTickets: [{ id: 'ticket-1', status: 'COMPLETED' }],
      });
      mockPrisma.user.delete.mockResolvedValue({ id: 'tech-uuid-1' });

      const result = await service.deleteTechnician('tech-uuid-1');

      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'tech-uuid-1' },
      });
      expect(result).toEqual({ message: 'Technician deleted successfully' });
    });
  });

  describe('transferTickets', () => {
    it('should transfer all active tickets from one technician to another', async () => {
      mockPrisma.technician.findUnique
        .mockResolvedValueOnce({ id: 'tech-1', user: { name: 'Tech One' } })
        .mockResolvedValueOnce({ id: 'tech-2', user: { name: 'Tech Two' } });

      mockPrisma.repairTicket.findMany.mockResolvedValue([
        { id: 'ticket-1', status: 'IN_REPAIR' },
        { id: 'ticket-2', status: 'DIAGNOSING' },
      ]);

      const result = await service.transferTickets('tech-1', 'tech-2');

      expect(result.transferredCount).toBe(2);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should return 0 transferredCount when there are no active tickets', async () => {
      mockPrisma.technician.findUnique
        .mockResolvedValueOnce({ id: 'tech-1', user: { name: 'Tech One' } })
        .mockResolvedValueOnce({ id: 'tech-2', user: { name: 'Tech Two' } });
      mockPrisma.repairTicket.findMany.mockResolvedValue([]);

      const result = await service.transferTickets('tech-1', 'tech-2');
      expect(result.transferredCount).toBe(0);
      expect(result.message).toBe('No active tickets to transfer');
    });

    it('should throw NotFoundException if source technician not found', async () => {
      mockPrisma.technician.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'tech-2', user: { name: 'Tech Two' } });

      await expect(service.transferTickets('tech-1', 'tech-2')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if target technician not found', async () => {
      mockPrisma.technician.findUnique
        .mockResolvedValueOnce({ id: 'tech-1', user: { name: 'Tech One' } })
        .mockResolvedValueOnce(null);

      await expect(service.transferTickets('tech-1', 'tech-2')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should reject if source and target technicians are the same', async () => {
      await expect(service.transferTickets('tech-1', 'tech-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should catch unexpected errors and throw InternalServerErrorException', async () => {
      mockPrisma.technician.findUnique.mockRejectedValue(new Error('Crash'));

      await expect(service.transferTickets('tech-1', 'tech-2')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
