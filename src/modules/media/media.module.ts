import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { MediaRepository } from './media.repository';
import { StorageModule } from '../../infrastructure/storage/storage.module';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';
import { MongodbModule } from '../../infrastructure/mongodb/mongodb.module';
import { CoreModule } from 'src/core/core.module';
import { AuthModule } from '../auth/auth.module';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MulterModule } from '@nestjs/platform-express';


@Module({
  imports: [StorageModule, InfrastructureModule, MongodbModule,CoreModule,AuthModule,MulterModule.register({
      storage: diskStorage({
        destination: './uploads/temp', // Ensure this folder exists!
        filename: (req, file, cb) => {
          const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),],
  controllers: [MediaController],
  providers: [MediaService, MediaRepository],
  exports: [MediaService, MediaRepository],
})
export class MediaModule {}
