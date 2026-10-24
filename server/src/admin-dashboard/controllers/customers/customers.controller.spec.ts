import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CustomersController } from './customers.controller.js';
import { CustomersService } from '../../services/customers/customers.service.js';
import { AuthenticationGuard } from '../../../authentication/authentication.guard.js';
import { RolesGuard } from '../../../common/guards/roles.guard.js';
import { JwtService } from '@nestjs/jwt';
import type { CustomerListQueryDto } from '../../dto/customer-list-query.dto.js';

describe('CustomersController', () => {
  let controller: CustomersController;

  const mockCustomersService = {
    getAllCustomers: vi.fn(),
    getCustomerById: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        { provide: CustomersService, useValue: mockCustomersService },
        { provide: AuthenticationGuard, useValue: { canActivate: () => true } },
        { provide: RolesGuard, useValue: { canActivate: () => true } },
        { provide: JwtService, useValue: {} },
      ],
    }).compile();

    controller = module.get<CustomersController>(CustomersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllCustomers', () => {
    it('should call customersService.getAllCustomers with query and return the result', async () => {
      const query: CustomerListQueryDto = { page: 1, limit: 10 };
      const expectedResponse = {
        items: [
          {
            userId: 'cust-1',
            name: 'Customer One',
            email: 'cust1@example.com',
            phone: '+201011111111',
            notes: 'VIP customer',
            devicesCount: 2,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      mockCustomersService.getAllCustomers.mockResolvedValue(expectedResponse);

      const result = await controller.getAllCustomers(query);

      expect(mockCustomersService.getAllCustomers).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResponse);
    });

    it('should propagate exceptions thrown by customersService', async () => {
      const query: CustomerListQueryDto = { page: 2, limit: 5 };
      mockCustomersService.getAllCustomers.mockRejectedValue(new Error('Service failure'));

      await expect(controller.getAllCustomers(query)).rejects.toThrow('Service failure');
      expect(mockCustomersService.getAllCustomers).toHaveBeenCalledWith(query);
    });
  });

  describe('getCustomerById', () => {
    it('should call customersService.getCustomerById with id and return customer details', async () => {
      const customerId = '00000000-0000-0000-0000-000000000001';
      const expectedCustomer = {
        userId: customerId,
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+201099999999',
        notes: 'Priority customer',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        stats: {
          totalDevices: 1,
          totalRequests: 1,
          totalTickets: 1,
          activeTickets: 1,
          completedTickets: 0,
        },
        devices: [],
      };

      mockCustomersService.getCustomerById.mockResolvedValue(expectedCustomer);

      const result = await controller.getCustomerById(customerId);

      expect(mockCustomersService.getCustomerById).toHaveBeenCalledWith(customerId);
      expect(result).toEqual(expectedCustomer);
    });

    it('should propagate errors thrown by customersService.getCustomerById', async () => {
      const customerId = '00000000-0000-0000-0000-000000000002';
      mockCustomersService.getCustomerById.mockRejectedValue(new Error('Customer not found'));

      await expect(controller.getCustomerById(customerId)).rejects.toThrow('Customer not found');
      expect(mockCustomersService.getCustomerById).toHaveBeenCalledWith(customerId);
    });
  });
});
