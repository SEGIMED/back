import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmergencyContactDto } from './dto/create-emergency-contact.dto';
import { EmergencyContact } from './entities/emergency-contact.interface';
import { PaginationParams, parsePaginationAndSorting } from 'src/utils/pagination.helper';

@Injectable()
export class EmergencyContactService {
  constructor(private readonly prisma: PrismaService) {}

  async create(request: CreateEmergencyContactDto): Promise<EmergencyContact> {
    console.log(request);
    const patient = await this.prisma.patient.findUnique({
      where: { id: request.patient_id },
    });

    console.log(patient);

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

  async findAllByPatientId(
    patient_id: string,
    pagination: PaginationParams
  ): Promise<{
    currentPage: number;
    totalPages: number;
    totalItems: number;
    data: EmergencyContact[];
  }> {
    const { skip, take, orderBy, orderDirection } = parsePaginationAndSorting(pagination);

    const [emergencyContacts, totalItems] = await this.prisma.$transaction([
      this.prisma.emergency_contact.findMany({
        where: { patient_id },
        skip,
        take,
        orderBy: { [orderBy]: orderDirection },
      }),
      this.prisma.emergency_contact.count({
        where: { patient_id },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / take);
    const page = pagination.page ? parseInt(String(pagination.page), 10) : 1;

    return {
      currentPage: page,
      totalPages,
      totalItems,
      data: emergencyContacts.map((emergencyContact) => ({
        id: emergencyContact.id,
        contact_name: emergencyContact.contact_name,
        relationship: emergencyContact.relationship,
        email: emergencyContact.email,
        phone_prefix: emergencyContact.phone_prefix,
        phone: emergencyContact.phone,
      })),
    };
  }
}
