import { Command } from '../../generic/Command';
import { Message } from 'discord.js';
import { createEmbed, checkPermission } from '../../utils';
import { serverCache, roleType, channelType } from '../../generic/ServerCache';

export class MusicChannelCommand extends Command {
  constructor() {
    super(
      'music-channel',
      'music-channel <text channel>',
      "sets the music channel, by default every channel is allowed, (write 'off' if you want to reset this)"
    );
  }

  public async execute(args: Array<string>, message: Message): Promise<void> {
    const modRole = serverCache.getRole(roleType.MODERATION, message.guild.id);
    try {
      checkPermission(modRole, message.member);
    } catch (error) {
      message.channel.send(error.embed);
      return;
    }

    if (args[0].toLowerCase() === 'off') {
      serverCache.setChannel(channelType.MUSIC, message.guild.id, 'off');
      message.channel.send(
        createEmbed(
          '🔉 Music Channel',
          'Music channel restrictions are turned off!',
          false
        )
      );
      return;
    }

    const channels = message.mentions.channels;

    if (!channels.first()) {
      message.channel.send(
        createEmbed(
          'Invalid',
          'You have to mention a channel, like: #channel',
          true
        )
      );
      return;
    }

    const channel = channels.first();

    if (channel.type !== 'text') {
      message.channel.send(
        createEmbed('Invalid', 'You have to provide a **text** channel!', true)
      );
      return;
    }

    const perms = channel.permissionsFor(message.client.user);

    if (!perms.has('SEND_MESSAGES') || !perms.has('READ_MESSAGE_HISTORY')) {
      message.channel.send(
        createEmbed(
          'No permission',
          "I don't have **read** or **send** permission for this channel!",
          true
        )
      );
      return;
    }

    serverCache.setChannel(channelType.MUSIC, message.guild.id, channel.id);
    message.channel.send(
      createEmbed(
        '🔉 Music Channel',
        `Music channel set to <#${channel.id}>`,
        false
      )
    );
  }
}
