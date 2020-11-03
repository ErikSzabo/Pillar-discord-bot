import { CommandManager } from '../generic/ICommandManager';
import { AddCommand } from './commands/AddCommand';
import { DeleteCommand } from './commands/DeleteCommand';
import { Message } from 'discord.js';
import { InfoCommand } from './commands/InfoCommand';
import { IApplication } from '../application';

export class ReminderManager extends CommandManager {
  constructor(name: string) {
    super(name);
    this.addCommand(new AddCommand());
    this.addCommand(new DeleteCommand());
    this.addCommand(new InfoCommand());
  }

  public handle(
    app: IApplication,
    command: string,
    args: Array<string>,
    message: Message
  ) {
    if (!this.commands.has(command)) return;
    const serverID = message.guild.id;
    const modRole = app.getServerStore().get(serverID).moderationRole;
    try {
      app.checkPermission(modRole, message.member, serverID);
    } catch (error) {
      message.channel.send(error.embed);
      return;
    }

    this.commands.get(command).execute(app, args, message);
  }
}
