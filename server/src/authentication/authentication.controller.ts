import { Controller, Post, Body, HttpCode, HttpStatus, HttpException, Res, Get } from '@nestjs/common';
import type {Request, Response} from 'express';

import { AuthenticationService } from './authentication.service.js';
import { CreateUserDtoSchema, type CreateUserDtoType } from './DTO/create-user.dto.js';
import { LoginUserDtoSchema, type LoginUserDtoType } from './DTO/login-user.dto.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';


@Controller('auth')
export class AuthenticationController {
    constructor(private readonly authenticationService: AuthenticationService) {}

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async registerUser(@Body(new ZodValidationPipe(CreateUserDtoSchema)) userData: CreateUserDtoType, @Res() res: Response) {
        try {
            const { user, accessToken, refreshToken } = await this.authenticationService.registerUser(userData);

            res.cookie("x-access-token", accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000,
                path: "/"
            })
            res.cookie("x-refresh-token", refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, 
                path: "/"
            })
            return {user};
        }catch (error) {
            if (error instanceof HttpException) {
                return res.status(error.getStatus()).json({ message: error.message });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
        }
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async loginUser(@Body(new ZodValidationPipe(LoginUserDtoSchema)) loginData: LoginUserDtoType, @Res() res: Response) {
        try {
            const { user, accessToken, refreshToken } = await this.authenticationService.loginUser(loginData.email, loginData.password);
            res.cookie("x-access-token", accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000,
                path: "/"
            });
            res.cookie("x-refresh-token", refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: "/"
            });
            return {user};
        }catch (error) {
            if (error instanceof HttpException) {
                return res.status(error.getStatus()).json({ message: error.message });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
        }
    }
}
