import type { User as DomainUser } from '@domain/entities/auth';
import type { AuthRepository } from '@domain/repositories/auth-repository';
import type { Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { User } from '../database/entities/user.entity';
import { UserMapper } from '../mappers/user-mapper';
import { BaseRepository } from './base-repository';

export class TypeOrmAuthRepository
  extends BaseRepository<DomainUser, User>
  implements AuthRepository
{
  protected repository: Repository<User>;
  protected mapper: UserMapper;

  constructor() {
    super();
    this.repository = AppDataSource.getRepository(User);
    this.mapper = new UserMapper();
  }

  async findUserByEmail(email: string): Promise<DomainUser | null> {
    return this.findEntityByWhere({ email } as any);
  }

  async findUserById(id: number): Promise<DomainUser | null> {
    return this.findEntityById(id);
  }

  async findAllUsers(): Promise<DomainUser[]> {
    return this.findAllEntities();
  }

  async createUser(
    name: string,
    email: string,
    hashedPassword: string,
    role: 'admin' | 'client' = 'client',
  ): Promise<DomainUser> {
    const userEntity = this.repository.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const saved = await this.repository.save(userEntity);
    return this.mapper.toDomain(saved);
  }

  async updateUser(
    id: number,
    updates: Partial<Pick<DomainUser, 'name' | 'email' | 'password' | 'role'>>,
  ): Promise<DomainUser> {
    const updateData = this.mapper.toEntityForPartialUpdate(updates);
    return this.updateEntityByIdPartial(id, updateData);
  }

  async deleteUser(id: number): Promise<void> {
    return this.deleteEntityById(id);
  }
}
