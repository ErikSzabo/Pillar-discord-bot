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
    const serverID = message.guild.id;
    if (args[0].toLowerCase() === 'off') {
      serverCache.setMessage(messageType.LEAVE, serverID, 'off');
      message.channel.send(language.get(serverID, 'leaveMessageOff'));
      return;
    }

    const leaveMessage = message.content
      .slice(config.prefix.length + this.getName().length)
      .trim();

    if (!leaveMessage) {
      message.channel.send(language.get(serverID, 'leaveMessageEmpty'));
      return;
    }

    serverCache.setMessage(messageType.LEAVE, serverID, leaveMessage);

    message.channel.send(
      language.get(serverID, 'leaveMessageSet', { message: leaveMessage })
    );
  }
}
