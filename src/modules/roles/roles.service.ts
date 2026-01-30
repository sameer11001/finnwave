import { Injectable } from '@nestjs/common';
import { BaseService } from '../../core/services/base.service';
import { User } from '../users/users.entity';
import { RolesRepository } from './roles.repositry';

@Injectable()
export class RolesService extends BaseService<User> {
  constructor(private readonly rolesRepository: RolesRepository) {
    super(rolesRepository);
  }
  
}
