import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DevicesService } from './devices.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('DevicesService', () => {
  let service: DevicesService;
  let prisma: PrismaService;

  beforeEach(() => {
    prisma = {
      customer: {
        upsert: vi.fn().mockResolvedValue({ userId: 'cust-1' }),
      },
      device: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
    } as unknown as PrismaService;

    service = new DevicesService(prisma);
  });

  describe('createDevice', () => {
    it('should upsert customer profile and create device', async () => {
      const dto = {
        deviceType: 'Smartphone',
        brand: 'Apple',
        model: 'iPhone 13',
        serialNumber: 'SN123',
      };

      const mockDevice = { id: 'dev-1', customerId: 'cust-1', ...dto };
      vi.mocked(prisma.device.create).mockResolvedValue(mockDevice as any);

      const result = await service.createDevice('cust-1', dto);

      expect(prisma.customer.upsert).toHaveBeenCalledWith({
        where: { userId: 'cust-1' },
        create: { userId: 'cust-1' },
        update: {},
      });
      expect(prisma.device.create).toHaveBeenCalledWith({
        data: { customerId: 'cust-1', ...dto },
      });
      expect(result).toEqual(mockDevice);
    });
  });

  describe('getCustomerDevices', () => {
    it('should list devices owned by customer ordered by createdAt desc', async () => {
      const mockDevices = [{ id: 'dev-1' }, { id: 'dev-2' }];
      vi.mocked(prisma.device.findMany).mockResolvedValue(mockDevices as any);

      const result = await service.getCustomerDevices('cust-1');

      expect(prisma.device.findMany).toHaveBeenCalledWith({
        where: { customerId: 'cust-1' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockDevices);
    });
  });

  describe('getDeviceById', () => {
    it('should return device if owned by customer', async () => {
      const mockDevice = { id: 'dev-1', customerId: 'cust-1', model: 'Pixel 8' };
      vi.mocked(prisma.device.findUnique).mockResolvedValue(mockDevice as any);

      const result = await service.getDeviceById('cust-1', 'dev-1');
      expect(result).toEqual(mockDevice);
    });

    it('should throw NotFoundException if device does not exist', async () => {
      vi.mocked(prisma.device.findUnique).mockResolvedValue(null);

      await expect(service.getDeviceById('cust-1', 'dev-nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if device belongs to another customer (IDOR protection)', async () => {
      const mockDevice = { id: 'dev-1', customerId: 'cust-other', model: 'Pixel 8' };
      vi.mocked(prisma.device.findUnique).mockResolvedValue(mockDevice as any);

      await expect(service.getDeviceById('cust-1', 'dev-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
