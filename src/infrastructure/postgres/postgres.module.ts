import { Module } from '@nestjs/common';
import { PostgresServiceTsService } from './postgres.service.ts.service';

@Module({
  providers: [ PostgresServiceTsService]
})
export class PostgresModule {}
