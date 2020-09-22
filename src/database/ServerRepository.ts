import { ICollection } from 'monk';
import { ServerInfo } from '../generic/ServerInfo';
import { db } from './database';
import { IDataStore } from './IDataStore';

class ServerRepository implements IDataStore<ServerInfo> {
  protected collection: ICollection<ServerInfo>;

  constructor() {
    this.collection = db.get('server-info');
    this.collection.createIndex('serverID');
  }

  public async add(serverID: string, data: ServerInfo) {
    const duplicate = await this.collection.findOne({ serverID });
    if (duplicate) return;
    return this.collection.insert(data);
  }

  public delete(serverID: string) {
    return this.collection.findOneAndDelete({ serverID });
  }

  public update(serverID: string, data: Partial<ServerInfo>) {
    return this.collection.findOneAndUpdate(
      { serverID },
      { $set: { ...data } }
    );
  }

  public async findAll(): Promise<ServerInfo[]> {
    const data = await this.collection.find({});
    const parsed: ServerInfo[] = [];
    data.forEach((data) => parsed.push(data));
    return parsed;
  }
}

export const serverRepository = new ServerRepository();
