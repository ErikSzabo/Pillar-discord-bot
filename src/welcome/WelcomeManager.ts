import { Message } from 'discord.js';
import { CommandManager } from '../generic/ICommandManager';
import { LeaveMessageCommand } from './commands/LeaveMessageCommand';
import { WelcomeMessageCommand } from './commands/WelcomeMessageCommand';
import { WelcomeChannelCommand } from './commands/WelcomeChannelCommand';
import { IApplication } from '../application';

export class WelcomeManager extends CommandManager {
  constructor(name: string) {
    super(name, '🙋‍♂️');
  }

  public initialize(app: IApplication) {
    this.addCommand(new WelcomeMessageCommand(app));
    this.addCommand(new LeaveMessageCommand(app));
    this.addCommand(new WelcomeChannelCommand(app));
  }

  public handle(
    app: IApplication,
    command: string,
    args: Array<string>,
    message: Message
  ): void {
    if (!this.commands.has(command)) return;
    const serverID = message.guild.id;

    if (!app.isModerator(serverID, message.member)) {
      message.channel.send(app.message(serverID, 'noUserPerm'));
      return;
    }

    if (args.length < 1) {
      message.channel.send(app.message(serverID, 'notEnoughArguments'));
      return;
    }

    this.commands.get(command).execute(args, message);
  }
}
