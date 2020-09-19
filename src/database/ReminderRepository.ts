import { ICollection } from 'monk';
import { Reminder } from '../reminder/Reminder';
import { db } from './database';
import { IDataStore } from './IDataStore';

class ReminderRepository implements IDataStore<Reminder> {
  protected collection: ICollection<Reminder>;

  constructor() {
    this.collection = db.get('reminders');
  }

  public async add(serverID: string, data: Reminder): Promise<void> {
    try {
      const duplicate = await this.collection.findOne({ serverID });
      if (duplicate) return;
      await this.collection.insert(data);
    } catch (err) {
      console.error(err);
    }
  }

  public delete(serverID: string, data: Partial<Reminder>): void {
    this.collection
      .findOneAndDelete({ serverID: serverID, ...data })
      .catch((err) => console.error(err));
  }

  public update(serverID: string, data: Partial<Reminder>): void {
    this.collection
      .findOneAndUpdate({ serverID }, { $set: { ...data } })
      .catch((err) => console.error(err));
  }

  async findAll(): Promise<Reminder[]> {
    const data = await this.collection.find({});
    const parsed: Reminder[] = [];
    data.forEach((data) => parsed.push(data));
    return parsed;
  }
}

export const reminderRepository = new ReminderRepository();
