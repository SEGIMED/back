import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpStatus,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { MobileAppointmentsService } from './appointments.service';
import { TenantAccessGuard } from '../../auth/guards/tenant-access.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';
import { Permission } from '../../auth/permissions/permission.enum';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import {
  NextAppointmentResponseDto,
  AllAppointmentsResponseDto,
} from './dto/mobile-appointments-response.dto';

@ApiTags('Mobile - Appointments')
@ApiBearerAuth('access-token')
@Controller('mobile/appointments')
@UseGuards(TenantAccessGuard, PermissionGuard)
export class MobileAppointmentsController {
  constructor(
    private readonly mobileAppointmentsService: MobileAppointmentsService,
  ) {}

  @Get()
  @RequirePermission(Permission.VIEW_OWN_APPOINTMENTS)
  @ApiOperation({
    summary: 'Obtener turnos del paciente móvil',
    description:
      'Obtiene los turnos del paciente para la app móvil. Si home=true, devuelve solo la próxima cita pendiente. Si home=false o no se especifica, devuelve todas las citas agrupadas por estado. Campos devueltos: médico (nombre, apellido, especialidad, foto), estado, fecha.',
  })
  @ApiQuery({
    name: 'home',
    required: false,
    type: Boolean,
    description:
      'Si es true, devuelve solo la próxima cita pendiente. Si es false o no se especifica, devuelve todas las citas.',
    example: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Turnos obtenidos exitosamente',
    content: {
      'application/json': {
        examples: {
          nextAppointment: {
            summary: 'Próxima cita (home=true)',
            value: {
              next_appointment: {
                id: 'uuid-cita',
                start: '2024-01-15T10:00:00Z',
                status: 'pendiente',
                physician: {
                  id: 'uuid-medico',
                  name: 'Santiago',
                  surname: 'Pérez',
                  image: 'https://example.com/doctor.jpg',
                  specialty: 'Cardiología',
                },
              },
              message: 'Próxima cita encontrada exitosamente',
            },
          },
          allAppointments: {
            summary: 'Todas las citas (home=false)',
            value: {
              appointments: {
                pending: [
                  {
                    id: 'uuid-cita-1',
                    start: '2024-01-15T10:00:00Z',
                    status: 'pendiente',
                    physician: {
                      id: 'uuid-medico',
                      name: 'Santiago',
                      surname: 'Pérez',
                      image: 'https://example.com/doctor.jpg',
                      specialty: 'Cardiología',
                    },
                  },
                ],
                past: [
                  {
                    id: 'uuid-cita-2',
                    start: '2024-01-10T14:00:00Z',
                    status: 'atendida',
                    physician: {
                      id: 'uuid-medico-2',
                      name: 'María',
                      surname: 'González',
                      image: 'https://example.com/doctor2.jpg',
                      specialty: 'Medicina General',
                    },
                  },
                ],
                pending_count: 1,
                past_count: 1,
              },
              message: 'Citas obtenidas exitosamente',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Solicitud inválida - Usuario no es paciente o falta autenticación',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado - Token JWT inválido o faltante',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Prohibido - No tiene permisos para ver las citas',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Paciente no encontrado',
  })
  async getAppointments(
    @Query('home') home?: string,
    @Request() req?: any,
  ): Promise<NextAppointmentResponseDto | AllAppointmentsResponseDto> {
    try {
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
      const userTenants = req.userTenants; // Tenants del JWT

      // Determinar si se solicita solo la próxima cita o todas
      const isHomeRequest = home === 'true';

      if (isHomeRequest) {
        // Obtener solo la próxima cita pendiente
        return await this.mobileAppointmentsService.getNextAppointment(
          patientId,
          userTenants,
        );
      } else {
        // Obtener todas las citas agrupadas
        return await this.mobileAppointmentsService.getAllAppointments(
          patientId,
          userTenants,
        );
      }
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error.status === HttpStatus.NOT_FOUND
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Error al obtener los turnos: ${error.message}`,
      );
    }
  }
}
