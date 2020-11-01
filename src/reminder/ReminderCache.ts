import { Job, scheduleJob } from 'node-schedule';
import { Channel, MessageEmbed, TextChannel } from 'discord.js';
import { Reminder } from './Reminder';
import { ICache } from '../apis/interfaces/ICache';
import { IDataStore } from '../apis/interfaces/IDataStore';
import { client } from '../client';
import { reminderRepository } from '../database/ReminderRepository';
import { serverCache } from '../generic/ServerCache';
import { Timezones } from '../apis/timezoneAPI';
import { language } from '../language/LanguageManager';

class ReminderCache implements ICache<Reminder> {
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

  public get(serverID: string): Reminder {
    const reminders = this.getAll(serverID);
    return reminders.length > 0 ? reminders[0] : null;
  }

  public getAll(serverID: string): Reminder[] {
    if (this.cache.has(serverID)) {
      return this.cache.get(serverID);
    }
    return [];
  }

  public set(serverID: string, data: Partial<Reminder>): Reminder {
    throw new Error('Not implemented method!');
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

    for (let time of this.createEventResponseArray(reminder)) {
      const job = this.timedSchedule(
        time[0],
        time[1],
        reminder,
        channel as TextChannel
      );
      if (job) jobs.push(job);
    }

    return jobs;
  }

  private createMentionText(reminder: Reminder): string {
    if (reminder.type === 'everyone') {
      return '@everyone';
    } else if (reminder.type === 'role') {
      return `<@&${reminder.mentionID}>`;
    } else if (reminder.type === 'user') {
      return `<@${reminder.mentionID}>`;
    }
  }

  private timedSchedule(
    timeOffset: number,
    embed: MessageEmbed,
    reminder: Reminder,
    channel: TextChannel
  ) {
    const zone = serverCache.get(reminder.serverID).timezone;
    const utcDate = Timezones.UTC.convert(reminder.date, Timezones[zone]);
    if (utcDate.getTime() < Date.now() + timeOffset) return;

    const date = new Date(utcDate.getTime() - timeOffset);
    const taskName = `${reminder.title}$${embed.title}`;

    const task = scheduleJob(taskName, date, async () => {
      channel.send(embed);

      if (timeOffset !== 0) return;

      try {
        await reminderRepository.delete(reminder.serverID, {
          title: reminder.title,
        });
        reminderCache.remove(reminder.serverID, { title: reminder.title });
      } catch (err) {
        console.error(err);
      }
    });

    return task;
  }

  private createEventResponseArray(reminder: Reminder) {
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    const threeHour = 3 * 60 * 60 * 1000;
    const times: Array<[number, MessageEmbed]> = [
      [oneWeek, this.getNotifyMessage(reminder, 'reminderNotifyOneWeek')],
      [threeDays, this.getNotifyMessage(reminder, 'reminderNotifyThreeDays')],
      [threeHour, this.getNotifyMessage(reminder, 'reminderNotifyThreeHour')],
      [0, this.getNotifyMessage(reminder, 'reminderNotifyZero')],
    ];
    return times;
  }

  private getNotifyMessage(reminder: Reminder, id: string) {
    const { title, description, serverID } = reminder;
    const mention = this.createMentionText(reminder);
    return language.get(serverID, id, {
      reminder: title,
      mention,
      description,
    });
  }

  public canHaveMore(serverID: string): boolean {
    const serverReminders = this.cache.get(serverID);
    if (!serverReminders) return true;
    return this.cache.get(serverID).length < ReminderCache.maxReminderPerServer;
  }
}

export const reminderCache = new ReminderCache();
