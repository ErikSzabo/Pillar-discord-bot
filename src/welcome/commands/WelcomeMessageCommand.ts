import { Command } from '../../generic/Command';
import { Message } from 'discord.js';
import { serverCache } from '../../generic/ServerCache';
import config from '../../config';
import { language } from '../../language/LanguageManager';
import { serverRepository } from '../../database/ServerRepository';
import { logger } from '../../logger';

export class WelcomeMessageCommand extends Command {
  constructor() {
    super('welcome-message', 'welcome-message <message>');
  }

  public async execute(args: Array<string>, message: Message) {
    const serverID = message.guild.id;
    if (args[0].toLowerCase() === 'off') {
      try {
        await serverRepository.update(serverID, { welcomeMessage: 'off' });
        serverCache.set(serverID, { welcomeMessage: 'off' });
        message.channel.send(language.get(serverID, 'welcomeMessageOff'));
      } catch (error) {
        message.channel.send(language.get(serverID, 'botError'));
        logger.error(error.message);
      } finally {
        return;
      }
    }

    const welcomeMessage = message.content
      .slice(config.prefix.length + this.getName().length)
      .trim();

    if (!welcomeMessage) {
      message.channel.send(language.get(serverID, 'welcomeMessageEmpty'));
      return;
    }

    try {
      await serverRepository.update(serverID, { welcomeMessage });
      serverCache.set(serverID, { welcomeMessage });
      message.channel.send(
        language.get(serverID, 'welcomeMessageSet', { message: welcomeMessage })
      );
    } catch (error) {
      message.channel.send(language.get(serverID, 'botError'));
      logger.error(error.message);
    }
  }
}
