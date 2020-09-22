import { Job, scheduleJob } from 'node-schedule';
import { Channel } from 'discord.js';
import { createEmbed } from '../utils';
import { Reminder } from './Reminder';
import { ICache } from '../generic/ICache';
import { IDataStore } from '../database/IDataStore';
import { client } from '../client';
import { reminderRepository } from '../database/ReminderRepository';

class ReminderCache implements ICache<Reminder> {
  private static oneWeekTime = 7 * 24 * 60 * 60 * 1000;
  private static threeDaysTime = 3 * 24 * 60 * 60 * 1000;
  private static threeHoursTime = 3 * 60 * 60 * 1000;
  private static maxReminderPerServer = 50;

  private cache: Map<string, Reminder[]>;
  private jobs: Map<string, Map<string, Job[]>>;

  constructor() {
    this.cache = new Map<string, Reminder[]>();
    this.jobs = new Map<string, Map<string, Job[]>>();
  }

  public isCached(serverID: string): boolean {
    return this.cache.has(serverID);
  }

  public async add(serverID: string, data: Reminder) {
    const channel = await client.channels.fetch(data.channel);
    if (this.cache.has(serverID)) {
      this.cache.get(serverID).push(data);
      if (this.jobs.has(serverID)) {
        this.jobs.get(serverID).set(data.title, this.schedule(data, channel));
      } else {
        const jobMap = new Map<string, Job[]>();
        jobMap.set(data.title, this.schedule(data, channel));
        this.jobs.set(serverID, jobMap);
      }
    } else {
      this.cache.set(serverID, [data]);
      const jobMap = new Map<string, Job[]>();
      jobMap.set(data.title, this.schedule(data, channel));
      this.jobs.set(serverID, jobMap);
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

      this.jobs
        .get(serverID)
        .get(data.title)
        .forEach((job) => job.cancel());

      this.jobs.get(serverID).delete(data.title);
    } else {
      throw new Error('Invalid reminder name');
    }
  }

  public get(serverID: string): Reminder[] {
    return this.cache.get(serverID);
  }

  public set(serverID: string, data: Partial<Reminder>): Reminder {
    return;
  }

  public async loadFromDatastore(dataStore: IDataStore<Reminder>) {
    const shouldDelete: Reminder[] = [];
    const loadedReminders = await dataStore.findAll();
    loadedReminders.forEach(async (reminder: Reminder) => {
      if (reminder.date.getTime() - Date.now() <= 0) {
        shouldDelete.push(reminder);
        return;
      }

      const channel = await client.channels.fetch(reminder.channel);

      if (channel.type !== 'text') {
        shouldDelete.push(reminder);
        return;
      }

      this.add(reminder.serverID, reminder);
    });

    shouldDelete.forEach((reminder) =>
      dataStore.delete(reminder.serverID, { title: reminder.title })
    );
  }

  public findReminder(title: string, serverID: string): [Reminder, number] {
    const reminders = this.cache.get(serverID);
    if (!reminders) return [null, null];
    for (let i = 0; i < reminders.length; i++) {
      if (reminders[i].title === title) {
        return [reminders[i], i];
      }
    }
    return [null, null];
  }

  private schedule(reminder: Reminder, channel: Channel): Job[] {
    const jobs: Job[] = [];
    let mentionText: string;
    if (reminder.type === 'everyone') {
      mentionText = '@everyone';
    } else if (reminder.type === 'role') {
      mentionText = `<@&${reminder.mentionID}>`;
    } else if (reminder.type === 'user') {
      mentionText = `<@${reminder.mentionID}>`;
    }

    function timedSchedule(timeOffset: number, timeTitle: string) {
      if (reminder.date.getTime() - Date.now() - timeOffset > 0) {
        const date = new Date(reminder.date.getTime() - timeOffset);
        const taskName = `${reminder.title}$${timeTitle}`;
        const task = scheduleJob(taskName, date, () => {
          // @ts-ignore
          channel.send(
            createEmbed(
              `‼ Reminder: ${reminder.title}`,
              `**${timeTitle}** -- ${mentionText} -- ${reminder.description}`,
              false
            )
          );
          if (timeOffset === 0)
            reminderRepository.delete(reminder.serverID, {
              title: reminder.title,
            });
        });
        jobs.push(task);
      }
    }

    timedSchedule(ReminderCache.oneWeekTime, '1 week till the event');
    timedSchedule(ReminderCache.threeDaysTime, '3 days till the event');
    timedSchedule(ReminderCache.threeHoursTime, '3 hours till the event');
    timedSchedule(0, 'The event is happening right now!');

    return jobs;
  }

  public canHaveMore(serverID: string): boolean {
    return this.cache.get(serverID).length < ReminderCache.maxReminderPerServer;
  }
}

export const reminderCache = new ReminderCache();
