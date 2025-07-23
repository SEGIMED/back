import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmergencyContactDto } from './dto/create-emergency-contact.dto';
import { EmergencyContact } from './entities/emergency-contact.interface';
import { UpdateEmergencyContactDto } from './dto/update-emergency-contact.dto';

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
        patient_id: request.patient_id,
        created_at: new Date(),
        updated_at: new Date(),
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

  async findByPatientId(patient_id: string): Promise<EmergencyContact | null> {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patient_id },
    });
    if (!patient)
      throw new NotFoundException(
        `Paciente con id '${patient_id}' no encontrado`,
      );

    const emergencyContact = await this.prisma.emergency_contact.findUnique({
      where: { patient_id },
    });

    if (!emergencyContact) return null;

    return {
      id: emergencyContact.id,
      contact_name: emergencyContact.contact_name,
      relationship: emergencyContact.relationship,
      email: emergencyContact.email,
      phone_prefix: emergencyContact.phone_prefix,
      phone: emergencyContact.phone,
    };
  }

  async update(updateEmergencyContactDto: UpdateEmergencyContactDto) {
    const { emergency_contact_id, ...data } = updateEmergencyContactDto;

    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined),
    );

    const exists = await this.prisma.emergency_contact.findUnique({
      where: { id: emergency_contact_id },
    });

    if (!exists) {
      throw new NotFoundException('El contacto de emergencia no existe');
    }

    const emergencyContact = await this.prisma.emergency_contact.update({
      where: { id: emergency_contact_id },
      data: filteredData,
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
}
