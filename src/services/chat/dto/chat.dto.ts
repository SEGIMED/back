import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StartChatDto {
  @ApiProperty({ description: 'User ID to start chat with' })
  @IsString()
  userId: string;
}

export class EndChatDto {
  @ApiProperty({
    description: 'Chat session status',
    enum: ['completed', 'cancelled'],
  })
  @IsEnum(['completed', 'cancelled'])
  status: 'completed' | 'cancelled';

  @ApiPropertyOptional({ description: 'Resolution or outcome of the chat' })
  @IsString()
  @IsOptional()
  resolution?: string;
}

export class ChatMessageDto {
  @ApiProperty({ description: 'User ID sending the message' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Chat session ID' })
  @IsString()
  chatId: string;

  @ApiProperty({ description: 'Message content' })
  @IsString()
  message: string;
}
