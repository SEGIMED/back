import { Controller, Post, Query } from '@nestjs/common';
import { MedicineService } from './medicine.service';

@Controller('medicine')
export class MedicineController {
  constructor(private readonly medicineService: MedicineService) {}

  @Post('searchMedicine')
  searchMedicine(
    @Query('drug') principioActivo: string, 
    @Query('product') product: string){
    return this.medicineService.searchMedicine(principioActivo, product)
  }
}
