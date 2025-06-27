import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BackgroundService } from './background.service';
import { CreateBackgroundDto } from './dto/create-background.dto';

@ApiTags('Background')
@Controller('background')
export class BackgroundController {
  constructor(private readonly backgroundService: BackgroundService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new background record for a patient' })
  @ApiResponse({
    status: 201,
    description: 'Background record created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  @ApiBearerAuth('JWT')
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
