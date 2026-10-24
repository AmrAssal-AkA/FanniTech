import {
  ArgumentsHost,
  BadRequestException,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HttpExceptionFilter } from './http-exception.filter.js';

describe('HttpExceptionFilter', () => {
  const filter = new HttpExceptionFilter();

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createMockHost = () => {
    const mockJson = vi.fn();
    const mockStatus = vi.fn().mockReturnValue({ json: mockJson });
    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status: mockStatus }),
      }),
    } as unknown as ArgumentsHost;
    return { host, mockStatus, mockJson };
  };

  it('should format HttpException with object response and custom errors', () => {
    const { host, mockStatus, mockJson } = createMockHost();

    const exception = new BadRequestException({
      message: 'Validation failed',
      errors: [{ path: ['problem'], message: 'Too short' }],
    });

    filter.catch(exception, host);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith({
      error: {
        code: 'BAD_REQUEST',
        message: 'Validation failed',
        details: [{ path: ['problem'], message: 'Too short' }],
      },
    });
  });

  it('should format HttpException when message is an array', () => {
    const { host, mockStatus, mockJson } = createMockHost();

    const exception = new BadRequestException({
      message: ['Email is invalid', 'Password is too short'],
    });

    filter.catch(exception, host);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith({
      error: {
        code: 'BAD_REQUEST',
        message: 'Email is invalid, Password is too short',
        details: {},
      },
    });
  });

  it('should handle string exception response', () => {
    const { host, mockStatus, mockJson } = createMockHost();

    const exception = new NotFoundException('Resource not found');

    filter.catch(exception, host);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockJson).toHaveBeenCalledWith({
      error: {
        code: 'NOT_FOUND',
        message: 'Resource not found',
        details: {},
      },
    });
  });

  it('should handle HttpException with primitive or null-like response', () => {
    const { host, mockStatus, mockJson } = createMockHost();

    const exception = new HttpException(123 as any, HttpStatus.BAD_GATEWAY);

    filter.catch(exception, host);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_GATEWAY);
    expect(mockJson).toHaveBeenCalledWith({
      error: {
        code: 'HTTP_502',
        message: 'Http Exception',
        details: {},
      },
    });
  });

  it('should handle all HTTP status codes mapped in getStatusCodeName', () => {
    const cases = [
      { ex: new UnauthorizedException(), code: 'UNAUTHORIZED', status: HttpStatus.UNAUTHORIZED },
      { ex: new ForbiddenException(), code: 'FORBIDDEN', status: HttpStatus.FORBIDDEN },
      { ex: new ConflictException(), code: 'CONFLICT', status: HttpStatus.CONFLICT },
      { ex: new UnprocessableEntityException(), code: 'UNPROCESSABLE_ENTITY', status: HttpStatus.UNPROCESSABLE_ENTITY },
      { ex: new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR), code: 'INTERNAL_SERVER_ERROR', status: HttpStatus.INTERNAL_SERVER_ERROR },
    ];

    for (const { ex, code, status } of cases) {
      const { host, mockStatus, mockJson } = createMockHost();
      filter.catch(ex, host);
      expect(mockStatus).toHaveBeenCalledWith(status);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({ code }),
        }),
      );
    }
  });

  it('should format non-HttpException error', () => {
    const loggerError = vi
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    const { host, mockStatus, mockJson } = createMockHost();

    filter.catch(new Error('Database crashed'), host);

    expect(loggerError).toHaveBeenCalledWith(
      'Unhandled Exception: Database crashed',
      expect.any(String),
    );
    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
        details: {},
      },
    });
  });

  it('should handle non-Error instance exceptions in catch', () => {
    const loggerError = vi
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    const { host, mockStatus } = createMockHost();

    filter.catch('Some primitive string error', host);

    expect(loggerError).toHaveBeenCalledWith(
      'Unhandled Exception: Some primitive string error',
      expect.any(String),
    );
    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});
