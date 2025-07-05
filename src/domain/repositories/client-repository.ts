import type { Client } from '../entities/client';

export interface ClientRepository {
  findAll(): Promise<Client[]>;
  findById(id: number): Promise<Client | null>;
  findByEmail(email: string): Promise<Client | null>;
  save(client: Client): Promise<Client>;
  update(client: Client): Promise<Client>;
  delete(id: number): Promise<void>;
}
