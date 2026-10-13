import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

export interface SocketUser {
  id: string;
  role: string;
}

export interface AuthenticatedSocket extends Socket {
  data: {
    user?: SocketUser;
  };
}

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<AuthenticatedSocket>();
    const token = this.getToken(client);

    if (!token) {
      throw new WsException('Unauthorized');
    }

    try {
      const payload = this.jwt.verify<{ sub: string; role: string }>(token, {
        secret: this.config.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
      });
      client.data.user = { id: payload.sub, role: payload.role };
      return true;
    } catch {
      throw new WsException('Unauthorized');
    }
  }

  getToken(client: Socket): string | undefined {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.length > 0) {
      return authToken;
    }

    const authorization = client.handshake.headers.authorization;
    return authorization?.replace(/^Bearer\s+/i, '');
  }
}
