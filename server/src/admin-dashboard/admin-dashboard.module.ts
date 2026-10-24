import { Module } from '@nestjs/common';

import { CustomersController } from './controllers/customers/customers.controller.js';
import { CustomersService } from './services/customers/customers.service.js';

import {AuthenticationModule} from "../authentication/authentication.module.js";
import {PrismaModule} from "../prisma/prisma.module.js";
import { TechnicianController } from './controllers/technician/technician.controller.js';
import { TechniciansService } from './services/technicians/technicians.service.js';


@Module({
  imports: [AuthenticationModule, PrismaModule],
  controllers: [CustomersController, TechnicianController],
  providers: [CustomersService, TechniciansService]
})
export class AdminDashboardModule {}
