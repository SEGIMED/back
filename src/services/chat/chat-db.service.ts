import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat } from '../../models/mongoose/chat.model';
import { Message } from '../../models/mongoose/message.model';

@Injectable()
export class ChatDbService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
  ) {}

  async createChatSession(userId: string, metadata?: any): Promise<Chat> {
    const chat = new this.chatModel({
      userId,
      startTime: new Date(),
      status: 'active',
      metadata,
    });
    return chat.save();
  }

  async addMessage(
    chatId: string,
    sender: 'user' | 'bot',
    message: string,
  ): Promise<Message> {
    const newMessage = new this.messageModel({
      chatId: new Types.ObjectId(chatId),
      sender,
      message,
      timestamp: new Date(),
      type: 'text',
    });
    const savedMessage = await newMessage.save();

    await this.chatModel.findByIdAndUpdate(
      chatId,
      { $push: { messages: savedMessage._id } },
      { new: true },
    );

    return savedMessage;
  }

  async getChatSession(chatId: string): Promise<Chat | null> {
    return this.chatModel.findById(chatId).populate('messages').exec();
  }

  async updateChatStatus(
    chatId: string,
    status: 'completed' | 'cancelled',
    resolution?: string,
  ): Promise<Chat | null> {
    return this.chatModel.findByIdAndUpdate(
      chatId,
      {
        status,
        endTime: new Date(),
        ...(resolution && { 'metadata.resolution': resolution }),
      },
      { new: true },
    );
  }

  async getUserChats(userId: string): Promise<Chat[]> {
    return this.chatModel
      .find({ userId })
      .sort({ startTime: -1 })
      .populate('messages')
      .exec();
  }
}
