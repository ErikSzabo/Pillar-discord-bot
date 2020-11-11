import { CommandManager } from '../generic/ICommandManager';
import { AddCommand } from './commands/AddCommand';
import { DeleteCommand } from './commands/DeleteCommand';
import { Message } from 'discord.js';
import { InfoCommand } from './commands/InfoCommand';
import { IApplication } from '../application';

export class ReminderManager extends CommandManager {
  constructor(name: string) {
    super(name, '🕙');
  }

  public initialize(app: IApplication) {
    this.addCommand(new AddCommand(app));
    this.addCommand(new DeleteCommand(app));
    this.addCommand(new InfoCommand(app));
  }

  public handle(
    app: IApplication,
    command: string,
    args: Array<string>,
    message: Message
  ) {
    if (!this.commands.has(command)) return;

    const serverID = message.guild.id;

    if (!app.isModerator(serverID, message.member)) {
      message.channel.send(app.message(serverID, 'noUserPerm'));
      return;
    }

    this.commands.get(command).execute(args, message);
  }
}
