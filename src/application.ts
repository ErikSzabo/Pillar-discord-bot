import {
  Client,
  Guild,
  GuildMember,
  Intents,
  Message,
  MessageEmbed,
} from 'discord.js';
import { Timezone, Timezones } from './apis/timezoneAPI';
import { config, Config } from './config';
import { DataStore } from './database/DataStore';
import { CustomError } from './generic/CustomError';
import { ICommandManager } from './generic/ICommandManager';
import { ServerInfo } from './generic/ServerInfo';
import { LanguageManager, Placeholder } from './language/LanguageManager';
import { logger } from './logger';
import { Reminder } from './reminder/Reminder';
import { ServerScheduler } from './scheduler';

/**
 * Main application that controlls the bot.
 */
export interface IApplication {
  /**
   * Returns the discord client.
   */
  getClient(): Client;
  /**
   * Returns the bot config.
   */
  getConfig(): Config;
  /**
   * Returns the server store.
   */
  getServerStore(): DataStore<ServerInfo>;
  /**
   * Return the reminder store.
   */
  getReminderStore(): DataStore<Reminder>;
  /**
   * Returns the available locales.
   */
  getAvailableLocales(): string[];
  /**
   * Returns if the locale is available or not.
   *
   * @param locale locale to check
   */
  hasLocale(locale: string): boolean;
  /**
   * Returns a description for a command.
   *
   * @param serverID
   * @param commandName
   */
  getCommandDescription(serverID: string, commandName: string): string;
  /**
   * Returns the application scheduler.
   */
  getScheduler(): ServerScheduler;
  /**
   * Return a message embed from the language manager.
   *
   * @param serverID server id to check the language
   * @param prop     message indentifier string
   * @param options  placeholder options
   */
  message(serverID: string, prop: string, options?: Placeholder): MessageEmbed;
  /**
   * Checks if the member has the role or not. Throws error if not.
   *
   * @param role      role to check
   * @param member    guild member
   * @param serverID  server to check te role on
   */
  checkPermission(role: string, member: GuildMember, serverID: string): void;
}

export class Application implements IApplication {
  protected client: Client;
  protected config: Config;
  protected languageManager: LanguageManager;
  protected serverStore: DataStore<ServerInfo>;
  protected reminderStore: DataStore<Reminder>;
  protected commandManager: ICommandManager;
  protected scheduler: ServerScheduler;

  constructor(
    languageManager: LanguageManager,
    serverStore: DataStore<ServerInfo>,
    reminderStore: DataStore<Reminder>,
    commandManager: ICommandManager
  ) {
    this.client = new Client();
    this.config = config;
    this.languageManager = languageManager;
    this.serverStore = serverStore;
    this.reminderStore = reminderStore;
    this.commandManager = commandManager;
    this.scheduler = new ServerScheduler();
  }

  public getClient() {
    return this.client;
  }

  public getConfig() {
    return this.config;
  }

  public getServerStore() {
    return this.serverStore;
  }

  public getReminderStore() {
    return this.reminderStore;
  }

  public getAvailableLocales() {
    return this.languageManager.getAvailableLocales();
  }

  public hasLocale(locale: string) {
    return this.languageManager.has(locale);
  }

  public getCommandDescription(locale: string, commandName: string) {
    return this.languageManager.getCommandDescription(locale, commandName);
  }

  public getScheduler() {
    return this.scheduler;
  }

  public message(
    serverID: string,
    prop: string,
    options?: Placeholder
  ): MessageEmbed {
    const locale = this.serverStore.get(serverID).language;
    return this.languageManager.get(locale, prop, options);
  }

  public checkPermission(
    roleToCheck: string,
    member: GuildMember,
    serverID: string
  ): void {
    if (member.permissions.has('ADMINISTRATOR')) return;
    if (roleToCheck !== 'off' && !member.roles.cache.has(roleToCheck)) {
      throw new CustomError(this.languageManager.get(serverID, 'noUserPerm'));
    }
  }

  public start(token: string) {
    this.subscribeToEvents();
    this.client.login(token);
  }

