import { Command } from '../../generic/Command';
import { Message } from 'discord.js';
import { checkPermission } from '../../utils';
import { serverCache, roleType, channelType } from '../../generic/ServerCache';
import { language } from '../../language/LanguageManager';

export class MusicChannelCommand extends Command {
  constructor() {
    super('music-channel', 'music-channel <text channel>');
  }

  public async execute(args: Array<string>, message: Message): Promise<void> {
    const serverID = message.guild.id;
    const modRole = serverCache.getRole(roleType.MODERATION, message.guild.id);
    try {
      checkPermission(modRole, message.member, serverID);
    } catch (error) {
      message.channel.send(error.embed);
      return;
    }

    if (args[0].toLowerCase() === 'off') {
      serverCache.setChannel(channelType.MUSIC, message.guild.id, 'off');
      message.channel.send(language.get(serverID, 'musicChannelOff'));
      return;
    }

    const channels = message.mentions.channels;

    if (!channels.first()) {
      message.channel.send(language.get(serverID, 'noChannelMention'));
      return;
    }

    const channel = channels.first();

    if (channel.type !== 'text') {
      message.channel.send(language.get(serverID, 'notTextChannel'));
      return;
    }

    const perms = channel.permissionsFor(message.client.user);

    if (!perms.has('SEND_MESSAGES') || !perms.has('READ_MESSAGE_HISTORY')) {
      message.channel.send(language.get(serverID, 'noReadSendPerm'));
      return;
    }

    serverCache.setChannel(channelType.MUSIC, message.guild.id, channel.id);
    message.channel.send(language.get(serverID, 'musicChannelSet'));
  }
}
