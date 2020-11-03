import { Reminder } from './Reminder';
import { ICache } from '../database/ICache';
import { IDataStore } from '../database/IDataStore';
import { objectEqual } from '../utils';

export class ReminderCache implements ICache<Reminder> {
  private cache: Map<string, Reminder[]>;

  constructor() {
    this.cache = new Map<string, Reminder[]>();
  }

  public isCached(serverID: string): boolean {
    return this.cache.has(serverID);
  }

  public getAll(filter?: Partial<Reminder>) {
    const reminders = Array.from(this.cache.values()).reduce(
      (acc, curr) => [...acc, ...curr],
      []
    );
    return filter
      ? reminders.filter((reminder) =>
          objectEqual(reminder, { ...reminder, ...filter })
        )
      : reminders;
  }

  public async add(serverID: string, data: Reminder) {
    if (this.cache.has(serverID)) {
      this.cache.get(serverID).push(data);
    } else {
      this.cache.set(serverID, [data]);
    }
  }

  public remove(serverID: string, data: Partial<Reminder>): void {
    const serverReminders = this.cache.get(serverID);
    const [reminder, index] = this.findReminder(data.title, serverID);
    if (reminder) {
      this.cache.set(serverID, [
        ...serverReminders.slice(0, index),
        ...serverReminders.slice(index + 1, serverReminders.length),
      ]);
    } else {
      throw new Error('Invalid reminder name');
    }
  }

  public get(serverID: string): Reminder {
    const reminders = this.getAll().filter(
      (reminder) => reminder.serverID === serverID
    );
    return reminders.length > 0 ? reminders[0] : null;
  }

  public set(serverID: string, data: Partial<Reminder>): Reminder {
    throw new Error('Not implemented method!');
  }

  public async loadFromDatastore(dataStore: IDataStore<Reminder>) {
    const loadedReminders = await dataStore.findAll();
    loadedReminders.forEach(async (reminder: Reminder) => {
      this.add(reminder.serverID, reminder);
    });
  }

  private findReminder(title: string, serverID: string): [Reminder, number] {
    const reminders = this.cache.get(serverID);
    if (!reminders) return [null, null];
    for (let i = 0; i < reminders.length; i++) {
      if (reminders[i].title === title) {
        return [reminders[i], i];
      }
    }
    return [null, null];
  }
}
