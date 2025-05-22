import { Controller, Post, Query } from '@nestjs/common';
import { MedicineService } from './medicine.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Medicine')
@Controller('medicine')
export class MedicineController {
  constructor(private readonly medicineService: MedicineService) {}

  @Post('searchMedicine')
  searchMedicine(
    @Query('drug') principioActivo: string,
    @Query('product') product: string,
  ) {
    return this.medicineService.searchMedicine(principioActivo, product);
  }
}
