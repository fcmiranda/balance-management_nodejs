import type { User as DomainUser } from '@domain/entities/auth';
import type { AuthRepository } from '@domain/repositories/auth-repository';
import type { Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { User } from '../database/entities/user.entity';

export class TypeOrmAuthRepository implements AuthRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  async findUserByEmail(email: string): Promise<DomainUser | null> {
    const entity = await this.repository.findOne({ where: { email } });
    if (!entity) return null;

    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      password: entity.password,
      role: entity.role,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  async findUserById(id: number): Promise<DomainUser | null> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) return null;

    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      password: entity.password,
      role: entity.role,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  async createUser(
    name: string,
    email: string,
    hashedPassword: string,
    role: 'admin' | 'client' = 'client',
  ): Promise<DomainUser> {
    const entity = this.repository.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const saved = await this.repository.save(entity);
    return {
      id: saved.id,
      name: saved.name,
      email: saved.email,
      password: saved.password,
      role: saved.role,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }

  async updateUser(
    id: number,
    updates: Partial<Pick<DomainUser, 'name' | 'email' | 'password' | 'role'>>,
  ): Promise<DomainUser> {
    await this.repository.update(id, updates);
    const updated = await this.repository.findOne({ where: { id } });

    if (!updated) {
      throw new Error('User not found after update');
    }

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      password: updated.password,
      role: updated.role,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async deleteUser(id: number): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) {
      throw new Error('User not found');
    }
  }
}
