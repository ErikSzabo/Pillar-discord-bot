import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import {
  generalServerCache,
  channelType,
} from '../../generic/GeneralServerCache';
import { createEmbed } from '../../utils';

export class WelcomeChannelCommand extends Command {
  constructor() {
    super(
      'welcome-channel',
      'welcome, and leave messages will appear in this channel, set to "off" to disable'
    );
  }

  public execute(args: Array<string>, message: Message): void {
    if (args[0].toLowerCase() === 'off') {
      generalServerCache.setChannel(
        channelType.WELCOME,
        message.guild.id,
        'off'
      );
      message.channel.send(
        createEmbed(
          '🙋‍♂️ Welcome Channel',
          'Welcome channel restrictions are turned off!',
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

    generalServerCache.setChannel(
      channelType.WELCOME,
      message.guild.id,
      channel.id
    );
    message.channel.send(
      createEmbed(
        '🙋‍♂️ Welcome Channel',
        `Welcome channel set to <#${channel.id}>`,
        false
      )
    );
  }
}
