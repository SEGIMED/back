import { ApiProperty } from '@nestjs/swagger';
import { AppointmentWithRelationsDto } from './appointment-with-relations.dto';

export class PaginatedAppointmentsResponseDto {
  @ApiProperty({
    description: 'Lista de citas para la página actual',
    type: [AppointmentWithRelationsDto],
    example: [
      {
        id: 'uuid-cita-1',
        consultation_reason: 'Consulta de control',
        start: '2025-07-08T10:00:00.000Z',
        end: '2025-07-08T10:30:00.000Z',
        patient_id: 'uuid-paciente-1',
        physician_id: 'uuid-medico-1',
        status: 'pendiente',
        comments: 'Revisión mensual',
        tenant_id: 'uuid-tenant',
        patient: {
          name: 'Juan',
          last_name: 'Pérez',
          email: 'juan.perez@email.com',
        },
        physician: {
          name: 'Dr. Ana',
          last_name: 'García',
        },
        created_at: '2025-07-08T09:00:00.000Z',
        updated_at: '2025-07-08T09:15:00.000Z',
      },
    ],
  })
  data: AppointmentWithRelationsDto[];

  @ApiProperty({
    description: 'Número total de citas que coinciden con los filtros',
    example: 25,
    type: Number,
  })
  total: number;
}
