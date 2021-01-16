import { IRepository } from './IRepository';
import { ICache } from './ICache';
import { ServerInfo } from '../generic/ServerInfo';

/**
 * Class to cache the server information from the database.
 * It's also saves data into the database.
 */
export class ServerCache implements ICache<ServerInfo> {
  public static maxServers: number = 20;

  /**
   * Cache Map which will hold all of the servers' information.
   * It's indexed with the server IDs.
   */
  private cache: Map<string, ServerInfo>;

  constructor() {
    this.cache = new Map<string, ServerInfo>();
  }

  public isCached(serverID: string): boolean {
    return this.cache.has(serverID);
  }

  public add(serverID: string, data: ServerInfo): void {
    this.cache.set(serverID, data);
  }

  public remove(serverID: string): void {
    this.cache.delete(serverID);
  }

  public get(serverID: string): ServerInfo {
    return this.cache.get(serverID);
  }

  public getAll(): ServerInfo[] {
    return Array.from(this.cache.values());
  }

  public set(serverID: string, data: Partial<ServerInfo>): ServerInfo {
    const newServerInfo = { ...this.cache.get(serverID), ...data };
    this.cache.set(serverID, newServerInfo);
    return newServerInfo;
  }

  public async loadFromRepository(dataStore: IRepository<ServerInfo>) {
    const servers = await dataStore.findAll();
    servers.forEach((server) => {
      this.cache.set(server.serverID, server);
    });
  }

  public canJoin(): boolean {
    return Array.from(this.cache.keys()).length < ServerCache.maxServers;
  }
}
