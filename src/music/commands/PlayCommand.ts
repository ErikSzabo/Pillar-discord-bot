import * as ytsr from 'ytsr';
import * as ytdl from 'ytdl-core';
import * as ffmpeg from 'ffmpeg-static';
import { Message, Permissions, VoiceChannel, Util } from 'discord.js';
import { Command } from '../../generic/Command';
import { ServerCache, ServerData, SongData } from '../ServerCache';
import { createEmbed } from '../../utils';

export class PlayCommand extends Command {
  constructor() {
    super('play', 'plays a music by link or name');
  }

  public async execute(args: Array<string>, message: Message): Promise<void> {
    const voiceChannel = message.member.voice.channel;
    const permissions = voiceChannel
      ? voiceChannel.permissionsFor(message.client.user)
      : null;
    const serverID = message.guild.id;
    const serverCache = ServerCache.getInstance();

    try {
      this.checkErrors(voiceChannel, permissions, args);
    } catch (error) {
      message.channel.send(createEmbed('Oops', error.message, true));
      return;
    }

    if (serverCache.isCached(serverID)) {
      const song = await this.getSong(args.join(' '));
      if (!song) {
        await message.channel.send(
          createEmbed(
            '🤷‍♂️ Not found!',
            `We can't find any songs that matches this: ${args.join(' ')}`,
            true
          )
        );
        return;
      }
      serverCache.getServerData(serverID).songs.push(song);
      message.channel.send(
        createEmbed(
          `✅ Queued`,
          `**${song.title}** has been added to the queue!`,
          false
        )
      );
      return;
    }

    serverCache.addToCache(serverID, {
      voiceChannel,
      songs: [],
      connection: null,
      volume: 2,
      isPlaying: false,
    });
    const serverData = serverCache.getServerData(serverID);

    try {
      const song = await this.getSong(args.join(' '));
      if (!song) {
        await message.channel.send(
          createEmbed(
            '🤷‍♂️ Not found!',
            `We can't find any songs that matches this: ${args.join(' ')}`,
            true
          )
        );
        return;
      }
      const connection = await voiceChannel.join();
      serverData.connection = connection;
      serverData.songs.push(song);
      serverData.connection.on('disconnect', () => {
        serverCache.remove(serverID);
      });
      this.play(serverData);
      message.channel.send(
        createEmbed(
          `✅ Queued`,
          `**${song.title}** has been added to the queue!`,
          false
        )
      );
    } catch (error) {
      console.error(`I could not join the voice channel: ${error}`);
      serverCache.remove(message.guild.id);
      await voiceChannel.leave();
      await message.channel.send(
        createEmbed(
          `😓 Can't join`,
          `I could not join the voice channel: ${error}`,
          true
        )
      );
    }
  }

  private async play(serverData: ServerData): Promise<void> {
    if (serverData.songs.length === 0) {
      serverData.isPlaying = false;
      serverData.voiceChannel.leave();
      ServerCache.getInstance().remove(serverData.voiceChannel.guild.id);
      return;
    }

    let dispatcher = serverData.connection
      .play(ytdl(serverData.songs[0].url))
      .on('finish', () => {
        serverData.songs.shift();
        this.play(serverData);
      })
      .on('error', (err) => {
        console.error(err);
      });

    serverData.isPlaying = true;
    dispatcher.setVolumeLogarithmic(serverData.volume / 5);
  }

  private checkErrors(
    voiceChannel: VoiceChannel,
    permissions: Readonly<Permissions>,
    args: Array<string>
  ): void {
    if (!args || args.length < 1) {
      throw new Error('You should provide a name or a youtube url!');
    } else if (!voiceChannel) {
      throw new Error('You have to be in a voice channel to play music!');
    } else if (!permissions.has('CONNECT')) {
      throw new Error(
        "I don't have permission to connect to your voice channel!"
      );
    } else if (!permissions.has('SPEAK')) {
      throw new Error(
        "I don't have permission to speak in this voice channel!"
      );
    }
  }

  private async getSong(query: string): Promise<SongData> {
    if (ytdl.validateURL(query)) {
      const info = await ytdl.getInfo(query);
      return {
        title: Util.escapeMarkdown(info.videoDetails.title),
        url: info.videoDetails.video_url,
      };
    }

    const matches = await ytsr(query);
    if (matches.items.length < 1) return;
    return {
      // @ts-ignore
      title: matches.items[0].title,
      // @ts-ignore
      url: matches.items[0].link,
    };
  }
}
