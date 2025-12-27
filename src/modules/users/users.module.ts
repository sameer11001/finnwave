import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PostgresModule } from '../../infrastructure/postgres/postgres.module';
import { UsersRepository } from './users.repository';
import { UsersController } from './users.controller';

@Module({
  imports: [PostgresModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
