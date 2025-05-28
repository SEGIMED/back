import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiHeader,
} from '@nestjs/swagger';
import { OnboardingDto } from './dto/onboarding-user.dto';
import { TenantAccessGuard } from '../../auth/guards/tenant-access.guard';
import { GetTenant } from '../../auth/decorators/get-tenant.decorator';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('onboarding')
  @ApiOperation({
    summary: 'Completa el proceso de onboarding para un usuario',
    description:
      'Completa el registro de un usuario en la plataforma, creando un tenant asociado y configurando detalles específicos del médico',
  })
  @ApiResponse({
    status: 201,
    description: 'El proceso de onboarding se ha completado correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Error en la solicitud - Usuario inexistente o ya es médico',
  })
  onboarding(@Body() onboardingDto: OnboardingDto) {
    return this.userService.onboarding(onboardingDto);
  }
  @Get()
  @UseGuards(TenantAccessGuard)
  @ApiOperation({ summary: 'Obtiene todos los usuarios del tenant actual' })
  @ApiHeader({
    name: 'tenant-id',
    description: 'ID del tenant',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos los usuarios del tenant actual',
  })
  findAll(@GetTenant() tenant_id: string) {
    return this.userService.findAll(tenant_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca un usuario por su ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario a buscar' })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  findOneById(@Param('id') id: string, @GetTenant() tenant_id: string) {
    return this.userService.findOneById(id, tenant_id);
  }
  @Get('email/:email')
  @ApiOperation({ summary: 'Busca un usuario por su dirección de email' })
  @ApiParam({ name: 'email', description: 'Email del usuario a buscar' })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  findOneByEmail(
    @Param('email') email: string,
    @GetTenant() tenant_id: string,
  ) {
    return this.userService.findOneByEmail(email, tenant_id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualiza los datos de un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario a actualizar' })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Error en la solicitud',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Elimina un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario a eliminar' })
  @ApiResponse({
    status: 200,
    description: 'Usuario eliminado correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
