import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { MediaRepository } from './media.repository';
import { StorageModule } from '../../infrastructure/storage/storage.module';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';
import { MongodbModule } from '../../infrastructure/mongodb/mongodb.module';
import { AuditService } from '../../common/services/audit.service';

@Module({
  imports: [StorageModule, InfrastructureModule, MongodbModule],
  controllers: [MediaController],
  providers: [MediaService, MediaRepository, AuditService],
  exports: [MediaService, MediaRepository],
})
export class MediaModule {}
