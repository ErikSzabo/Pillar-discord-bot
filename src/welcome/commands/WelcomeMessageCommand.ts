import { Command } from '../../generic/Command';
import { Message } from 'discord.js';
import { messageType, serverCache } from '../../generic/ServerCache';
import config from '../../config';
import { language } from '../../language/LanguageManager';

export class WelcomeMessageCommand extends Command {
  constructor() {
    super('welcome-message', 'welcome-message <message>');
  }

  public execute(args: Array<string>, message: Message): void {
    const currLang = serverCache.getLang(message.guild.id);
    if (args[0].toLowerCase() === 'off') {
      serverCache.setMessage(messageType.WELCOME, message.guild.id, 'off');
      message.channel.send(language.get(currLang, 'welcomeMessageOff'));
      return;
    }

    const welcomeMessage = message.content
      .slice(config.prefix.length + this.getName().length)
      .trim();

    if (!welcomeMessage) {
      message.channel.send(language.get(currLang, 'welcomeMessageEmpty'));
      return;
    }

    serverCache.setMessage(
      messageType.WELCOME,
      message.guild.id,
      welcomeMessage
    );

    message.channel.send(
      language.get(currLang, 'welcomeMessageSet', { message: welcomeMessage })
    );
  }
}
