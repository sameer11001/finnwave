import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { FinnWaveModule } from './modules/finnwave.module';
import { UsersController } from './modules/users/users.controller';


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
  controllers: [AppController, UsersController],
  providers: [AppService],
})
export class AppModule {}
