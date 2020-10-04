import { Message } from 'discord.js';
import { CommandManager } from '../generic/ICommandManager';
import { serverCache } from '../generic/ServerCache';
import { checkPermission } from '../utils';
import { PollCommand } from './commands/PollCommand';

export class PollManager extends CommandManager {
  constructor(name: string) {
    super(name);
    this.addCommand(new PollCommand());
  }

  public handle(command: string, args: string[], message: Message): void {
    if (!this.commands.has(command)) return;
    const serverID = message.guild.id;
    const pollRole = serverCache.get(serverID).pollRole;
    try {
      checkPermission(pollRole, message.member, serverID);
    } catch (error) {
      message.channel.send(error.embed);
      return;
    }

    this.commands.get(command).execute(args, message);
  }
}
