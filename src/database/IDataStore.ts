export interface IDataStore<T> {
  add(serverID: string, data: T): Promise<any>;
  delete(serverID: string, data?: Partial<T>): Promise<any>;
  update(serverID: string, data: Partial<T>): Promise<any>;
  findAll(): Promise<T[]>;
}
