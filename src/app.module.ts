import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { FinnWaveModule } from './modules/finnwave.module';
import { UsersController } from './modules/users/users.controller';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { RefreshTokenController } from './refresh_token/refresh_token.controller';
import { RefreshTokenModule } from './refresh_token/refresh_token.module';
import { RefreshTokenModule } from './refresh_token/refresh_token.module';
import { RolesModule } from './roles/roles.module';
import { RefreshTokenModule } from './refresh_token/refresh_token.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CoreModule,
    InfrastructureModule,
    FinnWaveModule,
    UsersModule,
    AuthModule,
    RefreshTokenModule,
    RolesModule,
  ],
  controllers: [AppController, UsersController, RefreshTokenController],
  providers: [AppService],
})
export class AppModule {}
