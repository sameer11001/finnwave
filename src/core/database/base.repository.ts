import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/postgres/prisma.service';

export interface IBaseRepository<T> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(data: any): Promise<T>;
  update(id: string, data: any): Promise<T>;
  delete(id: string): Promise<void>;
}

@Injectable()
export abstract class BaseRepository<T> implements IBaseRepository<T> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly modelName: string,
  ) {}

  protected get model(): any {
    return (this.prisma as any)[this.modelName];
  }

  async findAll(): Promise<T[]> {
    return await this.model.findMany();
  }

  async findById(id: string): Promise<T | null> {
    return await this.model.findUnique({
      where: { id },
    });
  }

  async create(data: any): Promise<T> {
    return await this.model.create({
      data,
    });
  }

  async update(id: string, data: any): Promise<T> {
    return await this.model.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.model.delete({
      where: { id },
    });
  }
}
