import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';

@Module({
  imports: [CoreModule, InfrastructureModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
