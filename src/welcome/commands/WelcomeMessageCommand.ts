import { Command } from '../../generic/Command';
import { Message } from 'discord.js';
import { createEmbed, checkPermission } from '../../utils';
import {
  messageType,
  generalServerCache,
  roleType,
} from '../../generic/GeneralServerCache';
import config from '../../config';

export class WelcomeMessageCommand extends Command {
  constructor() {
    super(
      'welcome-message',
      'sets the welcome message for the server, [USER] placeholder can be used, set to "off" to disable'
    );
  }

  public execute(args: Array<string>, message: Message): void {
    if (args[0].toLowerCase() === 'off') {
      generalServerCache.setMessage(messageType.LEAVE, message.guild.id, 'off');
      message.channel.send(
        createEmbed(
          '🗨 Welcome Message',
          'Now I will **not** send welcome messages when someone leaves!',
          false
        )
      );
      return;
    }

    const welcomeMessage = message.content
      .slice(config.prefix.length + this.getName().length)
      .trim();

    if (!welcomeMessage) {
      message.channel.send(
        createEmbed(
          'Empty',
          'Welcome message can not be nothing, use "off" if you want to turn the feature off',
          true
        )
      );
      return;
    }

    generalServerCache.setMessage(
      messageType.LEAVE,
      message.guild.id,
      welcomeMessage
    );

    message.channel.send(
      createEmbed(
        '🗨 Welcome message',
        `Welcome message set to: **${welcomeMessage}**`,
        false
      )
    );
  }
}
