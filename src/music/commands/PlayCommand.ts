import { ytsr } from '../../apis/searchAPI';
import { Message, Permissions, VoiceChannel } from 'discord.js';
import { Command } from '../../generic/Command';
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

    const error = this.checkErrors(voiceChannel, permissions, args);
    if (error) {
      message.channel.send(language.get(serverID, error));
      return;
    }

    if (musicAPI.hasQueue(serverID)) {
      this.handleExisting(message, voiceChannel, serverID, song);
    } else {
      this.handleNew(message, voiceChannel, serverID, song);
    }
  }

  private async handleExisting(
    message: Message,
    voiceChannel: VoiceChannel,
    serverID: string,
    song: string
  ) {
    try {
      checkVoiceChannelMatch(message, voiceChannel, serverID);
    } catch (err) {
      message.channel.send(err.embed);
      return;
    }
    const music = await this.handleMusicRetrieving(song, message);
    if (!music) return;
    musicAPI.queue(serverID, music);
    message.channel.send(
      language.get(serverID, 'songQueued', { song: music.title })
    );
  }

  private async handleNew(
    message: Message,
    voiceChannel: VoiceChannel,
    serverID: string,
    song: string
  ) {
    try {
      const music = await this.handleMusicRetrieving(song, message);
      if (!music) return;
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
    args: Array<string>
  ): string {
    if (!args || args.length < 1) return 'notEnoughArguments';
    else if (!voiceChannel) return 'notInVoiceChannel';
    else if (!permissions.has('CONNECT')) return 'noBotPermToJoinVoice';
    else if (!permissions.has('SPEAK')) return 'noBotPermToSpeak';
  }

  private async getMusicData(query: string, message: Message) {
    const channel = message.channel;
    if (musicAPI.validateYoutubeUrl(query)) {
      const info = await musicAPI.getVideoDetails(query);
      return { ...info, channel };
    }
    const info = await ytsr(query);
    if (!info) return null;
    return { ...info, channel };
  }

  private async handleMusicRetrieving(song: string, message: Message) {
    const music = await this.getMusicData(song, message);
    if (!music) {
      message.channel.send(
        language.get(message.guild.id, 'songNotFound', { song })
      );
      return null;
    }
    return music;
  }

  private nowPlayingHandler(serverID: string, music: SongData) {
    const { channel, title: song } = music;
    channel.send(language.get(serverID, 'nowPlaying', { song }));
  }
}
