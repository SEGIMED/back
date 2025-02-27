import { HttpException, Injectable } from '@nestjs/common';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Message } from 'twilio/lib/twiml/MessagingResponse';

@Injectable()
export class MedicineService {

  private readonly apiUrl = "https://www.datos.gov.co/resource/i7cb-raxc.json"

  constructor(private readonly httpService: HttpService){}

  async searchMedicine(principioActivo: string, producto: string){
    const prActivo = principioActivo ? `principioactivo%20like%20%27%25${principioActivo.toUpperCase()}%25%27` : undefined;
    const pr = producto ? `producto%20like%20%27%25${producto.toUpperCase()}%25%27` : undefined;
    let query = ''
    if (pr && prActivo) {
      query = `${this.apiUrl}?$where=${pr}OR%20${prActivo}`
    }else if(pr){
      query = `${this.apiUrl}?$where=${pr}`
    }else if(prActivo){
      query = `${this.apiUrl}?$where=${prActivo}`
    }
      
    try {
      const medicines = await firstValueFrom(this.httpService.get(query))
      return medicines.data
    } catch (error) {
      throw new HttpException('La medicina no ha podido ser consultada', 500)
    }
  }
  create(createMedicineDto: CreateMedicineDto) {
    return 'This action adds a new medicine';
  }

  findAll() {
    return `This action returns all medicine`;
  }

  findOne(id: number) {
    return `This action returns a #${id} medicine`;
  }

  update(id: number, updateMedicineDto: UpdateMedicineDto) {
    return `This action updates a #${id} medicine`;
  }

  remove(id: number) {
    return `This action removes a #${id} medicine`;
  }
}
