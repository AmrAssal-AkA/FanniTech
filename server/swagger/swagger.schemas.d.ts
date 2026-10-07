export declare class CreateUserRequest {
    email: string;
    name: string;
    password: string;
    phone?: string;
    deviceInfo?: string;
}
export declare class LoginRequest {
    email: string;
    password: string;
    deviceInfo?: string;
}
export declare class RefreshTokenRequest {
    refreshToken: string;
}
export declare class PublicUser {
    id: string;
    email: string;
    name: string;
    phone: string | null;
    role: string;
    createdAt: string;
    updatedAt: string;
}
export declare class RegisterResponse {
    user: PublicUser;
    accessToken: string;
    refreshToken: string;
}
