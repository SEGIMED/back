import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { MedicalOrderService } from './medical_order.service';
import { CreateMedicalOrderDto } from './dto/create-medical_order.dto';
import { UpdateMedicalOrderDto } from './dto/update-medical_order.dto';
import { PaginationParams } from 'src/utils/pagination.helper';
import { GetTenant } from 'src/auth/decorators/get-tenant.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { TenantAccessGuard } from 'src/auth/guards/tenant-access.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { RequirePermission } from 'src/auth/decorators/require-permission.decorator';
import { Permission } from 'src/auth/permissions/permission.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';

@Controller('medical-order')
@UseGuards(TenantAccessGuard, PermissionGuard)
export class MedicalOrderController {
  constructor(private readonly medicalOrderService: MedicalOrderService) {}

  @Post()
  @RequirePermission(Permission.CREATE_MEDICAL_ORDERS)
  @UseInterceptors(FileInterceptor('file'))
  create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 10 * 1024 * 1024, // 10MB para PDF
            message: 'El archivo excede el tamaño máximo de 10MB',
          }),
          new FileTypeValidator({
            fileType: /^(image\/(jpg|jpeg|png|webp|svg)|application\/pdf)$/i,
          }),
        ],
        fileIsRequired: false,
      }),
    )
    file: Multer.File,
    @Body() createMedicalOrderDto: CreateMedicalOrderDto,
    @Query('type') orderType: string,
    @GetTenant() tenant,
    @GetUser() user,
  ) {
    return this.medicalOrderService.create(
      createMedicalOrderDto,
      orderType,
      tenant.id,
      user.id,
      file,
    );
  }

  @Get()
  @RequirePermission(Permission.VIEW_MEDICAL_ORDERS)
  findAll(
    @Query() paginationParams: PaginationParams,
    @GetTenant() tenant,
    @Query('type') orderType?: string,
    @Query('patient_id') patientId?: string,
  ) {
    return this.medicalOrderService.findAll(
      paginationParams,
      tenant.id,
      orderType,
      patientId,
    );
  }

  @Get(':id')
  @RequirePermission(Permission.VIEW_MEDICAL_ORDERS)
  findOne(@Param('id') id: string, @GetTenant() tenant) {
    return this.medicalOrderService.findOne(id, tenant.id);
  }

  @Patch(':id')
  @RequirePermission(Permission.UPDATE_MEDICAL_ORDERS)
  update(
    @Param('id') id: string,
    @Body() updateMedicalOrderDto: UpdateMedicalOrderDto,
    @GetTenant() tenant,
  ) {
    return this.medicalOrderService.update(
      id,
      updateMedicalOrderDto,
      tenant.id,
    );
  }

  @Delete(':id')
  @RequirePermission(Permission.DELETE_MEDICAL_ORDERS)
  remove(@Param('id') id: string, @GetTenant() tenant) {
    return this.medicalOrderService.remove(id, tenant.id);
  }
}
