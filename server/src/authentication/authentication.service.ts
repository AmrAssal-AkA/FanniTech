import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDtoType } from './DTO/create-user.dto.js';
import { LoginUserDtoType } from './DTO/login-user.dto.js';
import { hashPassword, comparePassword } from '../utils/password-hash.js';
import { AuthClient, Prisma } from '../prisma/generated/client.js';
import { isPublicUser } from '../types/Auth.types.js';


type Aud = 'mobile' | 'web';

const audianceOf = (role: string): Aud =>
  role === 'customer' ? 'mobile' : 'web';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private async createTokens(
    user: { id: string; role: string },
    aud: Aud,
    deviceInfo?: string,
  ) {
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, role: user.role },
      { 
        secret: this.config.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: '15m', audience: aud },
    );
    const refreshToken = await this.jwt.signAsync(
      { sub: user.id, role: user.role },
      {
        secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: '7d',
        audience: aud,
        jwtid: randomUUID(),
      },
    );

    await this.prisma.refreshToken.create({
      data: {
        userId: String(user.id),
        token: refreshToken,
        familyId: randomUUID(),
        deviceInfo: deviceInfo,
        client: aud === 'mobile' ? AuthClient.MOBILE : AuthClient.WEB,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    return { accessToken, refreshToken };
  }

  /* register a new Customer (mobile only) */
  async registerUser(dto: CreateUserDtoType) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existingUser) throw new ConflictException('Email already exists');
      const hashedPassword = await hashPassword(dto.password);
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          password: hashedPassword,
          phone: dto.phone,
          role: 'CUSTOMER',
          customer: {create: {}}
        },
      });
      const { accessToken, refreshToken } = await this.createTokens(
        user,
        'mobile',
        dto.deviceInfo,
      );
      return { user: isPublicUser(user), accessToken, refreshToken };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException();
      }
      throw error;
    }
  }

  async loginUser(dto: LoginUserDtoType, aud: Aud) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (!user) {
        throw new ConflictException('Invalid credentials');
      }
      if (user.role === 'CUSTOMER' && aud !== 'mobile') {
        throw new ForbiddenException('Customers can only log in from mobile App');
      }
      const isPasswordValid = await comparePassword(
        dto.password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new ConflictException('Invalid Password');
      }
      const { accessToken, refreshToken } = await this.createTokens(
        user,
        aud,
        dto.deviceInfo,
      );
      return { user: isPublicUser(user), accessToken, refreshToken };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException();
      }
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }

  async refreshTokens(refreshToken: string, aud: Aud) {
    try {
      this.jwt.verify(refreshToken, {
        secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
        audience: aud,
      });

      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });
      if (
        !storedToken ||
        storedToken.revoke ||
        storedToken.expiresAt < new Date()
      ) {
        throw new ConflictException('Invalid refresh token');
      }

      await this.prisma.refreshToken.update({
        where: { token: refreshToken },
        data: { revoke: true },
      });
      return this.createTokens(
        storedToken.user,
        aud,
        storedToken.deviceInfo ?? undefined,
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException();
      }
      throw new InternalServerErrorException();
    }
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revoke: true },
    });
  }
}
