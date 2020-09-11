import { serverInfo } from '../database';

export interface ServerInfo {
  serverID: string;
  musicChannel: string;
  moderationRole: string;
  pollRole: string;
  watchTogetherRole: string;
  welcomeChannel: string;
  welcomeMessage: string;
  leaveMessage: string;
}

export enum messageType {
  LEAVE = 'leaveMessage',
  WELCOME = 'welcomeMessage',
}

export enum roleType {
  MODERATION = 'moderationRole',
  POLL = 'pollRole',
  WATCH = 'watchTogetherRole',
}

export enum channelType {
  MUSIC = 'musicChannel',
  WELCOME = 'welcomeChannel',
}

class ServerCache {
  private cache: Map<string, ServerInfo>;

  constructor() {
    this.cache = new Map<string, ServerInfo>();
  }

  public isCached(serverID: string): boolean {
    return this.cache.has(serverID);
  }

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

  public setRole(type: roleType, serverID: string, role: string): void {
    this.cache.get(serverID)[type] = role;
    serverInfo
      .findOneAndUpdate({ serverID }, { $set: { [type]: role } })
      .catch((err) => console.log(err));
  }

  public getMessage(type: messageType, serverID: string): string {
    return this.cache.get(serverID)[type];
  }

  public getRole(type: roleType, serverID: string): string {
    return this.cache.get(serverID)[type];
  }

  public getChannel(type: channelType, serverID: string): string {
    return this.cache.get(serverID)[type];
  }

  public fullRemove(serverID: string): void {
    this.cache.delete(serverID);
    serverInfo.findOneAndDelete({ serverID }).catch((err) => console.log(err));
  }

  public async loadCache(): Promise<void> {
    const servers = await serverInfo.find({});
    servers.forEach((server) => {
      this.cache.set(server.serverID, server);
    });
  }

  private createCacheConstruct(serverID: string): ServerInfo {
    return {
      serverID: serverID,
      musicChannel: 'off',
      moderationRole: 'off',
      pollRole: 'off',
      watchTogetherRole: 'off',
      welcomeChannel: 'off',
      welcomeMessage: '[USER] joined the server!',
      leaveMessage: '[USER] leaved the server!',
    };
  }
}

export const generalServerCache = new ServerCache();
