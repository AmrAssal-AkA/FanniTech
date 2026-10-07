import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { vi, describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';

import { AuthenticationModule } from '../src/authentication/authentication.module.js';
import { AuthenticationService } from '../src/authentication/authentication.service.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { ConfigModule } from '@nestjs/config';

// ─── Shared mock values ────────────────────────────────────────────────────────

const mockTokens = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
};

const mockPublicUser = {
  id: 'user-id-1',
  email: 'test@example.com',
  name: 'Test User',
  phone: null,
  role: 'CUSTOMER',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ─── Mock AuthenticationService ────────────────────────────────────────────────

const mockAuthService = {
  registerUser: vi.fn(),
  loginUser: vi.fn(),
  refreshTokens: vi.fn(),
  logout: vi.fn(),
};

// ─── E2E Suite ─────────────────────────────────────────────────────────────────

describe('Authentication (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        AuthenticationModule,
      ],
    })
      .overrideProvider(AuthenticationService)
      .useValue(mockAuthService)
      // Prevent Prisma from connecting to a real DB
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── POST /api/v1/auth/mobile/register ────────────────────────────────────

  describe('POST /api/v1/auth/mobile/register', () => {
    const validBody = {
      email: 'newuser@example.com',
      name: 'New User',
      password: 'Password1',
      phone: '+201012345678',
    };

    it('201 — should register a new user and return tokens', async () => {
      mockAuthService.registerUser.mockResolvedValue({
        user: mockPublicUser,
        ...mockTokens,
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/mobile/register')
        .send(validBody)
        .expect(HttpStatus.CREATED);

      expect(res.body).toMatchObject({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: expect.objectContaining({ email: mockPublicUser.email }),
      });
      expect(mockAuthService.registerUser).toHaveBeenCalledOnce();
    });

    it('201 — should not expose password in response', async () => {
      mockAuthService.registerUser.mockResolvedValue({
        user: mockPublicUser,
        ...mockTokens,
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/mobile/register')
        .send(validBody)
        .expect(HttpStatus.CREATED);

      expect(res.body.user).not.toHaveProperty('password');
    });

    it('409 — should return conflict when email already exists', async () => {
      const { ConflictException } = await import('@nestjs/common');
      mockAuthService.registerUser.mockRejectedValue(
        new ConflictException('Email already exists'),
      );

      await request(app.getHttpServer())
        .post('/api/v1/auth/mobile/register')
        .send(validBody)
        .expect(HttpStatus.CONFLICT);
    });
  });

  // ─── POST /api/v1/auth/mobile/login ───────────────────────────────────────

  describe('POST /api/v1/auth/mobile/login', () => {
    const validBody = {
      email: 'test@example.com',
      password: 'Password1',
    };

    it('200 — should login and set cookies', async () => {
      mockAuthService.loginUser.mockResolvedValue({
        user: mockPublicUser,
        ...mockTokens,
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/mobile/login')
        .send(validBody)
        .expect(HttpStatus.OK);

      // Cookies should be set in the response
      const cookies = res.headers['set-cookie'] as unknown as string[];
      expect(cookies).toBeDefined();
      const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : cookies;
      expect(cookieStr).toContain('x-access-token');
      expect(cookieStr).toContain('x-refresh-token');
    });

    it('200 — cookies should be HttpOnly', async () => {
      mockAuthService.loginUser.mockResolvedValue({
        user: mockPublicUser,
        ...mockTokens,
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/mobile/login')
        .send(validBody)
        .expect(HttpStatus.OK);

      const cookies = res.headers['set-cookie'] as unknown as string[];
      const cookieStr = Array.isArray(cookies) ? cookies.join(' ') : cookies;
      expect(cookieStr.toLowerCase()).toContain('httponly');
    });

    it('500 — should return 500 when service throws', async () => {
      mockAuthService.loginUser.mockRejectedValue(new Error('DB error'));

      await request(app.getHttpServer())
        .post('/api/v1/auth/mobile/login')
        .send(validBody)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  // ─── POST /api/v1/auth/mobile/refresh ─────────────────────────────────────

  describe('POST /api/v1/auth/mobile/refresh', () => {
    it('200 — should rotate tokens and set new cookies', async () => {
      mockAuthService.refreshTokens.mockResolvedValue({
        user: mockPublicUser,
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/mobile/refresh')
        .send({ refreshToken: 'old-refresh-token' })
        .expect(HttpStatus.OK);

      const cookies = res.headers['set-cookie'] as unknown as string[];
      expect(cookies).toBeDefined();
      const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : cookies;
      expect(cookieStr).toContain('x-access-token');
      expect(cookieStr).toContain('x-refresh-token');
    });

    it('500 — should return 500 when refresh fails', async () => {
      mockAuthService.refreshTokens.mockRejectedValue(new Error('invalid token'));

      await request(app.getHttpServer())
        .post('/api/v1/auth/mobile/refresh')
        .send({ refreshToken: 'bad-token' })
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  // ─── POST /api/v1/auth/mobile/logout ──────────────────────────────────────

  describe('POST /api/v1/auth/mobile/logout', () => {
    it('200 — should logout successfully with a refresh token', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .post('/api/v1/auth/mobile/logout')
        .send({ refreshToken: 'some-refresh-token' })
        .expect(HttpStatus.OK);

      expect(mockAuthService.logout).toHaveBeenCalledWith('some-refresh-token');
    });

    it('200 — should respond 200 even without a refresh token body', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/mobile/logout')
        .send({})
        .expect(HttpStatus.OK);

      // Service should not be called when no token is provided
      expect(mockAuthService.logout).not.toHaveBeenCalled();
    });
  });
});
