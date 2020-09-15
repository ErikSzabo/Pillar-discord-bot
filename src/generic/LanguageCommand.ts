import { Message } from 'discord.js';
import { language } from '../language/LanguageManager';
import { checkPermission } from '../utils';
import { Command } from './Command';
import { roleType, serverCache } from './ServerCache';

export class LanguageCommand extends Command {
  constructor() {
    super('language', 'language [new language]');
  }

  execute(args: string[], message: Message): void {
    const serverID = message.guild.id;
    try {
      checkPermission(
        serverCache.getRole(roleType.MODERATION, message.guild.id),
        message.member,
        serverID
      );
    } catch (err) {
      message.channel.send(language.get(serverID, 'noUserPerm'));
      return;
    }

    if (!args[0]) {
      message.channel.send(language.get(serverID, 'notEnoughArguments'));
      return;
    }

    const newLang = args[0].toLowerCase();

    if (!language.has(newLang)) {
      message.channel.send(language.get(serverID, 'invalidLanguage'));
      return;
    }

    serverCache.setLang(serverID, newLang);

    message.channel.send(language.get(serverID, 'languageSet'));
  }
}
