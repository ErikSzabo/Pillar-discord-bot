import { ICollection } from 'monk';
import { ServerInfo } from '../generic/ServerInfo';
import { db } from './database';
import { IDataStore } from './IDataStore';

class ServerRepository implements IDataStore<ServerInfo> {
  protected collection: ICollection<ServerInfo>;

  constructor() {
    this.collection = db.get('server-info');
  }

  public async add(serverID: string, data: ServerInfo): Promise<void> {
    try {
      const duplicate = await this.collection.findOne({ serverID });
      if (duplicate) return;
      await this.collection.insert(data);
    } catch (err) {
      console.error(err);
    }
  }

  public delete(serverID: string): void {
    this.collection
      .findOneAndDelete({ serverID })
      .catch((err) => console.error(err));
  }

  public update(serverID: string, data: Partial<ServerInfo>): void {
    this.collection
      .findOneAndUpdate({ serverID }, { $set: { ...data } })
      .catch((err) => console.error(err));
  }

  public async findAll(): Promise<ServerInfo[]> {
    const data = await this.collection.find({});
    const parsed: ServerInfo[] = [];
    data.forEach((data) => parsed.push(data));
    return parsed;
  }
}

export const serverRepository = new ServerRepository();
