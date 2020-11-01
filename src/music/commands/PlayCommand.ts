import * as ytdl from 'ytdl-core';
import * as ffmpeg from 'ffmpeg-static';
import { ytsr } from '../../apis/searchAPI';
import { Message, Permissions, VoiceChannel, Util } from 'discord.js';
import { Command } from '../../generic/Command';
import { musicCache, ServerMusicData, SongData } from '../MusicCache';
import { CustomError } from '../../generic/CustomError';
import { language } from '../../language/LanguageManager';
import { checkVoiceChannelMatch } from '../../utils';

export class PlayCommand extends Command {
  constructor() {
    super('play', 'play <youtube link or name>');
  }

  public async execute(args: Array<string>, message: Message): Promise<void> {
    const serverID = message.guild.id;
    const voiceChannel = message.member.voice.channel;
    const permissions = voiceChannel
      ? voiceChannel.permissionsFor(message.client.user)
      : null;

    try {
      this.checkErrors(voiceChannel, permissions, serverID, args);
    } catch (error) {
      message.channel.send(error.embed);
      return;
    }

    if (musicCache.isCached(serverID)) {
      try {
        checkVoiceChannelMatch(message, voiceChannel, serverID);
      } catch (err) {
        message.channel.send(err.embed);
        return;
      }
      const song = await this.getSong(args.join(' '), message);
      if (!song) {
        await message.channel.send(
          language.get(serverID, 'songNotFound', { song: args.join(' ') })
        );
        return;
      }
      musicCache.get(serverID).songs.push(song);
      message.channel.send(
        language.get(serverID, 'songQueued', { song: song.title })
      );
      return;
    }

    musicCache.add(serverID, {
      voiceChannel,
      songs: [],
      connection: null,
      volume: 2,
      isPlaying: false,
    });
    const serverData = musicCache.get(serverID);

    try {
      const song = await this.getSong(args.join(' '), message);
      if (!song) {
        message.channel.send(
          language.get(serverID, 'songNotFound', { song: args.join(' ') })
        );
        return;
      }
      const connection = await voiceChannel.join();
      serverData.connection = connection;
      serverData.songs.push(song);
      serverData.connection.on('disconnect', () => {
        musicCache.remove(serverID);
      });
      this.play(serverData);
    } catch (error) {
      console.error(`I could not join the voice channel: ${error}`);
      musicCache.remove(serverID);
      voiceChannel.leave();
      message.channel.send(language.get(serverID, 'cantJoinVoice'));
    }
  }

  private async play(serverData: ServerMusicData): Promise<void> {
    const serverID = serverData.voiceChannel.guild.id;
    if (serverData.songs.length === 0) {
      serverData.isPlaying = false;
      serverData.voiceChannel.leave();
      musicCache.remove(serverID);
      return;
    }

    try {
      const song = serverData.songs[0];
      let dispatcher = serverData.connection
        .play(ytdl(song.url))
        .on('finish', () => {
          serverData.songs.shift();
          this.play(serverData);
        })
        .on('error', (err) => {
          console.error(err);
          serverData.songs.shift();
          this.play(serverData);
        });

      song.channel.send(
        language.get(serverID, 'nowPlaying', {
          song: song.title,
        })
      );
      serverData.isPlaying = true;
      dispatcher.setVolumeLogarithmic(serverData.volume / 5);
    } catch (err) {
      serverData.songs.shift();
      this.play(serverData);
    }
  }

  private checkErrors(
    voiceChannel: VoiceChannel,
    permissions: Readonly<Permissions>,
    serverID: string,
    args: Array<string>
  ): void {
    if (!args || args.length < 1) {
      throw new CustomError(language.get(serverID, 'notEnoughArguments'));
    } else if (!voiceChannel) {
      throw new CustomError(language.get(serverID, 'notInVoiceChannel'));
    } else if (!permissions.has('CONNECT')) {
      throw new CustomError(language.get(serverID, 'noBotPermToJoinVoice'));
    } else if (!permissions.has('SPEAK')) {
      throw new CustomError(language.get(serverID, 'noBotPermToSpeak'));
    }
  }

  private async getSong(query: string, message: Message): Promise<SongData> {
    const channel = message.channel;
    if (ytdl.validateURL(query)) {
      const info = await ytdl.getInfo(query);
      return {
        title: Util.escapeMarkdown(info.videoDetails.title),
        url: info.videoDetails.video_url,
        channel,
      };
    }

    try {
      const { title, url } = await ytsr(query);
      return { title, url, channel };
    } catch (err) {
      return null;
    }
  }
}
