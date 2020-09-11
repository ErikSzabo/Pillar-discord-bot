import { Command } from './Command';
import { Message, MessageEmbed } from 'discord.js';
import { createEmbed, checkPermission } from '../utils';
import { serverCache, roleType } from './ServerCache';
import config from '../config';
import { CustomError } from './CustomError';

const help = [
  `${config.prefix}set-role mod @role -- moderation`,
  `${config.prefix}set-role poll @role -- create polls`,
  `${config.prefix}set-role watch @role -- use watchtogether`,
  '**You have to mention the role!**',
  'Only the specified role will have access (no hierarchy)',
];

export class SetRoleCommand extends Command {
  constructor() {
    super(
      'set-role',
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
    } else if (type === 'watch') {
      serverCache.setRole(roleType.WATCH, serverID, newValue);
      message.channel.send(
        this.createRoleEmbed('WatchTogether', newValue, isOff)
      );
    }
  }

  private checkErrors(args: Array<string>, message: Message): void {
    if (args.length < 2 && args[0].toLowerCase() !== 'help') {
      throw new CustomError(
        createEmbed(
          '‼ Invalid',
          `Try: **${config.prefix}${this.getName()} help**`,
          true
        )
      );
    }

    if (args.length < 1 && args[0].toLowerCase() !== 'help') {
      throw new CustomError(
        createEmbed(
          '‼ Invalid',
          `Try: **${config.prefix}${this.getName()} help**`,
          true
        )
      );
    }

    if (!['help', 'mod', 'poll', 'watch'].includes(args[0].toLowerCase())) {
      throw new CustomError(
        createEmbed(
          '‼ Invalid',
          `Try: **${config.prefix}${this.getName()} help**`,
          true
        )
      );
    }

    const roles = message.mentions.roles;
    if (
      !roles.first() &&
      args[0].toLowerCase() !== 'help' &&
      args[1].toLowerCase() !== 'off'
    ) {
      throw new CustomError(
        createEmbed(
          '‼ Invalid',
          `Try: **${config.prefix}${this.getName()} help**`,
          true
        )
      );
    }
  }

  private createRoleEmbed(
    start: string,
    role: string,
    isOff: boolean = false
  ): MessageEmbed {
    if (isOff) {
      return createEmbed(
        '💙 Role',
        `${start} role restrictions are turned off!`,
        false
      );
    } else {
      return createEmbed('💙 Role', `${start} role set to <@&${role}>`, false);
    }
  }
}
