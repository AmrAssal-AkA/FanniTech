import { BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { v2 as cloudinary } from 'cloudinary';
import { StorageService } from './storage.service.js';
import { Writable } from 'node:stream';

vi.mock('cloudinary', () => {
  return {
    v2: {
      config: vi.fn(),
      uploader: {
        upload_stream: vi.fn(),
        destroy: vi.fn(),
      },
    },
  };
});

describe('StorageService', () => {
  let service: StorageService;
  let configService: ConfigService;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    configService = {
      get: vi.fn((key: string) => {
        if (key === 'CLOUDINARY_CLOUD_NAME') return 'test_cloud';
        if (key === 'CLOUDINARY_API_KEY') return 'test_key';
        if (key === 'CLOUDINARY_API_SECRET') return 'test_secret';
        return undefined;
      }),
    } as unknown as ConfigService;

    service = new StorageService(configService);
    service.onModuleInit();
  });

  const createMockFile = (
    overrides?: Partial<Express.Multer.File>,
  ): Express.Multer.File => ({
    fieldname: 'images',
    originalname: 'test.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024 * 1024,
    buffer: Buffer.from('fake image content'),
    stream: null as any,
    destination: '',
    filename: '',
    path: '',
    ...overrides,
  });

  describe('Validation', () => {
    it('should throw BadRequestException if MIME type is not allowed', () => {
      const invalidFile = createMockFile({
        mimetype: 'application/pdf',
        originalname: 'doc.pdf',
      });
      expect(() => service.validateFile(invalidFile)).toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if file exceeds 5MB limit', () => {
      const oversizedFile = createMockFile({
        size: 6 * 1024 * 1024,
      });
      expect(() => service.validateFile(oversizedFile)).toThrow(
        BadRequestException,
      );
    });

    it('should succeed validation for valid jpeg, png, and webp files', () => {
      expect(() =>
        service.validateFile(createMockFile({ mimetype: 'image/jpeg' })),
      ).not.toThrow();
      expect(() =>
        service.validateFile(createMockFile({ mimetype: 'image/png' })),
      ).not.toThrow();
      expect(() =>
        service.validateFile(createMockFile({ mimetype: 'image/webp' })),
      ).not.toThrow();
    });

    it('should throw BadRequestException if more than 5 files are passed', async () => {
      const files = Array(6).fill(createMockFile());
      await expect(service.uploadMultipleImages(files)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('Upload and Rollback', () => {
    it('should upload image via stream and return secure_url and publicId', async () => {
      const mockResult = {
        secure_url: 'https://cloudinary.com/fannitech/test.jpg',
        public_id: 'fannitech/repair-requests/test1234',
      };

      vi.mocked(cloudinary.uploader.upload_stream).mockImplementation(
        (...args: any[]) => {
          const callback = args[args.length - 1];
          const writable = new Writable({
            write(_chunk, _encoding, next) {
              next();
            },
            final(done) {
              callback(null, mockResult);
              done();
            },
          });
          return writable as any;
        },
      );

      const file = createMockFile();
      const result = await service.uploadImage(file);

      expect(result).toEqual({
        url: mockResult.secure_url,
        publicId: mockResult.public_id,
        fileName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      });
    });

    it('should call cloudinary.uploader.destroy when deleting images', async () => {
      vi.mocked(cloudinary.uploader.destroy).mockResolvedValue({
        result: 'ok',
      } as any);

      await service.deleteImages(['id-1', 'id-2']);

      expect(cloudinary.uploader.destroy).toHaveBeenCalledTimes(2);
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('id-1');
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('id-2');
    });

    it('should rollback uploaded images if one fails mid-batch', async () => {
      const loggerError = vi
        .spyOn(Logger.prototype, 'error')
        .mockImplementation(() => undefined);
      const cloudinaryError = new Error('Cloudinary error');
      let uploadCount = 0;
      vi.mocked(cloudinary.uploader.upload_stream).mockImplementation(
        (...args: any[]) => {
          const callback = args[args.length - 1];
          uploadCount++;
          const currentCount = uploadCount;
          const writable = new Writable({
            write(_chunk, _encoding, next) {
              next();
            },
            final(done) {
              if (currentCount === 1) {
                callback(null, {
                  secure_url: 'https://cloudinary.com/test1.jpg',
                  public_id: 'test-pub-1',
                });
              } else {
                callback(cloudinaryError, null);
              }
              done();
            },
          });
          return writable as any;
        },
      );

      vi.mocked(cloudinary.uploader.destroy).mockResolvedValue({
        result: 'ok',
      } as any);

      const files = [
        createMockFile({ originalname: '1.jpg' }),
        createMockFile({ originalname: '2.jpg' }),
      ];

      await expect(service.uploadMultipleImages(files)).rejects.toThrow();
      expect(loggerError).toHaveBeenCalledWith(
        'Failed to upload image to Cloudinary',
        cloudinaryError,
      );
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('test-pub-1');
    });
  });
});
