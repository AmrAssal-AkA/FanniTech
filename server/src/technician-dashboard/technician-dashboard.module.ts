import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { TechnicianDashboardController } from './technician-dashboard.controller.js';
import { TechnicianDashboardService } from './technician-dashboard.service.js';

@Module({
  imports: [AuthenticationModule, PrismaModule],
  controllers: [TechnicianDashboardController],
  providers: [TechnicianDashboardService],
  exports: [TechnicianDashboardService],
})
export class TechnicianDashboardModule {}
