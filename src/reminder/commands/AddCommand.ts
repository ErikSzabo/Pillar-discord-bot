import { Message } from 'discord.js';
import { parseQuotedArgs } from '../../utils';
import { reminderCache, Reminder } from '../ReminderCache';
import { Command } from '../../generic/Command';
import { serverCache } from '../../generic/ServerCache';
import { CustomError } from '../../generic/CustomError';
import { language } from '../../language/LanguageManager';

export class AddCommand extends Command {
  constructor() {
    super('r-add', 'r-add <mention> <2020.12.24-20:30> "name" "description"');
  }

  public execute(args: Array<string>, message: Message): void {
    const currLang = serverCache.getLang(message.guild.id);
    try {
      const reminder = this.parseReminder(message, currLang);
      const [duplicate] = reminderCache.findReminder(
        reminder.title,
        reminder.serverID
      );
      if (duplicate)
        throw new CustomError(language.get(currLang, 'reminderAlreadyExists'));
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
        reminder.date,
        currLang
      );
    } catch (err) {
      message.channel.send(err.embed);
    }
  }

  private parseDate(date: string, currLang: string): Date {
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
      throw new CustomError(language.get(currLang, 'invalidDate'));
    }
  }

  private sendResponse(
    message: Message,
    mention: string,
    title: string,
    date: Date,
    currLang: string
  ): void {
    message.channel.send(
      language.get(currLang, 'reminderAdded', {
        reminder: title,
        mention: mention,
        date: date.toLocaleDateString(),
      })
    );
  }

  private parseReminder(message: Message, currLang: string): Reminder {
    // !r-add @tester 2020.9.10-12:30 "hosszu szar nev" "hosszu szar leiras"
    const msg = parseQuotedArgs(message, this.getName());

    if (msg.length > 4)
      throw new CustomError(language.get(currLang, 'tooManyArguments'));

    const date = this.parseDate(msg[1], currLang);
    const title = msg[2];
    const description = msg.length >= 3 ? msg[3] : '';

    const isEveryone = message.mentions.everyone;
    const roleMention = message.mentions.roles.first();
    const userMention = message.mentions.users.first();

    if (!isEveryone && !roleMention && !userMention)
      throw new CustomError(language.get(currLang, 'missingReminderMention'));

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
