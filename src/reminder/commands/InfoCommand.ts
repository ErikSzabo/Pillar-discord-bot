import { Message } from 'discord.js';
import { createEmbed, parseQuotedArgs } from '../../utils';
import { reminderCache } from '../ReminderCache';
import { Command } from '../../generic/Command';

export class InfoCommand extends Command {
  constructor() {
    super('r-info', 'r-info');
  }

  public async execute(args: Array<string>, message: Message) {
    const serverID = message.guild.id;
    const reminders = reminderCache.get(serverID);
    const remindersAsString = reminders
      .map((reminder) => `**${reminder.title}** -- ${reminder.date}`)
      .join('\n');
    message.channel.send(createEmbed('🕑🕑🕑', remindersAsString, false));
  }
}
