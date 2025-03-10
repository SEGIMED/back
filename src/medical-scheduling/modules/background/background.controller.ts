import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BackgroundService } from './background.service';
import { CreateBackgroundDto } from './dto/create-background.dto';

@Controller('background')
export class BackgroundController {
  constructor(private readonly backgroundService: BackgroundService) {}

  @Post()
  async createBackground(@Body() data: CreateBackgroundDto) {
    try {
      return await this.backgroundService.createBackground(data);
    } catch (error) {
      throw new HttpException(
        {
          message: 'Error creating background',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
