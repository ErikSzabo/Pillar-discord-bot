import { WithID } from 'monk';

export interface IRepository<T> {
  add(serverID: string, data: T): Promise<WithID<T>>;
  delete(serverID: string, data?: Partial<T>): Promise<WithID<T>>;
  update(serverID: string, data: Partial<T>): Promise<WithID<T>>;
  findAll(): Promise<T[]>;
}
