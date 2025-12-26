import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PostgresModule } from '../../infrastructure/postgres/postgres.module';
import { UsersRepository } from './users.repository';

@Module({
  imports: [PostgresModule],
  controllers: [],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
