import { HttpException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MedicineService {
  private readonly apiUrl = 'https://www.datos.gov.co/resource/i7cb-raxc.json';

  constructor(private readonly httpService: HttpService) {}

  async searchMedicine(principioActivo: string, producto: string) {
    const prActivo = principioActivo
      ? `principioactivo%20like%20%27%25${principioActivo.toUpperCase()}%25%27`
      : undefined;
    const pr = producto
      ? `producto%20like%20%27%25${producto.toUpperCase()}%25%27`
      : undefined;
    let query = '';
    if (pr && prActivo) {
      query = `${this.apiUrl}?$where=${pr}OR%20${prActivo}`;
    } else if (pr) {
      query = `${this.apiUrl}?$where=${pr}`;
    } else if (prActivo) {
      query = `${this.apiUrl}?$where=${prActivo}`;
    } else {
      query = this.apiUrl;
    }

    try {
      const medicines = await firstValueFrom(this.httpService.get(query));
      return medicines.data;
    } catch (error) {
      console.log(error);
      throw new HttpException('La medicina no ha podido ser consultada', 500);
    }
  }
}
