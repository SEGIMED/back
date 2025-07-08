import { ApiProperty } from '@nestjs/swagger';
import { status_type } from '@prisma/client';

export class AppointmentWithRelationsDto {
  @ApiProperty({
    description: 'ID único de la cita',
    example: 'uuid-cita',
  })
  id: string;

  @ApiProperty({
    description: 'Razón de la consulta',
    example: 'Consulta de control',
  })
  consultation_reason: string;

  @ApiProperty({
    description: 'Fecha y hora de inicio',
    example: '2025-07-08T10:00:00.000Z',
  })
  start: Date;

  @ApiProperty({
    description: 'Fecha y hora de fin',
    example: '2025-07-08T10:30:00.000Z',
  })
  end: Date;

  @ApiProperty({
    description: 'ID del paciente',
    example: 'uuid-paciente',
  })
  patient_id: string;

  @ApiProperty({
    description: 'ID del médico',
    example: 'uuid-medico',
  })
  physician_id: string;

  @ApiProperty({
    description: 'Estado de la cita',
    enum: ['atendida', 'cancelada', 'pendiente', 'no_asistida'],
  })
  status: status_type;

  @ApiProperty({
    description: 'Comentarios adicionales',
    example: 'Revisión mensual',
    required: false,
  })
  comments?: string;

  @ApiProperty({
    description: 'ID del tenant',
    example: 'uuid-tenant',
  })
  tenant_id: string;

  @ApiProperty({
    description: 'Datos básicos del paciente',
    type: 'object',
    properties: {
      name: { type: 'string' },
      last_name: { type: 'string' },
      email: { type: 'string' },
    },
  })
  patient: {
    name: string;
    last_name: string;
    email?: string;
  };

  @ApiProperty({
    description: 'Datos básicos del médico',
    type: 'object',
    properties: {
      name: { type: 'string' },
      last_name: { type: 'string' },
    },
  })
  physician: {
    name: string;
    last_name: string;
  };

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2025-07-08T09:00:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2025-07-08T09:15:00.000Z',
  })
  updated_at: Date;
}
