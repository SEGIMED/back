import { Body, Controller, HttpException, Post } from '@nestjs/common';
import { PhysicalExplorationService } from './physical-exploration.service';
import { CreatePhysicalExplorationDto } from './dto/create-physical-exploration.dto';

@Controller('physical-explorations')
export class PhysicalExplorationController {
  constructor(
    private readonly physicalExplorationService: PhysicalExplorationService,
  ) {}

  @Post()
  async createPhysicalExploration(@Body() data: CreatePhysicalExplorationDto) {
    try {
      return this.physicalExplorationService.createPhysicalExploration(data);
    } catch (error) {
      throw new HttpException(
        'Error creating physical exploration',
        error.message,
      );
    }
  }
}
