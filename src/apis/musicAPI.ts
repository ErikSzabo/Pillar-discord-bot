import * as ytdl from 'ytdl-core';
import * as ffmpeg from 'ffmpeg-static';
import { EventEmitter } from 'events';
import {
  DMChannel,
  NewsChannel,
  TextChannel,
  Util,
  VoiceChannel,
  VoiceConnection,
} from 'discord.js';

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

class MusicCache {
  private cache: Map<string, ServerMusicData>;

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

  public get(serverID: string): ServerMusicData {
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

/**
 * Api to handle every music type interaction on
 * different servers.
 */
class MusicAPI extends EventEmitter {
  /**
   * Cache for the servers and musics
   */
  private cache: MusicCache;

  constructor(cache: MusicCache) {
    super();
    this.cache = cache;
  }

  /**
   * Shows if a music is playing on the server
   *
   * @param serverID id of the server which will be checked
   */
  public isPlaying(serverID: string): boolean {
    const data = this.cache.get(serverID);
    return data && data.isPlaying;
  }

  /**
   * Returns whether the server has a queue or not.
   *
   * @param serverID id of the server which will be checked
   */
  public hasQueue(serverID: string): boolean {
    const data = this.cache.get(serverID);
    return data && data.songs.length > 0;
  }

  /**
   * Returns whether the server is connected to a voice
   * channel or not.
   *
   * @param serverID id of the server which will be checked
   */
  public isConnected(serverID: string): boolean {
    return (
      this.cache.isCached(serverID) &&
      this.cache.get(serverID).connection != null
    );
  }

  /**
   * Returns the music queue on the server if exists,
   * otherwise returns an empty array.
   *
   * @param serverID id of the server which will be checked
   */
  public getQueue(serverID: string) {
    return this.hasQueue(serverID) ? this.cache.get(serverID).songs : [];
  }

  /**
   * Pauses the currently playing music on the server
   * if possible, otherwise raises an error.
   *
   * @param serverID id of the server which will be checked
   * @returns        the paused song title
   */
  public pause(serverID: string): string {
    if (!this.isPlaying(serverID)) throw new Error('nothingToPause');
    const musicData = this.cache.get(serverID);
    musicData.isPlaying = false;
    musicData.connection.dispatcher.pause();
    return musicData.songs[0].title;
  }

  /**
   * Resumes the music playing on the server, if it is paused.
   * Otherwise raises an error
   *
   * @param serverID id of the server which will be checked
   * @returns        the resumed song title
   */
  public resume(serverID: string): string {
    if (this.isPlaying(serverID)) throw new Error('alreadyPlaying');
    const musicData = this.cache.get(serverID);
    musicData.isPlaying = true;
    musicData.connection.dispatcher.resume();
    return musicData.songs[0].title;
  }

  /**
   * Skips the currently playing music if there is one.
   * Otherwise Raises an error.
   *
   * @param serverID id of the server which will be checked
   * @returns        the skipped music title
   */
  public skip(serverID: string) {
    if (!this.hasQueue(serverID)) throw new Error('noMusicToSkip');
    const musicData = this.cache.get(serverID);
    const song = musicData.songs[0].title;
    musicData.connection.dispatcher.end();
    return song;
  }

  /**
   * Stops the currently playing music, and empties the songs
   * cache for the server.
   *
   * @param serverID id of the server which will be checked
   */
  public stop(serverID: string) {
    if (!this.hasQueue(serverID)) throw new Error('noMusicToStop');
    const musicData = this.cache.get(serverID);
    musicData.songs = [];
    musicData.connection.dispatcher.end();
  }

  /**
   * Sets the volume for the server if possible.
   * If the new volume can't be parsed or the server isn't in the
   * cache, raieses an error.
   *
   * @param serverID id of the server which will be checked
   * @param volume   new volume that will be parsed to an integer
   */
  public volume(serverID: string, volume: any) {
    if (!this.cache.isCached(serverID)) throw new Error('cantChangeVolume');
    volume = parseInt(volume);
    if (isNaN(volume)) throw new Error('notNumberVolume');
    const musicData = this.cache.get(serverID);
    musicData.volume = volume;
    musicData.connection.dispatcher.setVolumeLogarithmic(volume / 5);
    return volume;
  }

  /**
   * Return the volume of the server of null if the server
   * is not cached.
   *
   * @param serverID id of the server which will be checked
   */
  public getVolume(serverID: string) {
    return this.cache.isCached(serverID)
      ? this.cache.get(serverID).volume
      : null;
  }

  /**
   * Connects the bot to the voice channel.
   * Raises an error if the connection fails.
   *
   * @param serverID     id of the server which will be checked
   * @param voiceChannel voice channel to connect to
   */
  public async connect(serverID: string, voiceChannel: VoiceChannel) {
    try {
      if (!this.cache.isCached(serverID))
        this.cache.add(serverID, this.createCacheConstruct(voiceChannel));
      const musicData = this.cache.get(serverID);
      musicData.connection = await voiceChannel.join();
      musicData.connection.on('disconnect', () => this.cache.remove(serverID));
    } catch (err) {
      this.cache.remove(serverID);
      throw new Error('cantJoinVoice');
    }
  }

  /**
   * Queues a song for the server if the server
   * exists in the cache, otherwise raise an error.
   *
   * @param serverID id of the server which will be checked
   * @param song     song to queue
   */
  public queue(serverID: string, song: SongData) {
    if (!this.cache.isCached(serverID))
      throw new Error('CantQueueMissingCache');
    this.cache.get(serverID).songs.push(song);
  }

  /**
   * Starts playing the music. Caching and voice channel
   * connection required, otherwise an error will be thrown.
   *
   * @param serverID id of the server which will be checked
   */
  public startPlaying(serverID: string) {
    if (!this.cache.isCached(serverID)) throw new Error('CantPlayMissingCache');
    const musicData = this.cache.get(serverID);
    if (!musicData.connection) throw new Error('CantPlayNoConnection');
    this.continousPlay(serverID);
  }

  /**
   * Returns true if the provided url is a valid
   * youtube url.
   *
   * @param url youtube url to be checked
   */
  public validateYoutubeUrl(url: string) {
    return ytdl.validateURL(url);
  }

  /**
   * Returns the title and the url of the provided video.
   *
   * @param url youtube url to get the info from
   */
  public async getVideoDetails(url: string) {
    const info = await ytdl.getInfo(url);
    return {
      title: Util.escapeMarkdown(info.videoDetails.title),
      url: info.videoDetails.video_url,
    };
  }

  private continousPlay(serverID: string) {
    const musicData = this.cache.get(serverID);
    if (musicData.songs.length == 0)
      return musicData.voiceChannel.client.voice.connections
        .get(serverID)
        .channel.leave();

    try {
      const handler = () => {
        musicData.songs.shift();
        this.continousPlay(serverID);
      };
      const song = musicData.songs[0];
      let dispatcher = musicData.connection
        .play(ytdl(song.url, { filter: 'audioonly', quality: 'highestaudio' }))
        .on('finish', handler)
        .on('error', handler);

      this.emit('new-song-playing', serverID, song);
      musicData.isPlaying = true;
      dispatcher.setVolumeLogarithmic(musicData.volume / 5);
    } catch (err) {
      musicData.songs.shift();
      this.continousPlay(serverID);
    }
  }

  private createCacheConstruct(voiceChannel: VoiceChannel): ServerMusicData {
    return {
      voiceChannel,
      songs: [],
      connection: null,
      volume: 2,
      isPlaying: false,
    };
  }
}

export const musicAPI = new MusicAPI(new MusicCache());
