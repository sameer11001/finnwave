import { Injectable } from "@nestjs/common";
import { BaseRepository } from 'src/core/database/base.repository';
import { User } from "../users/users.entity";
import { PrismaService } from 'src/infrastructure/postgres/prisma.service';

@Injectable()
export class RolesRepository extends BaseRepository<User> {
    constructor(prisma:PrismaService) {
        super(prisma,'roles');
    }

}
