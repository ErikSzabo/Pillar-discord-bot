import { Command } from './Command';
import { Message, MessageEmbed } from 'discord.js';
import { createEmbed, checkPermission } from '../utils';
import { serverCache, roleType } from './ServerCache';
import config from '../config';
import { CustomError } from './CustomError';

const help = [
  `${config.prefix}set-role mod @role -- moderation/admin`,
  `${config.prefix}set-role poll @role -- create polls`,
  '**You have to mention the role!**',
  'Only the specified role will have access (no hierarchy)',
];

export class SetRoleCommand extends Command {
  constructor() {
    super(
      'set-role',
      'set-role <role type> <role>',
      `sets the required roles for specific commands\nFor help: **${config.prefix}set-role help**`
    );
  }

  public async execute(args: Array<string>, message: Message): Promise<void> {
    const modRole = serverCache.getRole(roleType.MODERATION, message.guild.id);
    try {
      checkPermission(modRole, message.member);
      this.checkErrors(args, message);
    } catch (error) {
      message.channel.send(error.embed);
      return;
    }

    const type = args[0].toLowerCase();
    const roles = message.mentions.roles;
    const serverID = message.guild.id;

    if (type === 'help') {
      message.channel.send(
        createEmbed('💙 Role help', `${help.join('\n')}`, false)
      );
      return;
    }

    const newValue = roles.first() ? roles.first().id : 'off';
    const isOff = newValue === 'off';

    if (type === 'mod') {
      serverCache.setRole(roleType.MODERATION, serverID, newValue);
      message.channel.send(this.createRoleEmbed('Moderation', newValue, isOff));
    } else if (type === 'poll') {
      serverCache.setRole(roleType.POLL, serverID, newValue);
      message.channel.send(this.createRoleEmbed('Poll', newValue, isOff));
    }
  }

  private checkErrors(args: Array<string>, message: Message): void {
    if (args.length < 2 && args[0].toLowerCase() !== 'help') {
      throw new CustomError(this.invalidEmbed());
    }

    if (args.length < 1 && args[0].toLowerCase() !== 'help') {
      throw new CustomError(this.invalidEmbed());
    }

    if (!['help', 'mod', 'poll', 'watch'].includes(args[0].toLowerCase())) {
      throw new CustomError(this.invalidEmbed());
    }

    const roles = message.mentions.roles;
    if (
      !roles.first() &&
      args[0].toLowerCase() !== 'help' &&
      args[1].toLowerCase() !== 'off'
    ) {
      throw new CustomError(this.invalidEmbed());
    }
  }

  private createRoleEmbed(
    start: string,
    role: string,
    isOff: boolean = false
  ): MessageEmbed {
    if (isOff) {
      return createEmbed('💙 Role', `${start} role turned off!`, false);
    } else {
      return createEmbed('💙 Role', `${start} role set to <@&${role}>`, false);
    }
  }

  private invalidEmbed(): MessageEmbed {
    return createEmbed(
      '‼ Invalid',
      `Try: **${config.prefix}${this.getName()} help**`,
      true
    );
  }
}
