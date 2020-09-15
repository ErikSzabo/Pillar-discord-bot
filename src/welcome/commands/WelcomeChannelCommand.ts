import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import { serverCache, channelType } from '../../generic/ServerCache';
import { language } from '../../language/LanguageManager';

export class WelcomeChannelCommand extends Command {
  constructor() {
    super('welcome-channel', 'welcome-channel <text channel>');
  }

  public execute(args: Array<string>, message: Message): void {
    const currLang = serverCache.getLang(message.guild.id);

    if (args[0].toLowerCase() === 'off') {
      serverCache.setChannel(channelType.WELCOME, message.guild.id, 'off');
      message.channel.send(language.get(currLang, 'welcomeChannelOff'));
      return;
    }

    const channels = message.mentions.channels;

    if (!channels.first()) {
      message.channel.send(language.get(currLang, 'noChannelMention'));
      return;
    }

    const channel = channels.first();

    if (channel.type !== 'text') {
      message.channel.send(language.get(currLang, 'notTextChannel'));
      return;
    }

    const perms = channel.permissionsFor(message.client.user);

    if (!perms.has('SEND_MESSAGES') || !perms.has('READ_MESSAGE_HISTORY')) {
      message.channel.send(language.get(currLang, 'noReadSendPerm'));
      return;
    }

    serverCache.setChannel(channelType.WELCOME, message.guild.id, channel.id);
    message.channel.send(
      language.get(currLang, 'welcomeChannelSet', { channel: channel.id })
    );
  }
}
