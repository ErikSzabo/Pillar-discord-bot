import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import { serverCache, messageType } from '../../generic/ServerCache';
import config from '../../config';
import { language } from '../../language/LanguageManager';

export class LeaveMessageCommand extends Command {
  constructor() {
    super('leave-message', 'leave-message <message>');
  }

  public execute(args: Array<string>, message: Message): void {
    const currLang = serverCache.getLang(message.guild.id);
    if (args[0].toLowerCase() === 'off') {
      serverCache.setMessage(messageType.LEAVE, message.guild.id, 'off');
      message.channel.send(language.get(currLang, 'leaveMessageOff'));
      return;
    }

    const leaveMessage = message.content
      .slice(config.prefix.length + this.getName().length)
      .trim();

    if (!leaveMessage) {
      message.channel.send(language.get(currLang, 'leaveMessageEmpty'));
      return;
    }

    serverCache.setMessage(messageType.LEAVE, message.guild.id, leaveMessage);

    message.channel.send(
      language.get(currLang, 'leaveMessageSet', { message: leaveMessage })
    );
  }
}
