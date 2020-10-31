import { Message } from 'discord.js';
import { createEmbed } from '../../utils';
import { reminderCache } from '../ReminderCache';
import { Command } from '../../generic/Command';
import { Timezones } from '../../apis/timezoneAPI';
import { serverCache } from '../../generic/ServerCache';

export class InfoCommand extends Command {
  constructor() {
    super('r-info', 'r-info');
  }

  public async execute(args: Array<string>, message: Message) {
    const serverID = message.guild.id;
    const zone = serverCache.get(serverID).timezone;
    const reminders = reminderCache.get(serverID);
    const remindersAsString = reminders
      .map(
        (reminder) =>
          `**${reminder.title}**: ${Timezones[zone].toDateString(
            reminder.date
          )}`
      )
      .join('\n');
    message.channel.send(createEmbed('🕑🕑🕑', remindersAsString, false));
  }
}
