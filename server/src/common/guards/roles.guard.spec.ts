import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { describe, expect, it, vi } from 'vitest';
import { RolesGuard } from './roles.guard.js';

describe('RolesGuard', () => {
  const createMockContext = (user?: { role: string }) => {
    return {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  };

  it('should allow access if no roles are required', () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(undefined),
    } as unknown as Reflector;

    const guard = new RolesGuard(reflector);
    const context = createMockContext();

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access if user has the required role (case-insensitive)', () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(['CUSTOMER']),
    } as unknown as Reflector;

    const guard = new RolesGuard(reflector);
    const context = createMockContext({ role: 'customer' });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException if user has a different role', () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(['ADMIN']),
    } as unknown as Reflector;

    const guard = new RolesGuard(reflector);
    const context = createMockContext({ role: 'CUSTOMER' });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if no user is present on the request', () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(['CUSTOMER']),
    } as unknown as Reflector;

    const guard = new RolesGuard(reflector);
    const context = createMockContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