  private onMessage = (message: Message) => {
    if (message.author.bot) return;
    if (message.content.startsWith(this.config.prefix)) {
      const [command, ...args] = message.content
        .trim()
        .substring(this.config.prefix.length)
        .split(/\s+/);

      if (message.author.id === this.config.operator) {
        if (command === 'reload') {
          return this.languageManager
            .reload()
            .then(() => {
              message.channel.send('Language files reloaded');
              logger.info(
                `Language files reloaded by: ${message.author.username} with the id of: ${message.author.id}`
              );
            })
            .catch(() =>
              message.channel.send('Error while reloading language files.')
            );
        }
      }

      this.commandManager.handle(this, command, args, message);
    }
  };

  private onReady = async () => {
    this.client.user.setActivity({
      type: this.config.beta ? 'PLAYING' : 'LISTENING',
      name: this.config.beta
        ? `${this.config.prefix}Open Beta`
        : `${this.config.prefix}help`,
    });

    try {
      await this.serverStore.loadToCache();
      await this.reminderStore.loadToCache();
      for (let reminder of this.reminderStore.getAll()) {
        const channel = await this.client.channels.fetch(reminder.channel);
        const zone = this.serverStore.get(reminder.serverID).timezone;
        const date = Timezones.UTC.convert(reminder.date, Timezones[zone]);
        if (date.getTime() < Date.now()) {
          this.reminderStore.delete(reminder.serverID, {
            title: reminder.title,
          });
          continue;
        }
        this.scheduler.scheduleReminder(this, reminder, channel);
      }

      this.checkAndLoadDowntimeInvites();

      console.log("I'm ready!");
      logger.info('Bot started successfully!');
    } catch (error) {
      logger.error(error.message);
    }
  };

  private onGuildCreate = async ({ id, name }: Guild) => {
    try {
      await this.serverStore.add(id, this.createServerConstruct(id));
      logger.info(`Joined to ${name} id: ${id}`);
    } catch (error) {
      logger.error(error.message);
    }
  };

  private onGuildDelete = async ({ id, name }: Guild) => {
    try {
      await this.serverStore.delete(id);
      logger.info(`Leaved from ${name} id: ${id}`);
    } catch (error) {
      logger.error(error.message);
    }
  };

  private onGuildMemberAdd = (member: GuildMember) => {
    this.handleWelcomeLeaveMessage('welcomeMessage', member);
  };

  private onGuildMemberRemove = (member: GuildMember) => {
    this.handleWelcomeLeaveMessage('leaveMessage', member);
  };

  private checkAndLoadDowntimeInvites = () => {
    this.client.guilds.cache.forEach(async (guild) => {
      const id = guild.id;
      try {
        if (!this.serverStore.isCached(id))
          await this.serverStore.add(id, this.createServerConstruct(id));
      } catch (error) {
        logger.error(error.message);
      }
    });
  };

  private handleWelcomeLeaveMessage(
    messageType: 'leaveMessage' | 'welcomeMessage',
    member: GuildMember
  ): void {
    const serverData = this.serverStore.get(member.guild.id);
    const welcomeChannel = serverData.welcomeChannel;
    const message = serverData[messageType];

    if (welcomeChannel === 'off' || message === 'off') return;

    const realChannel = member.guild.channels.cache.get(welcomeChannel);
    if (realChannel.type !== 'text') return;
    // @ts-ignore
    realChannel.send(message.replace('[USER]', `<@${member.id}>`));
  }

  private subscribeToEvents() {
    this.client.once('ready', this.onReady);
    this.client.on('guildCreate', this.onGuildCreate);
    this.client.on('guildDelete', this.onGuildDelete);
    this.client.on('guildMemberAdd', this.onGuildMemberAdd);
    this.client.on('guildMemberRemove', this.onGuildMemberRemove);
    this.client.on('message', this.onMessage);
  }

  private createServerConstruct(serverID: string): ServerInfo {
    return {
      serverID: serverID,
      musicChannel: 'off',
      moderationRole: 'off',
      pollRole: 'off',
      welcomeChannel: 'off',
      welcomeMessage: '[USER] joined the server!',
      leaveMessage: '[USER] leaved the server!',
      language: 'en',
      timezone: 'UTC',
    };
  }
}
