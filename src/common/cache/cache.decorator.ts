import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY = 'cache_key';
export const CACHE_TTL = 'cache_ttl';
export const CACHE_INVALIDATE = 'cache_invalidate';

/**
 * Decorator to cache the result of a method
 * @param keyPrefix - Prefix for the cache key
 * @param ttl - Time to live in seconds (optional)
 */
export const CacheResult = (keyPrefix: string, ttl?: number) => {
  return (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) => {
    SetMetadata(CACHE_KEY, keyPrefix)(target, propertyName, descriptor);
    if (ttl !== undefined) {
      SetMetadata(CACHE_TTL, ttl)(target, propertyName, descriptor);
    }
  };
};

/**
 * Decorator to invalidate cache for a specific catalog
 * @param catalogName - Name of the catalog to invalidate
 */
export const InvalidateCache = (catalogName: string) => {
  return (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) => {
    SetMetadata(CACHE_INVALIDATE, catalogName)(
      target,
      propertyName,
      descriptor,
    );
  };
};
