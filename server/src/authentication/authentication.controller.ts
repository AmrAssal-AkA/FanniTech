import { Controller, Post, Body, HttpCode, HttpStatus, HttpException, Res, Get } from '@nestjs/common';
import type {Request, Response} from 'express';

import { AuthenticationService } from './authentication.service.js';
import { CreateUserDtoSchema, type CreateUserDtoType } from './DTO/create-user.dto.js';
import { LoginUserDtoSchema, type LoginUserDtoType } from './DTO/login-user.dto.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiOkResponse,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import {
    CreateUserRequest,
    LoginRequest,
    RefreshTokenRequest,
    RegisterResponse,
} from '../swagger/swagger.schemas.js';


@Controller('api/v1/auth')
@ApiTags('Authentication')
export class AuthenticationController {
    constructor(private readonly authenticationService: AuthenticationService) {}

    private setCookies(res: Response, t: { accessToken: string; refreshToken: string }) {
        res.cookie('x-access-token', t.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000,
            path: '/api/v1/auth/web'
        })
        res.cookie('x-refresh-token', t.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/api/v1/auth/web'
        })
    }


    // mobile
    @Post('mobile/register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register a mobile customer' })
    @ApiBody({ type: CreateUserRequest })
    @ApiCreatedResponse({ description: 'Customer registered successfully.', type: RegisterResponse })
    @ApiConflictResponse({ description: 'A user with this email already exists.' })
    @ApiBadRequestResponse({ description: 'The request body failed validation.' })
    async registerUser(@Body(new ZodValidationPipe(CreateUserDtoSchema)) dto: CreateUserDtoType, @Res({ passthrough: true }) res: Response) {
        return await this.authenticationService.registerUser(dto);
    }

    @Post('mobile/login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Log in a mobile customer' })
    @ApiBody({ type: LoginRequest })
    @ApiOkResponse({ description: 'Login succeeded. Access and refresh tokens are set as HttpOnly cookies.' })
    @ApiBadRequestResponse({ description: 'The request body failed validation.' })
    @ApiInternalServerErrorResponse({ description: 'The login operation failed.' })
    async loginUser(@Body(new ZodValidationPipe(LoginUserDtoSchema)) dto: LoginUserDtoType, @Res({ passthrough: true }) res: Response) {
        try {
            const tokens = await this.authenticationService.loginUser(dto, 'mobile');
            this.setCookies(res, tokens);
            return tokens;
        }catch (error) {
            throw new HttpException('Failed to login user', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('mobile/refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Rotate mobile access and refresh tokens' })
    @ApiBody({ type: RefreshTokenRequest })
    @ApiOkResponse({ description: 'Tokens were rotated and set as HttpOnly cookies.' })
    @ApiInternalServerErrorResponse({ description: 'The refresh token operation failed.' })
    async refreshTokens(@Body('refreshToken') refreshToken: string, @Res({ passthrough: true }) res: Response) {
        try {
            const tokens = await this.authenticationService.refreshTokens(refreshToken, 'mobile');
            this.setCookies(res, tokens);
            return tokens;
        }catch (error) {
            throw new HttpException('Failed to refresh tokens', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('mobile/logout')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Revoke a mobile refresh token' })
    @ApiBody({ type: RefreshTokenRequest })
    @ApiResponse({ status: 200, description: 'The refresh token was revoked.' })
    async logout(@Body('refreshToken') refreshToken: string) {
        if (refreshToken) this.authenticationService.logout(refreshToken);
    }
}
