import { IDataStore } from '../database/IDataStore';

export interface ICache<T> {
  isCached(serverID: string): boolean;
  add(serverID: string, data: T): void;
  remove(serverID: string, data?: Partial<T>): void;
  get(serverID: string): any;
  set(serverID: string, data: Partial<T>): T;
  loadFromDatastore?(dataStore: IDataStore<T>): void;
}
