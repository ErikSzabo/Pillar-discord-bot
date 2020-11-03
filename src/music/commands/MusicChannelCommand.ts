import { Command } from '../../generic/Command';
import { Message } from 'discord.js';
import { IApplication } from '../../application';

export class MusicChannelCommand extends Command {
  constructor(app: IApplication) {
    super('music-channel', 'music-channel <text channel>', app);
  }

  public async execute(args: string[], message: Message) {
    const serverID = message.guild.id;

    if (!this.app.isModerator(serverID, message.member)) {
      message.channel.send(this.app.message(serverID, 'noUserPerm'));
      return;
    }

    if (args[0].toLowerCase() === 'off') {
      try {
        this.app.getServerStore().update(serverID, { musicChannel: 'off' });
        message.channel.send(this.app.message(serverID, 'musicChannelOff'));
      } catch {
        message.channel.send(this.app.message(serverID, 'botError'));
      }
      return;
    }

    const channels = message.mentions.channels;

    if (!channels.first()) {
      message.channel.send(this.app.message(serverID, 'noChannelMention'));
      return;
    }

    const channel = channels.first();

    if (channel.type !== 'text') {
      message.channel.send(this.app.message(serverID, 'notTextChannel'));
      return;
    }

    const perms = channel.permissionsFor(message.client.user);

    if (!perms.has('SEND_MESSAGES') || !perms.has('READ_MESSAGE_HISTORY')) {
      message.channel.send(this.app.message(serverID, 'noReadSendPerm'));
      return;
    }

    this.app.getServerStore().update(serverID, { musicChannel: channel.id });
    message.channel.send(
      this.app.message(serverID, 'musicChannelSet', { channel: channel.id })
    );
  }
}
