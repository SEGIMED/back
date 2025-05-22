import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiParam,
} from '@nestjs/swagger';
import { PrescriptionService } from './prescription.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';

@ApiTags('Prescriptions')
@Controller('prescription')
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new prescription' })
  @ApiResponse({
    status: 201,
    description: 'Prescription created successfully.',
    type: CreatePrescriptionDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden resource.' })
  @ApiBearerAuth('access-token')
  @ApiHeader({
    name: 'X-Tenant-ID',
    description: 'Tenant ID',
    required: true,
  })
  create(@Body() createPrescriptionDto: CreatePrescriptionDto) {
    return this.prescriptionService.create(createPrescriptionDto);
  }

  @Get('patient/:id')
  @ApiOperation({ summary: 'Get all prescriptions for a specific patient' })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved patient's prescriptions.",
    isArray: true,
    type: CreatePrescriptionDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid patient ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden resource.' })
  @ApiResponse({ status: 404, description: 'Patient not found.' })
  @ApiBearerAuth('access-token')
  @ApiHeader({
    name: 'X-Tenant-ID',
    description: 'Tenant ID',
    required: true,
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: "Patient's unique identifier",
  })
  findAllById(@Param('id') id: string) {
    this.prescriptionService.findAllById(id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all prescriptions (potentially for admin/system use)',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all prescriptions.',
    isArray: true,
    type: CreatePrescriptionDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden resource.' })
  @ApiBearerAuth('access-token')
  @ApiHeader({
    name: 'X-Tenant-ID',
    description: 'Tenant ID',
    required: false,
  })
  findAll() {
    return this.prescriptionService.findAll();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a prescription by its ID' })
  @ApiResponse({
    status: 200,
    description: 'Prescription deleted successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid ID supplied.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden resource.' })
  @ApiResponse({ status: 404, description: 'Prescription not found.' })
  @ApiBearerAuth('access-token')
  @ApiHeader({
    name: 'X-Tenant-ID',
    description: 'Tenant ID',
    required: true,
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Prescription unique identifier',
  })
  remove(@Param('id') id: string) {
    return this.prescriptionService.remove(id);
  }

  // @IsOptional()
  // medical_order_id:string?
}
