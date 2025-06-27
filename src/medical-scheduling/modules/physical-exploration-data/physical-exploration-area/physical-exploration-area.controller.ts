import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { PhysicalExplorationAreaService } from './physical-exploration-area.service';
import { CreatePhysicalExplorationAreaDto } from './dto/create-physical-exploration-area.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Physical Exploration Area')
@ApiBearerAuth('JWT')
@Controller('physical-exploration-areas')
export class PhysicalExplorationAreaController {
  constructor(
    private readonly physicalExplorationAreaService: PhysicalExplorationAreaService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new physical exploration area' })
  @ApiBody({
    description: 'Data for creating a new physical exploration area.',
    type: CreatePhysicalExplorationAreaDto,
    examples: {
      default: {
        summary: 'Example of creating a new area',
        value: {
          name_on_library: 'ABDOMEN_RUQ',
          name: 'Abdomen - Right Upper Quadrant',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The physical exploration area has been successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 409,
    description:
      'Conflict - An area with the same name or library name already exists.',
  })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async createPhysicalExplorationArea(
    @Body() data: CreatePhysicalExplorationAreaDto,
  ) {
    try {
      return await this.physicalExplorationAreaService.createPhysicalExplorationArea(
        data,
      );
    } catch (error) {
      // Consider more specific error handling, e.g., for unique constraint violations (409 Conflict)
      if (error.code === 'P2002') {
        // Example for Prisma unique constraint error
        throw new HttpException(
          {
            message:
              'Conflict - An area with the same name or library name already exists.',
            error: error.message,
          },
          HttpStatus.CONFLICT,
        );
      }
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
