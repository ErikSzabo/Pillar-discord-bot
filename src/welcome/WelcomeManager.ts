import { Message } from 'discord.js';
import { CommandManager } from '../generic/ICommandManager';
import { LeaveMessageCommand } from './commands/LeaveMessageCommand';
import { WelcomeMessageCommand } from './commands/WelcomeMessageCommand';
import { WelcomeChannelCommand } from './commands/WelcomeChannelCommand';
import { IApplication } from '../application';

export class WelcomeManager extends CommandManager {
  constructor(name: string) {
    super(name);
    this.addCommand(new WelcomeMessageCommand());
    this.addCommand(new LeaveMessageCommand());
    this.addCommand(new WelcomeChannelCommand());
  }

  public handle(
    app: IApplication,
    command: string,
    args: Array<string>,
    message: Message
  ): void {
    if (!this.commands.has(command)) return;
    const serverID = message.guild.id;
    const modRole = app.getServerStore().get(serverID).moderationRole;
    try {
      app.checkPermission(modRole, message.member, serverID);
    } catch (error) {
      message.channel.send(error.embed);
      return;
    }

    if (args.length < 1) {
      message.channel.send(app.message(serverID, 'notEnoughArguments'));
      return;
    }

    this.commands.get(command).execute(app, args, message);
  }
}
