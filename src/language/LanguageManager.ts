import * as fs from 'fs';
import * as path from 'path';
import { MessageEmbed } from 'discord.js';
import { createEmbed } from '../utils';

interface loadedLanguages {
  languages: Map<string, Map<string, LanguageProp>>;
  commands: Map<string, Map<string, string>>;
}

interface LanguageProp {
  title: string;
  description: string;
  error: boolean;
}

type placeHolderProp =
  | 'prefix'
  | 'roleType'
  | 'role'
  | 'message'
  | 'channel'
  | 'reminder'
  | 'mention'
  | 'date'
  | 'song'
  | 'volume'
  | 'songs'
  | 'language'
  | 'description'
  | 'timezone'
  | 'poll';

export interface Placeholder {
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
  language?: string;
  description?: string;
  timezone?: string;
  poll?: string;
}

export class LanguageManager {
  private languages: Map<string, Map<string, LanguageProp>>;
  private commands: Map<string, Map<string, string>>;

  constructor() {
    const { languages, commands } = this.loadLangFilesSync();
    this.languages = languages;
    this.commands = commands;
  }

  public get(
    locale: string,
    prop: string,
    options?: Placeholder
  ): MessageEmbed {
    let message = this.languages.get(locale).get(prop);
    if (!message) message = this.languages.get('en').get(prop);
    const description = this.handlePlaceholders(message.description, options);
    const title = this.handlePlaceholders(message.title, options);
    return createEmbed(title, description, message.error);
  }

  public getCommandDescription(locale: string, commandName: string): string {
    let cmdDescription = this.commands.get(locale).get(commandName);
    if (!cmdDescription)
      cmdDescription = this.commands.get('en').get(commandName);
    return cmdDescription;
  }

  public has(locale: string): boolean {
    return this.languages.has(locale);
  }

  public async reload() {
    const { languages, commands } = await this.loadLangFiles();
    this.languages = languages;
    this.commands = commands;
  }

  public getAvailableLocales(): string[] {
    return Array.from(this.languages.keys());
  }

  private loadLangFilesSync(): loadedLanguages {
    const languages = new Map<string, Map<string, LanguageProp>>();
    const commands = new Map<string, Map<string, string>>();

    const fileNames = fs.readdirSync(
      path.resolve(__dirname + '/../../language-files')
    );
    for (let fileName of fileNames) {
      const language = JSON.parse(
        fs
          .readFileSync(
            path.resolve(__dirname + `/../../language-files/${fileName}`)
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
      languages.set(langLocale, langMap);
      commands.set(langLocale, commandMap);
    }
    return { languages, commands };
  }

  private loadLangFiles(): Promise<loadedLanguages> {
    return new Promise((resolve, reject) => {
      resolve(this.loadLangFilesSync());
    });
  }

  private handlePlaceholders(text: string, options: Placeholder): string {
    if (!options) return text;
    Object.keys(options).forEach((prop: placeHolderProp) => {
      text = text.replace(
        new RegExp(`\\[${prop.toUpperCase()}\\]`, 'g'),
        String(options[prop])
      );
    });
    return text;
  }
}
