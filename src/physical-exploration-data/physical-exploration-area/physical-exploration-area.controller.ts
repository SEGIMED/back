import { Body, Controller, HttpException, Post } from '@nestjs/common';
import { PhysicalExplorationAreaService } from './physical-exploration-area.service';
import { CreatePhysicalExplorationAreaDto } from './dto/create-physical-exploration-area.dto';

@Controller('physical-explorations-area')
export class PhysicalExplorationAreaController {
  constructor(
    private readonly physicalExplorationAreaService: PhysicalExplorationAreaService,
  ) {}

  @Post()
  async createPhysicalExplorationArea(
    @Body() data: CreatePhysicalExplorationAreaDto,
  ) {
    try {
      return this.physicalExplorationAreaService.createPhysicalExplorationArea(
        data,
      );
    } catch (error) {
      throw new HttpException(
        'Error creating physical exploration area',
        error.message,
      );
    }
  }
}
