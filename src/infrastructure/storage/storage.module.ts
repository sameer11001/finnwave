import { Module } from '@nestjs/common';
import { LocalStorageService } from './local-storage.service';

@Module({
  providers: [
    {
      provide: 'STORAGE_SERVICE',
      useClass: LocalStorageService,
    },
  ],
  exports: ['STORAGE_SERVICE'],
})
export class StorageModule {}
