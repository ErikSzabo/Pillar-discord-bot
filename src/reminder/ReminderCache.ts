import { Reminder } from './Reminder';
import { ICache } from '../database/ICache';
import { IRepository } from '../database/IRepository';
import { objectEqual } from '../utils';

export class ReminderCache implements ICache<Reminder> {
  private cache: Map<string, Reminder[]>;

  constructor() {
    this.cache = new Map<string, Reminder[]>();
  }

  public isCached(serverID: string): boolean {
    return this.cache.has(serverID);
  }

  public async add(serverID: string, data: Reminder) {
    if (this.cache.has(serverID)) {
      this.cache.get(serverID).push(data);
    } else {
      this.cache.set(serverID, [data]);
    }
  }

  public remove(serverID: string, data: Partial<Reminder>): void {
    if (!data.title) return;
    const serverReminders = this.cache.get(serverID);
    if (!serverReminders) return;
    const index = serverReminders.findIndex(
      (reminder) =>
        reminder.title === data.title && reminder.serverID === serverID
    );
    if (index === -1) return;
    serverReminders.splice(index, 1);
    if (serverReminders.length < 1) this.cache.delete(serverID);
  }

  public get(serverID: string, filter: Partial<Reminder>): Reminder {
    if (!this.cache.has(serverID)) return null;
    return filter
      ? this.cache
          .get(serverID)
          .find((reminder) => objectEqual(reminder, { ...reminder, ...filter }))
      : this.cache.get(serverID)[0];
  }

  public getAll(serverID: string): Reminder[] {
    return this.cache.get(serverID);
  }

  public set(serverID: string, data: Partial<Reminder>): Reminder {
    throw new Error('Not implemented method!');
  }

  public async loadFromRepository(dataStore: IRepository<Reminder>) {
    const loadedReminders = await dataStore.findAll();
    loadedReminders.forEach(async (reminder: Reminder) => {
      this.add(reminder.serverID, reminder);
    });
  }
}
