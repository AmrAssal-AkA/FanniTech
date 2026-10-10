import { Module } from '@nestjs/common';
import { RepairRequestsController } from './repair-requests.controller.js';
import { RepairRequestsService } from './repair-requests.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { StorageModule } from '../storage/storage.module.js';
import { AuthenticationModule } from '../authentication/authentication.module.js';

@Module({
  imports: [PrismaModule, StorageModule, AuthenticationModule],
  controllers: [RepairRequestsController],
  providers: [RepairRequestsService],
  exports: [RepairRequestsService],
})
export class RepairRequestsModule {}
