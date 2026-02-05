import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/core/database/base.repository';
import { User } from './users.entity';
import { PrismaService } from 'src/infrastructure/postgres/prisma.service';
import { UserWithRole } from './schema/user_with_role';



@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(prisma: PrismaService) {
    super(prisma, 'user');
  }


  async findByEmail(email: string) : Promise<UserWithRole | null> {
  return this.prisma.user.findUnique({
    where: { email },
    include: { role: {
      select: {
        name: true,
      },
    }, 
  },
  });
}

  async findByPhone(phone: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { phone },
    });
  }
  
}
