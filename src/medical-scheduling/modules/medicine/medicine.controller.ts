import { Controller, Get, Query } from '@nestjs/common';
import { MedicineService } from './medicine.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Medicine')
@Controller('medicine')
export class MedicineController {
  constructor(private readonly medicineService: MedicineService) {}

  @Get('searchMedicine')
  @ApiOperation({
    summary: 'Buscar medicamentos por principio activo o producto',
    description:
      'Permite buscar medicamentos utilizando el principio activo o el nombre del producto. Al menos uno de los parámetros debe ser proporcionado.',
  })
  @ApiQuery({
    name: 'principioActivo',
    required: false,
    description: 'Principio activo del medicamento a buscar',
    example: 'Amoxicilina',
  })
  @ApiQuery({
    name: 'producto',
    required: false,
    description: 'Nombre del producto del medicamento a buscar',
    example: 'Amoxidal',
  })
  searchMedicine(
    @Query('principioActivo') principioActivo: string,
    @Query('producto') producto: string,
  ) {
    return this.medicineService.searchMedicine(principioActivo, producto);
  }
}
