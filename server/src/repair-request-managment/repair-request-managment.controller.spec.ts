import { Test, TestingModule } from '@nestjs/testing';
import { RepairRequestManagmentController } from './repair-request-managment.controller.js';
import { RepairRequestManagmentService } from './repair-request-managment.service.js';
import { AuthenticationGuard } from '../authentication/authentication.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { JwtService } from '@nestjs/jwt';

describe('RepairRequestManagmentController', () => {
  let controller: RepairRequestManagmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RepairRequestManagmentController],
      providers: [
        { provide: RepairRequestManagmentService, useValue: {} },
        { provide: AuthenticationGuard, useValue: { canActivate: () => true } },
        { provide: RolesGuard, useValue: { canActivate: () => true } },
        { provide: JwtService, useValue: {} },
      ],
    }).compile();

    controller = module.get<RepairRequestManagmentController>(RepairRequestManagmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
