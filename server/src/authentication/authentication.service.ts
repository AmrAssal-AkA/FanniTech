import { Injectable, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import {CreateUserDtoSchema, CreateUserDtoType} from "./DTO/create-user.dto.js";
import {LoginUserDtoSchema, LoginUserDtoType} from "./DTO/login-user.dto.js";
import {hashPassword, comparePassword} from "../utils/password-hash.js";
import {generateAccessToken, generateRefreshToken} from '../utils/token-generate.js'


@Injectable()
export class AuthenticationService {
    constructor(private readonly prismaService: PrismaService) {}

    async registerUser(userData: CreateUserDtoType) {
      try {
        const { name, email, password } = CreateUserDtoSchema.parse(userData);
        if (!name || !email || !password) {
            throw new BadRequestException('Name, email, and password are required');
        }
        if (password.length < 8) {
            throw new BadRequestException('Password must be at least 8 characters long');
        }
        if (!email.includes('@')) {
            throw new BadRequestException('Invalid email format');
        }
        const hashedPassword = await hashPassword(password);
        const existingUser = await this.prismaService.user.findUnique({
          where: { email },
        });
        if (existingUser) {
            throw new BadRequestException('Email already exists');
        }
        const user = await this.prismaService.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
          },
        });
        const accessToken = generateAccessToken(user.id, user.role);
        const refreshToken = generateRefreshToken(user.id, user.role);
        return { user, accessToken, refreshToken };
      }catch (error) {
        if (error instanceof BadRequestException) {
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
        throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
    async loginUser(email: string, password: string) {
        try {
            const loginData = LoginUserDtoSchema.parse({ email, password });
            const user = await this.prismaService.user.findUnique({
                where: { email: loginData.email },
            });
            if (!user) {
                throw new BadRequestException('Invalid email or password');
            }
            const isPasswordValid = await comparePassword(loginData.password, user.password);
            if (!isPasswordValid) {
                throw new BadRequestException('Invalid email or password');
            }
            const accessToken = generateAccessToken(user.id, user.role);
            const refreshToken = generateRefreshToken(user.id, user.role);
            return { user, accessToken, refreshToken };
        }catch (error) {
            if (error instanceof BadRequestException) {
                throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
            }
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
