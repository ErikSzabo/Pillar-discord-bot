export interface IDataStore<T> {
  add(serverID: string, data: T): void;
  delete(serverID: string, data: Partial<T>): void;
  update(serverID: string, data: Partial<T>): void;
  findAll(): Promise<T[]>;
}
