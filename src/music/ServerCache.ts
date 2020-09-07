import { VoiceChannel, VoiceConnection } from 'discord.js';

export interface SongData {
  title: string;
  url: string;
}

export interface ServerData {
  voiceChannel: VoiceChannel;
  songs: Array<SongData>;
  volume: number;
  connection: null | VoiceConnection;
  isPlaying: boolean;
}

/**
 * Caches information about the servers.
 */
export class ServerCache {
  private static singleton: ServerCache;
  /**
   * Map to hold the information about the servers.
   */
  private servers: Map<string, ServerData>;

  /**
   * Private constructor to initalize one singleton instance.
   */
  private constructor() {
    this.servers = new Map<string, ServerData>();
  }

  /**
   * Returns the ServerCahce. This will be the same everywhere, because the same instance
   * will be returned every time.
   *
   * @returns the server cache.
   */
  public static getInstance(): ServerCache {
    if (this.singleton) return this.singleton;
    this.singleton = new this();
    return this.singleton;
  }

  /**
   * Shows whether the server is already cached or not.
   *
   * @param guildID id of the guild/server
   */
  public isCached(guildID: string): boolean {
    return this.servers.has(guildID);
  }

  /**
   * @param guildID id of the guild/server
   * @returns       cached data from the server
   */
  public getServerData(guildID: string): ServerData {
    return this.servers.get(guildID);
  }

  /**
   * Adds a server to the cache if it's not already in it.
   *
   * @param guildID     id of the guild/server
   * @param serverData  server data about the bot state
   */
  public addToCache(guildID: string, serverData: ServerData): void {
    if (this.isCached(guildID)) return;
    this.servers.set(guildID, serverData);
  }

  /**
   * Removes a server from the cache.
   *
   * @param guildID id of the guild/server
   */
  public remove(guildID: string): void {
    this.servers.delete(guildID);
  }
}
