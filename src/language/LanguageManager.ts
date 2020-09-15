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
  private readonly commands: Map<string, Map<string, string>>;

  constructor() {
    this.languages = new Map<string, Map<string, LanguageProp>>();
    this.commands = new Map<string, Map<string, string>>();
    this.loadLangFiles();
  }

  public get(
    localization: string,
    prop: string,
    options?: PlaceholderOptions
  ): MessageEmbed {
    let message = this.languages.get(localization).get(prop);
    if (!message) message = this.languages.get('en').get(prop);
    message.description = this.handlePlaceholders(message.description, options);
    return createEmbed(message.title, message.description, message.error);
  }

  public getCommandDescription(
    localization: string,
    commandName: string
  ): string {
    let cmdDescription = this.commands.get(localization).get(commandName);
    if (!cmdDescription)
      cmdDescription = this.commands.get('en').get(commandName);
    return cmdDescription;
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
      const commandMap = new Map<string, string>();
      for (let prop in language.messages) {
        langMap.set(prop, language.messages[prop]);
      }
      for (let prop in language.commands) {
        commandMap.set(prop, language.commands[prop]);
      }
      const langLocale = fileName.substring(0, 2);
      this.languages.set(langLocale, langMap);
      this.commands.set(langLocale, commandMap);
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