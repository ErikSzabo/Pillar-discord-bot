import { Command } from './Command';
import { Message, MessageEmbed } from 'discord.js';
import { logger } from '../logger';
import { IApplication } from '../application';

export class SetRoleCommand extends Command {
  constructor(app: IApplication) {
    super('set-role', 'set-role <role type> <role>', app);
  }

  public async execute(args: string[], message: Message) {
    const serverID = message.guild.id;

    if (!this.app.isModerator(serverID, message.member)) {
      message.channel.send(this.app.message(serverID, 'noUserPerm'));
      return;
    }

    const error = this.checkErrors(args, message);
    if (error) {
      message.channel.send(error);
      return;
    }

    const type = args[0].toLowerCase();
    const roles = message.mentions.roles;

    if (type === 'help') {
      message.channel.send(
        this.app.message(serverID, 'roleHelp', {
          prefix: this.app.getConfig().prefix,
        })
      );
      return;
    }

    const newValue = roles.first() ? roles.first().id : 'off';
    const isOff = newValue === 'off';

    if (type === 'mod') {
      try {
        await this.app
          .getServerStore()
          .update(serverID, { moderationRole: newValue });
        message.channel.send(
          this.createRoleEmbed('Moderation', newValue, serverID, isOff)
        );
      } catch (error) {
        message.channel.send(this.app.message(serverID, 'botError'));
        logger.error(error.message);
      }
    } else if (type === 'poll') {
      try {
        await this.app
          .getServerStore()
          .update(serverID, { pollRole: newValue });
        message.channel.send(
          this.createRoleEmbed('Poll', newValue, serverID, isOff)
        );
      } catch (error) {
        message.channel.send(this.app.message(serverID, 'botError'));
        logger.error(error.message);
      }
    }
  }

  private checkErrors(
    args: string[],
    { guild: { id }, mentions }: Message
  ): MessageEmbed {
    if (args.length < 2 && args[0].toLowerCase() !== 'help') {
      return this.invalidEmbed(id);
    }

    if (args.length < 1 && args[0].toLowerCase() !== 'help') {
      return this.invalidEmbed(id);
    }

    if (!['help', 'mod', 'poll', 'watch'].includes(args[0].toLowerCase())) {
      return this.invalidEmbed(id);
    }

    const roles = mentions.roles;
    if (
      !roles.first() &&
      args[0].toLowerCase() !== 'help' &&
      args[1].toLowerCase() !== 'off'
    ) {
      return this.invalidEmbed(id);
    }
  }

  private createRoleEmbed(
    start: string,
    role: string,
    serverID: string,
    isOff: boolean = false
  ): MessageEmbed {
    if (isOff) {
      return this.app.message(serverID, 'roleSetOff', { roleType: start });
    } else {
      return this.app.message(serverID, 'roleSet', {
        roleType: start,
        role: role,
      });
    }
  }

  private invalidEmbed(serverID: string): MessageEmbed {
    return this.app.message(serverID, 'invalid');
  }
}
