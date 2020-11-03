import { ICache } from './ICache';
import { IDataStore } from './IDataStore';

export class DataStore<T> {
  protected cache: ICache<T>;
  protected store: IDataStore<T>;

  constructor(cache: ICache<T>, store: IDataStore<T>) {
    this.cache = cache;
    this.store = store;
  }

  public isCached(serverID: string) {
    return this.cache.isCached(serverID);
  }

  public get(serverID: string): T {
    return this.cache.get(serverID);
  }

  public getAll(filter?: Partial<T>) {
    return this.cache.getAll(filter);
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
    await this.cache.loadFromDatastore(this.store);
  }
}
