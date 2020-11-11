import { Message } from 'discord.js';
import { IApplication } from '../application';
import { CommandManager } from '../generic/ICommandManager';
import { PollCommand } from './commands/PollCommand';

export class PollManager extends CommandManager {
  constructor(name: string) {
    super(name, '💭');
  }

  public initialize(app: IApplication) {
    this.addCommand(new PollCommand(app));
  }

  public handle(
    app: IApplication,
    command: string,
    args: string[],
    message: Message
  ): void {
    if (!this.commands.has(command)) return;

    const serverID = message.guild.id;
    const pollRole = app.getServerStore().get(serverID).pollRole;

    if (!app.hasPermissionRole(pollRole, message.member)) {
      message.channel.send(app.message(serverID, 'noUserPerm'));
      return;
    }

    this.commands.get(command).execute(args, message);
  }
}
