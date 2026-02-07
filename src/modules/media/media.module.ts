import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { MediaRepository } from './media.repository';
import { StorageModule } from '../../infrastructure/storage/storage.module';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';
import { MongodbModule } from '../../infrastructure/mongodb/mongodb.module';
import { CoreModule } from 'src/core/core.module';
import { AuthModule } from '../auth/auth.module';


@Module({
  imports: [StorageModule, InfrastructureModule, MongodbModule,CoreModule,AuthModule],
  controllers: [MediaController],
  providers: [MediaService, MediaRepository],
  exports: [MediaService, MediaRepository],
})
export class MediaModule {}
