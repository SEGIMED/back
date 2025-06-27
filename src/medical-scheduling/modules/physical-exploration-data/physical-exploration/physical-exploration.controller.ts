import { Body, Controller, HttpException, Post } from '@nestjs/common';
import { PhysicalExplorationService } from './physical-exploration.service';
import { CreatePhysicalExplorationDto } from './dto/create-physical-exploration.dto';
import { UpdatePhysicalExplorationDto } from './dto/update-physical-exploration.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Physical Exploration')
@ApiBearerAuth('JWT')
@Controller('physical-explorations')
export class PhysicalExplorationController {
  constructor(
    private readonly physicalExplorationService: PhysicalExplorationService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create or update a physical exploration record' })
  @ApiBody({
    description:
      'Data for creating or updating a physical exploration. If medical_event_id is provided and exists, it updates; otherwise, it creates.',
    type: CreatePhysicalExplorationDto,
    examples: {
      create: {
        summary: 'Create new physical exploration',
        value: {
          patient_id: 'uuid-patient-123',
          physician_id: 'uuid-physician-456',
          medical_event_id: 'uuid-event-789',
          description: 'Patient reports mild tenderness in the abdominal area.',
          physical_exploration_area_id: 1,
          tenant_id: 'tid_abc123',
        },
      },
      update: {
        summary: 'Update existing physical exploration',
        value: {
          patient_id: 'uuid-patient-123',
          physician_id: 'uuid-physician-456',
          medical_event_id: 'uuid-event-789-existing',
          description:
            'Updated: Patient reports moderate tenderness in the abdominal area, no rebound.',
          physical_exploration_area_id: 1,
          tenant_id: 'tid_abc123',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description:
      'The physical exploration record has been successfully created/updated.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async createPhysicalExploration(
    @Body() data: CreatePhysicalExplorationDto | UpdatePhysicalExplorationDto,
  ) {
    try {
      return this.physicalExplorationService.createPhysicalExploration(data);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error creating/updating physical exploration',
        error.status || 500,
      );
    }
  }
}
