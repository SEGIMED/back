import { Prisma } from '@prisma/client';

export function loggingPrismaMiddleware() {
  return async (params: Prisma.MiddlewareParams, next: Prisma.Middleware) => {
    const start = Date.now();

    // Log antes de ejecutar la consulta
    console.log(`\n🔍 [PRISMA QUERY] ${params.model}.${params.action}`);
    console.log(`📊 Args:`, JSON.stringify(params.args, null, 2));

    const result = await next(params, params.args);

    const end = Date.now();
    const duration = end - start;

    // Log después de ejecutar la consulta
    console.log(`⏱️  Duration: ${duration}ms`);

    // Log del número de resultados si es aplicable
    if (Array.isArray(result)) {
      console.log(`📋 Results count: ${result.length}`);
    } else if (result && typeof result === 'object') {
      console.log(`📄 Single result returned`);
    } else if (result === null) {
      console.log(`❌ No result found`);
    }

    // Advertir sobre consultas lentas
    if (duration > 1000) {
      console.log(`⚠️  SLOW QUERY WARNING: ${duration}ms`);
    }

    console.log(`✅ [QUERY COMPLETED] ${params.model}.${params.action}\n`);

    return result;
  };
}
