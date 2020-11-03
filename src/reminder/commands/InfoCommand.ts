import { Message } from 'discord.js';
import { createEmbed } from '../../utils';
import { Command } from '../../generic/Command';
import { Timezones } from '../../apis/timezoneAPI';
import { IApplication } from '../../application';

export class InfoCommand extends Command {
  constructor() {
    super('r-info', 'r-info');
  }

  public async execute(
    app: IApplication,
    args: Array<string>,
    message: Message
  ) {
    const serverID = message.guild.id;
    const zone = app.getServerStore().get(serverID).timezone;
    const reminders = app.getReminderStore().getAll({ serverID });
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
