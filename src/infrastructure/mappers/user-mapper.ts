import type { User as DomainUser } from '@domain/entities/auth';
import type { User as DatabaseUser } from '../database/entities/user.entity';
import { EntityMapper } from './base-mapper';

/**
 * User Entity Mapper
 * Handles mapping between domain User and database User entities
 */
export class UserMapper extends EntityMapper<DomainUser, DatabaseUser> {
  /**
   * Maps a database User entity to a domain User entity
   */
  toDomain(entity: DatabaseUser): DomainUser {
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

  /**
   * Maps a domain User entity to a database User entity for creation
   */
  toEntity(domain: DomainUser): Partial<DatabaseUser> {
    return {
      name: domain.name,
      email: domain.email,
      password: domain.password,
      role: domain.role,
    };
  }

  /**
   * Maps a domain User entity to a database User entity for updates
   */
  toEntityForUpdate(domain: DomainUser): Partial<DatabaseUser> {
    const updateData: Partial<DatabaseUser> = {};

    if (domain.name) updateData.name = domain.name;
    if (domain.email) updateData.email = domain.email;
    if (domain.password) updateData.password = domain.password;
    if (domain.role) updateData.role = domain.role;

    return updateData;
  }

  /**
   * Maps partial domain User data to database User entity for updates
   */
  toEntityForPartialUpdate(
    updates: Partial<Pick<DomainUser, 'name' | 'email' | 'password' | 'role'>>,
  ): Partial<DatabaseUser> {
    const updateData: Partial<DatabaseUser> = {};

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.password !== undefined) updateData.password = updates.password;
    if (updates.role !== undefined) updateData.role = updates.role;

    return updateData;
  }
}
