import { VoiceChannel, VoiceConnection } from 'discord.js';

export interface SongData {
  title: string;
  url: string;
}

export interface ServerMusicData {
  voiceChannel: VoiceChannel;
  songs: Array<SongData>;
  volume: number;
  connection: null | VoiceConnection;
  isPlaying: boolean;
}

/**
 * Caches music information about the servers.
 */
class MusicCache {
  /**
   * Map to hold the information about the servers.
   */
  private cache: Map<string, ServerMusicData>;

  /**
   * Private constructor to initalize one singleton instance.
   */
  constructor() {
    this.cache = new Map<string, ServerMusicData>();
  }

  /**
   * Shows whether the server is already cached or not.
   *
   * @param guildID id of the guild/server
   */
  public isCached(guildID: string): boolean {
    return this.cache.has(guildID);
  }

  /**
   * @param guildID id of the guild/server
   * @returns       cached data from the server
   */
  public getServerData(guildID: string): ServerMusicData {
    return this.cache.get(guildID);
  }

  /**
   * Adds a server to the cache if it's not already in it.
   *
   * @param guildID     id of the guild/server
   * @param serverData  server data about the bot state
   */
  public addToCache(guildID: string, serverData: ServerMusicData): void {
    if (this.isCached(guildID)) return;
    this.cache.set(guildID, serverData);
  }

  /**
   * Removes a server from the cache.
   *
   * @param guildID id of the guild/server
   */
  public remove(guildID: string): void {
    this.cache.delete(guildID);
  }
}

export const musicCache = new MusicCache();
