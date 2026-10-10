import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService } from '../storage/storage.service.js';
import { CreateRepairRequestDtoType } from './dto/create-repair-request.dto.js';
import { RepairRequestQueryDtoType } from './dto/repair-request-query.dto.js';
import { RepairRequestStatus } from '../prisma/generated/client.js';

@Injectable()
export class RepairRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async submitRequest(
    userId: string,
    dto: CreateRepairRequestDtoType,
    files: Express.Multer.File[] = [],
  ) {
    // 1. Verify device exists and ownership (IDOR Prevention)
    const device = await this.prisma.device.findUnique({
      where: { id: dto.deviceId },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    if (device.customerId !== userId) {
      throw new ForbiddenException('You do not own this device');
    }

    // 2. Upload images to Cloudinary (validates mime types and file limits)
    const uploadedImages = await this.storageService.uploadMultipleImages(files);

    // 3. Persist RepairRequest and images in DB with compensation rollback
    try {
      const createdRequest = await this.prisma.repairRequest.create({
        data: {
          deviceId: dto.deviceId,
          problem: dto.problem,
          description: dto.description,
          status: RepairRequestStatus.PENDING,
          images: {
            create: uploadedImages.map((image) => ({
              url: image.url,
              publicId: image.publicId,
              fileName: image.fileName,
              mimeType: image.mimeType,
              size: image.size,
            })),
          },
        },
        include: {
          images: true,
          device: true,
        },
      });

      return createdRequest;
    } catch (error) {
      // Downstream failure: compensate by destroying uploaded assets in Cloudinary
      if (uploadedImages.length > 0) {
        await this.storageService.deleteImages(
          uploadedImages.map((img) => img.publicId),
        );
      }
      throw error;
    }
  }

  async listCustomerRequests(
    userId: string,
    query: RepairRequestQueryDtoType,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
      device: { customerId: userId },
      ...(query.status ? { status: query.status } : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.repairRequest.count({ where }),
      this.prisma.repairRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          images: true,
          device: true,
        },
      }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getRequestDetails(userId: string, requestId: string) {
    const request = await this.prisma.repairRequest.findUnique({
      where: { id: requestId },
      include: {
        images: true,
        device: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Repair request not found');
    }

    if (request.device.customerId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this repair request',
      );
    }

    return request;
  }

  async cancelRequest(userId: string, requestId: string) {
    const request = await this.prisma.repairRequest.findUnique({
      where: { id: requestId },
      include: { device: true },
    });

    if (!request) {
      throw new NotFoundException('Repair request not found');
    }

    if (request.device.customerId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this repair request',
      );
    }

    // State machine check: Customer can only cancel from PENDING
    if (request.status !== RepairRequestStatus.PENDING) {
      throw new ConflictException('Only pending requests can be cancelled');
    }

    return this.prisma.repairRequest.update({
      where: { id: requestId },
      data: { status: RepairRequestStatus.CANCELLED },
      include: {
        images: true,
        device: true,
      },
    });
  }
}
