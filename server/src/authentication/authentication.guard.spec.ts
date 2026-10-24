import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { AuthenticationGuard } from './authentication.guard.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeContext = ({
  cookie,
  authHeader,
}: {
  cookie?: string;
  authHeader?: string;
} = {}) => {
  const req: Record<string, any> = {
    cookies: cookie ? { 'x-access-token': cookie } : {},
    headers: authHeader ? { authorization: `Bearer ${authHeader}` } : {},
  };
  return {
    switchToHttp: () => ({ getRequest: () => req }),
    req,
  } as any;
};

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('AuthenticationGuard', () => {
  let guard: AuthenticationGuard;
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = new JwtService({});
    guard = new AuthenticationGuard(jwtService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  // ─── No token ─────────────────────────────────────────────────────────────

  it('should throw UnauthorizedException when no token is present', () => {
    const ctx = makeContext();
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  // ─── Cookie-based (web audience) ──────────────────────────────────────────

  describe('when token comes from cookie (web)', () => {
    it('should return true and attach payload for a valid cookie token', () => {
      vi.spyOn(jwtService, 'verify').mockReturnValue({ sub: 'user-id', role: 'ADMIN' } as any);
      const ctx = makeContext({ cookie: 'valid-cookie-token' });

      const result = guard.canActivate(ctx);

      expect(result).toBe(true);
      expect(jwtService.verify).toHaveBeenCalledWith('valid-cookie-token', { audience: 'web' });
      expect(ctx.req.user).toEqual({ sub: 'user-id', role: 'ADMIN' });
    });

    it('should throw UnauthorizedException when cookie token is invalid', () => {
      vi.spyOn(jwtService, 'verify').mockImplementation(() => { throw new Error('jwt expired'); });
      const ctx = makeContext({ cookie: 'expired-token' });

      expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
    });
  });

  // ─── Authorization header (mobile audience) ───────────────────────────────

  describe('when token comes from Authorization header (mobile)', () => {
    it('should return true and attach payload for a valid Bearer token', () => {
      vi.spyOn(jwtService, 'verify').mockReturnValue({ sub: 'user-id', role: 'CUSTOMER' } as any);
      const ctx = makeContext({ authHeader: 'valid-bearer-token' });

      const result = guard.canActivate(ctx);

      expect(result).toBe(true);
      expect(jwtService.verify).toHaveBeenCalledWith('valid-bearer-token', { audience: 'mobile' });
    });

    it('should throw UnauthorizedException when Bearer token is invalid', () => {
      vi.spyOn(jwtService, 'verify').mockImplementation(() => { throw new Error('invalid signature'); });
      const ctx = makeContext({ authHeader: 'bad-token' });

      expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
    });
  });

  // ─── Cookie takes precedence ───────────────────────────────────────────────

  it('should prefer cookie over Authorization header when both are present', () => {
    vi.spyOn(jwtService, 'verify').mockReturnValue({ sub: 'user-id' } as any);
    const ctx = makeContext({ cookie: 'cookie-token', authHeader: 'bearer-token' });

    guard.canActivate(ctx);

    // Cookie → audience 'web'
    expect(jwtService.verify).toHaveBeenCalledWith('cookie-token', { audience: 'web' });
  });
});
