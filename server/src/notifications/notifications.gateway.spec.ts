import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsGateway } from './notifications.gateway.js';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsAuthGuard } from './ws-auth.guard.js';

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsGateway,
        { provide: JwtService, useValue: {} },
        { provide: ConfigService, useValue: {} },
        { provide: WsAuthGuard, useValue: {} },
      ],
    }).compile();

    gateway = module.get<NotificationsGateway>(NotificationsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('isUserConnected', () => {
    it('returns true when user room exists and has connected sockets', () => {
      gateway.server = {
        sockets: {
          adapter: {
            rooms: new Map([['user-user-123', new Set(['socket-1'])]]),
          },
        },
      } as never;

      expect(gateway.isUserConnected('user-123')).toBe(true);
    });

    it('returns false when user room does not exist', () => {
      gateway.server = {
        sockets: {
          adapter: {
            rooms: new Map(),
          },
        },
      } as never;

      expect(gateway.isUserConnected('user-unknown')).toBe(false);
    });
  });
});
