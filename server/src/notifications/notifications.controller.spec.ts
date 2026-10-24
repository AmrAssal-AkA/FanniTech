import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller.js';
import { NotificationsService } from './notifications.service.js';
import { AuthenticationGuard } from '../authentication/authentication.guard.js';
import { JwtService } from '@nestjs/jwt';
import { describe, expect, it, vi, beforeEach } from 'vitest';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let notificationsService: {
    listNotifications: any;
    getUnreadCount: any;
    markAsRead: any;
    markAllAsRead: any;
  };

  beforeEach(async () => {
    notificationsService = {
      listNotifications: vi.fn(),
      getUnreadCount: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: notificationsService,
        },
        { provide: AuthenticationGuard, useValue: { canActivate: () => true } },
        { provide: JwtService, useValue: {} },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should list notifications', async () => {
    const mockResult = { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } };
    notificationsService.listNotifications.mockResolvedValue(mockResult);

    const result = await controller.list('u-1', { page: '1', limit: '20' });
    expect(result).toEqual(mockResult);
    expect(notificationsService.listNotifications).toHaveBeenCalledWith('u-1', {
      page: 1,
      limit: 20,
    });
  });

  it('should get unread notification count', async () => {
    notificationsService.getUnreadCount.mockResolvedValue(5);

    const result = await controller.unreadCount('u-1');
    expect(result).toEqual({ data: { count: 5 } });
    expect(notificationsService.getUnreadCount).toHaveBeenCalledWith('u-1');
  });

  it('should mark a notification as read', async () => {
    notificationsService.markAsRead.mockResolvedValue({ count: 1 });

    const result = await controller.markRead('u-1', '123e4567-e89b-12d3-a456-426614174000');
    expect(result).toEqual({ count: 1 });
    expect(notificationsService.markAsRead).toHaveBeenCalledWith('u-1', '123e4567-e89b-12d3-a456-426614174000');
  });

  it('should mark all notifications as read', async () => {
    notificationsService.markAllAsRead.mockResolvedValue({ count: 3 });

    const result = await controller.markAllRead('u-1');
    expect(result).toEqual({ count: 3 });
    expect(notificationsService.markAllAsRead).toHaveBeenCalledWith('u-1');
  });
});
