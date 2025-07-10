import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmergencyContactDto } from './dto/create-emergency-contact.dto';
import { EmergencyContact } from './entities/emergency-contact.interface';

@Injectable()
export class EmergencyContactService {
  constructor(private readonly prisma: PrismaService) {}

  async create(request: CreateEmergencyContactDto): Promise<EmergencyContact> {
    const patient = await this.prisma.patient.findUnique({
      where: { id: request.patient_id },
    });

    if (!patient) {
      throw new NotFoundException('Paciente no encontrado');
    }

    const emergencyContact = await this.prisma.emergency_contact.create({
      data: {
        contact_name: request.contact_name,
        relationship: request.relationship,
        email: request.email,
        phone_prefix: request.phone_prefix,
        phone: request.phone,
        patient: {
          connect: {
            id: request.patient_id,
          },
        },
      },
    });

    return {
      id: emergencyContact.id,
      contact_name: emergencyContact.contact_name,
      relationship: emergencyContact.relationship,
      email: emergencyContact.email,
      phone_prefix: emergencyContact.phone_prefix,
      phone: emergencyContact.phone,
    };
  }

  async findAllByPatientId(patient_id: string): Promise<EmergencyContact[]> {
    const emergencyContacts = await this.prisma.emergency_contact.findMany({
      where: { patient_id },
    });

    return emergencyContacts.map((emergencyContact) => ({
      id: emergencyContact.id,
      contact_name: emergencyContact.contact_name,
      relationship: emergencyContact.relationship,
      email: emergencyContact.email,
      phone_prefix: emergencyContact.phone_prefix,
      phone: emergencyContact.phone,
    }));
  }
}
