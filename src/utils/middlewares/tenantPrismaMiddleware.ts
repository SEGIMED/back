import { Prisma } from '@prisma/client';

export function tenantPrismaMiddleware() {
  return async (params: Prisma.MiddlewareParams, next: Prisma.Middleware) => {
    const tenantRules: Record<
      string,
      { actions: string[]; requireTenantId: boolean }
    > = {
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
      tenant: { actions: ['findUnique'], requireTenantId: false },
      transaction: { actions: ['findMany', 'create'], requireTenantId: true },
      organization: { actions: ['create'], requireTenantId: true },
      patient_tenant: { actions: ['create', 'delete'], requireTenantId: true },
    };

    const modelRules = tenantRules[params.model];

    if (!modelRules || !modelRules.actions.includes(params.action)) {
      return next(params, params.args);
    }
    console.log(params);
    if (modelRules.requireTenantId) {
      const tenantId =
        params.args?.data?.tenant_id ?? params.args?.where?.tenant_id;
      if (!tenantId) {
        throw new Error(
          `Tenant verification failed: missing tenant_id for ${params.model} in ${params.action} action.`,
        );
      }
    }

    if (
      ['findMany', 'findFirst', 'findUnique'].includes(params.action) &&
      modelRules.requireTenantId
    ) {
      params.args.where = {
        ...params.args.where,
        tenant_id:
          params.args?.where?.tenant_id ?? params.args?.data?.tenant_id,
      };
    }

    if (
      ['create', 'update'].includes(params.action) &&
      modelRules.requireTenantId
    ) {
      params.args.data = {
        ...params.args.data,
        tenant_id: params.args.data?.tenant_id ?? params.args?.where?.tenant_id,
      };
    }

    return next(params, params.args);
  };
}
