import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { MediaRepository } from './media.repository';
import { StorageModule } from '../../infrastructure/storage/storage.module';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';
import { MongodbModule } from '../../infrastructure/mongodb/mongodb.module';
import { CoreModule } from 'src/core/core.module';
import { AuthModule } from '../auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import path from 'path';

@Module({
  imports: [
    StorageModule,
    InfrastructureModule,
    MongodbModule,
    CoreModule,
    AuthModule,
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService, MediaRepository],
  exports: [MediaService, MediaRepository],
})
export class MediaModule {}
