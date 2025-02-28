import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { PhysicalExplorationAreaService } from './physical-exploration-area.service';
import { CreatePhysicalExplorationAreaDto } from './dto/create-physical-exploration-area.dto';

@Controller('physical-exploration-areas')
export class PhysicalExplorationAreaController {
  constructor(
    private readonly physicalExplorationAreaService: PhysicalExplorationAreaService,
  ) {}

  @Post()
  async createPhysicalExplorationArea(
    @Body() data: CreatePhysicalExplorationAreaDto,
  ) {
    try {
      return await this.physicalExplorationAreaService.createPhysicalExplorationArea(
        data,
      );
    } catch (error) {
      throw new HttpException(
        {
          message: 'Error creating physical exploration area',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
