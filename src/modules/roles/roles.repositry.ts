import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { BaseRepository } from 'src/core/database/base.repository';
import { PrismaService } from 'src/infrastructure/postgres/prisma.service';

@Injectable()
export class RolesRepository extends BaseRepository<Role> {
  constructor(prisma: PrismaService) {
    super(prisma, 'roles');
  }
}
