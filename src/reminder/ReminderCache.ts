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

// In millisecundums
const oneWeekTime = 7 * 24 * 60 * 60 * 1000;
const threeDaysTime = 3 * 24 * 60 * 60 * 1000;
const threeHoursTime = 3 * 60 * 60 * 1000;

const schedule = (reminder: Reminder, channel: Channel): Job[] => {
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
      const task = scheduleJob(
        `${reminder.title}$${timeTitle}`,
        new Date(reminder.date.getTime() - timeOffset),
        () => {
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
        }
      );
      jobs.push(task);
    }
  }

  timedSchedule(oneWeekTime, '1 week till the event');
  timedSchedule(threeDaysTime, '3 days till the event');
  timedSchedule(threeHoursTime, '3 hours till the event');
  timedSchedule(0, 'The event is happening right now!');

  return jobs;
};

export const reminderCache = (() => {
  const cache = new Map<string, Reminder[]>();
  const jobs = new Map<string, Map<string, Job[]>>();

  const findReminder = (
    searchTitle: string,
    serverID: string
  ): [Reminder, number] => {
    const reminders = cache.get(serverID);
    if (!reminders) return [null, null];
    for (let i = 0; i < reminders.length; i++) {
      if (reminders[i].title === searchTitle) {
        return [reminders[i], i];
      }
    }
    return [null, null];
  };

  const addReminder = (
    reminder: Reminder,
    channel: Channel,
    onlyCache: boolean
  ): void => {
    if (cache.has(reminder.serverID)) {
      cache.get(reminder.serverID).push(reminder);
      if (jobs.has(reminder.serverID)) {
        jobs
          .get(reminder.serverID)
          .set(reminder.title, schedule(reminder, channel));
      } else {
        const jobMap = new Map<string, Job[]>();
        jobMap.set(reminder.title, schedule(reminder, channel));
        jobs.set(reminder.serverID, jobMap);
      }
    } else {
      cache.set(reminder.serverID, [reminder]);
      const jobMap = new Map<string, Job[]>();
      jobMap.set(reminder.title, schedule(reminder, channel));
      jobs.set(reminder.serverID, jobMap);
    }
    if (!onlyCache)
      reminders.insert(reminder).catch((error) => console.log(error));
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

      addReminder(reminder, channel, true);
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
