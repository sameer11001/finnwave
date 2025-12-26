import { Injectable, NotFoundException } from '@nestjs/common';
import type { IBaseRepository } from '../database/base.repository';

@Injectable()
export abstract class BaseService<T> {
  constructor(protected readonly repository: IBaseRepository<T>) {}

  async findAll(): Promise<T[]> {
    return this.repository.findAll();
  }

  async findById(id: string): Promise<T> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }
    return entity;
  }

  async create(data: any): Promise<T> {
    return this.repository.create(data);
  }

  async update(id: string, data: any): Promise<T> {
    // Check existence first
    await this.findById(id);
    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
