import { Command } from '../../generic/Command';
import { Message } from 'discord.js';
import { IApplication } from '../../application';

export class MusicChannelCommand extends Command {
  constructor() {
    super('music-channel', 'music-channel <text channel>');
  }

  public async execute(app: IApplication, args: string[], message: Message) {
    const serverID = message.guild.id;
    const serverData = app.getServerStore().get(serverID);
    try {
      app.checkPermission(serverData.moderationRole, message.member, serverID);
    } catch (error) {
      message.channel.send(error.embed);
      return;
    }

    if (args[0].toLowerCase() === 'off') {
      try {
        app.getServerStore().update(serverID, { musicChannel: 'off' });
        message.channel.send(app.message(serverID, 'musicChannelOff'));
      } catch {
        message.channel.send(app.message(serverID, 'botError'));
      }
      return;
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

    app.getServerStore().update(serverID, { musicChannel: channel.id });
    message.channel.send(
      app.message(serverID, 'musicChannelSet', { channel: channel.id })
    );
  }
}
