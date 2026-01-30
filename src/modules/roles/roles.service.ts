import { Injectable } from '@nestjs/common';
import { BaseService } from '../../core/services/base.service';
import { RolesRepository } from './roles.repositry';
import { Role } from 'src/generated/client/client';

@Injectable()
export class RolesService extends BaseService<Role> {
  constructor(private readonly rolesRepository: RolesRepository) {
    super(rolesRepository);
  }
}
