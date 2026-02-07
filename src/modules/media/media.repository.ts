import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/postgres/prisma.service';
import {
  Media,
  MediaCategory,
  MediaType,
  Prisma,
} from '@prisma/client';

@Injectable()
export class MediaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.MediaCreateInput): Promise<Media> {
    return this.prisma.media.create({ data });
  }

  async findById(id: string): Promise<Media | null> {
    return this.prisma.media.findUnique({
      where: { id },
      include: {
        uploader: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });
  }

  async findByUser(
    userId: string,
    filters: {
      category?: MediaCategory;
      type?: MediaType;
      skip?: number;
      take?: number;
    },
  ): Promise<{ data: Media[]; total: number }> {
    const where: Prisma.MediaWhereInput = {
      uploadedBy: userId,
      ...(filters.category && { category: filters.category }),
      ...(filters.type && { type: filters.type })
        };

    const [data, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        skip: filters.skip,
        take: filters.take,
        orderBy: { uploadedAt: 'desc' },
      }),
      this.prisma.media.count({ where }),
    ]);

    return { data, total };
  }

  async delete(id: string): Promise<Media> {
    return this.prisma.media.delete({
      where: { id },
    });
  }
}
