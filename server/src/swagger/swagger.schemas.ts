import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserRequest {
  @ApiProperty({ example: 'newuser@example.com', format: 'email' })
  email!: string;

  @ApiProperty({
    example: 'New User',
    minLength: 2,
    maxLength: 20,
    description: 'Letters, spaces, apostrophes, and hyphens only.',
  })
  name!: string;

  @ApiProperty({ example: 'Password1', minLength: 8, maxLength: 20, format: 'password' })
  password!: string;

  @ApiPropertyOptional({ example: '+201012345678', pattern: '^\\+?\\d{8,15}$' })
  phone?: string;

  @ApiPropertyOptional({ example: 'iPhone 15', maxLength: 200 })
  deviceInfo?: string;
}

export class LoginRequest {
  @ApiProperty({ example: 'user@example.com', format: 'email' })
  email!: string;

  @ApiProperty({ example: 'Password1', minLength: 8, maxLength: 20, format: 'password' })
  password!: string;

  @ApiPropertyOptional({ example: 'Android Pixel 8', maxLength: 200 })
  deviceInfo?: string;
}

export class RefreshTokenRequest {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken!: string;
  @ApiPropertyOptional({ enum: ['mobile', 'web'], default: 'mobile' })
  service?: 'mobile' | 'web';
}

export class PublicUser {
  @ApiProperty({ example: 'b8c7f8b1-2d7f-4c8e-a6b7-3a4d5e6f7a8b' })
  id!: string;

  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ example: 'New User' })
  name!: string;

  @ApiPropertyOptional({ example: '+201012345678', nullable: true })
  phone!: string | null;

  @ApiProperty({ example: 'CUSTOMER', enum: ['CUSTOMER'] })
  role!: string;

  @ApiProperty({ example: '2026-10-07T12:00:00.000Z', format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ example: '2026-10-07T12:00:00.000Z', format: 'date-time' })
  updatedAt!: string;
}

export class RegisterResponse {
  @ApiProperty({ type: () => PublicUser })
  user!: PublicUser;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken!: string;
}

export class CreateDeviceRequest {
  @ApiProperty({ example: 'Smartphone' })
  deviceType!: string;

  @ApiProperty({ example: 'Apple' })
  brand!: string;

  @ApiProperty({ example: 'iPhone 13 Pro' })
  model!: string;

  @ApiPropertyOptional({ example: 'SN123456789' })
  serialNumber?: string;
}

export class CreateTechnicianRequest {
  @ApiProperty({ example: 'Alex Technician', minLength: 1 })
  name!: string;

  @ApiProperty({ example: 'alex.technician@example.com', format: 'email' })
  email!: string;

  @ApiProperty({ example: 'SecurePassword1', minLength: 6, format: 'password' })
  password!: string;

  @ApiPropertyOptional({ example: '+201012345678', pattern: '^\\+?\\d{8,15}$' })
  phone?: string;

  @ApiPropertyOptional({ example: 'TECHNICIAN', enum: ['TECHNICIAN'], default: 'TECHNICIAN' })
  role?: 'TECHNICIAN';
}

export class TechnicianProfileResponse {
  @ApiProperty({ example: 'b8c7f8b1-2d7f-4c8e-a6b7-3a4d5e6f7a8b' })
  id!: string;

  @ApiProperty({ example: 'TECH-001' })
  employeeId!: string;

  @ApiProperty({ example: '2026-10-17T12:00:00.000Z', format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ example: '2026-10-17T12:00:00.000Z', format: 'date-time' })
  updatedAt!: string;
}

export class TechnicianResponse {
  @ApiProperty({ example: 'b8c7f8b1-2d7f-4c8e-a6b7-3a4d5e6f7a8b' })
  id!: string;

  @ApiProperty({ example: 'Alex Technician' })
  name!: string;

  @ApiProperty({ example: 'alex.technician@example.com', format: 'email' })
  email!: string;

  @ApiPropertyOptional({ example: '+201012345678', nullable: true })
  phone!: string | null;

  @ApiProperty({ example: 'TECHNICIAN', enum: ['TECHNICIAN'] })
  role!: 'TECHNICIAN';

  @ApiProperty({ type: () => TechnicianProfileResponse })
  technician!: TechnicianProfileResponse;
}

export class DeviceResponse {
  @ApiProperty({ example: 'c1d2e3f4-5678-90ab-cdef-1234567890ab' })
  id!: string;

  @ApiProperty({ example: 'b8c7f8b1-2d7f-4c8e-a6b7-3a4d5e6f7a8b' })
  customerId!: string;

  @ApiProperty({ example: 'Smartphone' })
  deviceType!: string;

  @ApiProperty({ example: 'Apple' })
  brand!: string;

  @ApiProperty({ example: 'iPhone 13 Pro' })
  model!: string;

  @ApiPropertyOptional({ example: 'SN123456789', nullable: true })
  serialNumber!: string | null;

  @ApiProperty({ example: '2026-10-10T12:00:00.000Z', format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ example: '2026-10-10T12:00:00.000Z', format: 'date-time' })
  updatedAt!: string;
}

export class CreateRepairRequestMultipart {
  @ApiProperty({ example: 'c1d2e3f4-5678-90ab-cdef-1234567890ab', description: 'UUID of the customer owned device' })
  deviceId!: string;

  @ApiProperty({ example: 'Broken OLED display screen', minLength: 3, maxLength: 150 })
  problem!: string;

  @ApiProperty({ example: 'The screen cracked after dropping it and touches are unresponsive.', minLength: 10, maxLength: 2000 })
  description!: string;

  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Up to 5 images (JPEG, PNG, WebP up to 5MB each)',
  })
  images?: any[];
}

export class RepairRequestImageResponse {
  @ApiProperty({ example: 'img-uuid-123' })
  id!: string;

  @ApiProperty({ example: 'req-uuid-456' })
  requestId!: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/fannitech/image/upload/v123456/sample.jpg' })
  url!: string;

  @ApiProperty({ example: 'fannitech/repair-requests/sample' })
  publicId!: string;

  @ApiProperty({ example: 'damage.jpg' })
  fileName!: string;

  @ApiProperty({ example: 'image/jpeg' })
  mimeType!: string;

  @ApiProperty({ example: 1048576 })
  size!: number;

  @ApiProperty({ example: '2026-10-10T12:00:00.000Z', format: 'date-time' })
  createdAt!: string;
}

export class RepairRequestResponse {
  @ApiProperty({ example: 'req-uuid-456' })
  id!: string;

  @ApiProperty({ example: 'c1d2e3f4-5678-90ab-cdef-1234567890ab' })
  deviceId!: string;

  @ApiProperty({ example: 'Broken OLED display screen' })
  problem!: string;

  @ApiProperty({ example: 'The screen cracked after dropping it and touches are unresponsive.' })
  description!: string;

  @ApiProperty({ example: 'PENDING', enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'] })
  status!: string;

  @ApiProperty({ type: () => [RepairRequestImageResponse] })
  images!: RepairRequestImageResponse[];

  @ApiPropertyOptional({ type: () => DeviceResponse })
  device?: DeviceResponse;

  @ApiProperty({ example: '2026-10-10T12:00:00.000Z', format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ example: '2026-10-10T12:00:00.000Z', format: 'date-time' })
  updatedAt!: string;
}
