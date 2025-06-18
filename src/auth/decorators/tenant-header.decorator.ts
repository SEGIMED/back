import { applyDecorators } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';

/**
 * Decorator que documenta el header de tenant-id como opcional
 * cuando el JWT contiene información de tenant
 */
export function ApiOptionalTenantHeader() {
  return applyDecorators(
    ApiHeader({
      name: 'tenant-id',
      description:
        'ID del tenant (opcional si el JWT contiene información de tenant)',
      required: false,
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
  );
}

/**
 * Decorator para casos donde el tenant ID es requerido explícitamente
 * (por ejemplo, para pacientes con múltiples tenants)
 */
export function ApiRequiredTenantHeader() {
  return applyDecorators(
    ApiHeader({
      name: 'tenant-id',
      description: 'ID del tenant requerido',
      required: true,
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
  );
}
