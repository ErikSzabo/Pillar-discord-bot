import { Command } from '../../generic/Command';
import { Message } from 'discord.js';
import { serverCache } from '../../generic/ServerCache';
import config from '../../config';
import { language } from '../../language/LanguageManager';
import { serverRepository } from '../../database/ServerRepository';

export class WelcomeMessageCommand extends Command {
  constructor() {
    super('welcome-message', 'welcome-message <message>');
  }

  public execute(args: Array<string>, message: Message): void {
    const serverID = message.guild.id;
    if (args[0].toLowerCase() === 'off') {
      serverCache.set(serverID, { welcomeMessage: 'off' });
      serverRepository.update(serverID, { welcomeMessage: 'off' });
      message.channel.send(language.get(serverID, 'welcomeMessageOff'));
      return;
    }

    const welcomeMessage = message.content
      .slice(config.prefix.length + this.getName().length)
      .trim();

    if (!welcomeMessage) {
      message.channel.send(language.get(serverID, 'welcomeMessageEmpty'));
      return;
    }

    serverCache.set(serverID, { welcomeMessage });
    serverRepository.update(serverID, { welcomeMessage });

    message.channel.send(
      language.get(serverID, 'welcomeMessageSet', { message: welcomeMessage })
    );
  }
}
