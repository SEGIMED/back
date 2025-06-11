import { HttpException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MedicineService {
  private readonly apiUrl = 'https://www.datos.gov.co/resource/i7cb-raxc.json';

  constructor(private readonly httpService: HttpService) {}

  /**
   * Determina si un medicamento es genérico basándose en patrones del nombre
   */
  private isGenericMedicine(
    producto: string,
    principioActivo: string,
  ): boolean {
    const productLower = producto.toLowerCase();
    const principleWords = principioActivo.toLowerCase().split(' ');

    // Si el producto contiene símbolos de marca registrada, es comercial
    if (producto.includes('®') || producto.includes('™')) {
      return false;
    }

    // Si el producto es muy similar al principio activo, probablemente es genérico
    const similarity = this.calculateNameSimilarity(
      productLower,
      principleWords,
    );

    // Si la similitud es alta (>70%), considerarlo genérico
    return similarity > 0.7;
  }

  /**
   * Calcula la similitud entre el nombre del producto y el principio activo
   */
  private calculateNameSimilarity(
    producto: string,
    principleWords: string[],
  ): number {
    let matchingWords = 0;

    for (const word of principleWords) {
      if (word.length > 3 && producto.includes(word)) {
        matchingWords++;
      }
    }

    return principleWords.length > 0
      ? matchingWords / principleWords.length
      : 0;
  }

  async searchMedicine(query: string) {
    if (!query || query.trim() === '') {
      throw new HttpException('El parámetro de búsqueda es requerido', 400);
    }

    const searchTerm = query.toUpperCase();
    const principioActivoQuery = `principioactivo%20like%20%27%25${searchTerm}%25%27`;
    const productoQuery = `producto%20like%20%27%25${searchTerm}%25%27`;

    // Búsqueda que incluye tanto principio activo como producto
    const apiQuery = `${this.apiUrl}?$where=${principioActivoQuery}%20OR%20${productoQuery}`;

    try {
      const medicines = await firstValueFrom(this.httpService.get(apiQuery));

      return medicines.data.map((medicine) => {
        // Determinar si el producto es un nombre comercial distintivo o genérico
        const isGenericName = this.isGenericMedicine(
          medicine.producto,
          medicine.principioactivo,
        );

        return {
          id: medicine.expediente,
          active_principle: medicine.principioactivo,
          product: medicine.producto,
          commercial_name: isGenericName ? null : medicine.producto,
          presentation: medicine.formafarmaceutica,
          administration_route: medicine.viaadministracion,
          quantity: medicine.cantidad,
          measurement_unit: medicine.unidadmedida,
          laboratory: medicine.titular,
          commercial_description: medicine.descripcioncomercial,
        };
      });
    } catch (error) {
      console.log(error);
      throw new HttpException('La medicina no ha podido ser consultada', 500);
    }
  }
}
