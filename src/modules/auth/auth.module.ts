import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TokenService } from './services/token.service';
import { SessionService } from './services/session.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    UsersModule,
    ConfigModule,
    InfrastructureModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          global: true,
          secret: config.get('JWT_SECRET'),
          signOptions: { expiresIn: '10m' },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    SessionService,
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [TokenService, SessionService, JwtAuthGuard],
})
export class AuthModule {}
