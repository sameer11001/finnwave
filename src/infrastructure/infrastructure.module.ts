import { Module } from '@nestjs/common';
import { PostgresModule } from './postgres/postgres.module';
import { MongodbModule } from './mongodb/mongodb.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [PostgresModule, MongodbModule, StorageModule],
  exports: [PostgresModule, MongodbModule, StorageModule],
})
export class InfrastructureModule {}
