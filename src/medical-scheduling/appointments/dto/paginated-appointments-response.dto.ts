import { ApiProperty } from '@nestjs/swagger';
import { AppointmentWithRelationsDto } from './appointment-with-relations.dto';

export class PaginatedAppointmentsResponseDto {
  @ApiProperty({
    description: 'Lista de citas para la página actual',
    type: [AppointmentWithRelationsDto],
  })
  data: AppointmentWithRelationsDto[];

  @ApiProperty({
    description: 'Número total de citas que coinciden con los filtros',
    example: 25,
    type: Number,
  })
  total: number;
}
