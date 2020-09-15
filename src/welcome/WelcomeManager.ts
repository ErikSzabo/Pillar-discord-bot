import { Message } from 'discord.js';
import { CommandManager } from '../generic/ICommandManager';
import { LeaveMessageCommand } from './commands/LeaveMessageCommand';
import { WelcomeMessageCommand } from './commands/WelcomeMessageCommand';
import { WelcomeChannelCommand } from './commands/WelcomeChannelCommand';
import { serverCache, roleType } from '../generic/ServerCache';
import { checkPermission, createEmbed } from '../utils';
import { language } from '../language/LanguageManager';

export class WelcomeManager extends CommandManager {
  constructor(name: string) {
    super(name);
    this.addCommand(new WelcomeMessageCommand());
    this.addCommand(new LeaveMessageCommand());
    this.addCommand(new WelcomeChannelCommand());
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

    if (args.length < 1) {
      message.channel.send(language.get(serverID, 'notEnoughArguments'));
      return;
    }

    this.commands.get(command).execute(args, message);
  }
}
