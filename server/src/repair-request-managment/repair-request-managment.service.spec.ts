import { Test, TestingModule } from '@nestjs/testing';
import { RepairRequestManagmentService } from './repair-request-managment.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';

describe('RepairRequestManagmentService', () => {
  let service: RepairRequestManagmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RepairRequestManagmentService,
        { provide: PrismaService, useValue: {} },
        { provide: NotificationsService, useValue: {} },
      ],
    }).compile();

    service = module.get<RepairRequestManagmentService>(RepairRequestManagmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
