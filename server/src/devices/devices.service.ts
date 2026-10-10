import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDeviceDtoType } from './dto/device.dto.js';

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  async createDevice(customerId: string, dto: CreateDeviceDtoType) {
    // Ensure customer profile exists
    await this.prisma.customer.upsert({
      where: { userId: customerId },
      create: { userId: customerId },
      update: {},
    });

    return this.prisma.device.create({
      data: {
        customerId,
        deviceType: dto.deviceType,
        brand: dto.brand,
        model: dto.model,
        serialNumber: dto.serialNumber,
      },
    });
  }

  async getCustomerDevices(customerId: string) {
    console.log(`Fetching devices for customerId: ${customerId}`);
    const devices = await this.prisma.device.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    })
    console.log(`Found ${devices.length} devices for customerId: ${customerId}`);
    return devices;
  }

  async getDeviceById(customerId: string, deviceId: string) {
    const device = await this.prisma.device.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    if (device.customerId !== customerId) {
      throw new ForbiddenException('You do not own this device');
    }

    return device;
  }
}
