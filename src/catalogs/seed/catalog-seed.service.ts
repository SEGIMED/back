import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CatalogSeedService {
  private readonly logger = new Logger(CatalogSeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Inicializa todos los catálogos con datos predeterminados
   */
  async seedAllCatalogs(): Promise<void> {
    try {
      this.logger.log('Iniciando la siembra de todos los catálogos...');

      // Ejecutar todas las funciones de seed en paralelo
      await Promise.all([
        this.seedCatStudyTypes(),
        this.seedCatCieDiez(),
        this.seedSubcatCieDiez(),
        this.seedCatVitalSigns(),
        this.seedCatMeasureUnits(),
        this.seedSpecialties(),
        this.seedPhysicalSubsystems(),
        this.seedPhysicalExplorationAreas(),
      ]);

      this.logger.log('Siembra de catálogos completada con éxito');
    } catch (error) {
      this.logger.error(`Error al sembrar catálogos: ${error.message}`);
      throw error;
    }
  }

  /**
   * Inicializa el catálogo de tipos de estudio
   */
  async seedCatStudyTypes(): Promise<void> {
    try {
      this.logger.log('Sembrando catálogo de tipos de estudio...');

      const count = await this.prisma.cat_study_type.count();
      if (count > 0) {
        this.logger.log(
          'El catálogo de tipos de estudio ya tiene datos, omitiendo...',
        );
        return;
      }

      const studyTypes = [
        { name: 'Radiografía' },
        { name: 'Ultrasonido' },
        { name: 'Resonancia Magnética' },
        { name: 'Tomografía Computarizada' },
        { name: 'Electrocardiograma' },
        { name: 'Análisis de Sangre' },
        { name: 'Análisis de Orina' },
        { name: 'Biopsia' },
      ];

      for (const studyType of studyTypes) {
        await this.prisma.cat_study_type.create({
          data: studyType,
        });
      }

      this.logger.log(
        `Catálogo de tipos de estudio sembrado: ${studyTypes.length} registros creados`,
      );
    } catch (error) {
      this.logger.error(`Error al sembrar tipos de estudio: ${error.message}`);
      throw error;
    }
  }

  /**
   * Inicializa el catálogo CIE-10 usando el archivo JSON
   */
  async seedCatCieDiez(): Promise<void> {
    try {
      this.logger.log('Sembrando catálogo CIE-10...');

      const count = await this.prisma.category_cie_diez.count();
      if (count > 0) {
        this.logger.log('El catálogo CIE-10 ya tiene datos, omitiendo...');
        return;
      }

      // Leer el archivo JSON de categorías CIE-10
      const filePath = path.join(
        process.cwd(),
        'src/catalogs/seed/cie10B.json',
      );
      const rawData = fs.readFileSync(filePath, 'utf8');
      const categories = JSON.parse(rawData);

      this.logger.log(
        `Cargadas ${categories.length} categorías CIE-10 desde el archivo JSON`,
      );

      // Crear las categorías en la base de datos
      // Usamos un enfoque por lotes para mejorar el rendimiento
      const batchSize = 100;
      for (let i = 0; i < categories.length; i += batchSize) {
        const batch = categories.slice(i, i + batchSize);
        await this.prisma.$transaction(
          batch.map((category) =>
            this.prisma.category_cie_diez.create({
              data: {
                code: category.code,
                description: category.description,
              },
            }),
          ),
        );
        this.logger.log(
          `Procesadas ${Math.min(i + batchSize, categories.length)} de ${categories.length} categorías`,
        );
      }

      this.logger.log(
        `Catálogo CIE-10 sembrado: ${categories.length} registros creados`,
      );
    } catch (error) {
      this.logger.error(`Error al sembrar CIE-10: ${error.message}`);
      throw error;
    }
  }

  /**
   * Inicializa el subcatálogo CIE-10 usando el archivo JSON
   */
  async seedSubcatCieDiez(): Promise<void> {
    try {
      this.logger.log('Sembrando subcatálogo CIE-10...');

      const count = await this.prisma.subcategories_cie_diez.count();
      if (count > 0) {
        this.logger.log('El subcatálogo CIE-10 ya tiene datos, omitiendo...');
        return;
      }

      // Primero, asegurémonos de que existan categorías principales
      const catCieDiez = await this.prisma.category_cie_diez.count();
      if (catCieDiez === 0) {
        await this.seedCatCieDiez();
      }

      // Leer el archivo JSON de subcategorías CIE-10
      const filePath = path.join(process.cwd(), 'src/catalogs/seed/cie10.json');
      const rawData = fs.readFileSync(filePath, 'utf8');
      const subcategories = JSON.parse(rawData);

      this.logger.log(
        `Cargadas ${subcategories.length} subcategorías CIE-10 desde el archivo JSON`,
      );

      // Obtener todas las categorías principales
      const categories = await this.prisma.category_cie_diez.findMany();
      const categoryMap = new Map();

      // Crear un mapa para acceder rápidamente a las categorías por código
      categories.forEach((category) => {
        categoryMap.set(category.code, category.id);
      });

      // Procesar subcategorías en lotes
      const batchSize = 100;
      let createdCount = 0;
      let skippedCount = 0;

      for (let i = 0; i < subcategories.length; i += batchSize) {
        const batch = subcategories.slice(i, i + batchSize);
        const validBatch = [];

        for (const subcat of batch) {
          // Extraer la categoría principal del código de subcategoría (ej. A00.1 -> A00)
          const mainCategoryCode = subcat.code.split('.')[0];

          const categoryId = categoryMap.get(mainCategoryCode);
          if (categoryId) {
            validBatch.push({
              code: subcat.code,
              description: subcat.description,
              categoryId: categoryId,
            });
          } else {
            skippedCount++;
          }
        }

        if (validBatch.length > 0) {
          await this.prisma.$transaction(
            validBatch.map((subcat) =>
              this.prisma.subcategories_cie_diez.create({
                data: subcat,
              }),
            ),
          );
          createdCount += validBatch.length;
        }

        this.logger.log(
          `Procesadas ${Math.min(i + batchSize, subcategories.length)} de ${subcategories.length} subcategorías`,
        );
      }

      this.logger.log(
        `Subcatálogo CIE-10 sembrado: ${createdCount} registros creados, ${skippedCount} omitidos por falta de categoría principal`,
      );
    } catch (error) {
      this.logger.error(
        `Error al sembrar subcatálogo CIE-10: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Inicializa el catálogo de signos vitales
   */
  async seedCatVitalSigns(): Promise<void> {
    try {
      this.logger.log('Sembrando catálogo de signos vitales...');

      const count = await this.prisma.cat_vital_signs.count();
      if (count > 0) {
        this.logger.log(
          'El catálogo de signos vitales ya tiene datos, omitiendo...',
        );
        return;
      }

      // Verificar si existen especialidades
      const specialtiesCount = await this.prisma.cat_speciality.count();
      if (specialtiesCount === 0) {
        await this.seedSpecialties();
      }

      // Obtener las especialidades
      const specialties = await this.prisma.cat_speciality.findMany();

      const vitalSigns = [
        {
          name: 'Presión arterial',
          category: 'Cardiovascular',
          specialtiesIds: specialties.slice(0, 3).map((s) => s.id),
        },
        {
          name: 'Frecuencia cardíaca',
          category: 'Cardiovascular',
          specialtiesIds: specialties.slice(0, 3).map((s) => s.id),
        },
        {
          name: 'Temperatura',
          category: 'General',
          specialtiesIds: specialties.map((s) => s.id),
        },
        {
          name: 'Frecuencia respiratoria',
          category: 'Respiratorio',
          specialtiesIds: specialties.slice(0, 5).map((s) => s.id),
        },
        {
          name: 'Saturación de oxígeno',
          category: 'Respiratorio',
          specialtiesIds: specialties.slice(0, 5).map((s) => s.id),
        },
        {
          name: 'Glucosa en sangre',
          category: 'Metabólico',
          specialtiesIds: specialties.slice(2, 7).map((s) => s.id),
        },
        {
          name: 'Peso',
          category: 'Antropométrico',
          specialtiesIds: specialties.map((s) => s.id),
        },
        {
          name: 'Talla',
          category: 'Antropométrico',
          specialtiesIds: specialties.map((s) => s.id),
        },
      ];

      for (const vitalSign of vitalSigns) {
        await this.prisma.cat_vital_signs.create({
          data: {
            name: vitalSign.name,
            category: vitalSign.category,
            specialties: {
              connect: vitalSign.specialtiesIds.map((id) => ({ id })),
            },
          },
        });
      }

      this.logger.log(
        `Catálogo de signos vitales sembrado: ${vitalSigns.length} registros creados`,
      );
    } catch (error) {
      this.logger.error(`Error al sembrar signos vitales: ${error.message}`);
      throw error;
    }
  }

  /**
   * Inicializa el catálogo de unidades de medida
   */
  async seedCatMeasureUnits(): Promise<void> {
    try {
      this.logger.log('Sembrando catálogo de unidades de medida...');

      const count = await this.prisma.cat_measure_unit.count();
      if (count > 0) {
        this.logger.log(
          'El catálogo de unidades de medida ya tiene datos, omitiendo...',
        );
        return;
      }

      // Primero asegurarnos que existan signos vitales para relacionar
      const vitalSignsCount = await this.prisma.cat_vital_signs.count();
      if (vitalSignsCount === 0) {
        await this.seedCatVitalSigns();
      }

      // Obtener los signos vitales
      const vitalSigns = await this.prisma.cat_vital_signs.findMany();

      // Definir unidades de medida con sus correspondientes signos vitales
      const measureUnitsData = [
        {
          name: 'mmHg',
          description: 'Milímetros de mercurio',
          vitalSignId: vitalSigns.find((v) => v.name === 'Presión arterial')
            ?.id,
        },
        {
          name: 'bpm',
          description: 'Latidos por minuto',
          vitalSignId: vitalSigns.find((v) => v.name === 'Frecuencia cardíaca')
            ?.id,
        },
        {
          name: '°C',
          description: 'Grados Celsius',
          vitalSignId: vitalSigns.find((v) => v.name === 'Temperatura')?.id,
        },
        {
          name: 'rpm',
          description: 'Respiraciones por minuto',
          vitalSignId: vitalSigns.find(
            (v) => v.name === 'Frecuencia respiratoria',
          )?.id,
        },
        {
          name: '%',
          description: 'Porcentaje',
          vitalSignId: vitalSigns.find(
            (v) => v.name === 'Saturación de oxígeno',
          )?.id,
        },
        {
          name: 'mg/dL',
          description: 'Miligramos por decilitro',
          vitalSignId: vitalSigns.find((v) => v.name === 'Glucosa en sangre')
            ?.id,
        },
        {
          name: 'kg',
          description: 'Kilogramos',
          vitalSignId: vitalSigns.find((v) => v.name === 'Peso')?.id,
        },
        {
          name: 'cm',
          description: 'Centímetros',
          vitalSignId: vitalSigns.find((v) => v.name === 'Talla')?.id,
        },
      ];

      // Filtrar aquellos que tienen un vitalSignId válido
      const validMeasureUnits = measureUnitsData.filter(
        (unit) => unit.vitalSignId !== undefined,
      );

      for (const unit of validMeasureUnits) {
        await this.prisma.cat_measure_unit.create({
          data: {
            name: unit.name,
            description: unit.description,
            cat_vital_signs_id: unit.vitalSignId,
          },
        });
      }

      this.logger.log(
        `Catálogo de unidades de medida sembrado: ${validMeasureUnits.length} registros creados`,
      );
    } catch (error) {
      this.logger.error(
        `Error al sembrar unidades de medida: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Inicializa el catálogo de especialidades médicas
   */
  async seedSpecialties(): Promise<void> {
    try {
      this.logger.log('Sembrando catálogo de especialidades médicas...');

      const count = await this.prisma.cat_speciality.count();
      if (count > 0) {
        this.logger.log(
          'El catálogo de especialidades ya tiene datos, omitiendo...',
        );
        return;
      }

      const specialties = [
        { name: 'Medicina General' },
        {
          name: 'Cardiología',
        },
        {
          name: 'Dermatología',
        },
        {
          name: 'Endocrinología',
        },
        {
          name: 'Gastroenterología',
        },
        { name: 'Geriatría' },
        { name: 'Ginecología' },
        { name: 'Neurología' },
        { name: 'Oftalmología' },
        { name: 'Pediatría' },
      ];

      for (const specialty of specialties) {
        await this.prisma.cat_speciality.create({
          data: specialty,
        });
      }

      this.logger.log(
        `Catálogo de especialidades sembrado: ${specialties.length} registros creados`,
      );
    } catch (error) {
      this.logger.error(`Error al sembrar especialidades: ${error.message}`);
      throw error;
    }
  }

  /**
   * Inicializa el catálogo de subsistemas físicos
   */
  async seedPhysicalSubsystems(): Promise<void> {
    try {
      this.logger.log('Sembrando catálogo de subsistemas físicos...');

      const count = await this.prisma.cat_physical_subsystem.count();
      if (count > 0) {
        this.logger.log(
          'El catálogo de subsistemas físicos ya tiene datos, omitiendo...',
        );
        return;
      }

      const subsystems = [
        { name: 'Sistema cardiovascular' },
        { name: 'Sistema respiratorio' },
        { name: 'Sistema digestivo' },
        { name: 'Sistema nervioso' },
        { name: 'Sistema músculo-esquelético' },
        { name: 'Sistema endocrino' },
        { name: 'Sistema urinario' },
        { name: 'Sistema reproductor' },
        { name: 'Sistema tegumentario' },
        { name: 'Sistema linfático e inmunológico' },
      ];

      for (const subsystem of subsystems) {
        await this.prisma.cat_physical_subsystem.create({
          data: subsystem,
        });
      }

      this.logger.log(
        `Catálogo de subsistemas físicos sembrado: ${subsystems.length} registros creados`,
      );
    } catch (error) {
      this.logger.error(
        `Error al sembrar subsistemas físicos: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Inicializa el catálogo de áreas de exploración física
   */
  async seedPhysicalExplorationAreas(): Promise<void> {
    try {
      this.logger.log('Sembrando catálogo de áreas de exploración física...');

      const count = await this.prisma.physical_exploration_area.count();
      if (count > 0) {
        this.logger.log(
          'El catálogo de áreas de exploración física ya tiene datos, omitiendo...',
        );
        return;
      }

      const explorationAreas = [
        { name: 'Cabeza y cuello', name_on_library: 'head_neck' },
        { name: 'Tórax', name_on_library: 'thorax' },
        { name: 'Abdomen', name_on_library: 'abdomen' },
        { name: 'Extremidades superiores', name_on_library: 'upper_limbs' },
        { name: 'Extremidades inferiores', name_on_library: 'lower_limbs' },
        { name: 'Espalda y columna', name_on_library: 'back_spine' },
        { name: 'Pelvis', name_on_library: 'pelvis' },
        { name: 'Sistema nervioso', name_on_library: 'nervous_system' },
        { name: 'Piel y anexos', name_on_library: 'skin_appendages' },
        { name: 'Evaluación general', name_on_library: 'general_assessment' },
      ];

      for (const area of explorationAreas) {
        await this.prisma.physical_exploration_area.create({
          data: area,
        });
      }

      this.logger.log(
        `Catálogo de áreas de exploración física sembrado: ${explorationAreas.length} registros creados`,
      );
    } catch (error) {
      this.logger.error(
        `Error al sembrar áreas de exploración física: ${error.message}`,
      );
      throw error;
    }
  }
}
