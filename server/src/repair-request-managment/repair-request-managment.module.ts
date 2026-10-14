import { Module } from '@nestjs/common';
import { RepairRequestManagmentController } from './repair-request-managment.controller.js';
import { RepairRequestManagmentService } from './repair-request-managment.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthenticationModule } from '../authentication/authentication.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [PrismaModule, AuthenticationModule, NotificationsModule],
  controllers: [RepairRequestManagmentController],
  providers: [RepairRequestManagmentService],
  exports: [RepairRequestManagmentService]
})
export class RepairRequestManagmentModule {}
