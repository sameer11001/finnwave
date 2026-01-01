import { Injectable } from '@nestjs/common';
import { BaseService } from '../../core/services/base.service';
import { User } from './users.entity';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(private readonly usersRepository: UsersRepository) {
    super(usersRepository);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findByPhone(phoneNumber: string): Promise<User | null> {
    return this.usersRepository.findByPhone(phoneNumber);
  }
}
