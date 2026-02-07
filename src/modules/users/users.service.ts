import { Injectable } from '@nestjs/common';
import { User } from './users.entity';
import { UsersRepository } from './users.repository';
import { UserWithRole } from './schema/user_with_role';
import { BaseService } from 'src/core/services/base.service';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(private readonly usersRepository: UsersRepository) {
    super(usersRepository);
  }

  async findByEmail(email: string):  Promise<UserWithRole | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findByPhone(phoneNumber: string): Promise<User | null> {
    return this.usersRepository.findByPhone(phoneNumber);
  }
  
}
