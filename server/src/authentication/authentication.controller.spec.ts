import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { AuthenticationController } from './authentication.controller.js';
import { AuthenticationService } from './authentication.service.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeTokenPair = () => ({
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  user: { id: 'user-id-1', email: 'test@example.com', name: 'Test User', role: 'CUSTOMER' },
});

const makeRes = () => ({
  cookie: vi.fn(),
});

// ─── Mock service ─────────────────────────────────────────────────────────────

const mockAuthService = {
  registerUser: vi.fn(),
  loginUser: vi.fn(),
  refreshTokens: vi.fn(),
  logout: vi.fn(),
};

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('AuthenticationController', () => {
  let controller: AuthenticationController;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [{ provide: AuthenticationService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthenticationController>(AuthenticationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ─── POST mobile/register ──────────────────────────────────────────────────

  describe('registerUser', () => {
    const dto = {
      email: 'new@example.com',
      name: 'New User',
      password: 'Password1',
    };

    it('should call service.registerUser and return result', async () => {
      const expected = makeTokenPair();
      mockAuthService.registerUser.mockResolvedValue(expected);
      const res = makeRes();

      const result = await controller.registerUser(dto as any, res as any);

      expect(mockAuthService.registerUser).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  // ─── POST mobile/login ─────────────────────────────────────────────────────

  describe('loginUser', () => {
    const dto = { email: 'test@example.com', password: 'Password1' };

    it('should set mobile cookies and return the token pair when login succeeds', async () => {
      const expected = makeTokenPair();
      mockAuthService.loginUser.mockResolvedValue(expected);
      const res = makeRes();

      const result = await controller.loginUser(dto as any, res as any);

      expect(mockAuthService.loginUser).toHaveBeenCalledWith(dto, 'mobile');
      expect(result).toEqual(expected);
      expect(res.cookie).toHaveBeenCalledTimes(2);
      expect(res.cookie).toHaveBeenCalledWith('x-access-token', 'mock-access-token', expect.any(Object));
      expect(res.cookie).toHaveBeenCalledWith('x-refresh-token', 'mock-refresh-token', expect.any(Object));
      for (const call of (res.cookie as ReturnType<typeof vi.fn>).mock.calls) {
        expect(call[2]).not.toHaveProperty('path');
      }
    });

    it('should set httpOnly and secure flags on both cookies', async () => {
      mockAuthService.loginUser.mockResolvedValue(makeTokenPair());
      const res = makeRes();

      await controller.loginUser(dto as any, res as any);

      for (const call of (res.cookie as ReturnType<typeof vi.fn>).mock.calls) {
        expect(call[2]).toMatchObject({ httpOnly: true, secure: true, sameSite: 'strict' });
      }
    });

    it('should throw HttpException when service throws', async () => {
      mockAuthService.loginUser.mockRejectedValue(new Error('DB down'));
      const res = makeRes();

      await expect(controller.loginUser(dto as any, res as any)).rejects.toThrow(
        new HttpException('Failed to login user', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });

    it('should preserve ForbiddenException from the service', async () => {
      mockAuthService.loginUser.mockRejectedValue(new ForbiddenException('forbidden'));
      const res = makeRes();

      await expect(controller.loginUser(dto as any, res as any)).rejects.toThrow(ForbiddenException);
      expect(res.cookie).not.toHaveBeenCalled();
    });

    it('should preserve BadRequestException from the service', async () => {
      mockAuthService.loginUser.mockRejectedValue(new BadRequestException('invalid request'));
      const res = makeRes();

      await expect(controller.loginUser(dto as any, res as any)).rejects.toThrow(BadRequestException);
      expect(res.cookie).not.toHaveBeenCalled();
    });
  });

  // ─── POST web/login ────────────────────────────────────────────────────────

  describe('loginWebUser', () => {
    const dto = { email: 'staff@example.com', password: 'Password1' };

    it('should authenticate as web and set web cookies', async () => {
      const expected = makeTokenPair();
      mockAuthService.loginUser.mockResolvedValue(expected);
      const res = makeRes();

      const result = await controller.loginWebUser(dto as any, res as any);

      expect(mockAuthService.loginUser).toHaveBeenCalledWith(dto, 'web');
      expect(result).toEqual(expected);
      expect(res.cookie).toHaveBeenCalledWith(
        'x-access-token',
        expected.accessToken,
        expect.objectContaining({ httpOnly: true, secure: true, sameSite: 'strict' }),
      );
      expect(res.cookie).toHaveBeenCalledWith(
        'x-refresh-token',
        expected.refreshToken,
        expect.objectContaining({ httpOnly: true, secure: true, sameSite: 'strict' }),
      );
      for (const call of (res.cookie as ReturnType<typeof vi.fn>).mock.calls) {
        expect(call[2]).not.toHaveProperty('path');
      }
    });

    it('should preserve the customer audience restriction', async () => {
      mockAuthService.loginUser.mockRejectedValue(
        new ForbiddenException('Customers can only log in from mobile App'),
      );
      const res = makeRes();

      await expect(controller.loginWebUser(dto as any, res as any)).rejects.toThrow(ForbiddenException);
      expect(res.cookie).not.toHaveBeenCalled();
    });

    it('should translate unexpected service errors to HttpException', async () => {
      mockAuthService.loginUser.mockRejectedValue(new Error('DB down'));
      const res = makeRes();

      await expect(controller.loginWebUser(dto as any, res as any)).rejects.toThrow(
        new HttpException('Failed to login user', HttpStatus.INTERNAL_SERVER_ERROR),
      );
      expect(res.cookie).not.toHaveBeenCalled();
    });
  });

  // ─── POST mobile/refresh ───────────────────────────────────────────────────

  describe('refreshTokens', () => {
    const refreshToken = 'valid-refresh-token';

    it('should set new cookies on success', async () => {
      mockAuthService.refreshTokens.mockResolvedValue(makeTokenPair());
      const res = makeRes();

      await controller.refreshTokens(refreshToken, res as any);

      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(refreshToken, 'mobile');
      expect(res.cookie).toHaveBeenCalledTimes(2);
    });

    it('should pass the web service to token refresh', async () => {
      mockAuthService.refreshTokens.mockResolvedValue(makeTokenPair());
      const res = makeRes();

      await controller.refreshTokens(refreshToken, res as any, 'web');

      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(refreshToken, 'web');
      expect(res.cookie).toHaveBeenCalledWith(
        'x-refresh-token',
        'mock-refresh-token',
        expect.objectContaining({ path: '/api/v1/auth/web' }),
      );
    });

    it('should reject an unsupported service before calling the service', async () => {
      const res = makeRes();

      await expect(controller.refreshTokens(refreshToken, res as any, 'desktop' as any)).rejects.toThrow(
        new BadRequestException('Service must be either mobile or web'),
      );
      expect(mockAuthService.refreshTokens).not.toHaveBeenCalled();
      expect(res.cookie).not.toHaveBeenCalled();
    });

    it('should preserve ForbiddenException from the service', async () => {
      mockAuthService.refreshTokens.mockRejectedValue(new ForbiddenException('forbidden'));
      const res = makeRes();

      await expect(controller.refreshTokens(refreshToken, res as any)).rejects.toThrow(ForbiddenException);
      expect(res.cookie).not.toHaveBeenCalled();
    });

    it('should throw HttpException when token refresh fails', async () => {
      mockAuthService.refreshTokens.mockRejectedValue(new Error('invalid'));
      const res = makeRes();

      await expect(controller.refreshTokens(refreshToken, res as any)).rejects.toThrow(
        new HttpException('Failed to refresh tokens', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });

  // ─── POST mobile/logout ────────────────────────────────────────────────────

  describe('logout', () => {
    it('should call service.logout when refreshToken is provided', async () => {
      const token = 'some-refresh-token';
      mockAuthService.logout.mockResolvedValue(undefined);

      await controller.logout(token);

      expect(mockAuthService.logout).toHaveBeenCalledWith(token);
    });

    it('should NOT call service.logout when refreshToken is absent', async () => {
      await controller.logout(undefined as any);

      expect(mockAuthService.logout).not.toHaveBeenCalled();
    });
  });
});
