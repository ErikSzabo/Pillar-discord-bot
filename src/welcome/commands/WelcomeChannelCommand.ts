import { Message } from 'discord.js';
import { serverRepository } from '../../database/ServerRepository';
import { Command } from '../../generic/Command';
import { serverCache } from '../../generic/ServerCache';
import { language } from '../../language/LanguageManager';

export class WelcomeChannelCommand extends Command {
  constructor() {
    super('welcome-channel', 'welcome-channel <text channel>');
  }

  public execute(args: Array<string>, message: Message): void {
    const serverID = message.guild.id;

    if (args[0].toLowerCase() === 'off') {
      serverCache.set(serverID, { welcomeChannel: 'off' });
      serverRepository.update(serverID, { welcomeChannel: 'off' });
      message.channel.send(language.get(serverID, 'welcomeChannelOff'));
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

    serverCache.set(serverID, { welcomeChannel: channel.id });
    serverRepository.update(serverID, { welcomeChannel: channel.id });
    message.channel.send(
      language.get(serverID, 'welcomeChannelSet', { channel: channel.id })
    );
  }
}
