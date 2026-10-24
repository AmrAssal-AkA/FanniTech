import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'node:stream';

export interface UploadedImageResult {
  url: string;
  publicId: string;
  fileName: string;
  mimeType: string;
  size: number;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES_COUNT = 5;

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const cloudName = this.config.get<string>('CLOUDAINARY_CLOUD_NAME');
    const apiName = this.config.get<string>('CLOUDAINARY_KEY_NAME');
    const apiKey = this.config.get<string>('CLOUDAINARY_API_KEY');
    const apiSecret =  this.config.get<string>('CLOUDAINARY_API_SECRET');

    cloudinary.config({
      cloud_name: cloudName,
      api_name: apiName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }

  validateFile(file: Express.Multer.File): void {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type: ${file.mimetype}. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File ${file.originalname} exceeds the maximum size limit of 5MB`,
      );
    }
  }

  async uploadImage(
    file: Express.Multer.File,
    folder = 'fannitech/repair-requests',
  ): Promise<UploadedImageResult> {
    this.validateFile(file);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            this.logger.error('Failed to upload image to Cloudinary', error);
            return reject(
              new InternalServerErrorException('Failed to upload image to storage'),
            );
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            fileName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
          });
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder = 'fannitech/repair-requests',
  ): Promise<UploadedImageResult[]> {
    if (!files || files.length === 0) {
      return [];
    }

    if (files.length > MAX_FILES_COUNT) {
      throw new BadRequestException(
        `Maximum ${MAX_FILES_COUNT} images allowed per repair request`,
      );
    }

    // Validate all files prior to any upload attempt
    for (const file of files) {
      this.validateFile(file);
    }

    const uploadedResults: UploadedImageResult[] = [];

    try {
      for (const file of files) {
        const result = await this.uploadImage(file, folder);
        uploadedResults.push(result);
      }
      return uploadedResults;
    } catch (error) {
      // Rollback already uploaded images if one fails mid-batch
      if (uploadedResults.length > 0) {
        await this.deleteImages(uploadedResults.map((img) => img.publicId));
      }
      throw error;
    }
  }

  async deleteImages(publicIds: string[]): Promise<void> {
    if (!publicIds || publicIds.length === 0) return;

    await Promise.all(
      publicIds.map(async (publicId) => {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          this.logger.warn(`Failed to destroy Cloudinary image: ${publicId}`, error);
        }
      }),
    );
  }
}
