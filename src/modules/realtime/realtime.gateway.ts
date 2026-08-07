import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OnEvent } from '@nestjs/event-emitter';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { getAllowedOrigins } from '../../common/config/cors-origins';

interface GuestEventPayload {
  id: string;
}

interface SessionEventPayload {
  userId: string;
  type: 'login' | 'logout';
}

@WebSocketGateway({
  cors: {
    // Static at decoration time (env vars aren't loaded yet), so this stays
    // permissive here; the real allow-list check runs in handleConnection()
    // via ConfigService once the app (and dotenv) has actually started.
    origin: true,
    credentials: true,
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  handleConnection(client: Socket): void {
    const origin = client.handshake.headers.origin;
    if (origin && !getAllowedOrigins(this.configService).includes(origin)) {
      client.disconnect(true);
      return;
    }

    const token = client.handshake.auth?.['token'] as string | undefined;
    if (!token) {
      client.disconnect(true);
      return;
    }

    try {
      const payload = this.jwtService.verify<{ sub: string; role: string }>(token, {
        secret: this.configService.get<string>('JWT_SECRET') || 'default-secret',
      });
      client.data.user = { id: payload.sub, role: payload.role };
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(_client: Socket): void {}

  @OnEvent('guest.created')
  onGuestCreated(payload: GuestEventPayload): void {
    this.server.emit('guest.created', payload);
  }

  @OnEvent('guest.updated')
  onGuestUpdated(payload: GuestEventPayload): void {
    this.server.emit('guest.updated', payload);
  }

  @OnEvent('guest.deleted')
  onGuestDeleted(payload: GuestEventPayload): void {
    this.server.emit('guest.deleted', payload);
  }

  @OnEvent('session.changed')
  onSessionChanged(payload: SessionEventPayload): void {
    this.server.emit('session.changed', payload);
  }
}
