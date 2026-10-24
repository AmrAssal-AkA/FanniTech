import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  HttpStatus,
  INestApplication,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import cookieParser from 'cookie-parser';
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
  me: vi.fn(),
};

const mockJwtService = {
  verify: vi.fn(),
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
      .overrideProvider(JwtService)
      .useValue(mockJwtService)
      // Prevent Prisma from connecting to a real DB
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useLogger(false);
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
      mockAuthService.registerUser.mockRejectedValue(
        new ConflictException('Email already exists'),
      );

      await request(app.getHttpServer())
        .post('/api/v1/auth/mobile/register')
        .send(validBody)
        .expect(HttpStatus.CONFLICT);
    });

    it('400 — should reject an invalid registration body', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/mobile/register')
        .send({ email: 'not-an-email', name: 'A', password: 'short' })
        .expect(HttpStatus.BAD_REQUEST);

      expect(mockAuthService.registerUser).not.toHaveBeenCalled();
    });

    it('500 — should return 500 when registration fails unexpectedly', async () => {
      mockAuthService.registerUser.mockRejectedValue(new Error('DB error'));

      await request(app.getHttpServer())
        .post('/api/v1/auth/mobile/register')
        .send(validBody)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
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

    it('400 — should reject an invalid login body', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/mobile/login')
        .send({ email: 'not-an-email', password: 'short' })
        .expect(HttpStatus.BAD_REQUEST);

      expect(mockAuthService.loginUser).not.toHaveBeenCalled();
    });

    it('403 — should preserve the customer audience restriction', async () => {
      mockAuthService.loginUser.mockRejectedValue(
        new ForbiddenException('Customers can only log in from mobile App'),
      );

      await request(app.getHttpServer())
        .post('/api/v1/auth/mobile/login')
        .send(validBody)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  // ─── POST /api/v1/auth/web/login ─────────────────────────────────────────

  describe('POST /api/v1/auth/web/login', () => {
    const validBody = {
      email: 'staff@example.com',
      password: 'Password1',
    };

    it('200 — should login as web user and set cookies', async () => {
      mockAuthService.loginUser.mockResolvedValue({
        user: mockPublicUser,
        ...mockTokens,
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/web/login')
        .send(validBody)
        .expect(HttpStatus.OK);

      expect(mockAuthService.loginUser).toHaveBeenCalledWith(validBody, 'web');
      expect(res.body).toMatchObject(mockTokens);
      const cookies = res.headers['set-cookie'] as unknown as string[];
      const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : cookies;
      expect(cookieStr).toContain('x-access-token');
      expect(cookieStr).toContain('x-refresh-token');
      expect(cookieStr.toLowerCase()).toContain('httponly');
    });

    it('400 — should reject an invalid web login body', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/web/login')
        .send({ email: 'invalid', password: 'short' })
        .expect(HttpStatus.BAD_REQUEST);

      expect(mockAuthService.loginUser).not.toHaveBeenCalled();
    });

    it('403 — should preserve the customer audience restriction', async () => {
      mockAuthService.loginUser.mockRejectedValue(
        new ForbiddenException('Customers can only log in from mobile App'),
      );

      await request(app.getHttpServer())
        .post('/api/v1/auth/web/login')
        .send(validBody)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('500 — should translate unexpected service errors', async () => {
      mockAuthService.loginUser.mockRejectedValue(new Error('DB error'));

      await request(app.getHttpServer())
        .post('/api/v1/auth/web/login')
        .send(validBody)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  // ─── POST /api/v1/auth/refresh ─────────────────────────────────────

  describe('POST /api/v1/auth/refresh', () => {
    it('200 — should rotate tokens and set new cookies', async () => {
      mockAuthService.refreshTokens.mockResolvedValue({
        user: mockPublicUser,
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'old-refresh-token' })
        .expect(HttpStatus.OK);

      const cookies = res.headers['set-cookie'] as unknown as string[];
      expect(cookies).toBeDefined();
      const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : cookies;
      expect(cookieStr).toContain('x-access-token');
      expect(cookieStr).toContain('x-refresh-token');
    });

    it('401 — should reject an invalid or expired refresh token', async () => {
      mockAuthService.refreshTokens.mockRejectedValue(
        new UnauthorizedException('Refresh token is invalid or expired'),
      );

      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'expired-refresh-token' })
        .expect(HttpStatus.UNAUTHORIZED);

      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(
        'expired-refresh-token',
        'mobile',
      );
    });

    it('200 — should pass the web service and scope web cookies', async () => {
      mockAuthService.refreshTokens.mockResolvedValue({
        ...mockTokens,
        accessToken: 'new-web-access-token',
        refreshToken: 'new-web-refresh-token',
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'web-refresh-token', service: 'web' })
        .expect(HttpStatus.OK);

      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(
        'web-refresh-token',
        'web',
      );
      const cookies = res.headers['set-cookie'] as unknown as string[];
      const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : cookies;
      expect(cookieStr).toContain('Path=/api/v1/auth/web');
    });

    it('500 — should return 500 when refresh fails', async () => {
      mockAuthService.refreshTokens.mockRejectedValue(new Error('invalid token'));

      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'bad-token' })
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('400 — should reject an unsupported service', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'token', service: 'desktop' })
        .expect(HttpStatus.BAD_REQUEST);

      expect(mockAuthService.refreshTokens).not.toHaveBeenCalled();
    });
  });

  // ─── POST /api/v1/auth/logout ──────────────────────────────────────

  describe('POST /api/v1/auth/logout', () => {
    it('200 — should logout successfully with a refresh token', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .send({ refreshToken: 'some-refresh-token' })
        .expect(HttpStatus.OK);

      expect(mockAuthService.logout).toHaveBeenCalledWith('some-refresh-token');
    });

    it('200 — should respond 200 even without a refresh token body', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .send({})
        .expect(HttpStatus.OK);

      // Service should not be called when no token is provided
      expect(mockAuthService.logout).not.toHaveBeenCalled();
    });
  });

  // ─── GET /api/v1/auth/me ──────────────────────────────────────────────────

  describe('GET /api/v1/auth/me', () => {
    it('200 — should return the authenticated user from a bearer token', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 'user-id-1', role: 'CUSTOMER' });
      mockAuthService.me.mockResolvedValue(mockPublicUser);

      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer mobile-access-token')
        .expect(HttpStatus.OK);

      expect(mockJwtService.verify).toHaveBeenCalledWith(
        'mobile-access-token',
        { audience: 'mobile' },
      );
      expect(mockAuthService.me).toHaveBeenCalledWith('user-id-1');
      expect(res.body).toMatchObject({ id: mockPublicUser.id });
    });

    it('200 — should authenticate from a web access-token cookie', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 'user-id-1', role: 'STAFF' });
      mockAuthService.me.mockResolvedValue(mockPublicUser);

      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Cookie', 'x-access-token=web-access-token')
        .expect(HttpStatus.OK);

      expect(mockJwtService.verify).toHaveBeenCalledWith(
        'web-access-token',
        { audience: 'web' },
      );
    });

    it('401 — should reject a request without an access token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .expect(HttpStatus.UNAUTHORIZED);

      expect(mockAuthService.me).not.toHaveBeenCalled();
    });

    it('401 — should reject an invalid access token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer expired-token')
        .expect(HttpStatus.UNAUTHORIZED);

      expect(mockAuthService.me).not.toHaveBeenCalled();
    });

    it('400 — should reject a token without a subject', async () => {
      mockJwtService.verify.mockReturnValue({ role: 'CUSTOMER' });

      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer token-without-sub')
        .expect(HttpStatus.BAD_REQUEST);

      expect(mockAuthService.me).not.toHaveBeenCalled();
    });

    it('500 — should return 500 when loading the current user fails', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 'user-id-1' });
      mockAuthService.me.mockRejectedValue(new Error('DB error'));

      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer valid-token')
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });
});
