import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/core/database/base.repository';
import { Role } from 'src/generated/client/client';
import { PrismaService } from 'src/infrastructure/postgres/prisma.service';

@Injectable()
export class RolesRepository extends BaseRepository<Role> {
  constructor(prisma: PrismaService) {
    super(prisma, 'roles');
  }
}
