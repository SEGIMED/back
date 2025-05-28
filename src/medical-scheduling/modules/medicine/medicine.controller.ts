import { Controller, Get, Query } from '@nestjs/common';
import { MedicineService } from './medicine.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Medicine')
@Controller('medicine')
export class MedicineController {
  constructor(private readonly medicineService: MedicineService) {}

  @Get('searchMedicine')
  @ApiOperation({
    summary: 'Buscar medicamentos por texto',
    description:
      'Busca medicamentos utilizando un texto que se aplicará tanto al principio activo como al nombre del producto.',
  })
  @ApiQuery({
    name: 'query',
    required: true,
    description: 'Texto a buscar en principio activo y producto',
    example: 'clon',
  })
  searchMedicine(@Query('query') query: string) {
    return this.medicineService.searchMedicine(query);
  }
}
