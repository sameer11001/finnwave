import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/core/database/base.repository';
import { User } from './users.entity';
import { PrismaService } from 'src/infrastructure/postgres/prisma.service';


@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(prisma: PrismaService) {
    super(prisma, 'user');
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
}
