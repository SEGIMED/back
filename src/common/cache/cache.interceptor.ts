import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from './cache.service';
import { CACHE_KEY, CACHE_TTL, CACHE_INVALIDATE } from './cache.decorator';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const cacheKey = this.reflector.get<string>(
      CACHE_KEY,
      context.getHandler(),
    );
    const cacheTTL = this.reflector.get<number>(
      CACHE_TTL,
      context.getHandler(),
    );
    const invalidateCatalog = this.reflector.get<string>(
      CACHE_INVALIDATE,
      context.getHandler(),
    );

    // Handle cache invalidation
    if (invalidateCatalog) {
      return next.handle().pipe(
        tap(() => {
          this.cacheService.invalidateCatalog(invalidateCatalog);
        }),
      );
    }

    // Handle caching
    if (cacheKey) {
      const request = context.switchToHttp().getRequest();
      const args = context.getArgs();

      // Generate cache key based on method arguments
      const fullCacheKey = this.generateCacheKey(cacheKey, args);

      // Try to get from cache
      const cachedResult = this.cacheService.get(fullCacheKey);
      if (cachedResult !== undefined) {
        return of(cachedResult);
      }

      // If not in cache, execute and cache the result
      return next.handle().pipe(
        tap((result) => {
          this.cacheService.set(fullCacheKey, result, cacheTTL);
        }),
      );
    }

    return next.handle();
  }

  private generateCacheKey(prefix: string, args: any[]): string {
    // Create a hash of the arguments to include in cache key
    const argsString = JSON.stringify(args);
    const argsHash = this.simpleHash(argsString);
    return this.cacheService.generateKey(prefix, argsHash);
  }

  private simpleHash(str: string): string {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString();
  }
}
