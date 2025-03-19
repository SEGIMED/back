import { Injectable } from '@nestjs/common';
import { ChatDbService } from './chat-db.service';

@Injectable()
export class AlarmasChatbotService {
  constructor(private chatDbService: ChatDbService) {}

  private async processMessage(message: string): Promise<string> {
    // Here you would integrate with your chatbot logic/AI service
    // For now, we'll use a simple response
    return `He recibido tu mensaje: "${message}". ¿Podrías proporcionarme más detalles sobre la alarma?`;
  }

  async startChat(
    userId: string,
  ): Promise<{ chatId: string; message: string }> {
    const chat = await this.chatDbService.createChatSession(userId, {
      alarmType: 'pending',
      priority: 'medium',
    });

    const welcomeMessage =
      'Hola, soy Segi. ¿En qué puedo ayudarte con la alarma?';
    await this.chatDbService.addMessage(
      chat._id.toString(),
      'bot',
      welcomeMessage,
    );

    return {
      chatId: chat._id.toString(),
      message: welcomeMessage,
    };
  }

  async handleMessage(
    chatId: string,
    userId: string,
    message: string,
  ): Promise<{ message: string }> {
    // Add user message to chat history
    await this.chatDbService.addMessage(chatId, 'user', message);

    // Process message and get bot response
    const botResponse = await this.processMessage(message);

    // Add bot response to chat history
    await this.chatDbService.addMessage(chatId, 'bot', botResponse);

    return { message: botResponse };
  }

  async endChat(
    chatId: string,
    status: 'completed' | 'cancelled',
    resolution?: string,
  ): Promise<void> {
    await this.chatDbService.updateChatStatus(chatId, status, resolution);
  }

  async getChatHistory(chatId: string): Promise<any> {
    return this.chatDbService.getChatSession(chatId);
  }
}
