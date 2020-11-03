import { Message } from 'discord.js';
import { IApplication } from '../../application';
import { Command } from '../../generic/Command';
import { logger } from '../../logger';

export class WelcomeChannelCommand extends Command {
  constructor() {
    super('welcome-channel', 'welcome-channel <text channel>');
  }

  public async execute(
    app: IApplication,
    args: Array<string>,
    message: Message
  ) {
    const serverID = message.guild.id;

    if (args[0].toLowerCase() === 'off') {
      try {
        await app.getServerStore().update(serverID, { welcomeChannel: 'off' });
        message.channel.send(app.message(serverID, 'welcomeChannelOff'));
      } catch (error) {
        message.channel.send(app.message(serverID, 'botError'));
        logger.error(error.message);
      } finally {
        return;
      }
    }

    const channels = message.mentions.channels;

    if (!channels.first()) {
      message.channel.send(app.message(serverID, 'noChannelMention'));
      return;
    }

    const channel = channels.first();

    if (channel.type !== 'text') {
      message.channel.send(app.message(serverID, 'notTextChannel'));
      return;
    }

    const perms = channel.permissionsFor(message.client.user);

    if (!perms.has('SEND_MESSAGES') || !perms.has('READ_MESSAGE_HISTORY')) {
      message.channel.send(app.message(serverID, 'noReadSendPerm'));
      return;
    }

    try {
      await app
        .getServerStore()
        .update(serverID, { welcomeChannel: channel.id });
      message.channel.send(
        app.message(serverID, 'welcomeChannelSet', { channel: channel.id })
      );
    } catch (error) {
      message.channel.send(app.message(serverID, 'botError'));
      logger.error(error.message);
    }
  }
}
