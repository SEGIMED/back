import { Module, DynamicModule, Global } from '@nestjs/common';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({})
export class MongooseConfigModule {
  static forRootAsync(): DynamicModule {
    return {
      module: MongooseConfigModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: 'MONGOOSE_CONFIG_OPTIONS',
          useFactory: async (
            configService: ConfigService,
          ): Promise<MongooseModuleOptions> => ({
            uri: configService.get<string>('DB_CHAT'),
          }),
          inject: [ConfigService],
        },
      ],
      exports: ['MONGOOSE_CONFIG_OPTIONS'],
    };
  }
}
