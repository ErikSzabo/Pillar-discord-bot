import * as fs from 'fs';
import * as path from 'path';
import { MessageEmbed } from 'discord.js';
import { createEmbed } from '../utils';

interface LanguageProp {
  title: string;
  description: string;
  error: boolean;
}

interface PlaceholderOptions {
  prefix?: string;
  roleType?: string;
  role?: string;
  message?: string;
  channel?: string;
  reminder?: string;
  mention?: string;
  date?: string;
  song?: string;
  volume?: number;
  songs?: string;
}

class LanguageManager {
  private readonly languages: Map<string, Map<string, LanguageProp>>;

  constructor() {
    this.languages = new Map<string, Map<string, LanguageProp>>();
    this.loadLangFiles();
  }

  public get(
    localization: string,
    prop: string,
    options?: PlaceholderOptions
  ): MessageEmbed {
    const message = this.languages.get(localization).get(prop);
    message.description = this.handlePlaceholders(message.description, options);
    return createEmbed(message.title, message.description, message.error);
  }

  public has(locale: string): boolean {
    return this.languages.has(locale);
  }

  public reload(): void {
    this.loadLangFiles();
  }

  private loadLangFiles(): void {
    const fileNames = fs.readdirSync(
      path.resolve(__dirname + '/../language-files')
    );
    for (let fileName of fileNames) {
      const language = JSON.parse(
        fs
          .readFileSync(
            path.resolve(__dirname + `/../language-files/${fileName}`)
          )
          .toString()
      );
      const langMap = new Map<string, LanguageProp>();
      for (let prop in language) {
        langMap.set(prop, language[prop]);
      }
      const langLocale = fileName.substring(0, 2);
      this.languages.set(langLocale, langMap);
    }
  }

  private handlePlaceholders(
    description: string,
    options: PlaceholderOptions
  ): string {
    if (!options) return description;

    if (options.channel)
      description = description.replace(/\[CHANNEL\]/g, options.channel);

    if (options.date)
      description = description.replace(/\[DATE\]/g, options.date);

    if (options.mention)
      description = description.replace(/\[MENTION\]/g, options.mention);

    if (options.message)
      description = description.replace(/\[MESSAGE\]/g, options.message);

    if (options.prefix)
      description = description.replace(/\[PREFIX\]/g, options.prefix);

    if (options.reminder)
      description = description.replace(/\[REMINDER\]/g, options.reminder);

    if (options.role)
      description = description.replace(/\[ROLE\]/g, options.role);

    if (options.roleType)
      description = description.replace(/\[ROLETYPE\]/g, options.roleType);

    if (options.song)
      description = description.replace(/\[SONG\]/g, options.song);

    if (options.songs)
      description = description.replace(/\[SONGS\]/g, options.songs);

    if (options.volume)
      description = description.replace(/\[VOLUME\]/g, String(options.volume));

    return description;
  }
}

export const language = new LanguageManager();
