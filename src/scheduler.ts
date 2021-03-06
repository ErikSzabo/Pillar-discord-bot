import { Channel, MessageEmbed, TextChannel } from 'discord.js';
import { Job, scheduleJob } from 'node-schedule';
import { Timezone, Timezones } from './apis/timezoneAPI';
import { IApplication } from './application';
import { Reminder } from './reminder/Reminder';

const oneWeek = 7 * 24 * 60 * 60 * 1000;
const threeDays = 3 * 24 * 60 * 60 * 1000;
const threeHour = 3 * 60 * 60 * 1000;

export class ServerScheduler {
  private jobs: Map<string, Job[]>;

  constructor() {
    this.jobs = new Map<string, Job[]>();
  }

  public schedule(
    serverID: string,
    jobName: string,
    date: Date,
    callback: () => void,
    timezone?: Timezone
  ) {
    if (timezone) date = Timezones.UTC.convert(date, timezone);
    if (date.getTime() < Date.now()) return;

    const run = () => {
      callback();
      this.terminate(serverID, jobName);
    };

    date = new Date(date.getTime());
    if (this.jobs.has(serverID)) {
      this.jobs.get(serverID).push(scheduleJob(jobName, date, run));
    } else {
      this.jobs.set(serverID, [scheduleJob(jobName, date, run)]);
    }
  }

  public terminate(serverID: string, jobName: string) {
    if (!this.jobs.has(serverID)) return;
    const jobs = this.jobs.get(serverID);

    for (let i = 0; i < jobs.length; i++) {
      if (jobs[i].name === jobName) {
        jobs[i].cancel();
        jobs.splice(i, 1);
        return;
      }
    }
  }

  public scheduleReminder(
    app: IApplication,
    reminder: Reminder,
    channel: Channel
  ) {
    for (let time of this.createEventResponseArray(app, reminder)) {
      this.timedReminderSchedule(
        app,
        time[0],
        time[1],
        reminder,
        channel as TextChannel
      );
    }
  }

  public terminateReminder(reminder: Reminder) {
    this.terminate(
      reminder.serverID,
      `${reminder.serverID}${reminder.date}${reminder.uid}${oneWeek}`
    );
    this.terminate(
      reminder.serverID,
      `${reminder.serverID}${reminder.date}${reminder.uid}${threeDays}`
    );
    this.terminate(
      reminder.serverID,
      `${reminder.serverID}${reminder.date}${reminder.uid}${threeHour}`
    );
    this.terminate(
      reminder.serverID,
      `${reminder.serverID}${reminder.date}${reminder.uid}${0}`
    );
  }

  private timedReminderSchedule(
    app: IApplication,
    timeOffset: number,
    embed: MessageEmbed,
    reminder: Reminder,
    channel: TextChannel
  ) {
    const scheduler = app.getScheduler();
    const zone = app.getServerStore().get(reminder.serverID).timezone;
    const timezone = Timezones[zone];
    const date = new Date(reminder.date.getTime() - timeOffset);
    const taskName = `${reminder.serverID}${reminder.date}${reminder.uid}${timeOffset}`;
    scheduler.schedule(
      reminder.serverID,
      taskName,
      date,
      () => {
        channel.send(embed);
        if (timeOffset !== 0) return;
        app
          .getReminderStore()
          .delete(reminder.serverID, { uid: reminder.uid })
          .catch((err) => console.log);
      },
      timezone
    );
  }

  private createEventResponseArray(app: IApplication, reminder: Reminder) {
    const times: Array<[number, MessageEmbed]> = [
      [oneWeek, this.getEventMsg(app, reminder, 'reminderNotifyOneWeek')],
      [threeDays, this.getEventMsg(app, reminder, 'reminderNotifyThreeDays')],
      [threeHour, this.getEventMsg(app, reminder, 'reminderNotifyThreeHour')],
      [0, this.getEventMsg(app, reminder, 'reminderNotifyZero')],
    ];
    return times;
  }

  private getEventMsg(app: IApplication, reminder: Reminder, id: string) {
    const { title, description, serverID } = reminder;
    const mention = this.getMentionText(reminder);
    return app.message(serverID, id, {
      reminder: title,
      mention,
      description,
    });
  }

  private getMentionText(reminder: Reminder) {
    if (reminder.type === 'everyone') {
      return '@everyone';
    } else if (reminder.type === 'role') {
      return `<@&${reminder.mentionID}>`;
    } else if (reminder.type === 'user') {
      return `<@${reminder.mentionID}>`;
    }
  }
}
