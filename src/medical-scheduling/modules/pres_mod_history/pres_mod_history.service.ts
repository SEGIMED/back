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
        delete createPresHistoryDto.tenat_id;

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
}
