import { Message } from 'discord.js';
import { parseQuotedArgs } from '../../utils';
import { reminderCache } from '../ReminderCache';
import { CustomError } from '../../generic/CustomError';
import { Command } from '../../generic/Command';
import { language } from '../../language/LanguageManager';
import { serverCache } from '../../generic/ServerCache';

export class DeleteCommand extends Command {
  constructor() {
    super('r-delete', 'r-delete "name"');
  }

  public execute(args: Array<string>, message: Message): void {
    const currLang = serverCache.getLang(message.guild.id);
    let reminderName: string;

    try {
      reminderName = this.parseReminderName(message, currLang);
    } catch (err) {
      message.channel.send(err.embed);
      return;
    }

    const [reminder] = reminderCache.findReminder(
      reminderName,
      message.guild.id
    );
    if (reminder) {
      reminderCache.deleteReminder(message.guild.id, reminderName);
      message.channel.send(
        language.get(currLang, 'reminderDeleted', { reminder: reminderName })
      );
    } else {
      message.channel.send(
        language.get(currLang, 'reminderNotFound', { reminder: reminderName })
      );
      return;
    }
  }

  private parseReminderName(message: Message, currLang: string): string {
    const msg = parseQuotedArgs(message, this.getName());

    if (msg.length < 1)
      throw new CustomError(language.get(currLang, 'notEnoughArguments'));

    return msg[0];
  }
}
