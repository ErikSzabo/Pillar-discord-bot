import { Message } from 'discord.js';
import { CommandManager } from '../generic/ICommandManager';
import { LeaveMessageCommand } from './commands/LeaveMessageCommand';
import { WelcomeMessageCommand } from './commands/WelcomeMessageCommand';
import { WelcomeChannelCommand } from './commands/WelcomeChannelCommand';
import { generalServerCache, roleType } from '../generic/GeneralServerCache';
import { checkPermission, createEmbed } from '../utils';

export class WelcomeManager extends CommandManager {
  constructor(name: string) {
    super(name);
    this.addCommand(new WelcomeMessageCommand());
    this.addCommand(new LeaveMessageCommand());
    this.addCommand(new WelcomeChannelCommand());
  }

  public handle(command: string, args: Array<string>, message: Message): void {
    if (!this.commands.has(command)) return;

    const modRole = generalServerCache.getRole(
      roleType.MODERATION,
      message.guild.id
    );
    try {
      checkPermission(modRole, message.member);
    } catch (error) {
      message.channel.send(error.embed);
      return;
    }

    if (args.length < 1) {
      message.channel.send(
        createEmbed('Invalid', 'Not enough arguments!', true)
      );
      return;
    }

    this.commands.get(command).execute(args, message);
  }
}
