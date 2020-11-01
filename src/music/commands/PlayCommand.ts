import * as ytdl from 'ytdl-core';
import { ytsr } from '../../apis/searchAPI';
import { Message, Permissions, VoiceChannel, Util } from 'discord.js';
import { Command } from '../../generic/Command';
import { CustomError } from '../../generic/CustomError';
import { language } from '../../language/LanguageManager';
import { checkVoiceChannelMatch } from '../../utils';
import { musicAPI } from '../../apis/music/musicAPI';
import { SongData } from '../../apis/music/MusicCache';

export class PlayCommand extends Command {
  constructor() {
    super('play', 'play <youtube link or name>');
    musicAPI.on('new-song-playing', this.nowPlayingHandler);
  }

  public async execute(args: Array<string>, message: Message): Promise<void> {
    const serverID = message.guild.id;
    const voiceChannel = message.member.voice.channel;
    const song = args.join(' ');
    const permissions = voiceChannel
      ? voiceChannel.permissionsFor(message.client.user)
      : null;

    try {
      this.checkErrors(voiceChannel, permissions, serverID, args);
    } catch (error) {
      message.channel.send(error.embed);
      return;
    }

    if (musicAPI.hasQueue(serverID)) {
      try {
        checkVoiceChannelMatch(message, voiceChannel, serverID);
      } catch (err) {
        message.channel.send(err.embed);
        return;
      }
      const music = await this.getSong(song, message);
      if (!music) {
        message.channel.send(language.get(serverID, 'songNotFound', { song }));
        return;
      }
      musicAPI.queue(serverID, music);
      message.channel.send(
        language.get(serverID, 'songQueued', { song: music.title })
      );
      return;
    }

    try {
      const music = await this.getSong(song, message);
      if (!music) {
        message.channel.send(language.get(serverID, 'songNotFound', { song }));
        return;
      }
      if (!musicAPI.isConnected(serverID))
        await musicAPI.connect(serverID, voiceChannel);
      musicAPI.queue(serverID, music);
      musicAPI.startPlaying(serverID);
    } catch (error) {
      message.channel.send(language.get(serverID, 'cantJoinVoice'));
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

  private async getSong(query: string, message: Message) {
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

  private nowPlayingHandler(serverID: string, music: SongData) {
    const { channel, title: song } = music;
    channel.send(language.get(serverID, 'nowPlaying', { song }));
  }
}
