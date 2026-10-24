import { describe, expect, it } from 'vitest';
import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants.js';
import { CurrentUser, RequestUser } from './current-user.decorator.js';

function getParamDecoratorFactory(decorator: any) {
  class TestClass {
    public testMethod(@decorator() _value: any) {}
  }
  const metadata = Reflect.getMetadata(ROUTE_ARGS_METADATA, TestClass, 'testMethod');
  const key = Object.keys(metadata)[0];
  return metadata[key].factory;
}

describe('CurrentUser Decorator', () => {
  const factory = getParamDecoratorFactory(CurrentUser);

  const createMockContext = (user?: Partial<RequestUser>): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as unknown as ExecutionContext;

  it('should return null when there is no user on request', () => {
    const ctx = createMockContext(undefined);
    const result = factory(undefined, ctx);
    expect(result).toBeNull();
  });

  it('should return the full user when no key is specified', () => {
    const mockUser: RequestUser = { sub: 'u-123', role: 'ADMIN' };
    const ctx = createMockContext(mockUser);
    const result = factory(undefined, ctx);
    expect(result).toEqual(mockUser);
  });

  it('should return the specific property when key is passed', () => {
    const mockUser: RequestUser = { sub: 'u-123', role: 'ADMIN' };
    const ctx = createMockContext(mockUser);
    const result = factory('sub', ctx);
    expect(result).toBe('u-123');
  });
});

