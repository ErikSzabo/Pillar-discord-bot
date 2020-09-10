import { Message } from 'discord.js';
import { ReminderCommand } from './ReminderCommand';
import { createEmbed, parseQuotedArgs } from '../../utils';
import { reminderCache, Reminder } from '../ReminderCache';

export class AddCommand extends ReminderCommand {
  constructor() {
    super(
      'r-add',
      'adds a new reminder, <mention> <2020.12.24-20:30> "long name" "description if you want"'
    );
  }

  public execute(args: Array<string>, message: Message): void {
    try {
      const reminder = this.parseReminder(message);
      const [duplicate] = reminderCache.findReminder(
        reminder.title,
        reminder.serverID
      );
      if (duplicate)
        throw new Error('A reminder with this name is already exists!');
      reminderCache.addReminder(reminder, message.channel, false);
      this.sendResponse(
        message,
        `${
          reminder.type === 'role'
            ? `<@&${reminder.mentionID}>`
            : reminder.type === 'user'
            ? `<@${reminder.mentionID}>`
            : '@everyone'
        }`,
        reminder.title,
        reminder.date
      );
    } catch (err) {
      message.channel.send(createEmbed('🛑 Invalid', err.message, true));
    }
  }

  private parseDate(date: string): Date {
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
      if (parsedDate.getTime() - Date.now() <= 0) throw new Error();

      return parsedDate;
    } catch (err) {
      throw new Error(
        'You have to provide a valid date, like: 2020.11.24-20:30'
      );
    }
  }

  private sendResponse(
    message: Message,
    mention: string,
    title: string,
    date: Date
  ): void {
    message.channel.send(
      createEmbed(
        '🧐 Reminder added!',
        `Reminder: **${title}** is set for: ${mention}, at: ${date}`,
        false
      )
    );
  }

  private parseReminder(message: Message): Reminder {
    // !r-add @tester 2020.9.10-12:30 "hosszu szar nev" "hosszu szar leiras"
    const msg = parseQuotedArgs(message, this.getName());

    if (msg.length > 4) throw new Error('Too many arguments!');

    const date = this.parseDate(msg[1]);
    const title = msg[2];
    const description = msg.length >= 3 ? msg[3] : '';

    const isEveryone = message.mentions.everyone;
    const roleMention = message.mentions.roles.first();
    const userMention = message.mentions.users.first();

    if (!isEveryone && !roleMention && !userMention)
      throw new Error('You have to mention a role/user/everyone');

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
      channelID: message.channel.id,
      type: mentionType,
      title: title,
      description: description ? description : '',
      date: date,
    };
  }
}
