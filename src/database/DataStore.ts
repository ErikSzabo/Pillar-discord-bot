import { ICache } from './ICache';
import { IRepository } from './IRepository';

export class DataStore<T> {
  protected cache: ICache<T>;
  protected store: IRepository<T>;

  constructor(cache: ICache<T>, store: IRepository<T>) {
    this.cache = cache;
    this.store = store;
  }

  public isCached(serverID: string) {
    return this.cache.isCached(serverID);
  }

  public get(serverID: string, filter?: Partial<T>): T {
    return this.cache.get(serverID, filter);
  }

  public getAll(serverID?: string, filter?: Partial<T>): T[] {
    return this.cache.getAll(serverID, filter);
  }

  public async add(serverID: string, data: T) {
    try {
      await this.store.add(serverID, data);
      this.cache.add(serverID, data);
    } catch (err) {
      throw new Error('Error writing into the store');
    }
  }

  public async delete(serverID: string, data?: Partial<T>) {
    try {
      await this.store.delete(serverID, data);
      this.cache.remove(serverID, data);
    } catch (err) {
      throw new Error('Error deleting from the store');
    }
  }

  public async update(serverID: string, data: Partial<T>) {
    try {
      await this.store.update(serverID, data);
      this.cache.set(serverID, data);
    } catch (err) {
      throw new Error('Error updating the store');
    }
  }

  public async loadToCache() {
    await this.cache.loadFromRepository(this.store);
  }
}
