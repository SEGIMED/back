import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePresHistoryDto } from './dto/create-pres-history.dto';

@Injectable()
export class PresModHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  // Implementar transactions
  async create(createPresHistoryDto: CreatePresHistoryDto) {
    try {
      await this.prisma.$transaction(async (op) => {
        let prescription = await op.prescription.findFirst({
          where: {
            AND: [
              { monodrug: createPresHistoryDto.monodrug },
              { active: true },
            ],
          },
        });
        if (!prescription) {
          prescription = await op.prescription.create({
            data: { monodrug: createPresHistoryDto.monodrug },
          });
        }

        delete createPresHistoryDto.start_timestamp;
        delete createPresHistoryDto.end_timestamp;
        delete createPresHistoryDto.description;
        delete createPresHistoryDto.active;
        delete createPresHistoryDto.patient_id;
        delete createPresHistoryDto.monodrug;
        delete createPresHistoryDto.tenant_id; // Corrected typo here

        createPresHistoryDto.prescription_id = prescription.id;

        await op.pres_mod_history.create({
          data: { ...createPresHistoryDto },
        });
      });
      return { message: 'La historia ha sido creada' };
    } catch (error) {
      throw new Error(`No se ha podido generar la historia ${error.message}`);
    }
  }

  async findByPrescription_id(id: string) {
    try {
      const search = await this.prisma.pres_mod_history.findMany({
        where: { prescription_id: id },
      });
      return search;
    } catch (error) {
      throw new Error(
        `No se ha podido consultar por prescripción ${error.message}`,
      );
    }
  }

  async findByPhysician_id(id: string) {
    try {
      const search = await this.prisma.pres_mod_history.findMany({
        where: { physician_id: id },
      });
      return search;
    } catch (error) {
      throw new Error(`No se ha podido consultar por médico ${error.message}`);
    }
  }

  async findByMedical_event_id(id: string) {
    try {
      const search = await this.prisma.pres_mod_history.findMany({
        where: { medical_event_id: id },
      });
      return search;
    } catch (error) {
      throw new Error(
        `No se ha podido consultar por evento médico ${error.message}`,
      );
    }
  }

  /**
   * Encuentra la entrada más reciente del historial para una prescripción específica
   */
  async findLatestByPrescription_id(prescription_id: string) {
    try {
      const latestHistory = await this.prisma.pres_mod_history.findFirst({
        where: { prescription_id },
        orderBy: { mod_timestamp: 'desc' },
        include: {
          prescription: true,
          physician: {
            select: {
              id: true,
              name: true,
              last_name: true,
            },
          },
        },
      });
      return latestHistory;
    } catch (error) {
      throw new Error(
        `No se ha podido consultar el historial más reciente ${error.message}`,
      );
    }
  }

  /**
   * Crea una entrada de historial simplificada (para medicamentos auto-asignados)
   */
  async createSimplified(data: {
    prescription_id: string;
    physician_id?: string;
    observations?: string;
    dose?: string;
    dose_units?: string;
    frecuency?: string;
    duration?: string;
    duration_units?: string;
  }) {
    try {
      const historyEntry = await this.prisma.pres_mod_history.create({
        data: {
          prescription_id: data.prescription_id,
          physician_id: data.physician_id || null,
          medical_order_id: null,
          medical_event_id: null,
          observations:
            data.observations || 'Medicamento auto-asignado por paciente',
          dose: data.dose || '1',
          dose_units: data.dose_units || 'comprimido',
          frecuency: data.frecuency || 'daily',
          duration: data.duration || '30',
          duration_units: data.duration_units || 'días',
        },
      });
      return historyEntry;
    } catch (error) {
      throw new Error(
        `No se ha podido crear la entrada de historial simplificada ${error.message}`,
      );
    }
  }

  /**
   * Busca historial por prescription_id con detalles completos
   */
  async findByPrescription_idWithDetails(prescription_id: string) {
    try {
      const history = await this.prisma.pres_mod_history.findMany({
        where: { prescription_id },
        include: {
          prescription: true,
          physician: {
            select: {
              id: true,
              name: true,
              last_name: true,
            },
          },
          medical_order: {
            select: {
              id: true,
            },
          },
          medical_event: {
            select: {
              id: true,
            },
          },
        },
        orderBy: { mod_timestamp: 'desc' },
      });
      return history;
    } catch (error) {
      throw new Error(
        `No se ha podido consultar el historial con detalles ${error.message}`,
      );
    }
  }

  /**
   * Valida si una prescripción está activa y puede ser modificada
   */
  async validateActivePrescription(prescription_id: string) {
    try {
      const prescription = await this.prisma.prescription.findFirst({
        where: {
          id: prescription_id,
          active: true,
        },
        include: {
          _count: {
            select: {
              pres_mod_history: true,
            },
          },
        },
      });

      if (!prescription) {
        return {
          isValid: false,
          message: 'La prescripción no existe o no está activa',
          prescription: null,
        };
      }

      return {
        isValid: true,
        message: 'Prescripción válida',
        prescription,
        historyCount: prescription._count.pres_mod_history,
      };
    } catch (error) {
      throw new Error(
        `No se ha podido validar la prescripción ${error.message}`,
      );
    }
  }
}
