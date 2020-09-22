import { Command } from './Command';
import { Message, MessageEmbed } from 'discord.js';
import { checkPermission } from '../utils';
import { serverCache } from './ServerCache';
import config from '../config';
import { CustomError } from './CustomError';
import { language } from '../language/LanguageManager';
import { serverRepository } from '../database/ServerRepository';

export class SetRoleCommand extends Command {
  constructor() {
    super('set-role', 'set-role <role type> <role>');
  }

  public async execute(args: Array<string>, message: Message): Promise<void> {
    const serverID = message.guild.id;
    const serverData = serverCache.get(serverID);
    try {
      checkPermission(serverData.moderationRole, message.member, serverID);
      this.checkErrors(args, message);
    } catch (error) {
      message.channel.send(error.embed);
      return;
    }

    const type = args[0].toLowerCase();
    const roles = message.mentions.roles;

    if (type === 'help') {
      message.channel.send(
        language.get(serverID, 'roleHelp', { prefix: config.prefix })
      );
      return;
    }

    const newValue = roles.first() ? roles.first().id : 'off';
    const isOff = newValue === 'off';

    if (type === 'mod') {
      try {
        await serverRepository.update(serverID, { moderationRole: newValue });
        serverCache.set(serverID, { moderationRole: newValue });
        message.channel.send(
          this.createRoleEmbed('Moderation', newValue, serverID, isOff)
        );
      } catch (error) {
        message.channel.send(language.get(serverID, 'botError'));
        console.error(error);
      }
    } else if (type === 'poll') {
      try {
        await serverRepository.update(serverID, { pollRole: newValue });
        serverCache.set(serverID, { pollRole: newValue });
        message.channel.send(
          this.createRoleEmbed('Poll', newValue, serverID, isOff)
        );
      } catch (error) {
        message.channel.send(language.get(serverID, 'botError'));
        console.error(error);
      }
    }
  }

  private checkErrors(
    args: Array<string>,
    { guild: { id }, mentions }: Message
  ): void {
    if (args.length < 2 && args[0].toLowerCase() !== 'help') {
      throw new CustomError(this.invalidEmbed(id));
    }

    if (args.length < 1 && args[0].toLowerCase() !== 'help') {
      throw new CustomError(this.invalidEmbed(id));
    }

    if (!['help', 'mod', 'poll', 'watch'].includes(args[0].toLowerCase())) {
      throw new CustomError(this.invalidEmbed(id));
    }

    const roles = mentions.roles;
    if (
      !roles.first() &&
      args[0].toLowerCase() !== 'help' &&
      args[1].toLowerCase() !== 'off'
    ) {
      throw new CustomError(this.invalidEmbed(id));
    }
  }

  private createRoleEmbed(
    start: string,
    role: string,
    serverID: string,
    isOff: boolean = false
  ): MessageEmbed {
    if (isOff) {
      return language.get(serverID, 'roleSetOff', { roleType: start });
    } else {
      return language.get(serverID, 'roleSet', { roleType: start, role: role });
    }
  }

  private invalidEmbed(serverID: string): MessageEmbed {
    return language.get(serverID, 'invalid');
  }
}
