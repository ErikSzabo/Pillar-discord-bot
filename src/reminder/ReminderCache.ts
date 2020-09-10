import { reminders } from '../database';
import { Job, scheduleJob } from 'node-schedule';
import { Message, Client, Channel } from 'discord.js';
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

// In millisecundums
const oneWeekTime = 7 * 24 * 60 * 60 * 1000;
const threeDaysTime = 3 * 24 * 60 * 60 * 1000;
const threeHoursTime = 3 * 60 * 60 * 1000;

const schedule = (reminder: Reminder, channel: Channel): Job[] => {
  let mentionText: string;
  if (reminder.type === 'everyone') {
    mentionText = '@everyone';
  } else if (reminder.type === 'role') {
    mentionText = `<@&${reminder.mentionID}>`;
  } else if (reminder.type === 'user') {
    mentionText = `<@${reminder.mentionID}>`;
  }

  const jobs = [];
  if (reminder.date.getTime() - Date.now() - oneWeekTime > 0) {
    const oneWeek = scheduleJob(
      `${reminder.title}$WEEK`,
      new Date(reminder.date.getTime() - oneWeekTime),
      () => {
        // @ts-ignore
        channel.send(
          createEmbed(
            `‼ Reminder: ${reminder.title}`,
            `**1 week till the event** -- ${mentionText} -- ${reminder.description}`,
            false
          )
        );
      }
    );
    jobs.push(oneWeek);
  }

  if (reminder.date.getTime() - Date.now() - threeDaysTime > 0) {
    const threeDays = scheduleJob(
      `${reminder.title}$DAY`,
      new Date(reminder.date.getTime() - threeDaysTime),
      () => {
        // @ts-ignore
        channel.send(
          createEmbed(
            `‼ Reminder: ${reminder.title}`,
            `**3 days till the event** -- ${mentionText} -- ${reminder.description}`,
            false
          )
        );
      }
    );
    jobs.push(threeDays);
  }

  if (reminder.date.getTime() - Date.now() - threeHoursTime > 0) {
    const threeHours = scheduleJob(
      `${reminder.title}$HOUR`,
      new Date(reminder.date.getTime() - threeHoursTime),
      () => {
        // @ts-ignore
        channel.send(
          createEmbed(
            `‼ Reminder: ${reminder.title}`,
            `**3 hours till the event** -- ${mentionText} -- ${reminder.description}`,
            false
          )
        );
      }
    );
    jobs.push(threeHours);
  }

  if (reminder.date.getTime() - Date.now() > 0) {
    const now = scheduleJob(`${reminder.title}$NOW`, reminder.date, () => {
      // @ts-ignore
      channel.send(
        createEmbed(
          `‼ Reminder: ${reminder.title}`,
          `**Event is happening!** -- ${mentionText} -- ${reminder.description}`,
          false
        )
      );
      reminderCache.deleteReminder(reminder.serverID, reminder.title);
    });
    jobs.push(now);
  }

  return jobs;
};

export const reminderCache = (() => {
  const cache = new Map<string, Reminder[]>();
  const jobs = new Map<string, Map<string, Job[]>>();

  const findReminder = (
    searchForTitle: string,
    serverID: string
  ): [Reminder, number] => {
    const reminders = cache.get(serverID);
    let reminder: Reminder;
    let index: number;
    if (!reminders) return [reminder, index];
    for (let i = 0; i < reminders.length; i++) {
      if (reminders[i].title === searchForTitle) {
        reminder = reminders[i];
        index = i;
        break;
      }
    }
    return [reminder, index];
  };

  const addReminder = (reminder: Reminder, message: Message) => {
    if (cache.has(reminder.serverID)) {
      cache.get(reminder.serverID).push(reminder);
      reminders.insert(reminder).catch((error) => console.log(error));
      if (jobs.has(reminder.serverID)) {
        jobs
          .get(reminder.serverID)
          .set(reminder.title, schedule(reminder, message.channel));
      } else {
        const jobMap = new Map<string, Job[]>();
        jobMap.set(reminder.title, schedule(reminder, message.channel));
        jobs.set(reminder.serverID, jobMap);
      }
    } else {
      cache.set(reminder.serverID, [reminder]);
      reminders.insert(reminder).catch((error) => console.log(error));
      const jobMap = new Map<string, Job[]>();
      jobMap.set(reminder.title, schedule(reminder, message.channel));
      jobs.set(reminder.serverID, jobMap);
    }
  };

  const deleteReminder = (serverID: string, reminderTitle: string) => {
    const serverReminders = cache.get(serverID);
    const [reminder, index] = findReminder(reminderTitle, serverID);
    if (reminder) {
      cache.set(serverID, [
        ...serverReminders.slice(0, index),
        ...serverReminders.slice(index + 1, serverReminders.length),
      ]);

      jobs
        .get(serverID)
        .get(reminderTitle)
        .forEach((job) => job.cancel());

      jobs.get(serverID).delete(reminderTitle);

      reminders
        .findOneAndDelete({ serverID: serverID, title: reminderTitle })
        .catch((err) => console.log(err));
    } else {
      throw new Error('Invalid reminder name');
    }
  };

  const loadAndSetup = async (client: Client) => {
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

      if (cache.has(reminder.serverID)) {
        cache.get(reminder.serverID).push(reminder);
        if (jobs.has(reminder.serverID)) {
          jobs
            .get(reminder.serverID)
            .get(reminder.title)
            .push(...schedule(reminder, channel));
        } else {
          jobs
            .get(reminder.serverID)
            .set(reminder.title, schedule(reminder, channel));
        }
      } else {
        cache.set(reminder.serverID, [reminder]);
        const jobMap = new Map<string, Job[]>();
        jobMap.set(reminder.title, schedule(reminder, channel));
        jobs.set(reminder.serverID, jobMap);
      }
    });

    shouldDelete.forEach((reminder) =>
      reminders
        .findOneAndDelete({ _id: reminder._id })
        .catch((err) => console.log(err))
    );
  };

  return {
    addReminder,
    deleteReminder,
    loadAndSetup,
    findReminder,
  };
})();
