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
import {
  CreateSelfEvaluationEventDto,
  CreateMobileSelfEvaluationDto,
} from './dto/create-self-evaluation-event.dto';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';
import { Permission } from '../../auth/permissions/permission.enum';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { TenantAccessGuard } from '../../auth/guards/tenant-access.guard';
import { LatestVitalSignsResponseDto } from './dto/latest-vital-signs-response.dto';
import { VitalSignHistoryResponseDto } from './dto/vital-sign-history-response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Mobile - Self-Evaluation Events (Signos Vitales)')
@ApiBearerAuth('access-token')
@Controller('mobile/self-evaluation-event')
@UseGuards(TenantAccessGuard, PermissionGuard)
export class SelfEvaluationEventController {
  constructor(
    private readonly selfEvaluationEventService: SelfEvaluationEventService,
  ) {}

  @Post()
  @RequirePermission(Permission.VIEW_PATIENT_DETAILS)
  @ApiOperation({
    summary: 'Crear un evento de autoevaluación (para profesionales)',
    description:
      'Crea un nuevo evento de autoevaluación con los signos vitales registrados asociado a un evento médico específico. Este endpoint está destinado a profesionales de la salud.',
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

  @Post('vital-signs')
  @RequirePermission(Permission.REGISTER_OWN_VITAL_SIGNS)
  @ApiOperation({
    summary: 'Registrar signos vitales propios (para pacientes)',
    description:
      'Permite a los pacientes registrar sus propios signos vitales desde la aplicación móvil. El ID del paciente se extrae automáticamente del JWT token. No requiere medical_event_id ni tenant_id ya que son datos propios del paciente.',
  })
  @ApiBody({
    type: CreateMobileSelfEvaluationDto,
    examples: {
      basic: {
        summary: 'Registro básico de signos vitales',
        value: {
          vital_signs: [
            { vital_sign_id: 1, measure: 36.5 }, // Temperatura corporal
            { vital_sign_id: 2, measure: 120 }, // Presión sistólica
            { vital_sign_id: 3, measure: 80 }, // Presión diastólica
          ],
        },
      },
      complete: {
        summary: 'Registro completo de signos vitales',
        value: {
          vital_signs: [
            { vital_sign_id: 1, measure: 36.8 }, // Temperatura corporal
            { vital_sign_id: 2, measure: 125 }, // Presión sistólica
            { vital_sign_id: 3, measure: 82 }, // Presión diastólica
            { vital_sign_id: 4, measure: 78 }, // Frecuencia cardíaca
            { vital_sign_id: 5, measure: 98 }, // Saturación de oxígeno
            { vital_sign_id: 6, measure: 70.5 }, // Peso
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Signos vitales registrados exitosamente.',
    content: {
      'application/json': {
        example: {
          id: 'uuid-evento',
          patient_id: 'uuid-paciente',
          medical_event_id: null,
          created_at: '2024-01-15T10:30:00Z',
          vital_signs: [
            {
              id: 'uuid-signo',
              measure: 36.5,
              vital_sign_name: 'Temperatura Corporal',
              measure_unit: '°C',
              created_at: '2024-01-15T10:30:00Z',
            },
          ],
          message: 'Signos vitales registrados exitosamente',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Usuario no es paciente o datos inválidos.',
    content: {
      'application/json': {
        examples: {
          notPatient: {
            summary: 'Usuario no es paciente',
            value: {
              statusCode: 400,
              message: 'Esta funcionalidad es solo para pacientes',
              error: 'Bad Request',
            },
          },
          invalidData: {
            summary: 'Datos de entrada inválidos',
            value: {
              statusCode: 400,
              message: ['Debe proporcionar al menos un signo vital'],
              error: 'Bad Request',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Token JWT inválido o faltante.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - No tiene permisos para registrar signos vitales.',
  })
  async createMobileVitalSigns(
    @Body() createMobileSelfEvaluationDto: CreateMobileSelfEvaluationDto,
    @Request() req,
  ) {
    // Verificar que el usuario esté autenticado
    if (!req.user || !req.user.id) {
      throw new BadRequestException('Usuario no autenticado');
    }

    // Verificar que sea un paciente
    if (req.user.role !== 'patient') {
      throw new BadRequestException(
        'Esta funcionalidad es solo para pacientes',
      );
    }

    const patientId = req.user.id;

    return this.selfEvaluationEventService.createMobileSelfEvaluation(
      patientId,
      createMobileSelfEvaluationDto,
    );
  }

  @Get('latest-vital-signs/all')
  @RequirePermission(Permission.VIEW_OWN_VITAL_SIGNS)
  @ApiOperation({
    summary: 'Obtener último registro de todos los signos vitales propios',
    description:
      'Obtiene el último valor registrado para cada tipo de signo vital del catálogo para el paciente autenticado. Incluye tanto signos vitales registrados por el propio paciente como los registrados por médicos durante consultas. El ID del paciente se extrae automáticamente del JWT token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Últimos signos vitales obtenidos exitosamente.',
    type: LatestVitalSignsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Usuario no es paciente.',
    content: {
      'application/json': {
        example: {
          statusCode: 400,
          message: 'Esta funcionalidad es solo para pacientes',
          error: 'Bad Request',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Token JWT inválido o faltante.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - No tiene permisos para ver esta información.',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Paciente no encontrado.',
  })
  async getLatestVitalSignsForAllCatalog(
    @Request() req,
  ): Promise<LatestVitalSignsResponseDto> {
    // Verificar que el usuario esté autenticado
    if (!req.user || !req.user.id) {
      throw new BadRequestException('Usuario no autenticado');
    }

    // Verificar que sea un paciente
    if (req.user.role !== 'patient') {
      throw new BadRequestException(
        'Esta funcionalidad es solo para pacientes',
      );
    }

    const patientId = req.user.id;

    return this.selfEvaluationEventService.getLatestVitalSignsForAllCatalog(
      patientId,
    );
  }

  @Get('vital-signs/:vitalSignTypeId/history')
  @RequirePermission(Permission.VIEW_OWN_VITAL_SIGNS)
  @ApiOperation({
    summary:
      'Obtener historial y analítica de un signo vital específico propio',
    description:
      'Obtiene un historial detallado y estadísticas mensuales para un tipo de signo vital específico del paciente autenticado. Incluye registros tanto del propio paciente como de médicos durante consultas. Los datos están organizados por semanas. El ID del paciente se extrae automáticamente del JWT token.',
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
      'Bad Request - Usuario no es paciente, formato de mes incorrecto o parámetros faltantes.',
    content: {
      'application/json': {
        examples: {
          notPatient: {
            summary: 'Usuario no es paciente',
            value: {
              statusCode: 400,
              message: 'Esta funcionalidad es solo para pacientes',
              error: 'Bad Request',
            },
          },
          invalidMonth: {
            summary: 'Formato de mes inválido',
            value: {
              statusCode: 400,
              message: 'El formato del mes debe ser YYYY-MM (ej. 2023-10)',
              error: 'Bad Request',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Token JWT inválido o faltante.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - No tiene permisos para ver esta información.',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Paciente o tipo de signo vital no encontrado.',
  })
  async getVitalSignHistory(
    @Param('vitalSignTypeId', ParseIntPipe) vitalSignTypeId: number,
    @Query('month') month: string,
    @Request() req,
  ): Promise<VitalSignHistoryResponseDto> {
    // Verificar que el usuario esté autenticado
    if (!req.user || !req.user.id) {
      throw new BadRequestException('Usuario no autenticado');
    }

    // Verificar que sea un paciente
    if (req.user.role !== 'patient') {
      throw new BadRequestException(
        'Esta funcionalidad es solo para pacientes',
      );
    }

    if (!month) {
      throw new BadRequestException('El parámetro month es requerido');
    }

    const patientId = req.user.id;

    return this.selfEvaluationEventService.getVitalSignHistory(
      patientId,
      vitalSignTypeId,
      month,
    );
  }
}
