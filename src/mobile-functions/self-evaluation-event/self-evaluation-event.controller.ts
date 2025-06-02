import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  BadRequestException,
  Get,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { SelfEvaluationEventService } from './self-evaluation-event.service';
import { CreateSelfEvaluationEventDto } from './dto/create-self-evaluation-event.dto';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';
import { Permission } from '../../auth/permissions/permission.enum';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { TenantAccessGuard } from '../../auth/guards/tenant-access.guard';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { LatestVitalSignsResponseDto } from './dto/latest-vital-signs-response.dto';
import { VitalSignHistoryResponseDto } from './dto/vital-sign-history-response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiSecurity,
  ApiHeader,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Mobile - Self-Evaluation Events')
@ApiSecurity('access-token')
@ApiHeader({
  name: 'tenant-id',
  description: 'ID del tenant',
  required: true,
})
@Controller('mobile/self-evaluation-event')
@UseGuards(TenantAccessGuard, PermissionGuard)
export class SelfEvaluationEventController {
  constructor(
    private readonly selfEvaluationEventService: SelfEvaluationEventService,
  ) {}

  @Post()
  @RequirePermission(Permission.VIEW_PATIENT_DETAILS)
  @ApiOperation({
    summary: 'Crear un evento de autoevaluación',
    description:
      'Crea un nuevo evento de autoevaluación con los signos vitales registrados por el paciente mediante la aplicación móvil. El tenant_id es opcional para signos vitales propios del paciente.',
  })
  @ApiBody({ type: CreateSelfEvaluationEventDto })
  @ApiResponse({
    status: 201,
    description: 'El evento de autoevaluación ha sido creado exitosamente.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Solicitud inválida (datos faltantes, incorrectos o inconsistencia de tenant/paciente).',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - No tiene permisos para crear eventos de autoevaluación.',
  })
  async create(
    @Body() createSelfEvaluationEventDto: CreateSelfEvaluationEventDto,
    @Request() req,
  ) {
    // Verificar que el tenant_id en el DTO coincide con el tenant del request (solo si se proporciona)
    // Los signos vitales propios del paciente pueden no tener tenant_id asociado
    if (
      createSelfEvaluationEventDto.tenant_id &&
      createSelfEvaluationEventDto.tenant_id !== req.tenant?.id
    ) {
      throw new BadRequestException(
        'El tenant_id no coincide con el tenant del usuario',
      );
    }

    // Verificar que el patient_id en el DTO coincide con el usuario autenticado o tiene permisos
    if (
      createSelfEvaluationEventDto.patient_id !== req.user?.id &&
      !req.user?.is_superadmin &&
      req.user?.role !== 'physician'
    ) {
      throw new BadRequestException('No tiene permisos para crear este evento');
    }

    return this.selfEvaluationEventService.create(createSelfEvaluationEventDto);
  }

  @Get('latest-vital-signs/all')
  @RequirePermission(Permission.VIEW_PATIENT_DETAILS)
  @ApiOperation({
    summary: 'Obtener último registro de todos los signos vitales',
    description:
      'Obtiene el último valor registrado para cada tipo de signo vital del catálogo, sin importar si fue registrado por el paciente (a través de un SelfEvaluationEvent) o por un médico durante una consulta (MedicalEvent). Si un signo vital del catálogo nunca ha sido registrado para el paciente, se indica "Sin datos".',
  })
  @ApiResponse({
    status: 200,
    description: 'Últimos signos vitales obtenidos exitosamente.',
    type: LatestVitalSignsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Solicitud inválida.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - No tiene permisos para ver esta información.',
  })
  @ApiResponse({
    status: 404,
    description: 'Paciente no encontrado.',
  })
  async getLatestVitalSignsForAllCatalog(
    @GetUser() user,
  ): Promise<LatestVitalSignsResponseDto> {
    return this.selfEvaluationEventService.getLatestVitalSignsForAllCatalog(
      user.id,
    );
  }

  @Get('vital-signs/:vitalSignTypeId/history')
  @RequirePermission(Permission.VIEW_PATIENT_DETAILS)
  @ApiOperation({
    summary: 'Obtener historial y analítica de un signo vital específico',
    description:
      'Obtiene un historial detallado y estadísticas mensuales para un tipo de signo vital específico registrado por el paciente (o por un médico en consulta). Los datos están organizados por semanas (de domingo a sábado) para el mes solicitado.',
  })
  @ApiParam({
    name: 'vitalSignTypeId',
    type: 'number',
    description: 'ID del tipo de signo vital del catálogo (cat_vital_signs.id)',
    example: 1,
  })
  @ApiQuery({
    name: 'month',
    type: 'string',
    description: 'Mes para el cual se solicita el historial en formato YYYY-MM',
    example: '2023-10',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial y estadísticas obtenidas exitosamente.',
    type: VitalSignHistoryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Solicitud inválida (formato de mes incorrecto o parámetros faltantes).',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - No tiene permisos para ver esta información.',
  })
  @ApiResponse({
    status: 404,
    description: 'Paciente o tipo de signo vital no encontrado.',
  })
  async getVitalSignHistory(
    @Param('vitalSignTypeId', ParseIntPipe) vitalSignTypeId: number,
    @Query('month') month: string,
    @GetUser() user,
  ): Promise<VitalSignHistoryResponseDto> {
    if (!month) {
      throw new BadRequestException('El parámetro month es requerido');
    }

    return this.selfEvaluationEventService.getVitalSignHistory(
      user.id,
      vitalSignTypeId,
      month,
    );
  }
}
