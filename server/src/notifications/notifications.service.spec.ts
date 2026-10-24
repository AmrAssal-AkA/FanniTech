import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationsGateway } from './notifications.gateway.js';
import { NotificationType } from '../prisma/generated/client.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: {
    notification: {
      create: any;
      count: any;
      findMany: any;
      updateMany: any;
    };
  };
  let gateway: {
    sendToUser: any;
    sendToAdmins: any;
    sentToTechnician: any;
  };

  beforeEach(async () => {
    prisma = {
      notification: {
        create: vi.fn(),
        count: vi.fn(),
        findMany: vi.fn(),
        updateMany: vi.fn(),
      },
    };

    gateway = {
      sendToUser: vi.fn(),
      sendToAdmins: vi.fn(),
      sentToTechnician: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsGateway, useValue: gateway },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAndSend', () => {
    it('should create notification in DB and send via gateway', async () => {
      const mockNotif = {
        id: 'notif-1',
        userId: 'user-1',
        type: NotificationType.REPAIR_STATUS_UPDATED,
        title: 'Status Updated',
        body: 'In progress',
        data: {},
        createdAt: new Date(),
      };
      prisma.notification.create.mockResolvedValue(mockNotif);

      const result = await service.createAndSend({
        userId: 'user-1',
        type: NotificationType.REPAIR_STATUS_UPDATED,
        title: 'Status Updated',
        body: 'In progress',
      });

      expect(result).toEqual(mockNotif);
      expect(prisma.notification.create).toHaveBeenCalled();
      expect(gateway.sendToUser).toHaveBeenCalledWith('user-1', expect.objectContaining({
        id: 'notif-1',
        title: 'Status Updated',
      }));
    });
  });

  describe('broadcastToAdmins', () => {
    it('should send notification to admins gateway', () => {
      service.broadcastToAdmins({
        type: NotificationType.NEW_REPAIR_REQUEST,
        title: 'New request',
        body: 'Body text',
      });

      expect(gateway.sendToAdmins).toHaveBeenCalledWith(
        expect.objectContaining({
          type: NotificationType.NEW_REPAIR_REQUEST,
          title: 'New request',
        }),
      );
    });
  });

  describe('broadcastToTechnician', () => {
    it('should send notification to technician gateway', () => {
      service.broadcastToTechnician('tech-1', {
        type: NotificationType.TECHNICIAN_ASSIGNED,
        title: 'Assigned',
        body: 'Assigned to ticket',
      });

      expect(gateway.sentToTechnician).toHaveBeenCalledWith(
        'tech-1',
        expect.objectContaining({
          type: NotificationType.TECHNICIAN_ASSIGNED,
          title: 'Assigned',
        }),
      );
    });
  });

  describe('listNotifications', () => {
    it('should query notifications with pagination', async () => {
      prisma.notification.count.mockResolvedValue(10);
      prisma.notification.findMany.mockResolvedValue([{ id: 'n1' }]);

      const result = await service.listNotifications('user-1', {
        page: 1,
        limit: 10,
        unreadOnly: true,
      });

      expect(result.items).toHaveLength(1);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 10,
        totalPages: 1,
      });
      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', readAt: null },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });
    });

    it('should use default page and limit when not provided', async () => {
      prisma.notification.count.mockResolvedValue(0);
      prisma.notification.findMany.mockResolvedValue([]);

      const result = await service.listNotifications('user-1', {});
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(20);
      expect(result.pagination.totalPages).toBe(1);
    });
  });

  describe('markAsRead', () => {
    it('should mark single notification as read', async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 1 });
      const result = await service.markAsRead('user-1', 'n-1');
      expect(result).toEqual({ count: 1 });
      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { id: 'n-1', userId: 'user-1' },
        data: { readAt: expect.any(Date) },
      });
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read', async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 4 });
      const result = await service.markAllAsRead('user-1');
      expect(result).toEqual({ count: 4 });
      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', readAt: null },
        data: { readAt: expect.any(Date) },
      });
    });
  });

  describe('getUnreadCount', () => {
    it('should count unread notifications', async () => {
      prisma.notification.count.mockResolvedValue(3);
      const count = await service.getUnreadCount('user-1');
      expect(count).toBe(3);
      expect(prisma.notification.count).toHaveBeenCalledWith({
        where: { userId: 'user-1', readAt: null },
      });
    });
  });
});
