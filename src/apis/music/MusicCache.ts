import {
  DMChannel,
  NewsChannel,
  TextChannel,
  VoiceChannel,
  VoiceConnection,
} from 'discord.js';
import { ICache } from '../interfaces/ICache';

export interface SongData {
  title: string;
  url: string;
  channel: TextChannel | NewsChannel | DMChannel;
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
export class MusicCache implements ICache<ServerMusicData> {
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

  public isCached(guildID: string): boolean {
    return this.cache.has(guildID);
  }

  public add(serverID: string, data: ServerMusicData): void {
    if (this.isCached(serverID)) return;
    this.cache.set(serverID, data);
  }

  public get(serverID: string) {
    return this.cache.get(serverID);
  }

  public set(
    serverID: string,
    data: Partial<ServerMusicData>
  ): ServerMusicData {
    const newData = { ...this.cache.get(serverID), ...data };
    this.cache.set(serverID, newData);
    return newData;
  }

  public remove(serverID: string, data?: Partial<ServerMusicData>): void {
    this.cache.delete(serverID);
  }
}
