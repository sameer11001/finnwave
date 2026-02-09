import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { FinnWaveModule } from './modules/finnwave.module';
import { UsersController } from './modules/users/users.controller';
import { CoreModule } from './core/core.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CoreModule,
    InfrastructureModule,
    FinnWaveModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
