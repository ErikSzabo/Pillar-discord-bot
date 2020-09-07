import { Command } from './Command';
import { Message } from 'discord.js';
import { createEmbed, checkPermission } from '../utils';
import { generalServerCache } from '../generic/GeneralServerCache';

export class MusicChannelCommand extends Command {
  constructor() {
    super(
      'music-channel',
      "sets the music channel, by default every channel is allowed, (write 'off' if you want to reset this)"
    );
  }

  public async execute(args: Array<string>, message: Message): Promise<void> {
    const modRole = generalServerCache.getModerationRole(message.guild.id);
    try {
      checkPermission(modRole, message.member);
    } catch (error) {
      message.channel.send(error.embed);
      return;
    }

    if (args[0].toLowerCase() === 'off') {
      generalServerCache.setMusicChannel(message.guild.id, 'off');
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

    if (!channels) {
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

    generalServerCache.setMusicChannel(message.guild.id, channel.id);
    message.channel.send(
      createEmbed(
        '🔉 Music Channel',
        `Music channel set to <#${channel.id}>`,
        false
      )
    );
  }
}
