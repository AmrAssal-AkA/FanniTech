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
