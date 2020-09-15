import { Message } from 'discord.js';
import { language } from '../language/LanguageManager';
import { checkPermission } from '../utils';
import { Command } from './Command';
import { roleType, serverCache } from './ServerCache';

export class LanguageCommand extends Command {
  constructor() {
    super(
      'language',
      'language [new language]',
      'sets the new language for your server'
    );
  }

  execute(args: string[], message: Message): void {
    const currLang = serverCache.getLang(message.guild.id);

    try {
      checkPermission(
        serverCache.getRole(roleType.MODERATION, message.guild.id),
        message.member
      );
    } catch (err) {
      message.channel.send(language.get(currLang, 'noUserPerm'));
      return;
    }

    if (!args[0]) {
      message.channel.send(language.get(currLang, 'notEnoughArguments'));
      return;
    }

    const newLang = args[0].toLowerCase();

    if (!language.has(newLang)) {
      message.channel.send(language.get(currLang, 'invalidLanguage'));
      return;
    }

    serverCache.setLang(message.guild.id, newLang);

    message.channel.send(language.get(newLang, 'languageSet'));
  }
}
