import { Logger, UseGuards } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Server } from 'socket.io';
import {
  type AuthenticatedSocket,
  type SocketUser,
  WsAuthGuard,
} from './ws-auth.guard.js';

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: process.env['CORS_ORIGIN'] ?? '*',
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly wsAuthGuard: WsAuthGuard,
  ) {}

  afterInit(): void {
    this.logger.log('Notifications WebSocket gateway initialized');
  }

  handleConnection(client: AuthenticatedSocket): void {
    try {
      this.authenticate(client);
      const user = client.data.user;
      if (!user) {
        throw new Error('Missing authenticated user');
      }

      void client.join(`user-${user.id}`);
      if (this.isStaff(user)) {
        void client.join('admins');
      }

      this.logger.log(`Client connected: userId=${user.id} role=${user.role}`);
    } catch {
      this.logger.warn('Rejected unauthenticated WS connection');
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    this.logger.log(
      `Client disconnected: userId=${client.data?.user?.id ?? 'unknown'}`,
    );
  }

  sendToUser(userId: string, notification: object): void {
    this.server.to(`user-${userId}`).emit('notification:new', notification);
  }

  sendToAdmins(notification: object): void {
    this.server.to('admins').emit('notification:new', notification);
  }

  isUserConnected(userId: string): boolean {
    const room = this.server?.sockets?.adapter?.rooms?.get(`user-${userId}`);
    return (room?.size ?? 0) > 0;
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('notification:markRead')
  handleMarkRead(
    _client: AuthenticatedSocket,
    notificationId: string,
  ): { event: string; data: { notificationId: string } } {
    return { event: 'notification:markRead:ack', data: { notificationId } };
  }

  private authenticate(client: AuthenticatedSocket): void {
    const token = this.wsAuthGuard.getToken(client);
    if (!token) {
      throw new Error('Missing token');
    }

    const payload = this.jwt.verify<{ sub: string; role: string }>(token, {
      secret: this.config.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
    });
    client.data.user = { id: payload.sub, role: payload.role };
  }

  private isStaff(user: SocketUser): boolean {
    const role = user.role.toUpperCase();
    return role === 'ADMIN' || role === 'TECHNICIAN';
  }
}
