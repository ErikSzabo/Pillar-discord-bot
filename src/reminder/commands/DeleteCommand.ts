import { Message } from 'discord.js';
import { ReminderCommand } from './ReminderCommand';
import { createEmbed, parseQuotedArgs } from '../../utils';
import { reminderCache } from '../ReminderCache';
import { CustomError } from '../../generic/CustomError';

export class DeleteCommand extends ReminderCommand {
  constructor() {
    super('r-delete', '"name" deletes a reminder');
  }

  public execute(args: Array<string>, message: Message): void {
    let reminderName: string;

    try {
      reminderName = this.parseReminderName(message);
    } catch (err) {
      message.channel.send(err.message);
      return;
    }

    const [reminder] = reminderCache.findReminder(
      reminderName,
      message.guild.id
    );
    if (reminder) {
      reminderCache.deleteReminder(message.guild.id, reminderName);
      message.channel.send(
        createEmbed(
          '✅ Deleted',
          `Reminder: **${reminderName}** successfully deleted!`,
          false
        )
      );
    } else {
      message.channel.send(
        createEmbed(
          '🔎 Not Found',
          `Reminder: **${reminderName}** not found!`,
          true
        )
      );
      return;
    }
  }

  private parseReminderName(message: Message): string {
    const msg = parseQuotedArgs(message, this.getName());

    if (msg.length < 1)
      throw new CustomError(
        createEmbed('Invalid', 'Not enough arguments!', true)
      );

    return msg[0];
  }
}
