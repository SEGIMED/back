import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TenantModule } from './tenant/tenant.module';

@Module({
  imports: [UserModule, TenantModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
