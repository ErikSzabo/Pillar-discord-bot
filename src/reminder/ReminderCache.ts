import { reminders } from '../database';
import { Job, scheduleJob } from 'node-schedule';

export interface Reminder {
  serverID: string;
  mentionID: string;
  type: 'everyone' | 'role' | 'user';
  title: string;
  description: string;
  date: Date;
}

// In millisecundums
const oneWeekTime = 7 * 24 * 60 * 60 * 1000;
const threeDaysTime = 3 * 24 * 60 * 60 * 1000;
const threeHoursTime = 3 * 60 * 60 * 1000;

const schedule = (reminder: Reminder): Job[] => {
  const oneWeek = scheduleJob(
    `${reminder.title}$WEEK`,
    new Date(reminder.date.getTime() - oneWeekTime),
    () => {
      // TODO
    }
  );

  const threeDays = scheduleJob(
    `${reminder.title}$DAY`,
    new Date(reminder.date.getTime() - threeDaysTime),
    () => {
      // TODO
    }
  );

  const threeHours = scheduleJob(
    `${reminder.title}$HOUR`,
    new Date(reminder.date.getTime() - threeHoursTime),
    () => {
      // TODO
    }
  );

  const now = scheduleJob(`${reminder.title}$NOW`, reminder.date, () => {
    // TODO
  });

  return [oneWeek, threeDays, threeHours, now];
};

export const reminderCache = (() => {
  const cache = new Map<string, Reminder[]>();
  const jobs = new Map<string, Map<string, Job[]>>();

  const findReminder = (
    searchForTitle: string,
    reminders: Reminder[]
  ): [Reminder, number] => {
    let reminder: Reminder;
    let index: number;
    for (let i = 0; i < reminders.length; i++) {
      if (reminders[i].title === searchForTitle) {
        reminder = reminders[i];
        index = i;
        break;
      }
    }
    return [reminder, index];
  };

  const addReminder = (reminder: Reminder) => {
    if (cache.has(reminder.serverID)) {
      cache.get(reminder.serverID).push(reminder);
      reminders.insert(reminder).catch((error) => console.log(error));
      if (jobs.has(reminder.serverID)) {
        jobs
          .get(reminder.serverID)
          .get(reminder.title)
          .push(...schedule(reminder));
      } else {
        jobs.get(reminder.serverID).set(reminder.title, schedule(reminder));
      }
    } else {
      cache.set(reminder.serverID, [reminder]);
      reminders.insert(reminder).catch((error) => console.log(error));
      const jobMap = new Map<string, Job[]>();
      jobMap.set(reminder.title, schedule(reminder));
      jobs.set(reminder.serverID, jobMap);
    }
  };

  const deleteReminder = (serverID: string, reminderTitle: string) => {
    const serverReminders = cache.get(serverID);
    const [reminder, index] = findReminder(reminderTitle, serverReminders);
    if (reminder) {
      cache.set(serverID, [
        ...serverReminders.slice(0, index),
        ...serverReminders.slice(index, serverReminders.length),
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

  return {
    addReminder,
    deleteReminder,
  };
})();
