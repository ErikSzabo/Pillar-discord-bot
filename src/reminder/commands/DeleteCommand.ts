import { Message } from 'discord.js';
import { parseQuotedArgs } from '../../utils';
import { reminderCache } from '../ReminderCache';
import { CustomError } from '../../generic/CustomError';
import { Command } from '../../generic/Command';
import { language } from '../../language/LanguageManager';
import { reminderRepository } from '../../database/ReminderRepository';

export class DeleteCommand extends Command {
  constructor() {
    super('r-delete', 'r-delete "name"');
  }

  public async execute(args: Array<string>, message: Message) {
    const serverID = message.guild.id;
    let reminderName: string;

    try {
      reminderName = this.parseReminderName(message);
    } catch (err) {
      message.channel.send(err.embed);
      return;
    }

    const [reminder] = reminderCache.findReminder(reminderName, serverID);
    if (reminder) {
      try {
        await reminderRepository.delete(message.guild.id, {
          title: reminderName,
        });
        reminderCache.remove(message.guild.id, { title: reminderName });

        message.channel.send(
          language.get(serverID, 'reminderDeleted', { reminder: reminderName })
        );
      } catch (error) {
        message.channel.send(language.get(serverID, 'botError'));
        console.error(error);
      }
    } else {
      message.channel.send(
        language.get(serverID, 'reminderNotFound', { reminder: reminderName })
      );
      return;
    }
  }

  private parseReminderName(message: Message): string {
    const msg = parseQuotedArgs(message, this.getName());

    if (msg.length < 1)
      throw new CustomError(
        language.get(message.guild.id, 'notEnoughArguments')
      );

    return msg[0];
  }
}
