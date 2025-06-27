import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PresModHistoryService } from './pres_mod_history.service';
import { CreatePresHistoryDto } from './dto/create-pres-history.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiHeader,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Prescription Modification History')
@ApiBearerAuth('JWT')
@ApiHeader({
  name: 'tenant_id',
  description: 'ID del tenant',
  required: true,
})
@Controller('pres-mod-history')
export class PresModHistoryController {
  constructor(private readonly presModHistoryService: PresModHistoryService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear un registro de modificación de prescripción',
    description:
      'Registra los cambios realizados a una prescripción médica, incluyendo el médico responsable y la fecha de modificación.',
  })
  @ApiBody({ type: CreatePresHistoryDto })
  @ApiResponse({
    status: 201,
    description: 'La historia de modificación ha sido creada exitosamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Solicitud inválida (datos faltantes o incorrectos).',
  })
  create(@Body() createPresHistoryDto: CreatePresHistoryDto) {
    return this.presModHistoryService.create(createPresHistoryDto);
  }

  @Get('prescription/:id')
  @ApiOperation({
    summary: 'Obtener historial de modificaciones por ID de prescripción',
    description:
      'Consulta el historial de todas las modificaciones realizadas a una prescripción específica.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la prescripción',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de modificaciones recuperado exitosamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Prescripción no encontrada.',
  })
  findByPrescription_id(@Param('id') id: string) {
    return this.presModHistoryService.findByPrescription_id(id);
  }

  @Get('physician/:id')
  @ApiOperation({
    summary: 'Obtener historial de modificaciones por ID de médico',
    description:
      'Consulta todas las modificaciones de prescripciones realizadas por un médico específico.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del médico',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de modificaciones recuperado exitosamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Médico no encontrado.',
  })
  findByPhysician_id(@Param('id') id: string) {
    return this.presModHistoryService.findByPhysician_id(id);
  }

  @Get('medical_event/:id')
  @ApiOperation({
    summary: 'Obtener historial de modificaciones por ID de evento médico',
    description:
      'Consulta todas las modificaciones de prescripciones asociadas a un evento médico específico.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del evento médico',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de modificaciones recuperado exitosamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Evento médico no encontrado.',
  })
  findByMedical_event_id(@Param('id') id: string) {
    return this.presModHistoryService.findByMedical_event_id(id);
  }
}
