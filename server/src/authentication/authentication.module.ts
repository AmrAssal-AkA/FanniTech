import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service.js';
import { AuthenticationController } from './authentication.controller.js'

@Module({
  providers: [AuthenticationService],
  controllers: [AuthenticationController]
})
export class AuthenticationModule {}
