import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Message } from './message.model';

@Schema({ timestamps: true })
export class Chat extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Message' }] })
  messages: Message[];

  @Prop({ required: true, default: Date.now })
  startTime: Date;

  @Prop()
  endTime?: Date;

  @Prop({
    required: true,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active',
  })
  status: string;

  @Prop({ type: Object })
  metadata?: {
    alarmType?: string;
    priority?: 'high' | 'medium' | 'low';
    resolution?: string;
  };
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
