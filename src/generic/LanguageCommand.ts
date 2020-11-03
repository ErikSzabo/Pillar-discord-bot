import { Message } from 'discord.js';
import { IApplication } from '../application';
import { logger } from '../logger';
import { Command } from './Command';

export class LanguageCommand extends Command {
  constructor(app: IApplication) {
    super('language', 'language [new language]', app);
  }

  async execute(args: string[], message: Message) {
    const serverID = message.guild.id;

    if (!this.app.isModerator(serverID, message.member)) {
      message.channel.send(this.app.message(serverID, 'noUserPerm'));
      return;
    }

    if (!args[0]) {
      message.channel.send(
        this.app.message(serverID, 'availableLanguages', {
          language: this.app.getAvailableLocales().join(', '),
        })
      );
      return;
    }

    const newLang = args[0].toLowerCase();

    if (!this.app.hasLocale(newLang)) {
      message.channel.send(this.app.message(serverID, 'invalidLanguage'));
      return;
    }

    try {
      await this.app.getServerStore().update(serverID, { language: newLang });
      message.channel.send(this.app.message(serverID, 'languageSet'));
    } catch (error) {
      message.channel.send(this.app.message(serverID, 'botError'));
      logger.error(error.message);
    }
  }
}
