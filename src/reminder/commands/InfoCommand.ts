import { Message } from 'discord.js';
import { createEmbed } from '../../utils';
import { Command } from '../../generic/Command';
import { Timezones } from '../../apis/timezoneAPI';
import { IApplication } from '../../application';

export class InfoCommand extends Command {
  constructor(app: IApplication) {
    super('r-info', 'r-info', app);
  }

  public async execute(args: string[], message: Message) {
    const serverID = message.guild.id;
    const zone = this.app.getServerStore().get(serverID).timezone;
    const reminders = this.app.getReminderStore().getAll({ serverID });
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
