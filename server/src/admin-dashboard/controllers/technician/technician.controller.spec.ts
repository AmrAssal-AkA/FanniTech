import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TechnicianController } from './technician.controller.js';
import { TechniciansService } from '../../services/technicians/technicians.service.js';
import { AuthenticationGuard } from '../../../authentication/authentication.guard.js';
import { RolesGuard } from '../../../common/guards/roles.guard.js';
import { JwtService } from '@nestjs/jwt';

describe('TechnicianController', () => {
  let controller: TechnicianController;
  const mockTechniciansService = {
    createTechnicianAccount: vi.fn(),
    getAllTechnicians: vi.fn(),
    listTechnicians: vi.fn(),
    getTechnicianById: vi.fn(),
    updateTechnician: vi.fn(),
    resetTechnicianPassword: vi.fn(),
    deleteTechnician: vi.fn(),
    transferTickets: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TechnicianController],
      providers: [
        { provide: TechniciansService, useValue: mockTechniciansService },
        { provide: AuthenticationGuard, useValue: { canActivate: () => true } },
        { provide: RolesGuard, useValue: { canActivate: () => true } },
        { provide: JwtService, useValue: {} },
      ],
    }).compile();

    controller = module.get<TechnicianController>(TechnicianController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a technician account and return the service result', async () => {
    const data = {
      name: 'Alex Technician',
      email: 'alex.technician@example.com',
      password: 'SecurePassword1',
      phone: '+201012345678',
      role: 'TECHNICIAN' as const,
    };
    const expectedResponse = {
      id: 'technician-user-id',
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      technician: { id: 'technician-user-id', employeeId: 'TECH-001' },
    };
    mockTechniciansService.createTechnicianAccount.mockResolvedValue(expectedResponse);

    const result = await controller.createTechnician(data);

    expect(mockTechniciansService.createTechnicianAccount).toHaveBeenCalledWith(data);
    expect(result).toEqual(expectedResponse);
  });

  it('should propagate service errors', async () => {
    const data = {
      name: 'Alex Technician',
      email: 'alex.technician@example.com',
      password: 'SecurePassword1',
      role: 'TECHNICIAN' as const,
    };
    mockTechniciansService.createTechnicianAccount.mockRejectedValue(
      new Error('Technician creation failed'),
    );

    await expect(controller.createTechnician(data)).rejects.toThrow(
      'Technician creation failed',
    );
  });

  it('should return all technicians from the service', async () => {
    const expectedResponse = [
      {
        id: 'technician-user-id',
        employeeId: 'TECH-001',
        user: {
          id: 'technician-user-id',
          name: 'Alex Technician',
          email: 'alex.technician@example.com',
          phone: '+201012345678',
          role: 'TECHNICIAN',
        },
        repairTickets: [],
      },
    ];
    mockTechniciansService.getAllTechnicians.mockResolvedValue(expectedResponse);

    const result = await controller.getAllTechnicians();

    expect(mockTechniciansService.getAllTechnicians).toHaveBeenCalledOnce();
    expect(result).toEqual(expectedResponse);
  });

  it('should propagate getAllTechnicians service errors', async () => {
    mockTechniciansService.getAllTechnicians.mockRejectedValue(
      new Error('Unable to retrieve technicians'),
    );

    await expect(controller.getAllTechnicians()).rejects.toThrow(
      'Unable to retrieve technicians',
    );
  });

  it('should return paginated technicians from the service', async () => {
    const query = { page: 2, limit: 10 };
    const expectedResponse = {
      data: [],
      total: 0,
      page: 2,
      limit: 10,
    };
    mockTechniciansService.listTechnicians.mockResolvedValue(expectedResponse);

    const result = await controller.listTechnicians(query);

    expect(mockTechniciansService.listTechnicians).toHaveBeenCalledWith(query);
    expect(result).toEqual(expectedResponse);
  });

  it('should propagate listTechnicians service errors', async () => {
    mockTechniciansService.listTechnicians.mockRejectedValue(
      new Error('Unable to list technicians'),
    );

    await expect(controller.listTechnicians({ page: 1, limit: 10 })).rejects.toThrow(
      'Unable to list technicians',
    );
  });

  it('should get technician by id', async () => {
    const technicianDetail = { id: 'tech-uuid-1', employeeId: 'TECH-001' };
    mockTechniciansService.getTechnicianById.mockResolvedValue(technicianDetail);

    const result = await controller.getTechnicianById('tech-uuid-1');

    expect(mockTechniciansService.getTechnicianById).toHaveBeenCalledWith('tech-uuid-1');
    expect(result).toEqual(technicianDetail);
  });

  it('should update technician details', async () => {
    const updateDto = { name: 'Updated Name', phone: '+201088888888' };
    const updatedResponse = { id: 'tech-uuid-1', ...updateDto };
    mockTechniciansService.updateTechnician.mockResolvedValue(updatedResponse);

    const result = await controller.updateTechnician('tech-uuid-1', updateDto);

    expect(mockTechniciansService.updateTechnician).toHaveBeenCalledWith('tech-uuid-1', updateDto);
    expect(result).toEqual(updatedResponse);
  });

  it('should reset technician password', async () => {
    const dto = { password: 'NewSecurePassword123' };
    const response = { message: 'Technician password reset successfully' };
    mockTechniciansService.resetTechnicianPassword.mockResolvedValue(response);

    const result = await controller.resetPassword('tech-uuid-1', dto);

    expect(mockTechniciansService.resetTechnicianPassword).toHaveBeenCalledWith(
      'tech-uuid-1',
      dto.password,
    );
    expect(result).toEqual(response);
  });

  it('should delete technician', async () => {
    const response = { message: 'Technician deleted successfully' };
    mockTechniciansService.deleteTechnician.mockResolvedValue(response);

    const result = await controller.deleteTechnician('tech-uuid-1');

    expect(mockTechniciansService.deleteTechnician).toHaveBeenCalledWith('tech-uuid-1');
    expect(result).toEqual(response);
  });

  it('should transfer technician tickets', async () => {
    const dto = { targetTechnicianId: 'target-uuid-2' };
    const response = { transferredCount: 3, message: 'Transferred 3 tickets' };
    mockTechniciansService.transferTickets.mockResolvedValue(response);

    const result = await controller.transferTickets('tech-uuid-1', dto);

    expect(mockTechniciansService.transferTickets).toHaveBeenCalledWith(
      'tech-uuid-1',
      dto.targetTechnicianId,
    );
    expect(result).toEqual(response);
  });
});
