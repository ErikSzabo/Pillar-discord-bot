import { serverInfo } from '../database';

/**
 * Interface to define server information.
 */
export interface ServerInfo {
  serverID: string;
  musicChannel: string;
  moderationRole: string;
  pollRole: string;
  welcomeChannel: string;
  welcomeMessage: string;
  leaveMessage: string;
  language: string;
}

/**
 * Enum which used to determine what type of should be set.
 */
export enum messageType {
  LEAVE = 'leaveMessage',
  WELCOME = 'welcomeMessage',
}

/**
 * Enum which used to determine what type of role should be set.
 */
export enum roleType {
  MODERATION = 'moderationRole',
  POLL = 'pollRole',
}

/**
 * Enum which used to determine what type of channel should be set.
 */
export enum channelType {
  MUSIC = 'musicChannel',
  WELCOME = 'welcomeChannel',
}

/**
 * Class to cache the server information from the database.
 * It's also saves data into the database.
 */
class ServerCache {
  /**
   * Cache Map which will hold all of the servers' information.
   * It's indexed with the server IDs.
   */
  private cache: Map<string, ServerInfo>;

  /**
   * Default constructor to initialize the cache map.
   */
  constructor() {
    this.cache = new Map<string, ServerInfo>();
  }

  /**
   * @param serverID id of the server
   * @returns if a server is cached or not
   */
  public isCached(serverID: string): boolean {
    return this.cache.has(serverID);
  }

  /**
   * Saves the starter information about the server into the cache and the database.
   *
   * @param serverID id of the server
   */
  public async saveToCache(serverID: string): Promise<void> {
    const server: ServerInfo = await serverInfo.findOne({ serverID });
    if (server) {
      this.cache.set(serverID, server);
      return;
    }
    const construct = this.createCacheConstruct(serverID);
    this.cache.set(serverID, construct);
    await serverInfo.insert(construct);
  }

  /**
   * Sets a message in the cache and in the databse.
   * This message can be a 'welcome' or a 'leave' message for example.
   *
   * @param type      type of the messgae
   * @param serverID  id of the server where the changes will be made
   * @param message   the new message which will be saved
   */
  public setMessage(
    type: messageType,
    serverID: string,
    message: string
  ): void {
    this.cache.get(serverID)[type] = message;
    serverInfo
      .findOneAndUpdate({ serverID }, { $set: { [type]: message } })
      .catch((err) => console.log(err));
  }

  /**
   * Sets a channel for a specific task in the cache and in the databse.
   * For example, a 'music' channel for the server can be set through this method.
   *
   * @param type      type of the channel
   * @param serverID  id of the server where the changes will be made
   * @param channel   the new channel which will be saved
   */
  public setChannel(
    type: channelType,
    serverID: string,
    channel: string
  ): void {
    this.cache.get(serverID)[type] = channel;
    serverInfo
      .findOneAndUpdate({ serverID }, { $set: { [type]: channel } })
      .catch((err) => console.log(err));
  }

  /**
   * Sets a role for specific tasks in the cache and in the databse.
   * For example, the moderation role can be set through this method.
   *
   * @param type      type of the role
   * @param serverID  id of the server where the changes will be made
   * @param role      the new role which will be saved
   */
  public setRole(type: roleType, serverID: string, role: string): void {
    this.cache.get(serverID)[type] = role;
    serverInfo
      .findOneAndUpdate({ serverID }, { $set: { [type]: role } })
      .catch((err) => console.log(err));
  }

  /**
   * @param type      type of the message, like 'welcome'
   * @param serverID  id of the requested server
   * @returns         the message id associated with the type and the server
   */
  public getMessage(type: messageType, serverID: string): string {
    return this.cache.get(serverID)[type];
  }

  /**
   * @param type      type of the role, like 'mod'
   * @param serverID  id of the requested server
   * @returns         the role id associated with the type and the server
   */
  public getRole(type: roleType, serverID: string): string {
    return this.cache.get(serverID)[type];
  }

  /**
   * @param type      type of the channel, like 'music'
   * @param serverID  id of the requested server
   * @returns         the channel id associated with the type and the server
   */
  public getChannel(type: channelType, serverID: string): string {
    return this.cache.get(serverID)[type];
  }

  /**
   * @param serverID id of the requested server
   * @returns        the preferred langauge on the server
   */
  public getLang(serverID: string): string {
    return this.cache.get(serverID).language;
  }

  /**
   * Sets the preferred language for a server in the
   * cache and in the database.
   *
   * @param serverID id of the requested server
   * @param langauge new preferred langauge on the server
   */
  public setLang(serverID: string, language: string): void {
    this.cache.get(serverID).language = language;
    serverInfo
      .findOneAndUpdate({ serverID }, { $set: { language } })
      .catch((err) => console.log(err));
  }

  /**
   * Deletes a server from the cache and from the database.
   *
   * @param serverID id of the requested server
   */
  public fullRemove(serverID: string): void {
    this.cache.delete(serverID);
    serverInfo.findOneAndDelete({ serverID }).catch((err) => console.log(err));
  }

  /**
   * Loads the servers from the database into the cache.
   */
  public async loadCache(): Promise<void> {
    const servers = await serverInfo.find({});
    servers.forEach((server) => {
      this.cache.set(server.serverID, server);
    });
  }

  /**
   * Helper method to create a saveable construct.
   *
   * @param serverID id of the server
   */
  private createCacheConstruct(serverID: string): ServerInfo {
    return {
      serverID: serverID,
      musicChannel: 'off',
      moderationRole: 'off',
      pollRole: 'off',
      welcomeChannel: 'off',
      welcomeMessage: '[USER] joined the server!',
      leaveMessage: '[USER] leaved the server!',
      language: 'en',
    };
  }
}

export const serverCache = new ServerCache();
