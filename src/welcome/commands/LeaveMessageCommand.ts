import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import { serverCache, roleType, messageType } from '../../generic/ServerCache';
import { checkPermission, createEmbed } from '../../utils';
import config from '../../config';

export class LeaveMessageCommand extends Command {
  constructor() {
    super(
      'leave-message',
      'sets the leave message for the server, [USER] placeholder can be used, set to "off" to disable'
    );
  }

  public execute(args: Array<string>, message: Message): void {
    if (args[0].toLowerCase() === 'off') {
      serverCache.setMessage(messageType.LEAVE, message.guild.id, 'off');
      message.channel.send(
        createEmbed(
          '🗨 Leave Message',
          'Now I will **not** send leave messages when someone leaves!',
          false
        )
      );
      return;
    }

    const leaveMessage = message.content
      .slice(config.prefix.length + this.getName().length)
      .trim();

    if (!leaveMessage) {
      message.channel.send(
        createEmbed(
          'Empty',
          'Leave message can not be nothing, use "off" if you want to turn the feature off',
          true
        )
      );
      return;
    }

    serverCache.setMessage(messageType.LEAVE, message.guild.id, leaveMessage);

    message.channel.send(
      createEmbed(
        '🗨 Leave message',
        `Leave message set to: **${leaveMessage}**`,
        false
      )
    );
  }
}
