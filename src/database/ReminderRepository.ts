import { ICollection } from 'monk';
import { Reminder } from '../reminder/Reminder';
import { db } from './database';
import { IDataStore } from './IDataStore';

class ReminderRepository implements IDataStore<Reminder> {
  protected collection: ICollection<Reminder>;

  constructor() {
    this.collection = db.get('reminders');
    this.collection.createIndex('serverID title');
  }

  public async add(serverID: string, data: Reminder) {
    const duplicate = await this.collection.findOne({ serverID });
    if (duplicate) return;
    return this.collection.insert(data);
  }

  public delete(serverID: string, data: Partial<Reminder>) {
    return this.collection.findOneAndDelete({ serverID: serverID, ...data });
  }

  public update(serverID: string, data: Partial<Reminder>) {
    return this.collection.findOneAndUpdate(
      { serverID },
      { $set: { ...data } }
    );
  }

  async findAll(): Promise<Reminder[]> {
    const data = await this.collection.find({});
    const parsed: Reminder[] = [];
    data.forEach((data) => parsed.push(data));
    return parsed;
  }
}

export const reminderRepository = new ReminderRepository();
