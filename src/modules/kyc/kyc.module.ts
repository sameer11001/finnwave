import { Module } from '@nestjs/common';
import { KycController } from './kyc.controller';
import { KycService } from './kyc.service';
import { KycRepository } from './kyc.repository';
import { MediaModule } from '../media/media.module';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';
import { MongodbModule } from '../../infrastructure/mongodb/mongodb.module';
import { AuditService } from '../../common/services/audit.service';

@Module({
  imports: [MediaModule, InfrastructureModule, MongodbModule],
  controllers: [KycController],
  providers: [KycService, KycRepository, AuditService],
  exports: [KycService, KycRepository],
})
export class KycModule {}
