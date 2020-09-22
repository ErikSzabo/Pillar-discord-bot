import { Message } from 'discord.js';
import { serverRepository } from '../database/ServerRepository';
import { language } from '../language/LanguageManager';
import { checkPermission } from '../utils';
import { Command } from './Command';
import { serverCache } from './ServerCache';

export class LanguageCommand extends Command {
  constructor() {
    super('language', 'language [new language]');
  }

  async execute(args: string[], message: Message) {
    const serverID = message.guild.id;
    const serverData = serverCache.get(serverID);
    try {
      checkPermission(serverData.moderationRole, message.member, serverID);
    } catch (err) {
      message.channel.send(language.get(serverID, 'noUserPerm'));
      return;
    }

    if (!args[0]) {
      message.channel.send(
        language.get(serverID, 'availableLanguages', {
          language: language.getAvailableLocales().join(', '),
        })
      );
      return;
    }

    const newLang = args[0].toLowerCase();

    if (!language.has(newLang)) {
      message.channel.send(language.get(serverID, 'invalidLanguage'));
      return;
    }

    try {
      await serverRepository.update(serverID, { language: newLang });
      serverCache.set(serverID, { language: newLang });
      message.channel.send(language.get(serverID, 'languageSet'));
    } catch (error) {
      message.channel.send(language.get(serverID, 'botError'));
      console.error(error);
    }
  }
}
