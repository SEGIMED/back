import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Chat' })
  chatId: Types.ObjectId;

  @Prop({ required: true, enum: ['user', 'bot'] })
  sender: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true, default: Date.now })
  timestamp: Date;

  @Prop({ enum: ['text', 'image', 'file'] })
  type?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
