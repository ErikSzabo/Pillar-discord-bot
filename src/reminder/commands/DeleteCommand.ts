import { Message } from 'discord.js';
import { ReminderCommand } from './ReminderCommand';
import { createEmbed } from '../../utils';
import { reminderCache } from '../ReminderCache';

export class DeleteCommand extends ReminderCommand {
  constructor() {
    super('r-delete', '<name> deletes a reminder');
  }

  public execute(args: Array<string>, message: Message): void {
    if (args.length < 1) {
      message.channel.send(
        createEmbed('Invalid', 'Not enough arguments!', true)
      );
      return;
    }

    const [reminder] = reminderCache.findReminder(args[0], message.guild.id);
    if (reminder) {
      reminderCache.deleteReminder(message.guild.id, args[0]);
      message.channel.send(
        createEmbed(
          '✅ Deleted',
          `Reminder: **${args[0]}** successfully deleted!`,
          false
        )
      );
    } else {
      message.channel.send(
        createEmbed('🔎 Not Found', `Reminder: **${args[0]}** not found!`, true)
      );
      return;
    }
  }
}
