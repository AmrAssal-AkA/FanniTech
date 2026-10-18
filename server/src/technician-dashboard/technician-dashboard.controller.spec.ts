import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationGuard } from '../authentication/authentication.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { TechnicianDashboardController } from './technician-dashboard.controller.js';
import { TechnicianDashboardService } from './technician-dashboard.service.js';

describe('TechnicianDashboardController', () => {
  let controller: TechnicianDashboardController;
  let service: { workBench: any; updateTicketNotes: any };

  beforeEach(async () => {
    service = {
      workBench: vi.fn(),
      updateTicketNotes: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TechnicianDashboardController],
      providers: [
        { provide: TechnicianDashboardService, useValue: service },
        { provide: AuthenticationGuard, useValue: { canActivate: () => true } },
        { provide: RolesGuard, useValue: { canActivate: () => true } },
        { provide: JwtService, useValue: {} },
      ],
    }).compile();

    controller = module.get<TechnicianDashboardController>(
      TechnicianDashboardController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getWorkbench', () => {
    it('should call workBench with user.sub', async () => {
      const mockUser = { sub: 'tech-123', role: 'TECHNICIAN' };
      const mockResult = { technicianName: 'Test Tech' };
      service.workBench.mockResolvedValue(mockResult);

      const result = await controller.getWorkbench(mockUser as any);

      expect(service.workBench).toHaveBeenCalledWith('tech-123');
      expect(result).toBe(mockResult);
    });
  });

  describe('updateTicketNotes', () => {
    it('should call updateTicketNotes with id, user.sub, and dto', async () => {
      const mockUser = { sub: 'tech-123', role: 'TECHNICIAN' };
      const dto = {
        diagnosis: 'New findings',
        notes: 'Progress note',
      };
      const mockResult = { id: 'ticket-1' };
      service.updateTicketNotes.mockResolvedValue(mockResult);

      const result = await controller.updateTicketNotes(
        'ticket-1',
        mockUser as any,
        dto,
      );

      expect(service.updateTicketNotes).toHaveBeenCalledWith(
        'ticket-1',
        'tech-123',
        dto,
      );
      expect(result).toBe(mockResult);
    });
  });
});
