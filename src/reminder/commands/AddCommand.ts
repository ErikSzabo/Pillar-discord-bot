import { Message } from 'discord.js';
import { parseQuotedArgs } from '../../utils';
import { Command } from '../../generic/Command';
import { Reminder } from '../Reminder';
import { logger } from '../../logger';
import { Timezones } from '../../apis/timezoneAPI';
import { IApplication } from '../../application';

export class AddCommand extends Command {
  constructor(app: IApplication) {
    super(
      'r-add',
      'r-add <mention> <2020.12.24-20:30> "name" "description"',
      app
    );
  }

  public async execute(args: Array<string>, message: Message) {
    const serverID = message.guild.id;
    try {
      const reminder = this.parseReminder(message);
      const duplicate = this.app
        .getReminderStore()
        .getAll({ title: reminder.title, serverID: reminder.serverID });

      if (duplicate.length > 0) throw new Error('reminderAlreadyExists');

      try {
        await this.app.getReminderStore().add(serverID, reminder);
        this.app
          .getScheduler()
          .scheduleReminder(this.app, reminder, message.channel);
      } catch (error) {
        message.channel.send(this.app.message(serverID, 'botError'));
        logger.error(error.message);
        return;
      }

      this.sendResponse(
        message,
        this.getMentionText(reminder),
        reminder.title,
        reminder.date
      );
    } catch (err) {
      message.channel.send(this.app.message(serverID, err.message));
    }
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

  private parseDate(date: string, serverID: string): Date {
    try {
      const [year, month, day] = date
        .split('-')[0]
        .split('.')
        .map((value, i) => (i === 1 ? Number(value) - 1 : Number(value)));

      const [hour, minute] = date
        .split('-')[1]
        .split(':')
        .map((value) => Number(value));

      const isBad = [year, month, day, hour, minute].some((value) =>
        isNaN(value)
      );

      if (isBad) throw new Error();

      const parsedDate = new Date(year, month, day, hour, minute, 0);
      const utcDate = Timezones.UTC.convert(
        parsedDate,
        Timezones[this.app.getServerStore().get(serverID).timezone]
      );
      if (utcDate.getTime() - Date.now() <= 0) throw new Error();

      return parsedDate;
    } catch (err) {
      throw new Error('invalidDate');
    }
  }

  private sendResponse(
    message: Message,
    mention: string,
    title: string,
    date: Date
  ): void {
    const serverID = message.guild.id;
    const zone = this.app.getServerStore().get(serverID).timezone;
    message.channel.send(
      this.app.message(message.guild.id, 'reminderAdded', {
        reminder: title,
        mention: mention,
        date: `**${Timezones[zone].toDateString(date)}**`,
      })
    );
  }

  private parseReminder(message: Message): Reminder {
    // !r-add @tester 2020.9.10-12:30 "hosszu szar nev" "hosszu szar leiras"
    const msg = parseQuotedArgs(message, this.getName());
    const serverID = message.guild.id;

    if (msg.length > 4) throw new Error('tooManyArguments');

    const date = this.parseDate(msg[1], serverID);
    const title = msg[2];
    const description = msg.length >= 3 ? msg[3] : '';

    const isEveryone = message.mentions.everyone;
    const roleMention = message.mentions.roles.first();
    const userMention = message.mentions.users.first();

    if (!isEveryone && !roleMention && !userMention)
      throw new Error('missingReminderMention');

    return this.createReminderConstruct(
      message,
      isEveryone ? 'everyone' : userMention ? 'user' : 'role',
      date,
      title,
      isEveryone ? '' : userMention ? userMention.id : roleMention.id,
      description
    );
  }

  private createReminderConstruct(
    message: Message,
    mentionType: 'everyone' | 'role' | 'user',
    date: Date,
    title: string,
    mentionID?: string,
    description?: string
  ): Reminder {
    return {
      serverID: message.guild.id,
      mentionID: mentionID ? mentionID : '',
      type: mentionType,
      title: title,
      description: description ? description : '',
      date: date,
      channel: message.channel.id,
    };
  }
}
