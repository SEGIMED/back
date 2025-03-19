import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Chat, ChatSchema } from '../../models/mongoose/chat.model';
import { Message, MessageSchema } from '../../models/mongoose/message.model';
import { ChatDbService } from './chat-db.service';
import { AlarmasChatbotService } from './alarmas-chatbot.service';
import { AlarmasChatGateway } from './alarmas-chat.gateway';
import { ChatController } from './chat.controller';
import { ChatAuthService } from './chat-auth.service';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DB_CHAT'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
  ],
  controllers: [ChatController],
  providers: [
    ChatDbService,
    AlarmasChatbotService,
    AlarmasChatGateway,
    ChatAuthService,
  ],
  exports: [ChatDbService, AlarmasChatbotService],
})
export class ChatModule {}
