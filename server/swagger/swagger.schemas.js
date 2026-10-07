var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreateUserRequest {
    email;
    name;
    password;
    phone;
    deviceInfo;
}
__decorate([
    ApiProperty({ example: 'newuser@example.com', format: 'email' }),
    __metadata("design:type", String)
], CreateUserRequest.prototype, "email", void 0);
__decorate([
    ApiProperty({ example: 'New User', minLength: 2, maxLength: 20 }),
    __metadata("design:type", String)
], CreateUserRequest.prototype, "name", void 0);
__decorate([
    ApiProperty({ example: 'Password1', minLength: 8, maxLength: 20, format: 'password' }),
    __metadata("design:type", String)
], CreateUserRequest.prototype, "password", void 0);
__decorate([
    ApiPropertyOptional({ example: '+201012345678', pattern: '^\\+?\\d{8,15}$' }),
    __metadata("design:type", String)
], CreateUserRequest.prototype, "phone", void 0);
__decorate([
    ApiPropertyOptional({ example: 'iPhone 15' }),
    __metadata("design:type", String)
], CreateUserRequest.prototype, "deviceInfo", void 0);
export class LoginRequest {
    email;
    password;
    deviceInfo;
}
__decorate([
    ApiProperty({ example: 'user@example.com', format: 'email' }),
    __metadata("design:type", String)
], LoginRequest.prototype, "email", void 0);
__decorate([
    ApiProperty({ example: 'Password1', minLength: 8, maxLength: 20, format: 'password' }),
    __metadata("design:type", String)
], LoginRequest.prototype, "password", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Android Pixel 8' }),
    __metadata("design:type", String)
], LoginRequest.prototype, "deviceInfo", void 0);
export class RefreshTokenRequest {
    refreshToken;
}
__decorate([
    ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }),
    __metadata("design:type", String)
], RefreshTokenRequest.prototype, "refreshToken", void 0);
export class PublicUser {
    id;
    email;
    name;
    phone;
    role;
    createdAt;
    updatedAt;
}
__decorate([
    ApiProperty({ example: 'b8c7f8b1-2d7f-4c8e-a6b7-3a4d5e6f7a8b' }),
    __metadata("design:type", String)
], PublicUser.prototype, "id", void 0);
__decorate([
    ApiProperty({ example: 'user@example.com' }),
    __metadata("design:type", String)
], PublicUser.prototype, "email", void 0);
__decorate([
    ApiProperty({ example: 'New User' }),
    __metadata("design:type", String)
], PublicUser.prototype, "name", void 0);
__decorate([
    ApiPropertyOptional({ example: '+201012345678', nullable: true }),
    __metadata("design:type", Object)
], PublicUser.prototype, "phone", void 0);
__decorate([
    ApiProperty({ example: 'CUSTOMER', enum: ['CUSTOMER'] }),
    __metadata("design:type", String)
], PublicUser.prototype, "role", void 0);
__decorate([
    ApiProperty({ example: '2026-10-07T12:00:00.000Z', format: 'date-time' }),
    __metadata("design:type", String)
], PublicUser.prototype, "createdAt", void 0);
__decorate([
    ApiProperty({ example: '2026-10-07T12:00:00.000Z', format: 'date-time' }),
    __metadata("design:type", String)
], PublicUser.prototype, "updatedAt", void 0);
export class RegisterResponse {
    user;
    accessToken;
    refreshToken;
}
__decorate([
    ApiProperty({ type: () => PublicUser }),
    __metadata("design:type", PublicUser)
], RegisterResponse.prototype, "user", void 0);
__decorate([
    ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }),
    __metadata("design:type", String)
], RegisterResponse.prototype, "accessToken", void 0);
__decorate([
    ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }),
    __metadata("design:type", String)
], RegisterResponse.prototype, "refreshToken", void 0);
//# sourceMappingURL=swagger.schemas.js.map