import { Message } from 'discord.js';
import { IApplication } from '../application';
import { CommandManager } from '../generic/ICommandManager';
import { PollCommand } from './commands/PollCommand';

export class PollManager extends CommandManager {
  constructor(name: string) {
    super(name);
    this.addCommand(new PollCommand());
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
    try {
      app.checkPermission(pollRole, message.member, serverID);
    } catch (error) {
      message.channel.send(error.embed);
      return;
    }

    this.commands.get(command).execute(app, args, message);
  }
}
