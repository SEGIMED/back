import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PhysicianDto {
  @ApiProperty({
    description: 'ID único del médico',
    example: 'b5191b80-2a8d-4eb2-9958-9273a0708025',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre del médico',
    example: 'Santiago',
  })
  name: string;

  @ApiProperty({
    description: 'Apellido del médico',
    example: 'Pérez',
  })
  surname: string;

  @ApiPropertyOptional({
    description: 'URL de la imagen/foto del médico',
    example: 'https://example.com/images/doctor.jpg',
  })
  image?: string;

  @ApiProperty({
    description: 'Especialidad médica principal',
    example: 'Cardiología',
  })
  specialty: string;
}

export class AppointmentDto {
  @ApiProperty({
    description: 'ID único de la cita',
    example: '3f08ebf8-7647-4150-a128-eaea6d8d22c9',
  })
  id: string;

  @ApiProperty({
    description: 'Fecha y hora de inicio de la cita en formato ISO',
    example: '2024-01-15T10:00:00.000Z',
  })
  start: Date;

  @ApiProperty({
    description: 'Estado actual de la cita',
    enum: ['pendiente', 'atendida', 'cancelada', 'reprogramada'],
    example: 'pendiente',
  })
  status: string;

  @ApiProperty({
    description: 'Información completa del médico asignado',
    type: PhysicianDto,
  })
  physician: PhysicianDto;
}

export class NextAppointmentResponseDto {
  @ApiPropertyOptional({
    description:
      'Próxima cita pendiente del paciente. Será undefined si no hay citas pendientes.',
    type: AppointmentDto,
  })
  next_appointment?: AppointmentDto;

  @ApiProperty({
    description: 'Mensaje descriptivo del resultado de la consulta',
    example: 'Próxima cita encontrada exitosamente',
  })
  message: string;
}

export class GroupedAppointmentsDto {
  @ApiProperty({
    description: 'Lista de citas pendientes (futuras)',
    type: [AppointmentDto],
    example: [],
  })
  pending: AppointmentDto[];

  @ApiProperty({
    description: 'Lista de citas pasadas (completadas o canceladas)',
    type: [AppointmentDto],
    example: [],
  })
  past: AppointmentDto[];

  @ApiProperty({
    description: 'Número total de citas pendientes',
    example: 2,
  })
  pending_count: number;

  @ApiProperty({
    description: 'Número total de citas pasadas',
    example: 5,
  })
  past_count: number;
}

export class AllAppointmentsResponseDto {
  @ApiProperty({
    description: 'Citas organizadas por estado temporal',
    type: GroupedAppointmentsDto,
  })
  appointments: GroupedAppointmentsDto;

  @ApiProperty({
    description: 'Mensaje descriptivo del resultado de la consulta',
    example: 'Citas obtenidas exitosamente',
  })
  message: string;
}
