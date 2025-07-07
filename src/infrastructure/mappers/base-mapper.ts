/**
 * Base Entity Mapper
 * Provides common mapping functionality between domain entities and database entities
 */
export abstract class EntityMapper<DomainEntity, DatabaseEntity> {
  /**
   * Maps a database entity to a domain entity
   */
  abstract toDomain(entity: DatabaseEntity): DomainEntity;

  /**
   * Maps a domain entity to a database entity (for creation)
   */
  abstract toEntity(domain: DomainEntity): Partial<DatabaseEntity>;

  /**
   * Maps a domain entity to a database entity (for updates)
   */
  abstract toEntityForUpdate(domain: DomainEntity): Partial<DatabaseEntity>;

  /**
   * Maps an array of database entities to domain entities
   */
  toDomainList(entities: DatabaseEntity[]): DomainEntity[] {
    return entities.map((entity) => this.toDomain(entity));
  }

  /**
   * Maps a database entity to domain entity with null check
   */
  toDomainOrNull(entity: DatabaseEntity | null): DomainEntity | null {
    return entity ? this.toDomain(entity) : null;
  }

  /**
   * Validates and maps a database entity to domain entity
   * Throws error if entity is null
   */
  toDomainOrThrow(entity: DatabaseEntity | null, errorMessage: string): DomainEntity {
    if (!entity) {
      throw new Error(errorMessage);
    }
    return this.toDomain(entity);
  }
}
