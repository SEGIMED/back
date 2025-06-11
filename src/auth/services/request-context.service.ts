import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

export interface RequestContextUser {
  id: string;
  role: string;
  tenant_id?: string;
  tenants?: { id: string; name: string; type: string }[];
}

export interface RequestContextTenant {
  id: string;
  type: string;
  db_name?: string;
}

@Injectable()
export class RequestContextService {
  constructor(private readonly cls: ClsService) {}

  // Método helper para verificar si el contexto está disponible
  private isContextAvailable(): boolean {
    try {
      return this.cls.isActive();
    } catch {
      return false;
    }
  }

  // Tenant methods
  setTenantId(tenantId: string): void {
    if (this.isContextAvailable()) {
      this.cls.set('tenantId', tenantId);
    } else {
      console.warn(
        'CLS context not available for setTenantId, falling back to global',
      );
      global.tenant_id = tenantId;
    }
  }

  getTenantId(): string | undefined {
    if (this.isContextAvailable()) {
      return this.cls.get('tenantId') || global.tenant_id;
    }
    return global.tenant_id;
  }

  setTenant(tenant: RequestContextTenant): void {
    if (this.isContextAvailable()) {
      this.cls.set('tenant', tenant);
    }
    // No hay fallback global para el objeto tenant completo
  }

  getTenant(): RequestContextTenant | undefined {
    if (this.isContextAvailable()) {
      return this.cls.get('tenant');
    }
    return undefined;
  }

  // User methods
  setUser(user: RequestContextUser): void {
    if (this.isContextAvailable()) {
      this.cls.set('user', user);
    }
    // No hay fallback global para el objeto user completo
  }

  getUser(): RequestContextUser | undefined {
    if (this.isContextAvailable()) {
      return this.cls.get('user');
    }
    return undefined;
  }

  // User tenants methods (for patients with multiple tenants)
  setUserTenants(tenants: { id: string; name: string; type: string }[]): void {
    if (this.isContextAvailable()) {
      this.cls.set('userTenants', tenants);
    }
  }

  getUserTenants(): { id: string; name: string; type: string }[] | undefined {
    if (this.isContextAvailable()) {
      return this.cls.get('userTenants');
    }
    return undefined;
  }

  // Utility methods
  hasValidTenant(): boolean {
    return !!this.getTenantId();
  }

  isPatientWithMultipleTenants(): boolean {
    const user = this.getUser();
    const tenants = this.getUserTenants();
    return user?.role === 'patient' && tenants && tenants.length > 0;
  }

  // Clear all context (useful for cleanup)
  clearContext(): void {
    if (this.isContextAvailable()) {
      this.cls.set('tenantId', undefined);
      this.cls.set('tenant', undefined);
      this.cls.set('user', undefined);
      this.cls.set('userTenants', undefined);
    }
  }

  // Método para ejecutar código dentro de un contexto CLS
  runWithContext<T>(fn: () => T): T {
    if (this.isContextAvailable()) {
      return fn();
    } else {
      return this.cls.run(fn);
    }
  }
}
