import { IRepository } from './IRepository';

export interface ICache<T> {
  isCached(serverID: string): boolean;
  add(serverID: string, data: T): void;
  remove(serverID: string, data?: Partial<T>): void;
  get(serverID: string, filter?: Partial<T>): T;
  getAll(serverID: string, filter?: Partial<T>): T[];
  set(serverID: string, data: Partial<T>): T;
  loadFromRepository(repository: IRepository<T>): void;
}
