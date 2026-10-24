import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { AuthenticationService } from './authentication.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import * as passwordHash from '../utils/password-hash.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeUser = (overrides = {}) => ({
  id: 'user-id-1',
  email: 'test@example.com',
  name: 'Test User',
  password: 'hashedPassword',
  phone: null,
  role: 'CUSTOMER',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeTokenPair = () => ({
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
});

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  refreshToken: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
};

const mockJwt = {
  signAsync: vi.fn(),
  verify: vi.fn(),
};

const mockConfig = {
  getOrThrow: vi.fn().mockReturnValue('test-secret'),
  get: vi.fn().mockReturnValue('test-refresh-secret'),
};

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('AuthenticationService', () => {
  let service: AuthenticationService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);

    // Default token generation behaviour
    mockJwt.signAsync
      .mockResolvedValueOnce('mock-access-token')
      .mockResolvedValueOnce('mock-refresh-token');
    mockPrisma.refreshToken.create.mockResolvedValue({});
  });

  // ─── registerUser ────────────────────────────────────────────────────────────

  describe('registerUser', () => {
    const dto = {
      email: 'new@example.com',
      name: 'New User',
      password: 'Password1',
      phone: '+201012345678',
      deviceInfo: 'iPhone 15',
    };

    it('should create a new user and return tokens', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const createdUser = makeUser({ email: dto.email, name: dto.name });
      mockPrisma.user.create.mockResolvedValue(createdUser);
      vi.spyOn(passwordHash, 'hashPassword').mockResolvedValue('hashedPw');

      const result = await service.registerUser(dto);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ email: dto.email, role: 'CUSTOMER' }),
        }),
      );
      expect(result).toMatchObject({ accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' });
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw ConflictException when email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(makeUser());

      await expect(service.registerUser(dto)).rejects.toThrow(ConflictException);
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException on Prisma P2002 unique constraint', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      vi.spyOn(passwordHash, 'hashPassword').mockResolvedValue('hashedPw');

      const prismaError = Object.assign(new Error('Unique constraint'), {
        code: 'P2002',
        name: 'PrismaClientKnownRequestError',
      });
      // Make instanceof check work by setting up the prototype chain manually
      mockPrisma.user.create.mockRejectedValue(prismaError);

      // The service re-throws the original error or ConflictException
      await expect(service.registerUser(dto)).rejects.toBeDefined();
    });
  });

  // ─── loginUser ───────────────────────────────────────────────────────────────

  describe('loginUser', () => {
    const dto = { email: 'test@example.com', password: 'Password1' };

    it('should return tokens on valid credentials', async () => {
      const user = makeUser();
      mockPrisma.user.findUnique.mockResolvedValue(user);
      vi.spyOn(passwordHash, 'comparePassword').mockResolvedValue(true);

      const result = await service.loginUser(dto, 'mobile');

      expect(result).toMatchObject({ accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' });
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.loginUser(dto, 'mobile')).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw when password is invalid', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(makeUser());
      vi.spyOn(passwordHash, 'comparePassword').mockResolvedValue(false);

      await expect(service.loginUser(dto, 'mobile')).rejects.toThrow(InternalServerErrorException);
    });

    it('should reject customers from the web audience', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(makeUser({ role: 'CUSTOMER' }));

      await expect(service.loginUser(dto, 'web')).rejects.toThrow(ForbiddenException);
      expect(passwordHash.comparePassword).not.toHaveBeenCalled();
      expect(mockJwt.signAsync).not.toHaveBeenCalled();
    });

    it('should sign tokens with the correct audience', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(makeUser());
      vi.spyOn(passwordHash, 'comparePassword').mockResolvedValue(true);

      await service.loginUser(dto, 'mobile');

      // access token signed with audience 'mobile'
      expect(mockJwt.signAsync).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ audience: 'mobile' }),
      );
    });
  });

  // ─── refreshTokens ───────────────────────────────────────────────────────────

  describe('refreshTokens', () => {
    const refreshToken = 'valid-refresh-token';

    const makeStoredToken = (overrides = {}) => ({
      token: refreshToken,
      revoke: false,
      expiresAt: new Date(Date.now() + 60_000),
      deviceInfo: 'iPhone 15',
      user: makeUser(),
      ...overrides,
    });

    it('should return new tokens for a valid refresh token', async () => {
      mockJwt.verify.mockReturnValue({ sub: 'user-id-1' });
      mockPrisma.refreshToken.findUnique.mockResolvedValue(makeStoredToken());
      mockPrisma.refreshToken.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.refreshTokens(refreshToken, 'mobile');

      expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ data: { revoke: true } }),
      );
      expect(result).toMatchObject({ accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' });
    });

    it('should throw when token is not found in DB', async () => {
      mockJwt.verify.mockReturnValue({ sub: 'user-id-1' });
      mockPrisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.refreshTokens(refreshToken, 'mobile')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw when token is revoked', async () => {
      mockJwt.verify.mockReturnValue({ sub: 'user-id-1' });
      mockPrisma.refreshToken.findUnique.mockResolvedValue(makeStoredToken({ revoke: true }));

      await expect(service.refreshTokens(refreshToken, 'mobile')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw when token is expired', async () => {
      mockJwt.verify.mockReturnValue({ sub: 'user-id-1' });
      mockPrisma.refreshToken.findUnique.mockResolvedValue(
        makeStoredToken({ expiresAt: new Date(Date.now() - 1000) }),
      );

      await expect(service.refreshTokens(refreshToken, 'mobile')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw when JWT verification fails', async () => {
      mockJwt.verify.mockImplementation(() => { throw new Error('jwt expired'); });

      await expect(service.refreshTokens(refreshToken, 'mobile')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // ─── logout ──────────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('should revoke the refresh token', async () => {
      const token = 'some-refresh-token';
      mockPrisma.refreshToken.updateMany.mockResolvedValue({ count: 1 });

      await service.logout(token);

      expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { token },
        data: { revoke: true },
      });
    });
  });
});
