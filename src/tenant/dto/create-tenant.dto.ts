/* import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { TenantType } from '@prisma/client';

export class CreateTenantDto {

  @IsNotEmpty()
  @IsEnum(TenantType)
  type: TenantType;


  @IsString()
  db_name: string;
}
 */
