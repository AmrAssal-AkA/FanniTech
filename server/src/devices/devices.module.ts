import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller.js';
import { DevicesService } from './devices.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthenticationModule } from '../authentication/authentication.module.js';

@Module({
  imports: [PrismaModule, AuthenticationModule],
  controllers: [DevicesController],
  providers: [DevicesService],
  exports: [DevicesService],
})
export class DevicesModule {}
