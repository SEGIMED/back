import { HttpException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MedicineService {
  private readonly apiUrl = 'https://www.datos.gov.co/resource/i7cb-raxc.json';

  constructor(private readonly httpService: HttpService) {}
  async searchMedicine(query: string) {
    if (!query || query.trim() === '') {
      throw new HttpException('El parámetro de búsqueda es requerido', 400);
    }

    const searchTerm = query.toUpperCase();
    const principioActivoQuery = `principioactivo%20like%20%27%25${searchTerm}%25%27`;
    const productoQuery = `producto%20like%20%27%25${searchTerm}%25%27`; // Búsqueda que incluye tanto principio activo como producto
    const apiQuery = `${this.apiUrl}?$where=${principioActivoQuery}%20OR%20${productoQuery}`;

    try {
      const medicines = await firstValueFrom(this.httpService.get(apiQuery));

      return medicines.data.map((medicine) => ({
        id: medicine.expediente,
        active_principle: medicine.principio_activo,
        product: medicine.producto,
        commercial_name: medicine.producto, // Same as product for now, but can be mapped differently if needed
        presentation: medicine.formafarmaceutica,
        administration_route: medicine.viaadministracion,
        quantity: medicine.cantidad,
        measurement_unit: medicine.unidadmedida,
      }));
    } catch (error) {
      console.log(error);
      throw new HttpException('La medicina no ha podido ser consultada', 500);
    }
  }
}
