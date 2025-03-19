import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class ChatAuthService {
  constructor(private jwtService: JwtService) {}

  async authenticateConnection(client: Socket): Promise<boolean> {
    try {
      const token = this.extractTokenFromHeader(client);
      if (!token) {
        throw new WsException('Unauthorized connection');
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // Attach user data to socket
      client.data.user = payload;
      return true;
    } catch (error) {
      throw new WsException('Invalid token');
    }
  }

  private extractTokenFromHeader(client: Socket): string | undefined {
    const auth = client.handshake.headers.authorization;
    if (!auth) return undefined;

    const [type, token] = auth.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
