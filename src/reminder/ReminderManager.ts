import { CommandManager } from '../generic/ICommandManager';
import { AddCommand } from './commands/AddCommand';
import { DeleteCommand } from './commands/DeleteCommand';
import { Message } from 'discord.js';
import { serverCache, roleType } from '../generic/ServerCache';
import { checkPermission } from '../utils';

export class ReminderManager extends CommandManager {
  constructor(name: string) {
    super(name);
    this.addCommand(new AddCommand());
    this.addCommand(new DeleteCommand());
  }

  public handle(command: string, args: Array<string>, message: Message): void {
    if (!this.commands.has(command)) return;
    const serverID = message.guild.id;
    const modRole = serverCache.getRole(roleType.MODERATION, serverID);
    try {
      checkPermission(modRole, message.member, serverID);
    } catch (error) {
      message.channel.send(error.embed);
      return;
    }

    this.commands.get(command).execute(args, message);
  }
}
