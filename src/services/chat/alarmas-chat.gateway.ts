import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AlarmasChatbotService } from './alarmas-chatbot.service';
import { ChatAuthService } from './chat-auth.service';
import { WsException } from '@nestjs/websockets';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: 'alarmas',
})
export class AlarmasChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private alarmasChatbotService: AlarmasChatbotService,
    private chatAuthService: ChatAuthService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      console.log('Client connected:', client.id);
      await this.chatAuthService.authenticateConnection(client);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Cleanup if needed
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('alarmas:join')
  async handleJoin(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      if (client.data.user.id !== data.userId) {
        throw new WsException('Unauthorized: User ID mismatch');
      }

      const { chatId, message } = await this.alarmasChatbotService.startChat(
        data.userId,
      );
      client.join(chatId);
      return {
        event: 'alarmas:bot_response',
        data: { message, sessionId: chatId },
      };
    } catch (error) {
      return {
        event: 'alarmas:error',
        data: error.message || 'Error al iniciar el chat',
      };
    }
  }

  @SubscribeMessage('alarmas:message')
  async handleMessage(
    @MessageBody() data: { userId: string; chatId: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      if (client.data.user.id !== data.userId) {
        throw new WsException('Unauthorized: User ID mismatch');
      }

      const response = await this.alarmasChatbotService.handleMessage(
        data.chatId,
        data.userId,
        data.message,
      );
      return { event: 'alarmas:bot_response', data: response };
    } catch (error) {
      return {
        event: 'alarmas:error',
        data: error.message || 'Error al procesar el mensaje',
      };
    }
  }

  @SubscribeMessage('alarmas:leave')
  async handleLeave(
    @MessageBody()
    data: { userId: string; chatId: string; status: 'completed' | 'cancelled' },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      if (client.data.user.id !== data.userId) {
        throw new WsException('Unauthorized: User ID mismatch');
      }

      await this.alarmasChatbotService.endChat(data.chatId, data.status);
      client.leave(data.chatId);
      return { event: 'alarmas:chat_ended', data: { status: data.status } };
    } catch (error) {
      return {
        event: 'alarmas:error',
        data: error.message || 'Error al finalizar el chat',
      };
    }
  }
}
