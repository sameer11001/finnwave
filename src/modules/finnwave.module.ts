import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { MediaModule } from './media/media.module';
import { KycModule } from './kyc/kyc.module';

@Module({
  imports: [AuthModule, UsersModule,RolesModule,MediaModule,KycModule],
})
export class FinnWaveModule {}
