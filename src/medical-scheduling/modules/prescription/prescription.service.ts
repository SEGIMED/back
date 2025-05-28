import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface MedicationItemInterface {
  monodrug: string;
  dose: string;
  dose_units: string;
  frecuency: string;
  duration: string;
  duration_units: string;
  observations?: string;
}

@Injectable()
export class PrescriptionService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createPrescriptionDto: CreatePrescriptionDto) {
    try {
      await this.prisma.prescription.create({
        data: { ...createPrescriptionDto },
      });
      return { message: 'La prescripción ha sido correctamente generada' };
    } catch (error) {
      throw new Error(
        `No se ha podido generar la prescripción ${error.message}`,
      );
    }
  }

  async findAll() {
    try {
      const prescriptions = await this.prisma.prescription.findMany({
        where: {
          active: true,
        },
      });
      return prescriptions;
    } catch (error) {
      throw new Error(
        `No se ha podido consultar las prescripciones ${error.message}`,
      );
    }
  }

  async findAllById(id: string) {
    try {
      const prescriptions = await this.prisma.prescription.findMany({
        where: {
          AND: [{ active: true }, { patient_id: id }],
        },
      });
      return prescriptions;
    } catch (error) {
      throw new Error(
        `No se ha podido consultar las prescripciones ${error.message}`,
      );
    }
  }

  async remove(id: string) {
    try {
      const prescription = await this.prisma.prescription.update({
        where: { id: id },
        data: { active: false },
      });
      if (!prescription)
        throw new NotFoundException('La prescripción no ha sido localizada');
      return { message: 'La prescripción ha sido eliminada' };
    } catch (error) {
      throw new Error(
        `No se ha podido eliminar la prescripción ${error.message}`,
      );
    }
  }

  /**
   * Procesa las medicaciones para una orden médica o consulta médica
   * @param tx Cliente Prisma transaccional
   * @param medications Lista de medicaciones a procesar
   * @param patientId ID del paciente
   * @param physicianId ID del médico
   * @param tenantId ID del tenant
   * @param medicalEventId ID del evento médico (opcional)
   * @param medicalOrderId ID de la orden médica (opcional)
   * @param isAuthorized Indica si la medicación está autorizada
   */
  async processMedications(
    tx: Prisma.TransactionClient,
    medications: MedicationItemInterface[],
    patientId: string,
    physicianId: string,
    tenantId: string,
    medicalEventId?: string,
    medicalOrderId?: string,
    isAuthorized: boolean = true,
  ): Promise<void> {
    for (const medication of medications) {
      // Verificar si ya existe una prescripción activa para este medicamento
      const existingPrescription = await tx.prescription.findFirst({
        where: {
          patient_id: patientId,
          monodrug: medication.monodrug,
          active: true,
        },
      });

      if (existingPrescription) {
        // Si ya existe una prescripción activa, crear una nueva entrada en el historial
        await tx.pres_mod_history.create({
          data: {
            prescription_id: existingPrescription.id,
            physician_id: physicianId,
            medical_order_id: medicalOrderId || null,
            medical_event_id: medicalEventId || null,
            observations: medication.observations,
            dose: medication.dose,
            dose_units: medication.dose_units,
            frecuency: medication.frecuency,
            duration: medication.duration,
            duration_units: medication.duration_units,
          },
        });
      } else {
        // Si no existe, crear nueva prescripción y su primer entrada en el historial
        const newPrescription = await tx.prescription.create({
          data: {
            patient_id: patientId,
            monodrug: medication.monodrug,
            active: true,
            authorized: isAuthorized,
            tenant_id: tenantId,
          },
        });

        // Crear la primera entrada en el historial
        await tx.pres_mod_history.create({
          data: {
            prescription_id: newPrescription.id,
            physician_id: physicianId,
            medical_order_id: medicalOrderId || null,
            medical_event_id: medicalEventId || null,
            observations: medication.observations,
            dose: medication.dose,
            dose_units: medication.dose_units,
            frecuency: medication.frecuency,
            duration: medication.duration,
            duration_units: medication.duration_units,
          },
        });
      }
    }
  }
}
