import { Prisma } from '@prisma/client';

export function tenantPrismaMiddleware() {
  return async (params: Prisma.MiddlewareParams, next: Prisma.Middleware) => {
    const modelsRequiringTenancy = [
      'patient',
      'appointment',
      'medical_event',
      'transaction',
      'organization',
    ];

    if (
      modelsRequiringTenancy.includes(params.model) &&
      [
        'findMany',
        'findFirst',
        'findUnique',
        'create',
        'update',
        'delete',
      ].includes(params.action)
    ) {
      const tenantId = params.args?.data?.tenant_id;

      if (!tenantId) {
        throw new Error(
          `Tenant verification failed: missing tenantId for ${params.model} in ${params.action} action.`,
        );
      }

      if (['findMany', 'findFirst', 'findUnique'].includes(params.action)) {
        console.log(params.args);
        if (!params.args.where) {
          params.args.where = {};
        }

        params.args.where['tenant_id'] = tenantId;
      }

      if (['create', 'update'].includes(params.action)) {
        if (!params.args.data) {
          params.args.data = {};
        }

        params.args.data['tenant_id'] = tenantId;
      }
    }

    return next(params, params.args);
  };
}
