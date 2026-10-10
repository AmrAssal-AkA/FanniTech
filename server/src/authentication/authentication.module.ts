import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AuthenticationService } from './authentication.service.js';
import { AuthenticationController } from './authentication.controller.js';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({
        secret: c.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
      })
    }),
  ],
  providers: [AuthenticationService],
  controllers: [AuthenticationController],
  exports: [JwtModule, AuthenticationService],
})
export class AuthenticationModule {}
