import { Test, TestingModule } from '@nestjs/testing';
import { RepairRequestManagmentController } from './repair-request-managment.controller.js';
import { RepairRequestManagmentService } from './repair-request-managment.service.js';
import { AuthenticationGuard } from '../authentication/authentication.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { JwtService } from '@nestjs/jwt';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RepairTicketPriority } from '../prisma/generated/client.js';

describe('RepairRequestManagmentController', () => {
  let controller: RepairRequestManagmentController;
  let service: {
    listRequests: any;
    getRequestById: any;
    acceptRequest: any;
    rejectRequest: any;
    listTickets: any;
    getTicketById: any;
    getTicketHistory: any;
    assignTechnician: any;
    unassignTechnician: any;
    startDiagnosis: any;
    startRepair: any;
    markReadyForPickup: any;
    completeTicket: any;
    markUnrepairable: any;
    cancelTicket: any;
  };

  const mockUser = { sub: 'user-1', role: 'ADMIN' };

  beforeEach(async () => {
    service = {
      listRequests: vi.fn(),
      getRequestById: vi.fn(),
      acceptRequest: vi.fn(),
      rejectRequest: vi.fn(),
      listTickets: vi.fn(),
      getTicketById: vi.fn(),
      getTicketHistory: vi.fn(),
      assignTechnician: vi.fn(),
      unassignTechnician: vi.fn(),
      startDiagnosis: vi.fn(),
      startRepair: vi.fn(),
      markReadyForPickup: vi.fn(),
      completeTicket: vi.fn(),
      markUnrepairable: vi.fn(),
      cancelTicket: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RepairRequestManagmentController],
      providers: [
        { provide: RepairRequestManagmentService, useValue: service },
        { provide: AuthenticationGuard, useValue: { canActivate: () => true } },
        { provide: RolesGuard, useValue: { canActivate: () => true } },
        { provide: JwtService, useValue: {} },
      ],
    }).compile();

    controller = module.get<RepairRequestManagmentController>(
      RepairRequestManagmentController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call listRequests', async () => {
    service.listRequests.mockResolvedValue({ items: [], pagination: {} });
    const query = { page: 1, limit: 10 };
    await controller.listRequests(query);
    expect(service.listRequests).toHaveBeenCalledWith(query);
  });

  it('should log and rethrow error in listRequests', async () => {
    const error = new Error('Database query failed');
    service.listRequests.mockImplementation(() => {
      throw error;
    });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => controller.listRequests({ page: 1, limit: 10 })).toThrow('Database query failed');
    expect(consoleSpy).toHaveBeenCalledWith('Error in listRequests:', error);
    consoleSpy.mockRestore();
  });

  it('should call getRequest', async () => {
    service.getRequestById.mockResolvedValue({ id: 'r1' });
    const res = await controller.getRequest('r1');
    expect(res).toEqual({ id: 'r1' });
    expect(service.getRequestById).toHaveBeenCalledWith('r1');
  });

  it('should call accept', async () => {
    service.acceptRequest.mockResolvedValue({ id: 'r1' });
    const dto = { priority: RepairTicketPriority.HIGH };
    const res = await controller.accept('r1', dto);
    expect(res).toEqual({ id: 'r1' });
    expect(service.acceptRequest).toHaveBeenCalledWith('r1', dto);
  });

  it('should call reject', async () => {
    service.rejectRequest.mockResolvedValue({ id: 'r1' });
    const dto = { reason: 'Cannot fix' };
    const res = await controller.reject('r1', dto);
    expect(res).toEqual({ id: 'r1' });
    expect(service.rejectRequest).toHaveBeenCalledWith('r1', dto);
  });

  it('should call listTickets', async () => {
    service.listTickets.mockResolvedValue({ items: [], pagination: {} });
    const query = { page: 1, limit: 10 };
    const res = await controller.listTickets(query, mockUser);
    expect(res).toBeDefined();
    expect(service.listTickets).toHaveBeenCalledWith(query, mockUser);
  });

  it('should call getTicket', async () => {
    service.getTicketById.mockResolvedValue({ id: 't1' });
    const res = await controller.getTicket('t1', mockUser);
    expect(res).toEqual({ id: 't1' });
    expect(service.getTicketById).toHaveBeenCalledWith('t1', mockUser);
  });

  it('should call history', async () => {
    service.getTicketHistory.mockResolvedValue([]);
    const res = await controller.history('t1', mockUser);
    expect(res).toEqual([]);
    expect(service.getTicketHistory).toHaveBeenCalledWith('t1', mockUser);
  });

  it('should call assign', async () => {
    service.assignTechnician.mockResolvedValue({ id: 't1' });
    const dto = { technicianId: 'tech-1' };
    const res = await controller.assign('t1', dto);
    expect(res).toEqual({ id: 't1' });
    expect(service.assignTechnician).toHaveBeenCalledWith('t1', dto);
  });

  it('should call unassign', async () => {
    service.unassignTechnician.mockResolvedValue({ id: 't1' });
    const dto = { notes: 'Removed technician' };
    const res = await controller.unassign('t1', dto);
    expect(res).toEqual({ id: 't1' });
    expect(service.unassignTechnician).toHaveBeenCalledWith('t1', 'Removed technician');
  });

  it('should call diagnose', async () => {
    service.startDiagnosis.mockResolvedValue({ id: 't1' });
    const dto = { notes: 'Starting diagnosis' };
    const res = await controller.diagnose('t1', mockUser, dto);
    expect(res).toEqual({ id: 't1' });
    expect(service.startDiagnosis).toHaveBeenCalledWith('t1', mockUser, dto);
  });

  it('should call repair', async () => {
    service.startRepair.mockResolvedValue({ id: 't1' });
    const dto = { diagnosis: 'Broken battery', notes: 'Replacing battery' };
    const res = await controller.repair('t1', mockUser, dto);
    expect(res).toEqual({ id: 't1' });
    expect(service.startRepair).toHaveBeenCalledWith('t1', mockUser, dto);
  });

  it('should call ready', async () => {
    service.markReadyForPickup.mockResolvedValue({ id: 't1' });
    const dto = { repairNotes: 'Battery replaced', notes: 'Ready for customer pickup' };
    const res = await controller.ready('t1', mockUser, dto);
    expect(res).toEqual({ id: 't1' });
    expect(service.markReadyForPickup).toHaveBeenCalledWith('t1', mockUser, dto);
  });

  it('should call complete', async () => {
    service.completeTicket.mockResolvedValue({ id: 't1' });
    const dto = { notes: 'Customer picked up' };
    const res = await controller.complete('t1', mockUser, dto);
    expect(res).toEqual({ id: 't1' });
    expect(service.completeTicket).toHaveBeenCalledWith('t1', mockUser, dto);
  });

  it('should call unrepairable', async () => {
    service.markUnrepairable.mockResolvedValue({ id: 't1' });
    const dto = { reason: 'Motherboard fried', notes: 'Device cannot be saved' };
    const res = await controller.unrepairable('t1', mockUser, dto);
    expect(res).toEqual({ id: 't1' });
    expect(service.markUnrepairable).toHaveBeenCalledWith('t1', mockUser, dto);
  });

  it('should call cancel', async () => {
    service.cancelTicket.mockResolvedValue({ id: 't1' });
    const dto = { notes: 'User cancelled request' };
    const res = await controller.cancel('t1', dto);
    expect(res).toEqual({ id: 't1' });
    expect(service.cancelTicket).toHaveBeenCalledWith('t1', dto);
  });
});
