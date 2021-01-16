import { ICollection } from 'monk';
import { Reminder } from '../reminder/Reminder';
import { db } from './database';
import { IRepository } from './IRepository';

export class ReminderRepository implements IRepository<Reminder> {
  protected collection: ICollection<Reminder>;

  constructor() {
    this.collection = db.get('reminders');
    this.collection.createIndex('serverID uid');
  }

  public async add(serverID: string, data: Reminder) {
    return this.collection.insert(data);
  }

  public delete(serverID: string, data: Partial<Reminder>) {
    return this.collection.findOneAndDelete({ serverID: serverID, ...data });
  }

  public update(serverID: string, data: Partial<Reminder>) {
    const searchParam = data.uid
      ? { serverID, uid: data.uid }
      : { serverID, title: data.title };
    return this.collection.findOneAndUpdate(searchParam, { $set: { ...data } });
  }

  async findAll(): Promise<Reminder[]> {
    const data = await this.collection.find({});
    const parsed: Reminder[] = [];
    data.forEach((data) => parsed.push(data));
    return parsed;
  }
}
