import { Client as DomainClient } from '@domain/entities/client';
import type { ClientRepository } from '@domain/repositories/client-repository';
import type { Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { Client } from '../database/entities/client.entity';

export class TypeOrmClientRepository implements ClientRepository {
  private repository: Repository<Client>;

  constructor() {
    this.repository = AppDataSource.getRepository(Client);
  }

  async findAll(): Promise<DomainClient[]> {
    const entities = await this.repository.find();
    return entities.map((entity) =>
      DomainClient.fromPersistence(entity.id, entity.name, entity.email, Number(entity.balance)),
    );
  }

  async findById(id: number): Promise<DomainClient | null> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) return null;

    return DomainClient.fromPersistence(
      entity.id,
      entity.name,
      entity.email,
      Number(entity.balance),
    );
  }

  async findByEmail(email: string): Promise<DomainClient | null> {
    const entity = await this.repository.findOne({ where: { email } });
    if (!entity) return null;

    return DomainClient.fromPersistence(
      entity.id,
      entity.name,
      entity.email,
      Number(entity.balance),
    );
  }

  async save(client: DomainClient): Promise<DomainClient> {
    const entity = this.repository.create({
      name: client.name,
      email: client.email,
      balance: client.balance,
    });

    const saved = await this.repository.save(entity);
    return DomainClient.fromPersistence(saved.id, saved.name, saved.email, Number(saved.balance));
  }

  async update(client: DomainClient): Promise<DomainClient> {
    if (!client.id) {
      throw new Error('Client ID is required for update');
    }

    await this.repository.update(client.id, {
      name: client.name,
      email: client.email,
      balance: client.balance,
    });

    const updated = await this.repository.findOne({ where: { id: client.id } });
    if (!updated) {
      throw new Error('Client not found after update');
    }

    return DomainClient.fromPersistence(
      updated.id,
      updated.name,
      updated.email,
      Number(updated.balance),
    );
  }

  async delete(id: number): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) {
      throw new Error('Client not found');
    }
  }
}
