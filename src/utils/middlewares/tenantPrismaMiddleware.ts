import { Prisma } from '@prisma/client';

export function tenantPrismaMiddleware() {
  return async (params: Prisma.MiddlewareParams, next: Prisma.Middleware) => {
    const tenantRules: Record<
      string,
      { actions: string[]; requireTenantId: boolean }
    > = {
      user: { actions: ['findMany'], requireTenantId: true },
      appointment: {
        actions: ['create', 'findMany', 'findFirst'],
        requireTenantId: true,
      },
      medical_event: {
        actions: ['findMany', 'create', 'update'],
        requireTenantId: true,
      },
      prescription: {
        actions: ['findMany', 'create', 'update'],
        requireTenantId: false,
      },
      transaction: { actions: ['findMany', 'create'], requireTenantId: true },
      organization: { actions: ['update'], requireTenantId: true },
      patient_tenant: { actions: ['create', 'delete'], requireTenantId: true },
    };

    const modelRules = tenantRules[params.model];

    if (!modelRules || !modelRules.actions.includes(params.action)) {
      return next(params, params.args);
    }

    try {
      const tenant_id = params.args?.tenant_id || global.tenant_id;

      // Verificar si ya hay un filtro multi-tenant en el where
      const hasMultiTenantFilter =
        params.args?.where?.tenant_id &&
        typeof params.args.where.tenant_id === 'object' &&
        params.args.where.tenant_id.in;

      // Si ya tiene filtro multi-tenant, permitir la consulta sin modificar
      if (hasMultiTenantFilter) {
        // Solo log en desarrollo para debugging
        if (process.env.NODE_ENV === 'development') {
          console.log(
            `Multi-tenant query detected for ${params.model}, skipping middleware tenant filter`,
          );
        }
        return next(params, params.args);
      }

      if (modelRules.requireTenantId && !tenant_id) {
        throw new Error(
          `Tenant verification failed: missing tenant_id for ${params.model} in ${params.action} action.`,
        );
      }

      if (['create'].includes(params.action)) {
        params.args.data = {
          ...params.args.data,
          tenant_id: tenant_id,
        };
      }

      if (['findMany', 'findFirst', 'findUnique'].includes(params.action)) {
        // Para prescripciones, no aplicar filtro automático de tenant si ya hay lógica OR
        // que incluye consultas multitenant o auto-asignadas
        if (
          params.model === 'prescription' &&
          params.args?.where?.OR &&
          Array.isArray(params.args.where.OR)
        ) {
          // Si ya hay lógica OR en la consulta de prescripciones, no modificar
          // (esto indica que es una consulta multitenant manejada manualmente)
          return next(params, params.args);
        }

        params.args.where = {
          ...params.args.where,
          tenant_id: tenant_id,
        };
      }

      return next(params, params.args);
    } catch (error) {
      console.error('Error in tenantPrismaMiddleware:', error);
      throw new Error(`Middleware error: ${error.message}`);
    }
  };
}
