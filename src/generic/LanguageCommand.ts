import { Message } from 'discord.js';
import { IApplication } from '../application';
import { logger } from '../logger';
import { Command } from './Command';

export class LanguageCommand extends Command {
  constructor() {
    super('language', 'language [new language]');
  }

  async execute(app: IApplication, args: string[], message: Message) {
    const serverID = message.guild.id;
    const serverData = app.getServerStore().get(serverID);
    try {
      app.checkPermission(serverData.moderationRole, message.member, serverID);
    } catch (err) {
      message.channel.send(app.message(serverID, 'noUserPerm'));
      return;
    }

    if (!args[0]) {
      message.channel.send(
        app.message(serverID, 'availableLanguages', {
          language: app.getAvailableLocales().join(', '),
        })
      );
      return;
    }

    const newLang = args[0].toLowerCase();

    if (!app.hasLocale(newLang)) {
      message.channel.send(app.message(serverID, 'invalidLanguage'));
      return;
    }

    try {
      await app.getServerStore().update(serverID, { language: newLang });
      message.channel.send(app.message(serverID, 'languageSet'));
    } catch (error) {
      message.channel.send(app.message(serverID, 'botError'));
      logger.error(error.message);
    }
  }
}
