import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RepairRequestsService } from './repair-requests.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService } from '../storage/storage.service.js';
import { RepairRequestStatus } from '../prisma/generated/client.js';

describe('RepairRequestsService', () => {
  let service: RepairRequestsService;
  let prisma: PrismaService;
  let storageService: StorageService;

  beforeEach(() => {
    prisma = {
      device: {
        findUnique: vi.fn(),
      },
      repairRequest: {
        create: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    } as unknown as PrismaService;

    storageService = {
      uploadMultipleImages: vi.fn(),
      deleteImages: vi.fn(),
    } as unknown as StorageService;

    service = new RepairRequestsService(prisma, storageService);
  });

  const createMockFile = (
    overrides?: Partial<Express.Multer.File>,
  ): Express.Multer.File => ({
    fieldname: 'images',
    originalname: 'test.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024 * 1024,
    buffer: Buffer.from('fake image content'),
    stream: null as any,
    destination: '',
    filename: '',
    path: '',
    ...overrides,
  });

  describe('submitRequest', () => {
    const dto = {
      deviceId: 'dev-1',
      problem: 'Cracked screen',
      description: 'The touch screen is completely shattered.',
    };

    it('should throw NotFoundException if device does not exist', async () => {
      vi.mocked(prisma.device.findUnique).mockResolvedValue(null);

      await expect(
        service.submitRequest('cust-1', dto, []),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if device belongs to another customer (IDOR)', async () => {
      vi.mocked(prisma.device.findUnique).mockResolvedValue({
        id: 'dev-1',
        customerId: 'cust-other',
      } as any);

      await expect(
        service.submitRequest('cust-1', dto, []),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should successfully submit request without images', async () => {
      vi.mocked(prisma.device.findUnique).mockResolvedValue({
        id: 'dev-1',
        customerId: 'cust-1',
      } as any);
      vi.mocked(storageService.uploadMultipleImages).mockResolvedValue([]);

      const mockCreated = {
        id: 'req-1',
        deviceId: 'dev-1',
        problem: dto.problem,
        description: dto.description,
        status: RepairRequestStatus.PENDING,
        images: [],
      };
      vi.mocked(prisma.repairRequest.create).mockResolvedValue(mockCreated as any);

      const result = await service.submitRequest('cust-1', dto, []);

      expect(storageService.uploadMultipleImages).toHaveBeenCalledWith([]);
      expect(prisma.repairRequest.create).toHaveBeenCalledWith({
        data: {
          deviceId: 'dev-1',
          problem: dto.problem,
          description: dto.description,
          status: RepairRequestStatus.PENDING,
          images: { create: [] },
        },
        include: { images: true, device: true },
      });
      expect(result).toEqual(mockCreated);
    });

    it('should upload images and create request with image relations', async () => {
      vi.mocked(prisma.device.findUnique).mockResolvedValue({
        id: 'dev-1',
        customerId: 'cust-1',
      } as any);

      const files = [createMockFile()];
      const uploadedImage = {
        url: 'https://cloudinary.com/test.jpg',
        publicId: 'test-pub-id',
        fileName: 'test.jpg',
        mimeType: 'image/jpeg',
        size: 1024 * 1024,
      };
      vi.mocked(storageService.uploadMultipleImages).mockResolvedValue([
        uploadedImage,
      ]);

      const mockCreated = {
        id: 'req-1',
        ...dto,
        status: RepairRequestStatus.PENDING,
        images: [uploadedImage],
      };
      vi.mocked(prisma.repairRequest.create).mockResolvedValue(mockCreated as any);

      const result = await service.submitRequest('cust-1', dto, files);

      expect(storageService.uploadMultipleImages).toHaveBeenCalledWith(files);
      expect(prisma.repairRequest.create).toHaveBeenCalledWith({
        data: {
          deviceId: 'dev-1',
          problem: dto.problem,
          description: dto.description,
          status: RepairRequestStatus.PENDING,
          images: {
            create: [
              {
                url: uploadedImage.url,
                publicId: uploadedImage.publicId,
                fileName: uploadedImage.fileName,
                mimeType: uploadedImage.mimeType,
                size: uploadedImage.size,
              },
            ],
          },
        },
        include: { images: true, device: true },
      });
      expect(result).toEqual(mockCreated);
    });

    it('should delete uploaded images from Cloudinary if database insertion fails (compensation)', async () => {
      vi.mocked(prisma.device.findUnique).mockResolvedValue({
        id: 'dev-1',
        customerId: 'cust-1',
      } as any);

      const uploadedImage = {
        url: 'https://cloudinary.com/test.jpg',
        publicId: 'test-pub-id',
        fileName: 'test.jpg',
        mimeType: 'image/jpeg',
        size: 1024 * 1024,
      };
      vi.mocked(storageService.uploadMultipleImages).mockResolvedValue([
        uploadedImage,
      ]);

      vi.mocked(prisma.repairRequest.create).mockRejectedValue(
        new Error('Database unique constraint or network error'),
      );

      await expect(
        service.submitRequest('cust-1', dto, [createMockFile()]),
      ).rejects.toThrow();

      expect(storageService.deleteImages).toHaveBeenCalledWith(['test-pub-id']);
    });
  });

  describe('listCustomerRequests', () => {
    it('should return paginated requests scoped to the authenticated customer', async () => {
      const mockItems = [{ id: 'req-1' }];
      vi.mocked(prisma.repairRequest.count).mockResolvedValue(1);
      vi.mocked(prisma.repairRequest.findMany).mockResolvedValue(mockItems as any);

      const result = await service.listCustomerRequests('cust-1', {
        page: 1,
        limit: 10,
      });

      expect(prisma.repairRequest.findMany).toHaveBeenCalledWith({
        where: { device: { customerId: 'cust-1' } },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          images: true,
          device: true,
          repairTicket: {
            include: {
              technician: {
                include: {
                  user: {
                    select: { id: true, name: true, phone: true, email: true },
                  },
                },
              },
              statusHistory: {
                orderBy: { changedAt: 'asc' },
              },
            },
          },
        },
      });
      expect(result).toEqual({
        items: mockItems,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });
    });
  });

  describe('getRequestDetails', () => {
    it('should return request details if customer owns device', async () => {
      const mockRequest = {
        id: 'req-1',
        device: { customerId: 'cust-1' },
      };
      vi.mocked(prisma.repairRequest.findUnique).mockResolvedValue(
        mockRequest as any,
      );

      const result = await service.getRequestDetails('cust-1', 'req-1');
      expect(result).toEqual(mockRequest);
    });

    it('should throw NotFoundException if request not found', async () => {
      vi.mocked(prisma.repairRequest.findUnique).mockResolvedValue(null);

      await expect(
        service.getRequestDetails('cust-1', 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if customer does not own the device', async () => {
      vi.mocked(prisma.repairRequest.findUnique).mockResolvedValue({
        id: 'req-1',
        device: { customerId: 'cust-other' },
      } as any);

      await expect(
        service.getRequestDetails('cust-1', 'req-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('cancelRequest', () => {
    it('should successfully cancel PENDING request', async () => {
      vi.mocked(prisma.repairRequest.findUnique).mockResolvedValue({
        id: 'req-1',
        status: RepairRequestStatus.PENDING,
        device: { customerId: 'cust-1' },
      } as any);

      const mockCancelled = {
        id: 'req-1',
        status: RepairRequestStatus.CANCELLED,
      };
      vi.mocked(prisma.repairRequest.update).mockResolvedValue(
        mockCancelled as any,
      );

      const result = await service.cancelRequest('cust-1', 'req-1');

      expect(prisma.repairRequest.update).toHaveBeenCalledWith({
        where: { id: 'req-1' },
        data: { status: RepairRequestStatus.CANCELLED },
        include: { images: true, device: true },
      });
      expect(result).toEqual(mockCancelled);
    });

    it('should throw ConflictException if request status is not PENDING (e.g. ACCEPTED)', async () => {
      vi.mocked(prisma.repairRequest.findUnique).mockResolvedValue({
        id: 'req-1',
        status: RepairRequestStatus.ACCEPTED,
        device: { customerId: 'cust-1' },
      } as any);

      await expect(service.cancelRequest('cust-1', 'req-1')).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ForbiddenException if device belongs to another customer', async () => {
      vi.mocked(prisma.repairRequest.findUnique).mockResolvedValue({
        id: 'req-1',
        status: RepairRequestStatus.PENDING,
        device: { customerId: 'cust-other' },
      } as any);

      await expect(service.cancelRequest('cust-1', 'req-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
