import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import { serverCache } from '../../generic/ServerCache';
import config from '../../config';
import { language } from '../../language/LanguageManager';
import { serverRepository } from '../../database/ServerRepository';

export class LeaveMessageCommand extends Command {
  constructor() {
    super('leave-message', 'leave-message <message>');
  }

  public execute(args: Array<string>, message: Message): void {
    const serverID = message.guild.id;
    if (args[0].toLowerCase() === 'off') {
      serverCache.set(serverID, { leaveMessage: 'off' });
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

    serverCache.set(serverID, { leaveMessage });

    message.channel.send(
      language.get(serverID, 'leaveMessageSet', { message: leaveMessage })
    );
  }
}
