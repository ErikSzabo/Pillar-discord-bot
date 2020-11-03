import { Command } from './Command';
import { Message, MessageEmbed } from 'discord.js';
import { CustomError } from './CustomError';
import { logger } from '../logger';
import { IApplication } from '../application';

export class SetRoleCommand extends Command {
  constructor() {
    super('set-role', 'set-role <role type> <role>');
  }

  public async execute(
    app: IApplication,
    args: Array<string>,
    message: Message
  ) {
    const serverID = message.guild.id;
    const serverData = app.getServerStore().get(serverID);
    try {
      app.checkPermission(serverData.moderationRole, message.member, serverID);
      this.checkErrors(app, args, message);
    } catch (error) {
      message.channel.send(error.embed);
      return;
    }

    const type = args[0].toLowerCase();
    const roles = message.mentions.roles;

    if (type === 'help') {
      message.channel.send(
        app.message(serverID, 'roleHelp', { prefix: app.getConfig().prefix })
      );
      return;
    }

    const newValue = roles.first() ? roles.first().id : 'off';
    const isOff = newValue === 'off';

    if (type === 'mod') {
      try {
        await app
          .getServerStore()
          .update(serverID, { moderationRole: newValue });
        message.channel.send(
          this.createRoleEmbed(app, 'Moderation', newValue, serverID, isOff)
        );
      } catch (error) {
        message.channel.send(app.message(serverID, 'botError'));
        logger.error(error.message);
      }
    } else if (type === 'poll') {
      try {
        await app.getServerStore().update(serverID, { pollRole: newValue });
        message.channel.send(
          this.createRoleEmbed(app, 'Poll', newValue, serverID, isOff)
        );
      } catch (error) {
        message.channel.send(app.message(serverID, 'botError'));
        logger.error(error.message);
      }
    }
  }

  private checkErrors(
    app: IApplication,
    args: Array<string>,
    { guild: { id }, mentions }: Message
  ): void {
    if (args.length < 2 && args[0].toLowerCase() !== 'help') {
      throw new CustomError(this.invalidEmbed(id, app));
    }

    if (args.length < 1 && args[0].toLowerCase() !== 'help') {
      throw new CustomError(this.invalidEmbed(id, app));
    }

    if (!['help', 'mod', 'poll', 'watch'].includes(args[0].toLowerCase())) {
      throw new CustomError(this.invalidEmbed(id, app));
    }

    const roles = mentions.roles;
    if (
      !roles.first() &&
      args[0].toLowerCase() !== 'help' &&
      args[1].toLowerCase() !== 'off'
    ) {
      throw new CustomError(this.invalidEmbed(id, app));
    }
  }

  private createRoleEmbed(
    app: IApplication,
    start: string,
    role: string,
    serverID: string,
    isOff: boolean = false
  ): MessageEmbed {
    if (isOff) {
      return app.message(serverID, 'roleSetOff', { roleType: start });
    } else {
      return app.message(serverID, 'roleSet', { roleType: start, role: role });
    }
  }

  private invalidEmbed(serverID: string, app: IApplication): MessageEmbed {
    return app.message(serverID, 'invalid');
  }
}
