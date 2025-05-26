import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { MoodService } from './mood.service';
import { CreateMoodDto } from './dto/create-mood.dto';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { GetTenant } from '../../auth/decorators/get-tenant.decorator';
import { TenantAccessGuard } from '../../auth/guards/tenant-access.guard';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiHeader,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Mood')
@ApiBearerAuth('access-token')
@ApiHeader({
  name: 'tenant-id',
  description: 'ID del tenant al que pertenece el usuario',
  required: true,
})
@Controller('mobile/mood')
@UseGuards(TenantAccessGuard)
export class MoodController {
  constructor(private readonly moodService: MoodService) {}
  @Post()
  @ApiOperation({
    summary: 'Registrar estado de ánimo',
    description:
      'Guarda el estado de ánimo actual del paciente (limitado a uno por día)',
  })
  @ApiBody({
    description: 'Datos del estado de ánimo a registrar',
    type: CreateMoodDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Estado de ánimo registrado correctamente',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Ya se ha registrado un estado de ánimo hoy',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado',
  })
  async createMoodEntry(
    @Body() createMoodDto: CreateMoodDto,
    @GetUser() user,
    @GetTenant() tenant,
  ) {
    return this.moodService.createMoodEntry(user.id, tenant.id, createMoodDto);
  }

  @Get('today')
  @ApiOperation({
    summary: 'Obtener estado de ánimo de hoy',
    description: 'Devuelve el estado de ánimo registrado hoy por el paciente',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estado de ánimo obtenido correctamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se ha registrado ningún estado de ánimo hoy',
  })
  async getTodayMoodEntry(@GetUser() user) {
    return this.moodService.getTodayMoodEntry(user.id);
  }

  @Get('history')
  @ApiOperation({
    summary: 'Obtener historial de estados de ánimo',
    description: 'Devuelve el historial de estados de ánimo del paciente',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Historial obtenido correctamente',
  })
  async getMoodHistory(@GetUser() user) {
    return this.moodService.getMoodHistory(user.id);
  }
}
