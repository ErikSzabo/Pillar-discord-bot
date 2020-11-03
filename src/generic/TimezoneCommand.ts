import { Message } from 'discord.js';
import { Timezones } from '../apis/timezoneAPI';
import { IApplication } from '../application';
import { logger } from '../logger';
import { Command } from './Command';

export class TimezoneCommand extends Command {
  constructor(app: IApplication) {
    super('timezone', 'timezone [new timezone]', app);
  }

  async execute(args: string[], message: Message) {
    const serverID = message.guild.id;

    if (!this.app.isModerator(serverID, message.member)) {
      message.channel.send(this.app.message(serverID, 'noUserPerm'));
      return;
    }

    if (!args[0]) {
      message.channel.send(
        this.app.message(serverID, 'availableTimezones', {
          timezone: Object.keys(Timezones).join(', '),
        })
      );
      return;
    }

    const timezone = args[0].toUpperCase();

    if (!Object.keys(Timezones).includes(timezone)) {
      message.channel.send(
        this.app.message(serverID, 'availableTimezones', {
          timezone: Object.keys(Timezones).join(', '),
        })
      );
      return;
    }

    try {
      // @ts-ignore
      await this.app.getServerStore().update(serverID, { timezone });
      message.channel.send(
        this.app.message(serverID, 'timezoneSet', { timezone })
      );
    } catch (error) {
      message.channel.send(this.app.message(serverID, 'botError'));
      logger.error(error.message);
    }
  }
}
