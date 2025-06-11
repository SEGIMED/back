import { ConfigService } from '@nestjs/config';

export interface LoggingConfig {
  enablePrismaQueries: boolean;
  enableDetailedQueries: boolean;
  enableCacheLogs: boolean;
  enableSlowQueryWarning: boolean;
  slowQueryThreshold: number; // in milliseconds
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export class LoggingConfigService {
  private config: LoggingConfig;

  constructor(private configService: ConfigService) {
    this.config = {
      enablePrismaQueries: this.configService.get<boolean>(
        'ENABLE_PRISMA_LOGS',
        true,
      ),
      enableDetailedQueries: this.configService.get<boolean>(
        'ENABLE_DETAILED_QUERY_LOGS',
        process.env.NODE_ENV === 'development',
      ),
      enableCacheLogs: this.configService.get<boolean>(
        'ENABLE_CACHE_LOGS',
        true,
      ),
      enableSlowQueryWarning: this.configService.get<boolean>(
        'ENABLE_SLOW_QUERY_WARNING',
        true,
      ),
      slowQueryThreshold: this.configService.get<number>(
        'SLOW_QUERY_THRESHOLD_MS',
        1000,
      ),
      logLevel: this.configService.get<'debug' | 'info' | 'warn' | 'error'>(
        'LOG_LEVEL',
        'info',
      ),
    };
  }

  get enablePrismaQueries(): boolean {
    return this.config.enablePrismaQueries;
  }

  get enableDetailedQueries(): boolean {
    return this.config.enableDetailedQueries;
  }

  get enableCacheLogs(): boolean {
    return this.config.enableCacheLogs;
  }

  get enableSlowQueryWarning(): boolean {
    return this.config.enableSlowQueryWarning;
  }

  get slowQueryThreshold(): number {
    return this.config.slowQueryThreshold;
  }

  get logLevel(): string {
    return this.config.logLevel;
  }

  shouldLogLevel(level: 'debug' | 'info' | 'warn' | 'error'): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.logLevel);
    const targetLevelIndex = levels.indexOf(level);
    return targetLevelIndex >= currentLevelIndex;
  }

  /**
   * Dynamic configuration update (useful for runtime debugging)
   */
  updateConfig(updates: Partial<LoggingConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  getConfig(): LoggingConfig {
    return { ...this.config };
  }
}
