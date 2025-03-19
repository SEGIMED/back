import { Prisma } from '@prisma/client';

export function tenantPrismaMiddleware() {
  return async (params: Prisma.MiddlewareParams, next: Prisma.Middleware) => {
    const tenantRules: Record<
      string,
      { actions: string[]; requireTenantId: boolean }
    > = {
      user: { actions: ['findMany'], requireTenantId: true },
      patient: {
        actions: ['findMany', 'update'],
        requireTenantId: true,
      },
      appointment: {
        actions: ['findMany', 'findFirst'],
        requireTenantId: true,
      },
      medical_event: {
        actions: ['findMany', 'create', 'update'],
        requireTenantId: true,
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
