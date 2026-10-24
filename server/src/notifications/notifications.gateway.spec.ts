import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsGateway } from './notifications.gateway.js';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsAuthGuard } from './ws-auth.guard.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;
  let jwtService: { verify: any };
  let configService: { getOrThrow: any };
  let wsAuthGuard: { getToken: any };
  let mockServer: {
    to: any;
    sockets: any;
  };

  beforeEach(async () => {
    jwtService = {
      verify: vi.fn(),
    };
    configService = {
      getOrThrow: vi.fn().mockReturnValue('access-token-secret'),
    };
    wsAuthGuard = {
      getToken: vi.fn(),
    };

    const mockEmit = vi.fn();
    mockServer = {
      to: vi.fn().mockReturnValue({ emit: mockEmit }),
      sockets: {
        adapter: {
          rooms: new Map(),
        },
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsGateway,
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        { provide: WsAuthGuard, useValue: wsAuthGuard },
      ],
    }).compile();

    gateway = module.get<NotificationsGateway>(NotificationsGateway);
    gateway.server = mockServer as any;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should initialize afterInit', () => {
    expect(() => gateway.afterInit()).not.toThrow();
  });

  describe('handleConnection', () => {
    it('should authenticate client and join customer room', () => {
      const mockClient = {
        data: {},
        join: vi.fn(),
        disconnect: vi.fn(),
      };
      wsAuthGuard.getToken.mockReturnValue('valid-token');
      jwtService.verify.mockReturnValue({ sub: 'user-1', role: 'CUSTOMER' });

      gateway.handleConnection(mockClient as any);

      expect(mockClient.join).toHaveBeenCalledWith('user-user-1');
      expect(mockClient.join).not.toHaveBeenCalledWith('admins');
      expect(mockClient.disconnect).not.toHaveBeenCalled();
    });

    it('should authenticate staff client and join admins room', () => {
      const mockClient = {
        data: {},
        join: vi.fn(),
        disconnect: vi.fn(),
      };
      wsAuthGuard.getToken.mockReturnValue('valid-token');
      jwtService.verify.mockReturnValue({ sub: 'admin-1', role: 'ADMIN' });

      gateway.handleConnection(mockClient as any);

      expect(mockClient.join).toHaveBeenCalledWith('user-admin-1');
      expect(mockClient.join).toHaveBeenCalledWith('admins');
    });

    it('should disconnect client if authentication fails', () => {
      const mockClient = {
        data: {},
        join: vi.fn(),
        disconnect: vi.fn(),
      };
      wsAuthGuard.getToken.mockReturnValue(undefined);

      gateway.handleConnection(mockClient as any);

      expect(mockClient.disconnect).toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should handle client disconnect gracefully', () => {
      const mockClient = {
        data: { user: { id: 'user-1', role: 'CUSTOMER' } },
      };
      expect(() => gateway.handleDisconnect(mockClient as any)).not.toThrow();
    });

    it('should handle unauthenticated client disconnect gracefully', () => {
      const mockClient = { data: {} };
      expect(() => gateway.handleDisconnect(mockClient as any)).not.toThrow();
    });
  });

  describe('sending notifications', () => {
    it('sendToUser should emit to user room', () => {
      gateway.sendToUser('u-1', { msg: 'hello' });
      expect(mockServer.to).toHaveBeenCalledWith('user-u-1');
    });

    it('sendToAdmins should emit to admins room', () => {
      gateway.sendToAdmins({ msg: 'hello admins' });
      expect(mockServer.to).toHaveBeenCalledWith('admins');
    });

    it('sentToTechnician should emit to technician room', () => {
      gateway.sentToTechnician('tech-1', { msg: 'hello tech' });
      expect(mockServer.to).toHaveBeenCalledWith('user-tech-1');
    });

    it('handleMarkRead should return acknowledgement', () => {
      const ack = gateway.handleMarkRead({} as any, 'n-1');
      expect(ack).toEqual({
        event: 'notification:markRead:ack',
        data: { notificationId: 'n-1' },
      });
    });
  });

  describe('isUserConnected', () => {
    it('returns true when user room exists and has connected sockets', () => {
      mockServer.sockets.adapter.rooms = new Map([['user-user-123', new Set(['socket-1'])]]);
      expect(gateway.isUserConnected('user-123')).toBe(true);
    });

    it('returns false when user room does not exist', () => {
      expect(gateway.isUserConnected('user-unknown')).toBe(false);
    });
  });
});
