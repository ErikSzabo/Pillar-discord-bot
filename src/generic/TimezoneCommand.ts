import { Message } from 'discord.js';
import { Timezones } from '../apis/timezoneAPI';
import { serverRepository } from '../database/ServerRepository';
import { language } from '../language/LanguageManager';
import { logger } from '../logger';
import { checkPermission } from '../utils';
import { Command } from './Command';
import { serverCache } from './ServerCache';

export class TimezoneCommand extends Command {
  constructor() {
    super('timezone', 'timezone [new timezone]');
  }

  async execute(args: string[], message: Message) {
    const serverID = message.guild.id;
    const serverData = serverCache.get(serverID);
    try {
      checkPermission(serverData.moderationRole, message.member, serverID);
    } catch (err) {
      message.channel.send(language.get(serverID, 'noUserPerm'));
      return;
    }

    if (!args[0]) {
      message.channel.send(
        language.get(serverID, 'availableTimezones', {
          timezone: Object.keys(Timezones).join(', '),
        })
      );
      return;
    }

    const timezone = args[0].toUpperCase();

    if (!Object.keys(Timezones).includes(timezone)) {
      message.channel.send(
        language.get(serverID, 'availableTimezones', {
          timezone: Object.keys(Timezones).join(', '),
        })
      );
      return;
    }

    try {
      // @ts-ignore
      await serverRepository.update(serverID, { timezone });
      // @ts-ignore
      serverCache.set(serverID, { timezone });
      message.channel.send(language.get(serverID, 'timezoneSet', { timezone }));
    } catch (error) {
      message.channel.send(language.get(serverID, 'botError'));
      logger.error(error.message);
    }
  }
}
