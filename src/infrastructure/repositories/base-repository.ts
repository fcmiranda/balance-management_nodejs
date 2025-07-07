import type { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';
import type { EntityMapper } from '../mappers/base-mapper';

/**
 * Base Repository
 * Provides common repository operations using entity mappers
 */
export abstract class BaseRepository<DomainEntity, DatabaseEntity> {
  protected abstract repository: Repository<DatabaseEntity>;
  protected abstract mapper: EntityMapper<DomainEntity, DatabaseEntity>;

  /**
   * Find entity by ID
   */
  protected async findEntityById(id: number): Promise<DomainEntity | null> {
    const entity = await this.repository.findOne({
      where: { id } as unknown as FindOptionsWhere<DatabaseEntity>,
    });
    return this.mapper.toDomainOrNull(entity);
  }

  /**
   * Find all entities
   */
  protected async findAllEntities(): Promise<DomainEntity[]> {
    const entities = await this.repository.find();
    return this.mapper.toDomainList(entities);
  }

  /**
   * Save entity
   */
  protected async saveEntity(domain: DomainEntity): Promise<DomainEntity> {
    const entityData = this.mapper.toEntity(domain);
    const entity = this.repository.create(entityData as DeepPartial<DatabaseEntity>);
    const saved = await this.repository.save(entity);
    return this.mapper.toDomain(saved);
  }

  /**
   * Update entity by ID
   */
  protected async updateEntityById(id: number, domain: DomainEntity): Promise<DomainEntity> {
    const updateData = this.mapper.toEntityForUpdate(domain);
    await this.repository.update(id, updateData as any);

    const updated = await this.repository.findOne({
      where: { id } as unknown as FindOptionsWhere<DatabaseEntity>,
    });
    return this.mapper.toDomainOrThrow(updated, `Entity with id ${id} not found after update`);
  }

  /**
   * Update entity by ID with partial data
   */
  protected async updateEntityByIdPartial(
    id: number,
    updateData: Partial<DatabaseEntity>,
  ): Promise<DomainEntity> {
    await this.repository.update(id, updateData as any);

    const updated = await this.repository.findOne({
      where: { id } as unknown as FindOptionsWhere<DatabaseEntity>,
    });
    return this.mapper.toDomainOrThrow(updated, `Entity with id ${id} not found after update`);
  }

  /**
   * Delete entity by ID
   */
  protected async deleteEntityById(id: number): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) {
      throw new Error(`Entity with id ${id} not found`);
    }
  }

  /**
   * Find entities by criteria
   */
  protected async findEntitiesByWhere(
    where: FindOptionsWhere<DatabaseEntity>,
  ): Promise<DomainEntity[]> {
    const entities = await this.repository.find({ where });
    return this.mapper.toDomainList(entities);
  }

  /**
   * Find single entity by criteria
   */
  protected async findEntityByWhere(
    where: FindOptionsWhere<DatabaseEntity>,
  ): Promise<DomainEntity | null> {
    const entity = await this.repository.findOne({ where });
    return this.mapper.toDomainOrNull(entity);
  }
}
