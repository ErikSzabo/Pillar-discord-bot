import { Message } from 'discord.js';
import { Timezones } from '../apis/timezoneAPI';
import { IApplication } from '../application';
import { logger } from '../logger';
import { Command } from './Command';

export class TimezoneCommand extends Command {
  constructor() {
    super('timezone', 'timezone [new timezone]');
  }

  async execute(app: IApplication, args: string[], message: Message) {
    const serverID = message.guild.id;
    const serverData = app.getServerStore().get(serverID);
    try {
      app.checkPermission(serverData.moderationRole, message.member, serverID);
    } catch (err) {
      message.channel.send(app.message(serverID, 'noUserPerm'));
      return;
    }

    if (!args[0]) {
      message.channel.send(
        app.message(serverID, 'availableTimezones', {
          timezone: Object.keys(Timezones).join(', '),
        })
      );
      return;
    }

    const timezone = args[0].toUpperCase();

    if (!Object.keys(Timezones).includes(timezone)) {
      message.channel.send(
        app.message(serverID, 'availableTimezones', {
          timezone: Object.keys(Timezones).join(', '),
        })
      );
      return;
    }

    try {
      // @ts-ignore
      await app.getServerStore().update(serverID, { timezone });
      message.channel.send(app.message(serverID, 'timezoneSet', { timezone }));
    } catch (error) {
      message.channel.send(app.message(serverID, 'botError'));
      logger.error(error.message);
    }
  }
}
