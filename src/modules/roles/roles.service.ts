import { Injectable } from '@nestjs/common';
import { RolesRepository } from './roles.repositry';
import { Role } from '@prisma/client';
import { BaseService } from 'src/core/services/base.service';

@Injectable()
export class RolesService extends BaseService<Role> {
  constructor(private readonly rolesRepository: RolesRepository) {
    super(rolesRepository);
  }
}
