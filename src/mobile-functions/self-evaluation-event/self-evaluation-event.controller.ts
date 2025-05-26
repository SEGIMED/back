import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { SelfEvaluationEventService } from './self-evaluation-event.service';
import { CreateSelfEvaluationEventDto } from './dto/create-self-evaluation-event.dto';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';
import { Permission } from '../../auth/permissions/permission.enum';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { TenantAccessGuard } from '../../auth/guards/tenant-access.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiSecurity,
  ApiHeader,
} from '@nestjs/swagger';

@ApiTags('Mobile - Self-Evaluation Events')
@ApiSecurity('access-token')
@ApiHeader({
  name: 'tenant_id',
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
      'Crea un nuevo evento de autoevaluación con los signos vitales registrados por el paciente mediante la aplicación móvil.',
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
    // Verificar que el tenant_id en el DTO coincide con el tenant del request
    if (createSelfEvaluationEventDto.tenant_id !== req.tenant?.id) {
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
}
