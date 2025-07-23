import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { CreateEmergencyContactDto } from './dto/create-emergency-contact.dto';
import { EmergencyContactService } from './emergency-contact.service';
import {
  ApiQuery,
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { UpdateEmergencyContactDto } from './dto/update-emergency-contact.dto';

@ApiTags('Emergency Contact')
@ApiBearerAuth('JWT')
@Controller('emergency-contact')
export class EmergencyContactController {
  constructor(
    private readonly emergencyContactService: EmergencyContactService,
  ) {}

  @Post('create')
  @ApiOperation({
    summary: 'Crear contacto de emergencia',
    description: 'Crea un nuevo contacto de emergencia para un paciente.',
  })
  @ApiBody({ type: CreateEmergencyContactDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Contacto de emergencia creado correctamente',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos para crear el contacto de emergencia',
  })
  create(@Body() createEmergencyContactDto: CreateEmergencyContactDto) {
    return this.emergencyContactService.create(createEmergencyContactDto);
  }

  @Get('find-by-patient-id')
  @ApiOperation({
    summary: 'Listar contactos de emergencia por paciente',
    description:
      'Obtiene todos los contactos de emergencia asociados a un paciente, con paginación y ordenamiento opcional.',
  })
  @ApiQuery({
    name: 'patient_id',
    required: true,
    type: String,
    description: 'ID del paciente',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de contactos de emergencia obtenida correctamente',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros inválidos',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Paciente no encontrado',
  })
  findAllByPatientId(@Query('patient_id') patient_id: string) {
    return this.emergencyContactService.findByPatientId(patient_id);
  }

  @Patch('update')
  @ApiOperation({
    summary: 'Actualizar contacto de emergencia',
    description: 'Actualiza los datos de un contacto de emergencia existente.',
  })
  @ApiBody({ type: UpdateEmergencyContactDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contacto de emergencia actualizado correctamente',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos para actualizar el contacto de emergencia',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Contacto de emergencia no encontrado',
  })
  update(@Body() updateEmergencyContactDto: UpdateEmergencyContactDto) {
    return this.emergencyContactService.update(updateEmergencyContactDto);
  }
}
