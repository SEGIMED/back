import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpStatus,
  BadRequestException,
  Request,
  Patch,
  Param,
  Body,
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
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import {
  NextAppointmentResponseDto,
  AllAppointmentsResponseDto,
} from './dto/mobile-appointments-response.dto';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';

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
    summary: 'Get patient appointments with multitenant support',
    description:
      'Gets appointments for the authenticated patient across all their associated organizations. Patient ID is extracted from JWT token automatically. Supports two modes: home view (next appointment only) or full view (all appointments grouped by status).',
  })
  @ApiQuery({
    name: 'home',
    required: false,
    type: Boolean,
    description:
      'If true, returns only the next pending appointment. If false or not specified, returns all appointments grouped by status.',
    example: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Appointments retrieved successfully',
    content: {
      'application/json': {
        examples: {
          nextAppointment: {
            summary: 'Next appointment (home=true)',
            description:
              'Response when requesting only the next pending appointment',
            value: {
              next_appointment: {
                id: 'uuid-cita',
                start: '2024-01-15T10:00:00Z',
                status: 'pendiente',
                physician: {
                  id: 'uuid-medico',
                  name: 'Santiago',
                  last_name: 'Pérez',
                  image: 'https://example.com/doctor.jpg',
                  specialty: 'Cardiología',
                },
              },
              message: 'Próxima cita encontrada exitosamente',
            },
          },
          allAppointments: {
            summary: 'All appointments (home=false)',
            description:
              'Response when requesting all appointments grouped by status',
            value: {
              appointments: {
                pending: [
                  {
                    id: 'uuid-cita-1',
                    start: '2024-01-15T10:00:00Z',
                    status: 'pendiente',
                    physician: {
                      id: 'uuid-medico-1',
                      name: 'Santiago',
                      last_name: 'Pérez',
                      image: 'https://example.com/doctor1.jpg',
                      specialty: 'Cardiología',
                    },
                  },
                ],
                past: [
                  {
                    id: 'uuid-cita-2',
                    start: '2024-01-10T09:00:00Z',
                    status: 'atendida',
                    physician: {
                      id: 'uuid-medico-2',
                      name: 'María',
                      last_name: 'González',
                      image: 'https://example.com/doctor2.jpg',
                      specialty: 'Neurología',
                    },
                  },
                ],
                pending_count: 1,
                past_count: 1,
              },
              message: 'Citas obtenidas exitosamente',
            },
          },
          noAppointments: {
            summary: 'No appointments found',
            description: 'Response when patient has no appointments',
            value: {
              next_appointment: undefined,
              message: 'No se encontraron citas pendientes',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request - User is not a patient or invalid request',
    content: {
      'application/json': {
        examples: {
          notPatient: {
            summary: 'User is not a patient',
            value: {
              statusCode: 400,
              message: 'Esta funcionalidad es solo para pacientes',
              error: 'Bad Request',
            },
          },
          notAuthenticated: {
            summary: 'User not authenticated',
            value: {
              statusCode: 400,
              message: 'Usuario no autenticado',
              error: 'Bad Request',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Insufficient permissions to view appointments',
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

  @Patch(':appointment_id/cancel')
  @RequirePermission(Permission.VIEW_OWN_APPOINTMENTS)
  @ApiOperation({
    summary: 'Cancel patient appointment',
    description:
      'Allows an authenticated patient to cancel their own appointment. Only pending and future appointments can be cancelled. Patient ID is extracted from JWT token automatically.',
  })
  @ApiParam({
    name: 'appointment_id',
    description: 'ID of the appointment to cancel',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: CancelAppointmentDto,
    examples: {
      withReason: {
        summary: 'Cancel with reason',
        description: 'Cancelling appointment with a specific reason',
        value: {
          reason: 'No puedo asistir por motivos personales',
        },
      },
      withoutReason: {
        summary: 'Cancel without reason',
        description: 'Cancelling appointment without specifying a reason',
        value: {},
      },
      detailedReason: {
        summary: 'Cancel with detailed reason',
        description: 'Cancelling with a more detailed explanation',
        value: {
          reason:
            'Tengo una emergencia familiar y debo viajar fuera de la ciudad',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Appointment cancelled successfully',
    content: {
      'application/json': {
        examples: {
          withReason: {
            summary: 'Cancelled with reason',
            value: {
              id: 'uuid-cita',
              status: 'cancelada',
              start: '2024-01-15T10:00:00Z',
              physician: {
                name: 'Santiago',
                last_name: 'Pérez',
              },
              message: 'Cita cancelada exitosamente',
              cancelled_reason: 'No puedo asistir por motivos personales',
            },
          },
          withoutReason: {
            summary: 'Cancelled without reason',
            value: {
              id: 'uuid-cita',
              status: 'cancelada',
              start: '2024-01-15T10:00:00Z',
              physician: {
                name: 'Santiago',
                last_name: 'Pérez',
              },
              message: 'Cita cancelada exitosamente',
              cancelled_reason: undefined,
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request - Various validation errors',
    content: {
      'application/json': {
        examples: {
          notPatient: {
            summary: 'User is not a patient',
            value: {
              statusCode: 400,
              message: 'Esta funcionalidad es solo para pacientes',
              error: 'Bad Request',
            },
          },
          notPending: {
            summary: 'Appointment is not pending',
            value: {
              statusCode: 400,
              message: 'Solo se pueden cancelar citas pendientes',
              error: 'Bad Request',
            },
          },
          pastAppointment: {
            summary: 'Appointment is in the past',
            value: {
              statusCode: 400,
              message: 'No se pueden cancelar citas pasadas',
              error: 'Bad Request',
            },
          },
          invalidData: {
            summary: 'Invalid input data',
            value: {
              statusCode: 400,
              message: ['La razón no puede exceder 500 caracteres'],
              error: 'Bad Request',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Insufficient permissions to cancel appointments',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description:
      'Not Found - Appointment not found or no permission to cancel it',
    content: {
      'application/json': {
        example: {
          statusCode: 404,
          message: 'Cita no encontrada o no tienes permisos para cancelarla',
          error: 'Not Found',
        },
      },
    },
  })
  async cancelAppointment(
    @Param('appointment_id') appointmentId: string,
    @Body() cancelDto: CancelAppointmentDto,
    @Request() req?: any,
  ) {
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

      return await this.mobileAppointmentsService.cancelAppointment(
        appointmentId,
        patientId,
        cancelDto,
        userTenants,
      );
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error.status === HttpStatus.NOT_FOUND
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Error al cancelar la cita: ${error.message}`,
      );
    }
  }
}
