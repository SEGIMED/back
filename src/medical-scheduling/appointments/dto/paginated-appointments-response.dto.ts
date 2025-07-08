import { ApiProperty } from '@nestjs/swagger';
import { appointment } from '@prisma/client';

export class PaginatedAppointmentsResponseDto {
  @ApiProperty({
    description: 'Lista de citas para la página actual',
    type: 'array',
    items: {
      type: 'object',
    },
  })
  data: appointment[];

  @ApiProperty({
    description: 'Número total de citas que coinciden con los filtros',
    example: 25,
    type: Number,
  })
  total: number;
}
