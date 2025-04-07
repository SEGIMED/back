export class JwtPayloadDto {
  email: string;
  id: string;
  name: string;
  last_name: string;
  role: string;
  image: string;
  tenant_id?: string;
  tenants?: TenantDto[];
}

export class TenantDto {
  id: string;
  name: string;
  type: string;
}

export class LoginResponseDto {
  message: string;
  jwt: string;
  user: JwtPayloadDto;
}
