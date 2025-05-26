import { Controller, Post, Query } from '@nestjs/common';
import { MedicineService } from './medicine.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Medicine')
@Controller('medicine')
export class MedicineController {
  constructor(private readonly medicineService: MedicineService) {}

  @Post('searchMedicine')
  @ApiOperation({
    summary:
      'Search for medicines based on active ingredient and product name.',
  })
  @ApiQuery({
    name: 'drug',
    required: false,
    description: 'The active ingredient of the medicine to search for.',
    example: 'Amoxicilina',
  })
  @ApiQuery({
    name: 'product',
    required: false,
    description: 'The product name of the medicine to search for.',
    example: 'Amoxidal',
  })
  searchMedicine(
    @Query('drug') principioActivo: string,
    @Query('product') product: string,
  ) {
    return this.medicineService.searchMedicine(principioActivo, product);
  }
}
