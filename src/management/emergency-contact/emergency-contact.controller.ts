import { Body, Controller, Delete, Get, Patch, Post, Query } from '@nestjs/common';
import { CreateEmergencyContactDto } from './dto/create-emergency-contact.dto';
import { EmergencyContactService } from './emergency-contact.service';
import { PaginationParams } from 'src/utils/pagination.helper';
import { ApiQuery } from '@nestjs/swagger';
import { UpdateEmergencyContactDto } from './dto/update-emergency-contact.dto';


@Controller('emergency-contact')
export class EmergencyContactController {
  constructor(private readonly emergencyContactService: EmergencyContactService) {}

  @Post('create')
  create(@Body() createEmergencyContactDto: CreateEmergencyContactDto) {
    return this.emergencyContactService.create(createEmergencyContactDto);
  }

  @Get('find-all-by-patient-id')
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Cantidad de resultados por página' })
  @ApiQuery({ name: 'orderBy', required: false, type: String, description: 'Campo por el cual ordenar' })
  @ApiQuery({ name: 'orderDirection', required: false, enum: ['asc', 'desc'], description: 'Dirección de ordenamiento' })
  findAllByPatientId(
    @Query('patient_id') patient_id: string,
    @Query() pagination: PaginationParams
  ) {
    return this.emergencyContactService.findAllByPatientId(patient_id, pagination);
  }

  @Patch('update')
  update(@Body() updateEmergencyContactDto: UpdateEmergencyContactDto) {
    return this.emergencyContactService.update(updateEmergencyContactDto);
  }

  @Delete('delete')
  async delete(@Query('emergency_contact_id') emergency_contact_id: string) {
    await this.emergencyContactService.delete(emergency_contact_id);
    return {message: 'Contacto de emergencia eliminado correctamente'};
  }
}
