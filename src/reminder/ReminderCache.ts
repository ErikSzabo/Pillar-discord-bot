import { reminders } from '../database';
import { Job, scheduleJob } from 'node-schedule';
import { Client, Channel } from 'discord.js';
import { createEmbed } from '../utils';

export interface Reminder {
  _id?: string;
  serverID: string;
  mentionID: string;
  channelID: string;
  type: 'everyone' | 'role' | 'user';
  title: string;
  description: string;
  date: Date;
}

class ReminderCache {
  private static oneWeekTime = 7 * 24 * 60 * 60 * 1000;
  private static threeDaysTime = 3 * 24 * 60 * 60 * 1000;
  private static threeHoursTime = 3 * 60 * 60 * 1000;

  private cache: Map<string, Reminder[]>;
  private jobs: Map<string, Map<string, Job[]>>;

  constructor() {
    this.cache = new Map<string, Reminder[]>();
    this.jobs = new Map<string, Map<string, Job[]>>();
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

  public addReminder(reminder: Reminder, channel: Channel, onlyCache: boolean) {
    if (this.cache.has(reminder.serverID)) {
      this.cache.get(reminder.serverID).push(reminder);
      if (this.jobs.has(reminder.serverID)) {
        this.jobs
          .get(reminder.serverID)
          .set(reminder.title, this.schedule(reminder, channel));
      } else {
        const jobMap = new Map<string, Job[]>();
        jobMap.set(reminder.title, this.schedule(reminder, channel));
        this.jobs.set(reminder.serverID, jobMap);
      }
    } else {
      this.cache.set(reminder.serverID, [reminder]);
      const jobMap = new Map<string, Job[]>();
      jobMap.set(reminder.title, this.schedule(reminder, channel));
      this.jobs.set(reminder.serverID, jobMap);
    }
    if (!onlyCache)
      reminders.insert(reminder).catch((error) => console.log(error));
  }

  public deleteReminder(serverID: string, reminderTitle: string): void {
    const serverReminders = this.cache.get(serverID);
    const [reminder, index] = this.findReminder(reminderTitle, serverID);
    if (reminder) {
      this.cache.set(serverID, [
        ...serverReminders.slice(0, index),
        ...serverReminders.slice(index + 1, serverReminders.length),
      ]);

      this.jobs
        .get(serverID)
        .get(reminderTitle)
        .forEach((job) => job.cancel());

      this.jobs.get(serverID).delete(reminderTitle);

      reminders
        .findOneAndDelete({ serverID: serverID, title: reminderTitle })
        .catch((err) => console.log(err));
    } else {
      throw new Error('Invalid reminder name');
    }
  }

  public async loadAndSetup(client: Client): Promise<void> {
    const shouldDelete: Reminder[] = [];
    const loadedReminders = await reminders.find({});
    loadedReminders.forEach(async (reminder: Reminder) => {
      if (reminder.date.getTime() - Date.now() <= 0) {
        shouldDelete.push(reminder);
        return;
      }

      const channel = await client.channels.fetch(reminder.channelID);

      if (channel.type !== 'text') {
        shouldDelete.push(reminder);
        return;
      }

      this.addReminder(reminder, channel, true);
    });

    shouldDelete.forEach((reminder) =>
      reminders
        .findOneAndDelete({ _id: reminder._id })
        .catch((err) => console.log(err))
    );
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
            reminders
              .findOneAndDelete({
                serverID: reminder.serverID,
                title: reminder.title,
              })
              .catch((err) => console.log(err));
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
}

export const reminderCache = new ReminderCache();
