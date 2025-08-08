import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const client: Socket = context.switchToWs().getClient();
      const token = this.extractTokenFromSocket(client);

      if (!token) {
        this.logger.warn('No token provided in WebSocket connection');
        return false;
      }

      const payload = this.jwtService.verify(token);
      client.data.user = payload;

      return true;
    } catch (error) {
      this.logger.error(`WebSocket authentication failed: ${error.message}`);
      return false;
    }
  }

  private extractTokenFromSocket(client: Socket): string | undefined {
    const token =
      client.handshake.auth?.token || client.handshake.headers?.authorization;

    if (!token) return undefined;

    return token.startsWith('Bearer ') ? token.substring(7) : token;
  }
}
