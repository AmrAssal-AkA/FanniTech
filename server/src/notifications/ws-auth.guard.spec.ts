import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthenticatedSocket, WsAuthGuard } from './ws-auth.guard.js';

describe('WsAuthGuard', () => {
  let guard: WsAuthGuard;
  let jwtService: { verify: any };
  let configService: { getOrThrow: any };

  beforeEach(() => {
    jwtService = {
      verify: vi.fn(),
    };
    configService = {
      getOrThrow: vi.fn().mockReturnValue('test-secret'),
    };
    guard = new WsAuthGuard(
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
    );
  });

  const createMockSocket = (
    auth?: { token?: string },
    headers?: { authorization?: string },
  ): AuthenticatedSocket => {
    return {
      handshake: {
        auth: auth ?? {},
        headers: headers ?? {},
      },
      data: {},
    } as unknown as AuthenticatedSocket;
  };

  const createMockContext = (client: AuthenticatedSocket): ExecutionContext => {
    return {
      switchToWs: () => ({
        getClient: () => client,
      }),
    } as unknown as ExecutionContext;
  };

  describe('getToken', () => {
    it('should extract token from handshake auth', () => {
      const client = createMockSocket({ token: 'auth-token' });
      expect(guard.getToken(client as any)).toBe('auth-token');
    });

    it('should extract token from handshake headers authorization', () => {
      const client = createMockSocket({}, { authorization: 'Bearer header-token' });
      expect(guard.getToken(client as any)).toBe('header-token');
    });

    it('should return undefined if no token provided', () => {
      const client = createMockSocket({}, {});
      expect(guard.getToken(client as any)).toBeUndefined();
    });
  });

  describe('canActivate', () => {
    it('should authenticate valid token and set user on socket data', () => {
      const client = createMockSocket({ token: 'valid-token' });
      jwtService.verify.mockReturnValue({ sub: 'user-1', role: 'CUSTOMER' });

      const ctx = createMockContext(client);
      const result = guard.canActivate(ctx);

      expect(result).toBe(true);
      expect(client.data.user).toEqual({ id: 'user-1', role: 'CUSTOMER' });
    });

    it('should throw WsException when token is missing', () => {
      const client = createMockSocket();
      const ctx = createMockContext(client);

      expect(() => guard.canActivate(ctx)).toThrow(WsException);
    });

    it('should throw WsException when token verification fails', () => {
      const client = createMockSocket({ token: 'invalid-token' });
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const ctx = createMockContext(client);
      expect(() => guard.canActivate(ctx)).toThrow(WsException);
    });
  });
});

