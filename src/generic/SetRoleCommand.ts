import { Command } from './Command';
import { Message, MessageEmbed } from 'discord.js';
import { checkPermission } from '../utils';
import { serverCache, roleType } from './ServerCache';
import config from '../config';
import { CustomError } from './CustomError';
import { language } from '../language/LanguageManager';

export class SetRoleCommand extends Command {
  constructor() {
    super(
      'set-role',
      'set-role <role type> <role>',
      `sets the required roles for specific commands\nFor help: **${config.prefix}set-role help**`
    );
  }

  public async execute(args: Array<string>, message: Message): Promise<void> {
    const currLang = serverCache.getLang(message.guild.id);
    const modRole = serverCache.getRole(roleType.MODERATION, message.guild.id);
    try {
      checkPermission(modRole, message.member);
      this.checkErrors(args, message, currLang);
    } catch (error) {
      message.channel.send(error.embed);
      return;
    }

    const type = args[0].toLowerCase();
    const roles = message.mentions.roles;
    const serverID = message.guild.id;

    if (type === 'help') {
      message.channel.send(
        language.get(currLang, 'roleHelp', { prefix: config.prefix })
      );
      return;
    }

    const newValue = roles.first() ? roles.first().id : 'off';
    const isOff = newValue === 'off';

    if (type === 'mod') {
      serverCache.setRole(roleType.MODERATION, serverID, newValue);
      message.channel.send(
        // TODO: [ROLETYPE] is in english -> that's sucks
        this.createRoleEmbed('Moderation', newValue, currLang, isOff)
      );
    } else if (type === 'poll') {
      serverCache.setRole(roleType.POLL, serverID, newValue);
      message.channel.send(
        this.createRoleEmbed('Poll', newValue, currLang, isOff)
      );
    }
  }

  private checkErrors(
    args: Array<string>,
    message: Message,
    currLang: string
  ): void {
    if (args.length < 2 && args[0].toLowerCase() !== 'help') {
      throw new CustomError(this.invalidEmbed(currLang));
    }

    if (args.length < 1 && args[0].toLowerCase() !== 'help') {
      throw new CustomError(this.invalidEmbed(currLang));
    }

    if (!['help', 'mod', 'poll', 'watch'].includes(args[0].toLowerCase())) {
      throw new CustomError(this.invalidEmbed(currLang));
    }

    const roles = message.mentions.roles;
    if (
      !roles.first() &&
      args[0].toLowerCase() !== 'help' &&
      args[1].toLowerCase() !== 'off'
    ) {
      throw new CustomError(this.invalidEmbed(currLang));
    }
  }

  private createRoleEmbed(
    start: string,
    role: string,
    currLang: string,
    isOff: boolean = false
  ): MessageEmbed {
    if (isOff) {
      return language.get(currLang, 'roleSetOff', { roleType: start });
    } else {
      return language.get(currLang, 'roleSet', { roleType: start, role: role });
    }
  }

  private invalidEmbed(currLang: string): MessageEmbed {
    return language.get(currLang, 'invalid');
  }
}
