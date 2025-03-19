import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ChatDbService } from './chat-db.service';
import { AlarmasChatbotService } from './alarmas-chatbot.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StartChatDto, EndChatDto } from './dto/chat.dto';

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatDbService: ChatDbService,
    private readonly alarmasChatbotService: AlarmasChatbotService,
  ) {}

  @Get('history/:userId')
  @ApiOperation({ summary: 'Get chat history for a user' })
  async getChatHistory(@Param('userId') userId: string) {
    return this.chatDbService.getUserChats(userId);
  }

  @Get('session/:chatId')
  @ApiOperation({ summary: 'Get a specific chat session' })
  async getChatSession(@Param('chatId') chatId: string) {
    return this.chatDbService.getChatSession(chatId);
  }

  @Post('start')
  @ApiOperation({ summary: 'Start a new chat session' })
  async startChat(@Body() startChatDto: StartChatDto) {
    return this.alarmasChatbotService.startChat(startChatDto.userId);
  }

  @Post('end/:chatId')
  @ApiOperation({ summary: 'End a chat session' })
  async endChat(
    @Param('chatId') chatId: string,
    @Body() endChatDto: EndChatDto,
  ) {
    return this.alarmasChatbotService.endChat(
      chatId,
      endChatDto.status,
      endChatDto.resolution,
    );
  }
}
