import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller.js';
import { NotificationsService } from './notifications.service.js';
import { NotificationsGateway } from './notifications.gateway.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthenticationModule } from '../authentication/authentication.module.js';
import { WsAuthGuard } from './ws-auth.guard.js';

@Module({
  imports: [PrismaModule, AuthenticationModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway, WsAuthGuard],
  exports: [NotificationsService],
})
export class NotificationsModule {}
